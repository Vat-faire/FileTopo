/**
 * `K12` of `TASK-0018`, replayed against the real host, unattended.
 *
 * The twelve steps of §4.8 run in the order they were frozen, driven through
 * the **same** selector and the **same** commands a person would use. Every
 * count comes back from a command; nothing here recomputes one.
 *
 * **Two passes, because step 11 says "la redémarrer".** A restart cannot be
 * faked from inside a page: steps 1 to 9 run in the first process and write
 * their evidence, the host is really closed, and steps 10 to 12 run in the
 * second process and read the catalogue back. `scripts/k12-run-real-host.ps1`
 * is what closes and relaunches; the two artefacts stand on their own and name
 * the process that produced them.
 *
 * **`K10` — a real keystroke.** Switching brains in this scenario is done by
 * keys the operating system delivers, not by anything the page dispatches:
 * the selector is focused, a marker is printed, and
 * `scripts/j12-send-real-key.ps1` sends the key through `WScript.Shell`. The
 * same three instruments as `J12` are read — `isTrusted`, the count of
 * programmatic clicks over the whole window, and the observable change. If the
 * keystroke never arrives, the pass fails; it never falls back to a click.
 */

import { afterPaint } from "./measure";
import { pressRealKey, waitUntil, type RealKeyEvidence, type ScenarioLog } from "./realInput";
import { k12Artifact } from "./runArtifacts";
import { sameBrainSession, type BrainSessionState } from "./brainSession";
import type {
  BrainCatalogView,
  BrainRecord,
  HostInfo,
  MapBuildReport,
  MapSnapshot,
  NodeRelations,
  RelationsOverview,
} from "./types";
import type { View } from "./viewState";

export interface BrainScenarioDeps {
  invoke: <T>(command: string, args?: Record<string, unknown>) => Promise<T>;
  host: HostInfo | null;
  /** The application's own switch, so the scenario drives the product. */
  openBrain: (brainId: string, rebuild: boolean) => Promise<void>;
  setSelectedId: (nodeId: number) => void;
  setView: (view: View) => void;
  /** What the page currently holds, read at the moment it is asked for. */
  readSession: () => BrainSessionState;
  setStatus: (message: string) => void;
  log: ScenarioLog;
}

const MARKER = "K12-KEY-READY";

/** The frozen node counts of §4.8 `K4`. */
const EXPECTED_NODES: Record<string, number> = {
  "brain-alpha": 12,
  "brain-beta": 157,
  "brain-gamma": 12,
};

/** The order §4.8 `K12` step 2 freezes. */
const SWITCH_ORDER = ["brain-alpha", "brain-beta", "brain-gamma", "brain-alpha"] as const;

/** The brain whose metadata is edited, so step 12 has something to confirm. */
const RENAMED_BRAIN = "brain-beta";
const RENAMED_TO = {
  displayName: "Cerveau Bêta renommé K7",
  color: "#2E5FA3",
  icon: "◧",
};

async function settle(): Promise<void> {
  await afterPaint();
  await afterPaint();
}

function trigger(): HTMLButtonElement | null {
  return document.querySelector<HTMLButtonElement>('[data-testid="brain-trigger"]');
}

function triggerText(): string {
  return trigger()?.textContent?.trim() ?? "";
}

/**
 * Waits until the selector can actually take a key.
 *
 * The trigger is disabled while a brain is loading, and a disabled button
 * cannot receive focus — so a keystroke sent to it goes nowhere. The first
 * real run of this scenario pressed the key while the boot switch was still in
 * flight, waited ninety seconds for a menu that could not open, and recorded
 * `focus atteint=false`. That reading was right; the scenario was wrong to
 * have asked so early.
 */
async function waitForSelectorReady(budgetMs = 60_000): Promise<boolean> {
  const outcome = await waitUntil(() => {
    const element = trigger();
    return element !== null && !element.disabled;
  }, budgetMs);
  return outcome.settled;
}

