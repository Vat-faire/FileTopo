import { invoke } from "@tauri-apps/api/core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DetailsPanel, { type PanelStrings } from "./DetailsPanel";
import MapView from "./MapView";
import { buildHierarchy } from "./hierarchy";
import {
  FRAMES_PER_RUN,
  RUNS_PER_FIXTURE,
  SELECTIONS_PER_RUN,
  WARMUP_FRAMES,
  aggregate,
  afterPaint,
  nextFrame,
  scriptedStep,
  selectionTargets,
  type FixtureMeasurement,
  type RunSample,
} from "./measure";
import "./map.css";
import type {
  FixtureIntegrity,
  FixtureSummary,
  HostInfo,
  MapBuildReport,
  MapNode,
  MapSelfCheck,
  MapSnapshot,
  NodeDetail,
  Rect,
} from "./types";
import { fitToBox, fitView, panBy, zoomAbout, type View, type Viewport } from "./viewState";

/**
 * The vertical slice of `TASK-0016`, end to end.
 *
 * Source of data: **four synthetic fixtures, and nothing else**. There is no
 * folder picker anywhere in this screen, deliberately — real data is a stop
 * point reserved to Sébastien, and a picker that merely goes unused is still a
 * picker.
 */

const strings = {
  fr: {
    appTitle: "FileTopo — carte de blocs",
    subtitle: "Tranche verticale TASK-0016 · fixtures synthétiques seulement",
    fixtures: "Fixtures synthétiques",
    open: "Ouvrir",
    rebuild: "Reconstruire l'index",
    building: "Construction…",
    map: "Carte hiérarchique",
    zoomIn: "Zoom avant",
    zoomOut: "Zoom arrière",
    fit: "Ajuster à l'écran",
    fitSelection: "Cadrer la sélection",
    reset: "Réinitialiser la vue",
    selectRoot: "Sélectionner la racine",
    measure: "Mesurer dans WebView2",
    measuring: "Mesure en cours…",
    selfCheck: "Contrôler H1–H5",
    keyboardTitle: "Clavier",
    keyboard:
      "Flèches : parent, enfant, frères · Alt+flèches : panoramique · + / − : zoom · F : ajuster · R : réinitialiser · Origine : racine",
    nodes: "nœuds",
    depth: "profondeur",
    ceiling: "plafond",
    readOnly: "Empreinte identique avant et après le scan",
    readOnlyFailed: "EMPREINTE DIFFÉRENTE — la source a changé",
    noArtifacts: "Aucun fichier de FileTopo dans la racine analysée",
    artifactsFound: "Fichiers de FileTopo trouvés dans la racine analysée",
    scan: "scan",
    layout: "calepinage",
    index: "index",
    engine: "Moteur de rendu",
    sandbox: "Bac à sable",
    panel: {
      title: "Détails de la sélection",
      empty: "Sélectionnez un bloc sur la carte, ou appuyez sur Origine.",
      loading: "Lecture de l'index…",
      name: "Nom",
      kind: "Type",
      path: "Chemin relatif",
      size: "Taille",
      modified: "Modifié",
      parent: "Parent",
      children: "Enfants directs",
      diagnostic: "Diagnostic d'accès",
      noDiagnostic: "aucun",
      noParent: "Ce nœud est la racine.",
      noChildren: "Aucun enfant direct.",
      rootPath: "(racine)",
      kinds: {
        root: "racine",
        directory: "dossier",
        file: "fichier",
        skipped: "ignoré",
      },
    } satisfies PanelStrings,
  },
} as const;

const t = strings.fr;

function fixtureLabel(fixture: FixtureSummary): string {
  return `${fixture.labelFr} · ${fixture.plannedNodes} ${t.nodes} (${t.ceiling} ${fixture.maxNodes})`;
}

