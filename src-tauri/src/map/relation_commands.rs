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
use super::brains::{BrainNodeRef, BrainRecord};
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
    /// **Whose relations these are.** The identity space of a suggestion key
    /// is the brain — `TASK-0018` §4.5 — so `S-005` may legitimately exist,
    /// pending in one brain and approved in another.
    pub brain_id: String,
    /// The synthetic source behind the brain. A developer diagnostic.
    pub fixture_id: String,
    /// Where this brain's relations really live, named relative to the
    /// sandbox. `K3` compares these across brains.
    pub relations_path: String,
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
    pub brain_id: String,
    pub fixture_id: String,
    /// The node this panel is about, as the **pair** that identifies it.
    ///
    /// Handed back so the interface carries a reference rather than a loose
    /// row number: `TASK-0018` §4.1 rule 5 — the same `node_id` in two brains
    /// must never allow a leak, and the surest way is never to let the number
    /// travel alone.
    pub reference: BrainNodeRef,
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
    pub brain_id: String,
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

/// Endpoint keys are built from the **brain**, so two brains reading the same
/// tree produce two disjoint key spaces for the same relative paths.
fn index_by_key<'a>(brain_id: &str, nodes: &'a [MapNode]) -> HashMap<String, &'a MapNode> {
    nodes
        .iter()
        .map(|node| (endpoint_key(brain_id, &node.relative_path), node))
        .collect()
}

/// Refuses a brain whose source is outside the frozen relations scope, in
/// words.
///
/// The scope is still a property of the **source** — the `homonymes` rule is
/// quadratic and would produce hundreds of thousands of pairs on `wide` — but
/// the refusal now names the brain, because that is what the caller asked for.
fn ensure_in_scope(brain: &BrainRecord) -> Result<&'static fixtures::FixtureSpec, MapError> {
    let spec = brain.source_fixture()?;
    if spec.id != RELATIONS_FIXTURE {
        let brain_id = &brain.brain_id;
        return Err(RelationError::OutOfScopeFixture(format!(
            "`{brain_id}` reads `{}` and carries no relations: TASK-0017 §4.6 \
             freezes `{RELATIONS_FIXTURE}` as the relations source of this slice",
            spec.id
        ))
        .into());
    }
    Ok(spec)
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
    brain: &BrainRecord,
) -> Result<RelationsOverview, MapError> {
    let spec = ensure_in_scope(brain)?;
    let snapshot = commands::snapshot(paths, brain)?;
    // One store per brain. `brain-alpha` and `brain-gamma` read the same tree
    // and derive the same eight relations — into two separate databases.
    let database = paths.brain_relations_database(&brain.brain_id);
    let mut store = RelationStore::open(&database)?;

    let derived = super::relations::derive(&brain.brain_id, &snapshot.nodes)?;
    store.replace_derived(&derived)?;
    let seeded = super::relations::seed_fixture(&mut store, &brain.brain_id)?;

    overview(
        &store,
        brain,
        spec.id,
        paths.relative_name(&database),
        &snapshot.nodes,
        seeded,
    )
}

fn overview(
    store: &RelationStore,
    brain: &BrainRecord,
    fixture_id: &str,
    relations_path: String,
    nodes: &[MapNode],
    seeded: usize,
) -> Result<RelationsOverview, MapError> {
    let by_key = index_by_key(&brain.brain_id, nodes);
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
        brain_id: brain.brain_id.clone(),
        fixture_id: fixture_id.to_string(),
        relations_path,
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
    brain: &BrainRecord,
    reference: &BrainNodeRef,
) -> Result<NodeRelations, MapError> {
    let spec = ensure_in_scope(brain)?;
    // The pair is the boundary — `TASK-0018` §4.1 rule 4. A reference minted
    // in another brain is refused before any store is opened.
    if !reference.belongs_to(&brain.brain_id) {
        return Err(MapError::BrainMismatch {
            expected: brain.brain_id.clone(),
            found: reference.brain_id.clone(),
        });
    }
    let node_id = reference.node_id;
    let snapshot = commands::snapshot(paths, brain)?;
    // The node is looked up in **this** brain's snapshot. A `node_id` that
    // only another brain holds is missing here, and says so — `K5`.
    let node = snapshot
        .nodes
        .iter()
        .find(|candidate| candidate.id == node_id)
        .ok_or(MapError::NodeMissing(node_id))?;
    let store = RelationStore::open(&paths.brain_relations_database(&brain.brain_id))?;
    let by_key = index_by_key(&brain.brain_id, &snapshot.nodes);
    let key = endpoint_key(&brain.brain_id, &node.relative_path);
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
        brain_id: brain.brain_id.clone(),
        fixture_id: spec.id.to_string(),
        reference: BrainNodeRef::new(&brain.brain_id, node_id),
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
    brain: &BrainRecord,
    suggestion_key: &str,
) -> Result<RelationsOverview, MapError> {
    let spec = ensure_in_scope(brain)?;
    let snapshot = commands::snapshot(paths, brain)?;
    // Opened on **this** brain's store, so the approval cannot reach another
    // brain's copy of the same suggestion key — `K6`.
    let database = paths.brain_relations_database(&brain.brain_id);
    let mut store = RelationStore::open(&database)?;
    store.approve(suggestion_key)?;
    overview(
        &store,
        brain,
        spec.id,
        paths.relative_name(&database),
        &snapshot.nodes,
        0,
    )
}

