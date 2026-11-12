"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { memo, useMemo, type CSSProperties } from "react";
import { AXES, type SensoryVector } from "@/lib/blend-formulas";
import { axisLabel, dominantSentence } from "./formula-text";
import s from "./compose.module.css";

/*
 * Drawn at 1:1 on a 380-unit viewBox, so its 13-unit labels read as 13px wherever there is room for
 * the full figure (it shrinks with the column on phones).
 */
const W = 380;
const H = 272;
const CX = W / 2;
const CY = 138;
const R = 96;
const RINGS = [0.25, 0.5, 0.75, 1];

/** Axis 0 points straight up and the rest follow clockwise. */
function point(axis: number, radius: number): [number, number] {
  const angle = -Math.PI / 2 + (axis * Math.PI * 2) / AXES.length;
  // Rounded: server and browser print long floats differently, which breaks hydration.
  return [Math.round((CX + Math.cos(angle) * radius) * 1000) / 1000, Math.round((CY + Math.sin(angle) * radius) * 1000) / 1000];
}

const fmt = (n: number) => n.toFixed(2);

const polygon = (points: readonly (readonly [number, number])[]) =>
  `${points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${fmt(x)} ${fmt(y)}`).join(" ")} Z`;

/** The rings and spokes never change: one path, built once. */
const GRID = [
  ...RINGS.map((ring) => polygon(AXES.map((_, i) => point(i, R * ring)))),
  ...AXES.map((_, i) => {
    const [x, y] = point(i, R);
    return `M${fmt(CX)} ${fmt(CY)} L${fmt(x)} ${fmt(y)}`;
  }),
].join(" ");

/** Where each two-line label sits: name above, value below, anchored away from the figure. */
const LABELS = AXES.map((axis, i) => {
  const [x, y] = point(i, R + 14);
  if (i === 0) return { axis, x, anchor: "middle" as const, nameY: y - 14, valueY: y };
  if (i === 3) return { axis, x, anchor: "middle" as const, nameY: y + 4, valueY: y + 18 };
  return { axis, x, anchor: i < 3 ? ("start" as const) : ("end" as const), nameY: y - 2, valueY: y + 12 };
});

/** Weighted profile values sit well under 1, so stretch them to read, keeping a small floor. */
const displayRadius = (value: number) => R * (0.08 + 0.92 * Math.min(1, value / 0.8));

/**
 * The sensory balance: a hexagonal radar. The polygon always has six vertices in the same order, so
 * CSS can morph it: the shape carries its path in CSS `d` (transition 600ms silk) as well as in the
 * attribute, and the vertex dots move by CSS cx/cy. Browsers without CSS `d` (Safari) simply snap.
 * The figcaption says the same thing in a sentence.
 */
export const SensoryRadar = memo(function SensoryRadar({
  profile,
  className,
}: {
  profile: SensoryVector;
  className?: string;
}) {
  const vertices = useMemo(() => profile.map((value, i) => point(i, displayRadius(value))), [profile]);
  const d = useMemo(() => polygon(vertices), [vertices]);
  const description = AXES.map((axis, i) => `${axisLabel(axis)} ${Math.round(profile[i] * 100)}`).join(", ");

  return (
    <figure className={className}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className={s.radarSvg}
        role="img"
        aria-label={`Sensory balance out of 100: ${description}.`}
      >
        <path className={s.radarGrid} d={GRID} />
        <path className={s.radarShape} d={d} style={{ d: `path('${d}')` } as CSSProperties} />
        {vertices.map(([x, y], i) => (
          <circle
            key={AXES[i]}
            r={2.6}
            cx={x}
            cy={y}
            style={{ cx: `${x}px`, cy: `${y}px` } as CSSProperties}
          />
        ))}
        {LABELS.map(({ axis, x, anchor, nameY, valueY }, i) => (
          <text key={axis} textAnchor={anchor}>
            <tspan x={fmt(x)} y={fmt(nameY)}>
              {axisLabel(axis)}
            </tspan>
            <tspan x={fmt(x)} y={fmt(valueY)}>
              {Math.round(profile[i] * 100)}
            </tspan>
          </text>
        ))}
      </svg>
      <figcaption className={s.radarCaption}>{dominantSentence(profile)}</figcaption>
    </figure>
  );
});
