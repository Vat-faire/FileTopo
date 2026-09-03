import { describe, expect, it } from "vitest";
import { buildHierarchy, domHierarchyEdgeId, hierarchyEdges } from "./hierarchy";
import type { MapNode, Rect } from "./types";

function node(id: number, parentId: number | null, depth: number, rect: Rect): MapNode {
  return {
    id,
    parentId,
    name: `node-${id}`,
    relativePath: id === 1 ? "" : `node-${id}`,
    kind: id === 1 ? "root" : "directory",
    depth,
    sizeBytes: 0,
    modifiedUnixMs: null,
    childCount: 0,
    accessDiagnostic: null,
    rect,
  };
}

describe("hierarchy edges", () => {
  it("builds exactly the real parent-child pairs", () => {
    const nodes = [
      node(1, null, 0, { x: 0, y: 46, w: 240, h: 64 }),
      node(2, 1, 1, { x: 360, y: 0, w: 240, h: 64 }),
      node(3, 1, 1, { x: 360, y: 92, w: 240, h: 64 }),
    ];
    const edges = hierarchyEdges(buildHierarchy(nodes, 1), "brain-alpha");
    expect(edges).toHaveLength(nodes.length - 1);
    expect(edges.map((edge) => [edge.parentNodeId, edge.childNodeId])).toEqual([
      [1, 2],
      [1, 3],
    ]);
    expect(edges[0].path).toBe("M 240 78 H 300 V 32 H 360");
  });

  it("namespaces deterministic DOM identities by brain", () => {
    expect(domHierarchyEdgeId("brain-alpha", 1, 2)).toBe(
      "brain-alpha-hierarchy-edge-1-2",
    );
    expect(domHierarchyEdgeId("brain-gamma", 1, 2)).not.toBe(
      domHierarchyEdgeId("brain-alpha", 1, 2),
    );
  });
});
