// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { prefersReducedMotion } from "@/lib/device";
import type { FillBand } from "@/lib/formula-store";

/*
 * DOM sinks for the flacons (formula-store's onFormula). They write CSS variables and data attributes
 * straight onto a [data-flacon] figure, so a new colour never re-renders anything.
 *
 * The liquid is tinted by two stacked spans, [data-tint="a"] (the colour shown) and [data-tint="b"]
 * (the next one). A change cross-fades B in over A by opacity alone (600 ms, silk; see flacon.module.css),
 * then A takes B's colour and B drops back to 0 in the same style change, so nothing flickers.
 */

type Fade = { shown: string | null; next: string | null; fading: boolean };
const fades = new WeakMap<HTMLElement, Fade>();
const FADE_MS = 600;

/**
 * Sets the liquid's tint. The first call (or any call under reduced motion) paints both layers at once.
 * New colours that arrive mid-fade keep updating B, so the running fade carries the newest one in and
 * A settles on it when that fade ends.
 */
export function applyTincture(figure: HTMLElement, hex: string): void {
  let fade = fades.get(figure);
  if (!fade) {
    fade = { shown: null, next: null, fading: false };
    fades.set(figure, fade);
  }
  const b = figure.querySelector<HTMLElement>('[data-tint="b"]');

  if (fade.shown === null || !b || prefersReducedMotion()) {
    figure.style.setProperty("--tint-a", hex);
    figure.style.setProperty("--tint-b", hex);
    figure.removeAttribute("data-xfade");
    fade.shown = fade.next = hex;
    fade.fading = false;
    return;
  }

  fade.next = hex;
  figure.style.setProperty("--tint-b", hex);
  if (fade.fading || hex === fade.shown) return;

  fade.fading = true;
  const state = fade;
  let timer = 0;
  const settle = (event?: TransitionEvent) => {
    if (event && (event.target !== b || event.propertyName !== "opacity")) return;
    b.removeEventListener("transitionend", settle);
    b.removeEventListener("transitioncancel", settle);
    window.clearTimeout(timer);
    const colour = state.next ?? hex;
    figure.style.setProperty("--tint-a", colour);
    figure.removeAttribute("data-xfade");
    state.shown = colour;
    state.fading = false;
  };
  b.addEventListener("transitionend", settle);
  b.addEventListener("transitioncancel", settle);
  // Belt and braces: a transition that never runs (a hidden figure) must not leave the fade stuck.
  timer = window.setTimeout(() => settle(), FADE_MS + 200);
  figure.setAttribute("data-xfade", "");
}

/**
 * Shows the rendered liquid pass for a fill band. When the band changes, the liquid settles: a 400 ms
 * scaleY(.985) → none from its foot (compositor-only), skipped under reduced motion.
 */
export function setFill(figure: HTMLElement, band: FillBand): void {
  if (figure.dataset.fill === band) return;
  figure.dataset.fill = band;
  const liquid = figure.querySelector<HTMLElement>("[data-liquid]");
  if (!liquid || prefersReducedMotion() || typeof liquid.animate !== "function") return;
  liquid.animate([{ transform: "scaleY(0.985)" }, { transform: "none" }], {
    duration: 400,
    easing: "cubic-bezier(0.16, 1, 0.3, 1)",
  });
}
