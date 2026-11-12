"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import type { CSSProperties, ReactNode } from "react";
import s from "@/components/chapters/provenance.module.css";
import { withBase } from "@/lib/base-path";
import { PALETTE } from "@/lib/palette";
import { groupThousands, type TerroirLot } from "@/lib/terroir-lots";

/*
 * The instrument ledger on the facing page of chapter III: a thermometer, the soil pH scale, the
 * sun's arc and the contour study. Each instrument is set from CSS custom properties written inline
 * from the lot, and only transform and stroke-dashoffset transition (900 ms, silk), so turning a page
 * moves the needles without a single React re-render beyond the turn itself. The readings are plain
 * text and swap instantly; reduced motion makes the transitions instant too (globals.css).
 */

type Vars = CSSProperties & Record<`--${string}`, string>;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const fixed = (v: number) => String(Math.round(v * 1000) / 1000);

/**
 * A deterministic SVG id, safe inside url(#…). Not useId: the lot pager hydrates as its own root
 * (book/islands.tsx), where useId would not reproduce the ids the page was prerendered with.
 * `key` keeps two instances apart (the outgoing and incoming sheets during a page turn).
 */
export function safeId(prefix: string, key = ""): string {
  return `${prefix}${key ? `-${key}` : ""}`.replace(/[^a-zA-Z0-9_-]/g, "");
}

export const contourSrc = (lot: TerroirLot) => withBase(`/plates/terroir/contour-${lot.number}.svg`);

function Cell({ label, reading, caption, children }: { label: string; reading: ReactNode; caption: string; children: ReactNode }) {
  return (
    <div className={s.cell}>
      <p className={s.cellLabel}>{label}</p>
      <p className={s.reading}>{reading}</p>
      <div className={s.instrument}>{children}</div>
      <p className={s.cellCaption}>{caption}</p>
    </div>
  );
}

/* --------------------------------------------------------------------------------- thermometer */

const T_MIN = 0;
const T_MAX = 60;
const T_TOP = 18;
const T_BOTTOM = 166;
const BULB_Y = 188;
const MERCURY_SPAN = BULB_Y - T_TOP + 4;
const tempY = (t: number) => T_BOTTOM - ((t - T_MIN) / (T_MAX - T_MIN)) * (T_BOTTOM - T_TOP);
const thermoTicks = (major: boolean) =>
  Array.from({ length: (T_MAX - T_MIN) / 5 + 1 }, (_, i) => T_MIN + i * 5)
    .filter((t) => (t % 10 === 0) === major)
    .map((t) => `M46 ${fixed(tempY(t))}H${major ? 53 : 50}`)
    .join("");
const THERMO_MAJOR = thermoTicks(true);
const THERMO_MINOR = thermoTicks(false);

function Thermometer({ celsius }: { celsius: number }) {
  const level = tempY(Math.min(T_MAX, Math.max(T_MIN, celsius)));
  const vars: Vars = { "--fill": fixed((BULB_Y - level) / MERCURY_SPAN), "--level": fixed(level) };
  return (
    <svg viewBox="0 0 84 208" className={s.thermo} style={vars} aria-hidden="true">
      <rect x="27" y="8" width="14" height="172" rx="7" className={s.glass} />
      <circle cx="34" cy={BULB_Y} r="14" className={s.glass} />
      <rect x="31" y={T_TOP - 4} width="6" height={MERCURY_SPAN} rx="3" className={s.mercury} />
      <circle cx="34" cy={BULB_Y} r="9.5" className={s.bulb} />
      <path d={`M30 14V${T_BOTTOM}`} className={s.glint} />
      <path d={THERMO_MINOR} className={s.tickMinor} />
      <path d={THERMO_MAJOR} className={s.tickMajor} />
      {[0, 20, 40, 60].map((t) => (
        <text key={t} x="57" y={fixed(tempY(t) + 3)} className={s.thermoNumber}>
          {t}°
        </text>
      ))}
      <path d="M10 0H25M6 -3L11 0L6 3Z" className={s.thermoIndex} />
    </svg>
  );
}

/* ------------------------------------------------------------------------------------- soil pH */

const PH_TICKS = (major: boolean) =>
  Array.from({ length: 15 }, (_, i) => i)
    .filter((i) => (i % 7 === 0) === major)
    .map((i) => `M${i * 10 + 0.5} 0V${major ? 10 : 6}`)
    .join("");
const PH_MAJOR = PH_TICKS(true);
const PH_MINOR = PH_TICKS(false);

function PhScale({ ph }: { ph: number }) {
  return (
    <div className={s.ph} style={{ "--pct": fixed(clamp01(ph / 14) * 100) } as Vars}>
      <div className={s.phBar} aria-hidden="true">
        <div className={s.phTrack} />
        <svg className={s.phTicks} viewBox="0 0 141 10" preserveAspectRatio="none">
          <path d={PH_MINOR} className={s.tickMinor} vectorEffect="non-scaling-stroke" />
          <path d={PH_MAJOR} className={s.tickMajor} vectorEffect="non-scaling-stroke" />
        </svg>
        <div className={s.phMarker}>
          <svg viewBox="0 0 12 10" className={s.phPin}>
            <path d="M0 0H12L6 10Z" />
          </svg>
        </div>
      </div>
      <p className={s.phLabels}>
        <span>acid · 0</span>
        <span>neutral · 7</span>
        <span>alkaline · 14</span>
      </p>
    </div>
  );
}

