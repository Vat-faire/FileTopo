import { Application, Graphics } from "pixi.js";
import { useEffect, useRef } from "react";
import type { CollectionSnapshot } from "../types";

interface TerrainMapProps {
  snapshot: CollectionSnapshot;
  selectedId: number | null;
  onSelect: (nodeId: number) => void;
}

const palette = { directory: 0xb8db82, file: 0xd8bd7d, skipped: 0x788b83, root: 0x78c9ac };

export default function TerrainMap({ snapshot, selectedId, onSelect }: TerrainMapProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || navigator.userAgent.includes("jsdom")) return;
    const app = new Application();
    let disposed = false;
    let mounted = false;

    app.init({
      antialias: true, backgroundAlpha: 0, resizeTo: host,
      preference: "webgl", resolution: Math.min(window.devicePixelRatio || 1, 2), autoDensity: true,
    }).then(() => {
      if (disposed) { app.destroy(); return; }
      mounted = true;
      app.canvas.setAttribute("aria-hidden", "true");
      host.appendChild(app.canvas);
      const width = Math.max(host.clientWidth, 640);
      const height = Math.max(host.clientHeight, 470);
      const scaleX = width / 960;
      const scaleY = height / 660;
      const contours = new Graphics();
      for (let ring = 0; ring < 11; ring += 1) {
        const wobble = Math.sin(ring * 1.7) * 18;
        contours
          .ellipse(width * .5 + wobble * scaleX, height * .5 - wobble * .3, (90 + ring * 39) * scaleX, (58 + ring * 24) * scaleY)
          .stroke({ color: ring % 3 === 0 ? 0x6c917e : 0x34584a, alpha: ring % 3 === 0 ? .29 : .18, width: ring % 3 === 0 ? 1.2 : .7 });
      }
      app.stage.addChild(contours);

      for (const point of snapshot.terrain) {
        const selected = point.nodeId === selectedId;
        const marker = new Graphics()
          .circle(point.x * scaleX, point.y * scaleY, Math.max(2.2, point.radius * .3 + (selected ? 4 : 0)))
          .fill({ color: palette[point.kind], alpha: point.kind === "directory" ? .92 : .58 })
          .stroke({ color: selected ? 0xffffff : palette[point.kind], alpha: selected ? .9 : .3, width: selected ? 2 : .6 });
        marker.eventMode = "static";
        marker.cursor = "pointer";
        marker.on("pointertap", () => onSelect(point.nodeId));
        app.stage.addChild(marker);
      }
    }).catch(() => { host.dataset.renderState = "unavailable"; });

    return () => {
      disposed = true;
      if (mounted) { app.canvas.remove(); app.destroy(); }
    };
  }, [onSelect, selectedId, snapshot]);

  return (
    <div ref={hostRef} className="terrain-canvas" data-testid="terrain-map" aria-label="Rendu topographique interactif">
      <svg className="terrain-fallback" viewBox="0 0 960 660" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <defs>
          <radialGradient id="terrain-glow">
            <stop offset="0" stopColor="#557c68" stopOpacity=".28" />
            <stop offset="1" stopColor="#0d1816" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="480" cy="330" rx="430" ry="295" fill="url(#terrain-glow)" />
        <g className="contour-lines">
          {Array.from({ length: 11 }, (_, ring) => (
            <ellipse
              key={ring}
              cx={480 + Math.sin(ring * 1.7) * 18}
              cy={330 - Math.sin(ring * 1.7) * 5.4}
              rx={90 + ring * 39}
              ry={58 + ring * 24}
              className={ring % 3 === 0 ? "major" : undefined}
            />
          ))}
        </g>
        <g className="terrain-points">
          {snapshot.terrain.map((point) => (
            <circle
              key={point.nodeId}
              cx={point.x}
              cy={point.y}
              r={Math.max(2.4, point.radius * .31 + (point.nodeId === selectedId ? 4 : 0))}
              className={`${point.kind}${point.nodeId === selectedId ? " selected" : ""}`}
              onClick={() => onSelect(point.nodeId)}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
