/**
 * The composed view — `TASK-0019` §4.1.
 *
 * **A composed view is a DISPLAY COMPOSITION, not a new brain.** It has no
 * identity, no storage and no relations of its own. It names which brains are
 * on screen, which one carries the focus, and where the selection is. Nothing
 * here reads a brain, writes a brain, or merges two.
 *
 * Written as plain data with pure functions, deliberately. `L1` is a claim
 * about a *model* — non-empty, no duplicate, focus always displayed — and the
 * honest way to establish a claim like that is to throw it at the arithmetic
 * rather than at a component and hope an assertion fires.
 *
 * **Every refusal is named.** A composition that quietly dropped a duplicate,
 * defaulted an unknown brain or fell back to an empty list would be exactly
 * the silent mix-up `TASK-0018` spent a slice making impossible.
 */

import type { BrainNodeRef, BrainRecord } from "./types";

/** The named refusals of `L1`. There is no unnamed one. */
export type ComposedViewErrorCode =
  | "composed_view_empty"
  | "composed_view_duplicate_brain"
  | "composed_view_unknown_brain"
  | "composed_view_focus_not_displayed"
  | "composed_view_cannot_remove_last_brain";

/**
 * A refusal from the composition model.
 *
 * Carries its `code` as data rather than only in the message, so a caller can
 * act on it and a test can assert on it without matching French prose.
 */
export class ComposedViewError extends Error {
  readonly code: ComposedViewErrorCode;
  readonly brainId: string | null;

  constructor(code: ComposedViewErrorCode, brainId: string | null, detail: string) {
    super(brainId === null ? `${code}: ${detail}` : `${code}: ${brainId} — ${detail}`);
    this.name = "ComposedViewError";
    this.code = code;
    this.brainId = brainId;
  }
}

/**
 * Which brains are displayed, and which one is focused.
 *
 * `selected` and the global pan/zoom live in the component that renders this,
 * because they change many times a second and this object is compared for
 * equality; keeping them out is what lets a composition be a stable value.
 */
export interface ComposedView {
  /** Non-empty, duplicate-free, ordered by catalogue position. */
  readonly displayedBrainIds: readonly string[];
  /** Always a member of `displayedBrainIds`. */
  readonly focusedBrainId: string;
}

/** The catalogue's order, which is the only order a composition ever uses. */
export function catalogueOrder(brains: readonly BrainRecord[]): string[] {
  return [...brains]
    .sort((left, right) => left.position - right.position)
    .map((brain) => brain.brainId);
}

/**
 * Builds a composition, refusing everything `L1` forbids.
 *
 * The order of the result is the **catalogue's**, never the caller's: two
 * callers that ask for the same brains in different orders get the same
 * composition, so the territories they see are laid out identically.
 */
export function composeView(
  order: readonly string[],
  wanted: readonly string[],
  focusedBrainId: string,
): ComposedView {
  if (wanted.length === 0) {
    throw new ComposedViewError(
      "composed_view_empty",
      null,
      "une composition vide est interdite",
    );
  }

  const seen = new Set<string>();
  for (const brainId of wanted) {
    if (!order.includes(brainId)) {
      throw new ComposedViewError(
        "composed_view_unknown_brain",
        brainId,
        "ce cerveau n'est pas au catalogue",
      );
    }
    if (seen.has(brainId)) {
      throw new ComposedViewError(
        "composed_view_duplicate_brain",
        brainId,
        "un cerveau ne peut être affiché deux fois",
      );
    }
    seen.add(brainId);
  }

  const displayedBrainIds = order.filter((brainId) => seen.has(brainId));
  if (!seen.has(focusedBrainId)) {
    throw new ComposedViewError(
      "composed_view_focus_not_displayed",
      focusedBrainId,
      "le cerveau focused doit être affiché",
    );
  }

  return { displayedBrainIds, focusedBrainId };
}

/** A composition of exactly one brain — the mode `TASK-0018` shipped. */
export function singleBrainView(order: readonly string[], brainId: string): ComposedView {
  return composeView(order, [brainId], brainId);
}

