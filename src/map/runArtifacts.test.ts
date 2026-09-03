/**
 * Reserve `X5` — the guard that keeps a later task from overwriting the
 * canonical evidence of an earlier `VERIFIED` one.
 *
 * `map_write_run_artifact` writes by **replacement**. `TASK-0018` migrated the
 * measurement loop and the relations scenario to brains but left them writing
 * `TASK-0016-H9-webview2.json` and `TASK-0017-J12-webview2.json`, so pressing
 * a button in the current runtime would have destroyed two published proofs.
 * These tests fail if that ever comes back — including through a literal
 * spelled out again somewhere instead of imported from `runArtifacts.ts`.
 *
 * **`X5` extends when a task is verified.** `ACTION-0029` made `TASK-0018`
 * `VERIFIED` and `ACTION-0031` made `TASK-0019` `VERIFIED`, so their own proofs
 * — including the regression artefacts they produced themselves — joined the
 * protected list, and the `TASK-0020` runtime writes under `TASK-0020`. The
 * rule did not change; the list it applies to grew twice, and that growth is
 * what the tests below hold.
 *
 * **`ACTION-0032` made `TASK-0020` `VERIFIED`**, and the list grew a third
 * time. This extension seals five of the runtime's *own* destinations, so the
 * old blanket claim « no runtime destination is a protected artefact » is now
 * false — and replacing it with nothing would be how a guard quietly stops
 * guarding. It is replaced by an exact one: the intersection of the two lists
 * is `SEALED_RUNTIME_DESTINATIONS`, no more and no less.
 */

import { describe, expect, it } from "vitest";
// The sources themselves, as text. Read through Vite's `?raw` rather than
// through `node:fs`, because this checkout ships no Node type package and
// `X5` is not a reason to add a dependency.
import brainScenarioSource from "./brainScenario.ts?raw";
import composedScenarioSource from "./composedScenario.ts?raw";
import crossScenarioSource from "./crossScenario.ts?raw";
import mapAppSource from "./MapApp.tsx?raw";
import relationScenarioSource from "./relationScenario.ts?raw";
import topographicScenarioSource from "./topographicScenario.ts?raw";
import {
  H9_REGRESSION_ABANDON_ARTIFACT,
  H9_REGRESSION_ARTIFACT,
  J12_REGRESSION_ABANDON_ARTIFACT,
  J12_REGRESSION_ARTIFACT,
  K11_ARTIFACT,
  PROTECTED_RUN_ARTIFACTS,
  RUNTIME_RUN_ARTIFACTS,
  SEALED_RUNTIME_DESTINATIONS,
  k12Artifact,
  l12Artifact,
  m12Artifact,
  n15Artifact,
} from "./runArtifacts";

/** Every source file of this runtime that may write a run artefact. */
const WRITING_SOURCES: ReadonlyArray<readonly [string, string]> = [
  ["src/map/MapApp.tsx", mapAppSource],
  ["src/map/relationScenario.ts", relationScenarioSource],
  ["src/map/brainScenario.ts", brainScenarioSource],
  ["src/map/composedScenario.ts", composedScenarioSource],
  ["src/map/crossScenario.ts", crossScenarioSource],
  ["src/map/topographicScenario.ts", topographicScenarioSource],
];

