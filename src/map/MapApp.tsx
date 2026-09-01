import { invoke } from "@tauri-apps/api/core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DetailsPanel, { type PanelStrings } from "./DetailsPanel";
import MapView from "./MapView";
import RelationsPanel from "./RelationsPanel";
import { buildHierarchy } from "./hierarchy";
import { establishedNeighbours, relationSegments } from "./relations";
import { runRelationScenario as runScenario } from "./relationScenario";
import {
  FRAMES_PER_RUN,
  RUNS_PER_FIXTURE,
  SELECTIONS_PER_RUN,
  WARMUP_FRAMES,
  aggregate,
  afterPaint,
  awaitLaidOutViewport,
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
  NodeRelations,
  Rect,
  RelationsOverview,
  RelationsSelfCheck,
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
    relationsCheck: "Contrôler J1–J5, J10",
    relations: "Relations",
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

/**
 * Sends a line to the host's terminal.
 *
 * Fire-and-forget on purpose: logging must never be able to fail a run.
 */
function hostLog(level: "info" | "error", message: string): void {
  void invoke("map_log", { level, message }).catch(() => {});
}

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
  // `TASK-0017`. `relations` is the whole graph of the open brain; `nodeRelations`
  // is what the panel shows for the selection. Both come back from the store —
  // nothing here increments a count of its own.
  const [relations, setRelations] = useState<RelationsOverview | null>(null);
  const [nodeRelations, setNodeRelations] = useState<NodeRelations | null>(null);
  const [relationsLoading, setRelationsLoading] = useState(false);
  const [approving, setApproving] = useState<string | null>(null);
  const [relationsCheck, setRelationsCheck] = useState<RelationsSelfCheck | null>(null);

  // The measurement loop drives the same state the interface does, so what it
  // times is what a person would experience — not a parallel code path.
  const viewRef = useRef(view);
  viewRef.current = view;
  const viewportRef = useRef(viewport);
  viewportRef.current = viewport;
  // Declared before `runMeasurement` exists so the auto-start effect above can
  // reach it without depending on declaration order.
  const runMeasurementRef = useRef<(() => Promise<void>) | null>(null);
  const runVerificationRef = useRef<(() => Promise<void>) | null>(null);
  const runRelationScenarioRef = useRef<(() => Promise<void>) | null>(null);

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

  // Anything the page throws becomes a line in the host log, so an unattended
  // run leaves a trace instead of a silent stall.
  useEffect(() => {
    const onError = (event: ErrorEvent) =>
      hostLog("error", `exception: ${event.message} @ ${event.filename}:${event.lineno}`);
    const onRejection = (event: PromiseRejectionEvent) =>
      hostLog("error", `promesse rejetée: ${String(event.reason)}`);
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = "fr";
    hostLog("info", "interface montée, lecture des fixtures et de l'hôte");
    Promise.all([
      invoke<FixtureSummary[]>("map_fixtures"),
      invoke<HostInfo>("map_host_info"),
    ])
      .then(([nextFixtures, nextHost]) => {
        setFixtures(nextFixtures);
        setHost(nextHost);
        hostLog(
          "info",
          `hôte prêt: ${nextFixtures.length} fixtures, WebView2 ${nextHost.webviewVersion}, ` +
            `mesure automatique=${nextHost.autoMeasure}, visibilité=${document.visibilityState}`,
        );
      })
      .catch((error) => {
        hostLog("error", `hôte indisponible: ${String(error)}`);
        setStatus(`Hôte indisponible : ${String(error)}`);
      });
  }, []);

  // Unattended runs: the host asked for a measurement or a verification, so
  // start it as soon as the fixtures are known. Same code paths as the buttons.
  const autoStarted = useRef(false);
  useEffect(() => {
    if (autoStarted.current || fixtures.length === 0 || !host) return;
    if (host.autoVerify) {
      autoStarted.current = true;
      hostLog("info", "démarrage automatique de la vérification H1–H7");
      void runVerificationRef.current?.();
      return;
    }
    if (host.autoRelations) {
      autoStarted.current = true;
      hostLog("info", "démarrage automatique du scénario J12");
      void runRelationScenarioRef.current?.();
      return;
    }
    if (host.autoMeasure) {
      autoStarted.current = true;
      hostLog("info", "démarrage automatique de la campagne H9");
      void runMeasurementRef.current?.();
    }
  }, [fixtures.length, host]);

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
      setRelationsCheck(null);
      // Relations are opened separately, and a fixture outside the frozen
      // relations scope is a *stated* outcome rather than an error banner.
      setRelationsLoading(true);
      try {
        setRelations(await invoke<RelationsOverview>("map_relations_open", { fixtureId }));
      } catch (error) {
        setRelations(null);
        hostLog("info", `relations indisponibles pour ${fixtureId}: ${String(error)}`);
      } finally {
        setRelationsLoading(false);
      }
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

  // The panel reads the relations of the selection from the store, on every
  // change of selection and after every approval. `relations` is in the
  // dependency list on purpose: an approval replaces it, and that is what makes
  // the panel show counts that came back rather than counts it guessed.
  useEffect(() => {
    if (!activeFixture || selectedId === null || !relations) {
      setNodeRelations(null);
      return;
    }
    let live = true;
    invoke<NodeRelations>("map_relations_for_node", {
      fixtureId: activeFixture,
      nodeId: selectedId,
    })
      .then((next) => live && setNodeRelations(next))
      .catch(() => live && setNodeRelations(null));
    return () => {
      live = false;
    };
  }, [activeFixture, relations, selectedId]);

  /**
   * The one explicit act that turns a suggestion into a relation.
   *
   * The whole overview is replaced by what the command returns, so the counts
   * on screen are the store's, never an optimistic increment.
   */
  const approveSuggestion = useCallback(
    async (suggestionKey: string) => {
      if (!activeFixture) return;
      setApproving(suggestionKey);
      try {
        const next = await invoke<RelationsOverview>("map_relations_approve", {
          fixtureId: activeFixture,
          suggestionKey,
        });
        setRelations(next);
        setStatus(`Suggestion ${suggestionKey} approuvée : elle est désormais une relation APPROVED.`);
      } catch (error) {
        setStatus(`Approbation refusée : ${String(error)}`);
      } finally {
        setApproving(null);
      }
    },
    [activeFixture],
  );

  const runRelationsCheck = useCallback(async () => {
    if (!activeFixture) return;
    try {
      setRelationsCheck(
        await invoke<RelationsSelfCheck>("map_relations_self_check", { fixtureId: activeFixture }),
      );
    } catch (error) {
      setStatus(`Contrôle des relations impossible : ${String(error)}`);
    }
  }, [activeFixture]);

  const runSelfCheck = useCallback(async () => {
    if (!activeFixture) return;
    try {
      setSelfCheck(await invoke<MapSelfCheck>("map_self_check", { fixtureId: activeFixture }));
    } catch (error) {
      setStatus(`Contrôle impossible : ${String(error)}`);
    }
  }, [activeFixture]);

  /**
   * Replays `H1` to `H7`, `H10` and `H11` against the running host, and writes
   * what it found.
   *
   * The unit tests already check the same properties in temporary directories.
   * This runs them where it actually matters — through the real commands, on
   * the real sandbox, in the engine that ships — and publishes the result
   * rather than asserting it away.
   */
  const runVerification = useCallback(async () => {
    if (fixtures.length === 0) return;
    const findings: unknown[] = [];
    try {
      for (const fixture of fixtures) {
        hostLog("info", `vérification ${fixture.id}: ouverture`);
        const first = await invoke<MapBuildReport>("map_open", {
          fixtureId: fixture.id,
          rebuild: false,
        });
        const check = await invoke<MapSelfCheck>("map_self_check", { fixtureId: fixture.id });
        const before = await invoke<FixtureIntegrity>("map_integrity", { fixtureId: fixture.id });

        hostLog("info", `vérification ${fixture.id}: index supprimé puis reconstruit`);
        const rebuilt = await invoke<MapBuildReport>("map_open", {
          fixtureId: fixture.id,
          rebuild: true,
        });
        const after = await invoke<FixtureIntegrity>("map_integrity", { fixtureId: fixture.id });

        const entry = {
          fixtureId: fixture.id,
          declaredCeiling: fixture.maxNodes,
          nodeCount: first.nodeCount,
          plannedNodes: first.plannedNodes,
          maxDepth: first.maxDepth,
          depthCeiling: first.depthCeiling,
          nodeCeiling: first.nodeCeiling,
          schemaVersion: first.schemaVersion,
          layoutInvocations: first.layoutInvocations,
          timingsMs: { scan: first.scanMs, layout: first.layoutMs, index: first.indexMs },
          rebuiltTimingsMs: {
            scan: rebuilt.scanMs,
            layout: rebuilt.layoutMs,
            index: rebuilt.indexMs,
          },
          h1_pathsAgree: check.pathsAgree,
          h1_counts: {
            planned: check.plannedPaths,
            onDisk: check.observedPaths,
            indexed: check.indexedPaths,
          },
          h1_missingFromIndex: check.missingFromIndex,
          h1_unexpectedInIndex: check.unexpectedInIndex,
          h2_layoutViolations: check.layoutViolations,
          h3_hierarchyMismatches: check.hierarchyMismatches,
          h5_detailMismatches: check.detailMismatches,
          h6_readOnlyConfirmed: first.readOnlyConfirmed && rebuilt.readOnlyConfirmed,
          h6_fingerprintBefore: first.fingerprintBefore,
          h6_fingerprintAfterRebuild: rebuilt.fingerprintAfter,
          h6_fingerprintUnchanged: first.fingerprintBefore === rebuilt.fingerprintAfter,
          h6_filetopoArtifactsInRoot: after.filetopoArtifacts,
          h7_digestBefore: first.reconstructibleDigest,
          h7_digestAfterRebuild: rebuilt.reconstructibleDigest,
          h7_equivalent: first.reconstructibleDigest === rebuilt.reconstructibleDigest,
          h7_nonReconstructible: rebuilt.nonReconstructible,
          h11_withinCeilings:
            first.nodeCount <= fixture.maxNodes &&
            first.nodeCount <= first.nodeCeiling &&
            first.maxDepth <= first.depthCeiling,
          integrityBefore: before,
        };
        findings.push(entry);
        hostLog(
          "info",
          `vérification ${fixture.id}: H1=${entry.h1_pathsAgree} ` +
            `H2=${entry.h2_layoutViolations.length} H3=${entry.h3_hierarchyMismatches.length} ` +
            `H5=${entry.h5_detailMismatches.length} H6=${entry.h6_fingerprintUnchanged} ` +
            `H7=${entry.h7_equivalent} H10=${entry.layoutInvocations} H11=${entry.h11_withinCeilings}`,
        );
      }

      const written = await invoke<string>("map_write_run_artifact", {
        name: "TASK-0016-H1-H7-verification.json",
        contents: JSON.stringify(
          {
            task: "TASK-0016",
            criteria: ["H1", "H2", "H3", "H5", "H6", "H7", "H8", "H10", "H11"],
            capturedAtIso: new Date().toISOString(),
            host,
            findings,
          },
          null,
          2,
        ),
      });
      hostLog("info", `vérification terminée, artefact écrit: ${written}`);
      setStatus(`Vérification écrite dans ${written}`);
    } catch (error) {
      hostLog("error", `vérification interrompue: ${String(error)}`);
      setStatus(`Vérification interrompue : ${String(error)}`);
    }
  }, [fixtures, host]);

  runVerificationRef.current = runVerification;

  /** `H9`, on every fixture, five runs each. */
  const runMeasurement = useCallback(async () => {
    if (measuring || fixtures.length === 0) return;
    setMeasuring(true);
    setStatus(null);
    const results: FixtureMeasurement[] = [];

    try {
      for (const fixture of fixtures) {
        hostLog("info", `fixture ${fixture.id}: ouverture`);
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
        const measuredViewport = await awaitLaidOutViewport(() => viewportRef.current);

        const box: Rect = { x: 0, y: 0, w: loaded.layoutWidth, h: loaded.layoutHeight };
        const targets = selectionTargets(
          loaded.nodes.map((node) => node.id),
          SELECTIONS_PER_RUN,
        );
        const runs: RunSample[] = [];

        hostLog(
          "info",
          `fixture ${fixture.id}: ${loaded.nodeCount} nœuds chargés, ` +
            `fenêtre ${viewportRef.current.width}x${viewportRef.current.height}`,
        );

        for (let run = 1; run <= RUNS_PER_FIXTURE; run += 1) {
          hostLog("info", `fixture ${fixture.id}: exécution ${run}/${RUNS_PER_FIXTURE}`);
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

        const summary = aggregate(fixture.id, loaded.nodeCount, measuredViewport, runs);
        results.push(summary);
        // Deliberately not published to the interface until the campaign ends:
        // showing the results table mid-run would reflow the page and measure
        // each fixture at a different map size.
        
        hostLog(
          "info",
          `fixture ${fixture.id}: terminé — image médiane ${summary.frameTime.median.toFixed(2)} ms, ` +
            `pire ${summary.worstFrameMs.toFixed(2)} ms, sélection médiane ` +
            `${summary.selectionLatency.median.toFixed(2)} ms`,
        );
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
      setMeasurement(results);
      setStatus(`Mesures écrites dans ${written}`);
      hostLog("info", `campagne terminée, artefact écrit: ${written}`);
    } catch (error) {
      // A failed campaign is still a result, and it is written down: an
      // artefact that says why nothing was measured is worth more than a
      // missing file somebody has to guess about.
      setStatus(`Mesure interrompue : ${String(error)}`);
      hostLog("error", `campagne interrompue: ${String(error)}`);
      try {
        await invoke<string>("map_write_run_artifact", {
          name: "TASK-0016-H9-webview2-abandon.json",
          contents: JSON.stringify(
            {
              task: "TASK-0016",
              criterion: "H9",
              outcome: "abandoned",
              reason: String(error),
              host,
              partialMeasurements: results,
            },
            null,
            2,
          ),
        });
      } catch {
        // Nothing further to do: the status line already carries the reason.
      }
    } finally {
      setMeasuring(false);
    }
  }, [fixtures, host, measuring]);

  runMeasurementRef.current = runMeasurement;

  const runRelationScenario = useCallback(
    () =>
      runScenario({
        invoke: (command, args) => invoke(command, args),
        host,
        openFixture,
        setSelectedId,
        setStatus,
        log: hostLog,
      }),
    [host, openFixture],
  );

  runRelationScenarioRef.current = runRelationScenario;

  const selectedNode = selectedId === null ? null : hierarchy?.byId.get(selectedId) ?? null;

  // Projected from the persisted rectangles. Rebuilt when the tree, the
  // relations or the selection change — never for a pan or a zoom, and never by
  // recomputing a layout.
  const relationNeighbours = useMemo(
    () => establishedNeighbours(relations, selectedId),
    [relations, selectedId],
  );
  const segments = useMemo(
    () => (hierarchy ? relationSegments(relations, hierarchy.byId, selectedId) : []),
    [hierarchy, relations, selectedId],
  );

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
          <button
            type="button"
            disabled={!activeFixture || !relations || measuring}
            onClick={runRelationsCheck}
          >
            {t.relationsCheck}
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

      {relationsCheck ? (
        <section className="app__report" aria-label="Contrôle J1 à J5 et J10">
          <span className={relationsCheck.allRejected ? "ok" : "ko"}>
            J1–J3 · {relationsCheck.rejections.filter((entry) => entry.rejected).length}/
            {relationsCheck.rejections.length} tentative(s) invalide(s) rejetée(s)
          </span>
          <span className={relationsCheck.suggestionsInEstablished.length === 0 ? "ok" : "ko"}>
            J2 · {relationsCheck.pendingSuggestionTotal} suggestion(s) en attente, hors des comptes
          </span>
          <span className={relationsCheck.replayStable ? "ok" : "ko"}>
            J3 · rejeu {relationsCheck.replayStable ? "identique" : "DIVERGENT"}
          </span>
          <span className={relationsCheck.countsAgree ? "ok" : "ko"}>
            J5 · {relationsCheck.counts.filter((entry) => entry.matches).length}/
            {relationsCheck.counts.length} nœud(s) conformes à l'attendu gelé
          </span>
          <span className={relationsCheck.inventedInverses.length === 0 ? "ok" : "ko"}>
            J5 · {relationsCheck.inventedInverses.length} inverse(s) inventé(s)
          </span>
          <span className={relationsCheck.unresolvedEndpoints.length === 0 ? "ok" : "ko"}>
            J10 · {relationsCheck.unresolvedEndpoints.length} extrémité(s) non résolue(s)
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
              segments={segments}
              relationNeighbours={relationNeighbours}
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

          <RelationsPanel
            relations={nodeRelations}
            loading={relationsLoading}
            inScope={relations !== null}
            onSelect={setSelectedId}
            onApprove={approveSuggestion}
            approving={approving}
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
