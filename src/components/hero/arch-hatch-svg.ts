// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { PALETTE } from "@/lib/palette";
import { el, svgDoc } from "@/lib/svg-string";

/*
 * The engraver's hatching across the frontispiece amber, as a static file: out/plates/arch/hatch.svg,
 * written at build time by app/plates/arch/[file]/route.ts. The niche uses it as a CSS mask over a
 * sepia fill, multiplied into the photograph (hero/heightening.tsx, frontispiece.module.css .hatch),
 * so it costs one cached request instead of 11 KB in the HTML.
 *
 * Same 500 × 700 box as the niche and the poster: the amber spans x 152–346 from y ≈ 420 to its
 * rounded foot at y ≈ 528. Cross-contour arcs (the liquid's level sections, seen from just above,
 * sagging more towards the foot), broken where each crosses one of the ten flutes; a second,
 * half-pitch pass on the shade side only, so the pitch closes from about 5 units at the window to
 * under 3 on the shade flank; and a soft radial mask so the shade gathers away from the window.
 */
const r1 = (n: number) => Math.round(n * 10) / 10;

/** A tiny deterministic wobble so the hatching reads as hand-cut, not ruled. */
function wobble(i: number): number {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return (x - Math.floor(x) - 0.5) * 1.2;
}

const LIQUID_LEFT = 154;
const LIQUID_RIGHT = 346;
const LIQUID_TOP = 421;
const HATCH_STEP = 5.4;
const HATCH_LINES = 20;

/** Points along a quadratic from (x0, y0) to (x1, y1) through a sag of `bow` at the middle. */
function sectionAt(x0: number, y0: number, x1: number, y1: number, bow: number, u: number): [number, number] {
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2 + 2 * bow;
  const v = 1 - u;
  return [v * v * x0 + 2 * v * u * cx + u * u * x1, v * v * y0 + 2 * v * u * cy + u * u * y1];
}

/**
 * One level section of the liquid, seen from just above (2 degrees of camera pitch): an arc that sags
 * more towards the foot, cut into short strokes with a small gap at every flute, from `from` to `to`
 * (0..1 across the amber).
 */
function section(i: number, offset: number, from: number, to: number): string {
  const t = i / (HATCH_LINES - 1);
  const y = LIQUID_TOP + (i + offset) * HATCH_STEP + wobble(i + 3) * 0.6;
  const x0 = LIQUID_LEFT + wobble(i) * 3;
  const x1 = LIQUID_RIGHT + wobble(i + 7);
  const y1 = y + wobble(i + 11) * 0.5;
  const bow = 5 + 7 * t;
  let d = "";
  for (let k = Math.floor(from * 10); k < Math.ceil(to * 10); k++) {
    // Each flute's stretch, less a gap of about 3 units where the flute's edge interrupts it.
    const a = Math.max(from, k / 10 + 0.008);
    const b = Math.min(to, (k + 1) / 10 - 0.008);
    if (b <= a) continue;
    const p0 = sectionAt(x0, y, x1, y1, bow, a);
    const pm = sectionAt(x0, y, x1, y1, bow, (a + b) / 2);
    const p1 = sectionAt(x0, y, x1, y1, bow, b);
    d += `M${r1(p0[0])} ${r1(p0[1])}L${r1(pm[0])} ${r1(pm[1])}L${r1(p1[0])} ${r1(p1[1])}`;
  }
  return d;
}

/*
 * Two passes, one path each (an engraver works line by line): full sections across the amber, then
 * half-pitch sections on the shade side only (the right 45%), so the pitch closes from about 5 units
 * at the window to under 3 on the shade flank. The soft mask (SHADE, below) fades both out towards
 * the window, so the shading reads as a worked wash, not ruled stripes.
 */
export const HATCH = Array.from({ length: HATCH_LINES }, (_, i) => section(i, 0, 0, 1)).join("");
export const HATCH_SHADE = Array.from({ length: HATCH_LINES - 1 }, (_, i) => section(i, 0.5, 0.55, 1)).join("");

/** Liquid silhouette (with its rounded foot) that the hatching is clipped to. */
const LIQUID_CLIP = "M153 418H347V500Q345 522 300 530H206Q155 522 153 500Z";

export function archHatchSvg(): string {
  const body = [
    el(
      "defs",
      null,
      el("clipPath", { id: "h-liquid" }, el("path", { d: LIQUID_CLIP })),
      // The shade: full at the lower right (away from the window), gone by the lit left third.
      el(
        "radialGradient",
        { id: "h-shade", gradientUnits: "userSpaceOnUse", cx: 356, cy: 540, r: 165 },
        el("stop", { offset: 0, "stop-color": "#fff" }),
        el("stop", { offset: 1, "stop-color": "#000" }),
      ),
      el(
        "mask",
        { id: "h-mask", maskUnits: "userSpaceOnUse", x: 140, y: 400, width: 220, height: 140 },
        el("rect", { x: 140, y: 400, width: 220, height: 140, fill: "url(#h-shade)" }),
      ),
    ),
    el(
      "g",
      { "clip-path": "url(#h-liquid)", mask: "url(#h-mask)", fill: "none", stroke: PALETTE.rosemary, "stroke-width": 0.9, "stroke-linecap": "round" },
      el("path", { d: HATCH }),
      el("path", { d: HATCH_SHADE }),
    ),
  ].join("");
  return svgDoc({ viewBox: "0 0 500 700", title: "Hatching across the amber, drawn for Aetheria", body });
}
