/**
 * The names this runtime is allowed to write under `docs/performance/runs/`.
 *
 * **Reserve `X5` of `ACTION-0028`.** `map_write_run_artifact` writes by
 * replacement, so a scenario that keeps an older task's file name silently
 * overwrites that task's published evidence the next time somebody presses the
 * button. `TASK-0018` migrated the measurement loop and the relations scenario
 * to brains without renaming their output: the current runtime would have
 * written `TASK-0016-H9-webview2.json` and `TASK-0017-J12-webview2.json` — the
 * canonical proofs of two `VERIFIED` tasks.
 *
 * The rule, from now on: **an execution of a later task never replaces the
 * canonical evidence of an earlier `VERIFIED` task.** What a migrated scenario
 * produces is a *regression replay*, it belongs to the task that migrated it,
 * and its name says so.
 *
 * Every name lives here so there is one spelling of each and a guard test can
 * hold the whole surface at once — see `runArtifacts.test.ts`.
 */

/**
 * Canonical evidence of tasks already `VERIFIED`. **Bit-for-bit frozen**: not
 * rewritten, not deleted, not renamed, and never a destination of this
 * runtime.
 */
export const PROTECTED_RUN_ARTIFACTS = [
  "TASK-0016-H1-H7-verification.json",
  "TASK-0016-H9-webview2.json",
  "TASK-0017-J11-isolation.json",
  "TASK-0017-J12-webview2.json",
] as const;

/**
 * The measurement loop of `TASK-0016`/`H9`, migrated to walk brains.
 *
 * A compatibility replay of the current multi-brain runtime, **not** a new
 * canonical `H9` campaign: it covers the catalogue's brains — `quasi-empty`
 * twice and `deep` — and not the four original fixtures. `TASK-0018` sets no
 * performance threshold; `R8` stays whole.
 */
export const H9_REGRESSION_ARTIFACT = "TASK-0018-H9-multibrain-regression-webview2.json";
export const H9_REGRESSION_ABANDON_ARTIFACT =
  "TASK-0018-H9-multibrain-regression-webview2-abandon.json";

/**
 * The relations scenario of `TASK-0017`/`J12`, migrated to `brain-alpha`.
 *
 * Same frozen fixture, same real-keystroke mechanism; what it proves is that
 * the multi-brain migration did not break `J12`, not a re-issue of `J12`'s own
 * proof.
 */
export const J12_REGRESSION_ARTIFACT = "TASK-0018-J12-relations-regression-webview2.json";
export const J12_REGRESSION_ABANDON_ARTIFACT =
  "TASK-0018-J12-relations-regression-webview2-abandon.json";

/** `K11` — read-only and isolation, already born under `TASK-0018`. */
export const K11_ARTIFACT = "TASK-0018-K11-readonly-and-isolation.json";

/** `K12` — one artefact per pass, already born under `TASK-0018`. */
export function k12Artifact(pass: number, outcome: "written" | "abandoned"): string {
  const suffix = outcome === "abandoned" ? "-abandon" : "";
  return `TASK-0018-K12-webview2-pass${pass}${suffix}.json`;
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
] as const;
