// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { PALETTE } from "@/lib/palette";
import { el, num, svgDoc } from "@/lib/svg-string";
import type { TerroirLot } from "@/lib/terroir-lots";
import { contourRings } from "./seeded";

/*
 * The contour study around each harvest point, as a standalone file for the altitude instrument
 * (app/plates/terroir/[file]/route.ts): contour-01.svg, contour-02.svg, contour-03.svg. Same rings as
 * the old inline map, from seeded.ts unchanged. Drawn for the night page the way a study on dark
 * paper is: kraft lines (the stock's own colour, 8:1 on the sepia ground), the summit and north arrow
 * in white gouache (sanguine is too dark to read on the night ground), and a scale bar, with no text: the caption ("summit at 1,420 m · the bar is about
 * 500 m") is HTML beside the <img>.
 */

export const CONTOUR_W = 220;
export const CONTOUR_H = 150;

const LINEN = PALETTE.linen;
const GOUACHE = PALETTE.gouache;

const NUMBER = /-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi;
const tenth = (v: number) => Math.round(v * 10) / 10;
const short = (v: number) => num(v, 1).replace(/^(-?)0\./, "$1.");

/**
 * contourRings draws each ring as Catmull-Rom curves converted to cubic Béziers (closedSmoothPath),
 * and in that form every segment's first control point mirrors the previous segment's second one.
 * So each C after the first can be written as an S (four numbers, not six), in relative coordinates
 * at a tenth of a unit. Deltas are taken between rounded points, so the error never accumulates.
 */
function smoothRing(d: string): string {
  const v = (d.match(NUMBER) ?? []).map(Number);
  if (v.length < 8) return d;
  let x = tenth(v[0]);
  let y = tenth(v[1]);
  let out = `M${short(x)} ${short(y)}`;
  const rel = (to: number, from: number) => short(tenth(to) - from);
  for (let i = 2, first = true; i + 5 < v.length; i += 6, first = false) {
    const [c1x, c1y, c2x, c2y, ex, ey] = v.slice(i, i + 6);
    const tail = `${rel(c2x, x)} ${rel(c2y, y)} ${rel(ex, x)} ${rel(ey, y)}`;
    out += first ? `c${rel(c1x, x)} ${rel(c1y, y)} ${tail}` : `s${tail}`;
    x = tenth(ex);
    y = tenth(ey);
  }
  return `${out}z`.replace(/ -/g, "-");
}

export function contourSvg(lot: TerroirLot): string {
  const { rings, summit } = contourRings(lot.code, lot.altitudeM, CONTOUR_W, CONTOUR_H);
  const [sx, sy] = summit;
  const ringPaths = (index: boolean) =>
    rings
      .filter((ring) => ring.index === index)
      .map((ring) => smoothRing(ring.d))
      .join("");

  const body = [
    el("defs", null, el("clipPath", { id: "frame" }, el("path", { d: `M.5 .5H${CONTOUR_W - 0.5}V${CONTOUR_H - 0.5}H.5Z` }))),
    el("path", { d: `M.5 .5H${CONTOUR_W - 0.5}V${CONTOUR_H - 0.5}H.5Z`, "stroke-opacity": 0.22 }),
    el(
      "g",
      { "clip-path": "url(#frame)" },
      el("path", { d: ringPaths(false), "stroke-opacity": 0.36, "stroke-width": 0.5 }),
      el("path", { d: ringPaths(true), "stroke-opacity": 0.8, "stroke-width": 0.9 }),
    ),
    // The summit.
    el("path", { d: `M${num(sx, 1)} ${num(sy - 4.5, 1)}l4 7h-8Z`, fill: GOUACHE, stroke: "none" }),
    // North arrow and a scale bar of about 500 m.
    el(
      "g",
      { opacity: 0.6 },
      el("path", { d: "M204 22L208 10L212 22L208 19Z", fill: GOUACHE, stroke: "none" }),
      el("path", { d: "M10 140H50M10 137V140M50 137V140", "stroke-width": 0.8 }),
    ),
  ].join("");

  return svgDoc({
    viewBox: `0 0 ${CONTOUR_W} ${CONTOUR_H}`,
    title: `Contour study around the harvest point of lot ${lot.number}, drawn for Aetheria`,
    body,
    attrs: { fill: "none", stroke: LINEN, "stroke-linecap": "round", "stroke-linejoin": "round" },
  });
}
