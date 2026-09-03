/**
 * Hierarchy helpers shared by the map and the keyboard.
 *
 * Selection has to move the same way whether it is driven by a click or by an
 * arrow key — `P-06` requires both, and a keyboard path bolted on afterwards is
 * the thing `TASK-0016` §4 says has to be rebuilt from scratch.
 */

import type { MapNode } from "./types";

export interface Hierarchy {
  byId: Map<number, MapNode>;
  childrenOf: Map<number, number[]>;
  rootId: number;
  /** Painter's order: a parent is always drawn before its children. */
  drawOrder: MapNode[];
}

export interface HierarchyEdge {
  brainId: string;
  parentNodeId: number;
  childNodeId: number;
  path: string;
}

export function buildHierarchy(nodes: MapNode[], rootId: number): Hierarchy {
  const byId = new Map<number, MapNode>();
  const childrenOf = new Map<number, number[]>();
  for (const node of nodes) {
    byId.set(node.id, node);
    if (node.parentId !== null) {
      const siblings = childrenOf.get(node.parentId);
      if (siblings) siblings.push(node.id);
      else childrenOf.set(node.parentId, [node.id]);
    }
  }
  // The index already returns nodes in breadth-first order, which is exactly
  // the order in which nested rectangles must be painted.
  return { byId, childrenOf, rootId, drawOrder: [...nodes].sort((a, b) => a.depth - b.depth) };
}

export function childrenIds(hierarchy: Hierarchy, id: number): number[] {
  return hierarchy.childrenOf.get(id) ?? [];
}

export function ancestorsOf(hierarchy: Hierarchy, id: number): number[] {
  const chain: number[] = [];
  let current = hierarchy.byId.get(id)?.parentId ?? null;
  while (current !== null) {
    chain.push(current);
    current = hierarchy.byId.get(current)?.parentId ?? null;
  }
  return chain;
}

/** Parent, direct children and the node itself — what `P-06` accentuates. */
export function hierarchicalNeighbourhood(hierarchy: Hierarchy, id: number): Set<number> {
  const related = new Set<number>([id]);
  const node = hierarchy.byId.get(id);
  if (!node) return related;
  if (node.parentId !== null) related.add(node.parentId);
  for (const child of childrenIds(hierarchy, id)) related.add(child);
  return related;
}

export function domHierarchyEdgeId(
  brainId: string,
  parentNodeId: number,
  childNodeId: number,
): string {
  return `${brainId}-hierarchy-edge-${parentNodeId}-${childNodeId}`;
}

/** One exact orthogonal edge for every non-root node, in index order. */
export function hierarchyEdges(hierarchy: Hierarchy, brainId: string): HierarchyEdge[] {
  const edges: HierarchyEdge[] = [];
  for (const child of hierarchy.drawOrder) {
    if (child.parentId === null) continue;
    const parent = hierarchy.byId.get(child.parentId);
    if (!parent) continue;
    const parentRightX = parent.rect.x + parent.rect.w;
    const parentY = parent.rect.y + parent.rect.h / 2;
    const childLeftX = child.rect.x;
    const childY = child.rect.y + child.rect.h / 2;
    const midpointX = (parentRightX + childLeftX) / 2;
    edges.push({
      brainId,
      parentNodeId: parent.id,
      childNodeId: child.id,
      path: `M ${parentRightX} ${parentY} H ${midpointX} V ${childY} H ${childLeftX}`,
    });
  }
  return edges;
}

export type Direction = "parent" | "child" | "previous" | "next";

/** Where an arrow key lands. Returns `null` when there is nowhere to go. */
export function move(hierarchy: Hierarchy, id: number, direction: Direction): number | null {
  const node = hierarchy.byId.get(id);
  if (!node) return null;
  if (direction === "parent") return node.parentId;
  if (direction === "child") return childrenIds(hierarchy, id)[0] ?? null;

  const parentId = node.parentId;
  if (parentId === null) return null;
  const siblings = childrenIds(hierarchy, parentId);
  const position = siblings.indexOf(id);
  if (position < 0) return null;
  const target = direction === "previous" ? position - 1 : position + 1;
  return siblings[target] ?? null;
}
