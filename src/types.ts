export type NodeKind = "root" | "directory" | "file" | "skipped";

export interface NodeDto {
  id: number;
  parentId: number | null;
  name: string;
  relativePath: string;
  kind: NodeKind;
  depth: number;
  sizeBytes: number;
  modifiedUnixMs: number | null;
  onlineOnly: boolean;
  reparsePoint: boolean;
  childCount: number;
}

export interface ScanDiagnostic { code: string; relativePath: string; }

export interface TerrainPoint {
  nodeId: number;
  x: number;
  y: number;
  radius: number;
  elevation: number;
  label: string;
  kind: NodeKind;
}

export interface CollectionSnapshot {
  collectionId: string;
  name: string;
  nodeCount: number;
  totalSizeBytes: number;
  diagnostics: ScanDiagnostic[];
  nodes: NodeDto[];
  terrain: TerrainPoint[];
}

export interface AppHealth { appVersion: string; sqliteVersion: string; mode: string; }
