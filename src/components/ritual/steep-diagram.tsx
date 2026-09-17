"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { motion, useTransform, type MotionValue } from "motion/react";
import { useId, useRef } from "react";
import { BRASS, CLAY, INK, LINE, PAPER, SAGE, SvgImprint, SvgLabel, useIdleLoops, useSegment, type DiagramProps } from "./diagram-kit";

const VESSEL = "M84 124 H216 V318 Q216 338 196 338 H104 Q84 338 84 318 Z";
const LIQUID_TOP = 150;
const LIQUID_BOTTOM = 338;

/** Botanicals suspended in the cold alcohol: [x, y, rotation, scale]. */
const SUSPENDED: ReadonlyArray<readonly [number, number, number, number]> = [
  [118, 300, -24, 1],
  [168, 272, 32, 0.85],
  [140, 226, 12, 1.1],
  [192, 196, -40, 0.8],
  [112, 176, 58, 0.75],
];

/** Weekly turns, marked along the top as the six months pass. */
const TURNS = 26;

/** The thermometer: 0 °C sits at y = 130, and every degree is 4px lower. */
const tempToY = (celsius: number) => 130 - celsius * 4;
const START_TEMP = 11;
const CELLAR_TEMP = -18;

function TurnTick({ progress, index }: { progress: MotionValue<number>; index: number }) {
  const at = 0.1 + (index / TURNS) * 0.9;
  const lit = useTransform(progress, [at - 0.02, at], [0.18, 1]);
  const x = 32 + index * 8.2;
  return <motion.line x1={x} y1={70} x2={x} y2={index % 4 === 0 ? 80 : 77} stroke={BRASS} strokeWidth={1.25} strokeLinecap="round" style={{ opacity: lit }} />;
}

/**
 * Plate III — the vessel slowly fills and its leaves settle, the thermometer
 * sinks to −18 °C and the day counter rolls from 000 to 180.
 */
