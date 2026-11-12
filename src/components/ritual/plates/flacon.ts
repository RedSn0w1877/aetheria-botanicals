// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { PALETTE } from "@/lib/palette";
import { el, num, svgDoc, type Attrs } from "@/lib/svg-string";
import { FLACON_H, FLACON_W, HOSE_Y } from "./flacon-grid";

/*
 * The house flacon (No. 019: fluted crystal, a brass collar, amber liquid) drawn twice, the way the
 * old botanical studies were: once on dark paper, once on the toned stock.
 *
 * - "night" (app/plates/terroir/nocturne.svg): chapter III's single bottle. On the sepia-black
 *   ground the drawing is all heightening: gouache line and glints, the liquid in a warm wash. Its
 *   one light is a separate file, nocturne-light.svg (nocturneLightSvg), stacked behind it so the
 *   chapter can bring the light up once: a disc of ruled lines and a pool on the floor, each feathered
 *   by a radial mask, so there is no hard rim and no glare reaches the sentence either side.
 * - "day" (app/plates/ritual/atomizer.svg): the finished flacon that closes chapter IV, in sepia ink
 *   with gouache on the glass, fitted with a brass atomizer head. Its silk bulb is NOT in the file:
 *   ritual/spray-flacon.tsx draws it inline, because the reader squeezes it.
 *
 * viewBox 300 × 440 (flacon-grid.ts). The bottle stands on the floor line at y = 384; the atomizer's
 * nozzle tip and its hose spigot are at NOZZLE_* and HOSE_* in that grid.
 *
 * The silhouette is the rendered No. 019's (blender/flacon-geometry.ts, as on the frontispiece): a
 * round body on sloped shoulders, widest just below them, flutes on its lower two thirds, a tall
 * brass collar sitting straight on the shoulder, and a faceted crystal ball for a stopper. So the
 * bottle on the title page, the one under the night light and the one the reader sprays are one.
 */

type Variant = "night" | "day";

const BODY =
  "M132 174C128 186 74 196 71 236C68 286 72 334 84 360C94 380 106 384 118 384H182C194 384 206 380 216 360C228 334 232 286 229 236C226 196 172 186 168 174Z";
const FLOOR = 384;
const LIQUID_TOP = 262;

/** Parallel lines across a box at `angle` degrees, `gap` apart; clip them with a clip-path. */
function hatch(x: number, y: number, w: number, h: number, gap: number, angle: number): string {
  const r = (angle * Math.PI) / 180;
  const dx = Math.cos(r);
  const dy = Math.sin(r);
  // Half the box's diagonal: every line long enough to cross it, and only as many as cover it.
  const reach = Math.hypot(w, h) / 2;
  const span = (Math.abs(w * dy) + Math.abs(h * dx)) / 2;
  let d = "";
  for (let t = -span; t <= span; t += gap) {
    // A line through the box centre offset by t along the normal.
    const cx = x + w / 2 - dy * t;
    const cy = y + h / 2 + dx * t;
    d += `M${num(cx - dx * reach, 1)} ${num(cy - dy * reach, 1)}L${num(cx + dx * reach, 1)} ${num(cy + dy * reach, 1)}`;
  }
  return d;
}

/** Eleven flutes on the lower body, following its round: they bow out, then turn in to the foot. */
const FLUTES = Array.from({ length: 11 }, (_, i) => {
  const u = (i - 5) / 5.6;
  const top = 150 + u * 74;
  const mid = 150 + u * 79;
  const foot = 150 + u * 58;
  return `M${num(top, 1)} 262Q${num(mid + u * 6, 1)} 322 ${num(foot, 1)} 374`;
}).join("");

/** The engraved light behind the night bottle: ruled lines across a disc, feathered at the rim. */
function engravedLight(cx: number, cy: number, r: number): string {
  let d = "";
  for (let y = cy - r; y <= cy + r; y += 3.4) {
    const half = Math.sqrt(Math.max(0, r * r - (y - cy) ** 2));
    if (half < 2) continue;
    d += `M${num(cx - half, 1)} ${num(y, 1)}H${num(cx + half, 1)}`;
  }
  return d;
}

