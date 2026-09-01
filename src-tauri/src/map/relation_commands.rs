//! What the relations view calls, and the resolution behind it.
//!
//! The store speaks in **endpoint keys**, which survive a rebuild; the map
//! speaks in **node ids**, which do not. This file is the one place the two
//! meet, so an unresolved endpoint is reported rather than silently dropped —
//! `J10` needs the difference to be visible.

use super::relations::{
    EXPECTED_COUNTS, FORBIDDEN_INVERSES, RELATIONS_FIXTURE,
    RELATIONS_SCHEMA_VERSION, RelationError, RelationStore, RejectionOutcome, SEEDED_SUGGESTIONS,
    StoredRelation, StoredSuggestion, endpoint_key,
};
use super::sandbox::SandboxPaths;
use super::store::MapNode;
use super::{MapError, commands, fixtures};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// One end of a relation, resolved against the current index when possible.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RelationEndpoint {
    pub key: String,
    /// `None` when the key names something the current index does not hold.
    /// Reported, never hidden: an orphan endpoint is a finding.
    pub node_id: Option<i64>,
    pub name: String,
    pub relative_path: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RelationEdge {
    pub id: i64,
    /// `DETERMINISTIC` or `APPROVED`. There is no third value, here or anywhere.
    pub provenance: String,
    pub relation_type: String,
    pub source: RelationEndpoint,
    pub target: RelationEndpoint,
    /// Present exactly when the provenance is `DETERMINISTIC` — `J6` requires
    /// the rule to be consultable.
    pub rule_name: Option<String>,
    pub rule_version: Option<String>,
    pub suggestion_key: Option<String>,
}

