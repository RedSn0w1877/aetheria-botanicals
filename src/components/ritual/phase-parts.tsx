"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { motion, type MotionValue } from "motion/react";
import type { JSX } from "react";
import type { RitualMetric, RitualPhase, RitualPhaseId } from "@/lib/ritual-phases";
import { EASE_SILK } from "@/lib/motion";
import { DawnDiagram } from "./dawn-diagram";
import { FiltrationDiagram } from "./filtration-diagram";
import { PlateFrame } from "./diagram-kit";
import { PressDiagram } from "./press-diagram";
import { SteepDiagram } from "./steep-diagram";

const DIAGRAMS: Record<RitualPhaseId, (props: { progress: MotionValue<number> }) => JSX.Element> = {
  forage: DawnDiagram,
  press: PressDiagram,
  steep: SteepDiagram,
  filter: FiltrationDiagram,
};

const NBSP = String.fromCharCode(160);

/** The hand-drawn plate for one phase, framed and captioned. */
export function RitualPlate({
  phase,
  progress,
  className,
}: {
  phase: RitualPhase;
  progress: MotionValue<number>;
  className?: string;
}) {
  const Diagram = DIAGRAMS[phase.id];
  return (
    <PlateFrame numeral={phase.numeral} caption={phase.plate} className={className}>
      <div role="img" aria-label={phase.plateAlt} className="absolute inset-3">
        <Diagram progress={progress} />
      </div>
    </PlateFrame>
  );
}

/**
 * A figure whose characters rise out of a blur one after another, the
 * "number pop-in" recipe. `play` is a counter: 0 renders the figure settled
 * (server render, no JS, reduced motion); each new value replays the entrance.
 */
export function PopValue({ text, play }: { text: string; play: number }) {
  const chars = Array.from(text);
  return (
    <span className="inline-flex whitespace-nowrap">
      <span className="sr-only">{text}</span>
      <span aria-hidden className="inline-flex">
        {chars.map((char, i) => (
          <motion.span
            key={`${play}-${i}`}
            className="inline-block will-change-transform"
            initial={play > 0 ? { y: "0.45em", opacity: 0, filter: "blur(6px)" } : false}
            animate={{ y: "0em", opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.1, ease: EASE_SILK, delay: 0.15 + i * 0.07 }}
          >
            {char === " " ? NBSP : char}
          </motion.span>
        ))}
      </span>
    </span>
  );
}

/** Metrics set in hairline cells, like the ruled columns of a lab ledger. */
export function PhaseMetrics({
  metrics,
  play,
  size = "pinned",
}: {
  metrics: readonly RitualMetric[];
  play: number;
  size?: "pinned" | "stacked";
}) {
  const valueSize =
    size === "pinned" ? "text-[clamp(1.6rem,min(2.6vw,4.4vh),2.75rem)]" : "text-[clamp(1.75rem,8vw,2.5rem)]";
  return (
    <dl className="grid grid-cols-3 border-y border-hairline">
      {metrics.map((metric, i) => (
        <div
          key={metric.label}
          className={`flex min-w-0 flex-col-reverse justify-end gap-2 py-3 ${i > 0 ? "border-l border-hairline pl-3 sm:pl-4" : "pr-3"}`}
        >
          <dt className="font-sans text-[10px] uppercase leading-snug tracking-[0.2em] text-rosemary/65 sm:tracking-[0.26em]">
            {metric.label}
          </dt>
          <dd className={`flex items-baseline gap-1.5 font-serif font-light leading-none tracking-tight text-rosemary ${valueSize}`}>
            <PopValue text={metric.value} play={play} />
            {metric.unit ? (
              <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-moss">{metric.unit}</span>
            ) : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}
