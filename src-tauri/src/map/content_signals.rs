//! Exact, dated observations of indexed file bytes — `TASK-0023`.
//!
//! This module deliberately stops before relations. A SHA-256 digest is an
//! observed fact about bytes read during one campaign. It is not a physical
//! identity, a copy claim, a version, a suggestion or a `RelationEdge`.

use super::brains::BrainRecord;
use super::fixtures;
use super::sandbox::SandboxPaths;
use super::store::MapNode;
use super::{commands, MapError};
use crate::domain::NodeKind;
use rusqlite::{params, Connection, OptionalExtension, Transaction};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::fmt::Write as _;
use std::fs::{self, File, Metadata};
use std::io::Read;
use std::path::{Component, Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};
use uuid::Uuid;

pub const CONTENT_SIGNALS_SCHEMA_VERSION: i64 = 1;
pub const SIGNAL_ENGINE_VERSION: &str = "sha256-v1";
pub const HASH_ALGORITHM: &str = SIGNAL_ENGINE_VERSION;
pub const HASH_BUFFER_BYTES: usize = 64 * 1024;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum ObservationStatus {
    Hashed,
    Unreadable,
    UnstableDuringRead,
    Unsupported,
}

impl ObservationStatus {
    fn as_str(self) -> &'static str {
        match self {
            Self::Hashed => "HASHED",
            Self::Unreadable => "UNREADABLE",
            Self::UnstableDuringRead => "UNSTABLE_DURING_READ",
            Self::Unsupported => "UNSUPPORTED",
        }
    }

    fn parse(value: &str) -> Result<Self, rusqlite::Error> {
        match value {
            "HASHED" => Ok(Self::Hashed),
            "UNREADABLE" => Ok(Self::Unreadable),
            "UNSTABLE_DURING_READ" => Ok(Self::UnstableDuringRead),
            "UNSUPPORTED" => Ok(Self::Unsupported),
            _ => Err(rusqlite::Error::InvalidQuery),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ContentObservation {
    pub relative_path: String,
    pub size_bytes: u64,
    pub modified_unix_ms: Option<i64>,
    pub observation_status: ObservationStatus,
    pub hash_algorithm: Option<String>,
    pub hash_hex: Option<String>,
    pub observed_at_unix_ms: i64,
    pub generation_id: String,
    pub diagnostic: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ContentObservationSummary {
    pub brain_id: String,
    pub store_path: String,
    pub schema_version: i64,
    pub signal_engine_version: String,
    pub current_generation_id: Option<String>,
    pub current_generation_observed_at: Option<i64>,
    pub source_fingerprint: Option<String>,
    pub observation_count: usize,
    pub hashed_count: usize,
    pub unreadable_count: usize,
    pub unstable_count: usize,
    pub unsupported_count: usize,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ContentObservationReport {
    pub brain_id: String,
    pub store_path: String,
    pub schema_version: i64,
    pub signal_engine_version: String,
    pub generation_id: String,
    pub observed_at: i64,
    pub source_fingerprint_before: String,
    pub source_fingerprint_after: String,
    pub source_stable: bool,
    pub indexed_file_count: usize,
    pub hashed_count: usize,
    pub unreadable_count: usize,
    pub unstable_count: usize,
    pub unsupported_count: usize,
    pub files_opened_for_hash: usize,
    pub bytes_read: u64,
    pub digests_computed: usize,
    pub hash_algorithm: String,
    pub read_only_confirmed: bool,
    pub duration_ms: f64,
}

#[derive(Debug, Clone, PartialEq, Eq)]
enum ObservationEvent {
    AfterChunk {
        relative_path: String,
        bytes_read: u64,
    },
    BeforeFingerprintAfter,
    BeforeCommit,
}

#[derive(Default)]
struct CampaignCounters {
    files_opened_for_hash: usize,
    bytes_read: u64,
    digests_computed: usize,
}

pub struct ContentSignalStore {
    connection: Connection,
}

impl ContentSignalStore {
    pub fn open(path: &Path) -> Result<Self, MapError> {
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent)?;
        }
        let connection = Connection::open(path)?;
        connection.execute_batch(
            "PRAGMA journal_mode=WAL;
             PRAGMA synchronous=NORMAL;
             PRAGMA foreign_keys=ON;",
        )?;
        let store = Self { connection };
        store.initialize()?;
        Ok(store)
    }

    #[cfg(test)]
    fn in_memory() -> Result<Self, MapError> {
        let connection = Connection::open_in_memory()?;
        let store = Self { connection };
        store.initialize()?;
        Ok(store)
    }

    fn initialize(&self) -> Result<(), MapError> {
        let version: i64 = self
            .connection
            .query_row("PRAGMA user_version", [], |row| row.get(0))?;
        if version != 0 && version != CONTENT_SIGNALS_SCHEMA_VERSION {
            return Err(MapError::ContentObservation(format!(
                "unsupported_content_signals_schema:{version}"
            )));
        }
        self.connection.execute_batch(&format!(
            "CREATE TABLE IF NOT EXISTS metadata (
                 key TEXT PRIMARY KEY,
                 value TEXT NOT NULL
             );
             CREATE TABLE IF NOT EXISTS content_observations (
                 relative_path TEXT PRIMARY KEY
                   CHECK(length(relative_path) > 0)
                   CHECK(substr(relative_path, 1, 1) <> '/')
                   CHECK(substr(relative_path, 1, 1) <> '\\')
                   CHECK(instr(relative_path, '\\') = 0),
                 size_bytes INTEGER NOT NULL CHECK(size_bytes >= 0),
                 modified_unix_ms INTEGER,
                 observation_status TEXT NOT NULL
                   CHECK(observation_status IN
                     ('HASHED','UNREADABLE','UNSTABLE_DURING_READ','UNSUPPORTED')),
                 hash_algorithm TEXT,
                 hash_hex TEXT,
                 observed_at_unix_ms INTEGER NOT NULL CHECK(observed_at_unix_ms >= 0),
                 generation_id TEXT NOT NULL CHECK(length(generation_id) > 0),
                 diagnostic TEXT,
                 CHECK(
                   (observation_status = 'HASHED'
                    AND hash_algorithm = '{SIGNAL_ENGINE_VERSION}'
                    AND hash_hex IS NOT NULL
                    AND length(hash_hex) = 64
                    AND hash_hex = lower(hash_hex)
                    AND hash_hex NOT GLOB '*[^0-9a-f]*'
                    AND diagnostic IS NULL)
                   OR
                   (observation_status <> 'HASHED'
                    AND hash_algorithm IS NULL
                    AND hash_hex IS NULL)
                 )
             );
             CREATE INDEX IF NOT EXISTS idx_content_observations_digest
               ON content_observations(hash_algorithm, hash_hex)
               WHERE observation_status = 'HASHED';
             PRAGMA user_version={CONTENT_SIGNALS_SCHEMA_VERSION};"
        ))?;
        self.put_meta(
            "schema_version",
            &CONTENT_SIGNALS_SCHEMA_VERSION.to_string(),
        )?;
        self.put_meta("signal_engine_version", SIGNAL_ENGINE_VERSION)?;
        Ok(())
    }

    fn put_meta(&self, key: &str, value: &str) -> Result<(), MapError> {
        self.connection.execute(
            "INSERT INTO metadata (key, value) VALUES (?1, ?2)
             ON CONFLICT(key) DO UPDATE SET value=excluded.value",
            params![key, value],
        )?;
        Ok(())
    }

    fn meta(&self, key: &str) -> Result<Option<String>, MapError> {
        Ok(self
            .connection
            .query_row("SELECT value FROM metadata WHERE key=?1", [key], |row| {
                row.get(0)
            })
            .optional()?)
    }

    fn replace_generation(
        &mut self,
        generation_id: &str,
        observed_at: i64,
        source_fingerprint: &str,
        observations: &[ContentObservation],
    ) -> Result<(), MapError> {
        let transaction = self.connection.transaction()?;
        transaction.execute("DELETE FROM content_observations", [])?;
        for observation in observations {
            insert_observation(&transaction, observation)?;
        }
        put_transaction_meta(
            &transaction,
            "schema_version",
            &CONTENT_SIGNALS_SCHEMA_VERSION.to_string(),
        )?;
        put_transaction_meta(&transaction, "signal_engine_version", SIGNAL_ENGINE_VERSION)?;
        put_transaction_meta(&transaction, "source_fingerprint", source_fingerprint)?;
        put_transaction_meta(
            &transaction,
            "current_generation_observed_at",
            &observed_at.to_string(),
        )?;
        // The current pointer is deliberately last, inside the same transaction.
        put_transaction_meta(&transaction, "current_generation_id", generation_id)?;
        transaction.commit()?;
        Ok(())
    }

    pub fn observation(&self, relative_path: &str) -> Result<Option<ContentObservation>, MapError> {
        validate_relative_path(relative_path)?;
        Ok(self
            .connection
            .query_row(
                "SELECT relative_path,size_bytes,modified_unix_ms,observation_status,
                        hash_algorithm,hash_hex,observed_at_unix_ms,generation_id,diagnostic
                 FROM content_observations WHERE relative_path=?1",
                [relative_path],
                observation_from_row,
            )
            .optional()?)
    }

    pub fn identical_members(&self, hash: &str) -> Result<Vec<ContentObservation>, MapError> {
        validate_digest(hash)?;
        let mut statement = self.connection.prepare(
            "SELECT relative_path,size_bytes,modified_unix_ms,observation_status,
                    hash_algorithm,hash_hex,observed_at_unix_ms,generation_id,diagnostic
             FROM content_observations
             WHERE observation_status='HASHED' AND hash_algorithm=?1 AND hash_hex=?2
             ORDER BY relative_path",
        )?;
        Ok(statement
            .query_map(params![HASH_ALGORITHM, hash], observation_from_row)?
            .collect::<Result<Vec<_>, _>>()?)
    }

    pub fn diagnostics(&self) -> Result<Vec<ContentObservation>, MapError> {
        let mut statement = self.connection.prepare(
            "SELECT relative_path,size_bytes,modified_unix_ms,observation_status,
                    hash_algorithm,hash_hex,observed_at_unix_ms,generation_id,diagnostic
             FROM content_observations WHERE observation_status <> 'HASHED'
             ORDER BY relative_path",
        )?;
        Ok(statement
            .query_map([], observation_from_row)?
            .collect::<Result<Vec<_>, _>>()?)
    }

    pub fn all_observations(&self) -> Result<Vec<ContentObservation>, MapError> {
        let mut statement = self.connection.prepare(
            "SELECT relative_path,size_bytes,modified_unix_ms,observation_status,
                    hash_algorithm,hash_hex,observed_at_unix_ms,generation_id,diagnostic
             FROM content_observations ORDER BY relative_path",
        )?;
        Ok(statement
            .query_map([], observation_from_row)?
            .collect::<Result<Vec<_>, _>>()?)
    }

    pub fn summary(
        &self,
        brain_id: &str,
        store_path: String,
    ) -> Result<ContentObservationSummary, MapError> {
        let counts = self.connection.query_row(
            "SELECT COUNT(*),
                    SUM(observation_status='HASHED'),
                    SUM(observation_status='UNREADABLE'),
                    SUM(observation_status='UNSTABLE_DURING_READ'),
                    SUM(observation_status='UNSUPPORTED')
             FROM content_observations",
            [],
            |row| {
                Ok((
                    row.get::<_, i64>(0)?,
                    row.get::<_, Option<i64>>(1)?.unwrap_or(0),
                    row.get::<_, Option<i64>>(2)?.unwrap_or(0),
                    row.get::<_, Option<i64>>(3)?.unwrap_or(0),
                    row.get::<_, Option<i64>>(4)?.unwrap_or(0),
                ))
            },
        )?;
        Ok(ContentObservationSummary {
            brain_id: brain_id.to_string(),
            store_path,
            schema_version: CONTENT_SIGNALS_SCHEMA_VERSION,
            signal_engine_version: SIGNAL_ENGINE_VERSION.to_string(),
            current_generation_id: self.meta("current_generation_id")?,
            current_generation_observed_at: self
                .meta("current_generation_observed_at")?
                .and_then(|value| value.parse().ok()),
            source_fingerprint: self.meta("source_fingerprint")?,
            observation_count: usize_of(counts.0),
            hashed_count: usize_of(counts.1),
            unreadable_count: usize_of(counts.2),
            unstable_count: usize_of(counts.3),
            unsupported_count: usize_of(counts.4),
        })
    }
}

fn insert_observation(
    transaction: &Transaction<'_>,
    observation: &ContentObservation,
) -> rusqlite::Result<()> {
    transaction.execute(
        "INSERT INTO content_observations
          (relative_path,size_bytes,modified_unix_ms,observation_status,
           hash_algorithm,hash_hex,observed_at_unix_ms,generation_id,diagnostic)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9)",
        params![
            observation.relative_path,
            i64_of(observation.size_bytes),
            observation.modified_unix_ms,
            observation.observation_status.as_str(),
            observation.hash_algorithm,
            observation.hash_hex,
            observation.observed_at_unix_ms,
            observation.generation_id,
            observation.diagnostic,
        ],
    )?;
    Ok(())
}

