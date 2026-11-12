// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { PALETTE } from "@/lib/palette";
import { el, num, svgDoc } from "@/lib/svg-string";
import type { TerroirLot } from "@/lib/terroir-lots";
import { botanicalFor, PLATE_H, PLATE_W, type InkStroke } from "./botanicals";

/*
 * The pressed-specimen plates for chapter III as standalone files (app/plates/terroir/[file]/route.ts):
 * herbarium-pine.svg, herbarium-vetiver.svg and herbarium-rose.svg. Same strokes as the old inline
 * drawings, from botanicals.ts unchanged: the cone's clip path, the occluders that let petals and
 * blades overlap, the sanguine accents. Loaded through <img>, so the colours are hex (lib/palette.ts)
 * and there is no text in the file; the caption lives in HTML.
 *
 * Trois crayons on toned paper: sepia-black line, sanguine accents and white gouache heightening.
 * The occluders (petals, leaves, the cone) are filled half parchment, half gouache, so they sit a
 * shade lighter than the sheet, and the heavy stems carry a gouache edge on their lit (upper-left)
 * side. Gouache only ever lights the drawing; it never carries a line of its own.
 */

const INK = PALETTE.rosemary;
const CLAY = PALETTE.terracotta;
/** Parchment heightened with gouache, 1:1. */
const LIT = mix(PALETTE.parchment, PALETTE.gouache, 0.5);
const GOUACHE = PALETTE.gouache;
/** Strokes at least this heavy get a gouache edge. */
const HEIGHTEN_FROM = 1.15;

function mix(a: string, b: string, t: number): string {
  const ch = (hex: string, i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
  return `#${[0, 1, 2].map((i) => Math.round(ch(a, i) * (1 - t) + ch(b, i) * t).toString(16).padStart(2, "0")).join("")}`;
}

const NUMBER = /-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi;

/**
 * Re-prints path data at one decimal (the plate is shown at most about twice its 260-unit width, so a
 * tenth of a unit is well under a pixel), drops leading zeros and the spaces before minus signs.
 */
export function compactPath(d: string): string {
  return d
    .replace(NUMBER, (m) => num(Number(m), 1))
    .replace(/(^|[^\d.])(-?)0\.(\d)/g, "$1$2.$3")
    .replace(/ -/g, "-");
}

const width = (w: number) => num(w, 2).replace(/^0\./, ".");

/**
 * Strokes in paint order. A parchment occluder hides what was drawn before it, so it stays its own
 * element, in place. Between two occluders, plain strokes of the same colour and weight can't
 * cover one another, so each style becomes one merged path, emitted in order of first appearance.
 */
function strokesToSvg(strokes: readonly InkStroke[]): string {
  let out = "";
  let run = new Map<string, string[]>();
  const flush = () => {
    for (const [key, ds] of run) {
      const [w, accent] = key.split("|");
      if (accent !== "a" && Number(w) >= HEIGHTEN_FROM) {
        out += el("path", {
          d: ds.join(""),
          "stroke-width": num(Number(w) * 0.9, 2),
          stroke: GOUACHE,
          "stroke-opacity": 0.85,
          transform: "translate(-.9 -.7)",
        });
      }
      out += el("path", { d: ds.join(""), "stroke-width": w, stroke: accent === "a" ? CLAY : null });
    }
    run = new Map();
  };
  for (const s of strokes) {
    const d = compactPath(s.d);
    if (s.occlude) {
      flush();
      out += el("path", { d, fill: s.accent ? PALETTE.parchment : LIT, "stroke-width": width(s.width), stroke: s.accent ? CLAY : null });
      continue;
    }
    const key = `${width(s.width)}|${s.accent ? "a" : ""}`;
    const list = run.get(key);
    if (list) list.push(d);
    else run.set(key, [d]);
  }
  flush();
  return out;
}

export function herbariumSvg(lot: TerroirLot): string {
  const art = botanicalFor(lot.plate);
  const loose = art.strokes.filter((s) => !s.frame);
  let body = strokesToSvg(loose);

  if (art.cone) {
    const outline = art.strokes.filter((s) => s.frame === "cone");
    const detail = art.strokes.filter((s) => s.frame === "cone-clip");
    body =
      el("defs", null, el("clipPath", { id: "cone" }, el("path", { d: compactPath(art.cone.d) }))) +
      body +
      el(
        "g",
        { transform: art.cone.transform },
        strokesToSvg(outline),
        el("g", { "clip-path": "url(#cone)" }, strokesToSvg(detail)),
      );
  }

  return svgDoc({
    viewBox: `0 0 ${PLATE_W} ${PLATE_H}`,
    title: `Pressed specimen of ${lot.commonName} (${lot.latinName}), drawn for Aetheria`,
    body,
    attrs: { fill: "none", stroke: INK, "stroke-linecap": "round", "stroke-linejoin": "round" },
  });
}
