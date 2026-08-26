import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { createDemoSnapshot } from "./lib/demo";

const invokeMock = vi.fn();
vi.mock("@tauri-apps/api/core", () => ({ invoke: (...args: unknown[]) => invokeMock(...args) }));
vi.mock("./components/TerrainMap", () => ({
  default: () => <div data-testid="terrain-map" aria-label="Rendu topographique interactif" />,
}));

describe("FileTopo application shell", () => {
  afterEach(cleanup);

  beforeEach(() => {
    invokeMock.mockImplementation((command: string) => {
      if (command === "health") {
        return Promise.resolve({ appVersion: "0.1.0", sqliteVersion: "3.53.2", mode: "local_offline" });
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
        return Promise.resolve({ appVersion: "0.1.0", sqliteVersion: "3.53.2", mode: "local_offline" });
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

  it("translates the complete navigation chrome to English", async () => {
    render(<App />);
    await waitFor(() => expect(screen.getByText(/démonstration locale/i)).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "EN" }));

    expect(screen.getByText(/parallel navigation/i)).toBeInTheDocument();
    expect(screen.getByText(/local demonstration/i)).toBeInTheDocument();
    expect(screen.queryByText(/navigation parallèle/i)).not.toBeInTheDocument();
  });
});