export function flaconSvg(variant: Variant): string {
  const night = variant === "night";
  const line = night ? PALETTE.gouache : PALETTE.rosemary;
  const g = PALETTE.gouache;
  const ground = night ? PALETTE.rosemary : PALETTE.linen;
  const liquid = night ? PALETTE.brassLight : PALETTE.brass;
  const brass = night ? PALETTE.brassLight : PALETTE.brass;
  const path = (d: string, attrs?: Attrs) => el("path", { d, ...attrs });

  const defs = el(
    "defs",
    null,
    el("clipPath", { id: "fl-body" }, path(BODY)),
    el("clipPath", { id: "fl-liquid" }, path(`M60 ${LIQUID_TOP}H240V400H60Z`)),
    // The side away from the light: the right third, softened by a curve rather than a straight cut.
    el("clipPath", { id: "fl-shade" }, path("M176 180Q188 290 170 400H240V180Z")),
  );

  const parts: string[] = [defs];

  if (!night) {
    // The cast shadow, hatched to the right along the floor.
    parts.push(
      el(
        "g",
        null,
        el("clipPath", { id: "fl-shadow" }, el("ellipse", { cx: 196, cy: FLOOR + 6, rx: 84, ry: 9 })),
        el("g", { "clip-path": "url(#fl-shadow)" }, path(hatch(110, FLOOR - 6, 180, 24, 3.2, -62), { stroke: line, "stroke-opacity": 0.45, "stroke-width": 0.7 })),
      ),
    );
  }

  // The floor.
  parts.push(path(`M18 ${FLOOR}H282`, { stroke: line, "stroke-opacity": night ? 0.35 : 0.55, "stroke-width": 0.9 }));

  // The glass: ground-filled (so the light stays behind it), then a breath of gouache on the day sheet.
  parts.push(path(BODY, { fill: ground, stroke: "none" }));
  if (!night) parts.push(path(BODY, { fill: g, "fill-opacity": 0.28, stroke: "none" }));

  // Inside the glass: the liquid wash, its hatching, the flutes and the shading.
  parts.push(
    el(
      "g",
      { "clip-path": "url(#fl-body)" },
      el(
        "g",
        { "clip-path": "url(#fl-liquid)" },
        path(BODY, { fill: liquid, "fill-opacity": night ? 0.62 : 0.5, stroke: "none" }),
        path(hatch(70, LIQUID_TOP, 160, 130, 4.2, 90), { stroke: night ? PALETTE.brass : PALETTE.moss, "stroke-opacity": night ? 0.3 : 0.35, "stroke-width": 0.6 }),
        // The light through the amber, gathered low in the liquid: three gouache arcs, a caustic.
        path("M104 356Q128 346 152 356M112 364Q132 357 150 364M120 349Q134 343 146 349", {
          stroke: g,
          "stroke-opacity": night ? 0.8 : 0.7,
          "stroke-width": 1.1,
        }),
      ),
      path(FLUTES, { stroke: line, "stroke-opacity": night ? 0.34 : 0.4, "stroke-width": 0.8 }),
      // Shadow side of the glass, hatched on the right.
      el(
        "g",
        { "clip-path": "url(#fl-shade)" },
        path(hatch(160, 200, 80, 200, 3.4, 62), {
          stroke: night ? PALETTE.rosemary : PALETTE.moss,
          "stroke-opacity": night ? 0.7 : 0.45,
          "stroke-width": 0.7,
        }),
      ),
      // The meniscus.
      path(`M74 ${LIQUID_TOP}Q150 ${LIQUID_TOP + 6} 226 ${LIQUID_TOP}`, { stroke: g, "stroke-opacity": 0.9, "stroke-width": 1.1 }),
      // The thick crystal foot.
      path("M92 370Q150 378 208 370", { stroke: line, "stroke-opacity": 0.5, "stroke-width": 0.9 }),
    ),
  );

  // The outline, then the gouache glints that make it glass.
  parts.push(path(BODY, { stroke: line, "stroke-width": night ? 1.2 : 1.3 }));
  parts.push(
    path("M84 250Q80 300 85 346", { stroke: g, "stroke-width": 4, "stroke-opacity": 0.92 }),
    path("M94 256Q91 290 94 320", { stroke: g, "stroke-width": 1.4, "stroke-opacity": 0.75 }),
    path("M86 222Q102 200 128 188", { stroke: g, "stroke-width": 2, "stroke-opacity": 0.85 }),
    path("M216 292Q218 322 215 348", { stroke: g, "stroke-width": 1.2, "stroke-opacity": 0.5 }),
  );

  // The brass collar: a tall band sitting straight on the shoulder, two turned rings, a lit edge.
  parts.push(
    path("M130 150H170V174H130Z", { fill: ground, stroke: brass, "stroke-width": 1.2 }),
    path("M130 155H170M130 169H170", { stroke: brass, "stroke-opacity": 0.75, "stroke-width": 0.8 }),
    path(hatch(156, 150, 14, 24, 2.4, 90), { stroke: brass, "stroke-opacity": 0.45, "stroke-width": 0.6 }),
    path("M134 152V172", { stroke: g, "stroke-opacity": 0.85, "stroke-width": 1.6 }),
  );

  if (night) {
    // The faceted crystal ball stopper on its short stem, with a small finial.
    parts.push(
      path("M143 128H157V150H143Z", { fill: ground, stroke: line, "stroke-width": 1 }),
      el("circle", { cx: 150, cy: 100, r: 30, fill: ground, stroke: line, "stroke-width": 1.1 }),
      path(
        "M120 100H180M150 70V130M129 79Q150 92 171 79M129 121Q150 108 171 121M129 79Q140 100 129 121M171 79Q160 100 171 121",
        { stroke: line, "stroke-opacity": 0.45, "stroke-width": 0.7 },
      ),
      el("circle", { cx: 150, cy: 64, r: 5, fill: ground, stroke: line, "stroke-width": 0.9 }),
      path("M128 94Q131 79 144 73", { stroke: g, "stroke-width": 2.2, "stroke-opacity": 0.92 }),
      path("M160 112L166 106", { stroke: g, "stroke-width": 1.4, "stroke-opacity": 0.7 }),
    );
  } else {
    // The brass atomizer head: a cap, the nozzle pointing right, and the hose spigot on the left.
    parts.push(
      path("M136 150V136Q136 124 150 124Q164 124 164 136V150Z", { fill: ground, stroke: brass, "stroke-width": 1.2 }),
      path("M164 129H180M164 133H180M180 127V135", { stroke: brass, "stroke-width": 1.1 }),
      path(`M136 ${HOSE_Y - 3}H128M136 ${HOSE_Y + 3}H128`, { stroke: brass, "stroke-width": 1.1 }),
      path("M141 132Q143 127 148 126", { stroke: g, "stroke-width": 1.5, "stroke-opacity": 0.9 }),
    );
  }

  return svgDoc({
    viewBox: `0 0 ${FLACON_W} ${FLACON_H}`,
    title: night ? "A flacon of No. 019 under one light, drawn for Aetheria" : "The finished flacon with its atomizer, drawn for Aetheria",
    body: parts.join(""),
    attrs: { fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" },
  });
}

/**
 * The engraved burst behind the night bottle: fine rays of alternating length from a point inside the
 * body, like an engraver's glory. Drawn on a canvas three bottles wide and two tall (LIGHT_BOX), so it
 * can reach far past the bottle; its mask is an upright ellipse that stops short of the sentence
 * halves either side.
 */
function burst(cx: number, cy: number, inner: number, outer: number, count: number): string {
  let d = "";
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const len = i % 4 === 0 ? outer : i % 2 === 0 ? outer * 0.72 : outer * 0.5;
    d += `M${num(cx + Math.cos(a) * inner, 1)} ${num(cy + Math.sin(a) * inner, 1)}L${num(cx + Math.cos(a) * len, 1)} ${num(cy + Math.sin(a) * len, 1)}`;
  }
  return d;
}

