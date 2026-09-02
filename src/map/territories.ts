/**
 * Territories — the deterministic placement of several brains in ONE graph.
 *
 * `TASK-0019` §4.3. The requirement is stronger than "show them side by side":
 * the composed brains must be rendered in a **single principal `SVG`**, and
 * each must occupy a territory a person can name.
 *
 * **The internal layout is never recomputed.** This module produces one
 * translation per brain, and nothing else. The rectangles come from the index
 * exactly as `TASK-0016` computed them once, at index time (`H10`); composing
 * adds an offset, and pan and zoom then apply the *global* view on top. That
 * is the whole of `L5`: same rectangles, same proportions, one translation.
 *
 * The offsets are recomputed when a brain is added or removed — the row has to
 * close up — and **never** for a pan or a zoom.
 */

import type { Rect } from "./types";
import type { View, Viewport } from "./viewState";

/* --- The three frozen constants, §4.3 ------------------------------------- */

/** Margin around a brain's own layout box, in layout units. */
export const TERRITORY_PADDING = 48;
/** Identity band above the box: name, icon, node count. */
export const TERRITORY_HEADER = 96;
/** Space between two neighbouring territories. */
export const TERRITORY_GUTTER = 120;

/** What one brain contributes to the composition: its own layout size. */
export interface TerritoryInput {
  brainId: string;
  layoutWidth: number;
  layoutHeight: number;
}

/** One brain's place in the composed graph. */
export interface Territory {
  brainId: string;
  /** 0-based rank in catalogue order — the order the row is laid out in. */
  position: number;
  /** The translation applied to this brain's own layout coordinates. */
  offsetX: number;
  offsetY: number;
  /** The brain's own layout size, **unchanged**. */
  width: number;
  height: number;
  /** The territory's frame, in composed world coordinates. */
  frame: Rect;
}

export interface Composition {
  territories: Territory[];
  /** Bounding box of every frame — what `Ajuster` frames. */
  world: Rect;
}

/**
 * Lays the territories out in a row, in the order they are given.
 *
 * A row, and not a grid: a row is one number per territory — the running `x` —
 * so the placement is trivially deterministic and trivially testable, and two
 * runs of the same composition cannot disagree. Every frame is given the
 * **same height**, that of the tallest brain, so adding a 157-node brain
 * beside a 12-node one produces a tidy band rather than a staircase.
 *
 * Sizes are **not** normalised. Scaling a small brain up to match a large one
 * would break `L5`, which allows a translation and nothing else: what is on
 * screen is the real relative size of the two maps.
 */
export function composeTerritories(inputs: readonly TerritoryInput[]): Composition {
  if (inputs.length === 0) {
    return { territories: [], world: { x: 0, y: 0, w: 1, h: 1 } };
  }

  const tallest = Math.max(...inputs.map((input) => Math.max(input.layoutHeight, 1)));
  const frameHeight = TERRITORY_HEADER + tallest + 2 * TERRITORY_PADDING;

  const territories: Territory[] = [];
  let cursor = 0;
  inputs.forEach((input, position) => {
    const width = Math.max(input.layoutWidth, 1);
    const height = Math.max(input.layoutHeight, 1);
    const frame: Rect = {
      x: cursor,
      y: 0,
      w: width + 2 * TERRITORY_PADDING,
      h: frameHeight,
    };
    territories.push({
      brainId: input.brainId,
      position,
      offsetX: frame.x + TERRITORY_PADDING,
      offsetY: frame.y + TERRITORY_PADDING + TERRITORY_HEADER,
      width,
      height,
      frame,
    });
    cursor += frame.w + TERRITORY_GUTTER;
  });

  const last = territories[territories.length - 1].frame;
  return {
    territories,
    world: { x: 0, y: 0, w: last.x + last.w, h: frameHeight },
  };
}

/** The territory a brain occupies, or `null` when it is not displayed. */
export function territoryOf(
  composition: Composition,
  brainId: string,
): Territory | null {
  return composition.territories.find((entry) => entry.brainId === brainId) ?? null;
}

/**
 * One of a brain's own rectangles, placed in the composed world.
 *
 * **Translation only.** `L5` is checked against this function directly:
 * subtract the offset and the original rectangle must come back, bit for bit,
 * with its width and height untouched.
 */
export function placeRect(territory: Territory, rect: Rect): Rect {
  return {
    x: rect.x + territory.offsetX,
    y: rect.y + territory.offsetY,
    w: rect.w,
    h: rect.h,
  };
}

/** A point of a brain's own layout, placed in the composed world. */
export function placePoint(
  territory: Territory,
  x: number,
  y: number,
): { x: number; y: number } {
  return { x: x + territory.offsetX, y: y + territory.offsetY };
}

/**
 * Where a territory's identity band sits, in composed world coordinates.
 *
 * Returned rather than drawn here so the caller can put the label in the
 * screen-space layer, where text stays legible at every zoom.
 */
export function headerBox(territory: Territory): Rect {
  return {
    x: territory.frame.x + TERRITORY_PADDING,
    y: territory.frame.y + TERRITORY_PADDING,
    w: Math.max(territory.frame.w - 2 * TERRITORY_PADDING, 1),
    h: TERRITORY_HEADER,
  };
}

/**
 * True when the composition's own geometry survived a view change.
 *
 * Used by `L5`: a pan or a zoom must leave every offset and every frame
 * exactly where they were. Compared value by value rather than by identity,
 * because a re-render that produced an equal composition is fine and a
 * re-render that produced a *different* one is the defect.
 */
export function sameComposition(left: Composition, right: Composition): boolean {
  if (left.territories.length !== right.territories.length) return false;
  if (
    left.world.x !== right.world.x ||
    left.world.y !== right.world.y ||
    left.world.w !== right.world.w ||
    left.world.h !== right.world.h
  ) {
    return false;
  }
  return left.territories.every((territory, index) => {
    const other = right.territories[index];
    return (
      territory.brainId === other.brainId &&
      territory.offsetX === other.offsetX &&
      territory.offsetY === other.offsetY &&
      territory.width === other.width &&
      territory.height === other.height &&
      territory.frame.x === other.frame.x &&
      territory.frame.y === other.frame.y &&
      territory.frame.w === other.frame.w &&
      territory.frame.h === other.frame.h
    );
  });
}

/** Whether a territory's frame is anywhere near the viewport, after `view`. */
export function frameOnScreen(
  territory: Territory,
  view: View,
  viewport: Viewport,
): boolean {
  const x = territory.frame.x * view.scale + view.tx;
  const y = territory.frame.y * view.scale + view.ty;
  const w = territory.frame.w * view.scale;
  const h = territory.frame.h * view.scale;
  return !(x + w < 0 || y + h < 0 || x > viewport.width || y > viewport.height);
}
