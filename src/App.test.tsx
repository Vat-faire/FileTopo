import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { createDemoSnapshot } from "./lib/demo";

const invokeMock = vi.fn();
vi.mock("@tauri-apps/api/core", () => ({ invoke: (...args: unknown[]) => invokeMock(...args) }));
vi.mock("./components/TerrainMap", () => ({
  default: () => <div data-testid="terrain-map" aria-label="Rendu topographique interactif" />,
}));

describe("FileTopo application shell", () => {
  beforeEach(() => {
    invokeMock.mockImplementation((command: string) => {
      if (command === "health") {
        return Promise.resolve({ appVersion: "0.1.0", sqliteVersion: "3.53.2", mode: "local_offline" });
      }
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
});
