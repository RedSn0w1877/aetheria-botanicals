"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { TIERS, getNote, type Ratios, type Selection } from "@/lib/blend-formulas";
import { NumberRoll, TextSwap } from "./readout-motion";

const SPRING = { type: "spring" as const, stiffness: 70, damping: 18, mass: 1 };

/**
 * Extraction ratio: one bar split into top / heart / base.
 * Every segment is a full-width strip scaled (scaleX) to its share and slid (x) to its
 * start, so the bar re-balances with transforms only.
 */
export function RatioBar({ ratios, selection, compact = false }: { ratios: Ratios; selection?: Selection; compact?: boolean }) {
  const reduce = useReducedMotion();
  const transition = reduce ? { duration: 0 } : SPRING;
  const starts = useMemo(() => ({ top: 0, heart: ratios.top, base: ratios.top + ratios.heart }), [ratios.top, ratios.heart]);
  const segments = useMemo(() => TIERS.map((tier) => ({ tier, start: starts[tier.id], share: ratios[tier.id] })), [starts, ratios]);
  const summary = useMemo(() => TIERS.map((tier) => `${tier.label} ${ratios[tier.id]} percent`).join(", "), [ratios]);

  return (
    <div className="min-w-0">
      <div
        role={compact ? undefined : "img"}
        aria-label={compact ? undefined : `Extraction ratio: ${summary}.`}
        aria-hidden={compact || undefined}
        className={`relative w-full overflow-hidden bg-herb ${compact ? "h-1.5" : "h-3"}`}
      >
        {segments.map(({ tier, start: offset, share }) => (
          <motion.div
            key={tier.id}
            className="absolute inset-y-0 left-0 w-full origin-left"
            style={{ backgroundColor: tier.tone }}
            initial={false}
            animate={{ x: `${offset}%`, scaleX: share / 100 }}
            transition={transition}
          />
        ))}
        {segments.slice(1).map(({ tier, start: offset }) => (
          <motion.div
            key={`seam-${tier.id}`}
            className="absolute inset-y-0 left-0 w-full"
            initial={false}
            animate={{ x: `${offset}%` }}
            transition={transition}
          >
            <span className="absolute inset-y-0 left-0 w-[2px] -translate-x-1/2 bg-parchment" />
          </motion.div>
        ))}
      </div>

      {compact || !selection ? null : (
        <dl className="mt-4 grid grid-cols-3 gap-3">
          {TIERS.map((tier) => (
            <div key={tier.id} className="min-w-0">
              <dt className="flex items-center gap-2 font-sans text-[9px] uppercase tracking-[0.26em] text-rosemary/60 sm:text-[10px]">
                <span aria-hidden className="h-2 w-2 shrink-0" style={{ backgroundColor: tier.tone }} />
                <span className="truncate">{tier.label}</span>
              </dt>
              <dd className="mt-1">
                <NumberRoll value={ratios[tier.id]} suffix="%" className="font-serif text-[clamp(1.6rem,2.6vw,2.2rem)] font-light leading-none text-rosemary" />
                <TextSwap
                  text={getNote(selection[tier.id].noteId).short}
                  className="mt-1 font-serif text-sm italic text-rosemary/65"
                />
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
