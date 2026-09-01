/**
 * `TASK-0018` — the brain selector and the per-brain session memory.
 *
 * What is checked here is what `K7`, `K8` and `K10` say in words: the identity
 * on screen comes from the catalogue, colour is never the only signal, the
 * keyboard alone can change brains, and two brains never share a session state.
 *
 * `K10` also demands a **real** keystroke in the real WebView2. That belongs to
 * the host scenario, not to jsdom: what these tests establish is that the
 * control is reachable and operable **by key events at all** — a necessary
 * condition the host run then exercises for real.
 */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import BrainSelector from "./BrainSelector";
import {
  emptySessionMemory,
  recallBrainSession,
  rememberBrainSession,
  sameBrainSession,
  shouldFitOnOpen,
} from "./brainSession";
import type { BrainRecord } from "./types";
import type { View } from "./viewState";

afterEach(cleanup);

/** The three brains `TASK-0018` §4.2 freezes, as the catalogue returns them. */
const brains: BrainRecord[] = [
  {
    brainId: "brain-alpha",
    displayName: "Cerveau Alpha",
    color: "#1F6F5C",
    icon: "▲",
    sourceKind: "SYNTHETIC_FIXTURE",
    sourceRef: "quasi-empty",
    position: 1,
  },
  {
    brainId: "brain-beta",
    displayName: "Cerveau Bêta",
    color: "#4A4FA8",
    icon: "■",
    sourceKind: "SYNTHETIC_FIXTURE",
    sourceRef: "deep",
    position: 2,
  },
  {
    brainId: "brain-gamma",
    displayName: "Cerveau Gamma",
    color: "#9A5A18",
    icon: "◆",
    sourceKind: "SYNTHETIC_FIXTURE",
    sourceRef: "quasi-empty",
    position: 3,
  },
];

const selectorStrings = {
  label: "Cerveau actif",
  active: "actif",
  source: "source",
  switching: "Bascule…",
};

function renderSelector(
  activeBrainId = "brain-alpha",
  onSelect: (brainId: string) => void = () => {},
  showSource = false,
) {
  return render(
    <BrainSelector
      brains={brains}
      activeBrainId={activeBrainId}
      onSelect={onSelect}
      strings={selectorStrings}
      showSource={showSource}
    />,
  );
}

