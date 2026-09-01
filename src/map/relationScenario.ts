/**
 * `J12` of `TASK-0017`, replayed against the real host, unattended.
 *
 * Driven through the **same** DOM and the **same** commands a person would
 * use: the map's own key handler receives real `keydown` events, the panel's
 * buttons receive real click events, and every count is read back from the
 * store rather than recomputed here.
 *
 * What the run cannot do honestly, it says. A script cannot forge a *trusted*
 * `Enter`, so a panel entry's keyboard reachability is demonstrated by focus,
 * and its activation by the button's own activation behaviour — the one
 * `Enter` triggers. The map's arrow keys, by contrast, are exercised for real:
 * the component's own handler receives the events.
 */

import { afterPaint } from "./measure";
import type {
  HostInfo,
  MapSnapshot,
  NodeRelations,
  RelationsOverview,
  RelationsSelfCheck,
} from "./types";

export interface ScenarioDeps {
  invoke: <T>(command: string, args?: Record<string, unknown>) => Promise<T>;
  host: HostInfo | null;
  openFixture: (fixtureId: string, rebuild: boolean) => Promise<void>;
  setSelectedId: (nodeId: number) => void;
  setStatus: (message: string) => void;
  log: (level: "info" | "error", message: string) => void;
}

const FIXTURE = "quasi-empty";
const PIVOT_PATH = "dossier-a/note-1.txt";

async function settle(): Promise<void> {
  await afterPaint();
  await afterPaint();
}

function textOf(selector: string): string {
  return document.querySelector(selector)?.textContent?.trim() ?? "";
}

function countOf(selector: string): number {
  return document.querySelectorAll(selector).length;
}

function styleOf(
  selector: string,
  property: "opacity" | "fillOpacity" | "strokeOpacity" | "strokeDasharray" | "strokeWidth",
): string | null {
  const element = document.querySelector(selector);
  return element ? window.getComputedStyle(element)[property] : null;
}

/**
 * Waits, in frames, until the screen actually shows what was asked for.
 *
 * The panel reads its relations through a command, so a selection is on screen
 * one or more frames before the panel that describes it is. The first run of
 * this scenario read the panel too early and published a `0 / 0` that was the
 * previous selection's — a measurement defect of exactly the kind `TASK-0016`
 * §13.4 documents. Reporting rather than throwing: if the wait times out the
 * evidence says so, and the reader sees a stale reading for what it is.
 */
async function waitUntil(
  predicate: () => boolean,
  budgetMs = 5_000,
): Promise<{ settled: boolean; waitedMs: number; frames: number }> {
  // Bounded in **time**, not in frames: a frame lasts 4 ms on a 240 Hz screen
  // and 16 ms on a 60 Hz one, so a frame budget would be a different wait on
  // every machine — and on this one it was a single second, too short for a
  // command round trip.
  const started = performance.now();
  let frames = 0;
  while (performance.now() - started < budgetMs) {
    if (predicate()) return { settled: true, waitedMs: performance.now() - started, frames };
    await afterPaint();
    frames += 1;
  }
  return { settled: predicate(), waitedMs: performance.now() - started, frames };
}

