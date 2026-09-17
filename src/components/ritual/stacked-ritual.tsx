"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import { useRef, useState, type KeyboardEvent } from "react";
import { EASE_SILK } from "@/lib/motion";
import type { RitualPhase } from "@/lib/ritual-phases";
import { PhaseMetrics, RitualPlate } from "./phase-parts";

/**
 * Phones, tablets and reduced-motion visitors: no pinning. A tab selector swaps
 * one phase at a time, and the plate redraws itself over a couple of seconds
 * whenever a new phase is chosen.
 */
export function StackedRitual({ phases }: { phases: readonly RitualPhase[] }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [plays, setPlays] = useState(0);
  const tabs = useRef<HTMLDivElement>(null);
  // Starts drawn, so the first paint (and no-JS visitors) see a finished plate.
  const progress = useMotionValue(1);
  const phase = phases[index] ?? phases[0];

  const select = (next: number) => {
    const clamped = (next + phases.length) % phases.length;
    if (clamped === index) return;
    setIndex(clamped);
    setPlays((n) => n + 1);
    if (reduce) {
      progress.set(1);
      return;
    }
    progress.set(0);
    animate(progress, 1, { duration: 2.4, ease: EASE_SILK, delay: 0.35 });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowDown: index + 1,
      ArrowLeft: index - 1,
      ArrowUp: index - 1,
      Home: 0,
      End: phases.length - 1,
    };
    const target = moves[event.key];
    if (target === undefined) return;
    event.preventDefault();
    const next = (target + phases.length) % phases.length;
    select(next);
    tabs.current?.querySelectorAll<HTMLButtonElement>("[role=tab]")[next]?.focus();
  };

  if (!phase) return null;

  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 pb-20 md:px-10">
      <div
        ref={tabs}
        role="tablist"
        aria-label="Steps of the extraction ritual"
        onKeyDown={onKeyDown}
        className="grid grid-cols-4 border-b border-hairline"
      >
        {phases.map((p, i) => {
          const on = i === index;
          return (
            <button
              key={p.id}
              type="button"
              role="tab"
              id={`ritual-tab-${p.id}`}
              aria-selected={on}
              aria-controls="ritual-stacked-panel"
              tabIndex={on ? 0 : -1}
              onClick={() => select(i)}
              className={`relative flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 px-1 pb-3 pt-2 transition-colors duration-700 ${
                on ? "text-rosemary" : "text-rosemary/45 hover:text-rosemary"
              }`}
            >
              <span className="font-serif text-2xl font-light italic leading-none">{p.numeral}</span>
              <span className="truncate font-sans text-[9px] uppercase tracking-[0.2em] sm:text-[10px] sm:tracking-[0.28em]">
                {p.short}
              </span>
              {on ? (
                <motion.span
                  layoutId="ritual-stacked-marker"
                  aria-hidden
                  className="absolute inset-x-2 -bottom-px h-[2px] bg-brass"
                  transition={{ duration: 0.9, ease: EASE_SILK }}
                />
              ) : null}
            </button>
          );
        })}
      </div>

      <div id="ritual-stacked-panel" role="tabpanel" aria-labelledby={`ritual-tab-${phase.id}`} className="pt-10">
        <div className="grid gap-10 md:grid-cols-2 md:items-center md:gap-12">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={phase.id}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18, clipPath: "inset(0 0 12% 0)" }}
              animate={{ opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)" }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
              transition={{ duration: 0.8, ease: EASE_SILK }}
              className="flex min-w-0 flex-col gap-5"
            >
              <div className="flex items-end gap-4">
                <span aria-hidden className="font-serif text-7xl font-light italic leading-[0.8] text-rosemary/15">
                  {phase.numeral}
                </span>
                <span className="pb-1 font-sans text-[10px] uppercase tracking-[0.3em] text-rosemary/60">{phase.place}</span>
              </div>
              <h3 className="font-serif text-[clamp(2rem,8vw,3rem)] font-light leading-[1.02] tracking-tight text-rosemary">
                <span className="sr-only">Step {phase.numeral}: </span>
                {phase.title}
              </h3>
              <p className="max-w-[46ch] font-sans text-[15px] font-light leading-[1.75] text-rosemary/80">
                {phase.description}
              </p>
              <PhaseMetrics metrics={phase.metrics} play={plays} size="stacked" />
            </motion.div>
          </AnimatePresence>

          <div className="mx-auto aspect-[5/6] w-full max-w-md">
            <RitualPlate phase={phase} progress={progress} className="h-full w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