/** The light file's viewBox: the bottle's 300 × 440 grid in the middle of a 900 × 880 canvas. */
export const LIGHT_BOX = { x: -300, y: -220, w: 900, h: 880 } as const;

/** The night bottle's one light: an engraved burst behind the body, a gouache core and the pool on the floor. */
export function nocturneLightSvg(): string {
  const g = PALETTE.gouache;
  const fade = (id: string) =>
    el(
      "radialGradient",
      { id, cx: 0.5, cy: 0.5, r: 0.5 },
      el("stop", { offset: 0.42, "stop-color": "#fff" }),
      el("stop", { offset: 1, "stop-color": "#fff", "stop-opacity": 0 }),
    );
  const pool = Array.from({ length: 9 }, (_, i) => `M-120 ${num(FLOOR + 2 + i * 3.2, 1)}H420`).join("");
  const core = el(
    "radialGradient",
    { id: "nl-core", cx: 0.5, cy: 0.5, r: 0.5 },
    el("stop", { offset: 0, "stop-color": g, "stop-opacity": 0.55 }),
    el("stop", { offset: 0.45, "stop-color": g, "stop-opacity": 0.16 }),
    el("stop", { offset: 1, "stop-color": g, "stop-opacity": 0 }),
  );
  const body = [
    el(
      "defs",
      null,
      fade("nl-f"),
      core,
      // stroke="none": the root's gouache stroke is inherited, and a stroked mask shape draws a hard rim.
      el("mask", { id: "nl-rays" }, el("ellipse", { cx: 150, cy: 262, rx: 190, ry: 250, fill: "url(#nl-f)", stroke: "none" })),
      el("mask", { id: "nl-disc" }, el("circle", { cx: 150, cy: 250, r: 150, fill: "url(#nl-f)", stroke: "none" })),
      el("mask", { id: "nl-pool" }, el("ellipse", { cx: 150, cy: 394, rx: 230, ry: 30, fill: "url(#nl-f)", stroke: "none" })),
    ),
    el("g", { mask: "url(#nl-rays)" }, el("path", { d: burst(150, 250, 40, 420, 144), "stroke-opacity": 0.5, "stroke-width": 0.9 })),
    el("g", { mask: "url(#nl-disc)" }, el("path", { d: engravedLight(150, 250, 150), "stroke-opacity": 0.3, "stroke-width": 1 })),
    el("circle", { cx: 150, cy: 250, r: 120, fill: "url(#nl-core)", stroke: "none" }),
    el("g", { mask: "url(#nl-pool)" }, el("path", { d: pool, "stroke-opacity": 0.55, "stroke-width": 0.9 })),
  ].join("");
  return svgDoc({
    viewBox: `${LIGHT_BOX.x} ${LIGHT_BOX.y} ${LIGHT_BOX.w} ${LIGHT_BOX.h}`,
    title: "One light, engraved, drawn for Aetheria",
    body,
    attrs: { fill: "none", stroke: g, "stroke-linecap": "round" },
  });
}
