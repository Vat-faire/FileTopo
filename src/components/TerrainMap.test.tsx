import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createDemoSnapshot } from "../lib/demo";
import TerrainMap from "./TerrainMap";

vi.mock("pixi.js", () => ({
  Application: vi.fn(),
  Graphics: vi.fn(),
}));

function renderMap(selectedId: number | null = null) {
  return render(
    <TerrainMap
      snapshot={createDemoSnapshot(64)}
      selectedId={selectedId}
      onSelect={vi.fn()}
      detailLabel="Niveau de détail"
      lessDetailLabel="Moins de détails"
      moreDetailLabel="Plus de détails"
    />,
  );
}

describe("TerrainMap point identification", () => {
  it("shows useful directory landmarks directly on the map", () => {
    const { container } = renderMap();
    const labels = Array.from(container.querySelectorAll(".terrain-label"));

    expect(labels.length).toBeGreaterThan(0);
    expect(labels.some((label) => label.textContent?.startsWith("Territoire"))).toBe(true);
  });

  it("shows the name of any point while it is hovered", () => {
    const { container } = renderMap();
    const point = container.querySelector('circle[aria-label="document-0009.md"]');

    expect(point).not.toBeNull();
    fireEvent.mouseEnter(point!);

    expect(screen.getByText("document-0009.md")).toHaveClass("terrain-label", "hovered");
  });

  it("keeps the selected point identified even when it is a file", () => {
    const { container } = renderMap(10);
    const selectedLabel = container.querySelector(".terrain-label.selected");

    expect(selectedLabel).toHaveTextContent("document-0009.md");
  });
});