/**
 * Switches to a brain **with a real keystroke**, through the selector.
 *
 * The menu is opened by a real key, the target entry is focused, and a second
 * real key activates it. Two keystrokes rather than one, because that is what
 * the control actually costs a person — and because `K10` asks that a real
 * keystroke be able to change brain, not that the page be able to.
 */
async function switchByRealKey(
  brainId: string,
  expectedName: string,
  log: ScenarioLog,
  /** Where a failure records what it saw, before it throws. */
  failures: unknown[],
): Promise<{ open: RealKeyEvidence; choose: RealKeyEvidence }> {
  if (!(await waitForSelectorReady())) {
    failures.push({ brainId, phase: "selecteur indisponible", evidence: null });
    throw new Error("K10: le selecteur de cerveau est reste indisponible");
  }
  const control = trigger();
  if (!control) throw new Error("selecteur de cerveau absent");

  // 1. Open the menu. A real down-arrow on the trigger is the documented
  //    gesture, and it is the operating system that delivers it.
  const open = await pressRealKey(
    control,
    "{DOWN}",
    () => document.querySelector('[role="menu"]') !== null,
    log,
    90_000,
    MARKER,
  );
  if (!open.observedChange) {
    failures.push({ brainId, phase: "ouverture du menu", evidence: open });
    throw new Error(
      `K10: le menu ne s'est pas ouvert pour ${brainId} ` +
        `(focus atteint=${open.focusReached}, keydown=${String(open.keydownKey)}, ` +
        `keydownIsTrusted=${String(open.keydownIsTrusted)}, attente=${open.waitedMs} ms)`,
    );
  }

  // 2. Walk to the wanted entry with real arrow keys, one at a time, so the
  //    focus that ends up activated is one the operating system moved.
  const items = () =>
    [...document.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]')];
  const indexOf = (id: string) => items().findIndex((item) => item.dataset.brainId === id);
  const focusedIndex = () => items().findIndex((item) => item === document.activeElement);

  let guard = 0;
  while (focusedIndex() !== indexOf(brainId)) {
    if (guard > items().length + 2) {
      throw new Error(`K10: impossible d'atteindre ${brainId} au clavier`);
    }
    const before = focusedIndex();
    const focused = items()[before];
    if (!focused) throw new Error("K10: aucun element de menu n'a le focus");
    const step = await pressRealKey(
      focused,
      "{DOWN}",
      () => focusedIndex() !== before,
      log,
      90_000,
      MARKER,
    );
    if (!step.observedChange) {
      failures.push({ brainId, phase: "deplacement du focus", evidence: step });
      throw new Error("K10: la fleche n'a pas deplace le focus");
    }
    guard += 1;
  }

  // 3. Activate. What is watched for is the product having actually switched:
  //    the menu closed **and** the trigger naming the brain that was asked
  //    for. A closed menu on its own would also be true of Escape.
  const target = items()[indexOf(brainId)];
  if (!target) throw new Error(`K10: entree absente pour ${brainId}`);
  const choose = await pressRealKey(
    target,
    "{ENTER}",
    () =>
      document.querySelector('[role="menu"]') === null &&
      triggerText().includes(expectedName),
    log,
    90_000,
    MARKER,
  );
  if (choose.activationIsTrusted !== true) {
    failures.push({ brainId, phase: "activation", evidence: choose });
    throw new Error(
      `K10: aucune frappe reelle n'a active ${brainId} ` +
        `(isTrusted=${String(choose.activationIsTrusted)})`,
    );
  }
  if (!choose.observedChange) {
    failures.push({ brainId, phase: "bascule observee", evidence: choose });
    throw new Error(`K10: la frappe n'a pas bascule vers ${brainId} (${expectedName})`);
  }
  return { open, choose };
}

/**
 * Steps 1 to 9, in the first process.
 *
 * The evidence object comes **from the caller**. A pass that fails half way
 * has still established something — which switch worked, which key was
 * trusted, what the counts were — and that has to reach the artefact rather
 * than die with the exception. The first run of this scenario threw on the
 * very first keystroke and published nothing at all, which said far less than
 * it knew.
 */
