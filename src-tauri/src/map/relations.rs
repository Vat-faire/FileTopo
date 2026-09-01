//! Cross-cutting relations, and the provenance without which none of them
//! exists — `TASK-0017` §4.
//!
//! Four rules govern this module, and none of them is negotiable.
//!
//! * **A relation without provenance is not representable.** Provenance is not
//!   a column that could be left null: derived and non-derived relations live
//!   in **two separate tables** (`DEC-0009` `R-C`), so the table *is* the
//!   provenance. There are exactly two, `DETERMINISTIC` and `APPROVED`, and
//!   there is no third.
//! * **A suggestion is not a relation** — correction `X1`. It is a distinct
//!   object in a distinct table, with its own state, never counted among
//!   established relations, and it becomes a relation only through an explicit
//!   approval.
//! * **No inverse is ever inferred.** `A → B` does not imply `B → A`. A rule
//!   may declare itself symmetric; none of this slice's rules does.
//! * **Relations never live in the analysed tree** (`I-2`), and never inside
//!   the rebuildable map index, which `map_open(rebuild)` deletes.
//!
//! The endpoint key is the reason a rebuild does not orphan anything: rows
//! reference `ek1|<fixture>|<relative path>`, never the integer `id` of a
//! `map_nodes` row, which is temporary and changes on every rebuild.

use super::MapError;
use super::store::MapNode;
use crate::domain::NodeKind;
use rusqlite::{Connection, OptionalExtension, params};
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use std::path::Path;
use std::time::{SystemTime, UNIX_EPOCH};
use thiserror::Error;

/// Bump only together with a migration.
///
/// * `1` — `TASK-0017` as first delivered.
/// * `2` — reserve **`X3`** of the independent control: an approved relation
///   is now **structurally** bound to the suggestion it represents. See
///   [`RelationStore::migrate_to_v2`].
pub const RELATIONS_SCHEMA_VERSION: i64 = 2;

/// Version of the endpoint key scheme, carried **inside every key** and
/// recorded in the store's metadata, so a later scheme is a migration rather
/// than a silent reinterpretation of existing rows.
pub const ENDPOINT_KEY_SCHEME: &str = "ek1";

/// The fixture `TASK-0017` §4.6 freezes as the relations brain.
///
/// The rule engine below is fixture-agnostic and tested as such; what is
/// frozen is the *fixture the slice ships relations for*. Other fixtures are
/// refused explicitly rather than served a half-supported feature.
pub const RELATIONS_FIXTURE: &str = "quasi-empty";

/// Ceiling on derived relations, in the spirit of `B-1`: the derivation
/// **refuses** rather than truncating, samples or degrading.
///
/// Not a frozen criterion of `TASK-0017` — an added guard. `homonymes` is
/// quadratic in the number of files sharing a name, and on the `wide` fixture
/// that is hundreds of thousands of pairs. A slice that silently produced them
/// would be lying about what it can draw.
pub const MAX_DERIVED_RELATIONS: usize = 5_000;

/// The two relation types frozen by `TASK-0017` §4.2.
pub const RELATION_TYPES: [&str; 2] = ["reference", "revision"];

/// A documented, versioned derivation rule.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RelationRule {
    pub name: &'static str,
    pub version: &'static str,
    pub relation_type: &'static str,
    /// Declared, never assumed. **No rule of this slice is symmetric**, which
    /// is what makes "no inverse is invented" checkable rather than hoped for.
    pub symmetric: bool,
}

/// `TASK-0017` §4.5, frozen.
pub const RULES: [RelationRule; 2] = [
    RelationRule {
        name: "homonymes",
        version: "v1",
        relation_type: "reference",
        symmetric: false,
    },
    RelationRule {
        name: "suites-numerotees",
        version: "v1",
        relation_type: "revision",
        symmetric: false,
    },
];

/// Every way a write can be refused, each with the named motif the task sheet
/// freezes. Refusals are named and returned; nothing is coerced or dropped.
#[derive(Debug, Error, PartialEq, Eq, Clone)]
pub enum RelationError {
    #[error("relation_rejected_unknown_provenance: {0}")]
    UnknownProvenance(String),
    #[error("relation_rejected_missing_rule: {0}")]
    MissingRule(String),
    #[error("relation_rejected_suggestion_is_not_a_relation: {0}")]
    SuggestionIsNotARelation(String),
    #[error("relation_rejected_empty_endpoint: {0}")]
    EmptyEndpoint(String),
    #[error("relation_rejected_empty_type: {0}")]
    EmptyType(String),
    #[error("relation_rejected_unknown_type: {0}")]
    UnknownType(String),
    #[error("relation_rejected_self_loop: {0}")]
    SelfLoop(String),
    #[error("relation_rejected_unknown_suggestion: {0}")]
    UnknownSuggestion(String),
    #[error("relation_rejected_suggestion_already_decided: {0}")]
    SuggestionAlreadyDecided(String),
    #[error("relation_derivation_refused: {found} derived relations exceed the ceiling of {ceiling}")]
    DerivationCeilingExceeded { found: usize, ceiling: usize },
    #[error("relations_out_of_scope_for_fixture: {0}")]
    OutOfScopeFixture(String),
}

/// The only two provenances an established relation can have.
///
/// Parsed from the outside world exactly once, here, so an unknown string can
/// never reach a table.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum Provenance {
    Deterministic,
    Approved,
}

impl Provenance {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Deterministic => "DETERMINISTIC",
            Self::Approved => "APPROVED",
        }
    }

    /// Rejects everything that is not one of the two. `suggested`, the empty
    /// string and any unknown value are refused with a named motif — never
    /// mapped onto a default.
    pub fn parse(value: &str) -> Result<Self, RelationError> {
        match value {
            "DETERMINISTIC" => Ok(Self::Deterministic),
            "APPROVED" => Ok(Self::Approved),
            other => Err(RelationError::UnknownProvenance(format!(
                "`{other}` is not a provenance; an established relation is \
                 DETERMINISTIC or APPROVED, and there is no third value"
            ))),
        }
    }
}

/// Builds the versioned, deterministic endpoint key of `TASK-0017` §4.3.
///
/// Derived from the brain — here the fixture — and the relative path, so it
/// survives a rebuild that renumbers every `map_nodes` row.
///
/// **This is not `I-E`.** `VolumeSerialNumber` + `FileId`, and real moves and
/// renames, stay outside this slice. This is the deterministic fallback, and
/// it is declared as one.
pub fn endpoint_key(fixture_id: &str, relative_path: &str) -> String {
    format!("{ENDPOINT_KEY_SCHEME}|{fixture_id}|{relative_path}")
}

/// One established relation, as stored.
///
/// `rule_name`/`rule_version` are `Some` **exactly when** the provenance is
/// `DETERMINISTIC`: an approved relation never claims to come from a rule,
/// and its table has no column in which it could.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StoredRelation {
    pub id: i64,
    pub provenance: Provenance,
    pub relation_type: String,
    pub source_key: String,
    pub target_key: String,
    pub rule_name: Option<String>,
    pub rule_version: Option<String>,
    pub suggestion_key: Option<String>,
    pub approved_unix_ms: Option<i64>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StoredSuggestion {
    pub suggestion_key: String,
    pub relation_type: String,
    pub source_key: String,
    pub target_key: String,
    /// Where the suggestion claims to come from. In this slice, always the
    /// frozen synthetic fixture: **no real heuristic exists**, and none is
    /// implied.
    pub basis: String,
    /// `pending` or `approved`.
    pub state: String,
    pub created_unix_ms: i64,
    pub decided_unix_ms: Option<i64>,
}

/// A relation a rule produced, before it is written.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct DerivedRelation {
    pub source_key: String,
    pub target_key: String,
    pub relation_type: &'static str,
    pub rule: RelationRule,
}

fn now_ms() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis()
        .min(i64::MAX as u128) as i64
}

// ---------------------------------------------------------------------------
// The rule engine
// ---------------------------------------------------------------------------

/// Splits `note-12.txt` into `("note-", 12, ".txt")`.
///
/// Returns `None` when the stem has no trailing integer, which is most files:
/// a name without a number belongs to no numbered series.
fn numbered_name(name: &str) -> Option<(&str, u64, &str)> {
    let (stem, extension) = match name.rfind('.') {
        Some(dot) if dot > 0 => (&name[..dot], &name[dot..]),
        _ => (name, ""),
    };
    let digits_start = stem
        .char_indices()
        .rev()
        .take_while(|(_, character)| character.is_ascii_digit())
        .last()
        .map(|(index, _)| index)?;
    let number = stem[digits_start..].parse::<u64>().ok()?;
    Some((&stem[..digits_start], number, extension))
}

fn parent_path(relative_path: &str) -> &str {
    match relative_path.rfind('/') {
        Some(slash) => &relative_path[..slash],
        None => "",
    }
}

