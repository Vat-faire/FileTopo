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
 * `VERIFIED`, so its own four proofs — including the regression artefact it
 * produced — joined the protected list, and the `TASK-0019` runtime writes
 * under `TASK-0019`. The rule did not change; the list it applies to grew, and
 * that growth is what the tests below hold.
 */

import { describe, expect, it } from "vitest";
// The sources themselves, as text. Read through Vite's `?raw` rather than
// through `node:fs`, because this checkout ships no Node type package and
// `X5` is not a reason to add a dependency.
import brainScenarioSource from "./brainScenario.ts?raw";
import composedScenarioSource from "./composedScenario.ts?raw";
import mapAppSource from "./MapApp.tsx?raw";
import relationScenarioSource from "./relationScenario.ts?raw";
import {
  H9_REGRESSION_ABANDON_ARTIFACT,
  H9_REGRESSION_ARTIFACT,
  J12_REGRESSION_ABANDON_ARTIFACT,
  J12_REGRESSION_ARTIFACT,
  K11_ARTIFACT,
  PROTECTED_RUN_ARTIFACTS,
  RUNTIME_RUN_ARTIFACTS,
  k12Artifact,
  l12Artifact,
} from "./runArtifacts";

/** Every source file of this runtime that may write a run artefact. */
const WRITING_SOURCES: ReadonlyArray<readonly [string, string]> = [
  ["src/map/MapApp.tsx", mapAppSource],
  ["src/map/relationScenario.ts", relationScenarioSource],
  ["src/map/brainScenario.ts", brainScenarioSource],
  ["src/map/composedScenario.ts", composedScenarioSource],
];

describe("X5 — the runtime never writes over an earlier task's canonical evidence", () => {
  it("no runtime destination is a protected artefact", () => {
    for (const name of RUNTIME_RUN_ARTIFACTS) {
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

  it("the migrated scenarios write under TASK-0019, named as regressions", () => {
    for (const name of [
      H9_REGRESSION_ARTIFACT,
      H9_REGRESSION_ABANDON_ARTIFACT,
      J12_REGRESSION_ARTIFACT,
      J12_REGRESSION_ABANDON_ARTIFACT,
      K11_ARTIFACT,
      k12Artifact(1, "written"),
    ]) {
      expect(name.startsWith("TASK-0019-")).toBe(true);
      expect(name).toContain("regression");
      expect(name.endsWith(".json")).toBe(true);
    }
  });

  it("the migrated names are exactly the ones this slice froze", () => {
    expect(H9_REGRESSION_ARTIFACT).toBe(
      "TASK-0019-H9-composed-runtime-regression-webview2.json",
    );
    expect(J12_REGRESSION_ARTIFACT).toBe("TASK-0019-J12-relations-regression-webview2.json");
    expect(H9_REGRESSION_ABANDON_ARTIFACT).toBe(
      "TASK-0019-H9-composed-runtime-regression-webview2-abandon.json",
    );
    expect(J12_REGRESSION_ABANDON_ARTIFACT).toBe(
      "TASK-0019-J12-relations-regression-webview2-abandon.json",
    );
    expect(K11_ARTIFACT).toBe("TASK-0019-K11-readonly-regression-webview2.json");
    expect(k12Artifact(1, "written")).toBe(
      "TASK-0019-K12-foundation-regression-webview2-pass1.json",
    );
    expect(k12Artifact(2, "abandoned")).toBe(
      "TASK-0019-K12-foundation-regression-webview2-pass2-abandon.json",
    );
  });

  it("L12 publishes its own evidence, under its own name, in two passes", () => {
    // `L12` is a criterion of this slice, not a replay of an earlier one, so
    // its name says `L12` and carries no `regression`.
    expect(l12Artifact(1, "written")).toBe("TASK-0019-L12-composed-view-webview2-pass1.json");
    expect(l12Artifact(2, "written")).toBe("TASK-0019-L12-composed-view-webview2-pass2.json");
    expect(l12Artifact(1, "abandoned")).toBe(
      "TASK-0019-L12-composed-view-webview2-pass1-abandon.json",
    );
    expect(l12Artifact(1, "written")).not.toContain("regression");
    expect(l12Artifact(1, "written")).not.toBe(l12Artifact(2, "written"));
  });

  it("every runtime destination belongs to TASK-0019", () => {
    for (const name of [
      ...RUNTIME_RUN_ARTIFACTS,
      K11_ARTIFACT,
      k12Artifact(2, "abandoned"),
      l12Artifact(2, "abandoned"),
    ]) {
      expect(name.startsWith("TASK-0019-")).toBe(true);
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
        expect(declared, `${path} declares ${declared}`).toBe("TASK-0019");
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
          /^(H9_REGRESSION_ARTIFACT|H9_REGRESSION_ABANDON_ARTIFACT|J12_REGRESSION_ARTIFACT|J12_REGRESSION_ABANDON_ARTIFACT|K11_ARTIFACT|k12Artifact\(|l12Artifact\()/.test(
            argument,
          ),
          `${path}: artefact name not taken from runArtifacts.ts — ${argument}`,
        ).toBe(true);
      }
    }
  });
});
