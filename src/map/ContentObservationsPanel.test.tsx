import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import ContentObservationsPanel, {
  CONTENT_OBSERVATION_STRINGS,
} from "./ContentObservationsPanel";
import type { ContentObservation, ContentObservationSummary } from "./types";

const digest = "a".repeat(64);
afterEach(cleanup);
const summary: ContentObservationSummary = {
  brainId: "brain-alpha",
  storePath: "brains/brain-alpha/signals/content.sqlite",
  schemaVersion: 1,
  signalEngineVersion: "sha256-v1",
  currentGenerationId: "generation-1",
  currentGenerationObservedAt: 1_700_000_000_000,
  sourceFingerprint: "fixture-fingerprint",
  observationCount: 1,
  hashedCount: 1,
  unreadableCount: 0,
  unstableCount: 0,
  unsupportedCount: 0,
};

const hashed: ContentObservation = {
  relativePath: "a/original.bin",
  sizeBytes: 3,
  modifiedUnixMs: null,
  observationStatus: "HASHED",
  hashAlgorithm: "sha256-v1",
  hashHex: digest,
  observedAtUnixMs: 1_700_000_000_000,
  generationId: "generation-1",
  diagnostic: null,
};

function panel(
  observation: ContentObservation | null,
  options: { locale?: "fr" | "en"; fresh?: boolean; members?: number } = {},
) {
  return render(
    <ContentObservationsPanel
      observation={observation}
      summary={summary}
      identicalMemberCount={options.members ?? 1}
      loading={false}
      observedThisSession={options.fresh ?? true}
      locale={options.locale ?? "fr"}
    />,
  );
}

describe("TASK-0023 content observation UI", () => {
  it("keeps the complete digest accessible and calls it an observation", () => {
    panel(hashed, { members: 3 });
    expect(screen.getByText("SHA-256 observé")).toBeVisible();
    expect(screen.getByTestId("content-digest")).toHaveTextContent(digest);
    expect(screen.getByTestId("content-digest").textContent).toHaveLength(64);
    expect(screen.getByTestId("content-other-count")).toHaveTextContent("2 autres occurrences");
    expect(screen.getByText("Cette observation ne crée aucune relation.")).toBeVisible();
  });

  it("states that no campaign means content was not observed", () => {
    panel(null);
    expect(screen.getByText("Contenu non observé")).toBeVisible();
  });

  it("labels persisted state honestly after a restart", () => {
    panel(hashed, { fresh: false });
    expect(screen.getByText("Dernière observation enregistrée")).toBeVisible();
    expect(screen.queryByText(/observation actuelle/i)).not.toBeInTheDocument();
  });

  it.each([
    ["UNREADABLE", "illisible"],
    ["UNSTABLE_DURING_READ", "changé pendant la lecture"],
    ["UNSUPPORTED", "pas pris en charge"],
  ] as const)("publishes no digest for %s", (status, message) => {
    const rendered = panel({
      ...hashed,
      observationStatus: status,
      hashAlgorithm: null,
      hashHex: null,
    });
    expect(rendered.getByText(new RegExp(message))).toBeVisible();
    expect(rendered.queryByTestId("content-digest")).not.toBeInTheDocument();
  });

  it("carries the complete English surface without changing the fact model", () => {
    panel(hashed, { locale: "en", fresh: false });
    expect(screen.getByRole("region", { name: "Content observations" })).toBeVisible();
    expect(screen.getByText("Observed SHA-256")).toBeVisible();
    expect(screen.getByText("Last recorded observation")).toBeVisible();
    expect(screen.getByText("This observation creates no relation.")).toBeVisible();
  });

  it("defines separate complete FR and EN wording", () => {
    expect(CONTENT_OBSERVATION_STRINGS.fr.title).toBe("Observations de contenu");
    expect(CONTENT_OBSERVATION_STRINGS.en.title).toBe("Content observations");
    expect(Object.keys(CONTENT_OBSERVATION_STRINGS.fr)).toStrictEqual(
      Object.keys(CONTENT_OBSERVATION_STRINGS.en),
    );
  });
});