/// Applies the two frozen rules to an indexed tree.
///
/// Deliberately pure: it takes nodes and returns relations, so the same code
/// can be exercised on a handful of invented nodes in a unit test and on the
/// real index in the running host.
///
/// The output is **sorted**, which is what makes `J3` — two replays produce
/// exactly the same set — a property of the function rather than of SQLite's
/// row order.
pub fn derive(fixture_id: &str, nodes: &[MapNode]) -> Result<Vec<DerivedRelation>, RelationError> {
    let files = nodes
        .iter()
        .filter(|node| node.kind == NodeKind::File)
        .collect::<Vec<_>>();

    let mut derived = Vec::new();

    // `homonymes/v1` — same file name, different directories, directed from
    // the lexicographically smaller path to the larger. Never symmetric.
    let mut by_name: BTreeMap<&str, Vec<&str>> = BTreeMap::new();
    for file in &files {
        by_name
            .entry(file.name.as_str())
            .or_default()
            .push(file.relative_path.as_str());
    }
    for paths in by_name.values_mut() {
        paths.sort_unstable();
        for (offset, left) in paths.iter().enumerate() {
            for right in &paths[offset + 1..] {
                if parent_path(left) == parent_path(right) {
                    continue;
                }
                derived.push(DerivedRelation {
                    source_key: endpoint_key(fixture_id, left),
                    target_key: endpoint_key(fixture_id, right),
                    relation_type: RULES[0].relation_type,
                    rule: RULES[0],
                });
            }
        }
        if derived.len() > MAX_DERIVED_RELATIONS {
            return Err(RelationError::DerivationCeilingExceeded {
                found: derived.len(),
                ceiling: MAX_DERIVED_RELATIONS,
            });
        }
    }

    // `suites-numerotees/v1` — same directory, names differing only by a
    // consecutive trailing integer, directed from the smaller number to the
    // larger. Never symmetric.
    let mut series: BTreeMap<(&str, &str, &str), BTreeMap<u64, &str>> = BTreeMap::new();
    for file in &files {
        let Some((prefix, number, extension)) = numbered_name(&file.name) else {
            continue;
        };
        series
            .entry((parent_path(&file.relative_path), prefix, extension))
            .or_default()
            .insert(number, file.relative_path.as_str());
    }
    for members in series.values() {
        for (number, path) in members {
            let Some(next) = members.get(&(number + 1)) else {
                continue;
            };
            derived.push(DerivedRelation {
                source_key: endpoint_key(fixture_id, path),
                target_key: endpoint_key(fixture_id, next),
                relation_type: RULES[1].relation_type,
                rule: RULES[1],
            });
        }
    }

    if derived.len() > MAX_DERIVED_RELATIONS {
        return Err(RelationError::DerivationCeilingExceeded {
            found: derived.len(),
            ceiling: MAX_DERIVED_RELATIONS,
        });
    }

    derived.sort_by(|left, right| {
        (
            left.rule.name,
            &left.source_key,
            &left.target_key,
            left.relation_type,
        )
            .cmp(&(
                right.rule.name,
                &right.source_key,
                &right.target_key,
                right.relation_type,
            ))
    });
    Ok(derived)
}

// ---------------------------------------------------------------------------
// The store
// ---------------------------------------------------------------------------

/// `relations_approved`, under the `X3` constraints, plus the triggers that
/// make the correspondence structural rather than merely checked in Rust.
///
/// Three guarantees, none of which depends on a caller behaving:
///
/// * `suggestion_key` is `UNIQUE` — **one** approved relation per suggestion,
///   which is what `J4` means by "exactly one".
/// * a foreign key to `relation_suggestions` — an approved relation without a
///   suggestion cannot exist.
/// * a trigger on insert **and** on update — the row's source, target and type
///   must equal the suggestion's, and the suggestion must already be
///   `approved`. A suggestion cannot be used to justify a relation that is not
///   itself.
///
/// A fourth trigger protects the correspondence from the other side: a
/// suggestion whose relation exists can no longer have its endpoints or type
/// rewritten underneath it.
const APPROVED_SCHEMA_V2: &str = "
    CREATE TABLE IF NOT EXISTS relations_approved (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source_key TEXT NOT NULL CHECK(length(source_key) > 0),
        target_key TEXT NOT NULL CHECK(length(target_key) > 0),
        relation_type TEXT NOT NULL CHECK(length(relation_type) > 0),
        suggestion_key TEXT NOT NULL UNIQUE
            REFERENCES relation_suggestions(suggestion_key),
        approved_unix_ms INTEGER NOT NULL,
        UNIQUE(source_key, target_key, relation_type)
    );
    CREATE INDEX IF NOT EXISTS idx_approved_source
        ON relations_approved(source_key);
    CREATE INDEX IF NOT EXISTS idx_approved_target
        ON relations_approved(target_key);

    CREATE TRIGGER IF NOT EXISTS approved_must_match_its_suggestion_on_insert
    BEFORE INSERT ON relations_approved
    FOR EACH ROW BEGIN
        SELECT RAISE(ABORT, 'relation_rejected_suggestion_is_not_a_relation')
        WHERE NOT EXISTS (
            SELECT 1 FROM relation_suggestions s
             WHERE s.suggestion_key = NEW.suggestion_key
               AND s.state = 'approved'
               AND s.source_key = NEW.source_key
               AND s.target_key = NEW.target_key
               AND s.relation_type = NEW.relation_type);
    END;

    CREATE TRIGGER IF NOT EXISTS approved_must_match_its_suggestion_on_update
    BEFORE UPDATE ON relations_approved
    FOR EACH ROW BEGIN
        SELECT RAISE(ABORT, 'relation_rejected_suggestion_is_not_a_relation')
        WHERE NOT EXISTS (
            SELECT 1 FROM relation_suggestions s
             WHERE s.suggestion_key = NEW.suggestion_key
               AND s.state = 'approved'
               AND s.source_key = NEW.source_key
               AND s.target_key = NEW.target_key
               AND s.relation_type = NEW.relation_type);
    END;

    CREATE TRIGGER IF NOT EXISTS suggestion_cannot_drift_from_its_relation
    BEFORE UPDATE OF source_key, target_key, relation_type ON relation_suggestions
    FOR EACH ROW BEGIN
        SELECT RAISE(ABORT, 'relation_rejected_suggestion_is_not_a_relation')
        WHERE EXISTS (
            SELECT 1 FROM relations_approved a
             WHERE a.suggestion_key = OLD.suggestion_key);
    END;
";

pub struct RelationStore {
    connection: Connection,
}

impl RelationStore {
    pub fn open(path: &Path) -> Result<Self, MapError> {
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent)?;
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

    /// Writes straight into `relations_approved`, bypassing every Rust guard.
    ///
    /// Exists so the `X3` constraints can be proved **at the storage layer**:
    /// a guarantee that only holds while callers use the right function is not
    /// a guarantee. Test-only, and never compiled into the product.
    #[cfg(test)]
    fn raw_insert_approved(
        &self,
        source_key: &str,
        target_key: &str,
        relation_type: &str,
        suggestion_key: &str,
    ) -> Result<(), MapError> {
        self.connection.execute(
            "INSERT INTO relations_approved
                 (source_key, target_key, relation_type, suggestion_key, approved_unix_ms)
             VALUES (?1, ?2, ?3, ?4, ?5)",
            params![source_key, target_key, relation_type, suggestion_key, now_ms()],
        )?;
        Ok(())
    }

    #[cfg(test)]
    pub fn in_memory() -> Result<Self, MapError> {
        let connection = Connection::open_in_memory()?;
        connection.execute_batch("PRAGMA foreign_keys=ON;")?;
        let store = Self { connection };
        store.initialize()?;
        Ok(store)
    }

    /// Three tables, deliberately.
    ///
    /// There is **no `provenance` column anywhere**: which table a row is in
    /// *is* its provenance. That is what makes a relation without provenance
    /// unrepresentable rather than merely forbidden. The `CHECK` constraints
    /// repeat, at the storage layer, what the API already refuses — a defence
    /// that survives a future caller who bypasses the API.
    fn initialize(&self) -> Result<(), MapError> {
        self.connection.execute_batch(&format!(
            "CREATE TABLE IF NOT EXISTS relation_meta (
                 key TEXT PRIMARY KEY,
                 value TEXT NOT NULL
             );
             CREATE TABLE IF NOT EXISTS relations_deterministic (
                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                 source_key TEXT NOT NULL CHECK(length(source_key) > 0),
                 target_key TEXT NOT NULL CHECK(length(target_key) > 0),
                 relation_type TEXT NOT NULL CHECK(length(relation_type) > 0),
                 rule_name TEXT NOT NULL CHECK(length(rule_name) > 0),
                 rule_version TEXT NOT NULL CHECK(length(rule_version) > 0),
                 rule_symmetric INTEGER NOT NULL DEFAULT 0,
                 UNIQUE(source_key, target_key, relation_type)
             );
             CREATE TABLE IF NOT EXISTS relation_suggestions (
                 suggestion_key TEXT PRIMARY KEY,
                 source_key TEXT NOT NULL CHECK(length(source_key) > 0),
                 target_key TEXT NOT NULL CHECK(length(target_key) > 0),
                 relation_type TEXT NOT NULL CHECK(length(relation_type) > 0),
                 basis TEXT NOT NULL,
                 state TEXT NOT NULL CHECK(state IN ('pending', 'approved')),
                 created_unix_ms INTEGER NOT NULL,
                 decided_unix_ms INTEGER
             );
             CREATE INDEX IF NOT EXISTS idx_deterministic_source
                 ON relations_deterministic(source_key);
             CREATE INDEX IF NOT EXISTS idx_deterministic_target
                 ON relations_deterministic(target_key);
             "
        ))?;