export default function MapApp() {
  const [fixtures, setFixtures] = useState<FixtureSummary[]>([]);
  const [host, setHost] = useState<HostInfo | null>(null);
  const [activeFixture, setActiveFixture] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<MapSnapshot | null>(null);
  const [report, setReport] = useState<MapBuildReport | null>(null);
  const [integrity, setIntegrity] = useState<FixtureIntegrity | null>(null);
  const [selfCheck, setSelfCheck] = useState<MapSelfCheck | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<NodeDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [viewport, setViewport] = useState<Viewport>({ width: 1, height: 1 });
  const [view, setView] = useState<View>({ scale: 1, tx: 0, ty: 0 });
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [measurement, setMeasurement] = useState<FixtureMeasurement[] | null>(null);
  const [measuring, setMeasuring] = useState(false);

  // The measurement loop drives the same state the interface does, so what it
  // times is what a person would experience — not a parallel code path.
  const viewRef = useRef(view);
  viewRef.current = view;
  const viewportRef = useRef(viewport);
  viewportRef.current = viewport;

  const world: Rect = useMemo(
    () => ({
      x: 0,
      y: 0,
      w: snapshot?.layoutWidth ?? 1,
      h: snapshot?.layoutHeight ?? 1,
    }),
    [snapshot],
  );

  const hierarchy = useMemo(
    () => (snapshot ? buildHierarchy(snapshot.nodes, snapshot.rootId) : null),
    [snapshot],
  );

  useEffect(() => {
    document.documentElement.lang = "fr";
    Promise.all([
      invoke<FixtureSummary[]>("map_fixtures"),
      invoke<HostInfo>("map_host_info"),
    ])
      .then(([nextFixtures, nextHost]) => {
        setFixtures(nextFixtures);
        setHost(nextHost);
      })
      .catch((error) => setStatus(`Hôte indisponible : ${String(error)}`));
  }, []);

  const openFixture = useCallback(async (fixtureId: string, rebuild: boolean) => {
    setBusy(true);
    setStatus(null);
    try {
      const nextReport = await invoke<MapBuildReport>("map_open", { fixtureId, rebuild });
      const nextSnapshot = await invoke<MapSnapshot>("map_snapshot", { fixtureId });
      const nextIntegrity = await invoke<FixtureIntegrity>("map_integrity", { fixtureId });
      setReport(nextReport);
      setSnapshot(nextSnapshot);
      setIntegrity(nextIntegrity);
      setSelfCheck(null);
      setActiveFixture(fixtureId);
      setSelectedId(nextSnapshot.rootId);
      setMeasurement(null);
    } catch (error) {
      setStatus(`Échec : ${String(error)}`);
    } finally {
      setBusy(false);
    }
  }, []);

  // A fresh map opens fitted, and that view is the one `reset` reproduces.
  useEffect(() => {
    if (!snapshot) return;
    setView(fitView({ x: 0, y: 0, w: snapshot.layoutWidth, h: snapshot.layoutHeight }, viewport));
  }, [snapshot, viewport.width, viewport.height]);

  useEffect(() => {
    if (!activeFixture || selectedId === null) {
      setDetail(null);
      return;
    }
    let live = true;
    setDetailLoading(true);
    invoke<NodeDetail>("map_node_detail", { fixtureId: activeFixture, nodeId: selectedId })
      .then((next) => live && setDetail(next))
      .catch((error) => live && setStatus(`Détail indisponible : ${String(error)}`))
      .finally(() => live && setDetailLoading(false));
    return () => {
      live = false;
    };
  }, [activeFixture, selectedId]);

  const runSelfCheck = useCallback(async () => {
    if (!activeFixture) return;
    try {
      setSelfCheck(await invoke<MapSelfCheck>("map_self_check", { fixtureId: activeFixture }));
    } catch (error) {
      setStatus(`Contrôle impossible : ${String(error)}`);
    }
  }, [activeFixture]);

  /** `H9`, on every fixture, five runs each. */
  const runMeasurement = useCallback(async () => {
    if (measuring || fixtures.length === 0) return;
    setMeasuring(true);
    setStatus(null);
    const results: FixtureMeasurement[] = [];

    try {
      for (const fixture of fixtures) {
        const built = await invoke<MapBuildReport>("map_open", {
          fixtureId: fixture.id,
          rebuild: false,
        });
        const loaded = await invoke<MapSnapshot>("map_snapshot", { fixtureId: fixture.id });
        setReport(built);
        setSnapshot(loaded);
        setActiveFixture(fixture.id);
        setSelectedId(loaded.rootId);
        await afterPaint();

        const box: Rect = { x: 0, y: 0, w: loaded.layoutWidth, h: loaded.layoutHeight };
        const targets = selectionTargets(
          loaded.nodes.map((node) => node.id),
          SELECTIONS_PER_RUN,
        );
        const runs: RunSample[] = [];

        for (let run = 1; run <= RUNS_PER_FIXTURE; run += 1) {
          setView(fitView(box, viewportRef.current));
          for (let warm = 0; warm < WARMUP_FRAMES; warm += 1) await nextFrame();

          const frameTimesMs: number[] = [];
          let previous = performance.now();
          for (let frame = 0; frame < FRAMES_PER_RUN; frame += 1) {
            const step = scriptedStep(frame);
            const centre = {
              x: viewportRef.current.width / 2,
              y: viewportRef.current.height / 2,
            };
            const zoomed = zoomAbout(viewRef.current, step.zoom, centre, box, viewportRef.current);
            setView(panBy(zoomed, step.dx, step.dy, box, viewportRef.current));
            await nextFrame();
            const now = performance.now();
            frameTimesMs.push(now - previous);
            previous = now;
          }

          const selectionLatenciesMs: number[] = [];
          for (const target of targets) {
            const started = performance.now();
            setSelectedId(target);
            await afterPaint();
            selectionLatenciesMs.push(performance.now() - started);
          }

          runs.push({ run, frameTimesMs, selectionLatenciesMs });
        }

        results.push(aggregate(fixture.id, loaded.nodeCount, runs));
        setMeasurement([...results]);
      }

      const artifact = {
        task: "TASK-0016",
        criterion: "H9",
        capturedAtIso: new Date().toISOString(),
        host,
        framesPerRun: FRAMES_PER_RUN,
        runsPerFixture: RUNS_PER_FIXTURE,
        selectionsPerRun: SELECTIONS_PER_RUN,
        warmupFrames: WARMUP_FRAMES,
        note:
          "Frame time = interval between consecutive animation-frame callbacks during a " +
          "scripted pan and zoom, React commit included. Selection latency = request to the " +
          "start of the frame after the one painting the selection. No fps target is set by H9.",
        measurements: results,
      };
      const written = await invoke<string>("map_write_run_artifact", {
        name: "TASK-0016-H9-webview2.json",
        contents: JSON.stringify(artifact, null, 2),
      });
      setStatus(`Mesures écrites dans ${written}`);
    } catch (error) {
      setStatus(`Mesure interrompue : ${String(error)}`);
    } finally {
      setMeasuring(false);
    }
  }, [fixtures, host, measuring]);

  const selectedNode = selectedId === null ? null : hierarchy?.byId.get(selectedId) ?? null;

  const labelFor = useCallback(
    (node: MapNode) =>
      `${node.name}, ${t.panel.kinds[node.kind]}, ${t.depth} ${node.depth}, ` +
      `${node.childCount} ${t.panel.children.toLowerCase()}` +
      (node.accessDiagnostic ? `, ${t.panel.diagnostic} ${node.accessDiagnostic}` : ""),
    [],
  );

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <h1 className="app__title">{t.appTitle}</h1>
          <p className="app__subtitle">{t.subtitle}</p>
        </div>
        {host ? (
          <dl className="app__host">
            <div>
              <dt>{t.engine}</dt>
              <dd>
                WebView2 {host.webviewVersion} · {host.platform}
              </dd>
            </div>
            <div>
              <dt>Tauri · SQLite</dt>
              <dd>
                {host.tauriVersion} · {host.sqliteVersion}
              </dd>
            </div>
            <div>
              <dt>{t.sandbox}</dt>
              <dd className="app__sandbox">{host.sandboxRoot}</dd>
            </div>
          </dl>
        ) : null}
      </header>

      <nav className="app__fixtures" aria-label={t.fixtures}>
        <ul>
          {fixtures.map((fixture) => (
            <li key={fixture.id}>
              <button
                type="button"
                className="fixture"
                aria-pressed={fixture.id === activeFixture}
                disabled={busy || measuring}
                onClick={() => openFixture(fixture.id, false)}
              >
                <span className="fixture__name">{fixture.labelFr}</span>
                <span className="fixture__meta">{fixtureLabel(fixture)}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="app__actions">
          <button
            type="button"
            disabled={!activeFixture || busy || measuring}
            onClick={() => activeFixture && openFixture(activeFixture, true)}
          >
            {busy ? t.building : t.rebuild}
          </button>
          <button type="button" disabled={!activeFixture || measuring} onClick={runSelfCheck}>
            {t.selfCheck}
          </button>
          <button type="button" disabled={measuring || busy} onClick={runMeasurement}>
            {measuring ? t.measuring : t.measure}
          </button>
        </div>
      </nav>

      {status ? (
        <p className="app__status" role="status">
          {status}
        </p>
      ) : null}

      {report ? (
        <section className="app__report" aria-label="Rapport de construction">
          <span>
            {report.nodeCount} {t.nodes} / {t.ceiling} {report.nodeCeiling}
          </span>
          <span>
            {t.depth} {report.maxDepth} / {report.depthCeiling}
          </span>
          <span>
            {t.scan} {report.scanMs.toFixed(1)} ms · {t.layout} {report.layoutMs.toFixed(1)} ms ·{" "}
            {t.index} {report.indexMs.toFixed(1)} ms
          </span>
          <span className={report.readOnlyConfirmed ? "ok" : "ko"}>
            {report.readOnlyConfirmed ? t.readOnly : t.readOnlyFailed}
          </span>
          {integrity ? (
            <span className={integrity.filetopoArtifacts.length === 0 ? "ok" : "ko"}>
              {integrity.filetopoArtifacts.length === 0 ? t.noArtifacts : t.artifactsFound}
            </span>
          ) : null}
        </section>
      ) : null}

      {selfCheck ? (
        <section className="app__report" aria-label="Contrôle H1 à H5">
          <span className={selfCheck.pathsAgree ? "ok" : "ko"}>
            H1 · plan {selfCheck.plannedPaths} / disque {selfCheck.observedPaths} / index{" "}
            {selfCheck.indexedPaths}
          </span>
          <span className={selfCheck.layoutViolations.length === 0 ? "ok" : "ko"}>
            H2 · {selfCheck.layoutViolations.length} violation(s)
          </span>
          <span className={selfCheck.hierarchyMismatches.length === 0 ? "ok" : "ko"}>
            H3 · {selfCheck.hierarchyMismatches.length} écart(s)
          </span>
          <span className={selfCheck.detailMismatches.length === 0 ? "ok" : "ko"}>
            H5 · {selfCheck.detailMismatches.length} écart(s)
          </span>
        </section>
      ) : null}

      <main className="app__main">
        <div className="app__map">
          <div className="toolbar" role="toolbar" aria-label={t.map}>
            <button
              type="button"
              onClick={() =>
                setView((current) =>
                  zoomAbout(
                    current,
                    1.35,
                    { x: viewport.width / 2, y: viewport.height / 2 },
                    world,
                    viewport,
                  ),
                )
              }
            >
              {t.zoomIn}
            </button>
            <button
              type="button"
              onClick={() =>
                setView((current) =>
                  zoomAbout(
                    current,
                    1 / 1.35,
                    { x: viewport.width / 2, y: viewport.height / 2 },
                    world,
                    viewport,
                  ),
                )
              }
            >
              {t.zoomOut}
            </button>
            <button type="button" onClick={() => setView(fitView(world, viewport))}>
              {t.fit}
            </button>
            <button
              type="button"
              disabled={!selectedNode}
              onClick={() => selectedNode && setView(fitToBox(selectedNode.rect, world, viewport))}
            >
              {t.fitSelection}
            </button>
            <button type="button" onClick={() => setView(fitView(world, viewport))}>
              {t.reset}
            </button>
            <button
              type="button"
              disabled={!snapshot}
              onClick={() => snapshot && setSelectedId(snapshot.rootId)}
            >
              {t.selectRoot}
            </button>
          </div>

          {hierarchy && snapshot ? (
            <MapView
              hierarchy={hierarchy}
              world={world}
              view={view}
              viewport={viewport}
              selectedId={selectedId}
              onViewChange={setView}
              onSelect={setSelectedId}
              onViewportChange={setViewport}
              labelFor={labelFor}
              ariaLabel={`${t.map} — ${snapshot.label}`}
            />
          ) : (
            <p className="app__empty">{t.fixtures} — {t.open}</p>
          )}

          <p className="toolbar__hint">
            <strong>{t.keyboardTitle} :</strong> {t.keyboard}
          </p>
        </div>

        <aside className="app__aside">
          <DetailsPanel
            detail={detail}
            loading={detailLoading}
            onSelect={setSelectedId}
            locale="fr"
            strings={t.panel}
          />

          {measurement ? (
            <section className="measure" aria-label="Mesures H9">
              <h2>H9 · WebView2</h2>
              <table>
                <thead>
                  <tr>
                    <th scope="col">Fixture</th>
                    <th scope="col">Image méd.</th>
                    <th scope="col">Image min–max</th>
                    <th scope="col">Sélection méd.</th>
                  </tr>
                </thead>
                <tbody>
                  {measurement.map((entry) => (
                    <tr key={entry.fixtureId}>
                      <th scope="row">{entry.fixtureId}</th>
                      <td>{entry.frameTime.median.toFixed(2)} ms</td>
                      <td>
                        {entry.frameTime.min.toFixed(2)} – {entry.frameTime.max.toFixed(2)} ms
                      </td>
                      <td>{entry.selectionLatency.median.toFixed(2)} ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ) : null}
        </aside>
      </main>
    </div>
  );
}