describe("X5 — the runtime never writes over an earlier task's canonical evidence", () => {
  it("TASK-0022 has no protected runtime destination", () => {
    // The strong form of what used to be « none of them is protected ». Both
    // directions are asserted, because each catches a different accident: a
    // destination sealed without anybody noticing, and a sealed name quietly
    // dropped back out of the protected list.
    const sealed = SEALED_RUNTIME_DESTINATIONS as readonly string[];
    const collisions = (RUNTIME_RUN_ARTIFACTS as readonly string[]).filter((name) =>
      (PROTECTED_RUN_ARTIFACTS as readonly string[]).includes(name),
    );
    expect([...collisions].sort()).toStrictEqual([...sealed].sort());
    for (const name of sealed) {
      expect(RUNTIME_RUN_ARTIFACTS as readonly string[]).toContain(name);
      expect(PROTECTED_RUN_ARTIFACTS as readonly string[]).toContain(name);
    }
  });

  it("an abandonment variant is never sealed — it is evidence of nothing", () => {
    // The distinction the seal rests on: a pass that was abandoned published
    // no proof, so its file is not canonical and stays writable.
    for (const name of [
      J12_REGRESSION_ABANDON_ARTIFACT,
      l12Artifact(1, "abandoned"),
      l12Artifact(2, "abandoned"),
      m12Artifact(1, "abandoned"),
      m12Artifact(2, "abandoned"),
      H9_REGRESSION_ARTIFACT,
      H9_REGRESSION_ABANDON_ARTIFACT,
      K11_ARTIFACT,
      k12Artifact(1, "written"),
      k12Artifact(2, "written"),
    ]) {
      expect(PROTECTED_RUN_ARTIFACTS as readonly string[]).not.toContain(name);
    }
  });

  it("TASK-0018's own four proofs became protected when it was verified", () => {
    // The claim is not « the new names are free » but « the previous slice's
    // evidence has become untouchable », which is what `ACTION-0029` changed.
    for (const name of [
      "TASK-0018-K11-readonly-and-isolation.json",
      "TASK-0018-K12-webview2-pass1.json",
      "TASK-0018-K12-webview2-pass2.json",
      "TASK-0018-J12-relations-regression-webview2.json",
    ]) {
      expect(PROTECTED_RUN_ARTIFACTS as readonly string[]).toContain(name);
    }
  });

  it("TASK-0019's own six proofs became protected when it was verified", () => {
    // `ACTION-0031`. Four of the six are themselves regression replays: being a
    // replay does not make evidence less canonical once the task that published
    // it has been controlled.
    for (const name of [
      "TASK-0019-J12-relations-regression-webview2.json",
      "TASK-0019-K11-readonly-regression-webview2.json",
      "TASK-0019-K12-foundation-regression-webview2-pass1.json",
      "TASK-0019-K12-foundation-regression-webview2-pass2.json",
      "TASK-0019-L12-composed-view-webview2-pass1.json",
      "TASK-0019-L12-composed-view-webview2-pass2.json",
    ]) {
      expect(PROTECTED_RUN_ARTIFACTS as readonly string[]).toContain(name);
    }
  });

  it("TASK-0020's own five proofs became protected when it was verified", () => {
    // `ACTION-0032`. Two are the `M12` campaign's own WebView2 passes; three
    // are regression replays. Unlike the two previous extensions, these five
    // are still spelled as destinations by the runtime in this checkout — the
    // gate refuses them, and that refusal is the intended end state, not a
    // defect waiting to be fixed.
    for (const name of [
      "TASK-0020-M12-interbrain-relations-webview2-pass1.json",
      "TASK-0020-M12-interbrain-relations-webview2-pass2.json",
      "TASK-0020-J12-intrabrain-regression-webview2.json",
      "TASK-0020-L12-composed-regression-webview2-pass1.json",
      "TASK-0020-L12-composed-regression-webview2-pass2.json",
    ]) {
      expect(PROTECTED_RUN_ARTIFACTS as readonly string[]).toContain(name);
    }
    expect(PROTECTED_RUN_ARTIFACTS).toHaveLength(19);
  });

  it("the migrated scenarios write under TASK-0022, named as regressions", () => {
    for (const name of [
      H9_REGRESSION_ARTIFACT,
      H9_REGRESSION_ABANDON_ARTIFACT,
      J12_REGRESSION_ARTIFACT,
      J12_REGRESSION_ABANDON_ARTIFACT,
      K11_ARTIFACT,
      k12Artifact(1, "written"),
      l12Artifact(1, "written"),
    ]) {
      expect(name.startsWith("TASK-0022-")).toBe(true);
      expect(name).toContain("regression");
      expect(name.endsWith(".json")).toBe(true);
    }
  });

  it("the migrated names are exactly the ones this slice froze", () => {
    expect(H9_REGRESSION_ARTIFACT).toBe(
      "TASK-0022-H9-composed-runtime-regression-webview2.json",
    );
    expect(J12_REGRESSION_ARTIFACT).toBe(
      "TASK-0022-J12-intrabrain-relations-regression-webview2.json",
    );
    expect(H9_REGRESSION_ABANDON_ARTIFACT).toBe(
      "TASK-0022-H9-composed-runtime-regression-webview2-abandon.json",
    );
    expect(J12_REGRESSION_ABANDON_ARTIFACT).toBe(
      "TASK-0022-J12-intrabrain-relations-regression-webview2-abandon.json",
    );
    expect(K11_ARTIFACT).toBe(
      "TASK-0022-K11-readonly-isolation-regression-webview2.json",
    );
    expect(k12Artifact(1, "written")).toBe(
      "TASK-0022-K12-foundation-regression-webview2-pass1.json",
    );
    expect(l12Artifact(1, "written")).toBe(
      "TASK-0022-L12-composed-view-regression-webview2-pass1.json",
    );
    expect(l12Artifact(2, "written")).toBe(
      "TASK-0022-L12-composed-view-regression-webview2-pass2.json",
    );
  });

  it("M12 publishes its TASK-0022 regression evidence in two passes", () => {
    // `M12` is a criterion of this slice, not a replay of an earlier one, so
    // its name says `M12` and carries no `regression`.
    expect(m12Artifact(1, "written")).toBe(
      "TASK-0022-M12-interbrain-relations-regression-webview2-pass1.json",
    );
    expect(m12Artifact(2, "written")).toBe(
      "TASK-0022-M12-interbrain-relations-regression-webview2-pass2.json",
    );
    expect(m12Artifact(1, "abandoned")).toBe(
      "TASK-0022-M12-interbrain-relations-regression-webview2-pass1-abandon.json",
    );
    expect(m12Artifact(1, "written")).toContain("regression");
    expect(m12Artifact(1, "written")).not.toBe(m12Artifact(2, "written"));
  });

  it("N15 publishes two distinct TASK-0022 passes", () => {
    expect(n15Artifact(1, "written")).toBe(
      "TASK-0022-N15-topographic-node-graph-webview2-pass1.json",
    );
    expect(n15Artifact(2, "written")).toBe(
      "TASK-0022-N15-topographic-node-graph-webview2-pass2.json",
    );
  });

  it("every runtime destination belongs to TASK-0022", () => {
    for (const name of [
      ...RUNTIME_RUN_ARTIFACTS,
      K11_ARTIFACT,
      k12Artifact(2, "abandoned"),
      l12Artifact(2, "abandoned"),
      m12Artifact(2, "abandoned"),
    ]) {
      expect(name.startsWith("TASK-0022-")).toBe(true);
    }
  });

  it("no runtime destination reuses a name from a verified slice", () => {
    // Not the same claim as « not protected »: this one catches a `TASK-0019-`
    // name nobody thought to protect. The runtime writes under its own task,
    // and only under its own task.
    for (const name of RUNTIME_RUN_ARTIFACTS) {
      for (const owned of ["TASK-0016-", "TASK-0017-", "TASK-0018-", "TASK-0019-"]) {
        expect(name.startsWith(owned)).toBe(false);
      }
    }
  });

  it("every runtime name stays acceptable to the Rust artefact guard", () => {
    // `write_run_artifact` refuses a separator, a `..`, anything outside
    // `[A-Za-z0-9._-]`, and more than 120 characters.
    for (const name of RUNTIME_RUN_ARTIFACTS) {
      expect(name).toMatch(/^[A-Za-z0-9._-]+$/);
      expect(name).not.toContain("..");
      expect(name.length).toBeLessThanOrEqual(120);
    }
  });

  it("no writing source spells a protected artefact name as a destination", () => {
    for (const [path, source] of WRITING_SOURCES) {
      expect(source.length, `${path} unreadable`).toBeGreaterThan(0);
      for (const protectedName of PROTECTED_RUN_ARTIFACTS) {
        // The name may still be *mentioned* — a comment or a `doesNotReplace`
        // field naming what is being preserved is the point. What must never
        // appear is the name as the `name:` argument of a write.
        for (const quote of ['"', "'", "`"]) {
          expect(source, `${path} writes over ${protectedName}`).not.toContain(
            `name: ${quote}${protectedName}${quote}`,
          );
        }
      }
    }
  });

  it("every artefact those sources write declares the task that owns it", () => {
    // The name and the payload have to agree. `J12`'s replay kept
    // `task: "TASK-0018"` while writing a `TASK-0019-` file, and the artefact
    // it published named the wrong owner — a reader following the `task` field
    // would have looked for it in the previous slice's evidence.
    for (const [path, source] of WRITING_SOURCES) {
      const declarations = [...source.matchAll(/task:\s*"(TASK-\d{4})"/g)].map(
        (match) => match[1],
      );
      expect(declarations.length, `${path} declares no task`).toBeGreaterThan(0);
      for (const declared of declarations) {
        expect(declared, `${path} declares ${declared}`).toBe("TASK-0022");
      }
    }
  });

  it("every write in those sources takes its name from this module", () => {
    for (const [path, source] of WRITING_SOURCES) {
      const calls = [...source.matchAll(/map_write_run_artifact[\s\S]{0,400}?name:\s*([^,\n]+)/g)];
      expect(calls.length).toBeGreaterThan(0);
      for (const call of calls) {
        const argument = call[1].trim();
        expect(
          /^(H9_REGRESSION_ARTIFACT|H9_REGRESSION_ABANDON_ARTIFACT|J12_REGRESSION_ARTIFACT|J12_REGRESSION_ABANDON_ARTIFACT|K11_ARTIFACT|k12Artifact\(|l12Artifact\(|m12Artifact\(|n15Artifact\()/.test(
            argument,
          ),
          `${path}: artefact name not taken from runArtifacts.ts — ${argument}`,
        ).toBe(true);
      }
    }
  });
});