        // A store written by version 1 carries a `relations_approved` that
        // could hold a row unrelated to the suggestion it names. Rebuild it
        // before the constrained definition is created.
        if self.approved_table_exists()? && self.user_version()? < 2 {
            self.migrate_to_v2()?;
        }
        self.connection.execute_batch(APPROVED_SCHEMA_V2)?;
        self.connection
            .execute_batch(&format!("PRAGMA user_version={RELATIONS_SCHEMA_VERSION};"))?;
        self.put_meta("schema_version", &RELATIONS_SCHEMA_VERSION.to_string())?;
        self.put_meta("endpoint_key_scheme", ENDPOINT_KEY_SCHEME)?;
        Ok(())
    }

    fn user_version(&self) -> Result<i64, MapError> {
        Ok(self
            .connection
            .query_row("PRAGMA user_version", [], |row| row.get(0))?)
    }

    fn approved_table_exists(&self) -> Result<bool, MapError> {
        Ok(self
            .connection
            .query_row(
                "SELECT 1 FROM sqlite_master
                  WHERE type = 'table' AND name = 'relations_approved'",
                [],
                |row| row.get::<_, i64>(0),
            )
            .optional()?
            .is_some())
    }

    /// Rebuilds `relations_approved` under the `X3` constraints.
    ///
    /// Rows that **do not** correspond to the suggestion they name are exactly
    /// the defect `X3` describes, so they are **not** carried over. They are
    /// not dropped in silence either: their keys are written into
    /// `relation_meta` under `migration_v2_discarded`, so a store that had one
    /// says so afterwards.
    ///
    /// Synthetic data only — this slice has no other kind.
    fn migrate_to_v2(&self) -> Result<(), MapError> {
        let discarded: Vec<String> = {
            let mut statement = self.connection.prepare(
                "SELECT a.suggestion_key FROM relations_approved a
                  WHERE NOT EXISTS (
                        SELECT 1 FROM relation_suggestions s
                         WHERE s.suggestion_key = a.suggestion_key
                           AND s.state = 'approved'
                           AND s.source_key = a.source_key
                           AND s.target_key = a.target_key
                           AND s.relation_type = a.relation_type)
                  ORDER BY a.id",
            )?;
            statement
                .query_map([], |row| row.get::<_, String>(0))?
                .collect::<Result<Vec<_>, _>>()?
        };

        self.connection.execute_batch(
            "ALTER TABLE relations_approved RENAME TO relations_approved_v1;",
        )?;
        self.connection.execute_batch(APPROVED_SCHEMA_V2)?;
        self.connection.execute(
            "INSERT INTO relations_approved
                 (source_key, target_key, relation_type, suggestion_key, approved_unix_ms)
             SELECT a.source_key, a.target_key, a.relation_type, a.suggestion_key,
                    a.approved_unix_ms
               FROM relations_approved_v1 a
              WHERE EXISTS (
                    SELECT 1 FROM relation_suggestions s
                     WHERE s.suggestion_key = a.suggestion_key
                       AND s.state = 'approved'
                       AND s.source_key = a.source_key
                       AND s.target_key = a.target_key
                       AND s.relation_type = a.relation_type)
              ORDER BY a.id",
            [],
        )?;
        self.connection
            .execute_batch("DROP TABLE relations_approved_v1;")?;

        if !discarded.is_empty() {
            self.put_meta("migration_v2_discarded", &discarded.join(","))?;
        }
        Ok(())
    }

    pub fn put_meta(&self, key: &str, value: &str) -> Result<(), MapError> {
        self.connection.execute(
            "INSERT INTO relation_meta (key, value) VALUES (?1, ?2)
             ON CONFLICT(key) DO UPDATE SET value = excluded.value",
            params![key, value],
        )?;
        Ok(())
    }

    // -- writes --------------------------------------------------------------

    /// The door through which a **deterministic** relation is written, and
    /// the door every attempted write is refused at.
    ///
    /// It takes the provenance as a *string* on purpose: that is the shape a
    /// caller, a fixture loader or a future import would have, and it is
    /// exactly where a third provenance would try to slip in. Everything is
    /// validated before a statement is prepared.
    ///
    /// **It cannot create an approved relation** — reserve `X3`. `APPROVED` is
    /// refused here unconditionally; [`RelationStore::approve`] is the single
    /// applicative path, and the storage enforces the same rule underneath.
    #[allow(clippy::too_many_arguments)]
    pub fn insert_established(
        &self,
        provenance: &str,
        source_key: &str,
        target_key: &str,
        relation_type: &str,
        rule_name: Option<&str>,
        rule_version: Option<&str>,
        suggestion_key: Option<&str>,
    ) -> Result<i64, MapError> {
        let provenance = Provenance::parse(provenance)?;
        Self::validate_shape(source_key, target_key, relation_type)?;

        match provenance {
            Provenance::Deterministic => {
                let name = rule_name.unwrap_or("").trim();
                let version = rule_version.unwrap_or("").trim();
                if name.is_empty() || version.is_empty() {
                    return Err(RelationError::MissingRule(format!(
                        "a DETERMINISTIC relation must carry a non-empty rule name \
                         and version; got name=`{}` version=`{}`",
                        rule_name.unwrap_or(""),
                        rule_version.unwrap_or("")
                    ))
                    .into());
                }
                let symmetric = RULES
                    .iter()
                    .find(|rule| rule.name == name && rule.version == version)
                    .map(|rule| rule.symmetric)
                    .unwrap_or(false);
                self.connection.execute(
                    "INSERT OR IGNORE INTO relations_deterministic
                         (source_key, target_key, relation_type, rule_name,
                          rule_version, rule_symmetric)
                     VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
                    params![source_key, target_key, relation_type, name, version, symmetric],
                )?;
            }
            Provenance::Approved => {
                // Reserve `X3`: there is **one** applicative way to create an
                // approved relation, and it is `approve`. This door is closed
                // whatever the state of the suggestion — including `approved`,
                // which previously let one suggestion justify a relation that
                // was not itself.
                let named = suggestion_key.unwrap_or("").trim();
                return Err(RelationError::SuggestionIsNotARelation(format!(
                    "an APPROVED relation is created only by approving a \
                     suggestion; `insert_established` cannot create one \
                     (suggestion named: `{named}`)"
                ))
                .into());
            }
        }
        Ok(self.connection.last_insert_rowid())
    }

    /// Endpoints and type, checked against the frozen model of §4.1.
    ///
    /// The type is not merely non-empty: it must be **one of the declared
    /// types**. A relation of an invented type would carry no meaning the
    /// interface could render, and the freeze names exactly two.
    fn validate_shape(
        source_key: &str,
        target_key: &str,
        relation_type: &str,
    ) -> Result<(), RelationError> {
        if source_key.trim().is_empty() || target_key.trim().is_empty() {
            return Err(RelationError::EmptyEndpoint(format!(
                "source=`{source_key}` target=`{target_key}`"
            )));
        }
        if relation_type.trim().is_empty() {
            return Err(RelationError::EmptyType(
                "an established relation must carry a type".into(),
            ));
        }
        if !RELATION_TYPES.contains(&relation_type) {
            return Err(RelationError::UnknownType(format!(
                "`{relation_type}` is not a declared relation type; TASK-0017 §4.2                  freezes {RELATION_TYPES:?}"
            )));
        }
        if source_key == target_key {
            return Err(RelationError::SelfLoop(source_key.to_string()));
        }
        Ok(())
    }

    /// Replays the derivation: the derived table is recomputed in full, in one
    /// transaction.
    ///
    /// Only the **derived** side is replaced. Approved relations and
    /// suggestions are never touched here — that separation is `R-C`, and it
    /// is what makes `J10` structural rather than careful.
    pub fn replace_derived(&mut self, derived: &[DerivedRelation]) -> Result<usize, MapError> {
        for relation in derived {
            Self::validate_shape(
                &relation.source_key,
                &relation.target_key,
                relation.relation_type,
            )?;
            if relation.rule.name.trim().is_empty() || relation.rule.version.trim().is_empty() {
                return Err(RelationError::MissingRule(format!(
                    "derived relation {} → {} has no versioned rule",
                    relation.source_key, relation.target_key
                ))
                .into());
            }
        }

        let transaction = self.connection.transaction()?;
        transaction.execute("DELETE FROM relations_deterministic", [])?;
        {
            let mut insert = transaction.prepare(
                "INSERT OR IGNORE INTO relations_deterministic
                     (source_key, target_key, relation_type, rule_name, rule_version,
                      rule_symmetric)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            )?;
            for relation in derived {
                insert.execute(params![
                    relation.source_key,
                    relation.target_key,
                    relation.relation_type,
                    relation.rule.name,
                    relation.rule.version,
                    relation.rule.symmetric,
                ])?;
            }
        }
        transaction.commit()?;
        Ok(derived.len())
    }

    /// Records a synthetic suggestion, once. Re-seeding never duplicates and
    /// never resets a state somebody decided.
    pub fn seed_suggestion(
        &self,
        suggestion_key: &str,
        source_key: &str,
        target_key: &str,
        relation_type: &str,
        basis: &str,
    ) -> Result<bool, MapError> {
        Self::validate_shape(source_key, target_key, relation_type)?;
        let inserted = self.connection.execute(
            "INSERT OR IGNORE INTO relation_suggestions
                 (suggestion_key, source_key, target_key, relation_type, basis,
                  state, created_unix_ms, decided_unix_ms)
             VALUES (?1, ?2, ?3, ?4, ?5, 'pending', ?6, NULL)",
            params![
                suggestion_key,
                source_key,
                target_key,
                relation_type,
                basis,
                now_ms()
            ],
        )?;
        Ok(inserted == 1)
    }

    /// The **one** path from suggestion to relation.
    ///
    /// One transaction: the suggestion's state flips first, then the approved
    /// row is written through the same front door every other write uses —
    /// which is precisely why that door demands an already-approved
    /// suggestion. Either both happen or neither does.
    pub fn approve(&mut self, suggestion_key: &str) -> Result<StoredRelation, MapError> {
        let suggestion = self
            .suggestion(suggestion_key)?
            .ok_or_else(|| RelationError::UnknownSuggestion(suggestion_key.to_string()))?;
        if suggestion.state != "pending" {
            return Err(RelationError::SuggestionAlreadyDecided(format!(
                "`{suggestion_key}` is already `{}`",
                suggestion.state
            ))
            .into());
        }

        let decided = now_ms();
        let transaction = self.connection.transaction()?;
        transaction.execute(
            "UPDATE relation_suggestions
                SET state = 'approved', decided_unix_ms = ?2
              WHERE suggestion_key = ?1 AND state = 'pending'",
            params![suggestion_key, decided],
        )?;
        // A plain INSERT, deliberately: `OR IGNORE` would turn a refused
        // write into a silent no-op, and `J4` forbids a silent pass. The
        // suggestion's state is flipped first, in the same transaction, which
        // is what lets the trigger above accept this row and no other.
        transaction.execute(
            "INSERT INTO relations_approved
                 (source_key, target_key, relation_type, suggestion_key, approved_unix_ms)
             VALUES (?1, ?2, ?3, ?4, ?5)",
            params![
                suggestion.source_key,
                suggestion.target_key,
                suggestion.relation_type,
                suggestion_key,
                decided
            ],
        )?;
        transaction.commit()?;

        self.approved()?
            .into_iter()
            .find(|relation| relation.suggestion_key.as_deref() == Some(suggestion_key))
            .ok_or_else(|| {
                MapError::from(RelationError::SuggestionIsNotARelation(format!(
                    "approval of `{suggestion_key}` produced no relation"
                )))
            })
    }

    // -- reads ---------------------------------------------------------------

    pub fn deterministic(&self) -> Result<Vec<StoredRelation>, MapError> {
        let mut statement = self.connection.prepare(
            "SELECT id, source_key, target_key, relation_type, rule_name, rule_version
               FROM relations_deterministic
              ORDER BY source_key, target_key, relation_type",
        )?;
        Ok(statement
            .query_map([], |row| {
                Ok(StoredRelation {
                    id: row.get(0)?,
                    provenance: Provenance::Deterministic,
                    source_key: row.get(1)?,
                    target_key: row.get(2)?,
                    relation_type: row.get(3)?,
                    rule_name: Some(row.get(4)?),
                    rule_version: Some(row.get(5)?),
                    suggestion_key: None,
                    approved_unix_ms: None,
                })
            })?
            .collect::<Result<Vec<_>, _>>()?)
    }

    pub fn approved(&self) -> Result<Vec<StoredRelation>, MapError> {
        let mut statement = self.connection.prepare(
            "SELECT id, source_key, target_key, relation_type, suggestion_key, approved_unix_ms
               FROM relations_approved
              ORDER BY source_key, target_key, relation_type",
        )?;
        Ok(statement
            .query_map([], |row| {
                Ok(StoredRelation {
                    id: row.get(0)?,
                    provenance: Provenance::Approved,
                    source_key: row.get(1)?,
                    target_key: row.get(2)?,
                    relation_type: row.get(3)?,
                    rule_name: None,
                    rule_version: None,
                    suggestion_key: Some(row.get(4)?),
                    approved_unix_ms: Some(row.get(5)?),
                })
            })?
            .collect::<Result<Vec<_>, _>>()?)
    }

    /// Every established relation, and **only** established ones.
    ///
    /// Suggestions are not read here, under any state. That is the single
    /// place `X1` could have been broken by convenience, so the union is
    /// spelled out rather than assembled from a generic query.
    pub fn established(&self) -> Result<Vec<StoredRelation>, MapError> {
        let mut all = self.deterministic()?;
        all.extend(self.approved()?);
        all.sort_by(|left, right| {
            (
                &left.source_key,
                &left.target_key,
                &left.relation_type,
                left.provenance.as_str(),
            )
                .cmp(&(
                    &right.source_key,
                    &right.target_key,
                    &right.relation_type,
                    right.provenance.as_str(),
                ))
        });
        Ok(all)
    }

    pub fn outgoing(&self, endpoint_key: &str) -> Result<Vec<StoredRelation>, MapError> {
        Ok(self
            .established()?
            .into_iter()
            .filter(|relation| relation.source_key == endpoint_key)
            .collect())
    }

    pub fn incoming(&self, endpoint_key: &str) -> Result<Vec<StoredRelation>, MapError> {
        Ok(self
            .established()?
            .into_iter()
            .filter(|relation| relation.target_key == endpoint_key)
            .collect())
    }

    pub fn suggestion(&self, key: &str) -> Result<Option<StoredSuggestion>, MapError> {
        let mut statement = self.connection.prepare(
            "SELECT suggestion_key, source_key, target_key, relation_type, basis,
                    state, created_unix_ms, decided_unix_ms
               FROM relation_suggestions WHERE suggestion_key = ?1",
        )?;
        Ok(statement
            .query_map([key], suggestion_from_row)?
            .next()
            .transpose()?)
    }

    pub fn suggestions(&self) -> Result<Vec<StoredSuggestion>, MapError> {
        let mut statement = self.connection.prepare(
            "SELECT suggestion_key, source_key, target_key, relation_type, basis,
                    state, created_unix_ms, decided_unix_ms
               FROM relation_suggestions ORDER BY suggestion_key",
        )?;
        Ok(statement
            .query_map([], suggestion_from_row)?
            .collect::<Result<Vec<_>, _>>()?)
    }

    pub fn pending_suggestions(&self) -> Result<Vec<StoredSuggestion>, MapError> {
        Ok(self
            .suggestions()?
            .into_iter()
            .filter(|suggestion| suggestion.state == "pending")
            .collect())
    }

    /// Digest of the derived side only — what a replay must reproduce exactly.
    pub fn deterministic_digest(&self) -> Result<String, MapError> {
        let mut accumulator = Vec::new();
        for relation in self.deterministic()? {
            accumulator.extend_from_slice(relation.source_key.as_bytes());
            accumulator.push(0);
            accumulator.extend_from_slice(relation.target_key.as_bytes());
            accumulator.push(0);
            accumulator.extend_from_slice(relation.relation_type.as_bytes());
            accumulator.push(0);
            accumulator.extend_from_slice(relation.rule_name.unwrap_or_default().as_bytes());
            accumulator.push(0);
            accumulator.extend_from_slice(relation.rule_version.unwrap_or_default().as_bytes());
            accumulator.push(0xff);
        }
        Ok(format!("fnv1a64:{:016x}", super::fnv1a64(&accumulator)))
    }
}

