// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

/**
 * Motion vocabulary for the atelier. Everything here is slow on purpose:
 * long, weighted eases that settle rather than snap, like silk dropping.
 */
export const EASE_SILK = [0.16, 1, 0.3, 1] as const;
export const EASE_DRIFT = [0.45, 0, 0.2, 1] as const;
export const EASE_PETAL = [0.33, 0.9, 0.25, 1] as const;

export const DURATION = {
  quick: 0.45,
  settle: 0.9,
  slow: 1.4,
  unhurried: 2.2,
} as const;