async function firstPass(
  deps: BrainScenarioDeps,
  evidence: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const { invoke, openBrain, setSelectedId, setView, readSession, log } = deps;
  evidence.steps = "K12.1 a K12.9";

  // --- 1. start on the active brain ----------------------------------------
  const catalogAtStart = await invoke<BrainCatalogView>("map_brains");
  // The boot switch has to finish first, or what is read is a loading label
  // rather than the brain the application started on.
  evidence.step1_selectorReady = await waitForSelectorReady();
  evidence.step1_start = {
    activeBrainId: catalogAtStart.activeBrainId,
    catalogPath: catalogAtStart.catalogPath,
    brainsInCatalogue: catalogAtStart.brains.length,
    schemaVersion: catalogAtStart.schemaVersion,
    triggerShows: triggerText(),
    startedOnTheActiveBrain: triggerText().includes(
      catalogAtStart.brains.find((b) => b.brainId === catalogAtStart.activeBrainId)
        ?.displayName ?? " ",
    ),
  };

  // --- 2, 3, 4. switch by real keystroke, counts, names and icons -----------
  const switches: unknown[] = [];
  const keyFailures: unknown[] = [];
  evidence.step2to4_keyFailures = keyFailures;
  evidence.step2to4_switches = switches;
  for (const brainId of SWITCH_ORDER) {
    const record = catalogAtStart.brains.find((brain) => brain.brainId === brainId);
    if (!record) throw new Error(`K12: cerveau absent du catalogue: ${brainId}`);
    log("info", `K12: bascule vers ${brainId} par frappe reelle`);
    const keys = await switchByRealKey(brainId, record.displayName, log, keyFailures);
    await settle();
    await waitForSelectorReady();
    // The counts come back from the commands, not from the screen.
    const snapshot = await invoke<MapSnapshot>("map_snapshot", { brainId });
    const report = await invoke<MapBuildReport>("map_open", { brainId, rebuild: false });
    const shown = triggerText();
    switches.push({
      brainId,
      expectedNodes: EXPECTED_NODES[brainId],
      snapshotNodes: snapshot.nodeCount,
      reportNodes: report.nodeCount,
      countMatchesFrozenExpectation: snapshot.nodeCount === EXPECTED_NODES[brainId],
      snapshotBelongsToThisBrain: snapshot.brainId === brainId,
      indexPath: report.indexPath,
      sourceRef: record.sourceRef,
      nameOnScreen: shown.includes(record.displayName),
      iconOnScreen: shown.includes(record.icon),
      activationIsTrusted: keys.choose.activationIsTrusted,
      keydownIsTrusted: keys.choose.keydownIsTrusted,
      programmaticClickCalls: keys.open.programmaticClickCalls + keys.choose.programmaticClickCalls,
      programmaticClickDispatches:
        keys.open.programmaticClickDispatches + keys.choose.programmaticClickDispatches,
    });
  }
  // Alpha and Gamma read the same source and must not share a file — `K3`,
  // read off the real reports rather than asserted.
  const indexPaths = switches.map((entry) => (entry as { indexPath: string }).indexPath);
  evidence.step3_k3_indexPathsDistinct =
    new Set(indexPaths).size === new Set(SWITCH_ORDER).size;

  // --- 5, 6. a different selection and view in Alpha and in Bêta -----------
  const leaveState = async (brainId: string, nodeIndex: number, view: View) => {
    await openBrain(brainId, false);
    await settle();
    const snapshot = await invoke<MapSnapshot>("map_snapshot", { brainId });
    const node = snapshot.nodes[nodeIndex] ?? snapshot.nodes[0];
    setSelectedId(node.id);
    setView(view);
    await settle();
    return { selectedId: node.id, view };
  };

  const alphaLeft = await leaveState("brain-alpha", 5, { scale: 2.25, tx: -140, ty: 60 });
  const betaLeft = await leaveState("brain-beta", 40, { scale: 0.6, tx: 25, ty: -15 });

  await openBrain("brain-alpha", false);
  await settle();
  const alphaBack = readSession();
  await openBrain("brain-beta", false);
  await settle();
  const betaBack = readSession();

  evidence.step5to6_sessionState = {
    alphaLeft,
    alphaBack,
    alphaRestored: sameBrainSession(alphaBack, alphaLeft),
    betaLeft,
    betaBack,
    betaRestored: sameBrainSession(betaBack, betaLeft),
    // The point of `K8`: the two are different, and each came back its own.
    theTwoAreDifferent: !sameBrainSession(alphaLeft, betaLeft),
  };

  // --- 7. approve S-005 in Alpha -------------------------------------------
  await openBrain("brain-alpha", false);
  await settle();
  const alphaBefore = await invoke<RelationsOverview>("map_relations_open", {
    brainId: "brain-alpha",
  });
  await invoke<RelationsOverview>("map_relations_approve", {
    brainId: "brain-alpha",
    suggestionKey: "S-005",
  });
  const alphaAfter = await invoke<RelationsOverview>("map_relations_open", {
    brainId: "brain-alpha",
  });
  evidence.step7_approvalInAlpha = {
    beforeApproved: alphaBefore.approvedCount,
    beforePending: alphaBefore.pendingSuggestionCount,
    afterApproved: alphaAfter.approvedCount,
    afterPending: alphaAfter.pendingSuggestionCount,
    relationsPath: alphaAfter.relationsPath,
    movedByExactlyOne:
      alphaAfter.approvedCount === alphaBefore.approvedCount + 1 &&
      alphaAfter.pendingSuggestionCount === alphaBefore.pendingSuggestionCount - 1,
  };

  // --- 8. Gamma's own S-005 is still pending -------------------------------
  await openBrain("brain-gamma", false);
  await settle();
  const gamma = await invoke<RelationsOverview>("map_relations_open", {
    brainId: "brain-gamma",
  });
  const gammaPending = gamma.pendingSuggestions.map((entry) => entry.suggestionKey);
  evidence.step8_gammaUntouched = {
    approved: gamma.approvedCount,
    pending: gamma.pendingSuggestionCount,
    pendingKeys: gammaPending,
    relationsPath: gamma.relationsPath,
    sameSourceAsAlpha:
      catalogAtStart.brains.find((b) => b.brainId === "brain-gamma")?.sourceRef ===
      catalogAtStart.brains.find((b) => b.brainId === "brain-alpha")?.sourceRef,
    ownStore: gamma.relationsPath !== alphaAfter.relationsPath,
    s005StillPending: gammaPending.includes("S-005"),
  };

  // A node id valid in both brains, resolved in the one that was asked for.
  const gammaSnapshot = await invoke<MapSnapshot>("map_snapshot", { brainId: "brain-gamma" });
  const sharedId = gammaSnapshot.nodes[3]?.id ?? gammaSnapshot.rootId;
  const inGamma = await invoke<NodeRelations>("map_relations_for_node", {
    reference: { brainId: "brain-gamma", nodeId: sharedId },
  });
  const inAlpha = await invoke<NodeRelations>("map_relations_for_node", {
    reference: { brainId: "brain-alpha", nodeId: sharedId },
  });
  evidence.step8_k5_sharedNodeId = {
    nodeId: sharedId,
    gammaEndpointKey: inGamma.endpointKey,
    alphaEndpointKey: inAlpha.endpointKey,
    keysDiffer: inGamma.endpointKey !== inAlpha.endpointKey,
    gammaReferenceBrain: inGamma.reference.brainId,
    alphaReferenceBrain: inAlpha.reference.brainId,
  };

  // --- metadata, through the applicative path — K7, so step 12 can confirm --
  const renamed = await invoke<BrainRecord>("map_brain_update", {
    brainId: RENAMED_BRAIN,
    displayName: RENAMED_TO.displayName,
    color: RENAMED_TO.color,
    icon: RENAMED_TO.icon,
  });
  const afterRename = await invoke<BrainCatalogView>("map_brains");
  evidence.step9_metadata = {
    renamedBrain: renamed,
    othersUnchanged: afterRename.brains
      .filter((brain) => brain.brainId !== RENAMED_BRAIN)
      .map((brain) => ({
        brainId: brain.brainId,
        displayName: brain.displayName,
        color: brain.color,
        icon: brain.icon,
      })),
  };

  // --- 9. Gamma becomes the active brain -----------------------------------
  await openBrain("brain-gamma", false);
  await settle();
  const catalogAtEnd = await invoke<BrainCatalogView>("map_brains");
  evidence.step9_activeBrain = {
    activeBrainId: catalogAtEnd.activeBrainId,
    gammaIsActive: catalogAtEnd.activeBrainId === "brain-gamma",
    triggerShows: triggerText(),
  };

  return evidence;
}

