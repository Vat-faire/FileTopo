import type { CollectionSnapshot, NodeDto, TerrainPoint } from "../types";

export function createDemoSnapshot(count = 128): CollectionSnapshot {
  const bounded = Math.max(16, Math.min(count, 2_000));
  const nodes: NodeDto[] = [{
    id: 1, parentId: null, name: "FileTopo Demo", relativePath: "", kind: "root",
    depth: 0, sizeBytes: 0, modifiedUnixMs: null, onlineOnly: false,
    reparsePoint: false, childCount: 8,
  }];

  for (let index = 0; index < 8; index += 1) {
    nodes.push({
      id: index + 2, parentId: 1,
      name: `Territoire ${String(index + 1).padStart(2, "0")}`,
      relativePath: `territoire-${String(index + 1).padStart(2, "0")}`,
      kind: "directory", depth: 1, sizeBytes: 0, modifiedUnixMs: null,
      onlineOnly: false, reparsePoint: false, childCount: 0,
    });
  }

  while (nodes.length < bounded) {
    const index = nodes.length;
    const territory = index % 8;
    nodes.push({
      id: index + 1, parentId: territory + 2,
      name: `document-${String(index).padStart(4, "0")}.md`,
      relativePath: `territoire-${String(territory + 1).padStart(2, "0")}/document-${String(index).padStart(4, "0")}.md`,
      kind: "file", depth: 2, sizeBytes: 512 + (index * 97) % 65_536,
      modifiedUnixMs: null, onlineOnly: index % 23 === 0,
      reparsePoint: false, childCount: 0,
    });
  }

  for (const folder of nodes.filter((node) => node.kind === "directory")) {
    folder.childCount = nodes.filter((node) => node.parentId === folder.id).length;
  }

  const terrain: TerrainPoint[] = nodes.slice(1).map((node, index) => {
    const angle = index * 2.3999631;
    const spread = 22 + Math.sqrt(index) * 24;
    const elevation = Math.min(1, Math.max(.08,
      Math.log(node.childCount + 1) * .32 + ((node.id % 17) / 17) * .48 + Math.log(node.sizeBytes + 1) / 80,
    ));
    return {
      nodeId: node.id, x: 480 + Math.cos(angle) * spread,
      y: 330 + Math.sin(angle) * spread * .68,
      radius: 5 + elevation * 20, elevation, label: node.name, kind: node.kind,
    };
  });

  return {
    collectionId: "demo-web", name: "Démonstration locale",
    nodeCount: nodes.length,
    totalSizeBytes: nodes.reduce((total, node) => total + node.sizeBytes, 0),
    diagnostics: [], nodes, terrain,
  };
}
