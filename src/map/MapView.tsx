import { useCallback, useEffect, useMemo, useRef } from "react";
import type { Hierarchy } from "./hierarchy";
import { hierarchicalNeighbourhood, move } from "./hierarchy";
import type { RelationSegment } from "./relations";
import type { MapNode, Rect } from "./types";
import type { View, Viewport } from "./viewState";
import { fitToBox, fitView, panBy, worldToScreen, zoomAbout } from "./viewState";

/**
 * The map itself: hierarchical blocks in accessible SVG.
 *
 * SVG rather than Canvas or WebGL, per `DEC-0013` C and `DEC-0015` E — both of
 * which remain closed. The layout is read from the index and only ever
 * transformed here; nothing on this path recomputes a rectangle, which is what
 * `H10` asserts.
 *
 * **Blocks are drawn in layout coordinates inside one transformed group.** Pan
 * and zoom therefore change a single attribute rather than re-projecting every
 * node, so a frame costs one transform instead of thousands of DOM writes. The
 * labels are the exception: they live in a screen-space layer because text that
 * scaled with the map would be illegible at one end of the zoom range and
 * absurd at the other. That layer only ever holds the handful of labels that
 * are on screen and large enough to read.
 *
 * Everything reachable with the mouse is reachable from the keyboard: the map
 * is one focusable widget whose arrow keys walk the hierarchy, and the toolbar
 * beside it exposes the same navigation as ordinary buttons.
 */

interface MapViewProps {
  hierarchy: Hierarchy;
  /**
   * Cross-cutting relations, already projected onto the persisted rectangles.
   * `TASK-0017` `J9`.
   */
  segments: RelationSegment[];
  /**
   * Node ids linked to the selection by an **established** relation.
   * Suggestions are deliberately absent — `J8`.
   */
  relationNeighbours: Set<number>;
  world: Rect;
  view: View;
  viewport: Viewport;
  selectedId: number | null;
  onViewChange: (view: View) => void;
  onSelect: (nodeId: number) => void;
  onViewportChange: (viewport: Viewport) => void;
  labelFor: (node: MapNode) => string;
  ariaLabel: string;
}

/** Below this on-screen size a label cannot be read, so it is not drawn. */
const LABEL_MIN_WIDTH = 46;
const LABEL_MIN_HEIGHT = 15;
const WHEEL_ZOOM_STEP = 1.0015;
const KEY_ZOOM_STEP = 1.35;
const KEY_PAN_STEP = 90;

/** Triangle of an arrow head, pointing along `(ux, uy)` from `(x, y)`. */
function arrowHead(x: number, y: number, ux: number, uy: number): string {
  const size = 9;
  const tipX = x + ux * size;
  const tipY = y + uy * size;
  const leftX = x - uy * (size * 0.45);
  const leftY = y + ux * (size * 0.45);
  const rightX = x + uy * (size * 0.45);
  const rightY = y - ux * (size * 0.45);
  return `M ${tipX} ${tipY} L ${leftX} ${leftY} L ${rightX} ${rightY} Z`;
}