/// A suggestion, carried as its own kind of object all the way to the screen.
///
/// It is deliberately **not** a `RelationEdge` with a different label: the two
/// never share a type, so no rendering path can mistake one for the other.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SuggestionEdge {
    pub suggestion_key: String,
    pub relation_type: String,
    pub source: RelationEndpoint,
    pub target: RelationEndpoint,
    pub state: String,
    pub basis: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RelationRuleInfo {
    pub name: String,
    pub version: String,
    pub relation_type: String,
    pub symmetric: bool,
    pub produced: usize,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RelationsOverview {
    pub fixture_id: String,
    pub schema_version: i64,
    pub endpoint_key_scheme: String,
    /// `false` when the fixture is outside the frozen scope of `TASK-0017`;
    /// the interface says so in words instead of showing an empty panel.
    pub in_scope: bool,
    pub established: Vec<RelationEdge>,
    /// **Pending only.** An approved suggestion has already become a relation
    /// and must not be drawn twice.
    pub pending_suggestions: Vec<SuggestionEdge>,
    pub deterministic_count: usize,
    pub approved_count: usize,
    pub pending_suggestion_count: usize,
    pub rules: Vec<RelationRuleInfo>,
    /// Endpoint keys the current index cannot resolve. Must stay empty.
    pub unresolved_endpoints: Vec<String>,
    pub deterministic_digest: String,
    pub seeded: usize,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NodeRelationEntry {
    /// `outgoing` or `incoming`, never inferred from the other.
    pub direction: String,
    pub provenance: String,
    pub relation_type: String,
    pub other: RelationEndpoint,
    pub rule_name: Option<String>,
    pub rule_version: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NodeRelations {
    pub fixture_id: String,
    pub node_id: i64,
    pub endpoint_key: String,
    pub relative_path: String,
    pub outgoing: Vec<NodeRelationEntry>,
    pub incoming: Vec<NodeRelationEntry>,
    pub outgoing_count: usize,
    pub incoming_count: usize,
    /// Pending suggestions touching this node, in either direction. **Never**
    /// counted in `outgoing_count` or `incoming_count`.
    pub suggestions: Vec<SuggestionEdge>,
}

/// What the frozen expectation of §4.6.3 says, beside what the store returns.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CountComparison {
    pub relative_path: String,
    pub expected_outgoing: usize,
    pub observed_outgoing: usize,
    pub expected_incoming: usize,
    pub observed_incoming: usize,
    pub matches: bool,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RelationsSelfCheck {
    pub fixture_id: String,
    pub established_total: usize,
    pub deterministic_total: usize,
    pub approved_total: usize,
    pub pending_suggestion_total: usize,
    /// `J1`, `J2`, `J3` — the five frozen invalid attempts and their motifs.
    pub rejections: Vec<RejectionOutcome>,
    pub all_rejected: bool,
    /// `J3` — two replays of the derivation, digested.
    pub replay_digest_first: String,
    pub replay_digest_second: String,
    pub replay_stable: bool,
    /// `J5` — the frozen table, adjusted for approvals, against the store.
    pub counts: Vec<CountComparison>,
    pub counts_agree: bool,
    /// Suggestions approved **since the seed**, each adding exactly one edge to
    /// the frozen expectation. Listed so the adjustment is auditable rather
    /// than invisible.
    pub approved_since_seed: Vec<String>,
    /// `J5` — inverses that were invented. Must stay empty.
    pub invented_inverses: Vec<String>,
    /// `J2` — pending suggestions that leaked into an established read.
    pub suggestions_in_established: Vec<String>,
    /// `J10` — endpoint keys the current index cannot resolve.
    pub unresolved_endpoints: Vec<String>,
}

fn endpoint_of(
    key: &str,
    by_key: &HashMap<String, &MapNode>,
    unresolved: &mut Vec<String>,
) -> RelationEndpoint {
    match by_key.get(key) {
        Some(node) => RelationEndpoint {
            key: key.to_string(),
            node_id: Some(node.id),
            name: node.name.clone(),
            relative_path: node.relative_path.clone(),
        },
        None => {
            if !unresolved.iter().any(|existing| existing == key) {
                unresolved.push(key.to_string());
            }
            RelationEndpoint {
                key: key.to_string(),
                node_id: None,
                // Falls back to the key's own path segment rather than to an
                // empty string: an orphan endpoint stays nameable on screen.
                name: key.rsplit('|').next().unwrap_or(key).to_string(),
                relative_path: key.rsplit('|').next().unwrap_or("").to_string(),
            }
        }
    }
}

fn edge_of(
    relation: &StoredRelation,
    by_key: &HashMap<String, &MapNode>,
    unresolved: &mut Vec<String>,
) -> RelationEdge {
    RelationEdge {
        id: relation.id,
        provenance: relation.provenance.as_str().to_string(),
        relation_type: relation.relation_type.clone(),
        source: endpoint_of(&relation.source_key, by_key, unresolved),
        target: endpoint_of(&relation.target_key, by_key, unresolved),
        rule_name: relation.rule_name.clone(),
        rule_version: relation.rule_version.clone(),
        suggestion_key: relation.suggestion_key.clone(),
    }
}

fn suggestion_of(
    suggestion: &StoredSuggestion,
    by_key: &HashMap<String, &MapNode>,
    unresolved: &mut Vec<String>,
) -> SuggestionEdge {
    SuggestionEdge {
        suggestion_key: suggestion.suggestion_key.clone(),
        relation_type: suggestion.relation_type.clone(),
        source: endpoint_of(&suggestion.source_key, by_key, unresolved),
        target: endpoint_of(&suggestion.target_key, by_key, unresolved),
        state: suggestion.state.clone(),
        basis: suggestion.basis.clone(),
    }
}

fn index_by_key<'a>(fixture_id: &str, nodes: &'a [MapNode]) -> HashMap<String, &'a MapNode> {
    nodes
        .iter()
        .map(|node| (endpoint_key(fixture_id, &node.relative_path), node))
        .collect()
}

/// Refuses a fixture outside the frozen relations scope, in words.
fn ensure_in_scope(fixture_id: &str) -> Result<(), MapError> {
    fixtures::spec(fixture_id)?;
    if fixture_id != RELATIONS_FIXTURE {
        return Err(RelationError::OutOfScopeFixture(format!(
            "`{fixture_id}` carries no relations: TASK-0017 §4.6 freezes \
             `{RELATIONS_FIXTURE}` as the relations brain of this slice"
        ))
        .into());
    }
    Ok(())
}

/// Opens the relations of a brain: replays the derivation from the current
/// index, seeds the frozen synthetic suggestions once, and reads everything
/// back resolved against the map.
///
/// The derivation is replayed on **every** open, deliberately: it is derived
/// data, and `R-C` keeps it on its own side precisely so that recomputing it
/// costs nothing to the approved relations and the suggestions, which are
/// never touched here.
pub fn open_relations(
    paths: &SandboxPaths,
    fixture_id: &str,
) -> Result<RelationsOverview, MapError> {
    ensure_in_scope(fixture_id)?;
    let snapshot = commands::snapshot(paths, fixture_id)?;
    let mut store = RelationStore::open(&paths.relations_database(fixture_id))?;

    let derived = super::relations::derive(fixture_id, &snapshot.nodes)?;
    store.replace_derived(&derived)?;
    let seeded = super::relations::seed_fixture(&mut store, fixture_id)?;

    overview(&store, fixture_id, &snapshot.nodes, seeded)
}

fn overview(
    store: &RelationStore,
    fixture_id: &str,
    nodes: &[MapNode],
    seeded: usize,
) -> Result<RelationsOverview, MapError> {
    let by_key = index_by_key(fixture_id, nodes);
    let mut unresolved = Vec::new();

    let established = store.established()?;
    let edges = established
        .iter()
        .map(|relation| edge_of(relation, &by_key, &mut unresolved))
        .collect::<Vec<_>>();
    let pending = store
        .pending_suggestions()?
        .iter()
        .map(|suggestion| suggestion_of(suggestion, &by_key, &mut unresolved))
        .collect::<Vec<_>>();

    let deterministic = store.deterministic()?;
    let rules = super::relations::RULES
        .iter()
        .map(|rule| RelationRuleInfo {
            name: rule.name.to_string(),
            version: rule.version.to_string(),
            relation_type: rule.relation_type.to_string(),
            symmetric: rule.symmetric,
            produced: deterministic
                .iter()
                .filter(|relation| relation.rule_name.as_deref() == Some(rule.name))
                .count(),
        })
        .collect();

    Ok(RelationsOverview {
        fixture_id: fixture_id.to_string(),
        schema_version: RELATIONS_SCHEMA_VERSION,
        endpoint_key_scheme: super::relations::ENDPOINT_KEY_SCHEME.to_string(),
        in_scope: true,
        deterministic_count: deterministic.len(),
        approved_count: established.len() - deterministic.len(),
        pending_suggestion_count: pending.len(),
        established: edges,
        pending_suggestions: pending,
        rules,
        unresolved_endpoints: unresolved,
        deterministic_digest: store.deterministic_digest()?,
        seeded,
    })
}

fn entry_of(
    relation: &StoredRelation,
    direction: &str,
    other_key: &str,
    by_key: &HashMap<String, &MapNode>,
    unresolved: &mut Vec<String>,
) -> NodeRelationEntry {
    NodeRelationEntry {
        direction: direction.to_string(),
        provenance: relation.provenance.as_str().to_string(),
        relation_type: relation.relation_type.clone(),
        other: endpoint_of(other_key, by_key, unresolved),
        rule_name: relation.rule_name.clone(),
        rule_version: relation.rule_version.clone(),
    }
}

/// Everything the relations panel shows for one node.
///
/// Outgoing and incoming are read with **two separate queries** on two
/// different columns. Neither is derived from the other, which is what makes
/// `J5` a measurement rather than a tautology.
pub fn node_relations(
    paths: &SandboxPaths,
    fixture_id: &str,
    node_id: i64,
) -> Result<NodeRelations, MapError> {
    ensure_in_scope(fixture_id)?;
    let snapshot = commands::snapshot(paths, fixture_id)?;
    let node = snapshot
        .nodes
        .iter()
        .find(|candidate| candidate.id == node_id)
        .ok_or(MapError::NodeMissing(node_id))?;
    let store = RelationStore::open(&paths.relations_database(fixture_id))?;
    let by_key = index_by_key(fixture_id, &snapshot.nodes);
    let key = endpoint_key(fixture_id, &node.relative_path);
    let mut unresolved = Vec::new();

    let outgoing = store
        .outgoing(&key)?
        .iter()
        .map(|relation| {
            entry_of(relation, "outgoing", &relation.target_key, &by_key, &mut unresolved)
        })
        .collect::<Vec<_>>();
    let incoming = store
        .incoming(&key)?
        .iter()
        .map(|relation| {
            entry_of(relation, "incoming", &relation.source_key, &by_key, &mut unresolved)
        })
        .collect::<Vec<_>>();

    let suggestions = store
        .pending_suggestions()?
        .iter()
        .filter(|suggestion| suggestion.source_key == key || suggestion.target_key == key)
        .map(|suggestion| suggestion_of(suggestion, &by_key, &mut unresolved))
        .collect::<Vec<_>>();

    Ok(NodeRelations {
        fixture_id: fixture_id.to_string(),
        node_id,
        endpoint_key: key,
        relative_path: node.relative_path.clone(),
        outgoing_count: outgoing.len(),
        incoming_count: incoming.len(),
        outgoing,
        incoming,
        suggestions,
    })
}

/// The one explicit act that turns a suggestion into a relation.
///
/// Returns the whole overview afterwards, so the interface shows counts that
/// came back from the store rather than counts it incremented itself — `J12`
/// asks for the change to be observed, not assumed.
pub fn approve_suggestion(
    paths: &SandboxPaths,
    fixture_id: &str,
    suggestion_key: &str,
) -> Result<RelationsOverview, MapError> {
    ensure_in_scope(fixture_id)?;
    let snapshot = commands::snapshot(paths, fixture_id)?;
    let mut store = RelationStore::open(&paths.relations_database(fixture_id))?;
    store.approve(suggestion_key)?;
    overview(&store, fixture_id, &snapshot.nodes, 0)
}

/// Replays `J1` to `J5` and `J10` against the live store, and reports.
///
/// Written to report rather than to assert, like `map_self_check`: a criterion
/// that fails has to be publishable as failed.
pub fn self_check(paths: &SandboxPaths, fixture_id: &str) -> Result<RelationsSelfCheck, MapError> {
    ensure_in_scope(fixture_id)?;
    let snapshot = commands::snapshot(paths, fixture_id)?;
    let mut store = RelationStore::open(&paths.relations_database(fixture_id))?;
    let by_key = index_by_key(fixture_id, &snapshot.nodes);

    // `J3`: derive twice, digest twice. The second replay goes through the
    // store, so what is compared is what was persisted.
    let derived = super::relations::derive(fixture_id, &snapshot.nodes)?;
    store.replace_derived(&derived)?;
    let first = store.deterministic_digest()?;
    let derived_again = super::relations::derive(fixture_id, &snapshot.nodes)?;
    store.replace_derived(&derived_again)?;
    let second = store.deterministic_digest()?;

    let established = store.established()?;
    let deterministic = store.deterministic()?;
    let pending = store.pending_suggestions()?;

    // `J5`: the frozen table of §4.6.3, compared to two independent queries.
    //
    // The frozen table describes the **seeded** state. Approving a suggestion
    // is exactly what `J4` and `J12` ask the slice to do, so an expectation
    // that ignored approvals would fail the moment the product worked. The
    // adjustment stays independent of the store's own established set: it adds
    // **one** edge per suggestion the suggestions table reports as approved and
    // that the frozen fixture did **not** approve at seed, and it lists them.
    let mut expected = EXPECTED_COUNTS
        .iter()
        .map(|(path, outgoing, incoming)| ((*path).to_string(), (*outgoing, *incoming)))
        .collect::<std::collections::BTreeMap<_, _>>();
    let mut approved_since_seed = Vec::new();
    for suggestion in store.suggestions()? {
        if suggestion.state != "approved" {
            continue;
        }
        let approved_by_the_fixture = SEEDED_SUGGESTIONS
            .iter()
            .any(|seeded| seeded.key == suggestion.suggestion_key && seeded.approved_at_seed);
        if approved_by_the_fixture {
            continue;
        }
        approved_since_seed.push(suggestion.suggestion_key.clone());
        if let Some(path) = super::relations::relative_path_of(fixture_id, &suggestion.source_key) {
            if let Some(entry) = expected.get_mut(path) {
                entry.0 += 1;
            }
        }
        if let Some(path) = super::relations::relative_path_of(fixture_id, &suggestion.target_key) {
            if let Some(entry) = expected.get_mut(path) {
                entry.1 += 1;
            }
        }
    }

    let mut counts = Vec::new();
    for (path, (expected_out, expected_in)) in &expected {
        let key = endpoint_key(fixture_id, path);
        let observed_out = store.outgoing(&key)?.len();
        let observed_in = store.incoming(&key)?.len();
        counts.push(CountComparison {
            relative_path: path.clone(),
            expected_outgoing: *expected_out,
            observed_outgoing: observed_out,
            expected_incoming: *expected_in,
            observed_incoming: observed_in,
            matches: observed_out == *expected_out && observed_in == *expected_in,
        });
    }

    let invented_inverses = FORBIDDEN_INVERSES
        .iter()
        .filter_map(|(source_path, target_path)| {
            let (source, target) = (
                endpoint_key(fixture_id, source_path),
                endpoint_key(fixture_id, target_path),
            );
            established
                .iter()
                .any(|relation| relation.source_key == source && relation.target_key == target)
                .then(|| format!("{source_path} → {target_path}"))
        })
        .collect::<Vec<_>>();

    // `J2`: no pending suggestion may match an established relation.
    let suggestions_in_established = pending
        .iter()
        .filter(|suggestion| {
            established.iter().any(|relation| {
                relation.source_key == suggestion.source_key
                    && relation.target_key == suggestion.target_key
                    && relation.relation_type == suggestion.relation_type
            })
        })
        .map(|suggestion| suggestion.suggestion_key.clone())
        .collect::<Vec<_>>();

    // `J10`: every endpoint of every stored row resolves to a current node.
    let mut unresolved = Vec::new();
    for relation in &established {
        for key in [&relation.source_key, &relation.target_key] {
            if !by_key.contains_key(key) && !unresolved.iter().any(|existing| existing == key) {
                unresolved.push(key.clone());
            }
        }
    }
    for suggestion in store.suggestions()? {
        for key in [&suggestion.source_key, &suggestion.target_key] {
            if !by_key.contains_key(key) && !unresolved.iter().any(|existing| existing == key) {
                unresolved.push(key.clone());
            }
        }
    }

    let rejections = super::relations::replay_rejections(fixture_id)?;
    Ok(RelationsSelfCheck {
        fixture_id: fixture_id.to_string(),
        established_total: established.len(),
        deterministic_total: deterministic.len(),
        approved_total: established.len() - deterministic.len(),
        pending_suggestion_total: pending.len(),
        all_rejected: rejections.iter().all(|outcome| outcome.rejected),
        rejections,
        replay_stable: first == second,
        replay_digest_first: first,
        replay_digest_second: second,
        counts_agree: counts.iter().all(|entry| entry.matches),
        counts,
        approved_since_seed,
        invented_inverses,
        suggestions_in_established,
        unresolved_endpoints: unresolved,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    fn temporary_sandbox(name: &str) -> SandboxPaths {
        let root = std::env::temp_dir().join(format!(
            "filetopo-task-0017-{name}-{}",
            std::process::id()
        ));
        let _ = std::fs::remove_dir_all(&root);
        SandboxPaths::under(root)
    }

    fn built(name: &str) -> SandboxPaths {
        let paths = temporary_sandbox(name);
        commands::build_map(&paths, RELATIONS_FIXTURE, false).expect("map built");
        paths
    }

    #[test]
    fn a_fixture_outside_the_frozen_scope_is_refused_in_words() {
        let paths = temporary_sandbox("scope");
        let error = open_relations(&paths, "wide").expect_err("out of scope");
        assert!(
            error.to_string().starts_with("relations_out_of_scope_for_fixture"),
            "unexpected motif: {error}"
        );
    }

    #[test]
    fn an_unknown_fixture_is_still_an_unknown_fixture() {
        let paths = temporary_sandbox("unknown");
        let error = open_relations(&paths, "inventee").expect_err("unknown fixture");
        assert!(error.to_string().contains("map_unknown_fixture"));
    }

    /// `J5` and `J1` through the command layer, on a real index.
    #[test]
    fn opening_relations_resolves_every_endpoint_and_matches_the_frozen_counts() {
        let paths = built("open");
        let overview = open_relations(&paths, RELATIONS_FIXTURE).expect("relations");

        assert!(overview.in_scope);
        assert_eq!(overview.established.len(), 12);
        assert_eq!(overview.deterministic_count, 8);
        assert_eq!(overview.approved_count, 4);
        assert_eq!(overview.pending_suggestion_count, 4);
        assert!(
            overview.unresolved_endpoints.is_empty(),
            "J10: unresolved endpoints {:?}",
            overview.unresolved_endpoints
        );
        for edge in &overview.established {
            assert!(edge.source.node_id.is_some());
            assert!(edge.target.node_id.is_some());
            match edge.provenance.as_str() {
                "DETERMINISTIC" => {
                    assert!(edge.rule_name.as_deref().is_some_and(|n| !n.is_empty()));
                    assert!(edge.rule_version.as_deref().is_some_and(|v| !v.is_empty()));
                }
                "APPROVED" => {
                    assert!(edge.rule_name.is_none());
                    assert!(edge.suggestion_key.is_some());
                }
                other => panic!("J1: `{other}` is not a provenance"),
            }
        }

        let check = self_check(&paths, RELATIONS_FIXTURE).expect("self check");
        assert!(check.counts_agree, "J5: {:?}", check.counts);
        assert!(check.replay_stable, "J3");
        assert!(check.all_rejected, "J1/J2: {:?}", check.rejections);
        assert!(check.invented_inverses.is_empty(), "J5");
        assert!(check.suggestions_in_established.is_empty(), "J2");
        assert!(check.unresolved_endpoints.is_empty(), "J10");

        let _ = std::fs::remove_dir_all(PathBuf::from(&paths.fixtures).parent().unwrap());
    }

    /// `J10`, end to end: delete and rebuild the index, and check that nothing
    /// approved or suggested moved.
    #[test]
    fn a_full_rebuild_of_the_index_preserves_approved_relations_and_suggestions() {
        let paths = built("rebuild");
        open_relations(&paths, RELATIONS_FIXTURE).expect("relations");
        approve_suggestion(&paths, RELATIONS_FIXTURE, "S-005").expect("approval");

        let before = open_relations(&paths, RELATIONS_FIXTURE).expect("before");
        assert_eq!(before.approved_count, 5);
        assert_eq!(before.pending_suggestion_count, 3);

        // The rebuild deletes `maps/<fixture>/map.sqlite` and rebuilds it.
        commands::build_map(&paths, RELATIONS_FIXTURE, true).expect("rebuilt");

        let after = open_relations(&paths, RELATIONS_FIXTURE).expect("after");
        assert_eq!(after.approved_count, 5, "J10: approved relations must persist");
        assert_eq!(
            after.pending_suggestion_count, 3,
            "J10: suggestions must persist with their state"
        );
        assert_eq!(
            after.deterministic_digest, before.deterministic_digest,
            "J10: the derivation must replay without divergence"
        );
        assert!(after.unresolved_endpoints.is_empty(), "J10: endpoints resolve");
        assert_eq!(after.seeded, 0, "no suggestion is re-seeded by a rebuild");

        let _ = std::fs::remove_dir_all(PathBuf::from(&paths.fixtures).parent().unwrap());
    }

    /// `J4` and `J5` through the command layer: before, the suggestion counts
    /// nowhere; after, it counts exactly once.
    #[test]
    fn approval_moves_a_suggestion_into_the_counts_and_only_then() {
        let paths = built("approve");
        open_relations(&paths, RELATIONS_FIXTURE).expect("relations");

        // `S-005` runs `dossier-a/note-1.txt` → `racine-2.txt`.
        let source_id = |paths: &SandboxPaths, path: &str| {
            commands::snapshot(paths, RELATIONS_FIXTURE)
                .expect("snapshot")
                .nodes
                .iter()
                .find(|node| node.relative_path == path)
                .expect("node")
                .id
        };
        let a1 = source_id(&paths, "dossier-a/note-1.txt");
        let r2 = source_id(&paths, "racine-2.txt");

        let before = node_relations(&paths, RELATIONS_FIXTURE, a1).expect("before");
        assert_eq!(before.outgoing_count, 3);
        assert_eq!(before.incoming_count, 1);
        assert_eq!(before.suggestions.len(), 1);
        assert_eq!(before.suggestions[0].suggestion_key, "S-005");

        approve_suggestion(&paths, RELATIONS_FIXTURE, "S-005").expect("approval");

        let after = node_relations(&paths, RELATIONS_FIXTURE, a1).expect("after");
        assert_eq!(after.outgoing_count, 4, "J4: exactly one more outgoing");
        assert_eq!(after.incoming_count, 1);
        assert!(after.suggestions.is_empty(), "J4: the suggestion is decided");
        assert!(
            after
                .outgoing
                .iter()
                .any(|entry| entry.provenance == "APPROVED"
                    && entry.other.relative_path == "racine-2.txt"),
            "J4: the approved relation is the one that was suggested"
        );

        let target = node_relations(&paths, RELATIONS_FIXTURE, r2).expect("target");
        assert_eq!(target.incoming_count, 2, "J5: the other end counts it too");
        assert_eq!(target.outgoing_count, 1, "J5: no inverse is invented");

        let _ = std::fs::remove_dir_all(PathBuf::from(&paths.fixtures).parent().unwrap());
    }

    /// The self-check must stay true **after** an approval, which is the state
    /// `J12` leaves behind. The frozen table is the seeded state; the approval
    /// adds exactly one edge, and the adjustment is listed rather than hidden.
    #[test]
    fn the_frozen_expectation_survives_an_approval_and_names_the_adjustment() {
        let paths = built("after-approval");
        open_relations(&paths, RELATIONS_FIXTURE).expect("relations");

        let before = self_check(&paths, RELATIONS_FIXTURE).expect("before");
        assert!(before.counts_agree, "{:?}", before.counts);
        assert!(before.approved_since_seed.is_empty());

        approve_suggestion(&paths, RELATIONS_FIXTURE, "S-005").expect("approval");

        let after = self_check(&paths, RELATIONS_FIXTURE).expect("after");
        assert_eq!(after.approved_since_seed, vec!["S-005".to_string()]);
        assert!(after.counts_agree, "J5 after approval: {:?}", after.counts);
        assert_eq!(after.established_total, 13);
        assert_eq!(after.pending_suggestion_total, 3);
        assert!(after.invented_inverses.is_empty());

        // The one edge the approval added, and no other.
        let pivot = after
            .counts
            .iter()
            .find(|entry| entry.relative_path == "dossier-a/note-1.txt")
            .expect("pivot");
        assert_eq!(pivot.expected_outgoing, 4);
        assert_eq!(pivot.observed_outgoing, 4);

        let _ = std::fs::remove_dir_all(PathBuf::from(&paths.fixtures).parent().unwrap());
    }

    #[test]
    fn a_directory_with_no_relation_reports_empty_rather_than_failing() {
        let paths = built("empty");
        open_relations(&paths, RELATIONS_FIXTURE).expect("relations");
        let snapshot = commands::snapshot(&paths, RELATIONS_FIXTURE).expect("snapshot");
        let dossier_a = snapshot
            .nodes
            .iter()
            .find(|node| node.relative_path == "dossier-a")
            .expect("node");

        let relations = node_relations(&paths, RELATIONS_FIXTURE, dossier_a.id).expect("read");
        assert_eq!(relations.outgoing_count, 0);
        assert_eq!(relations.incoming_count, 0);
        assert!(relations.suggestions.is_empty());

        let _ = std::fs::remove_dir_all(PathBuf::from(&paths.fixtures).parent().unwrap());
    }
}