/** Steps 10 to 12, in the **second** process, after a real restart. */
async function secondPass(
  deps: BrainScenarioDeps,
  evidence: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const { invoke } = deps;
  const catalog = await invoke<BrainCatalogView>("map_brains");
  const selectorReady = await waitForSelectorReady();
  const renamed = catalog.brains.find((brain) => brain.brainId === RENAMED_BRAIN) ?? null;
  const active = catalog.brains.find((brain) => brain.brainId === catalog.activeBrainId) ?? null;

  return Object.assign(evidence, {
    steps: "K12.10 a K12.12 — apres une fermeture et un redemarrage reels",
    selectorReady,
    activeBrainId: catalog.activeBrainId,
    gammaStillActive: catalog.activeBrainId === "brain-gamma",
    // The interface, not only the catalogue: `K9` asks for both.
    triggerShows: triggerText(),
    interfaceShowsTheActiveBrain: active ? triggerText().includes(active.displayName) : false,
    seededOnThisStart: catalog.seeded,
    seedCreatedNothing: catalog.seeded === 0,
    renamedBrain: renamed,
    metadataSurvived:
      renamed?.displayName === RENAMED_TO.displayName &&
      renamed?.color === RENAMED_TO.color &&
      renamed?.icon === RENAMED_TO.icon,
    // The seed must not have undone the rename — `K7`, after a real restart.
    otherBrains: catalog.brains
      .filter((brain) => brain.brainId !== RENAMED_BRAIN)
      .map((brain) => ({
        brainId: brain.brainId,
        displayName: brain.displayName,
        icon: brain.icon,
        color: brain.color,
      })),
  });
}

