"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { motion, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { BRASS, CLAY, INK, LINE, PAPER, SAGE, SvgImprint, SvgLabel, VIOLET, useIdleLoops, useSegment, type DiagramProps } from "./diagram-kit";

/** Frost crystals: [cx, cy, radius]. They form one after another as the plates close. */
const CRYSTALS: ReadonlyArray<readonly [number, number, number]> = [
  [62, 150, 13],
  [44, 206, 8],
  [70, 252, 16],
  [338, 144, 15],
  [360, 196, 9],
  [334, 246, 12],
  [362, 290, 7],
];

/** Pressed matter resting on the lower plate, drawn at full height (y 130–250). */
const LEAVES = [
  "M140 250 C 150 214, 172 196, 196 190 C 186 218, 168 240, 140 250 Z",
  "M168 250 C 176 200, 204 170, 236 162 C 226 202, 204 236, 168 250 Z",
  "M214 250 C 214 214, 234 186, 262 178 C 262 214, 246 240, 214 250 Z",
  "M150 222 C 150 186, 162 156, 186 136 C 196 170, 180 204, 150 222 Z",
  "M232 232 C 222 196, 226 160, 246 134 C 262 166, 254 204, 232 232 Z",
] as const;

function hexPath(cx: number, cy: number, r: number) {
  const points = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    return `${(cx + Math.cos(a) * r).toFixed(2)} ${(cy + Math.sin(a) * r).toFixed(2)}`;
  });
  return `M${points.join(" L")} Z`;
}

function spokePath(cx: number, cy: number, r: number) {
  const inner = r * 0.82;
  const parts: string[] = [];
  for (let i = 0; i < 3; i += 1) {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    const dx = Math.cos(a) * inner;
    const dy = Math.sin(a) * inner;
    parts.push(`M${(cx - dx).toFixed(2)} ${(cy - dy).toFixed(2)} L${(cx + dx).toFixed(2)} ${(cy + dy).toFixed(2)}`);
  }
  return parts.join(" ");
}

function Crystal({ progress, index, cx, cy, r }: { progress: MotionValue<number>; index: number; cx: number; cy: number; r: number }) {
  const start = 0.42 + index * 0.06;
  const draw = useSegment(progress, start, Math.min(start + 0.2, 1));
  return (
    <g>
      <motion.path d={hexPath(cx, cy, r)} fill={VIOLET} fillOpacity={0.04} stroke={VIOLET} strokeWidth={1} style={{ pathLength: draw }} />
      <motion.path d={spokePath(cx, cy, r)} fill="none" stroke={VIOLET} strokeOpacity={0.7} strokeWidth={0.75} strokeLinecap="round" style={{ pathLength: draw }} />
    </g>
  );
}

/**
 * Plate II — the upper plate screws down over the frozen harvest, the leaves
 * flatten, a small clock runs out its forty minutes and frost hexagons crystallise.
 */
