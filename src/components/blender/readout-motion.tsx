"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { memo } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EASE_SILK } from "@/lib/motion";

/**
 * Number pop-in (studio recipe, rebuilt on motion): each digit sits in its own mask
 * and, when it changes, the old digit lifts away while the new one rises in from
 * soft focus. Digits are keyed by their place value, so 9 → 10 only animates the
 * places that actually changed. `initial={false}` keeps the first paint static,
 * so server HTML shows the real number.
 */
export const NumberRoll = memo(function NumberRoll({ value, suffix, className }: { value: number; suffix?: string; className?: string }) {
  const rounded = Math.round(value);
  return (
    <span className={`inline-flex items-baseline tabular-nums ${className ?? ""}`}>
      {rounded}
      {suffix}
    </span>
  );
});

/**
 * Text state swap: the outgoing phrase exhales upward and blurs, the new one settles in.
 * Keyed by the text itself, so only genuine changes animate.
 */
export const TextSwap = memo(function TextSwap({ text, className, as = "span" }: { text: string; className?: string; as?: "span" | "p" }) {
  const Tag = as === "p" ? "p" : "span";
  return <Tag className={`block ${className ?? ""}`}>{text}</Tag>;
});
