// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

/**
 * Shared, mutable state for the 3D flacon.
 *
 * GSAP timelines and the Compound Blender write into these plain objects, and the
 * three.js render loop reads them every frame. Because nothing here is React state,
 * scrubbing a scroll timeline or dragging a slider never re-renders the canvas.
 */
export type Rgb = { r: number; g: number; b: number };

export const heroFlacon = {
  /** 0 = stopper seated, 1 = lifted clear and hovering. Scrubbed by the hero scroll. */
  capLift: 0,
  /** 0..1 — how much vapour the open flacon releases. */
  vapour: 0,
  /** Extra turntable rotation in radians, added on top of the idle drift. */
  spin: 0,
};

export const blendFlacon = {
  capLift: 0,
  vapour: 0,
  spin: 0,
  /** Liquid colour the tincture eases toward (linear 0..1 channels). */
  liquid: { r: 0.72, g: 0.5, b: 0.24 } as Rgb,
  /** Fill height, 0..1 of the vessel's inner volume. */
  level: 0.62,
  /** Momentary agitation, 0..1. Set to 1 on a change; the scene decays it. */
  swirl: 0,
};

export type FlaconSource = typeof heroFlacon | typeof blendFlacon;

/** "#b8583d" → linear-ish 0..1 channels the scene can lerp toward. */
export function hexToRgb(hex: string): Rgb {
  const clean = hex.replace("#", "");
  const n = Number.parseInt(clean.length === 3 ? clean.replace(/(.)/g, "$1$1") : clean, 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}
