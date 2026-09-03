/**
 * The names this runtime is allowed to write under `docs/performance/runs/`.
 *
 * **Reserve `X5` of `ACTION-0028`, `CLOSED` and extended three times.**
 * `map_write_run_artifact` writes by replacement, so a scenario that keeps an
 * older task's file name silently overwrites that task's published evidence
 * the next time somebody presses the button.
 *
 * The rule, unchanged since it was instated: **an execution of a later task
 * never replaces the canonical evidence of an earlier `VERIFIED` task.** What
 * a migrated scenario produces is a *regression replay*, it belongs to the task
 * that migrated it, and its name says so.
 *
 * **`TASK-0019` is `VERIFIED` since `ACTION-0031`**, so its six proofs join the
 * protected list and the `TASK-0020` runtime writes **nothing** under a
 * `TASK-0019` name. Four of those six are themselves regression replays: being
 * a replay does not make evidence less canonical once the task that published
 * it has been controlled. A rule that only ever protected the tasks it was
 * written for would have to be rewritten at every verification; this one is
 * applied the moment a task becomes `VERIFIED`.
 *
 * **`TASK-0020` is `VERIFIED` since `ACTION-0032`**, and its five proofs join
 * in turn. This extension differs from the previous two in one respect worth
 * naming rather than hiding: the runtime shipped in this checkout still spells
 * those five names as destinations, so five of its own destinations are now
 * **sealed** — the Rust gate answers with a refusal instead of writing, and
 * the PowerShell guard refuses to delete a stale copy before a pass. Those
 * scenarios are therefore no longer runnable **under these names**, which is
 * correct: `TASK-0020` is controlled and finished, and a slice that needs to
 * replay one of them republishes it under its own task name, exactly as
 * `TASK-0020` did for `TASK-0019`. {@link SEALED_RUNTIME_DESTINATIONS} names
 * the five so the state is asserted rather than discovered.
 *
 * Every name lives here so there is one spelling of each and a guard test can
 * hold the whole surface at once — see `runArtifacts.test.ts`.
 */

/**
 * Canonical evidence of tasks already `VERIFIED`. **Bit-for-bit frozen**: not
 * rewritten, not deleted, not renamed, and never a destination of this
 * runtime.
 *
 * Four names come from `TASK-0016` and `TASK-0017`, four from `TASK-0018`
 * (added by `ACTION-0029`), six are `TASK-0019`'s, added when `ACTION-0031`
 * made it `VERIFIED`, and the last five are `TASK-0020`'s, added when
 * `ACTION-0032` made it `VERIFIED`.
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
  "TASK-0019-J12-relations-regression-webview2.json",
  "TASK-0019-K11-readonly-regression-webview2.json",
  "TASK-0019-K12-foundation-regression-webview2-pass1.json",
  "TASK-0019-K12-foundation-regression-webview2-pass2.json",
  "TASK-0019-L12-composed-view-webview2-pass1.json",
  "TASK-0019-L12-composed-view-webview2-pass2.json",
  "TASK-0020-M12-interbrain-relations-webview2-pass1.json",
  "TASK-0020-M12-interbrain-relations-webview2-pass2.json",
  "TASK-0020-J12-intrabrain-regression-webview2.json",
  "TASK-0020-L12-composed-regression-webview2-pass1.json",
  "TASK-0020-L12-composed-regression-webview2-pass2.json",
] as const;

/**
 * The measurement loop, migrated again — it still walks a composed runtime.
 *
 * A compatibility replay, **not** a campaign: `TASK-0020` sets no performance
 * threshold and `R8` stays whole. `TASK-0020` does not run it at all; the name
 * exists so that pressing the button can never write over anything.
 */
export const H9_REGRESSION_ARTIFACT =
  "TASK-0020-H9-composed-runtime-regression-webview2.json";
export const H9_REGRESSION_ABANDON_ARTIFACT =
  "TASK-0020-H9-composed-runtime-regression-webview2-abandon.json";

/**
 * The **intra-brain** relations scenario of `TASK-0017`/`J12`, on `brain-alpha`.
 *
 * Replayed by `TASK-0020` §P because the relations panel and `MapView` are both
 * touched by inter-brain relations. Its name says `intrabrain` on purpose: what
 * it protects is that adding a *second* kind of relation did not disturb the
 * first.
 */
export const J12_REGRESSION_ARTIFACT =
  "TASK-0020-J12-intrabrain-regression-webview2.json";
export const J12_REGRESSION_ABANDON_ARTIFACT =
  "TASK-0020-J12-intrabrain-regression-webview2-abandon.json";

/** `L11` — read-only and isolation, replayed on the composed runtime. */
export const K11_ARTIFACT = "TASK-0020-K11-readonly-regression-webview2.json";

/**
 * `K12` of `TASK-0018`, replayed against the composition bar.
 *
 * Kept reachable and renamed under `TASK-0020` so the button can never write
 * over `TASK-0019`'s now-protected evidence. `TASK-0020` does not require it.
 */
export function k12Artifact(pass: number, outcome: "written" | "abandoned"): string {
  const suffix = outcome === "abandoned" ? "-abandon" : "";
  return `TASK-0020-K12-foundation-regression-webview2-pass${pass}${suffix}.json`;
}

/**
 * `L12` of `TASK-0019`, replayed — the **composed view** regression of §P.
 *
 * The criterion is `TASK-0019`'s; the artefact belongs to `TASK-0020`, and its
 * name says so. `TASK-0019`'s own two `L12` artefacts are protected.
 */
export function l12Artifact(pass: number, outcome: "written" | "abandoned"): string {
  const suffix = outcome === "abandoned" ? "-abandon" : "";
  return `TASK-0020-L12-composed-regression-webview2-pass${pass}${suffix}.json`;
}

/** `M12` — the twenty-eight steps of inter-brain relations, in the real host. */
export function m12Artifact(pass: number, outcome: "written" | "abandoned"): string {
  const suffix = outcome === "abandoned" ? "-abandon" : "";
  return `TASK-0020-M12-interbrain-relations-webview2-pass${pass}${suffix}.json`;
}

/**
 * Every name this runtime **spells as a destination**. The guard test
 * enumerates it.
 *
 * Since `ACTION-0032` this is no longer the same set as « every name this
 * runtime may write »: five of these are now protected evidence, and the gate
 * refuses them. {@link SEALED_RUNTIME_DESTINATIONS} is that intersection, and
 * the guard test asserts it is *exactly* those five — neither a sixth
 * destination silently sealed, nor one of the five silently unsealed.
 */
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
  m12Artifact(1, "written"),
  m12Artifact(1, "abandoned"),
  m12Artifact(2, "written"),
  m12Artifact(2, "abandoned"),
] as const;

/**
 * The five runtime destinations that `ACTION-0032` sealed.
 *
 * They are `TASK-0020`'s own canonical evidence, and the scenarios that
 * produced them still name them. Writing one now fails at the Rust gate, and
 * deleting a stale copy fails in `scripts/protected-run-artifacts.ps1`. This
 * constant exists so that the state is **declared and tested** rather than
 * discovered by somebody pressing a button and reading an error.
 *
 * Nothing here is a to-do: the next slice does not "unseal" these. It names
 * its own replays after itself, and this list keeps growing.
 */
export const SEALED_RUNTIME_DESTINATIONS = [
  m12Artifact(1, "written"),
  m12Artifact(2, "written"),
  J12_REGRESSION_ARTIFACT,
  l12Artifact(1, "written"),
  l12Artifact(2, "written"),
] as const;
