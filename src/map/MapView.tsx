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
        <g>
          {hierarchy.drawOrder.map((node) => {
            const screen = worldToScreen(node.rect, view);
            const selected = node.id === selectedId;
            const related = highlighted.has(node.id);
            // Attenuated, never erased: the rectangle keeps its outline and its
            // accessible name whatever the selection is — parity §3, point 4.
            const state = selected ? "selected" : related ? "related" : "plain";
            const showLabel =
              selected ||
              (screen.w >= LABEL_MIN_WIDTH && screen.h >= LABEL_MIN_HEIGHT);
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
                  x={screen.x}
                  y={screen.y}
                  width={Math.max(screen.w, 0.5)}
                  height={Math.max(screen.h, 0.5)}
                  rx={Math.min(4, screen.w / 6, screen.h / 6)}
                />
                {node.accessDiagnostic ? (
                  // A hatched corner marks an access diagnostic without relying
                  // on colour alone; the panel spells it out in words.
                  <path
                    className="map-node__diagnostic"
                    d={`M ${screen.x} ${screen.y} l ${Math.min(12, screen.w)} 0 l ${-Math.min(12, screen.w)} ${Math.min(12, screen.h)} Z`}
                  />
                ) : null}
                {showLabel ? (
                  <text
                    className="map-node__label"
                    x={screen.x + 5}
                    y={screen.y + 13}
                    clipPath="none"
                  >
                    {node.name}
                  </text>
                ) : null}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
