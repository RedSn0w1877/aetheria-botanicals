// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { el, num } from "@/lib/svg-string";
import { BRASS, CLAY, GOUACHE, PAPER, SAGE, circleD, draw, drawGroup, ellipseD, fade, label, part, path, plateSvg, spokesD, stroke } from "./kit";

/*
 * Plate IV·i, the dawn harvest: the sun climbs its arc over the ridge while the harvest window runs
 * from 05:10 to 07:00 (the moving time is an HTML overlay in chapters/ritual.tsx), the stems on the
 * slope draw in, one in five is cut, and the willow basket fills.
 */

/** Wild stems on the slope: [base x, base y, height, cut?]. One in five is taken. */
const FIELD_STEMS: ReadonlyArray<readonly [number, number, number, boolean]> = [
  [222, 271, 34, false],
  [238, 273, 40, false],
  [254, 274, 30, false],
  [270, 275, 38, false],
  [286, 275, 12, true],
  [302, 274, 36, false],
  [318, 272, 31, false],
  [334, 270, 42, false],
  [350, 266, 33, false],
  [366, 262, 12, true],
];

/** Stems already cut and resting in the basket, with the bud at each tip. */
const BASKET_STEMS: ReadonlyArray<{ d: string; bud: readonly [number, number] }> = [
  { d: "M86 320C82 298 76 284 64 272", bud: [64, 272] },
  { d: "M100 320C98 292 96 274 92 256", bud: [92, 256] },
  { d: "M118 320C122 296 128 280 140 266", bud: [140, 266] },
  { d: "M134 320C142 302 154 292 168 286", bud: [168, 286] },
];

const ARC_R = 150;
const ARC_CX = 220;
const ARC_CY = 280;
/** The sun rises 62° along its arc, from the horizon (180°) to 118°. */
const RISE = ((180 - 62) * Math.PI) / 180;
const SUN_X = ARC_CX + ARC_R * Math.cos(RISE);
const SUN_Y = ARC_CY - ARC_R * Math.sin(RISE);

const FAR_RIDGE = "M0 232C70 214 130 222 200 206S320 200 400 218";
const NEAR_HILL = "M0 262C60 238 120 246 180 262S300 286 400 250";
const BASKET = "M48 320C52 352 66 374 110 374C154 374 168 352 172 320";

