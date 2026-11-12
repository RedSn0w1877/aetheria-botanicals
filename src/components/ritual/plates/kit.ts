// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { PALETTE } from "@/lib/palette";
import { el, esc, num, svgDoc, type Attrs } from "@/lib/svg-string";

/*
 * Shared plumbing for the four ritual plates, which app/plates/ritual/[file]/route.ts writes out as
 * static SVG files (viewBox 400 × 400).
 *
 * Every plate is authored in its FINAL drawn state, so the <img> that ships first is complete. When
 * ritual/plate-drawing.tsx swaps a plate inline (scrub mode only), chapters/ritual.module.css rewinds
 * and redraws it from one number, --q (0..1, the plate's share of the scroll timeline), through
 * three classes, each with its own segment [--a, --b] of --q:
 * - i: strokes that draw themselves (pathLength=1, stroke-dashoffset);
 * - f: a group that fades in;
 * - m <name>: a moving part. Any transform attribute on it is its final state; the live CSS rule
 *   for <name> overrides it. No idle loops: when the reader stops scrolling, the plate stops.
 *
 * An <img> can't see page CSS or page fonts, so colours are hard-coded hex. Labels are lowercase
 * Newsreader italic (Georgia when loaded as an <img>); figures that change live in HTML overlays.
 */

/*
 * The book's inks on its toned stock (lib/palette.ts): sepia-black line, sanguine for the one accent,
 * brass for instruments, and white gouache heightening for light on glass and liquid, never for text.
 * The plates sit on a parchment sheet, so the occluders that let lines overlap are parchment too.
 */
export const INK = PALETTE.rosemary;
export const SAGE = PALETTE.sage;
export const CLAY = PALETTE.terracotta;
export const BRASS = PALETTE.brass;
/** Moss replaces the old violet glass. */
export const MOSS = PALETTE.moss;
export const PAPER = PALETTE.parchment;
/** White gouache: highlights on glass and liquid only. */
export const GOUACHE = PALETTE.gouache;

/** A slice [a, b] of the plate's progress. */
export type Seg = readonly [number, number];

const segment = ([a, b]: Seg) => `--a:${num(a, 3)};--b:${num(b, 3)}`;

export const path = (d: string, attrs?: Attrs) => el("path", { d, ...attrs });

/** One stroke for drawGroup: the pathLength is set per path, the dash timing by the group. */
export const stroke = (d: string, attrs?: Attrs) => el("path", { pathLength: 1, d, ...attrs });

/** One stroke that draws itself over `seg`. */
export const draw = (seg: Seg, d: string, attrs?: Attrs) =>
  el("path", { class: "i", pathLength: 1, style: segment(seg), d, ...attrs });

/** Several strokes (from stroke()) drawing together over `seg`. */
export const drawGroup = (seg: Seg, attrs: Attrs | null, ...strokes: string[]) =>
  el("g", { class: "i", style: segment(seg), ...attrs }, ...strokes);

/** A group that fades in over `seg`. */
export const fade = (seg: Seg, attrs: Attrs | null, ...children: string[]) =>
  el("g", { class: "f", style: segment(seg), ...attrs }, ...children);

/** A moving part, drawn where it ends up; the live CSS rule `.live .<name>` moves it over `seg`. */
export const part = (name: string, seg: Seg, attrs: Attrs | null, ...children: string[]) =>
  el("g", { class: `m ${name}`, style: segment(seg), ...attrs }, ...children);

/** A small italic label, lowercase like every label in the book. */
export function label(
  x: number,
  y: number,
  text: string,
  { anchor, opacity, size = 13 }: { anchor?: "middle" | "end"; opacity?: number; size?: number } = {},
): string {
  return el(
    "text",
    {
      class: "lb",
      x,
      y,
      "text-anchor": anchor,
      opacity,
      "font-size": size,
      "font-family": "Newsreader, Georgia, serif",
      "font-style": "italic",
      fill: INK,
      stroke: "none",
    },
    esc(text),
  );
}

/** A figure set in the display face (Cormorant light), for numbers that are part of the drawing. */
export function figure(x: number, y: number, text: string, size: number): string {
  return el(
    "text",
    {
      class: "fg",
      x,
      y,
      "font-size": size,
      "font-family": "Cormorant Garamond, Georgia, serif",
      "font-weight": 300,
      fill: INK,
      stroke: "none",
    },
    esc(text),
  );
}

/* Shapes as paths, so every drawn line can carry pathLength (and starts where SVG's own shapes do). */

export const rectD = (x: number, y: number, w: number, h: number) =>
  `M${num(x)} ${num(y)}h${num(w)}v${num(h)}h${num(-w)}Z`;

export const roundRectD = (x: number, y: number, w: number, h: number, r: number) =>
  `M${num(x + r)} ${num(y)}h${num(w - 2 * r)}a${num(r)} ${num(r)} 0 0 1 ${num(r)} ${num(r)}v${num(h - 2 * r)}` +
  `a${num(r)} ${num(r)} 0 0 1 ${num(-r)} ${num(r)}h${num(2 * r - w)}a${num(r)} ${num(r)} 0 0 1 ${num(-r)} ${num(-r)}` +
  `v${num(2 * r - h)}a${num(r)} ${num(r)} 0 0 1 ${num(r)} ${num(-r)}Z`;

export const ellipseD = (cx: number, cy: number, rx: number, ry: number) =>
  `M${num(cx + rx)} ${num(cy)}a${num(rx)} ${num(ry)} 0 1 1 ${num(-2 * rx)} 0a${num(rx)} ${num(ry)} 0 1 1 ${num(2 * rx)} 0`;

export const circleD = (cx: number, cy: number, r: number) => ellipseD(cx, cy, r, r);

/** n spokes around (cx, cy) from radius r1 to r2, starting at `start` radians, as one path. */
export function spokesD(cx: number, cy: number, n: number, r1: number, r2: (i: number) => number, start = 0): string {
  let d = "";
  for (let i = 0; i < n; i += 1) {
    const a = start + (i * 2 * Math.PI) / n;
    const c = Math.cos(a);
    const s = Math.sin(a);
    d += `M${num(cx + c * r1)} ${num(cy + s * r1)}L${num(cx + c * r2(i))} ${num(cy + s * r2(i))}`;
  }
  return d;
}

/** The complete plate file: the © comment, then a 400 × 400 drawing with the book's stroke defaults. */
export function plateSvg(title: string, body: string): string {
  return svgDoc({
    viewBox: "0 0 400 400",
    title,
    body,
    attrs: {
      fill: "none",
      stroke: INK,
      "stroke-width": 1.25,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    },
  });
}