export function PressDiagram({ progress }: DiagramProps) {
  const ref = useRef<SVGSVGElement>(null);
  const loops = useIdleLoops(ref);

  const frame = useSegment(progress, 0, 0.3);
  const press = useSegment(progress, 0.15, 0.62);
  const timer = useSegment(progress, 0, 0.55);
  const cold = useSegment(progress, 0.45, 0.8);

  const plateY = useTransform(press, [0, 1], [0, 92]);
  const rodScale = useTransform(press, [0, 1], [20 / 112, 1]);
  const handleTurn = useTransform(press, (t) => Math.cos(t * Math.PI * 4));
  const squash = useTransform(press, [0, 1], [1, 0.37]);
  const hand = useTransform(timer, [0, 1], [0, 240]);

  return (
    <svg ref={ref} viewBox="0 0 400 400" className="h-full w-full" aria-hidden focusable="false">
      {/* Temperature */}
      <motion.g style={{ opacity: cold }}>
        <text x={24} y={50} fill={INK} style={{ fontFamily: "var(--font-serif)", fontSize: 30, fontWeight: 300 }}>
          −196°
        </text>
        <SvgLabel x={26} y={68} opacity={0.6}>
          LIQUID NITROGEN
        </SvgLabel>
      </motion.g>

      {/* Forty-minute clock */}
      <g transform="translate(346 50)">
        <motion.circle r={17} {...LINE} strokeWidth={1} style={{ pathLength: frame }} />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * Math.PI) / 6;
          return (
            <line
              key={i}
              x1={Math.round((Math.sin(a) * 13) * 1000) / 1000}
              y1={Math.round((-Math.cos(a) * 13) * 1000) / 1000}
              x2={Math.round((Math.sin(a) * 15.5) * 1000) / 1000}
              y2={Math.round((-Math.cos(a) * 15.5) * 1000) / 1000}
              stroke={INK}
              strokeOpacity={0.5}
              strokeWidth={0.75}
            />
          );
        })}
        <motion.path d="M0 -22 A22 22 0 1 1 -19.05 11" fill="none" stroke={BRASS} strokeWidth={1.5} strokeLinecap="round" style={{ pathLength: timer }} />
        <motion.line x1={0} y1={2} x2={0} y2={-11} stroke={CLAY} strokeWidth={1.25} strokeLinecap="round" style={{ rotate: hand, originX: 0.5, originY: 0.846 }} />
        <circle r={1.6} fill={INK} />
        <text y={40} textAnchor="middle" fill={INK} opacity={0.6} style={{ fontFamily: "var(--font-sans)", fontSize: 9, letterSpacing: "0.22em" }}>
          40 MIN
        </text>
      </g>

      {/* Frame: beam, posts and base */}
      <motion.path d="M110 300 V80 M290 300 V80" {...LINE} style={{ pathLength: frame }} />
      <motion.rect x={100} y={64} width={200} height={16} {...LINE} style={{ pathLength: frame }} />
      <motion.rect x={84} y={300} width={232} height={14} {...LINE} style={{ pathLength: frame }} />
      <motion.path d="M96 314 V330 M304 314 V330" {...LINE} style={{ pathLength: frame }} />

      {/* Screw handle and rod */}
      <motion.path d="M200 40 V64" {...LINE} style={{ pathLength: frame }} />
      <motion.g style={{ scaleX: handleTurn, opacity: frame }}>
        <line x1={150} y1={40} x2={250} y2={40} stroke={BRASS} strokeWidth={2} strokeLinecap="round" />
        <circle cx={150} cy={40} r={4} fill={PAPER} stroke={BRASS} strokeWidth={1.25} />
        <circle cx={250} cy={40} r={4} fill={PAPER} stroke={BRASS} strokeWidth={1.25} />
      </motion.g>
      <motion.path d="M200 80 V192" {...LINE} strokeWidth={2.5} style={{ scaleY: rodScale, originY: 0 }} />

      {/* Lower plate and the harvest resting on it */}
      <motion.g style={{ scaleY: squash, originY: 1 }}>
        {LEAVES.map((d) => (
          <motion.path key={d} d={d} fill={SAGE} fillOpacity={0.16} stroke={SAGE} strokeWidth={1} style={{ pathLength: frame }} />
        ))}
        <motion.g style={{ opacity: cold }}>
          {LEAVES.map((d) => (
            <path key={`frost-${d}`} d={d} fill={VIOLET} fillOpacity={0.08} />
          ))}
        </motion.g>
      </motion.g>
      <rect x={122} y={250} width={156} height={14} fill={PAPER} />
      <motion.rect x={122} y={250} width={156} height={14} {...LINE} style={{ pathLength: frame }} />
      <motion.path d="M140 264 V300 M260 264 V300" {...LINE} strokeWidth={1} style={{ pathLength: frame }} />

      {/* Upper plate, travelling down */}
      <motion.g style={{ y: plateY }}>
        <rect x={122} y={100} width={156} height={14} fill={PAPER} />
        <motion.rect x={122} y={100} width={156} height={14} {...LINE} style={{ pathLength: frame }} />
        <path d="M130 107 H270" stroke={BRASS} strokeOpacity={0.6} strokeWidth={0.75} />
      </motion.g>

      {/* Nitrogen vapour drifting off the plates */}
      <motion.g style={{ opacity: cold }}>
        {[0, 1, 2].map((i) => (
          <motion.path
            key={`r-${i}`}
            d={`M292 ${218 + i * 14} q 6 -4 12 0 t 12 0 t 12 0`}
            fill="none"
            stroke={VIOLET}
            strokeOpacity={0.45}
            strokeWidth={0.9}
            strokeLinecap="round"
            animate={loops ? { x: [0, 14, 0], opacity: [0.2, 0.9, 0.2] } : { x: 0, opacity: 0.6 }}
            transition={loops ? { duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.8 } : { duration: 0.6 }}
          />
        ))}
        {[0, 1, 2].map((i) => (
          <motion.path
            key={`l-${i}`}
            d={`M108 ${218 + i * 14} q -6 -4 -12 0 t -12 0 t -12 0`}
            fill="none"
            stroke={VIOLET}
            strokeOpacity={0.45}
            strokeWidth={0.9}
            strokeLinecap="round"
            animate={loops ? { x: [0, -14, 0], opacity: [0.2, 0.9, 0.2] } : { x: 0, opacity: 0.6 }}
            transition={loops ? { duration: 5.5 + i, repeat: Infinity, ease: "easeInOut", delay: 0.4 + i * 0.8 } : { duration: 0.6 }}
          />
        ))}
      </motion.g>

      {/* Frost crystals */}
      {CRYSTALS.map(([cx, cy, r], i) => (
        <Crystal key={`${cx}-${cy}`} progress={progress} index={i} cx={cx} cy={cy} r={r} />
      ))}

      <motion.g style={{ opacity: cold }}>
        <SvgLabel x={200} y={356} anchor="middle" opacity={0.65}>
          PRESSED BY HAND · NO HEAT
        </SvgLabel>
      </motion.g>

      <SvgImprint />
    </svg>
  );
}
