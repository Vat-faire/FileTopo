//! The commands the map view calls, and the pipeline behind them.
//!
//! One pipeline, in one place: materialise the fixture, fingerprint it, scan it
//! read-only, lay it out once, persist both, and read back. Everything the
//! frozen criteria need to be checked — timings, fingerprints, engine version,
//! digests — comes out of this file rather than being reconstructed later from
//! guesswork.

use super::layout::{self, LayoutInput};
use super::store::{MapSnapshot, MapStore, NON_RECONSTRUCTIBLE_KEYS, NodeDetail};
use super::sandbox::{self, SandboxPaths};
use super::{MAX_FIXTURE_DEPTH, MAX_NODES_PER_MAP, MapError, fixtures};
use crate::domain::ScanDiagnostic;
use crate::scanner::scan_tree_controlled;
use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use std::time::{Instant, SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FixtureSummary {
    pub id: String,
    pub label_fr: String,
    pub label_en: String,
    pub seed: String,
    pub max_nodes: usize,
    pub planned_nodes: usize,
    pub planned_max_depth: u32,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MapBuildReport {
    pub fixture_id: String,
    pub node_count: usize,
    pub planned_nodes: usize,
    pub max_depth: u32,
    pub node_ceiling: usize,
    pub depth_ceiling: u32,
    pub rebuilt: bool,
    pub scan_ms: f64,
    pub layout_ms: f64,
    pub index_ms: f64,
    pub total_ms: f64,
    pub layout_invocations: u32,
    pub fingerprint_before: String,
    pub fingerprint_after: String,
    pub read_only_confirmed: bool,
    pub reconstructible_digest: String,
    pub non_reconstructible: Vec<String>,
    pub schema_version: i64,
    pub diagnostics: Vec<ScanDiagnostic>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HostInfo {
    /// Shown in the interface so a reader can confirm, without trusting a
    /// claim, that the analysed root and the index live in the sandbox.
    pub sandbox_root: String,
    pub app_version: String,
    pub sqlite_version: String,
    /// The rendering engine actually in use — WebView2 on Windows. Read from
    /// the host rather than from the user agent, which `H8` requires.
    pub webview_version: String,
    pub tauri_version: String,
    pub platform: String,
    pub node_ceiling: usize,
    pub depth_ceiling: u32,
    pub min_leaf_area: f64,
    /// Set by `FILETOPO_AUTO_VERIFY`: replays `H1` to `H7` against the real
    /// host and writes the evidence, unattended.
    pub auto_verify: bool,
    /// Set by `FILETOPO_AUTO_MEASURE`, so `H9` can be run in the real host
    /// without a hand on the mouse.
    ///
    /// The measurement drives the same state the buttons drive; the flag only
    /// decides *when* it starts. A run nobody can reproduce unattended is a run
    /// nobody can check.
    pub auto_measure: bool,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FixtureIntegrity {
    pub fixture_id: String,
    pub fingerprint: String,
    /// Entries under the analysed root that FileTopo would have written.
    /// `I-2` and `H6` both require this to stay empty.
    pub filetopo_artifacts: Vec<String>,
    pub observed_entries: usize,
}

/// Verification the slice can run on itself, exposed so `H1` and `H3` can be
/// exercised through the same API the interface uses rather than a side door.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MapSelfCheck {
    pub fixture_id: String,
    pub planned_paths: usize,
    pub observed_paths: usize,
    pub indexed_paths: usize,
    /// `H1`: the three sets agree, path by path.
    pub paths_agree: bool,
    pub missing_from_index: Vec<String>,
    pub unexpected_in_index: Vec<String>,
    /// `H2`: no null dimension, no sibling overlap, every child inside its parent.
    pub layout_violations: Vec<String>,
    /// `H3`: parent and direct children agree with an independent query.
    pub hierarchy_mismatches: Vec<String>,
    /// `H5`: every node's details are readable, diagnostics included.
    pub detail_mismatches: Vec<String>,
}

fn now_ms() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis()
        .min(i64::MAX as u128) as i64
}

/// Materialises the fixture, scans it, lays it out and persists the index.
///
/// `rebuild` deletes nothing on disk beyond the index file itself — the
/// analysed tree is never touched, and `H7` needs exactly that: drop the
/// index, rebuild, compare.
pub fn build_map(
    paths: &SandboxPaths,
    fixture_id: &str,
    rebuild: bool,
) -> Result<MapBuildReport, MapError> {
    let spec = fixtures::spec(fixture_id)?;
    let started = Instant::now();

    let plan = fixtures::materialize(&paths.fixtures, spec)?;
    let root = fixtures::fixture_root(&paths.fixtures, spec.id);
    let fingerprint_before = fixtures::fingerprint(&root)?;

    let database = paths.map_database(spec.id);
    if rebuild && database.exists() {
        remove_index_files(&database)?;
    }

    let scan_started = Instant::now();
    let scan = scan_tree_controlled(&root, || false, |_| {})
        .map_err(|error| MapError::Scan(error.to_string()))?;
    let scan_ms = elapsed_ms(scan_started);

    // `B-1`, applied before anything is written. No truncation, no sampling,
    // no level of detail: the build refuses and says so.
    if scan.nodes.len() > MAX_NODES_PER_MAP {
        return Err(MapError::NodeBudgetExceeded {
            found: scan.nodes.len(),
            ceiling: MAX_NODES_PER_MAP,
        });
    }

    let mut index_by_id = std::collections::HashMap::with_capacity(scan.nodes.len());
    for (position, node) in scan.nodes.iter().enumerate() {
        index_by_id.insert(node.id, position);
    }
    let parents = scan
        .nodes
        .iter()
        .map(|node| node.parent_id.and_then(|id| index_by_id.get(&id).copied()))
        .collect::<Vec<_>>();

    let layout_started = Instant::now();
    let laid_out = layout::compute(LayoutInput { parents: &parents });
    let layout_ms = elapsed_ms(layout_started);

    let index_started = Instant::now();
    let mut store = MapStore::open(&database)?;
    store.replace(
        spec.id,
        spec.label_fr,
        &scan.nodes,
        &laid_out.rects,
        laid_out.width,
        laid_out.height,
        &scan.diagnostics,
        now_ms(),
    )?;
    let index_ms = elapsed_ms(index_started);

    let fingerprint_after = fixtures::fingerprint(&root)?;
    let max_depth = scan.nodes.iter().map(|node| node.depth).max().unwrap_or(0);

    Ok(MapBuildReport {
        fixture_id: spec.id.to_string(),
        node_count: scan.nodes.len(),
        planned_nodes: plan.node_count(),
        max_depth,
        node_ceiling: MAX_NODES_PER_MAP,
        depth_ceiling: MAX_FIXTURE_DEPTH,
        rebuilt: rebuild,
        scan_ms,
        layout_ms,
        index_ms,
        total_ms: elapsed_ms(started),
        layout_invocations: laid_out.invocations,
        read_only_confirmed: fingerprint_before == fingerprint_after,
        fingerprint_before,
        fingerprint_after,
        reconstructible_digest: store.reconstructible_digest()?,
        non_reconstructible: NON_RECONSTRUCTIBLE_KEYS
            .iter()
            .map(|key| (*key).to_string())
            .collect(),
        schema_version: super::store::MAP_SCHEMA_VERSION,
        diagnostics: scan.diagnostics,
    })
}

/// Removes the index database and its WAL companions, and nothing else.
///
/// Scoped deliberately narrowly: the only files this slice ever deletes are
/// ones it wrote itself, inside `maps/`.
fn remove_index_files(database: &Path) -> Result<(), MapError> {
    for suffix in ["", "-wal", "-shm"] {
        let mut candidate = database.as_os_str().to_os_string();
        candidate.push(suffix);
        let candidate = PathBuf::from(candidate);
        if candidate.is_file() {
            std::fs::remove_file(candidate)?;
        }
    }
    Ok(())
}

fn elapsed_ms(started: Instant) -> f64 {
    started.elapsed().as_secs_f64() * 1_000.0
}

pub fn open_store(paths: &SandboxPaths, fixture_id: &str) -> Result<MapStore, MapError> {
    let spec = fixtures::spec(fixture_id)?;
    let database = paths.map_database(spec.id);
    if !database.is_file() {
        return Err(MapError::NotBuilt(spec.id.to_string()));
    }
    let store = MapStore::open(&database)?;
    if !store.is_built()? {
        return Err(MapError::NotBuilt(spec.id.to_string()));
    }
    Ok(store)
}

pub fn snapshot(paths: &SandboxPaths, fixture_id: &str) -> Result<MapSnapshot, MapError> {
    open_store(paths, fixture_id)?.snapshot()
}

pub fn detail(
    paths: &SandboxPaths,
    fixture_id: &str,
    node_id: i64,
) -> Result<NodeDetail, MapError> {
    open_store(paths, fixture_id)?.detail(node_id)
}

pub fn integrity(paths: &SandboxPaths, fixture_id: &str) -> Result<FixtureIntegrity, MapError> {
    let spec = fixtures::spec(fixture_id)?;
    let root = fixtures::fixture_root(&paths.fixtures, spec.id);
    let observed = fixtures::observed_paths(&root)?;
    // Anything FileTopo could have dropped in the analysed tree. The list is
    // computed from what is actually there, not from what we hoped to avoid.
    let artifacts = observed
        .iter()
        .filter(|path| {
            let lowered = path.to_lowercase();
            lowered.ends_with(".sqlite")
                || lowered.ends_with(".sqlite-wal")
                || lowered.ends_with(".sqlite-shm")
                || lowered.contains("filetopo")
        })
        .cloned()
        .collect::<Vec<_>>();
    Ok(FixtureIntegrity {
        fixture_id: spec.id.to_string(),
        fingerprint: fixtures::fingerprint(&root)?,
        filetopo_artifacts: artifacts,
        observed_entries: observed.len(),
    })
}

/// Runs `H1`, `H2`, `H3` and `H5` against a built map and reports what fails.
///
/// Written to report rather than to assert: a self-check that panics tells the
/// user nothing, and a missed target has to be publishable as missed.
pub fn self_check(paths: &SandboxPaths, fixture_id: &str) -> Result<MapSelfCheck, MapError> {
    let spec = fixtures::spec(fixture_id)?;
    let root = fixtures::fixture_root(&paths.fixtures, spec.id);

    let planned = fixtures::plan(spec).expected_paths();
    let observed = fixtures::observed_paths(&root)?;
    let store = open_store(paths, fixture_id)?;
    let nodes = store.all_nodes()?;

    let mut indexed = nodes
        .iter()
        .filter(|node| node.parent_id.is_some())
        .map(|node| node.relative_path.clone())
        .collect::<Vec<_>>();
    indexed.sort();

    let planned_set = planned.iter().collect::<std::collections::BTreeSet<_>>();
    let indexed_set = indexed.iter().collect::<std::collections::BTreeSet<_>>();
    let missing = planned_set
        .difference(&indexed_set)
        .take(20)
        .map(|path| (*path).clone())
        .collect::<Vec<_>>();
    let unexpected = indexed_set
        .difference(&planned_set)
        .take(20)
        .map(|path| (*path).clone())
        .collect::<Vec<_>>();

    let mut layout_violations = Vec::new();
    let mut by_id = std::collections::HashMap::new();
    let mut children_of: std::collections::HashMap<i64, Vec<usize>> = std::collections::HashMap::new();
    for (position, node) in nodes.iter().enumerate() {
        by_id.insert(node.id, position);
        if let Some(parent) = node.parent_id {
            children_of.entry(parent).or_default().push(position);
        }
        if !(node.rect.w > 0.0) || !(node.rect.h > 0.0) {
            layout_violations.push(format!("null dimension on {}", node.relative_path));
        }
    }
    for (parent_id, siblings) in &children_of {
        let Some(parent_position) = by_id.get(parent_id) else {
            layout_violations.push(format!("orphan children under id {parent_id}"));
            continue;
        };
        let parent = &nodes[*parent_position];
        let tolerance = 1e-6 * parent.rect.w.max(1.0);
        let allowed_overlap = 1e-9 * parent.rect.area().max(1.0);
        for position in siblings {
            if !parent.rect.contains(&nodes[*position].rect, tolerance) {
                layout_violations.push(format!(
                    "{} escapes its parent {}",
                    nodes[*position].relative_path, parent.relative_path
                ));
            }
        }
        for (offset, left) in siblings.iter().enumerate() {
            for right in &siblings[offset + 1..] {
                let overlap = nodes[*left].rect.intersection_area(&nodes[*right].rect);
                if overlap > allowed_overlap {
                    layout_violations.push(format!(
                        "{} overlaps {}",
                        nodes[*left].relative_path, nodes[*right].relative_path
                    ));
                }
            }
        }
        if layout_violations.len() > 40 {
            break;
        }
    }

    let mut hierarchy_mismatches = Vec::new();
    let mut detail_mismatches = Vec::new();
    for node in &nodes {
        let detail = store.detail(node.id)?;
        let expected_parent = node.parent_id;
        if detail.parent.as_ref().map(|parent| parent.id) != expected_parent {
            hierarchy_mismatches.push(format!("parent mismatch on {}", node.relative_path));
        }
        let mut expected_children = children_of
            .get(&node.id)
            .map(|positions| positions.iter().map(|p| nodes[*p].id).collect::<Vec<_>>())
            .unwrap_or_default();
        expected_children.sort_unstable();
        let mut reported = detail.children.iter().map(|child| child.id).collect::<Vec<_>>();
        reported.sort_unstable();
        if reported != expected_children {
            hierarchy_mismatches.push(format!("children mismatch on {}", node.relative_path));
        }
        if detail.children.len() as u32 != node.child_count {
            hierarchy_mismatches.push(format!("child count mismatch on {}", node.relative_path));
        }
        if detail.node.name != node.name
            || detail.node.size_bytes != node.size_bytes
            || detail.node.modified_unix_ms != node.modified_unix_ms
            || detail.node.access_diagnostic != node.access_diagnostic
        {
            detail_mismatches.push(format!("detail mismatch on {}", node.relative_path));
        }
        if hierarchy_mismatches.len() > 20 || detail_mismatches.len() > 20 {
            break;
        }
    }

    Ok(MapSelfCheck {
        fixture_id: spec.id.to_string(),
        planned_paths: planned.len(),
        observed_paths: observed.len(),
        indexed_paths: indexed.len(),
        paths_agree: planned == observed && planned == indexed,
        missing_from_index: missing,
        unexpected_in_index: unexpected,
        layout_violations,
        hierarchy_mismatches,
        detail_mismatches,
    })
}

/// Writes a measurement artefact into `docs/performance/runs/` of this
/// checkout. Development builds only.
///
/// Confined three ways, because a command that writes files is exactly where a
/// slice could quietly step outside its repository: the destination folder is
/// fixed, the name may contain no separator and no `..`, and the repository is
/// located at run time by its own markers rather than by a compiled-in path.
#[cfg(debug_assertions)]
pub fn write_run_artifact(name: &str, contents: &str) -> Result<String, MapError> {
    let safe = name
        .chars()
        .all(|character| character.is_ascii_alphanumeric() || matches!(character, '-' | '_' | '.'))
        && !name.contains("..")
        && !name.is_empty()
        && name.len() <= 120;
    if !safe {
        return Err(MapError::ArtifactRejected(format!(
            "artefact name refused: {name}"
        )));
    }
    let repository = sandbox::repository_root()
        .ok_or_else(|| MapError::ArtifactRejected("repository not found".into()))?;
    let directory = repository.join("docs").join("performance").join("runs");
    std::fs::create_dir_all(&directory)?;
    let target = directory.join(name);
    std::fs::write(&target, contents)?;
    Ok(target
        .strip_prefix(&repository)
        .unwrap_or(&target)
        .to_string_lossy()
        .replace('\\', "/"))
}

pub fn fixture_summaries() -> Vec<FixtureSummary> {
    fixtures::FIXTURES
        .iter()
        .map(|spec| {
            let plan = fixtures::plan(spec);
            FixtureSummary {
                id: spec.id.to_string(),
                label_fr: spec.label_fr.to_string(),
                label_en: spec.label_en.to_string(),
                seed: spec.seed.to_string(),
                max_nodes: spec.max_nodes,
                planned_nodes: plan.node_count(),
                planned_max_depth: plan.max_depth(),
            }
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Every fixture, end to end. Slower than a unit test, and the only place
    /// where `H1`, `H2`, `H3`, `H5`, `H6`, `H7` and `H11` are all exercised
    /// against the real pipeline rather than against a stub.
    #[test]
    fn every_fixture_builds_checks_out_and_leaves_its_tree_untouched() {
        let temp = tempfile::tempdir().expect("temp");
        let paths = SandboxPaths::under(temp.path().join("sandbox"));

        for spec in &fixtures::FIXTURES {
            let report = build_map(&paths, spec.id, false).expect("build");

            // H11 — the frozen ceilings hold.
            assert!(
                report.node_count <= spec.max_nodes,
                "{} produced {} nodes, over its ceiling of {}",
                spec.id,
                report.node_count,
                spec.max_nodes
            );
            assert!(report.node_count <= MAX_NODES_PER_MAP);
            assert!(report.max_depth <= MAX_FIXTURE_DEPTH);
            assert_eq!(report.node_count, report.planned_nodes);

            // H6 — the analysed tree is byte-identical before and after.
            assert!(report.read_only_confirmed, "{} was modified", spec.id);

            // H10 — layout runs once per tree.
            assert_eq!(report.layout_invocations, 1);

            // H1, H2, H3, H5.
            let check = self_check(&paths, spec.id).expect("self check");
            assert!(
                check.paths_agree,
                "{}: plan {} / disk {} / index {}, missing {:?}, unexpected {:?}",
                spec.id,
                check.planned_paths,
                check.observed_paths,
                check.indexed_paths,
                check.missing_from_index,
                check.unexpected_in_index
            );
            assert!(
                check.layout_violations.is_empty(),
                "{}: {:?}",
                spec.id,
                check.layout_violations
            );
            assert!(
                check.hierarchy_mismatches.is_empty(),
                "{}: {:?}",
                spec.id,
                check.hierarchy_mismatches
            );
            assert!(
                check.detail_mismatches.is_empty(),
                "{}: {:?}",
                spec.id,
                check.detail_mismatches
            );

            // I-2 — nothing of FileTopo inside the analysed tree.
            let integrity = integrity(&paths, spec.id).expect("integrity");
            assert!(
                integrity.filetopo_artifacts.is_empty(),
                "{}: {:?}",
                spec.id,
                integrity.filetopo_artifacts
            );
        }
    }

    /// `H7`: delete the index, rebuild, and everything reconstructible comes
    /// back identical — while the one value declared unreconstructible does not.
    #[test]
    fn deleting_the_index_and_rebuilding_produces_an_equivalent_map() {
        let temp = tempfile::tempdir().expect("temp");
        let paths = SandboxPaths::under(temp.path().join("sandbox"));

        let first = build_map(&paths, "wide", false).expect("first build");
        let store = open_store(&paths, "wide").expect("store");
        let first_built_at = store.meta("built_unix_ms").expect("meta");
        drop(store);

        assert!(paths.map_database("wide").is_file());
        std::thread::sleep(std::time::Duration::from_millis(2));
        let second = build_map(&paths, "wide", true).expect("rebuild");

        assert_eq!(first.reconstructible_digest, second.reconstructible_digest);
        assert_eq!(first.node_count, second.node_count);
        assert_eq!(second.non_reconstructible, vec!["built_unix_ms".to_string()]);

        let store = open_store(&paths, "wide").expect("store");
        assert_ne!(
            first_built_at,
            store.meta("built_unix_ms").expect("meta"),
            "the declared unreconstructible value must actually differ, or the \
             declaration is decoration"
        );
    }

    #[test]
    fn an_unknown_fixture_is_refused_by_name() {
        let temp = tempfile::tempdir().expect("temp");
        let paths = SandboxPaths::under(temp.path().to_path_buf());
        let error = build_map(&paths, "ailleurs", false).expect_err("unknown fixture");
        assert!(matches!(error, MapError::UnknownFixture(_)));
    }

    #[test]
    fn reading_a_map_that_was_never_built_fails_instead_of_returning_an_empty_one() {
        let temp = tempfile::tempdir().expect("temp");
        let paths = SandboxPaths::under(temp.path().to_path_buf());
        let error = snapshot(&paths, "deep").expect_err("not built");
        assert!(matches!(error, MapError::NotBuilt(_)));
    }

    #[test]
    fn declared_fixture_summaries_match_the_frozen_ceilings() {
        for summary in fixture_summaries() {
            assert!(
                summary.planned_nodes <= summary.max_nodes,
                "{} plans {} nodes over its ceiling of {}",
                summary.id,
                summary.planned_nodes,
                summary.max_nodes
            );
            assert!(summary.planned_max_depth <= MAX_FIXTURE_DEPTH);
            // The realised counts are a *result* of the frozen seeds, not part
            // of the freeze; printing them is how they get published.
            println!(
                "FIXTURE id={} seed={} nodes={} ceiling={} depth={}",
                summary.id,
                summary.seed,
                summary.planned_nodes,
                summary.max_nodes,
                summary.planned_max_depth
            );
        }
    }
}