/**
 * Adds a brain to the view. **The focus does not move.**
 *
 * Adding is an act of display: `§4.1` rule 6 says loading a secondary brain
 * must not make it active simply because its data was read.
 */
export function addBrain(
  view: ComposedView,
  order: readonly string[],
  brainId: string,
): ComposedView {
  if (view.displayedBrainIds.includes(brainId)) {
    throw new ComposedViewError(
      "composed_view_duplicate_brain",
      brainId,
      "ce cerveau est déjà affiché",
    );
  }
  return composeView(order, [...view.displayedBrainIds, brainId], view.focusedBrainId);
}

/**
 * Removes a brain **from the view**, and nothing else.
 *
 * No catalogue entry, no index, no relation and no source is touched — `L6`.
 * Removing the last displayed brain is refused rather than emptied, and when
 * the focused brain leaves, the **first remaining brain in catalogue order**
 * takes the focus. Deterministic, so two runs agree.
 */
export function removeBrain(
  view: ComposedView,
  order: readonly string[],
  brainId: string,
): ComposedView {
  if (!view.displayedBrainIds.includes(brainId)) {
    throw new ComposedViewError(
      "composed_view_unknown_brain",
      brainId,
      "ce cerveau n'est pas affiché",
    );
  }
  if (view.displayedBrainIds.length === 1) {
    throw new ComposedViewError(
      "composed_view_cannot_remove_last_brain",
      brainId,
      "retirer le dernier cerveau affiché est refusé",
    );
  }
  const remaining = view.displayedBrainIds.filter((entry) => entry !== brainId);
  const focused = brainId === view.focusedBrainId ? remaining[0] : view.focusedBrainId;
  return composeView(order, remaining, focused);
}

/** Moves the focus to a brain that is already displayed. */
export function focusBrain(
  view: ComposedView,
  order: readonly string[],
  brainId: string,
): ComposedView {
  return composeView(order, view.displayedBrainIds, brainId);
}

/** True when removing this brain would empty the view — `L6`. */
export function canRemove(view: ComposedView): boolean {
  return view.displayedBrainIds.length > 1;
}

/** The catalogue's brains that are **not** displayed, in catalogue order. */
export function addableBrains(
  view: ComposedView,
  brains: readonly BrainRecord[],
): BrainRecord[] {
  return [...brains]
    .sort((left, right) => left.position - right.position)
    .filter((brain) => !view.displayedBrainIds.includes(brain.brainId));
}

export function sameComposedView(left: ComposedView, right: ComposedView): boolean {
  return (
    left.focusedBrainId === right.focusedBrainId &&
    left.displayedBrainIds.length === right.displayedBrainIds.length &&
    left.displayedBrainIds.every((id, index) => id === right.displayedBrainIds[index])
  );
}

/** True when a selection still names a displayed brain — `K`, restoration. */
export function selectionIsStillValid(
  view: ComposedView,
  selected: BrainNodeRef | null,
): boolean {
  return selected !== null && view.displayedBrainIds.includes(selected.brainId);
}

export function sameNodeRef(left: BrainNodeRef | null, right: BrainNodeRef | null): boolean {
  if (left === null || right === null) return left === right;
  return left.brainId === right.brainId && left.nodeId === right.nodeId;
}

/**
 * The DOM id of one node, namespaced by its brain — `L3`, `§4.5`.
 *
 * Alpha and Gamma read the same fixture, so `map-node-6` exists in both. One
 * `id` for two elements is not a cosmetic problem: `aria-activedescendant`
 * points at *an* id, and `getElementById` returns *the first* — the screen
 * reader and the scenario would both follow the wrong brain, silently.
 */
export function domNodeId(brainId: string, nodeId: number): string {
  return `${brainId}-map-node-${nodeId}`;
}

/** The DOM id of a territory's group in the single composed `SVG`. */
export function domTerritoryId(brainId: string): string {
  return `${brainId}-territory`;
}
