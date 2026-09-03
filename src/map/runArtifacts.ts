/**
 * The names this runtime is allowed to write under `docs/performance/runs/`.
 *
 * **Reserve `X5` of `ACTION-0028`, `CLOSED` and extended four times.**
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
 * in turn. Before its own verification, TASK-0022 republished every current
 * replay under `TASK-0022-*`, so none of its destinations collided then.
 *
 * **`TASK-0022` is `VERIFIED` since `ACTION-0036`**, and its eight canonical
 * proofs join in turn. They are now sealed destinations in this checkout. H9,
 * K12 and every `-abandon` variant remain outside the protected set because
 * they are not canonical `TASK-0022` evidence.
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
 * made it `VERIFIED`, five are `TASK-0020`'s, added when `ACTION-0032` made it
 * `VERIFIED`, and the last eight are `TASK-0022`'s, added when `ACTION-0036`
 * made it `VERIFIED`.
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
  "TASK-0022-J12-intrabrain-relations-regression-webview2.json",
  "TASK-0022-K11-readonly-isolation-regression-webview2.json",
  "TASK-0022-L12-composed-view-regression-webview2-pass1.json",
  "TASK-0022-L12-composed-view-regression-webview2-pass2.json",
  "TASK-0022-M12-interbrain-relations-regression-webview2-pass1.json",
  "TASK-0022-M12-interbrain-relations-regression-webview2-pass2.json",
  "TASK-0022-N15-topographic-node-graph-webview2-pass1.json",
  "TASK-0022-N15-topographic-node-graph-webview2-pass2.json",
] as const;

/**
 * The measurement loop, migrated again — it still walks a composed runtime.
 *
 * A compatibility replay, **not** a campaign: `TASK-0020` sets no performance
 * threshold and `R8` stays whole. `TASK-0020` does not run it at all; the name
 * exists so that pressing the button can never write over anything.
 */
export const H9_REGRESSION_ARTIFACT =
  "TASK-0022-H9-composed-runtime-regression-webview2.json";
export const H9_REGRESSION_ABANDON_ARTIFACT =
  "TASK-0022-H9-composed-runtime-regression-webview2-abandon.json";

/**
 * The **intra-brain** relations scenario of `TASK-0017`/`J12`, on `brain-alpha`.
 *
 * Replayed by `TASK-0020` §P because the relations panel and `MapView` are both
 * touched by inter-brain relations. Its name says `intrabrain` on purpose: what
 * it protects is that adding a *second* kind of relation did not disturb the
 * first.
 */
export const J12_REGRESSION_ARTIFACT =
  "TASK-0022-J12-intrabrain-relations-regression-webview2.json";
export const J12_REGRESSION_ABANDON_ARTIFACT =
  "TASK-0022-J12-intrabrain-relations-regression-webview2-abandon.json";

/** `L11` — read-only and isolation, replayed on the composed runtime. */
export const K11_ARTIFACT = "TASK-0022-K11-readonly-isolation-regression-webview2.json";

/**
 * `K12` of `TASK-0018`, replayed against the composition bar.
 *
 * Kept reachable and renamed under `TASK-0020` so the button can never write
 * over `TASK-0019`'s now-protected evidence. `TASK-0020` does not require it.
 */
export function k12Artifact(pass: number, outcome: "written" | "abandoned"): string {
  const suffix = outcome === "abandoned" ? "-abandon" : "";
  return `TASK-0022-K12-foundation-regression-webview2-pass${pass}${suffix}.json`;
}

/**
 * `L12` of `TASK-0019`, replayed — the **composed view** regression of §P.
 *
 * The criterion is `TASK-0019`'s; the artefact belongs to `TASK-0020`, and its
 * name says so. `TASK-0019`'s own two `L12` artefacts are protected.
 */
export function l12Artifact(pass: number, outcome: "written" | "abandoned"): string {
  const suffix = outcome === "abandoned" ? "-abandon" : "";
  return `TASK-0022-L12-composed-view-regression-webview2-pass${pass}${suffix}.json`;
}

/** `M12` — the twenty-eight steps of inter-brain relations, in the real host. */
export function m12Artifact(pass: number, outcome: "written" | "abandoned"): string {
  const suffix = outcome === "abandoned" ? "-abandon" : "";
  return `TASK-0022-M12-interbrain-relations-regression-webview2-pass${pass}${suffix}.json`;
}

/** `N15` — the topographic node graph in the real Tauri/WebView2 host. */
export function n15Artifact(pass: number, outcome: "written" | "abandoned"): string {
  const suffix = outcome === "abandoned" ? "-abandon" : "";
  return `TASK-0022-N15-topographic-node-graph-webview2-pass${pass}${suffix}.json`;
}