fn suggestion_from_row(row: &rusqlite::Row<'_>) -> rusqlite::Result<StoredSuggestion> {
    Ok(StoredSuggestion {
        suggestion_key: row.get(0)?,
        source_key: row.get(1)?,
        target_key: row.get(2)?,
        relation_type: row.get(3)?,
        basis: row.get(4)?,
        state: row.get(5)?,
        created_unix_ms: row.get(6)?,
        decided_unix_ms: row.get(7)?,
    })
}

// ---------------------------------------------------------------------------
// The frozen synthetic fixture — `TASK-0017` §4.6
// ---------------------------------------------------------------------------

/// One seeded suggestion of the frozen fixture.
#[derive(Debug, Clone, Copy)]
pub struct SeededSuggestion {
    pub key: &'static str,
    pub source_path: &'static str,
    pub target_path: &'static str,
    pub relation_type: &'static str,
    /// Whether the frozen starting state has this suggestion already approved.
    ///
    /// Even these go through `approve`: the seed inserts them **pending** and
    /// then approves them by the same path a click uses. No back door writes
    /// an approved row.
    pub approved_at_seed: bool,
}

pub const SEEDED_BASIS: &str = "fixture-synthetique-task-0017";

/// The eight suggestions of §4.6.2, in the frozen order.
pub const SEEDED_SUGGESTIONS: [SeededSuggestion; 8] = [
    SeededSuggestion {
        key: "S-001",
        source_path: "dossier-b/note-1.txt",
        target_path: "dossier-a/note-3.txt",
        relation_type: "reference",
        approved_at_seed: true,
    },
    SeededSuggestion {
        key: "S-002",
        source_path: "dossier-b/sous-dossier/note-2.txt",
        target_path: "dossier-a/note-1.txt",
        relation_type: "reference",
        approved_at_seed: true,
    },
    SeededSuggestion {
        key: "S-003",
        source_path: "racine-2.txt",
        target_path: "dossier-b/sous-dossier/note-1.txt",
        relation_type: "revision",
        approved_at_seed: true,
    },
    SeededSuggestion {
        key: "S-004",
        source_path: "dossier-a/note-3.txt",
        target_path: "racine-1.txt",
        relation_type: "reference",
        approved_at_seed: true,
    },
    SeededSuggestion {
        key: "S-005",
        source_path: "dossier-a/note-1.txt",
        target_path: "racine-2.txt",
        relation_type: "reference",
        approved_at_seed: false,
    },
    SeededSuggestion {
        key: "S-006",
        source_path: "dossier-b/sous-dossier/note-1.txt",
        target_path: "dossier-a/note-2.txt",
        relation_type: "revision",
        approved_at_seed: false,
    },
    SeededSuggestion {
        key: "S-007",
        source_path: "dossier-b/note-1.txt",
        target_path: "racine-1.txt",
        relation_type: "reference",
        approved_at_seed: false,
    },
    SeededSuggestion {
        key: "S-008",
        source_path: "dossier-a/note-3.txt",
        target_path: "dossier-b/sous-dossier/note-2.txt",
        relation_type: "reference",
        approved_at_seed: false,
    },
];

