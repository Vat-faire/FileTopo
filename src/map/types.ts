/** DTOs of the map slice, mirroring `src-tauri/src/map`. */

/* --- TASK-0018 — cerveaux ------------------------------------------------- */

/** The only source kind this slice resolves. */
export type SourceKind = "SYNTHETIC_FIXTURE";

/**
 * A brain, as the catalogue holds it.
 *
 * `brainId` is a **FileTopo identity**, not a source: two brains may carry the
 * same `sourceRef` and must stay completely independent — `DEC-0017`.
 */
export interface BrainRecord {
  brainId: string;
  displayName: string;
  color: string;
  icon: string;
  sourceKind: SourceKind;
  /** What the brain reads. A developer diagnostic, never its identity. */
  sourceRef: string;
  position: number;
}

export interface BrainCatalogView {
  brains: BrainRecord[];
  activeBrainId: string;
  schemaVersion: number;
  /** Named relative to the sandbox; never an absolute path. */
  catalogPath: string;
  seeded: number;
}

/**
 * The logical boundary of every node operation — `TASK-0018` §4.1 rule 4.
 *
 * A `nodeId` alone is a row number, valid in one brain's index and meaningless
 * in another's. The pair travels together so a selection left over from the
 * previous brain cannot resolve in the current one.
 */
export interface BrainNodeRef {
  brainId: string;
  nodeId: number;
}

export type MapNodeKind = "root" | "directory" | "file" | "skipped";

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface MapNode {
  id: number;
  parentId: number | null;
  name: string;
  relativePath: string;
  kind: MapNodeKind;
  depth: number;
  sizeBytes: number;
  modifiedUnixMs: number | null;
  childCount: number;
  /** Access diagnostic raised by the scanner. Displayed, never hidden — P-12. */
  accessDiagnostic: string | null;
  rect: Rect;
}

export interface ScanDiagnostic {
  code: string;
  relativePath: string;
}

export interface MapSnapshot {
  brainId: string;
  fixtureId: string;
  label: string;
  rootId: number;
  nodeCount: number;
  layoutWidth: number;
  layoutHeight: number;
  schemaVersion: number;
  nodes: MapNode[];
  diagnostics: ScanDiagnostic[];
}

export interface NodeDetail {
  node: MapNode;
  parent: MapNode | null;
  children: MapNode[];
}

export interface FixtureSummary {
  id: string;
  labelFr: string;
  labelEn: string;
  seed: string;
  maxNodes: number;
  plannedNodes: number;
  plannedMaxDepth: number;
}

export interface MapBuildReport {
  brainId: string;
  fixtureId: string;
  /** Where the index landed, relative to the sandbox — `K3`. */
  indexPath: string;
  nodeCount: number;
  plannedNodes: number;
  maxDepth: number;
  nodeCeiling: number;
  depthCeiling: number;
  rebuilt: boolean;
  scanMs: number;
  layoutMs: number;
  indexMs: number;
  totalMs: number;
  layoutInvocations: number;
  fingerprintBefore: string;
  fingerprintAfter: string;
  readOnlyConfirmed: boolean;
  reconstructibleDigest: string;
  nonReconstructible: string[];
  schemaVersion: number;
  diagnostics: ScanDiagnostic[];
}

export interface HostInfo {
  sandboxRoot: string;
  appVersion: string;
  sqliteVersion: string;
  webviewVersion: string;
  tauriVersion: string;
  platform: string;
  nodeCeiling: number;
  depthCeiling: number;
  minLeafArea: number;
  autoMeasure: boolean;
  autoVerify: boolean;
  autoRelations: boolean;
  /** `0` none, `1` steps K12.1–K12.9, `2` steps K12.10–K12.12. */
  autoBrainsPass: number;
  /**
   * `L12` — `0` none, `1` the sixteen steps before the real restart, `2` the
   * seventeenth, which only a relaunched process can observe.
   *
   * Kept apart from {@link autoBrainsPass} because `K12` and `L12` prove
   * different things and must remain replayable one without the other.
   */
  autoComposedPass: number;
}