/**
 * Every name this runtime **spells as a destination**. The guard test
 * enumerates it.
 *
 * Since `ACTION-0036` this is no longer the same set as « every name this
 * runtime may write »: eight of these are now protected evidence, and the gate
 * refuses them. {@link SEALED_RUNTIME_DESTINATIONS} is that intersection, and
 * the guard test asserts it is *exactly* those eight — neither a ninth
 * destination silently sealed, nor one of the eight silently unsealed.
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
  n15Artifact(1, "written"),
  n15Artifact(1, "abandoned"),
  n15Artifact(2, "written"),
  n15Artifact(2, "abandoned"),
] as const;

/**
 * Exact protected/runtime intersection. Since `ACTION-0036`, it is exactly
 * the eight canonical `TASK-0022` proofs: this checkout still spells their
 * destinations, and the write gate now refuses them. H9, K12 and abandonment
 * variants remain writable.
 */
export const SEALED_RUNTIME_DESTINATIONS = [
  J12_REGRESSION_ARTIFACT,
  K11_ARTIFACT,
  l12Artifact(1, "written"),
  l12Artifact(2, "written"),
  m12Artifact(1, "written"),
  m12Artifact(2, "written"),
  n15Artifact(1, "written"),
  n15Artifact(2, "written"),
] as const;

/**
 * The task an artefact name declares as its owner, or `null` when the name
 * carries no task identity at all.
 *
 * **Reserve `X8` of `ACTION-0035`.** The `M12` scenario used to decide who
 * owned the file it had just written by testing a hard-coded `TASK-0020-`
 * prefix — a literal that survived the migration of the artefact names and
 * turned the evidence into a falsehood the moment the runtime started writing
 * under `TASK-0022`. A comparison of *parsed* identities cannot rot that way:
 * it says nothing about which task is current, so the next slice inherits a
 * scenario that is still telling the truth.
 */
export function artifactTaskId(name: string): string | null {
  return /^(TASK-\d{4})-/.exec(name)?.[1] ?? null;
}

/** What {@link runtimeWriteOwnership} establishes, every field derived. */
export interface RuntimeWriteOwnership {
  /** The single task every runtime destination belongs to, or `null`. */
  owningTaskId: string | null;
  /** How many names this runtime spells as a destination. */
  runtimeDestinationCount: number;
  /** The distinct task identities those names carry, sorted. */
  taskIdsWritten: readonly string[];
  /** How many names the write gate protects — the `X5` set, counted. */
  protectedArtifactCount: number;
  /** The distinct tasks that own protected evidence, sorted. */
  protectedTaskIds: readonly string[];
  /** Runtime destinations that are protected evidence. Expected empty. */
  protectedDestinations: readonly string[];
  /** True only while every destination belongs to one unprotected task and none is sealed. */
  writesUnderItsOwnTaskOnly: boolean;
}

/**
 * Reads the write ownership of this runtime off the two lists themselves.
 *
 * Nothing here is asserted: the owning task is *discovered* by parsing every
 * destination, the protected count is the length of the protected list, and
 * the verdict is the conjunction of three facts that a stale name would
 * break — a second task identity among the destinations, a destination with no
 * task identity, or a destination the gate protects.
 *
 * `PROTECTED_RUN_ARTIFACTS` mirrors the Rust gate in
 * `src-tauri/src/map/commands.rs`; `runArtifacts.test.ts` fails if the two ever
 * disagree, so the count published from here is the count the gate enforces
 * rather than a number written down twice.
 */
export function runtimeWriteOwnership(): RuntimeWriteOwnership {
  const destinations = RUNTIME_RUN_ARTIFACTS as readonly string[];
  const protectedNames = PROTECTED_RUN_ARTIFACTS as readonly string[];
  const isTaskId = (value: string | null): value is string => value !== null;

  const parsed = destinations.map(artifactTaskId);
  const anonymousDestinations = parsed.filter((id) => id === null).length;
  const taskIdsWritten = [...new Set(parsed.filter(isTaskId))].sort();
  const owningTaskId =
    anonymousDestinations === 0 && taskIdsWritten.length === 1 ? taskIdsWritten[0] : null;

  const protectedTaskIds = [
    ...new Set(protectedNames.map(artifactTaskId).filter(isTaskId)),
  ].sort();
  const protectedDestinations = destinations.filter((name) =>
    protectedNames.includes(name),
  );

  return {
    owningTaskId,
    runtimeDestinationCount: destinations.length,
    taskIdsWritten,
    protectedArtifactCount: protectedNames.length,
    protectedTaskIds,
    protectedDestinations,
    writesUnderItsOwnTaskOnly:
      owningTaskId !== null &&
      !protectedTaskIds.includes(owningTaskId) &&
      protectedDestinations.length === 0,
  };
}