export function SteepDiagram({ progress }: DiagramProps) {
  const ref = useRef<SVGSVGElement>(null);
  const loops = useIdleLoops(ref);
  const clipId = `ritual-vessel-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const vessel = useSegment(progress, 0, 0.3);
  const fill = useSegment(progress, 0.08, 0.6);
  const leaves = useSegment(progress, 0.25, 0.6);
  const chill = useSegment(progress, 0.1, 0.55);
  const days = useSegment(progress, 0.1, 1);
  const reading = useSegment(progress, 0.5, 0.7);

  const liquidScale = useTransform(fill, [0, 1], [0.02, 1]);
  const surfaceY = useTransform(fill, [0, 1], [LIQUID_BOTTOM - LIQUID_TOP - 4, 0]);
  const surfaceOpacity = useTransform(fill, [0, 0.04], [0, 1]);
  const columnScale = useTransform(chill, [0, 1], [1, (306 - tempToY(CELLAR_TEMP)) / (306 - tempToY(START_TEMP))]);
  const temperature = useTransform(chill, (t) => {
    const value = Math.round(START_TEMP + (CELLAR_TEMP - START_TEMP) * t);
    return value < 0 ? `−${Math.abs(value)}°` : `+${value}°`;
  });
  const dayCount = useTransform(days, (t) => String(Math.round(t * 180)).padStart(3, "0"));

  return (
    <svg ref={ref} viewBox="0 0 400 400" className="h-full w-full" aria-hidden focusable="false">
      <defs>
        <clipPath id={clipId}>
          <path d={VESSEL} />
        </clipPath>
      </defs>

      {/* Weekly turns */}
      <SvgLabel x={32} y={56} opacity={0.6}>
        26 TURNS · ONE EACH WEEK
      </SvgLabel>
      {Array.from({ length: TURNS }, (_, i) => (
        <TurnTick key={i} progress={days} index={i} />
      ))}

      {/* Liquid and suspended botanicals, clipped to the vessel */}
      <g clipPath={`url(#${clipId})`}>
        <motion.rect
          x={80}
          y={LIQUID_TOP}
          width={140}
          height={LIQUID_BOTTOM - LIQUID_TOP}
          fill={CLAY}
          fillOpacity={0.1}
          style={{ scaleY: liquidScale, originY: 1 }}
        />
        <motion.g style={{ y: surfaceY, opacity: surfaceOpacity }}>
          <motion.path
            d={`M44 ${LIQUID_TOP} q 11 -3 22 0 t 22 0 t 22 0 t 22 0 t 22 0 t 22 0 t 22 0 t 22 0 t 22 0`}
            fill="none"
            stroke={CLAY}
            strokeWidth={1}
            animate={loops ? { x: [0, 22, 0] } : { x: 0 }}
            transition={loops ? { duration: 9, repeat: Infinity, ease: "easeInOut" } : { duration: 0.6 }}
          />
        </motion.g>
        <motion.g style={{ opacity: leaves }}>
          {SUSPENDED.map(([x, y, rot, s], i) => (
            <motion.g
              key={`${x}-${y}`}
              animate={loops ? { y: [0, -5, 0], rotate: [0, 6, 0] } : { y: 0, rotate: 0 }}
              transition={loops ? { duration: 8 + i * 1.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.6 } : { duration: 0.6 }}
            >
              <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
                <path d="M-14 0 C -6 -9, 6 -9, 14 0 C 6 9, -6 9, -14 0 Z" fill={SAGE} fillOpacity={0.22} stroke={SAGE} strokeWidth={0.9} />
                <path d="M-14 0 H14" stroke={SAGE} strokeWidth={0.6} />
              </g>
            </motion.g>
          ))}
        </motion.g>
      </g>

      {/* The vessel itself */}
      <motion.path d={VESSEL} {...LINE} style={{ pathLength: vessel }} />
      <motion.path d="M98 140 V300" stroke={INK} strokeOpacity={0.14} strokeWidth={3} strokeLinecap="round" style={{ pathLength: vessel }} />
      <motion.rect x={76} y={104} width={148} height={20} rx={2} {...LINE} stroke={BRASS} style={{ pathLength: vessel }} />
      <motion.path d="M140 104 V94 H160 V104" {...LINE} stroke={BRASS} style={{ pathLength: vessel }} />

      {/* Turned by hand */}
      <motion.g style={{ opacity: vessel }}>
        <path d="M78 352 Q150 372 222 352" fill="none" stroke={INK} strokeOpacity={0.45} strokeWidth={1} />
        <path d="M214 346 L222 352 L213 357" fill="none" stroke={INK} strokeOpacity={0.45} strokeWidth={1} strokeLinejoin="round" />
        <SvgLabel x={150} y={384} anchor="middle" opacity={0.6}>
          TURNED BY HAND
        </SvgLabel>
      </motion.g>

      {/* Thermometer */}
      <motion.rect x={278} y={78} width={16} height={226} rx={8} {...LINE} style={{ pathLength: vessel }} />
      <circle cx={286} cy={312} r={14} fill={PAPER} />
      <motion.circle cx={286} cy={312} r={14} {...LINE} style={{ pathLength: vessel }} />
      <circle cx={286} cy={312} r={9} fill={CLAY} fillOpacity={0.85} />
      <motion.rect
        x={283}
        y={tempToY(START_TEMP)}
        width={6}
        height={306 - tempToY(START_TEMP)}
        rx={3}
        fill={CLAY}
        fillOpacity={0.85}
        style={{ scaleY: columnScale, originY: 1 }}
      />
      {[10, 0, -10, -20, -30].map((c) => (
        <g key={c}>
          <line x1={298} y1={tempToY(c)} x2={c % 20 === 0 ? 308 : 304} y2={tempToY(c)} stroke={INK} strokeOpacity={0.55} strokeWidth={0.9} />
          <text
            x={312}
            y={tempToY(c) + 3}
            fill={INK}
            opacity={0.55}
            style={{ fontFamily: "var(--font-sans)", fontSize: 8, letterSpacing: "0.1em" }}
          >
            {c > 0 ? `+${c}` : c < 0 ? `−${Math.abs(c)}` : "0"}
          </text>
        </g>
      ))}
      <motion.g style={{ opacity: reading }}>
        <line x1={266} y1={tempToY(CELLAR_TEMP)} x2={274} y2={tempToY(CELLAR_TEMP)} stroke={BRASS} strokeWidth={1.5} strokeLinecap="round" />
      </motion.g>
      <motion.text
        x={340}
        y={tempToY(CELLAR_TEMP) + 8}
        fill={INK}
        style={{ fontFamily: "var(--font-serif)", fontSize: 24, fontWeight: 400 }}
      >
        {temperature}
      </motion.text>

      {/* Day counter */}
      <SvgLabel x={344} y={326} anchor="middle" opacity={0.6}>
        DAY
      </SvgLabel>
      <motion.text
        x={344}
        y={364}
        textAnchor="middle"
        fill={INK}
        style={{ fontFamily: "var(--font-serif)", fontSize: 38, fontWeight: 300, fontVariantNumeric: "tabular-nums lining-nums" }}
      >
        {dayCount}
      </motion.text>
      <line x1={318} y1={372} x2={370} y2={372} stroke={BRASS} strokeOpacity={0.7} strokeWidth={0.9} />

      <SvgImprint />
    </svg>
  );
}