export function dawnSvg(): string {
  const standing = FIELD_STEMS.filter(([, , , cut]) => !cut);
  const cut = FIELD_STEMS.filter(([, , , isCut]) => isCut);

  const body = [
    // The harvest window, 05:10 to 07:00: a brass line runs across as the morning passes.
    label(24, 30, "05:10", { opacity: 0.6 }),
    label(376, 30, "07:00", { anchor: "end", opacity: 0.6 }),
    path("M24 42H376", { "stroke-opacity": 0.2, "stroke-width": 1 }),
    draw([0, 1], "M24 42H376", { stroke: BRASS }),
    // The time marker, at 07:00; live CSS slides it from 05:10 (the HTML clock rides along).
    part("mk", [0, 1], { stroke: BRASS }, path("M376 37V47")),

    // The sun's dotted path across the sky.
    fade(
      [0, 0.35],
      null,
      path(`M${ARC_CX - ARC_R} ${ARC_CY}A${ARC_R} ${ARC_R} 0 0 1 ${ARC_CX + ARC_R} ${ARC_CY}`, {
        stroke: BRASS,
        "stroke-width": 1,
        "stroke-dasharray": "1 7",
      }),
    ),
    // The sun at 118°; live CSS turns it back down to the horizon, then up again about the arc's centre.
    part(
      "sun",
      [0.12, 0.85],
      null,
      el(
        "g",
        { transform: `translate(${num(SUN_X)} ${num(SUN_Y)})`, stroke: CLAY },
        fade([0.6, 0.92], { "stroke-width": 1 }, path(spokesD(0, 0, 12, 33, (i) => (i % 2 ? 39 : 44)))),
        // White gouache for the light itself, washed over with a breath of sanguine.
        path(circleD(0, 0, 26), { fill: GOUACHE, "fill-opacity": 0.85, stroke: "none" }),
        path(circleD(0, 0, 26), { fill: CLAY, "fill-opacity": 0.1 }),
        path(circleD(0, 0, 18), { "stroke-opacity": 0.45, "stroke-width": 0.75 }),
      ),
    ),

    // Far ridge and near hill. Their paper fills hide the sun while it is below the horizon.
    path(`${FAR_RIDGE}V400H0Z`, { fill: PAPER, stroke: "none" }),
    // First light catching the far ridge: a gouache edge just above the ink.
    draw([0.05, 0.4], FAR_RIDGE, { stroke: GOUACHE, "stroke-width": 2.2, "stroke-opacity": 0.9, transform: "translate(0 -1.6)" }),
    draw([0.05, 0.4], FAR_RIDGE, { stroke: SAGE, "stroke-width": 1 }),
    path(`${NEAR_HILL}V400H0Z`, { fill: PAPER, stroke: "none" }),
    draw([0.05, 0.4], NEAR_HILL),

    // Wild stems on the slope. Eight keep their leaf and bud; two of the ten are cut.
    drawGroup([0.3, 0.7], { "stroke-width": 1 }, ...FIELD_STEMS.map(([x, y, h]) => stroke(`M${x} ${y}V${y - h}`))),
    fade(
      [0.3, 0.7],
      null,
      path(standing.map(([x, y, h]) => `M${x} ${num(y - h * 0.45)}q7 -3 9 -10q-7 1 -9 10`).join(""), {
        fill: SAGE,
        "fill-opacity": 0.25,
        stroke: SAGE,
        "stroke-width": 0.8,
      }),
      path(standing.map(([x, y, h]) => circleD(x, y - h - 2.5, 2.5)).join(""), {
        fill: CLAY,
        "fill-opacity": 0.85,
        stroke: "none",
      }),
    ),
    fade(
      [0.6, 0.98],
      null,
      path(cut.map(([x, y, h]) => `M${x - 4} ${y - h + 2}L${x + 4} ${y - h - 2}`).join(""), {
        stroke: BRASS,
        "stroke-width": 1.5,
      }),
      path("M326 306L366 272M306 306L288 282", { "stroke-opacity": 0.35, "stroke-width": 0.75 }),
      label(316, 322, "one in five", { anchor: "middle", opacity: 0.75 }),
    ),

    // The cut stems, resting in the basket.
    drawGroup([0.6, 0.98], { "stroke-width": 1 }, ...BASKET_STEMS.map((s) => stroke(s.d))),
    fade(
      [0.6, 0.98],
      null,
      path(BASKET_STEMS.map((s) => circleD(s.bud[0], s.bud[1], 3.2)).join(""), { fill: CLAY, stroke: "none" }),
    ),

    // The woven willow basket.
    el("defs", null, el("clipPath", { id: "rt-dawn-basket" }, path(`${BASKET}Z`))),
    fade(
      [0.4, 0.75],
      null,
      path(`${BASKET}Z`, { fill: PAPER, stroke: "none" }),
      el(
        "g",
        { "clip-path": "url(#rt-dawn-basket)", stroke: BRASS, "stroke-width": 0.9 },
        path([332, 344, 356, 368].map((y) => `M40 ${y}Q110 ${y + 8} 180 ${y}`).join("")),
        path(
          [58, 72, 86, 100, 114, 128, 142, 156]
            .map((x) => `M${num(x + (x - 110) * 0.1)} 318Q${x} 350 ${num(110 + (x - 110) * 0.7)} 378`)
            .join(""),
          { "stroke-opacity": 0.7 },
        ),
      ),
    ),
    drawGroup([0.4, 0.75], null, stroke(BASKET), stroke(ellipseD(110, 320, 62, 9))),
    draw([0.4, 0.75], "M56 318C58 270 162 270 164 318", { stroke: BRASS }),
    fade([0.4, 0.75], null, label(188, 360, "woven willow", { opacity: 0.6 })),
  ].join("");

  return plateSvg("Plate IV·i: the dawn harvest, drawn for Aetheria", body);
}
