import { useCallback, useEffect, useMemo, useRef } from "react";
import type { Hierarchy } from "./hierarchy";
import { hierarchicalNeighbourhood, move } from "./hierarchy";
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

export default function MapView({
  hierarchy,
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
        // Attenuated, never erased: the rectangle keeps its outline and its
        // accessible name whatever the selection is — parity §3, point 4.
        const state = selected ? "selected" : related ? "related" : "plain";
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
    [hierarchy, highlighted, labelFor, onSelect, selectedId],
  );

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
        <g className="map-view__labels" aria-hidden="true">
          {labels}
        </g>
      </svg>
    </div>
  );
}
