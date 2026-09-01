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
 */

import { describe, expect, it } from "vitest";
// The sources themselves, as text. Read through Vite's `?raw` rather than
// through `node:fs`, because this checkout ships no Node type package and
// `X5` is not a reason to add a dependency.
import brainScenarioSource from "./brainScenario.ts?raw";
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
} from "./runArtifacts";

/** Every source file of this runtime that may write a run artefact. */
const WRITING_SOURCES: ReadonlyArray<readonly [string, string]> = [
  ["src/map/MapApp.tsx", mapAppSource],
  ["src/map/relationScenario.ts", relationScenarioSource],
  ["src/map/brainScenario.ts", brainScenarioSource],
];

describe("X5 — the runtime never writes over an earlier task's canonical evidence", () => {
  it("no runtime destination is a protected artefact", () => {
    for (const name of RUNTIME_RUN_ARTIFACTS) {
      expect(PROTECTED_RUN_ARTIFACTS as readonly string[]).not.toContain(name);
    }
  });

  it("the two migrated scenarios write under TASK-0018, named as regressions", () => {
    for (const name of [
      H9_REGRESSION_ARTIFACT,
      H9_REGRESSION_ABANDON_ARTIFACT,
      J12_REGRESSION_ARTIFACT,
      J12_REGRESSION_ABANDON_ARTIFACT,
    ]) {
      expect(name.startsWith("TASK-0018-")).toBe(true);
      expect(name).toContain("regression");
      expect(name.endsWith(".json")).toBe(true);
    }
  });

  it("the migrated names are exactly the ones the correction fixed", () => {
    expect(H9_REGRESSION_ARTIFACT).toBe("TASK-0018-H9-multibrain-regression-webview2.json");
    expect(J12_REGRESSION_ARTIFACT).toBe("TASK-0018-J12-relations-regression-webview2.json");
    expect(H9_REGRESSION_ABANDON_ARTIFACT).toBe(
      "TASK-0018-H9-multibrain-regression-webview2-abandon.json",
    );
    expect(J12_REGRESSION_ABANDON_ARTIFACT).toBe(
      "TASK-0018-J12-relations-regression-webview2-abandon.json",
    );
  });

  it("every runtime destination belongs to TASK-0018", () => {
    for (const name of [...RUNTIME_RUN_ARTIFACTS, K11_ARTIFACT, k12Artifact(2, "abandoned")]) {
      expect(name.startsWith("TASK-0018-")).toBe(true);
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

  it("every write in those sources takes its name from this module", () => {
    for (const [path, source] of WRITING_SOURCES) {
      const calls = [...source.matchAll(/map_write_run_artifact[\s\S]{0,400}?name:\s*([^,\n]+)/g)];
      expect(calls.length).toBeGreaterThan(0);
      for (const call of calls) {
        const argument = call[1].trim();
        expect(
          /^(H9_REGRESSION_ARTIFACT|H9_REGRESSION_ABANDON_ARTIFACT|J12_REGRESSION_ARTIFACT|J12_REGRESSION_ABANDON_ARTIFACT|K11_ARTIFACT|k12Artifact\()/.test(
            argument,
          ),
          `${path}: artefact name not taken from runArtifacts.ts — ${argument}`,
        ).toBe(true);
      }
    }
  });
});
