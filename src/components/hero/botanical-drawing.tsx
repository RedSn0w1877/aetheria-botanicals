"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import type { CSSProperties } from "react";
import { PALETTE } from "@/lib/palette";

/**
 * The herbarium drawing that frames the apothecary niche: vetiver blades rising at the lower left, a
 * birch twig with serrated leaves and hanging catkins reaching over the top right.
 *
 * A client component only so its path data ships once, in the JS, not twice (HTML and RSC payload);
 * it has no state and no effects, and is server-rendered and drawn by CSS alone: the <svg> carries data-ink-now and every path is
 * class="ink" pathLength="1" with its own --d (delay) and --t (duration), so the global ink rules
 * (globals.css) draw it from the first paint, without waiting for hydration, in about 1.8 s. No-JS,
 * lite devices and reduced motion get it finished. No vector-effect: it breaks pathLength dashes, so
 * stroke widths are in user units, tuned for about 1 px at 1440 (and divided by each leaf's scale).
 *
 * Drawn "trois crayons" on the kraft stock: sepia ink for the stems, sanguine (red chalk) for the birch
 * catkins and the vetiver's root crown, and strokes of white gouache heightening on the lit (left, window) side of the blades and leaves, drawn
 * last, the way a botanical study on toned paper was finished. Gouache is for drawings only, never text.
 *
 * Coordinates: the viewBox is 720 × 798. The arch it frames occupies x 110–610, y 70–770 (a 500 × 700
 * box whose top is a semicircle centred at 360, 320). The vetiver is drawn rooted at y 792 and lifted
 * 22 units so its roots stand on the niche's brass baseline (y 770), which is the ground line.
 */

type Tone = "moss" | "brass" | "sage" | "gouache" | "sanguine";
type Stroke = { d: string; delay: number; duration: number; tone: Tone; width?: number };
type Leaf = { x: number; y: number; rotate: number; scale: number; delay: number };

const TONES: Record<Tone, string> = {
  moss: PALETTE.moss,
  brass: PALETTE.brass,
  sage: PALETTE.sage,
  gouache: PALETTE.gouache,
  sanguine: PALETTE.terracotta,
};
const WIDTHS: Record<Tone, number> = { moss: 1.6, brass: 1.6, sage: 1.3, gouache: 2.4, sanguine: 1.7 };

const VETIVER: readonly Stroke[] = [
  { d: "M96 792 Q84 610 40 440 Q98 612 106 792", delay: 0.1, duration: 2.6, tone: "moss" },
  { d: "M112 792 Q112 560 150 380 Q124 566 120 792", delay: 0.25, duration: 2.8, tone: "moss" },
  { d: "M104 792 Q96 520 78 320 Q110 524 112 792", delay: 0.35, duration: 3, tone: "moss" },
  { d: "M108 786 Q100 560 82 360", delay: 0.9, duration: 2.2, tone: "sage" },
  { d: "M126 792 Q150 640 236 520 Q160 650 134 792", delay: 0.45, duration: 2.4, tone: "moss" },
  { d: "M84 792 Q60 660 6 590 Q72 668 92 792", delay: 0.55, duration: 2.2, tone: "moss" },
  { d: "M118 792 Q126 560 204 448 Q238 420 262 468", delay: 0.65, duration: 3.1, tone: "moss" },
  { d: "M140 792 Q176 700 282 650 Q184 712 148 792", delay: 0.8, duration: 2.3, tone: "sage" },
  { d: "M70 792 Q58 700 24 668", delay: 1, duration: 1.8, tone: "sage" },
  // The root crown, in sanguine: the tufted base the blades rise from.
  { d: "M78 792 q 7 -12 15 -5 q 6 -10 14 -2 q 7 -9 14 1 q 6 -7 13 3 M90 792 l -6 10 M104 792 l 0 12 M118 792 l 6 10", delay: 0.2, duration: 1.6, tone: "sanguine" },
];

const BIRCH: readonly Stroke[] = [
  // The twig itself, a little heavier than the rest.
  { d: "M722 262 C 680 214 640 150 592 108 C 552 72 500 40 432 22", delay: 0.4, duration: 2.8, tone: "moss", width: 2 },
  { d: "M640 150 C 652 116 668 92 700 78", delay: 1.2, duration: 1.6, tone: "moss" },
  { d: "M548 62 C 540 40 548 18 566 4", delay: 1.4, duration: 1.5, tone: "moss" },
  { d: "M486 42 C 474 30 458 24 440 26", delay: 1.6, duration: 1.3, tone: "moss" },
  // Catkins: short scalloped tassels hanging from the twig.
  {
    d: "M628 136 c 4 8 -3 12 0 20 c 4 8 -3 12 0 20 c 4 8 -3 12 0 20 c 3 7 -2 10 0 14",
    delay: 1.8,
    duration: 1.6,
    tone: "sanguine",
  },
  {
    d: "M676 112 c 4 7 -3 11 0 18 c 4 7 -3 11 0 18 c 4 7 -3 11 0 18 c 3 6 -2 9 0 12",
    delay: 2,
    duration: 1.5,
    tone: "sanguine",
  },
  // Faint bark marks, the horizontal lenticels birch is known for.
  { d: "M700 236 l 10 -4 M672 204 l 9 -5 M612 128 l 8 -5", delay: 2.2, duration: 1, tone: "sage" },
];

