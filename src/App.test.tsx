import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { createDemoSnapshot } from "./lib/demo";
import { LOCALE_STORAGE_KEY } from "./lib/locale";

const invokeMock = vi.fn();
vi.mock("@tauri-apps/api/core", () => ({ invoke: (...args: unknown[]) => invokeMock(...args) }));
vi.mock("./components/TerrainMap", () => ({
  default: () => <div data-testid="terrain-map" aria-label="Rendu topographique interactif" />,
}));

/**
 * Overrides the language tags jsdom advertises. The properties are installed
 * on the navigator instance itself, so `restoreHostLanguages` fully undoes it.
 */
function setHostLanguages(languages: readonly string[]) {
  Object.defineProperty(window.navigator, "languages", { value: languages, configurable: true });
  Object.defineProperty(window.navigator, "language", { value: languages[0] ?? "", configurable: true });
}

function restoreHostLanguages() {
  Reflect.deleteProperty(window.navigator, "languages");
  Reflect.deleteProperty(window.navigator, "language");
}

describe("FileTopo application shell", () => {
  afterEach(() => {
    cleanup();
    restoreHostLanguages();
    localStorage.clear();
  });

  beforeEach(() => {
    localStorage.clear();
    // These tests assert the French chrome, so they pin a French system.
    setHostLanguages(["fr-CA", "fr"]);
    invokeMock.mockImplementation((command: string) => {
      if (command === "health") {
        return Promise.resolve({ appVersion: "0.1.0-alpha.1", sqliteVersion: "3.53.2", mode: "local_offline", syntheticFixtureAvailable: true });
      }
      if (command === "list_collections") return Promise.resolve([]);
      return Promise.resolve(createDemoSnapshot(32));
    });
  });

  it("presents a local-first synthetic map and accessible node index", async () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: /arborescence devient un territoire/i })).toBeInTheDocument();
    expect(screen.getByText(/données synthétiques seulement/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByRole("option").length).toBeGreaterThan(8));
    expect(screen.getByTestId("terrain-map")).toBeInTheDocument();
  });

  it("shows registered collections without exposing an absolute root path", async () => {
    invokeMock.mockImplementation((command: string) => {
      if (command === "health") {
        return Promise.resolve({ appVersion: "0.1.0-alpha.1", sqliteVersion: "3.53.2", mode: "local_offline", syntheticFixtureAvailable: true });
      }
      if (command === "list_collections") {
        return Promise.resolve([{
          id: "synthetic-id", name: "Notes synthétiques", rootLabel: "Notes synthétiques",
          color: "#b8db82", nodeCount: 12, totalSizeBytes: 4_096,
          createdUnixMs: 1, lastIndexedUnixMs: 2,
        }]);
      }
      return Promise.resolve(createDemoSnapshot(32));
    });

    render(<App />);

    expect(await screen.findByRole("button", { name: /notes synthétiques 12 éléments/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /indexer maintenant/i })).toBeInTheDocument();
    expect(screen.queryByText(/C:\\/)).not.toBeInTheDocument();
  });

  it("filters the accessible list without opening file contents", async () => {
    render(<App />);
    const list = screen.getByRole("listbox");
    await waitFor(() => expect(within(list).getAllByRole("option").length).toBeGreaterThan(8));

    fireEvent.change(screen.getByRole("combobox", { name: /type d’élément/i }), { target: { value: "directory" } });
    expect(within(list).getAllByRole("option")).toHaveLength(8);

    fireEvent.change(screen.getByRole("combobox", { name: /type d’élément/i }), { target: { value: "file" } });
    fireEvent.click(screen.getByRole("checkbox", { name: /en ligne/i }));
    expect(within(list).getAllByRole("option")).toHaveLength(1);
  });

  it("offers the synthetic fixture only when the build says it is available", async () => {
    render(<App />);
    expect(await screen.findByRole("button", { name: /fixture synthétique/i })).toBeInTheDocument();
    cleanup();

    invokeMock.mockImplementation((command: string) => {
      if (command === "health") {
        return Promise.resolve({
          appVersion: "0.1.0-alpha.1", sqliteVersion: "3.53.2", mode: "local_offline",
          syntheticFixtureAvailable: false,
        });
      }
      if (command === "list_collections") return Promise.resolve([]);
      return Promise.resolve(createDemoSnapshot(32));
    });

    render(<App />);
    await waitFor(() => expect(screen.getByText(/démonstration locale/i)).toBeInTheDocument());
    expect(screen.queryByRole("button", { name: /fixture synthétique/i })).not.toBeInTheDocument();
  });

  it("translates the complete navigation chrome to English", async () => {
    render(<App />);
    await waitFor(() => expect(screen.getByText(/démonstration locale/i)).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /switch to english/i }));

    expect(screen.getByText(/parallel navigation/i)).toBeInTheDocument();
    expect(screen.getByText(/local demonstration/i)).toBeInTheDocument();
    expect(screen.queryByText(/navigation parallèle/i)).not.toBeInTheDocument();
  });
});

describe("FileTopo language selection", () => {
  afterEach(() => {
    cleanup();
    restoreHostLanguages();
    localStorage.clear();
  });

  beforeEach(() => {
    localStorage.clear();
    invokeMock.mockImplementation((command: string) => {
      if (command === "health") {
        return Promise.resolve({ appVersion: "0.1.0-alpha.1", sqliteVersion: "3.53.2", mode: "local_offline", syntheticFixtureAvailable: true });
      }
      if (command === "list_collections") return Promise.resolve([]);
      return Promise.resolve(createDemoSnapshot(32));
    });
  });

  it("starts in French on a French system", () => {
    setHostLanguages(["fr-CA", "en-CA"]);
    render(<App />);
    expect(screen.getByText(/navigation parallèle/i)).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("fr");
  });

  it("starts in English on a system that is not French", () => {
    setHostLanguages(["de-DE"]);
    render(<App />);
    expect(screen.getByText(/parallel navigation/i)).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("en");
  });

  it("starts in English when the system advertises no language at all", () => {
    setHostLanguages([]);
    render(<App />);
    expect(screen.getByText(/parallel navigation/i)).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("en");
  });

  it("keeps a French region of an English language in English", () => {
    setHostLanguages(["en-FR"]);
    render(<App />);
    expect(screen.getByText(/parallel navigation/i)).toBeInTheDocument();
  });

  it("persists an explicit choice and restores it on the next start", () => {
    setHostLanguages(["en-US"]);
    const first = render(<App />);
    expect(screen.getByText(/parallel navigation/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /afficher l’interface en français/i }));
    expect(screen.getByText(/navigation parallèle/i)).toBeInTheDocument();
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe("fr");

    // Unmount and mount again: the same English system, but a stored choice.
    first.unmount();
    render(<App />);
    expect(screen.getByText(/navigation parallèle/i)).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("fr");
  });

  it("lets an explicit English choice outrank a French system", () => {
    setHostLanguages(["fr-CA"]);
    const first = render(<App />);
    expect(screen.getByText(/navigation parallèle/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /switch to english/i }));
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe("en");

    first.unmount();
    render(<App />);
    expect(screen.getByText(/parallel navigation/i)).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("en");
  });

  it("ignores a corrupted stored choice and falls back to the system language", () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, "klingon");
    setHostLanguages(["fr-CA"]);
    render(<App />);
    expect(screen.getByText(/navigation parallèle/i)).toBeInTheDocument();
  });
});