/**
 * Runs one pass of `K12` and writes its artefact.
 *
 * `pass` comes from the host — `FILETOPO_AUTO_BRAINS=1` or `=2` — because only
 * the host knows whether this process is the one before the restart or the one
 * after it.
 */
export async function runBrainScenario(
  deps: BrainScenarioDeps,
  pass: 1 | 2,
): Promise<void> {
  const { invoke, host, setStatus, log } = deps;
  // Filled in place, so a throw still leaves behind everything gathered up to
  // the point of failure.
  const evidence: Record<string, unknown> = { pass };

  try {
    log("info", `K12: debut de la passe ${pass}`);
    if (pass === 1) {
      await firstPass(deps, evidence);
    } else {
      await secondPass(deps, evidence);
    }

    const written = await invoke<string>("map_write_run_artifact", {
      name: k12Artifact(pass, "written"),
      contents: JSON.stringify(
        {
          task: "TASK-0018",
          criterion: "K12",
          pass,
          capturedAtIso: new Date().toISOString(),
          host,
          evidence,
        },
        null,
        2,
      ),
    });
    log("info", `K12: passe ${pass} terminee, artefact ecrit: ${written}`);
    setStatus(`Scénario K12 (passe ${pass}) écrit dans ${written}`);
  } catch (error) {
    // A failed pass is still a result, and it is written down.
    log("error", `K12: passe ${pass} interrompue: ${String(error)}`);
    setStatus(`Scénario K12 interrompu : ${String(error)}`);
    try {
      await invoke<string>("map_write_run_artifact", {
        name: k12Artifact(pass, "abandoned"),
        contents: JSON.stringify(
          {
            task: "TASK-0018",
            criterion: "K12",
            pass,
            outcome: "abandoned",
            reason: String(error),
            host,
            evidence,
          },
          null,
          2,
        ),
      });
    } catch {
      // The status line already carries the reason.
    }
  }
}