fn put_transaction_meta(
    transaction: &Transaction<'_>,
    key: &str,
    value: &str,
) -> rusqlite::Result<()> {
    transaction.execute(
        "INSERT INTO metadata (key,value) VALUES (?1,?2)
         ON CONFLICT(key) DO UPDATE SET value=excluded.value",
        params![key, value],
    )?;
    Ok(())
}

fn observation_from_row(row: &rusqlite::Row<'_>) -> rusqlite::Result<ContentObservation> {
    let size: i64 = row.get(1)?;
    let status: String = row.get(3)?;
    Ok(ContentObservation {
        relative_path: row.get(0)?,
        size_bytes: size.max(0) as u64,
        modified_unix_ms: row.get(2)?,
        observation_status: ObservationStatus::parse(&status)?,
        hash_algorithm: row.get(4)?,
        hash_hex: row.get(5)?,
        observed_at_unix_ms: row.get(6)?,
        generation_id: row.get(7)?,
        diagnostic: row.get(8)?,
    })
}

pub fn observe_content(
    paths: &SandboxPaths,
    brain: &BrainRecord,
) -> Result<ContentObservationReport, MapError> {
    let store = commands::open_store(paths, brain)?;
    let nodes = store.all_nodes()?;
    let root = fixtures::fixture_root(&paths.fixtures, &brain.source_ref);
    observe_root_with_hook(paths, &brain.brain_id, &root, &nodes, &mut |_| Ok(()))
}