export interface FixtureIntegrity {
  brainId: string;
  fixtureId: string;
  fingerprint: string;
  filetopoArtifacts: string[];
  observedEntries: number;
}

export interface MapSelfCheck {
  brainId: string;
  fixtureId: string;
  plannedPaths: number;
  observedPaths: number;
  indexedPaths: number;
  pathsAgree: boolean;
  missingFromIndex: string[];
  unexpectedInIndex: string[];
  layoutViolations: string[];
  hierarchyMismatches: string[];
  detailMismatches: string[];
}

/* --- TASK-0017 — relations transversales avec provenance ------------------ */

/**
 * The only two provenances an established relation can have.
 *
 * There is no third value, and a suggestion is not one of them: it is a
 * separate object with its own state — correction `X1`.
 */
export type RelationProvenance = "DETERMINISTIC" | "APPROVED";

export type RelationDirection = "outgoing" | "incoming";

export interface RelationEndpoint {
  key: string;
  /** `null` when the current index does not hold this endpoint. */
  nodeId: number | null;
  name: string;
  relativePath: string;
}

export interface RelationEdge {
  id: number;
  provenance: RelationProvenance;
  relationType: string;
  source: RelationEndpoint;
  target: RelationEndpoint;
  /** Present exactly when the provenance is `DETERMINISTIC` — J6. */
  ruleName: string | null;
  ruleVersion: string | null;
  suggestionKey: string | null;
}

/**
 * A suggestion, as its own type all the way to the screen.
 *
 * Deliberately not a `RelationEdge` with a flag: no rendering path can mistake
 * one for the other if they never share a type.
 */
export interface SuggestionEdge {
  suggestionKey: string;
  relationType: string;
  source: RelationEndpoint;
  target: RelationEndpoint;
  state: "pending" | "approved";
  basis: string;
}

export interface RelationRuleInfo {
  name: string;
  version: string;
  relationType: string;
  symmetric: boolean;
  produced: number;
}

export interface RelationsOverview {
  brainId: string;
  fixtureId: string;
  /** Where this brain's relations live, relative to the sandbox — `K3`. */
  relationsPath: string;
  schemaVersion: number;
  endpointKeyScheme: string;
  inScope: boolean;
  established: RelationEdge[];
  /** Pending only — an approved suggestion is already a relation. */
  pendingSuggestions: SuggestionEdge[];
  deterministicCount: number;
  approvedCount: number;
  pendingSuggestionCount: number;
  rules: RelationRuleInfo[];
  unresolvedEndpoints: string[];
  deterministicDigest: string;
  seeded: number;
}

export interface NodeRelationEntry {
  direction: RelationDirection;
  provenance: RelationProvenance;
  relationType: string;
  other: RelationEndpoint;
  ruleName: string | null;
  ruleVersion: string | null;
}

export interface NodeRelations {
  brainId: string;
  fixtureId: string;
  /** The node this panel is about, as the pair that identifies it. */
  reference: BrainNodeRef;
  endpointKey: string;
  relativePath: string;
  outgoing: NodeRelationEntry[];
  incoming: NodeRelationEntry[];
  outgoingCount: number;
  incomingCount: number;
  /** Never counted in `outgoingCount` or `incomingCount`. */
  suggestions: SuggestionEdge[];
}

export interface CountComparison {
  relativePath: string;
  expectedOutgoing: number;
  observedOutgoing: number;
  expectedIncoming: number;
  observedIncoming: number;
  matches: boolean;
}

export interface RejectionOutcome {
  case: string;
  attempt: string;
  expectedMotif: string;
  observedMotif: string;
  rejected: boolean;
}

export interface RelationsSelfCheck {
  brainId: string;
  fixtureId: string;
  establishedTotal: number;
  deterministicTotal: number;
  approvedTotal: number;
  pendingSuggestionTotal: number;
  rejections: RejectionOutcome[];
  allRejected: boolean;
  replayDigestFirst: string;
  replayDigestSecond: string;
  replayStable: boolean;
  counts: CountComparison[];
  countsAgree: boolean;
  approvedSinceSeed: string[];
  inventedInverses: string[];
  suggestionsInEstablished: string[];
  unresolvedEndpoints: string[];
}
