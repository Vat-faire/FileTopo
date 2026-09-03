import type { Rect } from "./types";

export interface Point {
  x: number;
  y: number;
}

export interface EdgeAnchors {
  source: Point;
  target: Point;
}

export function rectCentre(rect: Rect): Point {
  return {
    x: finite(rect.x) + positive(rect.w) / 2,
    y: finite(rect.y) + positive(rect.h) / 2,
  };
}

/** Intersects the centre-to-centre ray with both rectangle boundaries. */
export function edgeAnchors(sourceRect: Rect, targetRect: Rect): EdgeAnchors {
  const sourceCentre = rectCentre(sourceRect);
  const targetCentre = rectCentre(targetRect);
  let dx = targetCentre.x - sourceCentre.x;
  let dy = targetCentre.y - sourceCentre.y;
  if (!Number.isFinite(dx) || !Number.isFinite(dy) || (dx === 0 && dy === 0)) {
    dx = 1;
    dy = 0;
  }

  return {
    source: intersectRay(sourceRect, sourceCentre, dx, dy),
    target: intersectRay(targetRect, targetCentre, -dx, -dy),
  };
}

function intersectRay(rect: Rect, centre: Point, dx: number, dy: number): Point {
  const halfWidth = positive(rect.w) / 2;
  const halfHeight = positive(rect.h) / 2;
  const tx = dx === 0 ? Number.POSITIVE_INFINITY : halfWidth / Math.abs(dx);
  const ty = dy === 0 ? Number.POSITIVE_INFINITY : halfHeight / Math.abs(dy);
  const scale = Math.min(tx, ty);
  if (!Number.isFinite(scale)) return { ...centre };
  return {
    x: finite(centre.x + dx * scale),
    y: finite(centre.y + dy * scale),
  };
}

function finite(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

function positive(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : Number.EPSILON;
}