fn observe_root_with_hook(
    paths: &SandboxPaths,
    brain_id: &str,
    root: &Path,
    nodes: &[MapNode],
    hook: &mut dyn FnMut(&ObservationEvent) -> Result<(), MapError>,
) -> Result<ContentObservationReport, MapError> {
    let started = std::time::Instant::now();
    let source_fingerprint_before = fixtures::fingerprint(root)?;
    let generation_id = Uuid::new_v4().to_string();
    let observed_at = now_ms();
    let indexed = nodes
        .iter()
        .filter(|node| node.kind == NodeKind::File)
        .collect::<Vec<_>>();
    let mut counters = CampaignCounters::default();
    let mut observations = Vec::with_capacity(indexed.len());

    for node in &indexed {
        observations.push(observe_file(
            root,
            node,
            observed_at,
            &generation_id,
            &mut counters,
            hook,
        )?);
    }

    hook(&ObservationEvent::BeforeFingerprintAfter)?;
    let source_fingerprint_after = fixtures::fingerprint(root)?;
    if source_fingerprint_before != source_fingerprint_after {
        return Err(MapError::ContentObservation(
            "SOURCE_CHANGED_DURING_OBSERVATION".to_string(),
        ));
    }

    hook(&ObservationEvent::BeforeCommit)?;
    let database = paths.brain_content_signals_database(brain_id);
    let mut store = ContentSignalStore::open(&database)?;
    store.replace_generation(
        &generation_id,
        observed_at,
        &source_fingerprint_after,
        &observations,
    )?;

    let hashed_count = count_status(&observations, ObservationStatus::Hashed);
    let unreadable_count = count_status(&observations, ObservationStatus::Unreadable);
    let unstable_count = count_status(&observations, ObservationStatus::UnstableDuringRead);
    let unsupported_count = count_status(&observations, ObservationStatus::Unsupported);
    Ok(ContentObservationReport {
        brain_id: brain_id.to_string(),
        store_path: paths.relative_name(&database),
        schema_version: CONTENT_SIGNALS_SCHEMA_VERSION,
        signal_engine_version: SIGNAL_ENGINE_VERSION.to_string(),
        generation_id,
        observed_at,
        source_fingerprint_before,
        source_fingerprint_after,
        source_stable: true,
        indexed_file_count: indexed.len(),
        hashed_count,
        unreadable_count,
        unstable_count,
        unsupported_count,
        files_opened_for_hash: counters.files_opened_for_hash,
        bytes_read: counters.bytes_read,
        digests_computed: counters.digests_computed,
        hash_algorithm: HASH_ALGORITHM.to_string(),
        read_only_confirmed: true,
        duration_ms: started.elapsed().as_secs_f64() * 1_000.0,
    })
}

fn observe_file(
    root: &Path,
    node: &MapNode,
    observed_at: i64,
    generation_id: &str,
    counters: &mut CampaignCounters,
    hook: &mut dyn FnMut(&ObservationEvent) -> Result<(), MapError>,
) -> Result<ContentObservation, MapError> {
    let relative_path = match validate_relative_path(&node.relative_path) {
        Ok(path) => path,
        Err(_) => {
            return Ok(non_hashed(
                node,
                observed_at,
                generation_id,
                ObservationStatus::Unsupported,
                "relative_path_refused",
            ));
        }
    };
    let candidate = root.join(&relative_path);
    if !lexically_contained(root, &candidate) {
        return Ok(non_hashed(
            node,
            observed_at,
            generation_id,
            ObservationStatus::Unsupported,
            "path_outside_root",
        ));
    }

    let before = match fs::symlink_metadata(&candidate) {
        Ok(metadata) => metadata,
        Err(_) => {
            return Ok(non_hashed(
                node,
                observed_at,
                generation_id,
                ObservationStatus::Unreadable,
                "metadata_unreadable",
            ));
        }
    };
    if before.file_type().is_symlink() || metadata_is_reparse_point(&before) || !before.is_file() {
        return Ok(non_hashed(
            node,
            observed_at,
            generation_id,
            ObservationStatus::Unsupported,
            "not_supported_regular_file",
        ));
    }

    let canonical_root = match root.canonicalize() {
        Ok(path) => path,
        Err(_) => {
            return Ok(non_hashed(
                node,
                observed_at,
                generation_id,
                ObservationStatus::Unreadable,
                "root_unavailable",
            ));
        }
    };
    let canonical_candidate = match candidate.canonicalize() {
        Ok(path) => path,
        Err(_) => {
            return Ok(non_hashed(
                node,
                observed_at,
                generation_id,
                ObservationStatus::Unreadable,
                "target_unavailable",
            ));
        }
    };
    if !canonical_candidate.starts_with(&canonical_root) {
        return Ok(non_hashed(
            node,
            observed_at,
            generation_id,
            ObservationStatus::Unsupported,
            "canonical_path_outside_root",
        ));
    }

    let mut file = match File::open(&candidate) {
        Ok(file) => file,
        Err(_) => {
            return Ok(non_hashed(
                node,
                observed_at,
                generation_id,
                ObservationStatus::Unreadable,
                "open_failed",
            ));
        }
    };
    counters.files_opened_for_hash += 1;
    let mut hasher = Sha256::new();
    let mut buffer = [0_u8; HASH_BUFFER_BYTES];
    let mut file_bytes = 0_u64;
    loop {
        let read = match file.read(&mut buffer) {
            Ok(read) => read,
            Err(_) => {
                return Ok(non_hashed(
                    node,
                    observed_at,
                    generation_id,
                    ObservationStatus::Unreadable,
                    "read_failed",
                ));
            }
        };
        if read == 0 {
            break;
        }
        hasher.update(&buffer[..read]);
        file_bytes = file_bytes.saturating_add(read as u64);
        counters.bytes_read = counters.bytes_read.saturating_add(read as u64);
        hook(&ObservationEvent::AfterChunk {
            relative_path: node.relative_path.clone(),
            bytes_read: file_bytes,
        })?;
    }

    let after = match file.metadata() {
        Ok(metadata) => metadata,
        Err(_) => {
            return Ok(non_hashed(
                node,
                observed_at,
                generation_id,
                ObservationStatus::Unreadable,
                "post_read_metadata_unreadable",
            ));
        }
    };
    if stability_tuple(&before) != stability_tuple(&after) {
        return Ok(ContentObservation {
            relative_path: node.relative_path.clone(),
            size_bytes: before.len(),
            modified_unix_ms: modified_ms(&before),
            observation_status: ObservationStatus::UnstableDuringRead,
            hash_algorithm: None,
            hash_hex: None,
            observed_at_unix_ms: observed_at,
            generation_id: generation_id.to_string(),
            diagnostic: Some("metadata_changed_during_read".to_string()),
        });
    }

    let digest = hasher.finalize();
    counters.digests_computed += 1;
    Ok(ContentObservation {
        relative_path: node.relative_path.clone(),
        size_bytes: before.len(),
        modified_unix_ms: modified_ms(&before),
        observation_status: ObservationStatus::Hashed,
        hash_algorithm: Some(HASH_ALGORITHM.to_string()),
        hash_hex: Some(hex_lower(&digest)),
        observed_at_unix_ms: observed_at,
        generation_id: generation_id.to_string(),
        diagnostic: None,
    })
}

