// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import confetti from "canvas-confetti";

/** A single almond-shaped petal with a slightly lifted tip. */
const PETAL_PATH = "M0 0 C5 -7 15 -9 22 -2 C23 -1 23 1 22 2 C15 9 5 7 0 0 Z";

const PETAL_COLOURS = ["#b8583d", "#a88243", "#7d8a74", "#f9f7f2", "#c9a36a"];

/**
 * A slow fall of petals across the drawer. Low gravity, long tick life and a
 * sideways drift so they float down like something shaken from a branch.
 * Only ever called from an event/timer callback (never during render).
 */
export function releasePetals() {
  if (typeof window === "undefined") return;
  const petal = confetti.shapeFromPath({ path: PETAL_PATH });
  const wide = window.matchMedia("(min-width: 640px)").matches;
  const originX = wide ? 0.78 : 0.5;

  const shared: confetti.Options = {
    shapes: [petal],
    colors: PETAL_COLOURS,
    gravity: 0.32,
    decay: 0.93,
    ticks: 620,
    scalar: 0.85,
    startVelocity: 20,
    zIndex: 90,
    disableForReducedMotion: true,
  };

  void confetti({ ...shared, particleCount: 46, spread: 70, angle: 100, drift: 0.8, origin: { x: originX - 0.08, y: 0.18 } });
  void confetti({ ...shared, particleCount: 38, spread: 80, angle: 80, drift: -0.6, origin: { x: originX + 0.08, y: 0.22 } });
}