export async function runRelationScenario(deps: ScenarioDeps): Promise<void> {
  const { invoke, host, openFixture, setSelectedId, setStatus, log } = deps;
  const evidence: Record<string, unknown> = { fixtureId: FIXTURE };

  try {
    log("info", "J12: ouverture de la fixture et des relations");
    await openFixture(FIXTURE, false);
    await settle();

    const snapshot = await invoke<MapSnapshot>("map_snapshot", { fixtureId: FIXTURE });
    const overview = await invoke<RelationsOverview>("map_relations_open", {
      fixtureId: FIXTURE,
    });
    const nodeIdOf = (relativePath: string) =>
      snapshot.nodes.find((node) => node.relativePath === relativePath)?.id ?? null;

    evidence.overview = {
      established: overview.established.length,
      deterministic: overview.deterministicCount,
      approved: overview.approvedCount,
      pendingSuggestions: overview.pendingSuggestionCount,
      unresolvedEndpoints: overview.unresolvedEndpoints,
      endpointKeyScheme: overview.endpointKeyScheme,
      deterministicDigest: overview.deterministicDigest,
      rules: overview.rules,
    };

    // 1. A node with relations in both directions.
    const pivotId = nodeIdOf(PIVOT_PATH);
    if (pivotId === null) throw new Error(`noeud introuvable: ${PIVOT_PATH}`);
    setSelectedId(pivotId);
    await settle();

    const pivot = await invoke<NodeRelations>("map_relations_for_node", {
      fixtureId: FIXTURE,
      nodeId: pivotId,
    });
    evidence.pivot = {
      relativePath: PIVOT_PATH,
      outgoingCount: pivot.outgoingCount,
      incomingCount: pivot.incomingCount,
      pendingSuggestions: pivot.suggestions.map((entry) => entry.suggestionKey),
      hasBothDirections: pivot.outgoingCount > 0 && pivot.incomingCount > 0,
    };

    // 2. The panel, read off the screen — but only once the screen has caught
    //    up with the selection.
    const panelSettled = await waitUntil(
      () =>
        textOf('[data-testid="relation-totals"]').startsWith(
          `${pivot.outgoingCount} sortante(s)`,
        ) && countOf(".relations__direction .relation__link") === pivot.outgoingCount + pivot.incomingCount,
    );
    evidence.panel = {
      settled: panelSettled.settled,
      waitedMs: Math.round(panelSettled.waitedMs),
      directionSections: [...document.querySelectorAll(".relations__direction")].map(
        (section) => section.getAttribute("aria-label") ?? "",
      ),
      entryCount: countOf(".relations__direction .relation__link"),
      provenanceLabels: [...document.querySelectorAll(".relation__provenance")].map(
        (element) => element.textContent?.trim() ?? "",
      ),
      ruleLines: [...document.querySelectorAll(".relation__rule")].map(
        (element) => element.textContent?.trim() ?? "",
      ),
      totals: textOf('[data-testid="relation-totals"]'),
    };

    // 3. The map's own keyboard, genuinely exercised: real `keydown` events on
    //    the focusable widget, handled by the component's own handler.
    const canvas = document.querySelector<SVGSVGElement>(".map-view__canvas");
    canvas?.focus();
    const activeBefore = canvas?.getAttribute("aria-activedescendant") ?? null;
    canvas?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
    await settle();
    const activeAfterUp = canvas?.getAttribute("aria-activedescendant") ?? null;
    canvas?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    await settle();
    evidence.mapKeyboard = {
      focusReached: document.activeElement === canvas,
      activeBefore,
      activeAfterArrowUp: activeAfterUp,
      activeAfterArrowDown: canvas?.getAttribute("aria-activedescendant") ?? null,
      selectionMoved: activeBefore !== activeAfterUp,
    };

    // 4. One relation traversed from the panel, and the endpoint it selects.
    setSelectedId(pivotId);
    await settle();
    await waitUntil(() => countOf(".relations__direction .relation__link") > 0);
    const entry = document.querySelector<HTMLButtonElement>(
      ".relations__direction .relation__link",
    );
    if (!entry) {
      throw new Error(
        `aucune entree de relation dans le panneau apres ${Math.round(
          panelSettled.waitedMs,
        )} ms d'attente; panneau stabilise=${panelSettled.settled}`,
      );
    }
    entry.focus();
    const entryLabel = entry.textContent?.trim() ?? "";
    const entryReachedByFocus = document.activeElement === entry;
    entry.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await settle();
    const activeAfterEntry = canvas?.getAttribute("aria-activedescendant") ?? null;
    evidence.traversal = {
      entryLabel,
      entryTag: entry.tagName,
      entryDisabled: entry.disabled,
      entryReachedByFocus,
      activationMechanism:
        "HTMLButtonElement activation behaviour, the one Enter triggers; a script cannot " +
        "forge a trusted key activation and this run does not pretend to",
      activeDescendantBefore: `map-node-${pivotId}`,
      activeDescendantAfterActivation: activeAfterEntry,
      selectionFollowedTheRelation: activeAfterEntry !== `map-node-${pivotId}`,
    };

    // 5. Accentuation, counted on the rendered map.
    //
    //    Attenuation lives on the rectangle's fill and stroke opacity, not on
    //    the group's `opacity`: the first run read the group and published a
    //    flat `1` that said nothing. The stroke pattern is read too, because
    //    that is the part that does not rely on colour.
    evidence.accentuation = {
      selected: countOf(".map-node--selected"),
      relatedHierarchy: countOf(".map-node--related"),
      linkedByRelation: countOf(".map-node--linked"),
      attenuated: countOf(".map-node--plain"),
      attenuatedFillOpacity: styleOf(".map-node--plain rect", "fillOpacity"),
      attenuatedStrokeOpacity: styleOf(".map-node--plain rect", "strokeOpacity"),
      selectedFillOpacity: styleOf(".map-node--selected rect", "fillOpacity"),
      selectedStrokeWidth: styleOf(".map-node--selected rect", "strokeWidth"),
      relatedStrokeWidth: styleOf(".map-node--related rect", "strokeWidth"),
      linkedStrokeWidth: styleOf(".map-node--linked rect", "strokeWidth"),
      linkedStrokeDashArray: styleOf(".map-node--linked rect", "strokeDasharray"),
      attenuatedStrokeDashArray: styleOf(".map-node--plain rect", "strokeDasharray"),
      attenuatedKeepsAccessibleName:
        (document.querySelector(".map-node--plain")?.getAttribute("aria-label") ?? "").length > 0,
      attenuatedStaysInTheTree: countOf('.map-node--plain[role="treeitem"]') > 0,
    };

    // 6. Suggestions on the map, distinct from established relations without
    //    relying on colour: no arrow head, a dashed stroke, open rings.
    evidence.suggestionRendering = {
      establishedEdges: countOf(".map-edge--established"),
      suggestionEdges: countOf(".map-edge--suggestion"),
      establishedArrowHeads: countOf(".map-edge--established .map-edge__arrow"),
      suggestionArrowHeads: countOf(".map-edge--suggestion .map-edge__arrow"),
      suggestionRings: countOf(".map-edge--suggestion .map-edge__ring"),
      establishedDashArray: styleOf(".map-edge--established .map-edge__line", "strokeDasharray"),
      suggestionDashArray: styleOf(".map-edge--suggestion .map-edge__line", "strokeDasharray"),
      suggestionCardsOnScreen: countOf(".suggestion"),
      suggestionTagText: textOf(".suggestion__tag"),
    };

    // 7. Approval, with the counts before and after — both read from the store.
    const pending = overview.pendingSuggestions[0];
    if (!pending) throw new Error("aucune suggestion en attente a approuver");
    const holderId = pending.source.nodeId;
    if (holderId === null) throw new Error("suggestion sans extremite resolue");
    setSelectedId(holderId);
    await settle();

    const before = await invoke<NodeRelations>("map_relations_for_node", {
      fixtureId: FIXTURE,
      nodeId: holderId,
    });
    await waitUntil(() =>
      [...document.querySelectorAll<HTMLButtonElement>(".suggestion__approve")].some((button) =>
        button.textContent?.includes(pending.suggestionKey),
      ),
    );
    const approveButton = [
      ...document.querySelectorAll<HTMLButtonElement>(".suggestion__approve"),
    ].find((button) => button.textContent?.includes(pending.suggestionKey));
    if (!approveButton) {
      throw new Error(`bouton d'approbation absent: ${pending.suggestionKey}`);
    }
    approveButton.focus();
    const approveButtonReachedByFocus = document.activeElement === approveButton;
    approveButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    const approvalSettled = await waitUntil(
      () =>
        ![...document.querySelectorAll(".suggestion__approve")].some((button) =>
          button.textContent?.includes(pending.suggestionKey),
        ),
    );

    const after = await invoke<NodeRelations>("map_relations_for_node", {
      fixtureId: FIXTURE,
      nodeId: holderId,
    });
    const created = after.outgoing.find(
      (candidate) =>
        candidate.provenance === "APPROVED" && candidate.other.key === pending.target.key,
    );
    const countedBefore = before.outgoing.some(
      (candidate) => candidate.other.key === pending.target.key,
    );

    evidence.approval = {
      suggestionKey: pending.suggestionKey,
      approveButtonReachedByFocus,
      panelSettledAfterApproval: approvalSettled.settled,
      waitedMsAfterApproval: Math.round(approvalSettled.waitedMs),
      beforeOutgoing: before.outgoingCount,
      beforeIncoming: before.incomingCount,
      beforePendingSuggestions: before.suggestions.map((item) => item.suggestionKey),
      beforeCountedAmongEstablished: countedBefore,
      afterOutgoing: after.outgoingCount,
      afterIncoming: after.incomingCount,
      afterPendingSuggestions: after.suggestions.map((item) => item.suggestionKey),
      createdProvenance: created?.provenance ?? null,
      createdRuleName: created?.ruleName ?? null,
      enteredCountsOnlyAfterApproval:
        !countedBefore &&
        after.outgoingCount === before.outgoingCount + 1 &&
        created?.provenance === "APPROVED",
    };

    // 8. The self-check, replayed in the real host.
    evidence.selfCheck = await invoke<RelationsSelfCheck>("map_relations_self_check", {
      fixtureId: FIXTURE,
    });

    const written = await invoke<string>("map_write_run_artifact", {
      name: "TASK-0017-J12-webview2.json",
      contents: JSON.stringify(
        {
          task: "TASK-0017",
          criterion: "J12",
          capturedAtIso: new Date().toISOString(),
          host,
          evidence,
        },
        null,
        2,
      ),
    });
    log("info", `J12: scenario termine, artefact ecrit: ${written}`);
    setStatus(`Scénario J12 écrit dans ${written}`);
  } catch (error) {
    // A failed scenario is still a result, and it is written down: an artefact
    // saying why nothing was proved beats a missing file somebody has to guess
    // about.
    log("error", `J12: scenario interrompu: ${String(error)}`);
    setStatus(`Scénario J12 interrompu : ${String(error)}`);
    try {
      await invoke<string>("map_write_run_artifact", {
        name: "TASK-0017-J12-webview2-abandon.json",
        contents: JSON.stringify(
          {
            task: "TASK-0017",
            criterion: "J12",
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