fn non_hashed(
    node: &MapNode,
    observed_at: i64,
    generation_id: &str,
    status: ObservationStatus,
    diagnostic: &str,
) -> ContentObservation {
    ContentObservation {
        relative_path: node.relative_path.clone(),
        size_bytes: node.size_bytes,
        modified_unix_ms: node.modified_unix_ms,
        observation_status: status,
        hash_algorithm: None,
        hash_hex: None,
        observed_at_unix_ms: observed_at,
        generation_id: generation_id.to_string(),
        diagnostic: Some(diagnostic.to_string()),
    }
}

pub fn content_observation_summary(
    paths: &SandboxPaths,
    brain: &BrainRecord,
) -> Result<ContentObservationSummary, MapError> {
    let database = paths.brain_content_signals_database(&brain.brain_id);
    ContentSignalStore::open(&database)?.summary(&brain.brain_id, paths.relative_name(&database))
}

pub fn content_observation_for_path(
    paths: &SandboxPaths,
    brain: &BrainRecord,
    relative_path: &str,
) -> Result<Option<ContentObservation>, MapError> {
    let database = paths.brain_content_signals_database(&brain.brain_id);
    ContentSignalStore::open(&database)?.observation(relative_path)
}

pub fn identical_content_members(
    paths: &SandboxPaths,
    brain: &BrainRecord,
    hash: &str,
) -> Result<Vec<ContentObservation>, MapError> {
    let database = paths.brain_content_signals_database(&brain.brain_id);
    ContentSignalStore::open(&database)?.identical_members(hash)
}

pub fn content_observation_diagnostics(
    paths: &SandboxPaths,
    brain: &BrainRecord,
) -> Result<Vec<ContentObservation>, MapError> {
    let database = paths.brain_content_signals_database(&brain.brain_id);
    ContentSignalStore::open(&database)?.diagnostics()
}

pub fn content_observations(
    paths: &SandboxPaths,
    brain: &BrainRecord,
) -> Result<Vec<ContentObservation>, MapError> {
    let database = paths.brain_content_signals_database(&brain.brain_id);
    ContentSignalStore::open(&database)?.all_observations()
}

fn validate_relative_path(relative_path: &str) -> Result<PathBuf, MapError> {
    if relative_path.is_empty() || relative_path.contains('\\') {
        return Err(MapError::ContentObservation("relative_path_refused".into()));
    }
    let path = Path::new(relative_path);
    if path.is_absolute()
        || path
            .components()
            .any(|component| !matches!(component, Component::Normal(_)))
    {
        return Err(MapError::ContentObservation("relative_path_refused".into()));
    }
    Ok(path.to_path_buf())
}

fn validate_digest(hash: &str) -> Result<(), MapError> {
    if hash.len() != 64
        || !hash
            .bytes()
            .all(|byte| byte.is_ascii_hexdigit() && !byte.is_ascii_uppercase())
    {
        return Err(MapError::ContentObservation("sha256_digest_refused".into()));
    }
    Ok(())
}

fn lexically_contained(root: &Path, candidate: &Path) -> bool {
    candidate.starts_with(root)
}

fn stability_tuple(metadata: &Metadata) -> (u64, Option<i64>) {
    (metadata.len(), modified_ms(metadata))
}

fn modified_ms(metadata: &Metadata) -> Option<i64> {
    metadata
        .modified()
        .ok()?
        .duration_since(UNIX_EPOCH)
        .ok()
        .map(|duration| duration.as_millis().min(i64::MAX as u128) as i64)
}

#[cfg(windows)]
fn metadata_is_reparse_point(metadata: &Metadata) -> bool {
    use std::os::windows::fs::MetadataExt;
    metadata.file_attributes() & 0x0000_0400 != 0
}

#[cfg(not(windows))]
fn metadata_is_reparse_point(_metadata: &Metadata) -> bool {
    false
}

fn now_ms() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis()
        .min(i64::MAX as u128) as i64
}

fn hex_lower(bytes: &[u8]) -> String {
    let mut output = String::with_capacity(bytes.len() * 2);
    for byte in bytes {
        write!(&mut output, "{byte:02x}").expect("writing into String cannot fail");
    }
    output
}

fn count_status(observations: &[ContentObservation], status: ObservationStatus) -> usize {
    observations
        .iter()
        .filter(|observation| observation.observation_status == status)
        .count()
}

fn i64_of(value: u64) -> i64 {
    value.min(i64::MAX as u64) as i64
}