export default function MapView({
  hierarchy,
  segments,
  relationNeighbours,
  world,
  view,
  viewport,
  selectedId,
  onViewChange,
  onSelect,
  onViewportChange,
  labelFor,
  ariaLabel,
}: MapViewProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ pointerId: number; x: number; y: number } | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const measure = () => {
      const box = host.getBoundingClientRect();
      onViewportChange({ width: box.width, height: box.height });
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    return () => observer.disconnect();
  }, [onViewportChange]);

  const highlighted = useMemo(
    () => (selectedId === null ? new Set<number>() : hierarchicalNeighbourhood(hierarchy, selectedId)),
    [hierarchy, selectedId],
  );

  // Rebuilt only when the tree or the selection changes — never for a pan or a
  // zoom, which is the whole point of the transformed group below.
  const blocks = useMemo(
    () =>
      hierarchy.drawOrder.map((node) => {
        const selected = node.id === selectedId;
        const related = highlighted.has(node.id);
        // `J8`: parent and direct children are accentuated as kin, cross-cutting
        // neighbours as links. Two accentuations rather than one, because the
        // panel distinguishes them and the map must not contradict it.
        const linked = relationNeighbours.has(node.id);
        // Attenuated, never erased: the rectangle keeps its outline and its
        // accessible name whatever the selection is — parity §3, point 4.
        const state = selected ? "selected" : related ? "related" : linked ? "linked" : "plain";
        const corner = Math.min(node.rect.w, node.rect.h) * 0.06;
        const marker = Math.min(node.rect.w, node.rect.h) * 0.28;
        return (
          <g
            key={node.id}
            id={`map-node-${node.id}`}
            role="treeitem"
            aria-level={node.depth + 1}
            aria-selected={selected}
            aria-label={labelFor(node)}
            className={`map-node map-node--${node.kind} map-node--${state}`}
            onPointerDown={(event) => {
              event.stopPropagation();
              onSelect(node.id);
            }}
          >
            <rect
              x={node.rect.x}
              y={node.rect.y}
              width={node.rect.w}
              height={node.rect.h}
              rx={corner}
              vectorEffect="non-scaling-stroke"
            />
            {node.accessDiagnostic ? (
              // A hatched corner marks an access diagnostic without relying on
              // colour alone; the panel spells it out in words.
              <path
                className="map-node__diagnostic"
                d={`M ${node.rect.x} ${node.rect.y} l ${marker} 0 l ${-marker} ${marker} Z`}
              />
            ) : null}
          </g>
        );
      }),
    [hierarchy, highlighted, labelFor, onSelect, relationNeighbours, selectedId],
  );

  /**
   * Cross-cutting relations, in the screen-space layer.
   *
   * Projected from the rectangles the index already holds — **no layout is
   * recomputed**, which is what keeps `H10` of `TASK-0016` true while `J9`
   * adds edges. Screen space rather than the transformed group so an arrow
   * head stays the same size at every zoom instead of becoming a speck or a
   * blot.
   *
   * Direction and status never rely on colour: an established relation is a
   * solid line ending in a filled arrow head, a suggestion is a dashed line
   * with **no** arrow head and an open ring at each end, and the accessible
   * name spells out which is which.
   */
  const edges = useMemo(() => {
    const drawn: React.ReactElement[] = [];
    for (const segment of segments) {
      const x1 = segment.x1 * view.scale + view.tx;
      const y1 = segment.y1 * view.scale + view.ty;
      const x2 = segment.x2 * view.scale + view.tx;
      const y2 = segment.y2 * view.scale + view.ty;
      const offScreen =
        (x1 < 0 && x2 < 0) ||
        (y1 < 0 && y2 < 0) ||
        (x1 > viewport.width && x2 > viewport.width) ||
        (y1 > viewport.height && y2 > viewport.height);
      if (offScreen) continue;

      const length = Math.hypot(x2 - x1, y2 - y1);
      if (!(length > 1)) continue;
      const ux = (x2 - x1) / length;
      const uy = (y2 - y1) / length;
      const established = segment.kind === "established";
      const state = segment.touchesSelection ? "touching" : "distant";
      const className =
        `map-edge map-edge--${segment.kind} map-edge--${state}` +
        (segment.provenance ? ` map-edge--${segment.provenance.toLowerCase()}` : "");

      drawn.push(
        <g key={segment.key} className={className} role="presentation">
          <title>{segment.label}</title>
          <line className="map-edge__line" x1={x1} y1={y1} x2={x2} y2={y2} />
          {established ? (
            // Filled arrow head, drawn as a triangle so its shape carries the
            // direction without a marker definition and without colour.
            <path
              className="map-edge__arrow"
              d={arrowHead(x2 - ux * 9, y2 - uy * 9, ux, uy)}
            />
          ) : (
            <>
              <circle className="map-edge__ring" cx={x1} cy={y1} r={3.5} />
              <circle className="map-edge__ring" cx={x2} cy={y2} r={3.5} />
            </>
          )}
        </g>,
      );
    }
    return drawn;
  }, [segments, view.scale, view.tx, view.ty, viewport.height, viewport.width]);

  // Screen-space layer: only what is on screen and big enough to read, plus the
  // selection, whose label `P-02` requires to stay legible.
  const labels = useMemo(() => {
    const drawn: React.ReactElement[] = [];
    for (const node of hierarchy.drawOrder) {
      const screen = worldToScreen(node.rect, view);
      if (
        screen.x + screen.w < 0 ||
        screen.y + screen.h < 0 ||
        screen.x > viewport.width ||
        screen.y > viewport.height
      ) {
        continue;
      }
      const big = screen.w >= LABEL_MIN_WIDTH && screen.h >= LABEL_MIN_HEIGHT;
      if (!big && node.id !== selectedId) continue;
      drawn.push(
        <text
          key={node.id}
          className={`map-node__label${node.id === selectedId ? " map-node__label--selected" : ""}`}
          x={screen.x + 5}
          y={screen.y + 13}
        >
          {node.name}
        </text>,
      );
    }
    return drawn;
  }, [hierarchy, selectedId, view, viewport.height, viewport.width]);

  const handleWheel = useCallback(
    (event: React.WheelEvent<SVGSVGElement>) => {
      const host = hostRef.current;
      if (!host) return;
      const box = host.getBoundingClientRect();
      const anchor = { x: event.clientX - box.left, y: event.clientY - box.top };
      onViewChange(zoomAbout(view, WHEEL_ZOOM_STEP ** -event.deltaY, anchor, world, viewport));
    },
    [onViewChange, view, viewport, world],
  );

  const handlePointerDown = useCallback((event: React.PointerEvent<SVGSVGElement>) => {
    if (event.button !== 0) return;
    dragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }, []);

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<SVGSVGElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      if (dx === 0 && dy === 0) return;
      dragRef.current = { ...drag, x: event.clientX, y: event.clientY };
      onViewChange(panBy(view, dx, dy, world, viewport));
    },
    [onViewChange, view, viewport, world],
  );

  const endDrag = useCallback((event: React.PointerEvent<SVGSVGElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<SVGSVGElement>) => {
      const centre = { x: viewport.width / 2, y: viewport.height / 2 };
      const panning = event.altKey;
      let handled = true;

      switch (event.key) {
        case "ArrowUp":
          if (panning) onViewChange(panBy(view, 0, KEY_PAN_STEP, world, viewport));
          else if (selectedId !== null) {
            const target = move(hierarchy, selectedId, "parent");
            if (target !== null) onSelect(target);
          }
          break;
        case "ArrowDown":
          if (panning) onViewChange(panBy(view, 0, -KEY_PAN_STEP, world, viewport));
          else if (selectedId !== null) {
            const target = move(hierarchy, selectedId, "child");
            if (target !== null) onSelect(target);
          }
          break;
        case "ArrowLeft":
          if (panning) onViewChange(panBy(view, KEY_PAN_STEP, 0, world, viewport));
          else if (selectedId !== null) {
            const target = move(hierarchy, selectedId, "previous");
            if (target !== null) onSelect(target);
          }
          break;
        case "ArrowRight":
          if (panning) onViewChange(panBy(view, -KEY_PAN_STEP, 0, world, viewport));
          else if (selectedId !== null) {
            const target = move(hierarchy, selectedId, "next");
            if (target !== null) onSelect(target);
          }
          break;
        case "+":
        case "=":
          onViewChange(zoomAbout(view, KEY_ZOOM_STEP, centre, world, viewport));
          break;
        case "-":
        case "_":
          onViewChange(zoomAbout(view, 1 / KEY_ZOOM_STEP, centre, world, viewport));
          break;
        case "f":
        case "F": {
          const selected = selectedId === null ? null : hierarchy.byId.get(selectedId);
          onViewChange(
            selected ? fitToBox(selected.rect, world, viewport) : fitView(world, viewport),
          );
          break;
        }
        case "r":
        case "R":
          onViewChange(fitView(world, viewport));
          break;
        case "Home":
          onSelect(hierarchy.rootId);
          break;
        default:
          handled = false;
      }

      if (handled) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    [hierarchy, onSelect, onViewChange, selectedId, view, viewport, world],
  );

  return (
    <div className="map-view" ref={hostRef}>
      <svg
        className="map-view__canvas"
        role="tree"
        tabIndex={0}
        aria-label={ariaLabel}
        aria-activedescendant={selectedId === null ? undefined : `map-node-${selectedId}`}
        width="100%"
        height="100%"
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={handleKeyDown}
      >
        <g transform={`translate(${view.tx} ${view.ty}) scale(${view.scale})`}>{blocks}</g>
        <g className="map-view__edges" aria-hidden="true">
          {edges}
        </g>
        <g className="map-view__labels" aria-hidden="true">
          {labels}
        </g>
      </svg>
    </div>
  );
}
