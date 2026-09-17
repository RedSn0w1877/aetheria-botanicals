"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { useEffect, useId, useMemo, useRef, type ReactNode, type RefObject } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { EASE_DRIFT, EASE_SILK } from "@/lib/motion";
import { groupThousands } from "@/lib/terroir-lots";
import { RollingNumber } from "./rolling-number";
import { contourRings } from "./seeded";

/* -------------------------------------------------------------------------- */
/* Shared plumbing                                                            */
/* -------------------------------------------------------------------------- */

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** useId output is not always valid inside url(#…); keep it to safe characters. */
export function useSafeId(prefix: string): string {
  const raw = useId();
  return `${prefix}-${raw.replace(/[^a-zA-Z0-9_-]/g, "")}`;
}

/**
 * Instruments stay at rest until they first scroll into view, then track every change.
 * Reduced-motion visitors get the settled reading straight away.
 */
function useArmed(ref: RefObject<Element | null>): { armed: boolean; reduce: boolean } {
  const reduce = useReducedMotion() ?? false;
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  return { armed: reduce || inView, reduce };
}

/** A ruled editorial cell: microcopy label, big serif reading, then the instrument. */
export function InstrumentCell({
  label,
  reading,
  caption,
  children,
  className,
}: {
  label: string;
  reading: ReactNode;
  caption: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex min-w-0 flex-col gap-4 border-t border-linen/15 pt-5 ${className ?? ""}`}>
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-linen/60">{label}</p>
        <p className="font-serif text-[clamp(1.9rem,3.2vw,2.6rem)] font-light leading-none tracking-tight text-linen">
          {reading}
        </p>
      </div>
      <div className="min-w-0">{children}</div>
      <p className="font-sans text-[12px] font-light leading-relaxed text-linen/65">{caption}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Thermometer                                                                */
/* -------------------------------------------------------------------------- */

const T_MIN = 0;
const T_MAX = 60;
const T_TOP = 18;
const T_BOTTOM = 166;
const BULB_Y = 188;

export function ThermometerGauge({ celsius }: { celsius: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const { armed, reduce } = useArmed(ref);
  const yFor = (t: number) => T_BOTTOM - ((t - T_MIN) / (T_MAX - T_MIN)) * (T_BOTTOM - T_TOP);
  const level = yFor(Math.min(T_MAX, Math.max(T_MIN, celsius)));
  const span = BULB_Y - T_TOP + 4;
  const fill = (BULB_Y - level) / span;
  const ticks = Array.from({ length: (T_MAX - T_MIN) / 5 + 1 }, (_, i) => T_MIN + i * 5);
  const transition = { duration: reduce ? 0 : 1.8, ease: EASE_SILK };

  return (
    <svg ref={ref} viewBox="0 0 84 208" className="h-48 w-auto overflow-visible" role="img" aria-label={`Thermometer reading ${celsius} degrees Celsius`}>
      {/* Glass tube and bulb */}
      <rect x="27" y="8" width="14" height="172" rx="7" fill="none" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1" />
      <circle cx="34" cy={BULB_Y} r="14" fill="none" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1" />
      {/* Mercury: a slender column that rises from the bulb */}
      <motion.rect
        x="31"
        y={T_TOP - 4}
        width="6"
        height={span}
        rx="3"
        className="fill-terracotta"
        style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
        initial={false}
        animate={{ scaleY: armed ? fill : 0.08 }}
        transition={transition}
      />
      <motion.circle
        cx="34"
        cy={BULB_Y}
        r="9.5"
        className="fill-terracotta"
        initial={false}
        animate={{ opacity: armed ? 1 : 0.5 }}
        transition={{ duration: 1.2 }}
      />
      {/* Glass highlight */}
      <path d={`M30 14 L30 ${T_BOTTOM}`} stroke="currentColor" strokeOpacity="0.18" strokeWidth="1" strokeLinecap="round" />
      {/* Scale */}
      {ticks.map((t) => (
        <line
          key={t}
          x1="46"
          x2={t % 10 === 0 ? 53 : 50}
          y1={yFor(t)}
          y2={yFor(t)}
          stroke="currentColor"
          strokeOpacity={t % 10 === 0 ? 0.55 : 0.3}
          strokeWidth="0.8"
        />
      ))}
      {[0, 20, 40, 60].map((t) => (
        <text key={t} x="57" y={yFor(t) + 2.6} fontSize="8" className="fill-current font-sans" fillOpacity="0.55">
          {t}°
        </text>
      ))}
      {/* Brass index marking the reading */}
      <motion.g initial={false} animate={{ y: armed ? level : T_BOTTOM }} transition={transition}>
        <line x1="10" x2="25" y1="0" y2="0" className="stroke-brass" strokeWidth="1" />
        <path d="M6 -3 L11 0 L6 3 Z" className="fill-brass" />
      </motion.g>
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* Soil pH                                                                    */
/* -------------------------------------------------------------------------- */

export function PhScale({ ph }: { ph: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { armed, reduce } = useArmed(ref);
  const pct = clamp01(ph / 14) * 100;

  return (
    <div ref={ref} role="img" aria-label={`Soil pH ${ph.toFixed(1)} on a scale from 0 to 14`} className="select-none">
      {/* The padded, clipped frame keeps the travelling marker from ever widening the page. */}
      <div className="relative overflow-hidden px-3 pb-4 pt-7">
        <div className="relative">
          <div className="h-[6px] w-full rounded-full bg-[linear-gradient(90deg,var(--color-terracotta)_0%,var(--color-sage)_50%,var(--color-brass)_100%)]" />
          <div className="absolute inset-x-0 top-full mt-1 flex justify-between">
            {Array.from({ length: 15 }, (_, i) => (
              <span key={i} className={`w-px bg-linen ${i % 7 === 0 ? "h-2.5 opacity-60" : "h-1.5 opacity-30"}`} />
            ))}
          </div>
          <motion.div
            className="pointer-events-none absolute inset-y-0 left-0 w-full"
            initial={false}
            animate={{ x: `${armed ? pct : 50}%` }}
            transition={{ duration: reduce ? 0 : 1.9, ease: EASE_SILK }}
          >
            <div className="absolute bottom-[-6px] left-0 flex -translate-x-1/2 flex-col items-center">
              <svg viewBox="0 0 12 10" className="h-2.5 w-3 fill-linen" aria-hidden>
                <path d="M0 0 H12 L6 10 Z" />
              </svg>
              <span className="h-[18px] w-px bg-linen" />
            </div>
          </motion.div>
        </div>
      </div>
      <div className="mt-1 flex justify-between px-3 font-sans text-[10px] uppercase tracking-[0.2em] text-linen/55">
        <span>0 · Acid</span>
        <span>7 · Neutral</span>
        <span>Alkaline · 14</span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Solar exposure                                                             */
/* -------------------------------------------------------------------------- */

const ARC_CX = 110;
const ARC_CY = 112;
const ARC_R = 92;

export function SunArc({ fraction }: { fraction: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const { armed, reduce } = useArmed(ref);
  const gradId = useSafeId("sun-grad");
  const f = useMotionValue(0);
  const sunX = useTransform(f, (v) => ARC_CX - ARC_R * Math.cos(Math.PI * v));
  const sunY = useTransform(f, (v) => ARC_CY - ARC_R * Math.sin(Math.PI * v));

  useEffect(() => {
    if (!armed) return;
    const target = clamp01(fraction);
    if (reduce) {
      f.jump(target);
      return;
    }
    const controls = animate(f, target, { duration: 2.1, ease: EASE_SILK });
    return () => controls.stop();
  }, [armed, fraction, reduce, f]);

  const arc = `M${ARC_CX - ARC_R} ${ARC_CY} A${ARC_R} ${ARC_R} 0 0 1 ${ARC_CX + ARC_R} ${ARC_CY}`;
  const ticks = Array.from({ length: 13 }, (_, i) => {
    const a = Math.PI * (i / 12);
    const inner = ARC_R - (i % 3 === 0 ? 9 : 5);
    return {
      x1: Math.round((ARC_CX - Math.cos(a) * inner) * 1000) / 1000,
      y1: Math.round((ARC_CY - Math.sin(a) * inner) * 1000) / 1000,
      x2: Math.round((ARC_CX - Math.cos(a) * (ARC_R - 2)) * 1000) / 1000,
      y2: Math.round((ARC_CY - Math.sin(a) * (ARC_R - 2)) * 1000) / 1000,
      major: i % 3 === 0,
    };
  });
  const rays = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2;
    return `M${(Math.cos(a) * 9).toFixed(2)} ${(Math.sin(a) * 9).toFixed(2)}L${(Math.cos(a) * 13).toFixed(2)} ${(Math.sin(a) * 13).toFixed(2)}`;
  });

  return (
    <svg
      ref={ref}
      viewBox="0 0 220 128"
      className="w-full max-w-[320px] overflow-visible"
      role="img"
      aria-label={`${Math.round(fraction * 100)} percent of the available sunlight reaches the plants`}
    >
      <defs>
        <linearGradient id={gradId} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="var(--color-terracotta)" />
          <stop offset="100%" stopColor="var(--color-brass)" />
        </linearGradient>
      </defs>
      <line x1="6" x2="214" y1={ARC_CY} y2={ARC_CY} stroke="currentColor" strokeOpacity="0.3" strokeWidth="0.8" />
      <path d={arc} fill="none" stroke="currentColor" strokeOpacity="0.16" strokeWidth="1" strokeDasharray="2 4" />
      {ticks.map((t, i) => (
        <line
          key={i}
          x1={t.x1.toFixed(2)}
          y1={t.y1.toFixed(2)}
          x2={t.x2.toFixed(2)}
          y2={t.y2.toFixed(2)}
          stroke="currentColor"
          strokeOpacity={t.major ? 0.5 : 0.22}
          strokeWidth="0.8"
        />
      ))}
      <motion.path d={arc} fill="none" stroke={`url(#${gradId})`} strokeWidth="2.4" strokeLinecap="round" style={{ pathLength: f }} />
      <motion.g style={{ x: sunX, y: sunY }}>
        <circle r="6" className="fill-brass" />
        <circle r="6" fill="none" stroke="var(--color-linen)" strokeOpacity="0.6" strokeWidth="0.6" />
        {rays.map((d) => (
          <path key={d} d={d} className="stroke-brass" strokeWidth="1" strokeLinecap="round" />
        ))}
      </motion.g>
      <text x="6" y="124" fontSize="7" className="fill-current font-sans" fillOpacity="0.5" letterSpacing="1.4">
        DAWN
      </text>
      <text x="214" y="124" fontSize="7" textAnchor="end" className="fill-current font-sans" fillOpacity="0.5" letterSpacing="1.4">
        DUSK
      </text>
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* Altitude: a small topographic study                                        */
/* -------------------------------------------------------------------------- */

const MAP_W = 220;
const MAP_H = 150;

export function ContourStudy({ seedKey, altitudeM }: { seedKey: string; altitudeM: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const { armed, reduce } = useArmed(ref);
  const clipId = useSafeId("contour-clip");
  const { rings, summit } = useMemo(() => contourRings(seedKey, altitudeM, MAP_W, MAP_H), [seedKey, altitudeM]);
  const labelLeft = summit[0] > MAP_W / 2;
  const lx = summit[0] + (labelLeft ? -14 : 14);
  const label = `${groupThousands(altitudeM)} m`;

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      className="w-full"
      role="img"
      aria-label={`Contour study of the harvest site, summit at ${label}`}
    >
      <defs>
        <clipPath id={clipId}>
          <rect x="0.5" y="0.5" width={MAP_W - 1} height={MAP_H - 1} />
        </clipPath>
      </defs>
      <rect x="0.5" y="0.5" width={MAP_W - 1} height={MAP_H - 1} fill="none" stroke="currentColor" strokeOpacity="0.22" />
      <g clipPath={`url(#${clipId})`}>
        <AnimatePresence initial={false}>
          <motion.g
            key={seedKey}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.6, ease: EASE_DRIFT } }}
          >
            {rings.map((ring, i) => (
              <motion.path
                key={i}
                d={ring.d}
                fill="none"
                stroke="currentColor"
                strokeOpacity={ring.index ? 0.8 : 0.36}
                strokeWidth={ring.index ? 0.9 : 0.5}
                initial={reduce ? false : { pathLength: 0 }}
                animate={{ pathLength: armed ? 1 : 0 }}
                transition={{ duration: 1.8, ease: EASE_SILK, delay: 0.15 + (rings.length - i) * 0.09 }}
              />
            ))}
          </motion.g>
        </AnimatePresence>
      </g>
      {/* Summit marker and elevation label */}
      <motion.g
        key={`mark-${seedKey}`}
        initial={reduce ? false : { opacity: 0, y: 6 }}
        animate={armed ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
        transition={{ duration: 1.1, ease: EASE_SILK, delay: reduce ? 0 : 1.1 }}
      >
        <path
          d={`M${summit[0].toFixed(2)} ${(summit[1] - 4.5).toFixed(2)} l4 7 h-8 Z`}
          className="fill-terracotta"
        />
        <line
          x1={summit[0].toFixed(2)}
          x2={lx.toFixed(2)}
          y1={(summit[1] - 2).toFixed(2)}
          y2={(summit[1] - 14).toFixed(2)}
          className="stroke-brass"
          strokeWidth="0.7"
        />
        <text
          x={(lx + (labelLeft ? -2 : 2)).toFixed(2)}
          y={(summit[1] - 16).toFixed(2)}
          fontSize="8.5"
          textAnchor={labelLeft ? "end" : "start"}
          className="fill-brass font-sans"
          letterSpacing="1"
        >
          {label.toUpperCase()}
        </text>
      </motion.g>
      {/* North arrow and scale bar */}
      <g className="text-linen" opacity="0.6">
        <path d="M204 22 L208 10 L212 22 L208 19 Z" fill="currentColor" />
        <text x="208" y="32" fontSize="6.5" textAnchor="middle" className="fill-current font-sans">
          N
        </text>
        <line x1="10" x2="50" y1="140" y2="140" stroke="currentColor" strokeWidth="0.8" />
        <line x1="10" x2="10" y1="137" y2="140" stroke="currentColor" strokeWidth="0.8" />
        <line x1="50" x2="50" y1="137" y2="140" stroke="currentColor" strokeWidth="0.8" />
        <text x="54" y="142" fontSize="6" className="fill-current font-sans" letterSpacing="0.8">
          ≈ 500 M
        </text>
      </g>
      <text x={MAP_W - 6} y={MAP_H - 6} fontSize="5" textAnchor="end" className="fill-current font-sans" fillOpacity="0.4">
        © 2026 HVNF Studios
      </text>
    </svg>
  );
}

/** The four readouts, laid out as an editorial 2 × 2 ledger. */
export function InstrumentLedger({
  code,
  celsius,
  ph,
  solarHours,
  solarFraction,
  altitudeM,
}: {
  code: string;
  celsius: number;
  ph: number;
  solarHours: number;
  solarFraction: number;
  altitudeM: number;
}) {
  return (
    <div className="grid min-w-0 gap-x-10 gap-y-10 sm:grid-cols-2">
      <InstrumentCell
        label="Distillation"
        reading={
          <>
            <RollingNumber value={celsius} />
            <span className="ml-1 text-[0.55em] text-linen/60">°C</span>
          </>
        }
        caption="Cold vacuum distillation. Kept low so the brightest notes survive the still."
      >
        <div className="flex items-center gap-6 text-linen">
          <ThermometerGauge celsius={celsius} />
          <p className="max-w-[12rem] font-serif text-lg font-light italic leading-snug text-linen/75">
            Far below a kitchen simmer. The plant is coaxed, never cooked.
          </p>
        </div>
      </InstrumentCell>

      <InstrumentCell
        label="Soil pH"
        reading={<RollingNumber value={ph} decimals={1} />}
        caption="Measured in the root zone on the morning of harvest."
      >
        <PhScale ph={ph} />
      </InstrumentCell>

      <InstrumentCell
        label="Sun a year"
        reading={
          <>
            <RollingNumber value={solarHours} grouped />
            <span className="ml-1 text-[0.5em] text-linen/60">h</span>
          </>
        }
        caption={
          <>
            <RollingNumber value={Math.round(solarFraction * 100)} />% of that light reaches the plants through slope and canopy.
          </>
        }
      >
        <div className="text-linen">
          <SunArc fraction={solarFraction} />
        </div>
      </InstrumentCell>

      <InstrumentCell
        label="Altitude"
        reading={
          <>
            <RollingNumber value={altitudeM} grouped />
            <span className="ml-1 text-[0.5em] text-linen/60">m</span>
          </>
        }
        caption="A survey sketch of the slope around the harvest point. Heavier lines are index contours."
      >
        <div className="text-linen">
          <ContourStudy seedKey={code} altitudeM={altitudeM} />
        </div>
      </InstrumentCell>
    </div>
  );
}