/** A serrated, ovate birch leaf hanging along +y from its stalk. */
const BIRCH_LEAF =
  "M0 0 C 14 6 20 18 18 28 l -3 1 l 2 3 l -4 1 l 1 3 C 10 42 4 44 0 47 C -4 44 -10 42 -12 36 l 1 -3 l -4 -1 l 2 -3 l -3 -1 C -20 18 -14 6 0 0 Z";
const BIRCH_RIB = "M0 3 L0 42 M0 16 l 7 5 M0 16 l -7 5 M0 27 l 6 5 M0 27 l -6 5";

const LEAVES: readonly Leaf[] = [
  { x: 662, y: 104, rotate: -24, scale: 0.95, delay: 1.5 },
  { x: 700, y: 80, rotate: -64, scale: 0.8, delay: 1.7 },
  { x: 604, y: 118, rotate: 16, scale: 1.05, delay: 1.6 },
  { x: 566, y: 6, rotate: -148, scale: 0.72, delay: 1.9 },
  { x: 520, y: 50, rotate: 34, scale: 0.8, delay: 1.8 },
  { x: 440, y: 26, rotate: 62, scale: 0.7, delay: 2.1 },
];

/*
 * White gouache heightening, laid on last: short strokes hugging the window side of three blades and of
 * the twig, where the light from the upper left would catch them. Vetiver strokes share the blades'
 * coordinates (so they are lifted with them).
 */
const VETIVER_LIGHT: readonly Stroke[] = [
  { d: "M100 700 Q94 620 82 560", delay: 2.4, duration: 1.4, tone: "gouache" },
  { d: "M110 690 Q110 600 122 520", delay: 2.5, duration: 1.4, tone: "gouache" },
  { d: "M101 640 Q96 560 88 470", delay: 2.6, duration: 1.4, tone: "gouache" },
  { d: "M131 760 Q150 652 220 540", delay: 2.7, duration: 1.4, tone: "gouache" },
  { d: "M121 740 Q128 590 198 462", delay: 2.8, duration: 1.4, tone: "gouache" },
];
const BIRCH_LIGHT: readonly Stroke[] = [
  { d: "M700 236 C 676 206 652 176 628 152", delay: 2.5, duration: 1.4, tone: "gouache", width: 1.8 },
  { d: "M560 82 C 532 62 500 48 470 40", delay: 2.7, duration: 1.4, tone: "gouache", width: 1.8 },
];
/** A catch-light on each birch leaf's upper edge, in the leaf's own coordinates. */
const LEAF_LIGHT = "M-3 4 C -12 10 -16 20 -15 28";

const round = (n: number) => Math.round(n * 1000) / 1000;

/** The old timeline compressed: delay x 0.35, duration x 0.45 clamped to 0.6–1.2 s. */
function timing(delay: number, duration: number): CSSProperties {
  const t = Math.min(1.2, Math.max(0.6, duration * 0.45));
  return { "--d": `${round(delay * 0.35)}s`, "--t": `${round(t)}s` } as CSSProperties;
}

function InkPath({ stroke, scale = 1 }: { stroke: Stroke; scale?: number }) {
  return (
    <path
      className="ink"
      pathLength={1}
      d={stroke.d}
      stroke={TONES[stroke.tone]}
      strokeWidth={round((stroke.width ?? WIDTHS[stroke.tone]) / scale)}
      style={timing(stroke.delay, stroke.duration)}
    />
  );
}

export function BotanicalDrawing({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 720 798"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
      className={className}
      data-ink-now=""
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <g transform="translate(0 -22)">
        {VETIVER.map((stroke, i) => (
          <InkPath key={`v${i}`} stroke={stroke} />
        ))}
        {VETIVER_LIGHT.map((stroke, i) => (
          <InkPath key={`vl${i}`} stroke={stroke} />
        ))}
      </g>
      {/* The twig hangs 18 units lower than first drawn, so its top leaf never touches the subline. */}
      <g transform="translate(0 18)">
        {BIRCH.map((stroke, i) => (
          <InkPath key={`b${i}`} stroke={stroke} />
        ))}
        {BIRCH_LIGHT.map((stroke, i) => (
          <InkPath key={`bl${i}`} stroke={stroke} />
        ))}
        {LEAVES.map((leaf, i) => (
          <g key={`l${i}`} transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.rotate}) scale(${leaf.scale})`}>
            <InkPath stroke={{ d: BIRCH_LEAF, delay: leaf.delay, duration: 1.8, tone: "moss" }} scale={leaf.scale} />
            <InkPath stroke={{ d: BIRCH_RIB, delay: leaf.delay + 0.6, duration: 1.2, tone: "sage" }} scale={leaf.scale} />
            <InkPath stroke={{ d: LEAF_LIGHT, delay: leaf.delay + 0.9, duration: 1, tone: "gouache" }} scale={leaf.scale} />
          </g>
        ))}
      </g>
    </svg>
  );
}