fn usize_of(value: i64) -> usize {
    value.max(0) as usize
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::map::layout::Rect;
    use std::collections::BTreeMap;

    fn file_node(id: i64, path: &str, size: u64) -> MapNode {
        MapNode {
            id,
            parent_id: Some(1),
            name: Path::new(path)
                .file_name()
                .expect("name")
                .to_string_lossy()
                .into_owned(),
            relative_path: path.to_string(),
            kind: NodeKind::File,
            depth: 1,
            size_bytes: size,
            modified_unix_ms: None,
            child_count: 0,
            access_diagnostic: None,
            rect: Rect {
                x: 0.0,
                y: 0.0,
                w: 240.0,
                h: 64.0,
            },
        }
    }

    fn directory_node(id: i64, path: &str) -> MapNode {
        let mut node = file_node(id, path, 0);
        node.kind = NodeKind::Directory;
        node
    }

    fn paths(temp: &tempfile::TempDir) -> SandboxPaths {
        SandboxPaths::under(temp.path().join("sandbox"))
    }

    fn run(
        paths: &SandboxPaths,
        brain_id: &str,
        root: &Path,
        nodes: &[MapNode],
    ) -> Result<ContentObservationReport, MapError> {
        observe_root_with_hook(paths, brain_id, root, nodes, &mut |_| Ok(()))
    }

    #[test]
    fn known_sha256_vectors_and_streaming_chunks_are_exact() {
        let temp = tempfile::tempdir().expect("temp");
        let root = temp.path().join("source");
        fs::create_dir_all(&root).expect("root");
        let binary = (0..(HASH_BUFFER_BYTES * 2 + 17))
            .map(|index| (index % 251) as u8)
            .collect::<Vec<_>>();
        fs::write(root.join("empty.bin"), []).expect("empty");
        fs::write(root.join("abc.bin"), b"abc").expect("abc");
        fs::write(root.join("binary.bin"), &binary).expect("binary");
        let nodes = vec![
            file_node(2, "empty.bin", 0),
            file_node(3, "abc.bin", 3),
            file_node(4, "binary.bin", binary.len() as u64),
        ];
        run(&paths(&temp), "brain-test", &root, &nodes).expect("campaign");
        let store =
            ContentSignalStore::open(&paths(&temp).brain_content_signals_database("brain-test"))
                .expect("store");
        assert_eq!(
            store
                .observation("empty.bin")
                .expect("read")
                .unwrap()
                .hash_hex
                .as_deref(),
            Some("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
        );
        assert_eq!(
            store
                .observation("abc.bin")
                .expect("read")
                .unwrap()
                .hash_hex
                .as_deref(),
            Some("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad")
        );
        let expected = hex_lower(&Sha256::digest(&binary));
        assert_eq!(
            store
                .observation("binary.bin")
                .expect("read")
                .unwrap()
                .hash_hex,
            Some(expected)
        );
    }

    #[test]
    fn same_bytes_empty_files_and_same_length_different_bytes_are_distinguished() {
        let temp = tempfile::tempdir().expect("temp");
        let root = temp.path().join("source");
        fs::create_dir_all(root.join("a")).expect("a");
        fs::create_dir_all(root.join("b")).expect("b");
        for path in ["a/original.bin", "b/autre-nom.bin"] {
            fs::write(root.join(path), b"same bytes").expect("same");
        }
        fs::write(root.join("empty-a"), []).expect("empty");
        fs::write(root.join("empty-b"), []).expect("empty");
        fs::write(root.join("left"), b"AAAA").expect("left");
        fs::write(root.join("right"), b"BBBB").expect("right");
        let nodes = [
            file_node(2, "a/original.bin", 10),
            file_node(3, "b/autre-nom.bin", 10),
            file_node(4, "empty-a", 0),
            file_node(5, "empty-b", 0),
            file_node(6, "left", 4),
            file_node(7, "right", 4),
        ];
        run(&paths(&temp), "brain-test", &root, &nodes).expect("campaign");
        let store =
            ContentSignalStore::open(&paths(&temp).brain_content_signals_database("brain-test"))
                .expect("store");
        let same = store.observation("a/original.bin").unwrap().unwrap();
        let renamed = store.observation("b/autre-nom.bin").unwrap().unwrap();
        assert_eq!(same.hash_hex, renamed.hash_hex);
        assert_ne!(same.relative_path, renamed.relative_path);
        assert_eq!(
            store
                .identical_members(same.hash_hex.as_deref().unwrap())
                .unwrap()
                .len(),
            2
        );
        let empty = store.observation("empty-a").unwrap().unwrap();
        assert_eq!(
            store
                .identical_members(empty.hash_hex.as_deref().unwrap())
                .unwrap()
                .len(),
            2
        );
        assert_ne!(
            store.observation("left").unwrap().unwrap().hash_hex,
            store.observation("right").unwrap().unwrap().hash_hex
        );
        // This store has no representation for a relation or suggestion.
        let columns = store
            .connection
            .prepare("PRAGMA table_info(content_observations)")
            .unwrap()
            .query_map([], |row| row.get::<_, String>(1))
            .unwrap()
            .collect::<Result<Vec<_>, _>>()
            .unwrap();
        for forbidden in ["relation_id", "provenance", "suggestion", "approved"] {
            assert!(!columns.iter().any(|column| column == forbidden));
        }
    }

    #[test]
    fn directories_are_not_hashed_and_paths_are_relative_only() {
        let temp = tempfile::tempdir().expect("temp");
        let root = temp.path().join("source");
        fs::create_dir_all(root.join("folder")).expect("root");
        fs::write(root.join("folder/file.bin"), b"x").expect("file");
        let report = run(
            &paths(&temp),
            "brain-test",
            &root,
            &[
                directory_node(2, "folder"),
                file_node(3, "folder/file.bin", 1),
            ],
        )
        .expect("campaign");
        assert_eq!(report.indexed_file_count, 1);
        assert_eq!(report.files_opened_for_hash, 1);
        let store =
            ContentSignalStore::open(&paths(&temp).brain_content_signals_database("brain-test"))
                .unwrap();
        assert!(store.observation("folder").unwrap().is_none());
        assert!(store
            .all_observations()
            .unwrap()
            .iter()
            .all(|entry| !Path::new(&entry.relative_path).is_absolute()
                && !entry.relative_path.contains('\\')));
    }

    #[test]
    fn traversal_is_refused_without_opening_anything() {
        let temp = tempfile::tempdir().expect("temp");
        let root = temp.path().join("source");
        fs::create_dir_all(&root).expect("root");
        let report = run(
            &paths(&temp),
            "brain-test",
            &root,
            &[file_node(2, "../outside", 1)],
        )
        .expect("campaign");
        assert_eq!(report.unsupported_count, 1);
        assert_eq!(report.files_opened_for_hash, 0);
    }

    #[test]
    fn schema_and_sql_checks_reject_false_digests() {
        let store = ContentSignalStore::in_memory().expect("store");
        assert_eq!(
            store
                .connection
                .query_row("PRAGMA user_version", [], |row| row.get::<_, i64>(0))
                .unwrap(),
            CONTENT_SIGNALS_SCHEMA_VERSION
        );
        let invalid_nonhashed = store.connection.execute(
            "INSERT INTO content_observations VALUES
             ('a',1,NULL,'UNREADABLE','sha256-v1',?1,1,'g','read_failed')",
            ["0".repeat(64)],
        );
        assert!(invalid_nonhashed.is_err());
        let invalid_upper = store.connection.execute(
            "INSERT INTO content_observations VALUES
             ('b',1,NULL,'HASHED','sha256-v1',?1,1,'g',NULL)",
            ["A".repeat(64)],
        );
        assert!(invalid_upper.is_err());
    }

    #[test]
    fn brains_are_physically_isolated_even_on_the_same_source() {
        let temp = tempfile::tempdir().expect("temp");
        let root = temp.path().join("source");
        fs::create_dir_all(&root).expect("root");
        fs::write(root.join("same.bin"), b"same").expect("file");
        let paths = paths(&temp);
        let nodes = [file_node(2, "same.bin", 4)];
        run(&paths, "brain-alpha", &root, &nodes).expect("alpha");
        run(&paths, "brain-gamma", &root, &nodes).expect("gamma");
        let alpha_path = paths.brain_content_signals_database("brain-alpha");
        let gamma_path = paths.brain_content_signals_database("brain-gamma");
        assert_ne!(alpha_path, gamma_path);
        let alpha = ContentSignalStore::open(&alpha_path)
            .unwrap()
            .observation("same.bin")
            .unwrap()
            .unwrap();
        let gamma = ContentSignalStore::open(&gamma_path)
            .unwrap()
            .observation("same.bin")
            .unwrap()
            .unwrap();
        assert_eq!(alpha.hash_hex, gamma.hash_hex);
    }

    #[test]
    fn replacement_is_atomic_and_failed_campaign_preserves_previous_generation() {
        let temp = tempfile::tempdir().expect("temp");
        let root = temp.path().join("source");
        fs::create_dir_all(&root).expect("root");
        fs::write(root.join("file.bin"), b"first").expect("file");
        let paths = paths(&temp);
        let nodes = [file_node(2, "file.bin", 5)];
        let first = run(&paths, "brain-test", &root, &nodes).expect("first");
        let mut hook = |event: &ObservationEvent| {
            if matches!(event, ObservationEvent::BeforeCommit) {
                Err(MapError::ContentObservation(
                    "injected_before_commit".into(),
                ))
            } else {
                Ok(())
            }
        };
        let failed = observe_root_with_hook(&paths, "brain-test", &root, &nodes, &mut hook);
        assert!(failed.is_err());
        let summary = ContentSignalStore::open(&paths.brain_content_signals_database("brain-test"))
            .unwrap()
            .summary("brain-test", "relative".into())
            .unwrap();
        assert_eq!(
            summary.current_generation_id.as_deref(),
            Some(first.generation_id.as_str())
        );
        assert!(
            ContentSignalStore::open(&paths.brain_content_signals_database("brain-test"))
                .unwrap()
                .all_observations()
                .unwrap()
                .iter()
                .all(|entry| entry.generation_id == first.generation_id)
        );
    }

    #[test]
    fn every_campaign_reopens_rehashes_and_replaces_changed_content() {
        let temp = tempfile::tempdir().expect("temp");
        let root = temp.path().join("source");
        fs::create_dir_all(&root).expect("root");
        let file = root.join("file.bin");
        fs::write(&file, b"AAAA").expect("file");
        let paths = paths(&temp);
        let nodes = [file_node(2, "file.bin", 4)];
        let first = run(&paths, "brain-test", &root, &nodes).expect("first");
        let first_digest =
            ContentSignalStore::open(&paths.brain_content_signals_database("brain-test"))
                .unwrap()
                .observation("file.bin")
                .unwrap()
                .unwrap()
                .hash_hex
                .unwrap();
        fs::write(&file, b"BBBB").expect("same size mutation");
        let second = run(&paths, "brain-test", &root, &nodes).expect("second");
        let second_digest =
            ContentSignalStore::open(&paths.brain_content_signals_database("brain-test"))
                .unwrap()
                .observation("file.bin")
                .unwrap()
                .unwrap()
                .hash_hex
                .unwrap();
        assert_ne!(first.generation_id, second.generation_id);
        assert_ne!(first_digest, second_digest);
        assert_eq!(second.files_opened_for_hash, 1);
        assert_eq!(second.bytes_read, 4);
        assert_eq!(second.digests_computed, second.hashed_count);
    }

    #[test]
    fn unstable_read_never_publishes_a_digest() {
        let temp = tempfile::tempdir().expect("temp");
        let root = temp.path().join("source");
        fs::create_dir_all(&root).expect("root");
        let file = root.join("large.bin");
        fs::write(&file, vec![7_u8; HASH_BUFFER_BYTES * 2]).expect("file");
        let paths = paths(&temp);
        let nodes = [file_node(2, "large.bin", (HASH_BUFFER_BYTES * 2) as u64)];
        let mut changed = false;
        let mut hook = |event: &ObservationEvent| {
            if !changed && matches!(event, ObservationEvent::AfterChunk { .. }) {
                let mut bytes = fs::read(&file)?;
                bytes.push(9);
                fs::write(&file, bytes)?;
                changed = true;
            }
            Ok(())
        };
        let result = observe_root_with_hook(&paths, "brain-test", &root, &nodes, &mut hook);
        assert!(matches!(
            result,
            Err(MapError::ContentObservation(message)) if message == "SOURCE_CHANGED_DURING_OBSERVATION"
        ));
        // Exercise the file-level status independently of the global refusal.
        let mut counters = CampaignCounters::default();
        let before_len = fs::metadata(&file).unwrap().len();
        let mut changed_again = false;
        let mut hook = |event: &ObservationEvent| {
            if !changed_again && matches!(event, ObservationEvent::AfterChunk { .. }) {
                let mut bytes = fs::read(&file)?;
                bytes.push(10);
                fs::write(&file, bytes)?;
                changed_again = true;
            }
            Ok(())
        };
        let observation = observe_file(
            &root,
            &file_node(2, "large.bin", before_len),
            now_ms(),
            "generation",
            &mut counters,
            &mut hook,
        )
        .expect("observation");
        assert_eq!(
            observation.observation_status,
            ObservationStatus::UnstableDuringRead
        );
        assert!(observation.hash_hex.is_none());
        assert_eq!(counters.digests_computed, 0);
    }

    #[test]
    fn unreadable_or_disappeared_file_has_no_digest() {
        let temp = tempfile::tempdir().expect("temp");
        let root = temp.path().join("source");
        fs::create_dir_all(&root).expect("root");
        let report = run(
            &paths(&temp),
            "brain-test",
            &root,
            &[file_node(2, "gone.bin", 9)],
        )
        .expect("campaign");
        assert_eq!(report.unreadable_count, 1);
        let observation =
            ContentSignalStore::open(&paths(&temp).brain_content_signals_database("brain-test"))
                .unwrap()
                .observation("gone.bin")
                .unwrap()
                .unwrap();
        assert!(observation.hash_algorithm.is_none());
        assert!(observation.hash_hex.is_none());
    }

    #[test]
    fn disappeared_paths_are_not_silently_current() {
        let temp = tempfile::tempdir().expect("temp");
        let root = temp.path().join("source");
        fs::create_dir_all(&root).expect("root");
        fs::write(root.join("keep.bin"), b"keep").unwrap();
        fs::write(root.join("remove.bin"), b"remove").unwrap();
        let paths = paths(&temp);
        let first = run(
            &paths,
            "brain-test",
            &root,
            &[file_node(2, "keep.bin", 4), file_node(3, "remove.bin", 6)],
        )
        .unwrap();
        fs::remove_file(root.join("remove.bin")).unwrap();
        let second = run(&paths, "brain-test", &root, &[file_node(2, "keep.bin", 4)]).unwrap();
        let store =
            ContentSignalStore::open(&paths.brain_content_signals_database("brain-test")).unwrap();
        assert_ne!(first.generation_id, second.generation_id);
        assert!(store.observation("remove.bin").unwrap().is_none());
        assert_eq!(store.all_observations().unwrap().len(), 1);
    }

    #[test]
    fn source_change_before_final_fingerprint_refuses_the_generation() {
        let temp = tempfile::tempdir().expect("temp");
        let root = temp.path().join("source");
        fs::create_dir_all(&root).unwrap();
        fs::write(root.join("file.bin"), b"stable").unwrap();
        let paths = paths(&temp);
        let nodes = [file_node(2, "file.bin", 6)];
        let first = run(&paths, "brain-test", &root, &nodes).unwrap();
        let mut hook = |event: &ObservationEvent| {
            if matches!(event, ObservationEvent::BeforeFingerprintAfter) {
                fs::write(root.join("late.bin"), b"change")?;
            }
            Ok(())
        };
        let result = observe_root_with_hook(&paths, "brain-test", &root, &nodes, &mut hook);
        assert!(result.is_err());
        let current = ContentSignalStore::open(&paths.brain_content_signals_database("brain-test"))
            .unwrap()
            .summary("brain-test", "relative".into())
            .unwrap();
        assert_eq!(current.current_generation_id, Some(first.generation_id));
    }

    #[test]
    fn content_store_contains_no_physical_identity_or_absolute_path_columns() {
        let store = ContentSignalStore::in_memory().unwrap();
        let mut statement = store
            .connection
            .prepare("PRAGMA table_info(content_observations)")
            .unwrap();
        let columns = statement
            .query_map([], |row| row.get::<_, String>(1))
            .unwrap()
            .collect::<Result<Vec<_>, _>>()
            .unwrap();
        for forbidden in [
            "volume_serial_number",
            "file_id",
            "physical_file_identity",
            "stable_file_identity",
            "absolute_path",
        ] {
            assert!(!columns.iter().any(|column| column == forbidden));
        }
    }

    #[test]
    fn report_counts_partition_every_indexed_file() {
        let temp = tempfile::tempdir().unwrap();
        let root = temp.path().join("source");
        fs::create_dir_all(&root).unwrap();
        fs::write(root.join("ok"), b"ok").unwrap();
        let report = run(
            &paths(&temp),
            "brain-test",
            &root,
            &[
                file_node(2, "ok", 2),
                file_node(3, "missing", 0),
                file_node(4, "../bad", 0),
            ],
        )
        .unwrap();
        assert_eq!(
            report.indexed_file_count,
            report.hashed_count
                + report.unreadable_count
                + report.unstable_count
                + report.unsupported_count
        );
        assert_eq!(report.digests_computed, report.hashed_count);
    }

    #[test]
    fn diagnostics_never_contain_a_personal_or_absolute_path() {
        let temp = tempfile::tempdir().unwrap();
        let root = temp.path().join("source");
        fs::create_dir_all(&root).unwrap();
        run(
            &paths(&temp),
            "brain-test",
            &root,
            &[file_node(2, "missing", 0)],
        )
        .unwrap();
        let diagnostics =
            ContentSignalStore::open(&paths(&temp).brain_content_signals_database("brain-test"))
                .unwrap()
                .diagnostics()
                .unwrap();
        assert_eq!(diagnostics.len(), 1);
        assert!(diagnostics.iter().all(|entry| {
            entry.diagnostic.as_deref() == Some("metadata_unreadable")
                && !Path::new(&entry.relative_path).is_absolute()
        }));
    }

    #[cfg(unix)]
    #[test]
    fn symlink_escape_is_refused() {
        use std::os::unix::fs::symlink;
        let temp = tempfile::tempdir().unwrap();
        let root = temp.path().join("source");
        fs::create_dir_all(&root).unwrap();
        let outside = temp.path().join("outside");
        fs::write(&outside, b"outside").unwrap();
        symlink(&outside, root.join("link")).unwrap();
        let report = run(
            &paths(&temp),
            "brain-test",
            &root,
            &[file_node(2, "link", 7)],
        )
        .unwrap();
        assert_eq!(report.unsupported_count, 1);
        assert_eq!(report.files_opened_for_hash, 0);
    }

    #[cfg(windows)]
    #[test]
    fn reparse_or_symlink_escape_is_refused_when_the_platform_allows_creation() {
        use std::os::windows::fs::symlink_file;
        let temp = tempfile::tempdir().unwrap();
        let root = temp.path().join("source");
        fs::create_dir_all(&root).unwrap();
        let outside = temp.path().join("outside");
        fs::write(&outside, b"outside").unwrap();
        if symlink_file(&outside, root.join("link")).is_err() {
            return;
        }
        let report = run(
            &paths(&temp),
            "brain-test",
            &root,
            &[file_node(2, "link", 7)],
        )
        .unwrap();
        assert_eq!(report.unsupported_count, 1);
        assert_eq!(report.files_opened_for_hash, 0);
    }

    #[test]
    fn identical_groups_are_scoped_to_one_store() {
        let mut store = ContentSignalStore::in_memory().unwrap();
        let digest = "0".repeat(64);
        let observations = ["a", "b"].map(|path| ContentObservation {
            relative_path: path.into(),
            size_bytes: 0,
            modified_unix_ms: None,
            observation_status: ObservationStatus::Hashed,
            hash_algorithm: Some(HASH_ALGORITHM.into()),
            hash_hex: Some(digest.clone()),
            observed_at_unix_ms: 1,
            generation_id: "g".into(),
            diagnostic: None,
        });
        store
            .replace_generation("g", 1, "fingerprint", &observations)
            .unwrap();
        let members = store.identical_members(&digest).unwrap();
        assert_eq!(
            members
                .iter()
                .map(|entry| entry.relative_path.as_str())
                .collect::<Vec<_>>(),
            ["a", "b"]
        );
        assert_eq!(
            members
                .iter()
                .map(|entry| &entry.generation_id)
                .collect::<std::collections::BTreeSet<_>>()
                .len(),
            1
        );
    }

    #[test]
    fn store_metadata_has_only_the_current_complete_generation() {
        let mut store = ContentSignalStore::in_memory().unwrap();
        let observation = ContentObservation {
            relative_path: "a".into(),
            size_bytes: 0,
            modified_unix_ms: None,
            observation_status: ObservationStatus::Hashed,
            hash_algorithm: Some(HASH_ALGORITHM.into()),
            hash_hex: Some("0".repeat(64)),
            observed_at_unix_ms: 1,
            generation_id: "opaque-a".into(),
            diagnostic: None,
        };
        store
            .replace_generation("opaque-a", 1, "fp-a", &[observation])
            .unwrap();
        let metadata = [
            "schema_version",
            "signal_engine_version",
            "current_generation_id",
            "current_generation_observed_at",
            "source_fingerprint",
        ]
        .into_iter()
        .map(|key| (key, store.meta(key).unwrap()))
        .collect::<BTreeMap<_, _>>();
        assert_eq!(
            metadata["current_generation_id"].as_deref(),
            Some("opaque-a")
        );
        assert_eq!(
            metadata["signal_engine_version"].as_deref(),
            Some(SIGNAL_ENGINE_VERSION)
        );
    }

    #[test]
    fn real_pipeline_isolated_brains_rebuild_and_relation_stores_stay_unchanged() {
        use super::super::brains::BrainNodeRef;
        use super::super::relation_commands;

        let temp = tempfile::tempdir().expect("temp");
        let paths = SandboxPaths::under(temp.path().join("sandbox"));
        let alpha = BrainRecord::frozen_by_id("brain-alpha").expect("alpha");
        let gamma = BrainRecord::frozen_by_id("brain-gamma").expect("gamma");
        assert_eq!(alpha.source_ref, gamma.source_ref);

        commands::build_map(&paths, &alpha, false).expect("alpha map");
        commands::build_map(&paths, &gamma, false).expect("gamma map");
        let relations_before =
            relation_commands::open_relations(&paths, &alpha).expect("seeded relation store");
        let relation_storage_digest = || {
            let directory = paths
                .brain_relations_database(&alpha.brain_id)
                .parent()
                .expect("relations directory")
                .to_path_buf();
            let mut entries = fs::read_dir(directory)
                .expect("relation files")
                .map(|entry| entry.expect("relation file").path())
                .collect::<Vec<_>>();
            entries.sort();
            let mut digest = Sha256::new();
            for path in entries {
                digest.update(
                    path.file_name()
                        .expect("file name")
                        .to_string_lossy()
                        .as_bytes(),
                );
                digest.update(fs::read(path).expect("relation bytes"));
            }
            hex_lower(&digest.finalize())
        };
        let relation_bytes_before = relation_storage_digest();

        let alpha_report = observe_content(&paths, &alpha).expect("alpha observation");
        let gamma_report = observe_content(&paths, &gamma).expect("gamma observation");
        assert_eq!(relation_bytes_before, relation_storage_digest());
        assert!(alpha_report.read_only_confirmed && gamma_report.read_only_confirmed);
        assert_eq!(
            alpha_report.source_fingerprint_before,
            alpha_report.source_fingerprint_after
        );
        assert_ne!(alpha_report.store_path, gamma_report.store_path);
        assert_eq!(
            alpha_report.store_path,
            "brains/brain-alpha/signals/content.sqlite"
        );
        assert_eq!(
            gamma_report.store_path,
            "brains/brain-gamma/signals/content.sqlite"
        );

        let alpha_snapshot = commands::snapshot(&paths, &alpha).expect("alpha snapshot");
        let same_path = alpha_snapshot
            .nodes
            .iter()
            .find(|node| node.kind == NodeKind::File)
            .expect("indexed file");
        let alpha_observation =
            content_observation_for_path(&paths, &alpha, &same_path.relative_path)
                .expect("alpha read")
                .expect("alpha observation");
        let gamma_observation =
            content_observation_for_path(&paths, &gamma, &same_path.relative_path)
                .expect("gamma read")
                .expect("gamma observation");
        assert_eq!(alpha_observation.hash_hex, gamma_observation.hash_hex);
        assert_ne!(
            BrainNodeRef {
                brain_id: alpha.brain_id.clone(),
                node_id: same_path.id,
            },
            BrainNodeRef {
                brain_id: gamma.brain_id.clone(),
                node_id: same_path.id,
            }
        );

        let alpha_summary_before = content_observation_summary(&paths, &alpha).unwrap();
        commands::build_map(&paths, &alpha, true).expect("alpha rebuild");
        let alpha_summary_after = content_observation_summary(&paths, &alpha).unwrap();
        let alpha_observation_after =
            content_observation_for_path(&paths, &alpha, &same_path.relative_path)
                .unwrap()
                .unwrap();
        assert_eq!(alpha_summary_before, alpha_summary_after);
        assert_eq!(alpha_observation, alpha_observation_after);

        let relations_after = relation_commands::open_relations(&paths, &alpha)
            .expect("relation store after hashing and rebuild");
        assert_eq!(
            relations_before.deterministic_count,
            relations_after.deterministic_count
        );
        assert_eq!(
            relations_before.approved_count,
            relations_after.approved_count
        );
        assert_eq!(
            relations_before.pending_suggestion_count,
            relations_after.pending_suggestion_count
        );
        assert_eq!(
            relations_before.deterministic_digest,
            relations_after.deterministic_digest
        );
    }
}
