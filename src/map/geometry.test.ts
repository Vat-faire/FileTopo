import { describe, expect, it } from "vitest";
import { edgeAnchors } from "./geometry";
import type { Rect } from "./types";

const source: Rect = { x: 10, y: 20, w: 240, h: 64 };

function expectFinite(rect: Rect) {
  const anchors = edgeAnchors(source, rect);
  expect(Object.values(anchors.source).every(Number.isFinite)).toBe(true);
  expect(Object.values(anchors.target).every(Number.isFinite)).toBe(true);
  return anchors;
}

describe("rectangle edge anchors", () => {
  it("anchors a target to the right", () => {
    const anchors = expectFinite({ x: 500, y: 20, w: 240, h: 64 });
    expect(anchors.source).toEqual({ x: 250, y: 52 });
    expect(anchors.target).toEqual({ x: 500, y: 52 });
  });

  it("anchors a target to the left", () => {
    const anchors = expectFinite({ x: -400, y: 20, w: 240, h: 64 });
    expect(anchors.source.x).toBeCloseTo(10);
    expect(anchors.source.y).toBeCloseTo(52);
    expect(anchors.target.x).toBeCloseTo(-160);
    expect(anchors.target.y).toBeCloseTo(52);
  });

  it("anchors above and below", () => {
    expect(expectFinite({ x: 10, y: -200, w: 240, h: 64 }).source.y).toBe(20);
    expect(expectFinite({ x: 10, y: 300, w: 240, h: 64 }).source.y).toBe(84);
  });

  it("anchors diagonally on the first boundary hit", () => {
    const anchors = expectFinite({ x: 400, y: 300, w: 240, h: 64 });
    expect(anchors.source.y).toBe(84);
    expect(anchors.source.x).toBeGreaterThan(10);
    expect(anchors.source.x).toBeLessThan(250);
  });

  it("stays finite for very distant rectangles", () => {
    expectFinite({ x: 1e12, y: -1e12, w: 240, h: 64 });
  });

  it("uses a deterministic horizontal fallback for identical centres", () => {
    const anchors = edgeAnchors(source, { ...source });
    expect(anchors.source).toEqual({ x: 250, y: 52 });
    expect(anchors.target).toEqual({ x: 10, y: 52 });
  });

  it("never returns NaN or Infinity for defensive dimensions", () => {
    expectFinite({ x: Number.NaN, y: Number.POSITIVE_INFINITY, w: 0, h: -1 });
  });
});
