"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { motion, useTransform } from "motion/react";
import { useId, useRef } from "react";
import { BRASS, CLAY, INK, LINE, PAPER, SvgImprint, SvgLabel, VIOLET, useIdleLoops, useSegment, type DiagramProps } from "./diagram-kit";

const FLACON =
  "M190 262 V280 Q190 290 172 294 Q146 300 146 322 V358 Q146 372 160 372 H240 Q254 372 254 358 V322 Q254 300 228 294 Q210 290 210 280 V262 Z";
const FILL_TOP = 292;
const FILL_BOTTOM = 372;

/** Fluted filter paper: a zigzag rim whose every vertex folds down to the tip. */
const FOLD_POINTS: ReadonlyArray<readonly [number, number]> = Array.from({ length: 11 }, (_, i) => [152 + i * 9.6, i % 2 ? 91 : 98] as const);
const PAPER_RIM = `M${FOLD_POINTS.map(([x, y]) => `${x.toFixed(1)} ${y}`).join(" L")}`;
const PAPER_FOLDS = FOLD_POINTS.map(([x, y]) => `M${x.toFixed(1)} ${y} L200 158`).join(" ");

/** One drop every four seconds: it swells at the tip, lets go, and is gone. */
const DROP_SECONDS = 4;
const DROP_TIMES = [0, 0.66, 0.8, 0.84, 1];

/**
 * Plate IV — a funnel lined with folded paper releases single drops into a
 * violet flacon that fills slowly, while the light is held back at the glass.
 */
