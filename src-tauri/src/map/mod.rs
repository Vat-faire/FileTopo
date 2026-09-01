//! Production vertical slice of `TASK-0016`: synthetic fixture, read-only
//! scan, persistent rebuildable index, hierarchical layout, and the read APIs
//! the map view needs.
//!
//! Three rules govern every module below, and none of them is negotiable.
//!
//! * `I-1` — the analysed tree is **read only**. Nothing here renames, moves,
//!   deletes, rewrites or touches a byte of it once it has been materialised.
//! * `I-2` — **nothing of FileTopo lives inside the analysed tree**. Index,
//!   layout and reports live in the sandbox, beside the fixture root, never in
//!   it.
//! * `B-1` — the node budget frozen by `TASK-0016` §12.2 is **5 000 nodes per
//!   map**, and going over it is an explicit error, never a silent truncation.
//!
//! This slice carries **no adaptive render budget**: `DEC-0015` F forbids
//! reusing either spike controller, and `B-1` is a declared ceiling, not a
//! regulator — it adjusts to nothing and measures nothing.

pub mod brains;
pub mod commands;
pub mod fixtures;
pub mod layout;
pub mod relation_commands;
pub mod relations;
pub mod sandbox;
pub mod store;

use thiserror::Error;

/// Node ceiling frozen by `TASK-0016` §12.2, bound `B-1`.
///
/// A limit of this task, **not** a product limit: the parity contract requires
/// `P-08` on 100 000 nodes, which belongs to later slices of stage A.
pub const MAX_NODES_PER_MAP: usize = 5_000;

/// Depth ceiling frozen by `TASK-0016` §12.2, bound `B-2`.
pub const MAX_FIXTURE_DEPTH: u32 = 40;

#[derive(Debug, Error)]
pub enum MapError {
    #[error("map_io_failed: {0}")]
    Io(#[from] std::io::Error),
    #[error("map_sqlite_failed: {0}")]
    Sqlite(#[from] rusqlite::Error),
    /// A refusal from the relations model. Forwarded verbatim so the named
    /// motif frozen by `TASK-0017` §4.6.4 reaches the caller unchanged.
    #[error("{0}")]
    Relation(#[from] relations::RelationError),
    #[error("map_scan_failed: {0}")]
    Scan(String),
    #[error("map_unknown_fixture: {0}")]
    UnknownFixture(String),
    /// `K2` — a `brain_id` the catalogue does not hold. Named, never
    /// defaulted: a silent fallback would read another brain's data.
    #[error("map_unknown_brain: {0}")]
    UnknownBrain(String),
    /// A source kind this slice cannot resolve. `TASK-0018` supports
    /// `SYNTHETIC_FIXTURE` and nothing else.
    #[error("map_unsupported_source_kind: {0}")]
    UnsupportedSourceKind(String),
    #[error("map_brain_metadata_rejected: {0}")]
    BrainMetadataRejected(String),
    /// `K3` — an index file was opened for a brain it was not built for.
    /// Reported rather than served: this is the shape a storage mix-up takes.
    #[error("map_brain_mismatch: the index read for `{expected}` was built for `{found}`")]
    BrainMismatch { expected: String, found: String },
    /// `B-1` refused the build. Reported rather than worked around: the slice
    /// never truncates, samples or degrades a tree to fit under the ceiling.
    #[error("map_node_budget_exceeded: {found} nodes over the frozen ceiling of {ceiling}")]
    NodeBudgetExceeded { found: usize, ceiling: usize },
    /// The sandbox already holds a fixture root that does not match the frozen
    /// plan. Nothing is deleted: an inconsistent fixture stops the run and asks.
    #[error("map_fixture_mismatch: {0}")]
    FixtureMismatch(String),
    #[error("map_node_missing: {0}")]
    NodeMissing(i64),
    #[error("map_not_built: {0}")]
    NotBuilt(String),
    #[error("map_artifact_rejected: {0}")]
    ArtifactRejected(String),
}

impl From<MapError> for String {
    fn from(error: MapError) -> Self {
        error.to_string()
    }
}

/// FNV-1a, 64 bits.
///
/// Chosen over `DefaultHasher` because fingerprints are compared **across
/// processes and across builds** (`H6` before/after, `H7` rebuild equivalence),
/// and `DefaultHasher` guarantees neither. No new dependency.
pub fn fnv1a64(bytes: &[u8]) -> u64 {
    let mut hash: u64 = 0xcbf2_9ce4_8422_2325;
    for byte in bytes {
        hash ^= u64::from(*byte);
        hash = hash.wrapping_mul(0x0000_0100_0000_01b3);
    }
    hash
}

/// Deterministic 64-bit generator, seeded per fixture and frozen with it.
///
/// `xorshift64*`: no dependency, and identical output on every machine, which
/// is what "graine et structure figées avant les tests" actually requires.
pub struct Rng(u64);

impl Rng {
    pub fn new(seed: u64) -> Self {
        // A zero state is absorbing for xorshift; the fixtures never use it,
        // but the type refuses to be constructed into that trap anyway.
        Self(if seed == 0 { 0x9e37_79b9_7f4a_7c15 } else { seed })
    }

    pub fn next_u64(&mut self) -> u64 {
        let mut state = self.0;
        state ^= state >> 12;
        state ^= state << 25;
        state ^= state >> 27;
        self.0 = state;
        state.wrapping_mul(0x2545_f491_4f6c_dd1d)
    }

    /// Inclusive on both ends.
    pub fn range(&mut self, low: u32, high: u32) -> u32 {
        debug_assert!(low <= high);
        let span = u64::from(high - low) + 1;
        low + (self.next_u64() % span) as u32
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn generator_is_deterministic_and_stays_in_range() {
        let first = {
            let mut rng = Rng::new(20_260_831_003);
            (0..64).map(|_| rng.range(5, 11)).collect::<Vec<_>>()
        };
        let second = {
            let mut rng = Rng::new(20_260_831_003);
            (0..64).map(|_| rng.range(5, 11)).collect::<Vec<_>>()
        };
        assert_eq!(first, second, "the same seed must replay the same fixture");
        assert!(first.iter().all(|value| (5..=11).contains(value)));
        // A generator that always returns the same value would satisfy the two
        // assertions above while producing a useless fixture.
        assert!(first.iter().any(|value| *value != first[0]));
    }

    #[test]
    fn fingerprint_hash_is_stable_and_sensitive() {
        assert_eq!(fnv1a64(b"filetopo"), fnv1a64(b"filetopo"));
        assert_ne!(fnv1a64(b"filetopo"), fnv1a64(b"filetopp"));
    }
}
