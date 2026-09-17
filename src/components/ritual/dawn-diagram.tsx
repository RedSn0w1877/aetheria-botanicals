"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { motion, useTransform } from "motion/react";
import { useId, useRef } from "react";
import { BRASS, CLAY, INK, LINE, PAPER, SAGE, SvgImprint, SvgLabel, useIdleLoops, useSegment, type DiagramProps } from "./diagram-kit";

/** Wild stems on the slope: [base x, base y, height, cut?]. One in five is taken. */
const FIELD_STEMS: ReadonlyArray<readonly [number, number, number, boolean]> = [
  [222, 271, 34, false],
  [238, 273, 40, false],
  [254, 274, 30, false],
  [270, 275, 38, false],
  [286, 275, 12, true],
  [302, 274, 36, false],
  [318, 272, 31, false],
  [334, 270, 42, false],
  [350, 266, 33, false],
  [366, 262, 12, true],
];

/** Stems already cut and resting in the basket. */
const BASKET_STEMS = [
  { d: "M86 320 C 82 298, 76 284, 64 272", bud: [64, 272] },
  { d: "M100 320 C 98 292, 96 274, 92 256", bud: [92, 256] },
  { d: "M118 320 C 122 296, 128 280, 140 266", bud: [140, 266] },
  { d: "M134 320 C 142 302, 154 292, 168 286", bud: [168, 286] },
] as const;

const ARC_RADIUS = 150;
const ARC_CX = 220;
const ARC_CY = 280;

/**
 * Plate I — the sun climbs its arc over the ridge while the harvest window
 * ticks from 05:10 to 07:00, the slope's stems draw in and the willow basket fills.
 */
