/**
 * Driving the composition bar and reading the composed canvas — `TASK-0019`.
 *
 * Two scenarios now drive the same control: the `K12` regression replay, which
 * used to drive the single brain selector `TASK-0019` §4.4 replaced, and `L12`,
 * which is about the composed view itself. **One implementation of « add a
 * brain with a real key », not two** — the same reason the artefact names live
 * in a single module: two spellings of one gesture eventually disagree, and the
 * disagreement is discovered in a run that cost forty minutes.
 *
 * **Nothing here fabricates an activation.** Every gesture goes through
 * `pressRealKey`, so the operating system delivers the key and `isTrusted` is
 * read rather than assumed. A helper that quietly fell back to `element.click()`
 * would make `L10` unfalsifiable.
 */

import { pressRealKey, waitUntil, type RealKeyEvidence, type ScenarioLog } from "./realInput";
import { afterPaint } from "./measure";

/** Two frames, which is what a composition change costs before it is on screen. */
export async function settle(): Promise<void> {
  await afterPaint();
  await afterPaint();
}

export function chipOf(brainId: string): HTMLButtonElement | null {
  return document.querySelector<HTMLButtonElement>(
    `[data-testid="composition-chip-${brainId}"]`,
  );
}

export function removeButtonOf(brainId: string): HTMLButtonElement | null {
  return document.querySelector<HTMLButtonElement>(
    `[data-testid="composition-remove-${brainId}"]`,
  );
}

export function addTrigger(): HTMLButtonElement | null {
  return document.querySelector<HTMLButtonElement>('[data-testid="composition-add-trigger"]');
}

/** The brains the bar currently shows, in the order it shows them. */
export function displayedBrainIds(): string[] {
  return [...document.querySelectorAll<HTMLElement>(".composition__focus")]
    .map((element) => element.dataset.brainId ?? "")
    .filter((brainId) => brainId.length > 0);
}

/** What the whole bar reads as — the replacement for the old trigger label. */
export function compositionText(): string {
  return document.querySelector('[data-testid="composition-bar"]')?.textContent?.trim() ?? "";
}

/** What the **focused** chip reads as: name, icon, and the word « actif ». */
export function focusedChipText(): string {
  return (
    document.querySelector('.composition__focus[aria-current="true"]')?.textContent?.trim() ?? ""
  );
}

/** The brain the bar marks with `aria-current`, which is the active one. */
export function focusedChipBrainId(): string | null {
  return (
    document.querySelector<HTMLElement>('.composition__focus[aria-current="true"]')?.dataset
      .brainId ?? null
  );
}

/** The status line, where a refused composition explains itself — `L1`, `L6`. */
export function statusText(): string {
  return document.querySelector('[role="status"]')?.textContent?.trim() ?? "";
}

/**
 * Waits until the composition bar can actually take a key.
 *
 * Its buttons are disabled while a composition is being applied, and a disabled
 * button cannot receive focus — so a keystroke sent to it goes nowhere. The
 * first real run of `K12`, against the selector this bar replaced, pressed the
 * key while the boot switch was still in flight, waited ninety seconds for a
 * menu that could not open, and recorded `focus atteint=false`. That reading
 * was right; the scenario was wrong to have asked so early. The lesson survives
 * the change of control.
 */
export async function waitForCompositionReady(budgetMs = 60_000): Promise<boolean> {
  const outcome = await waitUntil(() => {
    const chips = [...document.querySelectorAll<HTMLButtonElement>(".composition__focus")];
    return chips.length > 0 && chips.every((chip) => !chip.disabled);
  }, budgetMs);
  return outcome.settled;
}

/**
 * Opens the `+ Ajouter` menu and adds one brain, **with real keystrokes**.
 *
 * The menu is opened by a real key, the entry is reached by real arrows, and a
 * real `Enter` chooses it. Three gestures rather than one, because that is what
 * the control actually costs a person — and because `L10` asks that a real
 * keystroke be able to change what is displayed, not that the page be able to.
 */
