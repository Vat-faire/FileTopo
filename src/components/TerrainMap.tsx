import { Application, Graphics } from "pixi.js";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CollectionSnapshot } from "../types";

interface TerrainMapProps {
  snapshot: CollectionSnapshot;
  selectedId: number | null;
  onSelect: (nodeId: number) => void;
  detailLabel: string;
  lessDetailLabel: string;
  moreDetailLabel: string;
}

const palette = { directory: 0xb8db82, file: 0xd8bd7d, skipped: 0x788b83, root: 0x78c9ac };

export default function TerrainMap({ snapshot, selectedId, onSelect, detailLabel, lessDetailLabel, moreDetailLabel }: TerrainMapProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [detailLimit, setDetailLimit] = useState(600);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const visibleTerrain = useMemo(() => {
    if (snapshot.terrain.length <= detailLimit) return snapshot.terrain;
    const stride = Math.ceil(snapshot.terrain.length / detailLimit);
    const sampled = snapshot.terrain.filter((_, index) => index % stride === 0);
    const selected = snapshot.terrain.find((point) => point.nodeId === selectedId);
    if (selected && !sampled.some((point) => point.nodeId === selected.nodeId)) sampled.push(selected);
    return sampled;
  }, [detailLimit, selectedId, snapshot.terrain]);
  const landmarkLabels = useMemo(() => {
    const selected = visibleTerrain.find((point) => point.nodeId === selectedId);
    const hovered = visibleTerrain.find((point) => point.nodeId === hoveredId);
    const labelled = visibleTerrain
      .filter((point) => point.kind === "directory")
      .sort((left, right) => right.radius - left.radius)
      .reduce<typeof visibleTerrain>((accepted, point) => {
        const clear = accepted.every((other) => {
          const dx = point.x - other.x;
          const dy = point.y - other.y;
          return (dx * dx) / (92 * 92) + (dy * dy) / (44 * 44) > 1;
        });
        if (clear && accepted.length < 12) accepted.push(point);
        return accepted;
      }, []);

    for (const point of [selected, hovered]) {
      if (point && !labelled.some((candidate) => candidate.nodeId === point.nodeId)) labelled.push(point);
    }
    return labelled;
  }, [hoveredId, selectedId, visibleTerrain]);

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

      for (const point of visibleTerrain) {
        const selected = point.nodeId === selectedId;
        const marker = new Graphics()
          .circle(point.x * scaleX, point.y * scaleY, Math.max(2.2, point.radius * .3 + (selected ? 4 : 0)))
          .fill({ color: palette[point.kind], alpha: point.kind === "directory" ? .92 : .58 })
          .stroke({ color: selected ? 0xffffff : palette[point.kind], alpha: selected ? .9 : .3, width: selected ? 2 : .6 });
        marker.eventMode = "static";
        marker.cursor = "pointer";
        marker.on("pointerover", () => setHoveredId(point.nodeId));
        marker.on("pointerout", () => setHoveredId((current) => current === point.nodeId ? null : current));
        marker.on("pointertap", () => onSelect(point.nodeId));
        app.stage.addChild(marker);
      }
    }).catch(() => { host.dataset.renderState = "unavailable"; });

    return () => {
      disposed = true;
      if (mounted) { app.canvas.remove(); app.destroy(); }
    };
  }, [onSelect, selectedId, snapshot, visibleTerrain]);

  return (
    <div ref={hostRef} className="terrain-canvas" data-testid="terrain-map" aria-label="Rendu topographique interactif">
      <div className="detail-controls" aria-label={detailLabel}>
        <button type="button" aria-label={lessDetailLabel} disabled={detailLimit <= 150} onClick={() => setDetailLimit((current) => Math.max(150, Math.floor(current / 2)))}>−</button>
        <span>{visibleTerrain.length}</span>
        <button type="button" aria-label={moreDetailLabel} disabled={detailLimit >= 2_000 || detailLimit >= snapshot.terrain.length} onClick={() => setDetailLimit((current) => Math.min(2_000, current * 2))}>+</button>
      </div>
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
          {visibleTerrain.map((point) => (
            <circle
              key={point.nodeId}
              cx={point.x}
              cy={point.y}
              r={Math.max(2.4, point.radius * .31 + (point.nodeId === selectedId ? 4 : 0))}
              className={`${point.kind}${point.nodeId === selectedId ? " selected" : ""}`}
              onMouseEnter={() => setHoveredId(point.nodeId)}
              onMouseLeave={() => setHoveredId((current) => current === point.nodeId ? null : current)}
              onClick={() => onSelect(point.nodeId)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") onSelect(point.nodeId);
              }}
              tabIndex={0}
              role="button"
              aria-label={point.label}
            />
          ))}
        </g>
      </svg>
      <div className="terrain-labels" aria-hidden="true">
        {landmarkLabels.map((point) => {
          const selected = point.nodeId === selectedId;
          const hovered = point.nodeId === hoveredId;
          return (
            <span
              key={point.nodeId}
              className={`terrain-label${selected ? " selected" : ""}${hovered ? " hovered" : ""}`}
              style={{
                left: `${Math.min(96, Math.max(4, (point.x / 960) * 100))}%`,
                top: `${Math.min(95, Math.max(5, (point.y / 660) * 100))}%`,
              }}
              title={point.label}
            >
              {point.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
