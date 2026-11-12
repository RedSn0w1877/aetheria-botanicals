// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { el, num } from "@/lib/svg-string";
import {
  BRASS,
  CLAY,
  GOUACHE,
  INK,
  MOSS,
  PAPER,
  SAGE,
  circleD,
  draw,
  drawGroup,
  fade,
  figure,
  label,
  part,
  path,
  plateSvg,
  rectD,
  spokesD,
  stroke,
} from "./kit";

/*
 * Plate IV·ii, the frost press: the upper plate screws down over the frozen harvest, the leaves
 * flatten, a small clock runs out its forty minutes and frost crystals form one after another.
 */

/** Frost crystals: [cx, cy, radius]. */
const CRYSTALS: ReadonlyArray<readonly [number, number, number]> = [
  [62, 150, 13],
  [44, 206, 8],
  [70, 252, 16],
  [338, 144, 15],
  [360, 196, 9],
  [334, 246, 12],
  [362, 290, 7],
];

/** The harvest resting on the lower plate, drawn at full height (y 130 to 250). */
const LEAVES = [
  "M140 250C150 214 172 196 196 190C186 218 168 240 140 250Z",
  "M168 250C176 200 204 170 236 162C226 202 204 236 168 250Z",
  "M214 250C214 214 234 186 262 178C262 214 246 240 214 250Z",
  "M150 222C150 186 162 156 186 136C196 170 180 204 150 222Z",
  "M232 232C222 196 226 160 246 134C262 166 254 204 232 232Z",
];

/** The clock's centre. */
const CX = 346;
const CY = 50;

/** A segment from (x1, y1) to (x2, y2). */
type Seg2 = readonly [number, number, number, number];

/**
 * Separate strokes as one path in relative commands at 1 decimal (a tenth of a unit is ~0.1 px on
 * screen). The plate ships under the 10 KB cap this way; absolute M/L pairs at 2 decimals were 16 KB.
 * Positions are rounded before differencing, so the error never accumulates along the path.
 */
function segmentsD(segments: ReadonlyArray<Seg2>): string {
  const r = (v: number) => Math.round(v * 10) / 10;
  const n = (v: number) => num(v, 1).replace(/^(-?)0\./, "$1.");
  const pair = (a: number, b: number) => `${n(a)}${b < 0 ? "" : " "}${n(b)}`;
  let d = "";
  let px = 0;
  let py = 0;
  segments.forEach(([x1, y1, x2, y2], i) => {
    const [ax, ay, bx, by] = [r(x1), r(y1), r(x2), r(y2)];
    if (i === 0) d += `M${pair(ax, ay)}`;
    else if (ax !== px || ay !== py) d += `m${pair(ax - px, ay - py)}`;
    d += `l${pair(bx - ax, by - ay)}`;
    px = bx;
    py = by;
  });
  return d;
}

/**
 * A frost star: six hairline arms, each with a pair of short side branches part-way out (and a
 * second pair on the larger stars), the way frost is drawn in the old natural histories.
 */