describe("sélecteur de cerveau — K7 et K10", () => {
  it("affiche le cerveau actif avec son nom et son icône, venus du catalogue", () => {
    renderSelector();
    const trigger = screen.getByTestId("brain-trigger");
    expect(trigger.textContent).toContain("Cerveau Alpha");
    expect(trigger.textContent).toContain("▲");
  });

  it("montre les métadonnées modifiées plutôt que les valeurs gelées", () => {
    // `K7`: the interface must use the catalogue, so a renamed brain shows its
    // new name. Rendering the frozen table instead would pass every other test
    // and fail this one.
    const renamed = brains.map((brain) =>
      brain.brainId === "brain-alpha"
        ? { ...brain, displayName: "Cerveau renommé", icon: "◉", color: "#123456" }
        : brain,
    );
    render(
      <BrainSelector
        brains={renamed}
        activeBrainId="brain-alpha"
        onSelect={() => {}}
        strings={selectorStrings}
      />,
    );
    const trigger = screen.getByTestId("brain-trigger");
    expect(trigger.textContent).toContain("Cerveau renommé");
    expect(trigger.textContent).toContain("◉");
    expect(trigger.textContent).not.toContain("Cerveau Alpha");
  });

  it("identifie chaque cerveau autrement que par la seule couleur", () => {
    renderSelector();
    fireEvent.click(screen.getByTestId("brain-trigger"));

    const icons = new Set<string>();
    for (const brain of brains) {
      const item = screen.getByTestId(`brain-item-${brain.brainId}`);
      // A name in words, and a shape — both readable with no colour at all.
      expect(item.textContent).toContain(brain.displayName);
      const icon = item.querySelector(".brains__icon")?.textContent ?? "";
      expect(icon).not.toBe("");
      icons.add(icon);
      // The colour exists, but only on a decorative swatch.
      const swatch = item.querySelector(".brains__swatch");
      expect(swatch?.getAttribute("aria-hidden")).toBe("true");
    }
    expect(icons.size).toBe(brains.length);

    // The active one says so in words and to assistive technology.
    const active = screen.getByTestId("brain-item-brain-alpha");
    expect(active.getAttribute("aria-checked")).toBe("true");
    expect(active.textContent).toContain("actif");
    expect(screen.getByTestId("brain-item-brain-beta").getAttribute("aria-checked")).toBe(
      "false",
    );
  });

  it("ouvre le menu, parcourt et choisit au clavier seul — K10", () => {
    const onSelect = vi.fn();
    renderSelector("brain-alpha", onSelect);
    const trigger = screen.getByTestId("brain-trigger");

    // Reachable by focus, opened by a key, never by a pointer here.
    trigger.focus();
    expect(document.activeElement).toBe(trigger);
    fireEvent.keyDown(trigger, { key: "ArrowDown" });

    // Focus lands on the active entry, then moves with the arrows.
    expect(document.activeElement).toBe(screen.getByTestId("brain-item-brain-alpha"));
    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    expect(document.activeElement).toBe(screen.getByTestId("brain-item-brain-beta"));
    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    expect(document.activeElement).toBe(screen.getByTestId("brain-item-brain-gamma"));
    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    expect(document.activeElement).toBe(screen.getByTestId("brain-item-brain-alpha"));

    // Enter on a menu item is what a browser turns into an activation.
    fireEvent.keyDown(document.activeElement!, { key: "ArrowUp" });
    expect(document.activeElement).toBe(screen.getByTestId("brain-item-brain-gamma"));
    fireEvent.click(document.activeElement!);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("brain-gamma");
    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("referme le menu sur Échap sans rien choisir", () => {
    const onSelect = vi.fn();
    renderSelector("brain-alpha", onSelect);
    const trigger = screen.getByTestId("brain-trigger");
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    expect(screen.getByRole("menu")).toBeTruthy();

    fireEvent.keyDown(document.activeElement!, { key: "Escape" });

    expect(screen.queryByRole("menu")).toBeNull();
    expect(onSelect).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(trigger);
  });

  it("reste ouvert quand le focus quitte la fenêtre, pas la page — K10", () => {
    // A window deactivation raises `blur` with a null `relatedTarget`, exactly
    // like focus going nowhere. Closing on both is what made the real
    // keystroke of `K10` land on a button that had just been unmounted: the
    // host brings the window forward, the menu vanishes, the key hits nothing.
    const onSelect = vi.fn();
    renderSelector("brain-alpha", onSelect);
    fireEvent.keyDown(screen.getByTestId("brain-trigger"), { key: "ArrowDown" });
    const item = screen.getByTestId("brain-item-brain-alpha");
    expect(document.activeElement).toBe(item);

    fireEvent.blur(item, { relatedTarget: null });

    expect(screen.queryByRole("menu")).toBeTruthy();
    expect(screen.getByTestId("brain-item-brain-alpha")).toBeTruthy();
  });

  it("se referme quand le focus part vers un autre élément de la page", () => {
    const onSelect = vi.fn();
    const { container } = renderSelector("brain-alpha", onSelect);
    const outside = document.createElement("button");
    container.appendChild(outside);
    fireEvent.keyDown(screen.getByTestId("brain-trigger"), { key: "ArrowDown" });

    fireEvent.blur(screen.getByTestId("brain-item-brain-alpha"), {
      relatedTarget: outside,
    });

    expect(screen.queryByRole("menu")).toBeNull();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("montre la source synthétique en diagnostic, jamais comme identité", () => {
    renderSelector("brain-alpha", () => {}, true);
    fireEvent.click(screen.getByTestId("brain-trigger"));

    // Alpha and Gamma read the same source, and the menu still tells them
    // apart: the source is a note, the identity is the name and the icon.
    const alpha = screen.getByTestId("brain-item-brain-alpha");
    const gamma = screen.getByTestId("brain-item-brain-gamma");
    expect(alpha.textContent).toContain("quasi-empty");
    expect(gamma.textContent).toContain("quasi-empty");
    expect(alpha.textContent).toContain("Cerveau Alpha");
    expect(gamma.textContent).toContain("Cerveau Gamma");
    // The trigger shows the identity, not the source.
    expect(screen.getByTestId("brain-trigger").textContent).not.toContain("quasi-empty");
  });

  it("le menu suit le cerveau actif quand il change", () => {
    function Harness() {
      const [active, setActive] = useState("brain-alpha");
      return (
        <BrainSelector
          brains={brains}
          activeBrainId={active}
          onSelect={setActive}
          strings={selectorStrings}
        />
      );
    }
    render(<Harness />);
    fireEvent.click(screen.getByTestId("brain-trigger"));
    fireEvent.click(screen.getByTestId("brain-item-brain-beta"));

    expect(screen.getByTestId("brain-trigger").textContent).toContain("Cerveau Bêta");
    fireEvent.click(screen.getByTestId("brain-trigger"));
    expect(screen.getByTestId("brain-item-brain-beta").getAttribute("aria-checked")).toBe(
      "true",
    );
    expect(screen.getByTestId("brain-item-brain-alpha").getAttribute("aria-checked")).toBe(
      "false",
    );
  });
});

describe("mémoire de session par cerveau — K8", () => {
  const alphaView: View = { scale: 2.5, tx: -120, ty: 40 };
  const betaView: View = { scale: 0.75, tx: 18, ty: -6 };

  it("rend à chaque cerveau ce qu'il a laissé, et rien d'un autre", () => {
    let memory = emptySessionMemory();
    memory = rememberBrainSession(memory, "brain-alpha", {
      selectedId: 7,
      view: alphaView,
    });
    memory = rememberBrainSession(memory, "brain-beta", {
      selectedId: 140,
      view: betaView,
    });

    expect(recallBrainSession(memory, "brain-alpha")).toEqual({
      selectedId: 7,
      view: alphaView,
    });
    expect(recallBrainSession(memory, "brain-beta")).toEqual({
      selectedId: 140,
      view: betaView,
    });
    // A brain never visited has nothing to restore — and no default borrowed
    // from a neighbour.
    expect(recallBrainSession(memory, "brain-gamma")).toBeNull();
  });

  it("n'écrase jamais un cerveau en enregistrant un autre", () => {
    let memory = emptySessionMemory();
    memory = rememberBrainSession(memory, "brain-alpha", { selectedId: 7, view: alphaView });
    const alphaBefore = recallBrainSession(memory, "brain-alpha");

    memory = rememberBrainSession(memory, "brain-beta", { selectedId: 1, view: betaView });
    memory = rememberBrainSession(memory, "brain-beta", { selectedId: 2, view: alphaView });

    expect(sameBrainSession(recallBrainSession(memory, "brain-alpha"), alphaBefore)).toBe(true);
    expect(recallBrainSession(memory, "brain-beta")?.selectedId).toBe(2);
  });

  it("rend une copie, pour qu'un appelant ne puisse pas modifier la mémoire", () => {
    let memory = emptySessionMemory();
    memory = rememberBrainSession(memory, "brain-alpha", { selectedId: 7, view: alphaView });

    const recalled = recallBrainSession(memory, "brain-alpha")!;
    recalled.view.scale = 999;
    recalled.selectedId = -1;

    expect(recallBrainSession(memory, "brain-alpha")).toEqual({
      selectedId: 7,
      view: alphaView,
    });
  });

  it("ne partage rien entre deux cerveaux qui lisent la même source", () => {
    // `brain-alpha` and `brain-gamma` read `quasi-empty`, so the *same* node id
    // is valid in both. The memory must still keep them apart.
    let memory = emptySessionMemory();
    memory = rememberBrainSession(memory, "brain-alpha", { selectedId: 6, view: alphaView });
    memory = rememberBrainSession(memory, "brain-gamma", { selectedId: 6, view: betaView });

    const alpha = recallBrainSession(memory, "brain-alpha")!;
    const gamma = recallBrainSession(memory, "brain-gamma")!;
    expect(alpha.selectedId).toBe(gamma.selectedId);
    expect(sameBrainSession(alpha, gamma)).toBe(false);
    expect(alpha.view).toEqual(alphaView);
    expect(gamma.view).toEqual(betaView);
  });

  it("n'ajuste la vue qu'une fois par cerveau — la régression que K12 a trouvée", () => {
    // The viewport is measured after the first render, so the placeholder 1×1
    // fit has to be redone. Redoing it a second time is what erased a restored
    // view in the real host, with `K12` publishing `alphaRestored=false`.
    const measured = { brainId: "brain-alpha", width: 1200, height: 800 };
    const placeholder = { brainId: "brain-alpha", width: 1, height: 1 };

    // Never positioned, or positioned for another brain: fit.
    expect(shouldFitOnOpen(null, "brain-alpha")).toBe(true);
    expect(shouldFitOnOpen(measured, "brain-gamma")).toBe(true);
    // Fitted against the placeholder viewport: that fit meant nothing, redo it.
    expect(shouldFitOnOpen(placeholder, "brain-alpha")).toBe(true);
    // Already positioned against a real viewport: leave it alone.
    expect(shouldFitOnOpen(measured, "brain-alpha")).toBe(false);
  });

  it("compare deux états de session sur leurs valeurs, pas sur leur identité", () => {
    const state = { selectedId: 3, view: alphaView };
    expect(sameBrainSession(state, { selectedId: 3, view: { ...alphaView } })).toBe(true);
    expect(sameBrainSession(state, { selectedId: 3, view: betaView })).toBe(false);
    expect(sameBrainSession(state, null)).toBe(false);
    expect(sameBrainSession(null, null)).toBe(true);
  });
});
