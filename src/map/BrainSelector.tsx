/**
 * The brain selector — `TASK-0018` §4.6.
 *
 * The choice of *fixture* stops being the user-facing concept; the choice of
 * **brain** replaces it. What is drawn comes from the catalogue: name, icon and
 * colour all belong to the brain, so a rename shows up here (`K7`).
 *
 * **Colour is never the only identifier** — `DEC-0017` point 12. Every entry
 * carries a distinct geometric icon and its name in words, the active one is
 * marked by the word « actif » and by `aria-checked`, and the swatch is an
 * addition rather than the signal.
 *
 * **`K10` — keyboard.** The trigger is an ordinary button, so `Tab` reaches it
 * and `Enter` or `Space` opens the menu. Inside, the arrow keys move, `Enter`
 * or `Space` chooses, `Escape` closes and returns the focus to the trigger.
 * Nothing here depends on a pointer, and nothing is activated programmatically:
 * a real keystroke has to do the work.
 */

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { BrainRecord } from "./types";

export interface BrainSelectorStrings {
  label: string;
  active: string;
  source: string;
  switching: string;
}

export interface BrainSelectorProps {
  brains: BrainRecord[];
  activeBrainId: string | null;
  disabled?: boolean;
  busy?: boolean;
  onSelect: (brainId: string) => void;
  strings: BrainSelectorStrings;
  /** Developer diagnostic: shows which synthetic source each brain reads. */
  showSource?: boolean;
}

export default function BrainSelector({
  brains,
  activeBrainId,
  disabled = false,
  busy = false,
  onSelect,
  strings,
  showSource = false,
}: BrainSelectorProps) {
  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(0);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();

  const active = brains.find((brain) => brain.brainId === activeBrainId) ?? null;
  const activeIndex = Math.max(
    0,
    brains.findIndex((brain) => brain.brainId === activeBrainId),
  );

  // Focus follows the keyboard rather than the mouse: an open menu whose focus
  // stayed on the trigger would announce nothing and accept no arrow key.
  useEffect(() => {
    if (!open) return;
    itemRefs.current[focusIndex]?.focus();
  }, [open, focusIndex]);

  const openMenu = useCallback(
    (index: number) => {
      if (disabled || brains.length === 0) return;
      setFocusIndex(index);
      setOpen(true);
    },
    [brains.length, disabled],
  );

  const closeMenu = useCallback((returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  const choose = useCallback(
    (brainId: string) => {
      setOpen(false);
      triggerRef.current?.focus();
      onSelect(brainId);
    },
    [onSelect],
  );

  const onTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      openMenu(event.key === "ArrowDown" ? activeIndex : brains.length - 1);
    }
  };

  const onItemKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setFocusIndex((index + 1) % brains.length);
        break;
      case "ArrowUp":
        event.preventDefault();
        setFocusIndex((index - 1 + brains.length) % brains.length);
        break;
      case "Home":
        event.preventDefault();
        setFocusIndex(0);
        break;
      case "End":
        event.preventDefault();
        setFocusIndex(brains.length - 1);
        break;
      case "Escape":
        event.preventDefault();
        closeMenu(true);
        break;
      case "Tab":
        // Leaving by Tab closes the menu, but never steals the key: the focus
        // order of the rest of the page stays the page's business.
        setOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div className="brains" data-testid="brain-selector">
      <span className="brains__label" id={`${menuId}-label`}>
        {strings.label}
      </span>
      <button
        type="button"
        ref={triggerRef}
        className="brains__trigger"
        data-testid="brain-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-labelledby={`${menuId}-label`}
        disabled={disabled}
        onClick={() => (open ? closeMenu(false) : openMenu(activeIndex))}
        onKeyDown={onTriggerKeyDown}
      >
        <span className="brains__icon" aria-hidden="true">
          {active?.icon ?? "·"}
        </span>
        <span className="brains__name">
          {busy ? strings.switching : active?.displayName ?? strings.label}
        </span>
        <span
          className="brains__swatch"
          aria-hidden="true"
          style={{ backgroundColor: active?.color ?? "transparent" }}
        />
        <span className="brains__caret" aria-hidden="true">
          ▾
        </span>
      </button>

      {open ? (
        <ul className="brains__menu" id={menuId} role="menu" aria-labelledby={`${menuId}-label`}>
          {brains.map((brain, index) => {
            const isActive = brain.brainId === activeBrainId;
            return (
              <li key={brain.brainId} role="none">
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={isActive}
                  className="brains__item"
                  data-testid={`brain-item-${brain.brainId}`}
                  data-brain-id={brain.brainId}
                  ref={(element) => {
                    itemRefs.current[index] = element;
                  }}
                  tabIndex={index === focusIndex ? 0 : -1}
                  onKeyDown={(event) => onItemKeyDown(event, index)}
                  onClick={() => choose(brain.brainId)}
                  onBlur={(event) => {
                    // Focus leaving the menu entirely closes it; focus moving
                    // between its own items does not.
                    const next = event.relatedTarget as Node | null;
                    if (!next || !event.currentTarget.closest("ul")?.contains(next)) {
                      setOpen(false);
                    }
                  }}
                >
                  <span className="brains__icon" aria-hidden="true">
                    {brain.icon}
                  </span>
                  <span className="brains__name">{brain.displayName}</span>
                  <span
                    className="brains__swatch"
                    aria-hidden="true"
                    style={{ backgroundColor: brain.color }}
                  />
                  {/* In words, not only in colour — DEC-0017 point 12. */}
                  {isActive ? <span className="brains__state">{strings.active}</span> : null}
                  {showSource ? (
                    <span className="brains__source">
                      {strings.source} {brain.sourceRef}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
