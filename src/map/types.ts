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
