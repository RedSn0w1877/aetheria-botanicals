"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { motion, useReducedMotion } from "motion/react";
import { EASE_DRIFT } from "@/lib/motion";

/**
 * A hand-authored herbarium drawing that frames the apothecary arch: vetiver blades
 * rising at the lower left, a birch twig with serrated leaves and hanging catkins
 * reaching over the top right. Every stroke draws itself in with `pathLength`.
 *
 * Coordinates: the viewBox is 720 × 798. The arch it frames occupies x 110–610,
 * y 70–770 (a 500 × 700 box whose top is a semicircle centred at 360, 320).
 */

type Stroke = { d: string; delay: number; duration: number; tone: "moss" | "brass" | "sage"; width?: number };
type Leaf = { x: number; y: number; rotate: number; scale: number; delay: number };

const TONES = { moss: "#2f4034", brass: "#a88243", sage: "#7d8a74" } as const;

const VETIVER: readonly Stroke[] = [
  { d: "M0 794 C 90 790 200 797 300 792", delay: 0, duration: 1.6, tone: "brass" },
  { d: "M96 792 Q84 610 40 440 Q98 612 106 792", delay: 0.1, duration: 2.6, tone: "moss" },
  { d: "M112 792 Q112 560 150 380 Q124 566 120 792", delay: 0.25, duration: 2.8, tone: "moss" },
  { d: "M104 792 Q96 520 78 320 Q110 524 112 792", delay: 0.35, duration: 3, tone: "moss" },
  { d: "M108 786 Q100 560 82 360", delay: 0.9, duration: 2.2, tone: "sage" },
  { d: "M126 792 Q150 640 236 520 Q160 650 134 792", delay: 0.45, duration: 2.4, tone: "moss" },
  { d: "M84 792 Q60 660 6 590 Q72 668 92 792", delay: 0.55, duration: 2.2, tone: "moss" },
  { d: "M118 792 Q126 560 204 448 Q238 420 262 468", delay: 0.65, duration: 3.1, tone: "moss" },
  { d: "M140 792 Q176 700 282 650 Q184 712 148 792", delay: 0.8, duration: 2.3, tone: "sage" },
  { d: "M70 792 Q58 700 24 668", delay: 1, duration: 1.8, tone: "sage" },
];

const BIRCH: readonly Stroke[] = [
  { d: "M722 262 C 680 214 640 150 592 108 C 552 72 500 40 432 22", delay: 0.4, duration: 2.8, tone: "moss", width: 1.3 },
  { d: "M640 150 C 652 116 668 92 700 78", delay: 1.2, duration: 1.6, tone: "moss" },
  { d: "M548 62 C 540 40 548 18 566 4", delay: 1.4, duration: 1.5, tone: "moss" },
  { d: "M486 42 C 474 30 458 24 440 26", delay: 1.6, duration: 1.3, tone: "moss" },
  // Catkins: short scalloped tassels hanging from the twig.
  {
    d: "M628 136 c 4 8 -3 12 0 20 c 4 8 -3 12 0 20 c 4 8 -3 12 0 20 c 3 7 -2 10 0 14",
    delay: 1.8,
    duration: 1.6,
    tone: "brass",
  },
  {
    d: "M676 112 c 4 7 -3 11 0 18 c 4 7 -3 11 0 18 c 4 7 -3 11 0 18 c 3 6 -2 9 0 12",
    delay: 2,
    duration: 1.5,
    tone: "brass",
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

export function BotanicalDrawing({ className, delay = 0 }: { className?: string; delay?: number }) {
  // Only the transition depends on this, never the markup, so hydration stays identical.
  const reduce = useReducedMotion();
  const drawn = { pathLength: 1, opacity: 1 };
  const hidden = { pathLength: 0, opacity: 0 };

  const renderStroke = (stroke: Stroke, key: string) => (
    <motion.path
      key={key}
      d={stroke.d}
      fill="none"
      stroke={TONES[stroke.tone]}
      strokeWidth={stroke.width ?? 1}
      strokeLinecap="round"
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
      initial={hidden}
      animate={drawn}
      transition={
        reduce
          ? { duration: 0 }
          : {
              pathLength: { duration: stroke.duration, ease: EASE_DRIFT, delay: delay + stroke.delay },
              opacity: { duration: 0.4, delay: delay + stroke.delay },
            }
      }
    />
  );

  return (
    <svg viewBox="0 0 720 798" preserveAspectRatio="xMidYMid meet" aria-hidden className={className} role="presentation">
      <g>{VETIVER.map((stroke, i) => renderStroke(stroke, `v${i}`))}</g>
      <g>{BIRCH.map((stroke, i) => renderStroke(stroke, `b${i}`))}</g>
      <g>
        {LEAVES.map((leaf, i) => (
          <g key={`l${i}`} transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.rotate}) scale(${leaf.scale})`}>
            {renderStroke({ d: BIRCH_LEAF, delay: leaf.delay, duration: 1.8, tone: "moss" }, `lf${i}`)}
            {renderStroke({ d: BIRCH_RIB, delay: leaf.delay + 0.6, duration: 1.2, tone: "sage" }, `lr${i}`)}
          </g>
        ))}
      </g>
    </svg>
  );
}
