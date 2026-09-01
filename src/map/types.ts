/** DTOs of the `TASK-0016` slice, mirroring `src-tauri/src/map`. */

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
  fixtureId: string;
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
}

export interface FixtureIntegrity {
  fixtureId: string;
  fingerprint: string;
  filetopoArtifacts: string[];
  observedEntries: number;
}

export interface MapSelfCheck {
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
  fixtureId: string;
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
  fixtureId: string;
  nodeId: number;
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