export function DawnDiagram({ progress }: DiagramProps) {
  const ref = useRef<SVGSVGElement>(null);
  const loops = useIdleLoops(ref);
  const clipId = `ritual-basket-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const arc = useSegment(progress, 0, 0.35);
  const ridge = useSegment(progress, 0.05, 0.4);
  const rise = useSegment(progress, 0.12, 0.85);
  const rays = useSegment(progress, 0.6, 0.92);
  const field = useSegment(progress, 0.3, 0.7);
  const basket = useSegment(progress, 0.4, 0.75);
  const cut = useSegment(progress, 0.6, 0.98);
  const clock = useSegment(progress, 0, 1);

  // The sun travels along the arc, from the horizon (180°) up to 118°.
  const sunX = useTransform(rise, (t) => ARC_CX + ARC_RADIUS * Math.cos(((180 - 62 * t) * Math.PI) / 180));
  const sunY = useTransform(rise, (t) => ARC_CY - ARC_RADIUS * Math.sin(((180 - 62 * t) * Math.PI) / 180));
  const markerX = useTransform(clock, [0, 1], [24, 376]);
  const minutes = useTransform(clock, (t) => {
    const total = 5 * 60 + 10 + Math.round(t * 110);
    const h = Math.floor(total / 60);
    const m = total % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  });

  return (
    <svg ref={ref} viewBox="0 0 400 400" className="h-full w-full" aria-hidden focusable="false">
      {/* Harvest window timeline */}
      <SvgLabel x={24} y={30} opacity={0.6}>
        05:10
      </SvgLabel>
      <SvgLabel x={376} y={30} anchor="end" opacity={0.6}>
        07:00
      </SvgLabel>
      <line x1={24} y1={42} x2={376} y2={42} stroke={INK} strokeOpacity={0.2} strokeWidth={1} />
      <motion.line x1={24} y1={42} x2={376} y2={42} stroke={BRASS} strokeWidth={1.25} style={{ pathLength: clock }} />
      <motion.g style={{ x: markerX }}>
        <line x1={0} y1={37} x2={0} y2={47} stroke={BRASS} strokeWidth={1.25} />
        <motion.text
          x={0}
          y={62}
          textAnchor="middle"
          fill={INK}
          style={{ fontFamily: "var(--font-serif)", fontSize: 13, fontStyle: "italic" }}
        >
          {minutes}
        </motion.text>
      </motion.g>

      {/* The sun's path across the sky */}
      <motion.path
        d={`M${ARC_CX - ARC_RADIUS} ${ARC_CY} A${ARC_RADIUS} ${ARC_RADIUS} 0 0 1 ${ARC_CX + ARC_RADIUS} ${ARC_CY}`}
        fill="none"
        stroke={BRASS}
        strokeWidth={1}
        strokeDasharray="1 7"
        strokeLinecap="round"
        style={{ opacity: arc }}
      />

      {/* The sun, rising behind the ridges */}
      <motion.g style={{ x: sunX, y: sunY }}>
        <motion.g
          style={{ opacity: rays }}
          animate={loops ? { scale: [1, 1.08, 1] } : { scale: 1 }}
          transition={loops ? { duration: 7, repeat: Infinity, ease: "easeInOut" } : { duration: 0.6 }}
        >
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i * Math.PI) / 6;
            return (
              <line
                key={i}
                x1={Math.round((Math.cos(a) * 33) * 1000) / 1000}
                y1={Math.round((Math.sin(a) * 33) * 1000) / 1000}
                x2={Math.round((Math.cos(a) * (i % 2 ? 39 : 44)) * 1000) / 1000}
                y2={Math.round((Math.sin(a) * (i % 2 ? 39 : 44)) * 1000) / 1000}
                stroke={CLAY}
                strokeWidth={1}
                strokeLinecap="round"
              />
            );
          })}
        </motion.g>
        <circle r={26} fill={CLAY} fillOpacity={0.1} stroke={CLAY} strokeWidth={1.25} />
        <circle r={18} fill="none" stroke={CLAY} strokeOpacity={0.45} strokeWidth={0.75} />
      </motion.g>

      {/* Far ridge */}
      <path d="M0 232 C 70 214, 130 222, 200 206 S 320 200, 400 218 V400 H0 Z" fill={PAPER} />
      <motion.path
        d="M0 232 C 70 214, 130 222, 200 206 S 320 200, 400 218"
        {...LINE}
        stroke={SAGE}
        strokeWidth={1}
        style={{ pathLength: ridge }}
      />

      {/* Near hill */}
      <path d="M0 262 C 60 238, 120 246, 180 262 S 300 286, 400 250 V400 H0 Z" fill={PAPER} />
      <motion.path d="M0 262 C 60 238, 120 246, 180 262 S 300 286, 400 250" {...LINE} style={{ pathLength: ridge }} />

      {/* Wild stems on the slope — two of the ten are cut */}
      {FIELD_STEMS.map(([x, y, h, isCut], i) => (
        <motion.g
          key={x}
          style={{ originX: 0.5, originY: 1 }}
          animate={loops && !isCut ? { rotate: [-2.5, 2.5, -2.5] } : { rotate: 0 }}
          transition={loops && !isCut ? { duration: 6 + (i % 4) * 0.8, repeat: Infinity, ease: "easeInOut" } : { duration: 0.8 }}
        >
          <motion.path d={`M${x} ${y} L${x} ${y - h}`} {...LINE} strokeWidth={1} style={{ pathLength: field }} />
          {isCut ? (
            <motion.path
              d={`M${x - 4} ${y - h + 2} L${x + 4} ${y - h - 2}`}
              stroke={BRASS}
              strokeWidth={1.5}
              strokeLinecap="round"
              style={{ opacity: cut }}
            />
          ) : (
            <motion.g style={{ opacity: field }}>
              <path
                d={`M${x} ${y - h * 0.45} q 7 -3 9 -10 q -7 1 -9 10`}
                fill={SAGE}
                fillOpacity={0.25}
                stroke={SAGE}
                strokeWidth={0.8}
              />
              <circle cx={x} cy={y - h - 2.5} r={2.5} fill={CLAY} fillOpacity={0.85} />
            </motion.g>
          )}
        </motion.g>
      ))}
      <motion.g style={{ opacity: cut }}>
        <line x1={326} y1={306} x2={366} y2={272} stroke={INK} strokeOpacity={0.35} strokeWidth={0.75} />
        <line x1={306} y1={306} x2={288} y2={282} stroke={INK} strokeOpacity={0.35} strokeWidth={0.75} />
        <SvgLabel x={316} y={320} anchor="middle" opacity={0.75}>
          ONE IN FIVE
        </SvgLabel>
      </motion.g>

      {/* Cut stems resting in the basket */}
      {BASKET_STEMS.map((stem) => (
        <g key={stem.d}>
          <motion.path d={stem.d} {...LINE} strokeWidth={1} style={{ pathLength: cut }} />
          <motion.circle cx={stem.bud[0]} cy={stem.bud[1]} r={3.2} fill={CLAY} style={{ opacity: cut }} />
        </g>
      ))}

      {/* Woven willow basket */}
      <defs>
        <clipPath id={clipId}>
          <path d="M48 320 C 52 352, 66 374, 110 374 C 154 374, 168 352, 172 320 Z" />
        </clipPath>
      </defs>
      <motion.g style={{ opacity: basket }}>
        <path d="M48 320 C 52 352, 66 374, 110 374 C 154 374, 168 352, 172 320 Z" fill={PAPER} />
        <g clipPath={`url(#${clipId})`} stroke={BRASS} strokeWidth={0.9} fill="none">
          {[332, 344, 356, 368].map((y) => (
            <path key={y} d={`M40 ${y} Q 110 ${y + 8} 180 ${y}`} />
          ))}
          {[58, 72, 86, 100, 114, 128, 142, 156].map((x) => (
            <path key={x} d={`M${x + (x - 110) * 0.1} 318 Q ${x} 350 ${110 + (x - 110) * 0.7} 378`} strokeOpacity={0.7} />
          ))}
        </g>
      </motion.g>
      <motion.path
        d="M48 320 C 52 352, 66 374, 110 374 C 154 374, 168 352, 172 320"
        {...LINE}
        style={{ pathLength: basket }}
      />
      <motion.ellipse cx={110} cy={320} rx={62} ry={9} {...LINE} style={{ pathLength: basket }} />
      <motion.path d="M56 318 C 58 270, 162 270, 164 318" {...LINE} stroke={BRASS} style={{ pathLength: basket }} />
      <motion.g style={{ opacity: basket }}>
        <SvgLabel x={188} y={360} opacity={0.6}>
          WOVEN WILLOW
        </SvgLabel>
      </motion.g>

      <SvgImprint />
    </svg>
  );
}
