/**
 * Per-brain view state, for the length of one session — `TASK-0018` §4.7.
 *
 * `K8` asks that selecting a node in Alpha, panning and zooming, switching to
 * Bêta, and coming back to Alpha restore **Alpha's** selection and view, with
 * Bêta's left untouched. That is a memory keyed by `brainId`, and nothing more.
 *
 * **It is session-only, and says so.** Nothing here is written to disk.
 * Persisting the view across a restart is `P-19`, which `TASK-0018` does not
 * claim — the only thing that must survive a restart is the **active brain**,
 * and that lives in the catalogue, not here.
 *
 * Written as plain data with pure functions rather than as a React hook so the
 * property `K8` cares about — two brains never sharing a value — can be tested
 * without rendering anything.
 */

import type { View } from "./viewState";

export interface BrainSessionState {
  /** The node selected in this brain, or `null` if none was. */
  selectedId: number | null;
  /** The pan and zoom this brain was left at. */
  view: View;
}

/** Session memory: one entry per brain that has been visited. */
export type BrainSessionMemory = ReadonlyMap<string, BrainSessionState>;

export function emptySessionMemory(): BrainSessionMemory {
  return new Map();
}

/**
 * Records where a brain was left.
 *
 * Returns a **new** map rather than mutating the old one: React state has to
 * change identity to re-render, and a memory that mutates in place is a memory
 * whose updates can be missed.
 */
export function rememberBrainSession(
  memory: BrainSessionMemory,
  brainId: string,
  state: BrainSessionState,
): BrainSessionMemory {
  const next = new Map(memory);
  next.set(brainId, { selectedId: state.selectedId, view: { ...state.view } });
  return next;
}

/**
 * What a brain was left at, or `null` if it has not been visited this session.
 *
 * A copy is returned, so a caller that mutates what it gets back cannot reach
 * into another brain's stored state — or into this brain's, later.
 */
export function recallBrainSession(
  memory: BrainSessionMemory,
  brainId: string,
): BrainSessionState | null {
  const stored = memory.get(brainId);
  if (!stored) return null;
  return { selectedId: stored.selectedId, view: { ...stored.view } };
}

/** Where the view was last positioned, and with which viewport. */
export interface ViewPositioning {
  brainId: string;
  width: number;
  height: number;
}

/**
 * Whether a freshly loaded map should be fitted, or left where it was put.
 *
 * A map opens fitted — `TASK-0016` — and the viewport is measured *after* the
 * first render, so the fit has to be redone once the real size arrives. That
 * second fit is what broke `K8` in the real host: coming back to a brain
 * restored its view, the viewport then settled a frame later, and the restored
 * view was refitted away. The selection came back and the pan and zoom did
 * not, which is exactly half of what the criterion asks for.
 *
 * So the rule is stated once, here, and tested: fit a brain's map **once**,
 * and again only if that first fit was computed before the viewport had been
 * measured at all.
 */
export function shouldFitOnOpen(
  positioned: ViewPositioning | null,
  brainId: string,
): boolean {
  if (!positioned || positioned.brainId !== brainId) return true;
  // The placeholder viewport is 1×1: a fit computed against it means nothing,
  // and has to be redone.
  return positioned.width <= 1 || positioned.height <= 1;
}

/**
 * Whether two session states describe the same place.
 *
 * Used by the `K12` scenario to state, on evidence, that what came back is what
 * was left — rather than that it merely looks similar.
 */
export function sameBrainSession(
  left: BrainSessionState | null,
  right: BrainSessionState | null,
): boolean {
  if (left === null || right === null) return left === right;
  return (
    left.selectedId === right.selectedId &&
    left.view.scale === right.view.scale &&
    left.view.tx === right.view.tx &&
    left.view.ty === right.view.ty
  );
}