function frostStarD(cx: number, cy: number, r: number): string {
  const segments: Seg2[] = [];
  for (let i = 0; i < 6; i += 1) {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    segments.push([cx, cy, cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    const branches = r > 11 ? [0.45, 0.72] : [0.55];
    for (const t of branches) {
      const bx = cx + Math.cos(a) * r * t;
      const by = cy + Math.sin(a) * r * t;
      const len = r * (0.42 - t * 0.25);
      for (const side of [-1, 1]) {
        const b = a + side * (Math.PI / 4);
        segments.push([bx, by, bx + Math.cos(b) * len, by + Math.sin(b) * len]);
      }
    }
  }
  return segmentsD(segments);
}

/** The shade edge of a steel plate: short diagonal strokes along its lower face, in the plates' own hand. */
function steelShadeD(x: number, y: number, w: number, h: number): string {
  const segments: Seg2[] = [];
  for (let sx = x + 3; sx < x + w - 2; sx += 3.2) segments.push([sx, y + h - 1, sx + 2.4, y + h - 1 - h * 0.45]);
  return segmentsD(segments);
}

export function pressSvg(): string {
  const body = [
    // Shared geometry, drawn below through <use>: the steel plates' shade edge (both plates are the
    // same size, so one path at y 0 serves both) and the frost stars.
    el(
      "defs",
      null,
      path(steelShadeD(122, 0, 156, 14), { id: "ps" }),
      ...CRYSTALS.map(([cx, cy, r], i) => stroke(frostStarD(cx, cy, r), { id: `pr${i}` })),
    ),
    // Liquid nitrogen.
    fade(
      [0.45, 0.8],
      null,
      figure(24, 50, "−196°", 30),
      label(26, 70, "liquid", { opacity: 0.6, size: 12 }),
      label(26, 84, "nitrogen", { opacity: 0.6, size: 12 }),
    ),

    // The forty-minute clock. Its hand ends at 240°; live CSS winds it round from 0.
    draw([0, 0.3], circleD(CX, CY, 17), { "stroke-width": 1 }),
    path(spokesD(CX, CY, 12, 13, () => 15.5, -Math.PI / 2), { "stroke-opacity": 0.5, "stroke-width": 0.75 }),
    draw([0, 0.55], `M${CX} ${CY - 22}A22 22 0 1 1 ${num(CX - 19.05)} ${CY + 11}`, { stroke: BRASS, "stroke-width": 1.5 }),
    part("hn", [0, 0.55], { transform: `rotate(240 ${CX} ${CY})` }, path(`M${CX} ${CY + 2}V${CY - 11}`, { stroke: CLAY })),
    path(circleD(CX, CY, 1.6), { fill: INK, stroke: "none" }),
    label(CX, CY + 40, "40 min", { anchor: "middle", opacity: 0.6 }),

    // The frame: posts, beam, base and the screw.
    drawGroup(
      [0, 0.3],
      null,
      stroke("M110 300V80M290 300V80"),
      stroke(rectD(100, 64, 200, 16)),
      stroke(rectD(84, 300, 232, 14)),
      stroke("M96 314V330M304 314V330"),
      stroke("M200 40V64"),
    ),
    // The handle turns twice as the plates close (live CSS flips its width through cos()).
    fade(
      [0, 0.3],
      null,
      part(
        "hd",
        [0.15, 0.62],
        { stroke: BRASS },
        path("M150 40H250", { "stroke-width": 2 }),
        path(circleD(150, 40, 4) + circleD(250, 40, 4), { fill: PAPER }),
      ),
    ),
    // The rod, screwed all the way down.
    part("rod", [0.15, 0.62], null, path("M200 80V192", { "stroke-width": 2.5 })),

    // The harvest on the lower plate, pressed to 37% of its height; live CSS lets it spring back first.
    part(
      "lv",
      [0.15, 0.62],
      { transform: "matrix(1 0 0 .37 0 157.5)" },
      drawGroup([0, 0.3], { fill: SAGE, "fill-opacity": 0.16, stroke: SAGE, "stroke-width": 1 }, ...LEAVES.map((d) => stroke(d))),
      fade([0.45, 0.8], null, path(LEAVES.join(""), { fill: MOSS, "fill-opacity": 0.08, stroke: "none" })),
    ),
    // The lower plate and its legs.
    path(rectD(122, 250, 156, 14), { fill: PAPER, stroke: "none" }),
    draw([0, 0.3], rectD(122, 250, 156, 14)),
    fade([0, 0.3], { stroke: INK, "stroke-opacity": 0.45, "stroke-width": 0.6 }, el("use", { href: "#ps", y: 250 })),
    draw([0, 0.3], "M140 264V300M260 264V300", { "stroke-width": 1 }),

    // The upper plate, pressed down onto the leaves; live CSS lifts it 92 units and lowers it again.
    part(
      "up",
      [0.15, 0.62],
      null,
      path(rectD(122, 192, 156, 14), { fill: PAPER, stroke: "none" }),
      draw([0, 0.3], rectD(122, 192, 156, 14)),
      el("use", { href: "#ps", y: 192, stroke: INK, "stroke-opacity": 0.45, "stroke-width": 0.6 }),
      path("M130 199H270", { stroke: BRASS, "stroke-opacity": 0.6, "stroke-width": 0.75 }),
      // Chilled steel: a gouache light along the plate's top edge.
      path("M126 194.5H274", { stroke: GOUACHE, "stroke-width": 1.6 }),
    ),

    // Nitrogen vapour coming off the plates. It hangs still: no idle loops.
    fade(
      [0.45, 0.8],
      { stroke: MOSS, "stroke-opacity": 0.3, "stroke-width": 0.9 },
      path(
        [0, 1, 2].map((i) => `M292 ${218 + i * 14}q6 -4 12 0t12 0t12 0`).join("") +
          [0, 1, 2].map((i) => `M108 ${218 + i * 14}q-6 -4 -12 0t-12 0t-12 0`).join(""),
      ),
    ),

    // Frost stars, forming one after another: a faint sepia under-drawing, heightened in gouache.
    // Each star is drawn twice from its <defs> geometry (the under-drawing offset by 0.6). The group's
    // live dash timing inherits into both <use>s; pathLength travels with the path.
    ...CRYSTALS.map(([, , r], i) => {
      const start = 0.42 + i * 0.06;
      return drawGroup(
        [start, Math.min(start + 0.2, 1)],
        null,
        el("use", { href: `#pr${i}`, x: 0.6, y: 0.6, stroke: MOSS, "stroke-opacity": 0.35, "stroke-width": 0.6 }),
        el("use", { href: `#pr${i}`, stroke: GOUACHE, "stroke-width": r > 11 ? 1.1 : 0.9 }),
      );
    }),

    fade([0.45, 0.8], null, label(200, 356, "pressed by hand, in the cold", { anchor: "middle", opacity: 0.65 })),
  ].join("");

  return plateSvg("Plate IV·ii: the frost press, drawn for Aetheria", body);
}