/// The independent expectation of §4.6.3: `(relative path, outgoing, incoming)`.
///
/// Written into the task sheet **before** any code, and copied here so `J5`
/// compares the store against a frozen table rather than against itself.
pub const EXPECTED_COUNTS: [(&str, usize, usize); 12] = [
    ("", 0, 0),
    ("dossier-a", 0, 0),
    ("dossier-a/note-1.txt", 3, 1),
    ("dossier-a/note-2.txt", 2, 1),
    ("dossier-a/note-3.txt", 1, 2),
    ("dossier-b", 0, 0),
    ("dossier-b/note-1.txt", 2, 1),
    ("dossier-b/sous-dossier", 0, 0),
    ("dossier-b/sous-dossier/note-1.txt", 1, 3),
    ("dossier-b/sous-dossier/note-2.txt", 1, 2),
    ("racine-1.txt", 1, 1),
    ("racine-2.txt", 1, 1),
];

/// The pairs of §4.6.3 that must **not** exist: every frozen relation, read
/// backwards. No inverse is ever inferred.
pub const FORBIDDEN_INVERSES: [(&str, &str); 8] = [
    ("dossier-b/note-1.txt", "dossier-a/note-1.txt"),
    ("dossier-b/sous-dossier/note-1.txt", "dossier-a/note-1.txt"),
    (
        "dossier-b/sous-dossier/note-1.txt",
        "dossier-b/note-1.txt",
    ),
    (
        "dossier-b/sous-dossier/note-2.txt",
        "dossier-a/note-2.txt",
    ),
    ("dossier-a/note-2.txt", "dossier-a/note-1.txt"),
    ("dossier-a/note-3.txt", "dossier-a/note-2.txt"),
    (
        "dossier-b/sous-dossier/note-2.txt",
        "dossier-b/sous-dossier/note-1.txt",
    ),
    ("racine-2.txt", "racine-1.txt"),
];

/// Seeds the frozen synthetic suggestions, and approves the four the fixture
/// declares approved — **through `approve`**, never by writing a row directly.
///
/// Idempotent: a second call inserts nothing and decides nothing.
pub fn seed_fixture(store: &mut RelationStore, fixture_id: &str) -> Result<usize, MapError> {
    let mut seeded = 0;
    for suggestion in SEEDED_SUGGESTIONS {
        let inserted = store.seed_suggestion(
            suggestion.key,
            &endpoint_key(fixture_id, suggestion.source_path),
            &endpoint_key(fixture_id, suggestion.target_path),
            suggestion.relation_type,
            SEEDED_BASIS,
        )?;
        if inserted {
            seeded += 1;
            if suggestion.approved_at_seed {
                store.approve(suggestion.key)?;
            }
        }
    }
    store.put_meta("seed_version", "task-0017-v1")?;
    Ok(seeded)
}

/// The five frozen invalid attempts of §4.6.4, replayed against a throwaway
/// store and reported with the motif each one actually produced.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RejectionOutcome {
    pub case: String,
    pub attempt: String,
    pub expected_motif: String,
    pub observed_motif: String,
    pub rejected: bool,
}

fn motif_of(error: &MapError) -> String {
    let rendered = error.to_string();
    rendered
        .split(':')
        .next()
        .unwrap_or(&rendered)
        .trim()
        .to_string()
}

/// Runs the five frozen attempts. **Nothing is asserted here** — every outcome
/// is reported, so a failure is publishable as a failure.
pub fn replay_rejections(fixture_id: &str) -> Result<Vec<RejectionOutcome>, MapError> {
    let store = RelationStore::open_temporary()?;
    // The pending suggestion `X-e` will try to smuggle in as a relation.
    let smuggled = SEEDED_SUGGESTIONS[4];
    store.seed_suggestion(
        smuggled.key,
        &endpoint_key(fixture_id, smuggled.source_path),
        &endpoint_key(fixture_id, smuggled.target_path),
        smuggled.relation_type,
        SEEDED_BASIS,
    )?;

    let key = |path: &str| endpoint_key(fixture_id, path);
    let mut outcomes = Vec::new();

    let attempts: [(&str, &str, &str, Box<dyn Fn(&RelationStore) -> Result<i64, MapError>>); 5] = [
        (
            "X-a",
            "A1 → B1, reference, provenance `suggested`",
            "relation_rejected_unknown_provenance",
            Box::new({
                let (source, target) = (key("dossier-a/note-1.txt"), key("dossier-b/note-1.txt"));
                move |store: &RelationStore| {
                    store.insert_established(
                        "suggested", &source, &target, "reference", None, None, None,
                    )
                }
            }),
        ),
        (
            "X-b",
            "A2 → A3, reference, provenance vide",
            "relation_rejected_unknown_provenance",
            Box::new({
                let (source, target) = (key("dossier-a/note-2.txt"), key("dossier-a/note-3.txt"));
                move |store: &RelationStore| {
                    store.insert_established("", &source, &target, "reference", None, None, None)
                }
            }),
        ),
        (
            "X-c",
            "A1 → A3, reference, DETERMINISTIC, rule_name vide",
            "relation_rejected_missing_rule",
            Box::new({
                let (source, target) = (key("dossier-a/note-1.txt"), key("dossier-a/note-3.txt"));
                move |store: &RelationStore| {
                    store.insert_established(
                        "DETERMINISTIC",
                        &source,
                        &target,
                        "reference",
                        Some(""),
                        Some("v1"),
                        None,
                    )
                }
            }),
        ),
        (
            "X-d",
            "A1 → A3, reference, DETERMINISTIC, rule_version vide",
            "relation_rejected_missing_rule",
            Box::new({
                let (source, target) = (key("dossier-a/note-1.txt"), key("dossier-a/note-3.txt"));
                move |store: &RelationStore| {
                    store.insert_established(
                        "DETERMINISTIC",
                        &source,
                        &target,
                        "reference",
                        Some("homonymes"),
                        Some(""),
                        None,
                    )
                }
            }),
        ),
        (
            "X-e",
            "insérer la suggestion S-005 telle quelle comme relation établie",
            "relation_rejected_suggestion_is_not_a_relation",
            Box::new({
                let (source, target) = (
                    key(smuggled.source_path),
                    key(smuggled.target_path),
                );
                move |store: &RelationStore| {
                    store.insert_established(
                        "APPROVED",
                        &source,
                        &target,
                        "reference",
                        None,
                        None,
                        Some("S-005"),
                    )
                }
            }),
        ),
    ];

    for (case, attempt, expected, run) in attempts {
        let observed = match run(&store) {
            Ok(_) => String::from("accepted"),
            Err(error) => motif_of(&error),
        };
        outcomes.push(RejectionOutcome {
            case: case.to_string(),
            attempt: attempt.to_string(),
            expected_motif: expected.to_string(),
            rejected: observed == expected,
            observed_motif: observed,
        });
    }

    // Whatever happened, nothing may have landed in the established tables.
    let leaked = store.established()?;
    if !leaked.is_empty() {
        outcomes.push(RejectionOutcome {
            case: "X-leak".to_string(),
            attempt: "aucune tentative invalide ne doit laisser de ligne établie".to_string(),
            expected_motif: "0 relation établie".to_string(),
            observed_motif: format!("{} relation(s) établie(s)", leaked.len()),
            rejected: false,
        });
    }
    Ok(outcomes)
}

impl RelationStore {
    /// An anonymous on-disk-free store, used to replay refusals without
    /// touching anything persistent.
    fn open_temporary() -> Result<Self, MapError> {
        let connection = Connection::open_in_memory()?;
        connection.execute_batch("PRAGMA foreign_keys=ON;")?;
        let store = Self { connection };
        store.initialize()?;
        Ok(store)
    }
}

