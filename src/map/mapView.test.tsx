import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import DetailsPanel from "./DetailsPanel";
import MapView from "./MapView";
import { buildHierarchy, hierarchicalNeighbourhood, move } from "./hierarchy";
import { aggregate, selectionTargets, summarize } from "./measure";
import type { MapNode, NodeDetail, Rect } from "./types";
import { fitView, type View } from "./viewState";

// This project does not enable Vitest globals, so Testing Library's automatic
// cleanup never registers; without this the second render of a suite finds the
// first one still in the document.
afterEach(cleanup);

/** Small synthetic tree, laid out by hand so the geometry is obvious. */
function node(
  id: number,
  parentId: number | null,
  name: string,
  kind: MapNode["kind"],
  depth: number,
  rect: Rect,
  extra: Partial<MapNode> = {},
): MapNode {
  return {
    id,
    parentId,
    name,
    relativePath: name === "racine" ? "" : name,
    kind,
    depth,
    sizeBytes: 100 * id,
    modifiedUnixMs: 1_700_000_000_000 + id,
    childCount: 0,
    accessDiagnostic: null,
    rect,
    ...extra,
  };
}

const nodes: MapNode[] = [
  node(1, null, "racine", "root", 0, { x: 0, y: 0, w: 400, h: 400 }, { childCount: 2 }),
  node(2, 1, "alpha", "directory", 1, { x: 10, y: 30, w: 180, h: 340 }, { childCount: 2 }),
  node(3, 1, "beta", "directory", 1, { x: 200, y: 30, w: 180, h: 340 }, {
    childCount: 0,
    accessDiagnostic: "directory_unreadable",
  }),
  node(4, 2, "un.txt", "file", 2, { x: 20, y: 60, w: 160, h: 140 }),
  node(5, 2, "deux.txt", "file", 2, { x: 20, y: 210, w: 160, h: 140 }),
];

const world: Rect = { x: 0, y: 0, w: 400, h: 400 };
const hierarchy = buildHierarchy(nodes, 1);

const panelStrings = {
  title: "Détails",
  empty: "vide",
  loading: "chargement",
  name: "Nom",
  kind: "Type",
  path: "Chemin",
  size: "Taille",
  modified: "Modifié",
  parent: "Parent",
  children: "Enfants directs",
  diagnostic: "Diagnostic d'accès",
  noDiagnostic: "aucun",
  noParent: "racine",
  noChildren: "aucun enfant",
  rootPath: "(racine)",
  kinds: { root: "racine", directory: "dossier", file: "fichier", skipped: "ignoré" },
};

function Harness({ onSelect }: { onSelect?: (id: number) => void }) {
  const viewport = { width: 800, height: 600 };
  const [view, setView] = useState<View>(() => fitView(world, viewport));
  const [selectedId, setSelectedId] = useState<number | null>(1);
  return (
    <MapView
      hierarchy={hierarchy}
      world={world}
      view={view}
      viewport={viewport}
      selectedId={selectedId}
      onViewChange={setView}
      onSelect={(id) => {
        setSelectedId(id);
        onSelect?.(id);
      }}
      onViewportChange={() => {}}
      labelFor={(target) => `${target.name} (${target.kind})`}
      ariaLabel="carte"
    />
  );
}