export function FiltrationDiagram({ progress }: DiagramProps) {
  const ref = useRef<SVGSVGElement>(null);
  const loops = useIdleLoops(ref);
  const clipId = `ritual-flacon-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const stand = useSegment(progress, 0, 0.3);
  const funnel = useSegment(progress, 0.05, 0.35);
  const paper = useSegment(progress, 0.15, 0.5);
  const flacon = useSegment(progress, 0.3, 0.6);
  const fill = useSegment(progress, 0.4, 1);
  const drops = useSegment(progress, 0.35, 0.45);
  const light = useSegment(progress, 0.6, 0.9);
  const notes = useSegment(progress, 0.5, 0.8);

  const liquidScale = useTransform(fill, [0, 1], [0, 1]);
  const surfaceY = useTransform(fill, [0, 1], [FILL_BOTTOM - FILL_TOP, 0]);
  const millilitres = useTransform(fill, (t) => `${Math.round(t * 30)} ml`);

  return (
    <svg ref={ref} viewBox="0 0 400 400" className="h-full w-full" aria-hidden focusable="false">
      <defs>
        <clipPath id={clipId}>
          <path d={FLACON} />
        </clipPath>
      </defs>

      {/* Light, stopped at the violet glass */}
      <motion.g style={{ opacity: light }}>
        <circle cx={52} cy={58} r={10} fill="none" stroke={CLAY} strokeWidth={1} />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * Math.PI) / 4;
          return (
            <line
              key={i}
              x1={Math.round((52 + Math.cos(a) * 14) * 1000) / 1000}
              y1={Math.round((58 + Math.sin(a) * 14) * 1000) / 1000}
              x2={Math.round((52 + Math.cos(a) * 18) * 1000) / 1000}
              y2={Math.round((58 + Math.sin(a) * 18) * 1000) / 1000}
              stroke={CLAY}
              strokeWidth={1}
              strokeLinecap="round"
            />
          );
        })}
        <path d="M62 76 L140 318 M70 72 L141 338 M56 80 L136 348" stroke={CLAY} strokeOpacity={0.55} strokeWidth={0.9} strokeDasharray="3 6" />
        <path d="M134 316 L146 320 M135 336 L147 340 M130 346 L142 350" stroke={CLAY} strokeWidth={1.5} strokeLinecap="round" />
        <SvgLabel x={24} y={112} opacity={0.65}>
          LIGHT,
        </SvgLabel>
        <SvgLabel x={24} y={126} opacity={0.65}>
          HELD BACK
        </SvgLabel>
      </motion.g>

      {/* Ring stand */}
      <motion.path d="M330 372 V64 M330 120 H240" {...LINE} style={{ pathLength: stand }} />
      <motion.path d="M280 372 H372" {...LINE} strokeWidth={3} style={{ pathLength: stand }} />
      <motion.circle cx={330} cy={120} r={4} {...LINE} stroke={BRASS} style={{ pathLength: stand }} />
      <motion.ellipse cx={200} cy={120} rx={40} ry={5} {...LINE} strokeWidth={1} style={{ pathLength: stand }} />

      {/* Funnel with fluted filter paper */}
      <motion.path d="M140 88 L194 166 V206 H206 V166 L260 88" {...LINE} fill={PAPER} style={{ pathLength: funnel }} />
      <motion.g style={{ opacity: paper }}>
        <path d={`${PAPER_RIM} L200 158 Z`} fill={PAPER} />
        <path d={`${PAPER_RIM} L200 158 Z`} fill={BRASS} fillOpacity={0.08} />
      </motion.g>
      <motion.path d={PAPER_RIM} fill="none" stroke={BRASS} strokeWidth={1} strokeLinejoin="round" style={{ pathLength: paper }} />
      <motion.path d={PAPER_FOLDS} fill="none" stroke={BRASS} strokeOpacity={0.6} strokeWidth={0.7} style={{ pathLength: paper }} />
      <motion.ellipse cx={200} cy={88} rx={60} ry={6} {...LINE} style={{ pathLength: funnel }} />

      {/* The drop */}
      <motion.g style={{ opacity: drops }}>
        <motion.path
          d="M200 206 C 203 211, 204 213, 204 215 A4 4 0 0 1 196 215 C 196 213, 197 211, 200 206 Z"
          fill={VIOLET}
          fillOpacity={0.75}
          style={{ originX: 0.5, originY: 0 }}
          initial={false}
          animate={
            loops
              ? { y: [0, 0, 54, 60, 60], scale: [0.2, 1, 1, 0.6, 0.2], opacity: [0, 1, 1, 0, 0] }
              : { y: 0, scale: 1, opacity: 1 }
          }
          transition={loops ? { duration: DROP_SECONDS, times: DROP_TIMES, repeat: Infinity, ease: "easeIn" } : { duration: 0.6 }}
        />
      </motion.g>
      <motion.g style={{ opacity: notes }}>
        <line x1={212} y1={222} x2={236} y2={222} stroke={INK} strokeOpacity={0.35} strokeWidth={0.75} />
        <SvgLabel x={242} y={220}>
          1 DROP / 4 S
        </SvgLabel>
        <SvgLabel x={242} y={234} opacity={0.6}>
          GRAVITY ONLY
        </SvgLabel>
      </motion.g>

      {/* Violet flacon, filling */}
      <motion.g style={{ opacity: flacon }}>
        <path d={FLACON} fill={VIOLET} fillOpacity={0.05} />
      </motion.g>
      <g clipPath={`url(#${clipId})`}>
        <motion.rect
          x={140}
          y={FILL_TOP}
          width={120}
          height={FILL_BOTTOM - FILL_TOP}
          fill={VIOLET}
          fillOpacity={0.45}
          style={{ scaleY: liquidScale, originY: 1 }}
        />
        <motion.g style={{ y: surfaceY, opacity: drops }}>
          <line x1={140} y1={FILL_TOP} x2={260} y2={FILL_TOP} stroke={VIOLET} strokeWidth={1} />
          <motion.ellipse
            cx={200}
            cy={FILL_TOP}
            rx={14}
            ry={2.5}
            fill="none"
            stroke={PAPER}
            strokeWidth={1}
            style={{ originX: 0.5, originY: 0.5 }}
            initial={false}
            animate={loops ? { scale: [0.2, 0.2, 0.2, 0.3, 1.6], opacity: [0, 0, 0, 1, 0] } : { scale: 1, opacity: 0 }}
            transition={loops ? { duration: DROP_SECONDS, times: DROP_TIMES, repeat: Infinity, ease: "easeOut" } : { duration: 0.6 }}
          />
        </motion.g>
        <path d="M158 314 V360" stroke={PAPER} strokeOpacity={0.7} strokeWidth={2.5} strokeLinecap="round" />
      </g>
      <motion.path d={FLACON} {...LINE} stroke={VIOLET} strokeWidth={1.4} style={{ pathLength: flacon }} />

      {/* Brass stopper, waiting beside the flacon */}
      <motion.g style={{ opacity: flacon }}>
        <path d="M96 372 V360 Q96 352 104 352 H112 Q120 352 120 360 V372" fill={PAPER} stroke={BRASS} strokeWidth={1.25} />
        <path d="M100 352 Q108 332 116 352" fill="none" stroke={BRASS} strokeWidth={1.25} />
      </motion.g>

      {/* Table line and volume */}
      <motion.path d="M24 372 H280" {...LINE} strokeWidth={1} style={{ pathLength: stand }} />
      <motion.text
        x={268}
        y={342}
        fill={INK}
        style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontStyle: "italic", fontVariantNumeric: "lining-nums" }}
      >
        {millilitres}
      </motion.text>

      <SvgImprint />
    </svg>
  );
}
