/**
 * The names this runtime is allowed to write under `docs/performance/runs/`.
 *
 * **Reserve `X5` of `ACTION-0028`, now `CLOSED` and extended.**
 * `map_write_run_artifact` writes by replacement, so a scenario that keeps an
 * older task's file name silently overwrites that task's published evidence
 * the next time somebody presses the button.
 *
 * The rule, from now on: **an execution of a later task never replaces the
 * canonical evidence of an earlier `VERIFIED` task.** What a migrated scenario
 * produces is a *regression replay*, it belongs to the task that migrated it,
 * and its name says so.
 *
 * **`TASK-0018` is `VERIFIED` since `ACTION-0029`**, so its four proofs join
 * the protected list, and the `TASK-0019` runtime writes **nothing** under a
 * `TASK-0018` name any more. A rule that only ever protected the tasks it was
 * written for would have to be rewritten at every verification; this one is
 * applied the moment a task becomes `VERIFIED`.
 *
 * Every name lives here so there is one spelling of each and a guard test can
 * hold the whole surface at once — see `runArtifacts.test.ts`.
 */

/**
 * Canonical evidence of tasks already `VERIFIED`. **Bit-for-bit frozen**: not
 * rewritten, not deleted, not renamed, and never a destination of this
 * runtime.
 *
 * Four names come from `TASK-0016` and `TASK-0017`; the last four are
 * `TASK-0018`'s, added when `ACTION-0029` made it `VERIFIED`.
 */
export const PROTECTED_RUN_ARTIFACTS = [
  "TASK-0016-H1-H7-verification.json",
  "TASK-0016-H9-webview2.json",
  "TASK-0017-J11-isolation.json",
  "TASK-0017-J12-webview2.json",
  "TASK-0018-K11-readonly-and-isolation.json",
  "TASK-0018-K12-webview2-pass1.json",
  "TASK-0018-K12-webview2-pass2.json",
  "TASK-0018-J12-relations-regression-webview2.json",
] as const;

/**
 * The measurement loop, migrated again — now it walks a **composed** runtime.
 *
 * A compatibility replay, **not** a campaign: `TASK-0019` sets no performance
 * threshold and `R8` stays whole. `TASK-0019` does not run it at all; the name
 * exists so that pressing the button can never write over anything.
 */
export const H9_REGRESSION_ARTIFACT =
  "TASK-0019-H9-composed-runtime-regression-webview2.json";
export const H9_REGRESSION_ABANDON_ARTIFACT =
  "TASK-0019-H9-composed-runtime-regression-webview2-abandon.json";

/**
 * The relations scenario of `TASK-0017`/`J12`, on `brain-alpha`.
 *
 * Migrated a second time: the map now namespaces its DOM ids by `brain_id`, so
 * the scenario reads `brain-alpha-map-node-N` where it used to read
 * `map-node-N`. What it proves is that the composed view did not break `J12`.
 */
export const J12_REGRESSION_ARTIFACT =
  "TASK-0019-J12-relations-regression-webview2.json";
export const J12_REGRESSION_ABANDON_ARTIFACT =
  "TASK-0019-J12-relations-regression-webview2-abandon.json";

/** `L11` — read-only and isolation, replayed on the composed runtime. */
export const K11_ARTIFACT = "TASK-0019-K11-readonly-regression-webview2.json";

/**
 * `K12` of `TASK-0018`, replayed against the composition bar.
 *
 * The single-brain selector it used to drive no longer exists, so the scenario
 * drives the composition instead. Its subject is unchanged: the multi-brain
 * **foundation** — counts, index paths, per-brain session state, relation
 * isolation, metadata, active brain across a real restart.
 */
export function k12Artifact(pass: number, outcome: "written" | "abandoned"): string {
  const suffix = outcome === "abandoned" ? "-abandon" : "";
  return `TASK-0019-K12-foundation-regression-webview2-pass${pass}${suffix}.json`;
}

/** `L12` — the seventeen steps of the composed view, in the real host. */
export function l12Artifact(pass: number, outcome: "written" | "abandoned"): string {
  const suffix = outcome === "abandoned" ? "-abandon" : "";
  return `TASK-0019-L12-composed-view-webview2-pass${pass}${suffix}.json`;
}

/** Every name this runtime may write. The guard test enumerates it. */
export const RUNTIME_RUN_ARTIFACTS = [
  H9_REGRESSION_ARTIFACT,
  H9_REGRESSION_ABANDON_ARTIFACT,
  J12_REGRESSION_ARTIFACT,
  J12_REGRESSION_ABANDON_ARTIFACT,
  K11_ARTIFACT,
  k12Artifact(1, "written"),
  k12Artifact(1, "abandoned"),
  k12Artifact(2, "written"),
  k12Artifact(2, "abandoned"),
  l12Artifact(1, "written"),
  l12Artifact(1, "abandoned"),
  l12Artifact(2, "written"),
  l12Artifact(2, "abandoned"),
] as const;
