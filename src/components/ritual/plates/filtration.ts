// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { el, num } from "@/lib/svg-string";
import {
  BRASS,
  CLAY,
  GOUACHE,
  MOSS,
  PAPER,
  circleD,
  draw,
  drawGroup,
  ellipseD,
  fade,
  label,
  part,
  path,
  plateSvg,
  rectD,
  spokesD,
  stroke,
} from "./kit";

/*
 * Plate IV·iv, gravity filtration: a funnel lined with folded paper lets single drops fall into a
 * glass flacon (drawn in moss), which fills while the light is held back at the glass. The volume
 * poured is an HTML overlay in chapters/ritual.tsx.
 */

const FLACON =
  "M190 262V280Q190 290 172 294Q146 300 146 322V358Q146 372 160 372H240Q254 372 254 358V322Q254 300 228 294Q210 290 210 280V262Z";
const FILL_TOP = 292;
const FILL_BOTTOM = 372;

/** Fluted filter paper: a zigzag rim whose every vertex folds down to the tip. */
const FOLDS: ReadonlyArray<readonly [number, number]> = Array.from({ length: 11 }, (_, i) => [152 + i * 9.6, i % 2 ? 91 : 98] as const);
const PAPER_RIM = `M${FOLDS.map(([x, y]) => `${num(x, 1)} ${y}`).join("L")}`;
const PAPER_FOLDS = FOLDS.map(([x, y]) => `M${num(x, 1)} ${y}L200 158`).join("");

/** The one drop, held at the funnel's tip. */
const DROP = "M200 206C203 211 204 213 204 215A4 4 0 0 1 196 215C196 213 197 211 200 206Z";

export function filtrationSvg(): string {
  const body = [
    el("defs", null, el("clipPath", { id: "rt-filter-flacon" }, path(FLACON))),

    // Light, held back at the glass.
    fade(
      [0.6, 0.9],
      { stroke: CLAY, "stroke-width": 1 },
      path(circleD(52, 58, 10) + spokesD(52, 58, 8, 14, () => 18)),
      path("M62 76L140 318M70 72L141 338M56 80L136 348", { "stroke-opacity": 0.55, "stroke-width": 0.9, "stroke-dasharray": "3 6" }),
      path("M134 316L146 320M135 336L147 340M130 346L142 350", { "stroke-width": 1.5 }),
      label(24, 112, "light,", { opacity: 0.65 }),
      label(24, 127, "held back", { opacity: 0.65 }),
    ),

    // The ring stand.
    drawGroup(
      [0, 0.3],
      null,
      stroke("M330 372V64M330 120H240"),
      stroke("M280 372H372", { "stroke-width": 3 }),
      stroke(circleD(330, 120, 4), { stroke: BRASS }),
      stroke(ellipseD(200, 120, 40, 5), { "stroke-width": 1 }),
    ),

    // The funnel, lined with fluted paper.
    draw([0.05, 0.35], "M140 88L194 166V206H206V166L260 88", { fill: PAPER }),
    fade(
      [0.15, 0.5],
      { stroke: "none" },
      path(`${PAPER_RIM}L200 158Z`, { fill: PAPER }),
      path(`${PAPER_RIM}L200 158Z`, { fill: BRASS, "fill-opacity": 0.08 }),
    ),
    drawGroup(
      [0.15, 0.5],
      { stroke: BRASS },
      stroke(PAPER_RIM, { "stroke-width": 1 }),
      stroke(PAPER_FOLDS, { "stroke-opacity": 0.6, "stroke-width": 0.7 }),
    ),
    draw([0.05, 0.35], ellipseD(200, 88, 60, 6)),

    // One drop at the tip, every four seconds. It hangs still: no idle loops.
    fade(
      [0.35, 0.45],
      null,
      path(DROP, { fill: MOSS, "fill-opacity": 0.5, stroke: "none" }),
      path("M198.4 213.5Q198.4 211.5 199.6 210.2", { stroke: GOUACHE, "stroke-width": 1 }),
    ),
    fade(
      [0.5, 0.8],
      null,
      path("M212 222H232", { "stroke-opacity": 0.35, "stroke-width": 0.75 }),
      label(238, 220, "1 drop every 4 s", { size: 12 }),
      label(238, 234, "gravity only", { opacity: 0.6, size: 12 }),
    ),

    // The flacon, filling.
    fade([0.3, 0.6], null, path(FLACON, { fill: MOSS, "fill-opacity": 0.05, stroke: "none" })),
    el(
      "g",
      { "clip-path": "url(#rt-filter-flacon)" },
      part(
        "fl",
        [0.4, 1],
        null,
        path(rectD(140, FILL_TOP, 120, FILL_BOTTOM - FILL_TOP), { fill: MOSS, "fill-opacity": 0.16, stroke: "none" }),
      ),
      fade([0.35, 0.45], null, part("fs", [0.4, 1], null, path(`M140 ${FILL_TOP}H260`, { stroke: MOSS, "stroke-width": 1 }))),
      // Gouache light on the glass: one long glint and a short one on the shoulder.
      path("M158 314V360", { stroke: GOUACHE, "stroke-opacity": 0.95, "stroke-width": 2.5 }),
      path("M166 300Q174 296 182 295", { stroke: GOUACHE, "stroke-opacity": 0.8, "stroke-width": 1.4 }),
    ),
    draw([0.3, 0.6], FLACON, { stroke: MOSS, "stroke-width": 1.4 }),

    // The brass stopper, waiting beside it.
    fade(
      [0.3, 0.6],
      { stroke: BRASS },
      path("M96 372V360Q96 352 104 352H112Q120 352 120 360V372", { fill: PAPER }),
      path("M100 352Q108 332 116 352"),
    ),

    // The table.
    draw([0, 0.3], "M24 372H280", { "stroke-width": 1 }),
  ].join("");

  return plateSvg("Plate IV·iv: gravity filtration, drawn for Aetheria", body);
}