describe("map selection — P-06, H4", () => {
  it("exposes every node as an accessible tree item, whatever the selection", () => {
    render(<Harness />);
    const items = screen.getAllByRole("treeitem");
    expect(items).toHaveLength(nodes.length);
    // Attenuated nodes keep their accessible name: nothing is erased.
    expect(screen.getByLabelText("deux.txt (file)")).toBeInTheDocument();
  });

  it("selects with the mouse", () => {
    const onSelect = vi.fn();
    render(<Harness onSelect={onSelect} />);
    fireEvent.pointerDown(screen.getByLabelText("alpha (directory)"));
    expect(onSelect).toHaveBeenCalledWith(2);
    expect(screen.getByLabelText("alpha (directory)")).toHaveAttribute("aria-selected", "true");
  });

  it("reaches the same nodes with the keyboard alone", () => {
    render(<Harness />);
    const map = screen.getByRole("tree");
    map.focus();

    fireEvent.keyDown(map, { key: "ArrowDown" }); // root → first child
    expect(screen.getByLabelText("alpha (directory)")).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(map, { key: "ArrowRight" }); // next sibling
    expect(screen.getByLabelText("beta (directory)")).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(map, { key: "ArrowLeft" }); // previous sibling
    fireEvent.keyDown(map, { key: "ArrowDown" }); // into alpha's children
    expect(screen.getByLabelText("un.txt (file)")).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(map, { key: "ArrowUp" }); // back to the parent
    expect(screen.getByLabelText("alpha (directory)")).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(map, { key: "Home" });
    expect(screen.getByLabelText("racine (root)")).toHaveAttribute("aria-selected", "true");
  });

  it("marks an access diagnostic on the map itself, not by colour alone", () => {
    const { container } = render(<Harness />);
    const flagged = container.querySelectorAll(".map-node__diagnostic");
    expect(flagged).toHaveLength(1);
  });

  it("keeps the selected label drawn even when the block is small", () => {
    // `beta` is selected below; P-02 requires its label to stay legible.
    const { container } = render(<Harness />);
    const beta = container.querySelector("#map-node-3");
    expect(beta).not.toBeNull();
    fireEvent.pointerDown(beta as Element);
    expect(within(beta as HTMLElement).getByText("beta")).toBeInTheDocument();
  });
});

describe("hierarchy helpers", () => {
  it("accentuates exactly the parent, the node and its direct children", () => {
    expect([...hierarchicalNeighbourhood(hierarchy, 2)].sort()).toEqual([1, 2, 4, 5]);
    // A grandchild of the root is not part of the root's neighbourhood.
    expect([...hierarchicalNeighbourhood(hierarchy, 1)].sort()).toEqual([1, 2, 3]);
  });

  it("returns null at the edges instead of wrapping around", () => {
    expect(move(hierarchy, 1, "parent")).toBeNull();
    expect(move(hierarchy, 3, "child")).toBeNull();
    expect(move(hierarchy, 2, "previous")).toBeNull();
    expect(move(hierarchy, 3, "next")).toBeNull();
  });
});

describe("details panel — P-12, H5", () => {
  const detail: NodeDetail = {
    node: nodes[2],
    parent: nodes[0],
    children: [],
  };

  it("shows the access diagnostic rather than hiding it", () => {
    render(
      <DetailsPanel
        detail={detail}
        loading={false}
        onSelect={() => {}}
        locale="fr"
        strings={panelStrings}
      />,
    );
    expect(screen.getByText("directory_unreadable")).toBeVisible();
  });

  it("offers the parent and the direct children as reachable controls", () => {
    render(
      <DetailsPanel
        detail={{ node: nodes[1], parent: nodes[0], children: [nodes[3], nodes[4]] }}
        loading={false}
        onSelect={() => {}}
        locale="fr"
        strings={panelStrings}
      />,
    );
    expect(screen.getByRole("button", { name: /racine/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /un\.txt/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /deux\.txt/ })).toBeInTheDocument();
  });

  it("says a node has no children instead of showing an empty list", () => {
    render(
      <DetailsPanel
        detail={detail}
        loading={false}
        onSelect={() => {}}
        locale="fr"
        strings={panelStrings}
      />,
    );
    expect(screen.getByText("aucun enfant")).toBeInTheDocument();
  });
});

describe("measurement statistics — H9", () => {
  it("reports the median, the extremes and the worst value, hiding none", () => {
    const stat = summarize([5, 1, 9, 3, 7]);
    expect(stat).toEqual({ count: 5, median: 5, min: 1, max: 9, mean: 5 });
    expect(summarize([2, 4]).median).toBe(3);
    expect(summarize([]).count).toBe(0);
  });

  it("aggregates every run, worst frame included", () => {
    const measurement = aggregate("wide", 2207, [
      { run: 1, frameTimesMs: [16, 17], selectionLatenciesMs: [20] },
      { run: 2, frameTimesMs: [16, 120], selectionLatenciesMs: [25] },
    ]);
    expect(measurement.frameTime.count).toBe(4);
    expect(measurement.worstFrameMs).toBe(120);
    expect(measurement.worstSelectionMs).toBe(25);
    expect(measurement.runs).toHaveLength(2);
  });

  it("spreads selection targets across the tree rather than clustering", () => {
    const targets = selectionTargets([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 4);
    expect(targets).toEqual([1, 4, 7, 10]);
    expect(selectionTargets([], 4)).toEqual([]);
  });
});