/* ----------------------------------------------------------------------------------- sun a year */

const ARC_CX = 110;
const ARC_CY = 112;
const ARC_R = 92;
const SUN_ARC = `M${ARC_CX - ARC_R} ${ARC_CY}A${ARC_R} ${ARC_R} 0 0 1 ${ARC_CX + ARC_R} ${ARC_CY}`;
const sunTicks = (major: boolean) =>
  Array.from({ length: 13 }, (_, i) => i)
    .filter((i) => (i % 3 === 0) === major)
    .map((i) => {
      const a = Math.PI * (i / 12);
      const inner = ARC_R - (major ? 9 : 5);
      const c = Math.cos(a);
      const n = Math.sin(a);
      return `M${fixed(ARC_CX - c * inner)} ${fixed(ARC_CY - n * inner)}L${fixed(ARC_CX - c * (ARC_R - 2))} ${fixed(ARC_CY - n * (ARC_R - 2))}`;
    })
    .join("");
const SUN_MAJOR = sunTicks(true);
const SUN_MINOR = sunTicks(false);
/** The sun sits at dawn, the arc's left end; CSS turns it about the arc's centre by --f × 180°. */
const SUN_RAYS = Array.from({ length: 8 }, (_, i) => {
  const a = (i / 8) * Math.PI * 2;
  const x = ARC_CX - ARC_R;
  return `M${fixed(x + Math.cos(a) * 9)} ${fixed(ARC_CY + Math.sin(a) * 9)}L${fixed(x + Math.cos(a) * 13)} ${fixed(ARC_CY + Math.sin(a) * 13)}`;
}).join("");

function SunArc({ fraction }: { fraction: number }) {
  const gradId = safeId("sun-grad");
  return (
    <div className={s.sun}>
      <svg viewBox="0 0 220 128" className={s.sunSvg} style={{ "--f": fixed(clamp01(fraction)) } as Vars} aria-hidden="true">
        <defs>
          <linearGradient id={gradId} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#c8694b" />
            <stop offset="1" stopColor={PALETTE.brassLight} />
          </linearGradient>
        </defs>
        <path d={`M6 ${ARC_CY}H214`} className={s.sunBase} />
        <path d={SUN_ARC} className={s.sunDots} />
        <path d={SUN_MINOR} className={s.tickMinor} />
        <path d={SUN_MAJOR} className={s.tickMajor} />
        <path d={SUN_ARC} pathLength={1} className={s.sunArc} stroke={`url(#${gradId})`} />
        <g className={s.sunBody}>
          <circle cx={ARC_CX - ARC_R} cy={ARC_CY} r="6" className={s.sunDisc} />
          <path d={SUN_RAYS} className={s.sunRays} />
        </g>
      </svg>
      <p className={s.sunLabels}>
        <span>dawn</span>
        <span>dusk</span>
      </p>
    </div>
  );
}

/** The four readouts, laid out as a ledger of spacing alone: 2 × 2 from 640 px, one column below. */
export function InstrumentLedger({ lot }: { lot: TerroirLot }) {
  const altitude = groupThousands(lot.altitudeM);
  return (
    <div className={s.ledger}>
      <Cell
        label="distillation"
        reading={
          <>
            {lot.distillationC}
            <span className={s.unit}> °C</span>
          </>
        }
        caption="Cold vacuum distillation, kept low so the brightest notes survive the still."
      >
        <div className={s.thermoRow}>
          <Thermometer celsius={lot.distillationC} />
          <p className={s.thermoAside}>Far below a kitchen simmer. The plant is coaxed, never cooked.</p>
        </div>
      </Cell>

      <Cell label="soil pH" reading={lot.soilPh.toFixed(1)} caption="Measured in the root zone on the morning of harvest.">
        <PhScale ph={lot.soilPh} />
      </Cell>

      <Cell
        label="sun a year"
        reading={
          <>
            {groupThousands(lot.solarHours)}
            <span className={s.unit}> h</span>
          </>
        }
        caption={`${Math.round(lot.solarFraction * 100)}% of that light reaches the plants through slope and canopy.`}
      >
        <SunArc fraction={lot.solarFraction} />
      </Cell>

      <Cell
        label="altitude"
        reading={
          <>
            {altitude}
            <span className={s.unit}> m</span>
          </>
        }
        caption={`summit at ${altitude} m · the bar is about 500 m`}
      >
        <img
          className={s.contour}
          src={contourSrc(lot)}
          width={440}
          height={300}
          loading="lazy"
          decoding="async"
          alt="Contour study around the harvest point"
        />
      </Cell>
    </div>
  );
}
