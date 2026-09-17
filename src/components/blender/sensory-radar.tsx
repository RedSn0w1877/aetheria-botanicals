"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { useMemo } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { AXES, type AxisName, type SensoryVector } from "@/lib/blend-formulas";
import { COPYRIGHT_MARK } from "@/lib/copyright";
import { EASE_SILK } from "@/lib/motion";

const W = 380;
const H = 330;
const CX = W / 2;
const CY = 165;
const R = 96;
const RINGS = [0.25, 0.5, 0.75, 1];

/** Axis i points straight up and the rest follow clockwise. */
function point(axis: number, radius: number): [number, number] {
  const angle = -Math.PI / 2 + (axis * Math.PI * 2) / AXES.length;
  // Rounded: server and browser print long floats differently, which breaks hydration.
  return [Math.round((CX + Math.cos(angle) * radius) * 1000) / 1000, Math.round((CY + Math.sin(angle) * radius) * 1000) / 1000];
}

const fmt = (n: number) => n.toFixed(2);

function hexPath(radius: number): string {
  return `${AXES.map((_, i) => {
    const [x, y] = point(i, radius);
    return `${i === 0 ? "M" : "L"}${fmt(x)} ${fmt(y)}`;
  }).join(" ")} Z`;
}

/** Weighted profile values sit well under 1, so stretch them to read, keeping a small floor. */
const displayRadius = (value: number) => R * (0.08 + 0.92 * Math.min(1, value / 0.8));

/**
 * Sensory balance: a hexagonal radar. The polygon always has six vertices in the same
 * order, so motion can interpolate the `d` string number-by-number and the shape morphs.
 */
export function SensoryRadar({ profile, tags }: { profile: SensoryVector; tags: readonly AxisName[] }) {
  const reduce = useReducedMotion();
  const vertices = useMemo(() => profile.map((value, i) => point(i, displayRadius(value))), [profile]);
  const d = useMemo(() => `${vertices.map(([x, y], i) => `${i === 0 ? "M" : "L"}${fmt(x)} ${fmt(y)}`).join(" ")} Z`, [vertices]);
  const morph = reduce ? { duration: 0 } : { duration: 1.4, ease: EASE_SILK };
  const description = useMemo(() => AXES.map((axis, i) => `${axis} ${Math.round(profile[i] * 100)}`).join(", "), [profile]);

  return (
    <figure className="min-w-0">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mx-auto h-auto w-full max-w-[420px]"
        role="img"
        aria-label={`Sensory balance out of 100: ${description}.`}
      >
        {RINGS.map((ring) => (
          <path key={ring} d={hexPath(R * ring)} fill="none" stroke="#dcd6c8" strokeWidth={ring === 1 ? 1 : 0.75} />
        ))}
        {AXES.map((axis, i) => {
          const [x, y] = point(i, R);
          return <line key={axis} x1={CX} y1={CY} x2={x} y2={y} stroke="#dcd6c8" strokeWidth={0.75} />;
        })}
        <motion.path
          initial={false}
          animate={{ d }}
          transition={morph}
          fill="#b8583d"
          fillOpacity={0.14}
          stroke="#a88243"
          strokeWidth={1.25}
          strokeLinejoin="round"
        />
        {vertices.map(([x, y], i) => (
          <motion.circle
            key={AXES[i]}
            r={2.6}
            fill="#f9f7f2"
            stroke="#a88243"
            strokeWidth={1}
            initial={false}
            animate={{ cx: x, cy: y }}
            transition={morph}
          />
        ))}
        {AXES.map((axis, i) => {
          const [x, y] = point(i, R + 16);
          const anchor = Math.abs(x - CX) < 4 ? "middle" : x > CX ? "start" : "end";
          const dy = i === 0 ? -4 : i === 3 ? 12 : 4;
          const dominant = tags.includes(axis);
          return (
            <text
              key={axis}
              x={x}
              y={y + dy}
              textAnchor={anchor}
              className="font-sans uppercase"
              style={{ fontSize: 9.5, letterSpacing: "0.16em", transition: "fill 900ms ease" }}
              fill={dominant ? "#18231c" : "rgba(24,35,28,0.55)"}
            >
              {axis}
              <tspan x={x} dy={11} className="font-serif" style={{ fontSize: 11, letterSpacing: 0 }} fill="#a88243">
                {Math.round(profile[i] * 100)}
              </tspan>
            </text>
          );
        })}
        <text x={W - 2} y={H - 4} textAnchor="end" className="font-sans" style={{ fontSize: 6.5, letterSpacing: "0.2em" }} fill="rgba(24,35,28,0.35)">
          {COPYRIGHT_MARK.toUpperCase()}
        </text>
      </svg>
      <figcaption className="mt-1">
        <span className="sr-only">Dominant character: {tags.join(", ")}.</span>
        <LayoutGroup id="blender-tags">
          <ul aria-hidden className="flex min-h-[2.25rem] flex-wrap justify-center gap-2">
            <AnimatePresence mode="popLayout" initial={false}>
              {tags.map((tag, i) => (
                <motion.li
                  key={tag}
                  layout
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10, filter: "blur(4px)" }}
                  transition={reduce ? { duration: 0.2 } : { duration: 0.8, ease: EASE_SILK }}
                  className="flex items-center gap-2 rounded-full border border-brass/60 px-3 py-1.5 font-sans text-[9px] uppercase tracking-[0.24em] text-rosemary sm:text-[10px]"
                >
                  <span className="font-serif text-xs italic normal-case tracking-normal text-brass">{i + 1}</span>
                  {tag}
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </LayoutGroup>
      </figcaption>
    </figure>
  );
}