/// Replays `J1` to `J5` and `J10` against the live store, and reports.
///
/// Written to report rather than to assert, like `map_self_check`: a criterion
/// that fails has to be publishable as failed.
pub fn self_check(
    paths: &SandboxPaths,
    brain: &BrainRecord,
) -> Result<RelationsSelfCheck, MapError> {
    let spec = ensure_in_scope(brain)?;
    let brain_id = brain.brain_id.as_str();
    let snapshot = commands::snapshot(paths, brain)?;
    let mut store = RelationStore::open(&paths.brain_relations_database(brain_id))?;
    let by_key = index_by_key(brain_id, &snapshot.nodes);

    // `J3`: derive twice, digest twice. The second replay goes through the
    // store, so what is compared is what was persisted.
    let derived = super::relations::derive(brain_id, &snapshot.nodes)?;
    store.replace_derived(&derived)?;
    let first = store.deterministic_digest()?;
    let derived_again = super::relations::derive(brain_id, &snapshot.nodes)?;
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
        if let Some(path) = super::relations::relative_path_of(brain_id, &suggestion.source_key) {
            if let Some(entry) = expected.get_mut(path) {
                entry.0 += 1;
            }
        }
        if let Some(path) = super::relations::relative_path_of(brain_id, &suggestion.target_key) {
            if let Some(entry) = expected.get_mut(path) {
                entry.1 += 1;
            }
        }
    }

    let mut counts = Vec::new();
    for (path, (expected_out, expected_in)) in &expected {
        let key = endpoint_key(brain_id, path);
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
                endpoint_key(brain_id, source_path),
                endpoint_key(brain_id, target_path),
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

    let rejections = super::relations::replay_rejections(brain_id)?;
    Ok(RelationsSelfCheck {
        brain_id: brain_id.to_string(),
        fixture_id: spec.id.to_string(),
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
            "filetopo-task-0018-{name}-{}",
            std::process::id()
        ));
        let _ = std::fs::remove_dir_all(&root);
        SandboxPaths::under(root)
    }

    /// The brain the `TASK-0017` criteria were written against, now named as
    /// the brain it always was: `brain-alpha` reads `quasi-empty`.
    fn alpha() -> BrainRecord {
        BrainRecord::frozen_by_id("brain-alpha").expect("brain-alpha")
    }

    /// The **other** brain on the very same fixture. `K6` turns on this pair.
    fn gamma() -> BrainRecord {
        BrainRecord::frozen_by_id("brain-gamma").expect("brain-gamma")
    }

    fn brain_reading(fixture_id: &str) -> BrainRecord {
        BrainRecord {
            brain_id: format!("brain-test-{fixture_id}"),
            display_name: "Cerveau d'essai".to_string(),
            color: "#333333".to_string(),
            icon: "*".to_string(),
            source_kind: super::super::brains::SourceKind::SyntheticFixture,
            source_ref: fixture_id.to_string(),
            position: 1,
        }
    }

    fn built(name: &str) -> SandboxPaths {
        let paths = temporary_sandbox(name);
        commands::build_map(&paths, &alpha(), false).expect("map built");
        paths
    }

    #[test]
    fn a_brain_outside_the_frozen_scope_is_refused_in_words() {
        let paths = temporary_sandbox("scope");
        let error = open_relations(&paths, &brain_reading("wide")).expect_err("out of scope");
        assert!(
            error.to_string().starts_with("relations_out_of_scope_for_fixture"),
            "unexpected motif: {error}"
        );
    }

    #[test]
    fn an_unknown_fixture_is_still_an_unknown_fixture() {
        let paths = temporary_sandbox("unknown");
        let error =
            open_relations(&paths, &brain_reading("inventee")).expect_err("unknown fixture");
        assert!(error.to_string().contains("map_unknown_fixture"));
    }

    /// `J5` and `J1` through the command layer, on a real index.
    #[test]
    fn opening_relations_resolves_every_endpoint_and_matches_the_frozen_counts() {
        let paths = built("open");
        let overview = open_relations(&paths, &alpha()).expect("relations");

        assert!(overview.in_scope);
        assert_eq!(overview.brain_id, "brain-alpha");
        assert_eq!(overview.fixture_id, RELATIONS_FIXTURE);
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

        let check = self_check(&paths, &alpha()).expect("self check");
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
        open_relations(&paths, &alpha()).expect("relations");
        approve_suggestion(&paths, &alpha(), "S-005").expect("approval");

        let before = open_relations(&paths, &alpha()).expect("before");
        assert_eq!(before.approved_count, 5);
        assert_eq!(before.pending_suggestion_count, 3);

        // The rebuild deletes `brains/<brain>/map/index.sqlite` and rebuilds
        // it. The relations sit beside it, not inside it, and survive.
        commands::build_map(&paths, &alpha(), true).expect("rebuilt");

        let after = open_relations(&paths, &alpha()).expect("after");
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
        open_relations(&paths, &alpha()).expect("relations");

        // `S-005` runs `dossier-a/note-1.txt` → `racine-2.txt`.
        let source_id = |paths: &SandboxPaths, path: &str| {
            commands::snapshot(paths, &alpha())
                .expect("snapshot")
                .nodes
                .iter()
                .find(|node| node.relative_path == path)
                .expect("node")
                .id
        };
        let a1 = source_id(&paths, "dossier-a/note-1.txt");
        let r2 = source_id(&paths, "racine-2.txt");

        let before =
            node_relations(&paths, &alpha(), &BrainNodeRef::new("brain-alpha", a1))
                .expect("before");
        assert_eq!(before.outgoing_count, 3);
        assert_eq!(before.incoming_count, 1);
        assert_eq!(before.suggestions.len(), 1);
        assert_eq!(before.suggestions[0].suggestion_key, "S-005");

        approve_suggestion(&paths, &alpha(), "S-005").expect("approval");

        let after = node_relations(&paths, &alpha(), &BrainNodeRef::new("brain-alpha", a1))
            .expect("after");
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

        let target = node_relations(&paths, &alpha(), &BrainNodeRef::new("brain-alpha", r2))
            .expect("target");
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
        open_relations(&paths, &alpha()).expect("relations");

        let before = self_check(&paths, &alpha()).expect("before");
        assert!(before.counts_agree, "{:?}", before.counts);
        assert!(before.approved_since_seed.is_empty());

        approve_suggestion(&paths, &alpha(), "S-005").expect("approval");

        let after = self_check(&paths, &alpha()).expect("after");
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
        open_relations(&paths, &alpha()).expect("relations");
        let snapshot = commands::snapshot(&paths, &alpha()).expect("snapshot");
        let dossier_a = snapshot
            .nodes
            .iter()
            .find(|node| node.relative_path == "dossier-a")
            .expect("node");

        let relations =
            node_relations(&paths, &alpha(), &BrainNodeRef::new("brain-alpha", dossier_a.id))
                .expect("read");
        assert_eq!(relations.outgoing_count, 0);
        assert_eq!(relations.incoming_count, 0);
        assert!(relations.suggestions.is_empty());

        let _ = std::fs::remove_dir_all(PathBuf::from(&paths.fixtures).parent().unwrap());
    }

    /// `K6` — the frozen isolation scenario of `TASK-0018` §4.5, step by step.
    ///
    /// Alpha and Gamma read the **same** fixture, derive the **same** eight
    /// relations, and hold the **same** suggestion keys. Approving in one must
    /// leave the other exactly where it was. Nothing here compares a brain to
    /// itself: every assertion reads the other brain back from its own store.
    #[test]
    fn approving_in_one_brain_never_moves_a_count_in_the_other() {
        let paths = built("isolation");
        commands::build_map(&paths, &gamma(), false).expect("gamma map");

        // Initial state — identical, and separately stored.
        let alpha_start = open_relations(&paths, &alpha()).expect("alpha");
        let gamma_start = open_relations(&paths, &gamma()).expect("gamma");
        for (label, overview) in [("alpha", &alpha_start), ("gamma", &gamma_start)] {
            assert_eq!(overview.deterministic_count, 8, "{label}");
            assert_eq!(overview.approved_count, 4, "{label}");
            assert_eq!(overview.pending_suggestion_count, 4, "{label}");
        }
        assert_ne!(
            alpha_start.relations_path, gamma_start.relations_path,
            "K3: two brains, two relation stores"
        );

        // The same suggestion key exists in both — its identity space is the
        // brain, `TASK-0018` §4.5.
        assert!(
            alpha_start
                .pending_suggestions
                .iter()
                .any(|s| s.suggestion_key == "S-005")
        );
        assert!(
            gamma_start
                .pending_suggestions
                .iter()
                .any(|s| s.suggestion_key == "S-005")
        );

        // Step 1 — approve `S-005` in Alpha.
        approve_suggestion(&paths, &alpha(), "S-005").expect("alpha approval");

        let alpha_after = open_relations(&paths, &alpha()).expect("alpha after");
        assert_eq!(alpha_after.deterministic_count, 8);
        assert_eq!(alpha_after.approved_count, 5);
        assert_eq!(alpha_after.pending_suggestion_count, 3);

        let gamma_untouched = open_relations(&paths, &gamma()).expect("gamma after");
        assert_eq!(gamma_untouched.deterministic_count, 8);
        assert_eq!(gamma_untouched.approved_count, 4, "K6: Gamma must not move");
        assert_eq!(gamma_untouched.pending_suggestion_count, 4, "K6");
        assert!(
            gamma_untouched
                .pending_suggestions
                .iter()
                .any(|s| s.suggestion_key == "S-005"),
            "K6: Gamma's own S-005 is still pending"
        );

        // Step 2 — approve a **different** suggestion in Gamma.
        approve_suggestion(&paths, &gamma(), "S-006").expect("gamma approval");

        let gamma_final = open_relations(&paths, &gamma()).expect("gamma final");
        assert_eq!(gamma_final.approved_count, 5);
        assert_eq!(gamma_final.pending_suggestion_count, 3);

        let alpha_final = open_relations(&paths, &alpha()).expect("alpha final");
        assert_eq!(alpha_final.approved_count, 5, "K6: Alpha must not move");
        assert_eq!(alpha_final.pending_suggestion_count, 3, "K6");
        assert!(
            alpha_final
                .pending_suggestions
                .iter()
                .any(|s| s.suggestion_key == "S-006"),
            "K6: Alpha's own S-006 was never approved"
        );

        // And both brains still pass their own self-check, independently.
        for (label, brain) in [("alpha", alpha()), ("gamma", gamma())] {
            let check = self_check(&paths, &brain).expect("self check");
            assert_eq!(check.brain_id, brain.brain_id);
            assert!(check.counts_agree, "{label}: {:?}", check.counts);
            assert!(check.invented_inverses.is_empty(), "{label}");
            assert!(check.suggestions_in_established.is_empty(), "{label}");
            assert!(check.unresolved_endpoints.is_empty(), "{label}");
        }

        let _ = std::fs::remove_dir_all(PathBuf::from(&paths.fixtures).parent().unwrap());
    }

    /// An endpoint key belongs to a brain, and to no other.
    ///
    /// This is what makes the isolation structural rather than incidental: even
    /// if the two stores were ever merged, Alpha's keys would not match
    /// Gamma's nodes.
    #[test]
    fn endpoint_keys_of_two_brains_never_collide_on_the_same_fixture() {
        let paths = built("keys");
        commands::build_map(&paths, &gamma(), false).expect("gamma map");

        let alpha_keys = open_relations(&paths, &alpha())
            .expect("alpha")
            .established
            .iter()
            .map(|edge| edge.source.key.clone())
            .collect::<std::collections::BTreeSet<_>>();
        let gamma_keys = open_relations(&paths, &gamma())
            .expect("gamma")
            .established
            .iter()
            .map(|edge| edge.source.key.clone())
            .collect::<std::collections::BTreeSet<_>>();

        assert_eq!(alpha_keys.len(), gamma_keys.len(), "same tree, same shape");
        assert!(
            alpha_keys.is_disjoint(&gamma_keys),
            "two brains on one fixture must share no endpoint key"
        );
        assert!(alpha_keys.iter().all(|key| key.contains("brain-alpha")));
        assert!(gamma_keys.iter().all(|key| key.contains("brain-gamma")));

        let _ = std::fs::remove_dir_all(PathBuf::from(&paths.fixtures).parent().unwrap());
    }
}