export async function addByRealKey(
  brainId: string,
  log: ScenarioLog,
  marker: string,
  /** Where a failure records what it saw, before it throws. */
  failures: unknown[],
): Promise<{ open: RealKeyEvidence; choose: RealKeyEvidence }> {
  if (!(await waitForCompositionReady())) {
    failures.push({ brainId, phase: "composition indisponible", evidence: null });
    throw new Error("la barre de composition est restee indisponible");
  }
  const control = addTrigger();
  if (!control) throw new Error("bouton + Ajouter absent");

  // 1. Open the menu. A real down-arrow on the trigger is the documented
  //    gesture, and it is the operating system that delivers it.
  const open = await pressRealKey(
    control,
    "{DOWN}",
    () => document.querySelector('[role="menu"]') !== null,
    log,
    90_000,
    marker,
  );
  if (!open.observedChange) {
    failures.push({ brainId, phase: "ouverture du menu", evidence: open });
    throw new Error(
      `le menu ne s'est pas ouvert pour ${brainId} ` +
        `(focus atteint=${open.focusReached}, keydown=${String(open.keydownKey)}, ` +
        `keydownIsTrusted=${String(open.keydownIsTrusted)}, attente=${open.waitedMs} ms)`,
    );
  }

  // 2. Walk to the wanted entry with real arrow keys, one at a time, so the
  //    focus that ends up activated is one the operating system moved.
  const items = () => [...document.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')];
  const indexOf = (id: string) => items().findIndex((item) => item.dataset.brainId === id);
  const focusedIndex = () => items().findIndex((item) => item === document.activeElement);

  if (indexOf(brainId) < 0) {
    failures.push({ brainId, phase: "entree absente", evidence: open });
    throw new Error(`entree absente pour ${brainId}`);
  }

  let guard = 0;
  while (focusedIndex() !== indexOf(brainId)) {
    if (guard > items().length + 2) {
      throw new Error(`impossible d'atteindre ${brainId} au clavier`);
    }
    const before = focusedIndex();
    const focused = items()[before];
    if (!focused) throw new Error("aucun element de menu n'a le focus");
    const step = await pressRealKey(
      focused,
      "{DOWN}",
      () => focusedIndex() !== before,
      log,
      90_000,
      marker,
    );
    if (!step.observedChange) {
      failures.push({ brainId, phase: "deplacement du focus", evidence: step });
      throw new Error("la fleche n'a pas deplace le focus");
    }
    guard += 1;
  }

  // 3. Activate. What is watched for is the product having actually added the
  //    brain: the menu closed **and** a chip carrying it on screen. A closed
  //    menu on its own would also be true of Escape.
  const target = items()[indexOf(brainId)];
  if (!target) throw new Error(`entree absente pour ${brainId}`);
  const choose = await pressRealKey(
    target,
    "{ENTER}",
    () => document.querySelector('[role="menu"]') === null && chipOf(brainId) !== null,
    log,
    90_000,
    marker,
  );
  if (choose.activationIsTrusted !== true) {
    failures.push({ brainId, phase: "activation", evidence: choose });
    throw new Error(
      `aucune frappe reelle n'a ajoute ${brainId} (isTrusted=${String(choose.activationIsTrusted)})`,
    );
  }
  if (!choose.observedChange) {
    failures.push({ brainId, phase: "ajout observe", evidence: choose });
    throw new Error(`la frappe n'a pas ajoute ${brainId}`);
  }
  return { open, choose };
}

/**
 * Presses the `×` of one displayed brain, **with a real keystroke**.
 *
 * It **reports** rather than judges: `L12` step 13 expects the removal to
 * happen and step 14 expects it to be refused, and the same gesture produces
 * both. Whether the chip went away is in `observedChange`; what to conclude
 * from that belongs to the criterion, not to the driver.
 */
export async function pressRemoveByRealKey(
  brainId: string,
  log: ScenarioLog,
  marker: string,
  budgetMs = 90_000,
): Promise<RealKeyEvidence> {
  if (!(await waitForCompositionReady())) {
    throw new Error("la barre de composition est restee indisponible");
  }
  const control = removeButtonOf(brainId);
  if (!control) throw new Error(`bouton de retrait absent pour ${brainId}`);
  return pressRealKey(control, "{ENTER}", () => chipOf(brainId) === null, log, budgetMs, marker);
}

/**
 * Removes one displayed brain, **with a real keystroke**, and insists.
 *
 * Used to finish a switch: once the wanted brain is on screen, the one being
 * left is taken off it, and the model moves the focus to the first remaining
 * brain in catalogue order — `TASK-0019` §4.4.
 */
export async function removeByRealKey(
  brainId: string,
  log: ScenarioLog,
  marker: string,
  failures: unknown[],
): Promise<RealKeyEvidence> {
  const evidence = await pressRemoveByRealKey(brainId, log, marker);
  if (evidence.activationIsTrusted !== true || !evidence.observedChange) {
    failures.push({ brainId, phase: "retrait", evidence });
    throw new Error(
      `la frappe n'a pas retire ${brainId} (isTrusted=${String(evidence.activationIsTrusted)})`,
    );
  }
  return evidence;
}

export interface SwitchEvidence {
  /** `null` when the brain was already displayed and no `+ Ajouter` was needed. */
  open: RealKeyEvidence | null;
  choose: RealKeyEvidence | null;
  removals: RealKeyEvidence[];
  /** True when the wanted brain was already the only one on screen. */
  alreadyDisplayedAlone: boolean;
  /** True when it was displayed beside others, so only removals were needed. */
  alreadyDisplayed: boolean;
}

/**
 * Switches to a brain **with real keystrokes**, through the composition bar.
 *
 * Add the wanted brain, then remove the one being left. Two acts of display,
 * and what results is the single-brain composition `K12` expects — the same
 * end state the old selector produced, reached through the control that
 * replaced it.
 *
 * **A brain already on screen is not offered by `+ Ajouter`**, and asking for
 * it there is not a defect to throw on. The sandbox is persistent, so the
 * application can perfectly well start on the very brain the first switch asks
 * for — which is what happened, and what abandoned a whole pass at its first
 * keystroke. When there is nothing to add, nothing is added, and the evidence
 * says so rather than pretending a key was pressed.
 */
export async function switchByRealKey(
  brainId: string,
  expectedName: string,
  log: ScenarioLog,
  marker: string,
  failures: unknown[],
): Promise<SwitchEvidence> {
  const displayed = displayedBrainIds();
  const alreadyDisplayed = displayed.includes(brainId);
  const leaving = displayed.filter((entry) => entry !== brainId);

  let keys: { open: RealKeyEvidence | null; choose: RealKeyEvidence | null } = {
    open: null,
    choose: null,
  };
  if (!alreadyDisplayed) {
    keys = await addByRealKey(brainId, log, marker, failures);
    await settle();
  }

  const removals: RealKeyEvidence[] = [];
  for (const other of leaving) {
    await waitForCompositionReady();
    removals.push(await removeByRealKey(other, log, marker, failures));
    await settle();
  }

  await waitForCompositionReady();
  if (!focusedChipText().includes(expectedName)) {
    failures.push({ brainId, phase: "bascule observee", evidence: keys.choose });
    throw new Error(
      `apres la bascule le cerveau actif affiche « ${focusedChipText()} » et non ${expectedName}`,
    );
  }
  return {
    ...keys,
    removals,
    alreadyDisplayed,
    alreadyDisplayedAlone: alreadyDisplayed && leaving.length === 0,
  };
}

// --- reading the composed canvas -------------------------------------------

/** Every `<svg>` of the map. `L4` says there is exactly **one**. */
export function canvasCount(): number {
  return document.querySelectorAll(".map-view__canvas").length;
}

/** The territories on screen, in the order the single canvas draws them. */
export function territoryBrainIds(): string[] {
  return [...document.querySelectorAll<HTMLElement>(".map-territory")]
    .map((element) => element.dataset.brainId ?? "")
    .filter((brainId) => brainId.length > 0);
}

/** The accessible name of one territory — name, icon, count, in words. */
export function territoryLabel(brainId: string): string {
  return (
    document
      .querySelector(`.map-territory[data-brain-id="${brainId}"]`)
      ?.getAttribute("aria-label") ?? ""
  );
}

/** How many node rectangles one territory draws. */
export function nodeCountOf(brainId: string): number {
  return document.querySelectorAll(`.map-node[data-brain-id="${brainId}"]`).length;
}

/** The DOM ids one territory's nodes carry, which `L3` requires to be unique. */
export function nodeDomIdsOf(brainId: string): string[] {
  return [...document.querySelectorAll<HTMLElement>(`.map-node[data-brain-id="${brainId}"]`)].map(
    (element) => element.id,
  );
}

/** What the canvas says is selected, by `aria-activedescendant`. */
export function activeDescendant(): string | null {
  return (
    document.querySelector(".map-view__canvas")?.getAttribute("aria-activedescendant") ?? null
  );
}

/**
 * Every drawn edge, as the pair of brains its two endpoints belong to.
 *
 * `L8` asks for zero inter-brain edges. Reading both ends off the DOM rather
 * than counting edges makes the claim falsifiable: an edge that crossed a
 * boundary would show two different brain ids here.
 */
export function edgeEndpointBrains(): { from: string; to: string }[] {
  return [...document.querySelectorAll<HTMLElement>(".map-edge")].map((element) => ({
    from: element.dataset.fromBrainId ?? "",
    to: element.dataset.toBrainId ?? "",
  }));
}

/** The territory translation the canvas applied, read back off the DOM. */
export function territoryOffset(brainId: string): { x: number; y: number } | null {
  const element = document.querySelector<HTMLElement>(
    `.map-territory[data-brain-id="${brainId}"]`,
  );
  if (!element) return null;
  return {
    x: Number(element.dataset.offsetX ?? Number.NaN),
    y: Number(element.dataset.offsetY ?? Number.NaN),
  };
}

/**
 * One node's rectangle, in the coordinates the index gave it.
 *
 * `L5` asks that composing translate a territory and never recompute a
 * layout — so what is compared between the single and the composed view is
 * this rectangle, which must be **identical**, not merely similar.
 */
export function nodeRect(
  brainId: string,
  nodeId: number,
): { x: number; y: number; w: number; h: number } | null {
  const rect = document.querySelector<SVGRectElement>(
    `.map-node[data-brain-id="${brainId}"][data-node-id="${nodeId}"] rect`,
  );
  if (!rect) return null;
  return {
    x: Number(rect.getAttribute("x")),
    y: Number(rect.getAttribute("y")),
    w: Number(rect.getAttribute("width")),
    h: Number(rect.getAttribute("height")),
  };
}
