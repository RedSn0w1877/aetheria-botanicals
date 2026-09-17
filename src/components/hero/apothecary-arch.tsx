"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { LazyFlacon } from "@/components/three/lazy-flacon";
import { COPYRIGHT_MARK } from "@/lib/copyright";
import { heroFlacon } from "@/lib/flacon-store";
import { BotanicalDrawing } from "./botanical-drawing";

/**
 * The apothecary cabinet: an arched niche (a 5 × 7 box whose top edge is a full
 * semicircle) holding the 3D flacon, with brass graduations etched around the arch
 * like a measuring vessel, a herbarium drawing growing around it, and a specimen
 * label underneath.
 *
 * Tick geometry uses a 500 × 700 viewBox that matches the box's aspect ratio exactly,
 * so the SVG scales uniformly and the ticks sit precisely on the rounded border.
 */

const W = 500;
const R = W / 2;
const CX = R;
const CY = R;
const f = (n: number) => n.toFixed(2);

type Tick = { d: string; major: boolean };
type Label = { x: number; y: number; text: string };

function buildArcTicks(): Tick[] {
  const ticks: Tick[] = [];
  const count = 40;
  for (let i = 0; i <= count; i += 1) {
    const angle = Math.PI + (i / count) * Math.PI;
    const major = i % 5 === 0;
    const r0 = R - 7;
    const r1 = r0 - (major ? 16 : 8);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    ticks.push({
      d: `M${f(CX + r0 * cos)} ${f(CY + r0 * sin)} L${f(CX + r1 * cos)} ${f(CY + r1 * sin)}`,
      major,
    });
  }
  return ticks;
}

function buildGraduation(): { ticks: Tick[]; labels: Label[] } {
  const ticks: Tick[] = [];
  const labels: Label[] = [];
  const top = 300;
  const step = 9;
  const steps = 40;
  for (let i = 0; i <= steps; i += 1) {
    const y = top + i * step;
    const major = i % 10 === 0;
    const mid = i % 5 === 0;
    const length = major ? 20 : mid ? 13 : 7;
    ticks.push({ d: `M${W - 7} ${y} L${W - 7 - length} ${y}`, major });
    if (major) labels.push({ x: W - 34, y: y + 4, text: String(100 - (i / steps) * 100) });
  }
  // A sparser column down the left side.
  for (let i = 0; i <= 20; i += 1) {
    const y = top + i * step * 2;
    const major = i % 5 === 0;
    ticks.push({ d: `M7 ${y} L${7 + (major ? 13 : 6)} ${y}`, major });
  }
  return { ticks, labels };
}

const ARC_TICKS = buildArcTicks();
const GRADUATION = buildGraduation();

export function ApothecaryArch({ drawingKey, drawingDelay }: { drawingKey: string; drawingDelay: number }) {
  return (
    <figure className="relative mx-auto flex w-full flex-col items-center">
      <div data-hero-arch className="relative aspect-[5/7] w-[min(100%,330px)] sm:w-[360px] lg:w-[min(40vh,380px)]">
        {/* The niche itself. */}
        <div className="absolute inset-0 overflow-hidden rounded-t-full border border-hairline bg-gradient-to-b from-parchment via-parchment to-herb">
          {/* Cabinet shelf: the flacon stands on a brass-edged ledge. */}
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-[17%] border-t border-brass/40 bg-herb" />
          <div aria-hidden className="absolute inset-x-[12%] bottom-[17%] h-3 translate-y-full bg-gradient-to-b from-rosemary/10 to-transparent" />
          <div className="absolute inset-0">
            <LazyFlacon source={heroFlacon} variant="hero" parallax={0.6} motes={90} className="h-full w-full" />
          </div>
          <p
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-3 select-none text-center font-sans text-[8px] uppercase tracking-[0.34em] text-rosemary/45"
          >
            {COPYRIGHT_MARK}
          </p>
        </div>

        {/* Inner moulding, graduations and apex keystone. */}
        <svg
          viewBox="0 0 500 700"
          aria-hidden
          role="presentation"
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        >
          <path
            d={`M26 700 V${CY} A${R - 26} ${R - 26} 0 0 1 ${W - 26} ${CY} V700`}
            fill="none"
            stroke="#a88243"
            strokeOpacity={0.35}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
          <g stroke="#a88243" strokeLinecap="round">
            {ARC_TICKS.map((tick, i) => (
              <path key={`a${i}`} d={tick.d} strokeWidth={tick.major ? 1.4 : 0.9} strokeOpacity={tick.major ? 0.9 : 0.55} vectorEffect="non-scaling-stroke" />
            ))}
            {GRADUATION.ticks.map((tick, i) => (
              <path key={`g${i}`} d={tick.d} strokeWidth={tick.major ? 1.4 : 0.9} strokeOpacity={tick.major ? 0.9 : 0.5} vectorEffect="non-scaling-stroke" />
            ))}
          </g>
          <g
            fill="#a88243"
            fontSize={13}
            textAnchor="end"
            style={{ fontFamily: "var(--font-jost), 'Jost', sans-serif", letterSpacing: "0.08em" }}
          >
            {GRADUATION.labels.map((label) => (
              <text key={label.text} x={label.x} y={label.y}>
                {label.text}
              </text>
            ))}
            <text x={W - 34} y={286} fontSize={11}>
              ML
            </text>
          </g>
          <text
            x={CX}
            y={58}
            textAnchor="middle"
            fill="#18231c"
            fillOpacity={0.55}
            fontSize={17}
            style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif", fontStyle: "italic" }}
          >
            Nº 019
          </text>
          <rect x={CX - 6} y={-6} width={12} height={12} transform={`rotate(45 ${CX} 0)`} fill="#f5f2eb" stroke="#a88243" />
        </svg>

        {/* The herbarium drawing, remounted (and so redrawn) when the opening veil lifts. */}
        <BotanicalDrawing
          key={drawingKey}
          delay={drawingDelay}
          className="pointer-events-none absolute -left-[22%] -top-[10%] h-[114%] w-[144%] max-w-none overflow-visible"
        />
      </div>

      <figcaption className="mt-6 flex w-full max-w-[380px] flex-col items-center gap-1.5 border-t border-hairline pt-3 text-center">
        <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-rosemary/65">
          Specimen · Grasse, 43.66° N
        </span>
        <span className="font-serif text-lg italic leading-snug text-rosemary sm:text-xl">
          Flacon No. 019 — fluted crystal, 100 ml
        </span>
      </figcaption>
    </figure>
  );
}
