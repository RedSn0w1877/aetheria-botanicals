"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { memo } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CURE_MAX_DAYS, type CureRecommendation } from "@/lib/blend-formulas";
import { EASE_SILK } from "@/lib/motion";
import { VesselGlyph } from "./botanical-glyph";
import { NumberRoll, TextSwap } from "./readout-motion";

const MONTHS = [0, 30, 60, 90, 120, 150, 180];
const FORTNIGHTS = Array.from({ length: CURE_MAX_DAYS / 15 + 1 }, (_, i) => i * 15).filter((d) => d % 30 !== 0);

/**
 * Recommended cure: a day scale from 0 to 180 with month ticks. The resting period
 * fills in from zero and a brass marker glides to the release day.
 */
export const CureTimeline = memo(function CureTimeline({ cure }: { cure: CureRecommendation }) {
  const reduce = useReducedMotion();
  const pct = cure.days / CURE_MAX_DAYS;
  const glide = reduce ? { duration: 0 } : { duration: 1.6, ease: EASE_SILK };

  return (
    <div className="min-w-0">
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-rosemary/60">Recommended cure</p>
          <div className="mt-1 flex items-baseline gap-2 font-serif text-rosemary">
            <NumberRoll value={cure.days} className="text-[clamp(1.9rem,3vw,2.5rem)] font-light leading-none" />
            <span className="text-lg italic">days</span>
          </div>
          <TextSwap text={`${cure.label} ageing`} className="mt-1 font-sans text-[10px] uppercase tracking-[0.24em] text-moss" />
        </div>
        <div className="relative h-14 w-14 shrink-0 text-brass" aria-hidden>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={cure.vessel}
              className="absolute inset-0 block"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12, rotate: -6 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12, rotate: 6 }}
              transition={reduce ? { duration: 0.2 } : { duration: 0.7, ease: EASE_SILK }}
            >
              <VesselGlyph vessel={cure.vessel} className="h-full w-full" />
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      <div
        className="relative mt-5 h-10"
        role="img"
        aria-label={`Day scale from 0 to 180. The blend rests for ${cure.days} days in ${cure.vessel.toLowerCase()}.`}
      >
        <div className="absolute inset-x-0 top-3 h-px bg-hairline" />
        <motion.div
          className="absolute left-0 top-[11px] h-[3px] w-full origin-left bg-moss/80"
          initial={false}
          animate={{ scaleX: pct }}
          transition={glide}
        />
        {FORTNIGHTS.map((day) => (
          <span key={day} className="absolute top-2 h-2 w-px bg-hairline" style={{ left: `${(day / CURE_MAX_DAYS) * 100}%` }} />
        ))}
        {MONTHS.map((day, i) => (
          <span
            key={day}
            className={`absolute top-1 flex flex-col ${i === 0 ? "items-start" : i === MONTHS.length - 1 ? "-translate-x-full items-end" : "-translate-x-1/2 items-center"}`}
            style={{ left: `${(day / CURE_MAX_DAYS) * 100}%` }}
          >
            <span className="h-4 w-px bg-rosemary/35" />
            <span className="mt-1 font-sans text-[9px] uppercase tracking-[0.14em] text-rosemary/50">
              {i === 0 ? "Day 0" : `${i}${i === 1 ? " mo" : ""}`}
            </span>
          </span>
        ))}
        <motion.div className="absolute inset-y-0 left-0 w-full" initial={false} animate={{ x: `${pct * 100}%` }} transition={glide}>
          <span className="absolute left-0 top-3 block -translate-x-1/2 -translate-y-1/2">
            <span className="relative block h-3.5 w-3.5 rotate-45 border border-brass bg-parchment">
              <span className="absolute inset-[3px] bg-terracotta" />
            </span>
          </span>
        </motion.div>
      </div>
    </div>
  );
});