/// The relative path an endpoint key names, when the key belongs to `fixture_id`.
///
/// The inverse of [`endpoint_key`], and deliberately strict: a key of another
/// brain returns `None` rather than a path that would then be compared against
/// the wrong tree.
pub fn relative_path_of<'a>(fixture_id: &str, key: &'a str) -> Option<&'a str> {
    key.strip_prefix(&format!("{ENDPOINT_KEY_SCHEME}|{fixture_id}|"))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::map::layout::Rect;

    fn node(id: i64, relative_path: &str, kind: NodeKind) -> MapNode {
        let name = relative_path
            .rsplit('/')
            .next()
            .unwrap_or(relative_path)
            .to_string();
        MapNode {
            id,
            parent_id: if relative_path.is_empty() { None } else { Some(1) },
            name,
            relative_path: relative_path.to_string(),
            kind,
            depth: relative_path.matches('/').count() as u32 + 1,
            size_bytes: 0,
            modified_unix_ms: None,
            child_count: 0,
            access_diagnostic: None,
            rect: Rect { x: 0.0, y: 0.0, w: 1.0, h: 1.0 },
        }
    }

    /// The `quasi-empty` tree of `TASK-0016`, as the index holds it.
    fn quasi_empty_nodes() -> Vec<MapNode> {
        use NodeKind::{Directory, File, Root};
        vec![
            node(1, "", Root),
            node(2, "dossier-a", Directory),
            node(3, "dossier-a/note-1.txt", File),
            node(4, "dossier-a/note-2.txt", File),
            node(5, "dossier-a/note-3.txt", File),
            node(6, "dossier-b", Directory),
            node(7, "dossier-b/note-1.txt", File),
            node(8, "dossier-b/sous-dossier", Directory),
            node(9, "dossier-b/sous-dossier/note-1.txt", File),
            node(10, "dossier-b/sous-dossier/note-2.txt", File),
            node(11, "racine-1.txt", File),
            node(12, "racine-2.txt", File),
        ]
    }

    fn seeded_store() -> RelationStore {
        let mut store = RelationStore::in_memory().expect("store");
        let derived = derive(RELATIONS_FIXTURE, &quasi_empty_nodes()).expect("derivation");
        store.replace_derived(&derived).expect("derived written");
        seed_fixture(&mut store, RELATIONS_FIXTURE).expect("seeded");
        store
    }

    fn key(path: &str) -> String {
        endpoint_key(RELATIONS_FIXTURE, path)
    }

    // -- J3 -----------------------------------------------------------------

    #[test]
    fn the_rules_produce_exactly_the_eight_frozen_relations() {
        let derived = derive(RELATIONS_FIXTURE, &quasi_empty_nodes()).expect("derivation");
        let rendered = derived
            .iter()
            .map(|relation| {
                format!(
                    "{}|{}→{}|{}",
                    relation.rule.name,
                    relation.source_key.rsplit('|').next().unwrap(),
                    relation.target_key.rsplit('|').next().unwrap(),
                    relation.relation_type
                )
            })
            .collect::<Vec<_>>();

        assert_eq!(
            rendered,
            vec![
                // `homonymes/v1` — D1, D2, D3, D4 of §4.6.1
                "homonymes|dossier-a/note-1.txt→dossier-b/note-1.txt|reference",
                "homonymes|dossier-a/note-1.txt→dossier-b/sous-dossier/note-1.txt|reference",
                "homonymes|dossier-a/note-2.txt→dossier-b/sous-dossier/note-2.txt|reference",
                "homonymes|dossier-b/note-1.txt→dossier-b/sous-dossier/note-1.txt|reference",
                // `suites-numerotees/v1` — D5, D6, D7, D8
                "suites-numerotees|dossier-a/note-1.txt→dossier-a/note-2.txt|revision",
                "suites-numerotees|dossier-a/note-2.txt→dossier-a/note-3.txt|revision",
                "suites-numerotees|dossier-b/sous-dossier/note-1.txt→dossier-b/sous-dossier/note-2.txt|revision",
                "suites-numerotees|racine-1.txt→racine-2.txt|revision",
            ]
        );
    }

    #[test]
    fn two_replays_produce_the_same_deterministic_set() {
        let mut store = seeded_store();
        let first = store.deterministic_digest().expect("digest");

        let derived = derive(RELATIONS_FIXTURE, &quasi_empty_nodes()).expect("derivation");
        store.replace_derived(&derived).expect("replayed");
        let second = store.deterministic_digest().expect("digest");

        assert_eq!(first, second, "J3: a replay must not diverge");
        assert_eq!(store.deterministic().expect("read").len(), 8);
    }

    #[test]
    fn every_deterministic_relation_carries_a_versioned_rule() {
        let store = seeded_store();
        for relation in store.deterministic().expect("read") {
            assert!(
                relation.rule_name.as_deref().is_some_and(|n| !n.is_empty()),
                "J3: {relation:?} has no rule name"
            );
            assert!(
                relation.rule_version.as_deref().is_some_and(|v| !v.is_empty()),
                "J3: {relation:?} has no rule version"
            );
        }
    }

    #[test]
    fn an_unversioned_rule_is_rejected() {
        let store = RelationStore::in_memory().expect("store");
        let error = store
            .insert_established(
                "DETERMINISTIC",
                &key("dossier-a/note-1.txt"),
                &key("dossier-a/note-3.txt"),
                "reference",
                Some("homonymes"),
                Some(""),
                None,
            )
            .expect_err("J3: an unversioned rule must be refused");
        assert!(error.to_string().starts_with("relation_rejected_missing_rule"));
    }

    // -- J1 -----------------------------------------------------------------

    #[test]
    fn provenance_accepts_exactly_two_values() {
        assert_eq!(Provenance::parse("DETERMINISTIC"), Ok(Provenance::Deterministic));
        assert_eq!(Provenance::parse("APPROVED"), Ok(Provenance::Approved));
        for refused in ["suggested", "", "SUGGESTED", "deterministic", "heuristic", "user"] {
            assert!(
                matches!(
                    Provenance::parse(refused),
                    Err(RelationError::UnknownProvenance(_))
                ),
                "J1: `{refused}` must not be a provenance"
            );
        }
    }

    #[test]
    fn an_established_relation_without_endpoints_or_type_is_rejected() {
        let store = RelationStore::in_memory().expect("store");
        let source = key("dossier-a/note-1.txt");
        let target = key("dossier-b/note-1.txt");

        for (label, result) in [
            (
                "empty source",
                store.insert_established(
                    "DETERMINISTIC", "", &target, "reference", Some("homonymes"), Some("v1"), None,
                ),
            ),
            (
                "empty target",
                store.insert_established(
                    "DETERMINISTIC", &source, "", "reference", Some("homonymes"), Some("v1"), None,
                ),
            ),
            (
                "empty type",
                store.insert_established(
                    "DETERMINISTIC", &source, &target, "", Some("homonymes"), Some("v1"), None,
                ),
            ),
            (
                "self loop",
                store.insert_established(
                    "DETERMINISTIC", &source, &source, "reference", Some("homonymes"), Some("v1"),
                    None,
                ),
            ),
        ] {
            assert!(result.is_err(), "J1: `{label}` must be refused");
        }
        assert!(store.established().expect("read").is_empty());
    }

    #[test]
    fn the_five_frozen_invalid_attempts_are_all_rejected() {
        let outcomes = replay_rejections(RELATIONS_FIXTURE).expect("replay");
        assert_eq!(outcomes.len(), 5, "no leak entry expected");
        for outcome in outcomes {
            assert!(
                outcome.rejected,
                "J1/J2/J3: {} expected `{}`, observed `{}`",
                outcome.case, outcome.expected_motif, outcome.observed_motif
            );
        }
    }

    // -- J2 -----------------------------------------------------------------

    #[test]
    fn a_pending_suggestion_never_reaches_an_established_read() {
        let store = seeded_store();
        let established = store.established().expect("read");
        let pending = store.pending_suggestions().expect("read");
        assert_eq!(pending.len(), 4, "four pending suggestions are frozen");

        for suggestion in &pending {
            assert!(
                !established.iter().any(|relation| {
                    relation.source_key == suggestion.source_key
                        && relation.target_key == suggestion.target_key
                        && relation.relation_type == suggestion.relation_type
                }),
                "J2: pending suggestion {} appears among established relations",
                suggestion.suggestion_key
            );
        }
        assert_eq!(established.len(), 12);
    }

    #[test]
    fn a_pending_suggestion_cannot_be_written_as_a_relation() {
        let store = seeded_store();
        let pending = &store.pending_suggestions().expect("read")[0];
        let error = store
            .insert_established(
                "APPROVED",
                &pending.source_key,
                &pending.target_key,
                &pending.relation_type,
                None,
                None,
                Some(&pending.suggestion_key),
            )
            .expect_err("J2: a pending suggestion must not become a relation");
        assert!(
            error
                .to_string()
                .starts_with("relation_rejected_suggestion_is_not_a_relation"),
            "unexpected motif: {error}"
        );
    }

    #[test]
    fn an_approved_relation_never_claims_a_rule() {
        let store = seeded_store();
        for relation in store.approved().expect("read") {
            assert!(relation.rule_name.is_none());
            assert!(relation.rule_version.is_none());
            assert!(relation.suggestion_key.is_some());
        }
    }

    // -- J4 -----------------------------------------------------------------

    #[test]
    fn approving_a_suggestion_produces_exactly_one_relation_and_moves_its_state() {
        let mut store = seeded_store();
        let before = store.established().expect("read").len();
        let target = "S-005";

        let suggestion = store.suggestion(target).expect("read").expect("present");
        let created = store.approve(target).expect("approval");
        assert_eq!(created.provenance, Provenance::Approved);
        assert_eq!(created.suggestion_key.as_deref(), Some(target));
        // `X3`: the relation created is the suggestion itself, endpoint for
        // endpoint — not merely *a* relation carrying its key.
        assert_eq!(created.source_key, suggestion.source_key);
        assert_eq!(created.target_key, suggestion.target_key);
        assert_eq!(created.relation_type, suggestion.relation_type);

        let after = store.established().expect("read");
        assert_eq!(after.len(), before + 1, "J4: exactly one relation is created");
        assert_eq!(
            store.suggestion(target).expect("read").expect("present").state,
            "approved"
        );
        assert_eq!(store.pending_suggestions().expect("read").len(), 3);
    }


    // -- X3 : la creation d'une relation APPROVED, verrouillee ---------------

    /// The defect `X3` named: an **already approved** suggestion used as a
    /// justification for a direct write. The door is closed whatever the state.
    #[test]
    fn an_already_approved_suggestion_cannot_justify_a_direct_write() {
        let mut store = seeded_store();
        // `S-001` is approved by the frozen fixture.
        assert_eq!(
            store.suggestion("S-001").expect("read").expect("present").state,
            "approved"
        );
        let before = store.approved().expect("read").len();

        let error = store
            .insert_established(
                "APPROVED",
                &key("dossier-a/note-1.txt"),
                &key("racine-1.txt"),
                "reference",
                None,
                None,
                Some("S-001"),
            )
            .expect_err("X3: an approved suggestion must not justify another relation");
        assert!(
            error
                .to_string()
                .starts_with("relation_rejected_suggestion_is_not_a_relation"),
            "unexpected motif: {error}"
        );
        assert_eq!(store.approved().expect("read").len(), before);

        // And the one applicative path still works, so the door was closed
        // rather than the feature removed.
        store.approve("S-005").expect("approval");
        assert_eq!(store.approved().expect("read").len(), before + 1);
    }

    /// `insert_established` refuses `APPROVED` unconditionally — pending,
    /// approved, unknown, or unnamed.
    #[test]
    fn insert_established_can_never_create_an_approved_relation() {
        let store = seeded_store();
        for suggestion_key in [Some("S-001"), Some("S-005"), Some("S-inconnue"), None] {
            let error = store
                .insert_established(
                    "APPROVED",
                    &key("dossier-a/note-1.txt"),
                    &key("racine-1.txt"),
                    "reference",
                    None,
                    None,
                    suggestion_key,
                )
                .expect_err("X3: no APPROVED relation through this door");
            assert!(
                error
                    .to_string()
                    .starts_with("relation_rejected_suggestion_is_not_a_relation"),
                "unexpected motif for {suggestion_key:?}: {error}"
            );
        }
        assert_eq!(store.approved().expect("read").len(), 4);
    }

    /// The same guarantee, **at the storage layer**: a row whose endpoints or
    /// type differ from its suggestion is refused by the database itself.
    #[test]
    fn the_storage_refuses_a_relation_that_is_not_its_suggestion() {
        let store = seeded_store();
        let suggestion = store.suggestion("S-001").expect("read").expect("present");

        for (label, source, target, relation_type) in [
            (
                "another target",
                suggestion.source_key.clone(),
                key("racine-1.txt"),
                suggestion.relation_type.clone(),
            ),
            (
                "another source",
                key("racine-2.txt"),
                suggestion.target_key.clone(),
                suggestion.relation_type.clone(),
            ),
            (
                "another type",
                suggestion.source_key.clone(),
                suggestion.target_key.clone(),
                "revision".to_string(),
            ),
        ] {
            let error = store
                .raw_insert_approved(&source, &target, &relation_type, "S-001")
                .unwrap_err();
            assert!(
                error
                    .to_string()
                    .contains("relation_rejected_suggestion_is_not_a_relation"),
                "X3, {label}: unexpected motif: {error}"
            );
        }
        assert_eq!(store.approved().expect("read").len(), 4);
    }

    /// A pending suggestion cannot be written straight into the approved table
    /// either — the trigger requires the state, not just the key.
    #[test]
    fn the_storage_refuses_a_pending_suggestion() {
        let store = seeded_store();
        let pending = store.suggestion("S-005").expect("read").expect("present");
        let error = store
            .raw_insert_approved(
                &pending.source_key,
                &pending.target_key,
                &pending.relation_type,
                "S-005",
            )
            .unwrap_err();
        assert!(
            error
                .to_string()
                .contains("relation_rejected_suggestion_is_not_a_relation"),
            "unexpected motif: {error}"
        );
    }

    /// An approved relation naming a suggestion that does not exist is refused
    /// by the foreign key **and** by the trigger.
    #[test]
    fn an_approved_relation_cannot_exist_without_its_suggestion() {
        let store = seeded_store();
        let error = store
            .raw_insert_approved(
                &key("dossier-a/note-1.txt"),
                &key("racine-1.txt"),
                "reference",
                "S-fantome",
            )
            .unwrap_err();
        assert!(error.to_string().contains("relation_rejected") || error.to_string().contains("FOREIGN KEY"),
            "unexpected motif: {error}");
        assert_eq!(store.approved().expect("read").len(), 4);
    }

    /// `J4` — **exactly one**: `suggestion_key` is unique, so a second row for
    /// the same suggestion is impossible even bypassing every Rust guard.
    #[test]
    fn one_suggestion_can_never_carry_two_approved_relations() {
        let store = seeded_store();
        let suggestion = store.suggestion("S-002").expect("read").expect("present");
        let error = store
            .raw_insert_approved(
                &suggestion.source_key,
                &suggestion.target_key,
                &suggestion.relation_type,
                "S-002",
            )
            .unwrap_err();
        assert!(
            error.to_string().to_lowercase().contains("unique"),
            "unexpected motif: {error}"
        );
        assert_eq!(
            store
                .approved()
                .expect("read")
                .iter()
                .filter(|relation| relation.suggestion_key.as_deref() == Some("S-002"))
                .count(),
            1
        );
    }

    /// The correspondence is protected from the other side too: a suggestion
    /// already carrying a relation cannot have its endpoints rewritten.
    #[test]
    fn an_approved_suggestion_cannot_drift_away_from_its_relation() {
        let store = seeded_store();
        let error = store
            .connection
            .execute(
                "UPDATE relation_suggestions SET target_key = ?2 WHERE suggestion_key = ?1",
                params!["S-001", key("racine-1.txt")],
            )
            .unwrap_err();
        assert!(
            error
                .to_string()
                .contains("relation_rejected_suggestion_is_not_a_relation"),
            "unexpected motif: {error}"
        );
    }

    /// The migration of reserve `X3`, on a store written by version 1.
    ///
    /// The mismatched row is the defect itself: it is **not** carried over, and
    /// it is **named** in the metadata rather than dropped in silence.
    #[test]
    fn migrating_a_version_1_store_drops_the_mismatched_row_and_names_it() {
        let connection = Connection::open_in_memory().expect("connection");
        connection.execute_batch("PRAGMA foreign_keys=ON;").expect("pragma");
        // The version 1 shape, verbatim: no UNIQUE on `suggestion_key`, no
        // foreign key, no trigger.
        connection
            .execute_batch(
                "CREATE TABLE relation_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
                 CREATE TABLE relation_suggestions (
                     suggestion_key TEXT PRIMARY KEY,
                     source_key TEXT NOT NULL,
                     target_key TEXT NOT NULL,
                     relation_type TEXT NOT NULL,
                     basis TEXT NOT NULL,
                     state TEXT NOT NULL,
                     created_unix_ms INTEGER NOT NULL,
                     decided_unix_ms INTEGER);
                 CREATE TABLE relations_approved (
                     id INTEGER PRIMARY KEY AUTOINCREMENT,
                     source_key TEXT NOT NULL,
                     target_key TEXT NOT NULL,
                     relation_type TEXT NOT NULL,
                     suggestion_key TEXT NOT NULL,
                     approved_unix_ms INTEGER NOT NULL,
                     UNIQUE(source_key, target_key, relation_type));
                 PRAGMA user_version=1;",
            )
            .expect("v1 schema");
        connection
            .execute_batch(&format!(
                "INSERT INTO relation_suggestions VALUES
                     ('S-001', '{a1}', '{b1}', 'reference', 'synthetique', 'approved', 1, 2);
                 INSERT INTO relations_approved
                     (source_key, target_key, relation_type, suggestion_key, approved_unix_ms)
                 VALUES ('{a1}', '{b1}', 'reference', 'S-001', 2),
                        ('{a1}', '{r1}', 'reference', 'S-001', 2);",
                a1 = key("dossier-a/note-1.txt"),
                b1 = key("dossier-b/note-1.txt"),
                r1 = key("racine-1.txt"),
            ))
            .expect("v1 rows");

        let store = RelationStore { connection };
        store.initialize().expect("migration");

        let approved = store.approved().expect("read");
        assert_eq!(approved.len(), 1, "the mismatched row must not survive");
        assert_eq!(approved[0].suggestion_key.as_deref(), Some("S-001"));
        assert_eq!(approved[0].target_key, key("dossier-b/note-1.txt"));
        assert_eq!(store.user_version().expect("version"), 2);
        assert_eq!(
            store
                .connection
                .query_row(
                    "SELECT value FROM relation_meta WHERE key = 'migration_v2_discarded'",
                    [],
                    |row| row.get::<_, String>(0)
                )
                .expect("the discarded row must be named"),
            "S-001"
        );

        // And the migrated store now refuses what version 1 accepted.
        assert!(
            store
                .raw_insert_approved(
                    &key("dossier-a/note-1.txt"),
                    &key("racine-1.txt"),
                    "reference",
                    "S-001",
                )
                .is_err()
        );
    }

    /// A store already at version 2 migrates nothing and loses nothing.
    #[test]
    fn reopening_a_version_2_store_is_a_no_operation() {
        let store = seeded_store();
        let before = store.established().expect("read").len();
        store.initialize().expect("re-initialise");
        assert_eq!(store.established().expect("read").len(), before);
        assert_eq!(store.user_version().expect("version"), 2);
        assert!(
            store
                .connection
                .query_row(
                    "SELECT value FROM relation_meta WHERE key = 'migration_v2_discarded'",
                    [],
                    |row| row.get::<_, String>(0)
                )
                .optional()
                .expect("query")
                .is_none(),
            "nothing was discarded, so nothing is named"
        );
    }

    #[test]
    fn a_suggestion_left_alone_changes_nothing() {
        let store = seeded_store();
        let before = store.established().expect("read");
        let again = store.established().expect("read");
        assert_eq!(before, again);
        assert_eq!(before.len(), 12, "J4: no silent promotion");
    }

    #[test]
    fn approving_twice_is_refused_rather_than_duplicated() {
        let mut store = seeded_store();
        store.approve("S-006").expect("first approval");
        let error = store.approve("S-006").expect_err("J4: no second approval");
        assert!(
            error
                .to_string()
                .starts_with("relation_rejected_suggestion_already_decided"),
            "unexpected motif: {error}"
        );
        assert_eq!(store.established().expect("read").len(), 13);
    }

    #[test]
    fn seeding_twice_seeds_nothing_new() {
        let mut store = seeded_store();
        let seeded_again = seed_fixture(&mut store, RELATIONS_FIXTURE).expect("re-seed");
        assert_eq!(seeded_again, 0);
        assert_eq!(store.suggestions().expect("read").len(), 8);
        assert_eq!(store.established().expect("read").len(), 12);
    }

    // -- J5 -----------------------------------------------------------------

    #[test]
    fn incoming_and_outgoing_match_the_frozen_expectation_node_by_node() {
        let store = seeded_store();
        for (path, expected_out, expected_in) in EXPECTED_COUNTS {
            let endpoint = key(path);
            let outgoing = store.outgoing(&endpoint).expect("read");
            let incoming = store.incoming(&endpoint).expect("read");
            assert_eq!(
                outgoing.len(),
                expected_out,
                "J5: outgoing count for `{path}`"
            );
            assert_eq!(
                incoming.len(),
                expected_in,
                "J5: incoming count for `{path}`"
            );
            for relation in &outgoing {
                assert_eq!(relation.source_key, endpoint);
            }
            for relation in &incoming {
                assert_eq!(relation.target_key, endpoint);
            }
        }

        let total_out: usize = EXPECTED_COUNTS.iter().map(|entry| entry.1).sum();
        let total_in: usize = EXPECTED_COUNTS.iter().map(|entry| entry.2).sum();
        assert_eq!(total_out, 12);
        assert_eq!(total_in, 12);
        assert_eq!(store.established().expect("read").len(), 12);
    }

    #[test]
    fn no_inverse_relation_is_ever_invented() {
        let store = seeded_store();
        let established = store.established().expect("read");
        for (source_path, target_path) in FORBIDDEN_INVERSES {
            let (source, target) = (key(source_path), key(target_path));
            assert!(
                !established
                    .iter()
                    .any(|relation| relation.source_key == source && relation.target_key == target),
                "J5: the inverse {source_path} → {target_path} was invented"
            );
        }
        for rule in RULES {
            assert!(!rule.symmetric, "no rule of this slice is symmetric");
        }
    }

    #[test]
    fn an_unknown_relation_type_is_rejected() {
        let store = RelationStore::in_memory().expect("store");
        let error = store
            .insert_established(
                "DETERMINISTIC",
                &key("dossier-a/note-1.txt"),
                &key("dossier-b/note-1.txt"),
                "lien-invente",
                Some("homonymes"),
                Some("v1"),
                None,
            )
            .expect_err("J1: an undeclared type must be refused");
        assert!(
            error.to_string().starts_with("relation_rejected_unknown_type"),
            "unexpected motif: {error}"
        );
        assert!(store.established().expect("read").is_empty());
    }

    // -- J10 ----------------------------------------------------------------

    /// Identity of a relation, with the surrogate row id left out.
    ///
    /// A replay rewrites the derived table, so `AUTOINCREMENT` hands out fresh
    /// ids. Those ids are storage bookkeeping, not the relation: what must not
    /// diverge is the endpoints, the type, the provenance and the rule.
    fn identity(relations: &[StoredRelation]) -> Vec<String> {
        relations
            .iter()
            .map(|relation| {
                format!(
                    "{}|{}→{}|{}|{}/{}",
                    relation.provenance.as_str(),
                    relation.source_key,
                    relation.target_key,
                    relation.relation_type,
                    relation.rule_name.clone().unwrap_or_default(),
                    relation.rule_version.clone().unwrap_or_default(),
                )
            })
            .collect()
    }

    #[test]
    fn endpoint_keys_survive_a_renumbering_of_the_index() {
        let mut store = seeded_store();
        store.approve("S-007").expect("approval");
        let before = identity(&store.established().expect("read"));
        let suggestions_before = store.suggestions().expect("read");

        // A rebuild renumbers every `map_nodes` row. Endpoint keys are derived
        // from the relative path, so nothing here moves.
        let renumbered = quasi_empty_nodes()
            .into_iter()
            .map(|mut node| {
                node.id += 1_000;
                node
            })
            .collect::<Vec<_>>();
        let derived = derive(RELATIONS_FIXTURE, &renumbered).expect("derivation");
        store.replace_derived(&derived).expect("replayed");

        assert_eq!(identity(&store.established().expect("read")), before);
        assert_eq!(store.suggestions().expect("read"), suggestions_before);

        let resolved = renumbered
            .iter()
            .map(|node| endpoint_key(RELATIONS_FIXTURE, &node.relative_path))
            .collect::<std::collections::BTreeSet<_>>();
        for relation in store.established().expect("read") {
            assert!(resolved.contains(&relation.source_key));
            assert!(resolved.contains(&relation.target_key));
        }
    }

    #[test]
    fn endpoint_keys_are_scoped_to_their_brain() {
        assert_ne!(
            endpoint_key("quasi-empty", "dossier-a/note-1.txt"),
            endpoint_key("deep", "dossier-a/note-1.txt")
        );
        let store = seeded_store();
        assert!(
            store
                .outgoing(&endpoint_key("deep", "dossier-a/note-1.txt"))
                .expect("read")
                .is_empty(),
            "relations of one brain never answer for another"
        );
    }

    #[test]
    fn the_relative_path_of_a_key_is_recovered_only_within_its_own_brain() {
        let key = endpoint_key("quasi-empty", "dossier-a/note-1.txt");
        assert_eq!(relative_path_of("quasi-empty", &key), Some("dossier-a/note-1.txt"));
        assert_eq!(relative_path_of("deep", &key), None);
        assert_eq!(
            relative_path_of("quasi-empty", &endpoint_key("quasi-empty", "")),
            Some("")
        );
    }

    #[test]
    fn the_root_has_an_endpoint_key_of_its_own() {
        assert_eq!(endpoint_key("quasi-empty", ""), "ek1|quasi-empty|");
    }

    // -- the rule engine, on invented nodes ---------------------------------

    #[test]
    fn homonyms_in_the_same_directory_are_impossible_and_never_paired() {
        // Same name, same parent cannot exist on a file system; the rule
        // filters on it anyway, so a malformed index cannot produce a pair.
        let nodes = vec![
            node(1, "", NodeKind::Root),
            node(2, "a.txt", NodeKind::File),
            node(3, "a.txt", NodeKind::File),
        ];
        let derived = derive("t", &nodes).expect("derivation");
        assert!(derived.is_empty());
    }

    #[test]
    fn a_numbered_series_links_only_consecutive_members() {
        let nodes = vec![
            node(1, "", NodeKind::Root),
            node(2, "piece-01.txt", NodeKind::File),
            node(3, "piece-02.txt", NodeKind::File),
            node(4, "piece-09.txt", NodeKind::File),
        ];
        let derived = derive("t", &nodes).expect("derivation");
        assert_eq!(derived.len(), 1);
        assert!(derived[0].source_key.ends_with("piece-01.txt"));
        assert!(derived[0].target_key.ends_with("piece-02.txt"));
    }

    #[test]
    fn directories_are_never_endpoints_of_a_derived_relation() {
        let nodes = vec![
            node(1, "", NodeKind::Root),
            node(2, "a", NodeKind::Directory),
            node(3, "b", NodeKind::Directory),
            node(4, "a/note-1.txt", NodeKind::File),
        ];
        let derived = derive("t", &nodes).expect("derivation");
        assert!(derived.is_empty());
    }

    #[test]
    fn numbered_name_splits_the_way_the_rule_expects() {
        assert_eq!(numbered_name("note-1.txt"), Some(("note-", 1, ".txt")));
        assert_eq!(numbered_name("piece-09.txt"), Some(("piece-", 9, ".txt")));
        assert_eq!(numbered_name("racine-2.txt"), Some(("racine-", 2, ".txt")));
        assert_eq!(numbered_name("lisezmoi.txt"), None);
        assert_eq!(numbered_name("12"), Some(("", 12, "")));
    }
}
