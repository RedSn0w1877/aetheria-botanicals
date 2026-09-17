"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { useReducedMotion } from "motion/react";

/**
 * An endless band of tracked-out microcopy, like the running border of a label.
 * The item list is rendered twice and the track slides by exactly half its width,
 * so the loop point is invisible. Holds still for reduced-motion users.
 */
export function TickerBand({
  items,
  seconds = 60,
  className,
  reverse = false,
}: {
  items: readonly string[];
  seconds?: number;
  className?: string;
  reverse?: boolean;
}) {
  const reduce = useReducedMotion();
  const run = (copy: number) => (
    <span className="flex shrink-0 items-center" aria-hidden={copy === 1}>
      {items.map((item) => (
        <span key={`${copy}-${item}`} className="flex items-center whitespace-nowrap">
          <span className="px-6">{item}</span>
          <span aria-hidden className="text-terracotta">
            {"//"}
          </span>
        </span>
      ))}
    </span>
  );

  return (
    <div className={`overflow-hidden ${className ?? ""}`}>
      <div
        className="flex w-max"
        style={reduce ? undefined : { animation: `ticker ${seconds}s linear infinite${reverse ? " reverse" : ""}` }}
      >
        {run(0)}
        {run(1)}
      </div>
    </div>
  );
}
