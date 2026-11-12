// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { el, num } from "@/lib/svg-string";
import { BRASS, CLAY, GOUACHE, PAPER, SAGE, circleD, draw, drawGroup, fade, label, part, path, plateSvg, rectD, roundRectD, stroke } from "./kit";

/*
 * Plate IV·iii, the long steep: the vessel fills and its leaves settle, the thermometer sinks to
 * −18 °C and the weeks are ticked off, 26 turns in all. The temperature and the day count are HTML
 * overlays in chapters/ritual.tsx, so the numbers stay crisp and readable.
 */

const VESSEL = "M84 124H216V318Q216 338 196 338H104Q84 338 84 318Z";
const LIQUID_TOP = 150;
const LIQUID_BOTTOM = 338;

/** Botanicals suspended in the cold alcohol: [x, y, rotation, scale]. */
const SUSPENDED: ReadonlyArray<readonly [number, number, number, number]> = [
  [118, 300, -24, 1],
  [168, 272, 32, 0.85],
  [140, 226, 12, 1.1],
  [192, 196, -40, 0.8],
  [112, 176, 58, 0.75],
];

/** Weekly turns, ticked off along the top as the six months pass. */
const TURNS = 26;

/**
 * The thermometer: 0 °C sits at y = 130, and every degree is 4 units lower. The column ends at the
 * cellar's −18 °C; it starts at +11 °C, which is why ritual.module.css stretches it by up to
 * (306 − tempToY(11)) / (306 − tempToY(−18)) = 220 / 104.
 */
const tempToY = (celsius: number) => 130 - celsius * 4;
const CELLAR_TEMP = -18;
const COLUMN_BOTTOM = 306;

export function steepSvg(): string {
  // Tick i lights up as the weeks reach it: the old diagram's [at − .02, at] of the day count (which
  // itself ran over .1–1 of the plate), mapped onto the plate's own progress.
  const ticks = Array.from({ length: TURNS }, (_, i) => {
    const at = 0.1 + (i / TURNS) * 0.9;
    const x = num(32 + i * 8.2);
    return part("tk", [0.1 + 0.9 * (at - 0.02), 0.1 + 0.9 * at], null, path(`M${x} 70V${i % 4 === 0 ? 80 : 77}`));
  });
  const scale = [10, 0, -10, -20, -30];
  const columnTop = tempToY(CELLAR_TEMP);

  const body = [
    el(
      "defs",
      null,
      el("clipPath", { id: "rt-steep-vessel" }, path(VESSEL)),
      el(
        "g",
        { id: "rt-steep-leaf" },
        path("M-14 0C-6 -9 6 -9 14 0C6 9 -6 9 -14 0Z", { fill: SAGE, "fill-opacity": 0.22, stroke: SAGE, "stroke-width": 0.9 }),
        path("M-14 0H14", { stroke: SAGE, "stroke-width": 0.6 }),
      ),
    ),

    // The weekly turns.
    label(32, 56, "26 turns, one each week", { opacity: 0.6 }),
    el("g", { stroke: BRASS }, ...ticks),

    // Liquid and suspended botanicals, inside the vessel.
    el(
      "g",
      { "clip-path": "url(#rt-steep-vessel)" },
      part(
        "sl",
        [0.08, 0.6],
        null,
        path(rectD(80, LIQUID_TOP, 140, LIQUID_BOTTOM - LIQUID_TOP), { fill: CLAY, "fill-opacity": 0.1, stroke: "none" }),
      ),
      fade(
        [0.08, 0.1],
        null,
        part("ss", [0.08, 0.6], { stroke: CLAY, "stroke-width": 1 }, path(`M44 ${LIQUID_TOP}q11 -3 22 0${"t22 0".repeat(8)}`)),
      ),
      fade(
        [0.25, 0.6],
        null,
        ...SUSPENDED.map(([x, y, rot, s]) =>
          el("use", { href: "#rt-steep-leaf", transform: `translate(${x} ${y}) rotate(${rot}) scale(${s})` }),
        ),
      ),
    ),

    // The vessel, its glint and its brass lid.
    draw([0, 0.3], VESSEL),
    // The glass's highlight, in white gouache.
    draw([0, 0.3], "M98 140V300", { stroke: GOUACHE, "stroke-opacity": 0.9, "stroke-width": 3 }),
    draw([0, 0.3], "M104 150V196", { stroke: GOUACHE, "stroke-opacity": 0.7, "stroke-width": 1.2 }),
    drawGroup([0, 0.3], { stroke: BRASS }, stroke(rectD(76, 104, 148, 20)), stroke("M140 104V94H160V104")),

    // Turned by hand, once a week.
    fade(
      [0, 0.3],
      null,
      path("M78 352Q150 372 222 352M214 346L222 352L213 357", { "stroke-opacity": 0.45, "stroke-width": 1 }),
      label(150, 386, "turned by hand", { anchor: "middle", opacity: 0.6 }),
    ),

    // The thermometer. The column ends at −18 °C; live CSS stretches it from +11 °C first.
    draw([0, 0.3], roundRectD(278, 78, 16, 226, 8)),
    path(circleD(286, 312, 14), { fill: PAPER, stroke: "none" }),
    draw([0, 0.3], circleD(286, 312, 14)),
    path(circleD(286, 312, 9), { fill: CLAY, "fill-opacity": 0.85, stroke: "none" }),
    part(
      "hg",
      [0.1, 0.55],
      null,
      path(roundRectD(283, columnTop, 6, COLUMN_BOTTOM - columnTop, 3), { fill: CLAY, "fill-opacity": 0.85, stroke: "none" }),
    ),
    path(scale.map((c) => `M298 ${tempToY(c)}H${c % 20 === 0 ? 308 : 304}`).join(""), {
      "stroke-opacity": 0.55,
      "stroke-width": 0.9,
    }),
    ...scale.map((c) => label(312, tempToY(c) + 3.5, c > 0 ? `+${c}` : c < 0 ? `−${-c}` : "0", { opacity: 0.55, size: 10 })),
    fade([0.5, 0.7], null, path(`M266 ${columnTop}H274`, { stroke: BRASS, "stroke-width": 1.5 })),

    // The day count: its label and rule (the number itself is an HTML overlay).
    label(344, 326, "day", { anchor: "middle", opacity: 0.6 }),
    path("M318 372H370", { stroke: BRASS, "stroke-opacity": 0.7, "stroke-width": 0.9 }),
  ].join("");

  return plateSvg("Plate IV·iii: the long steep, drawn for Aetheria", body);
}
