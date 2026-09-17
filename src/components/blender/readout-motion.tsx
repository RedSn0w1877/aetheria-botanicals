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
  const reduce = useReducedMotion();
  const digits = String(Math.round(value)).split("");
  return (
    <span className={`inline-flex items-baseline tabular-nums ${className ?? ""}`}>
      <span className="sr-only">
        {Math.round(value)}
        {suffix}
      </span>
      <span aria-hidden className="inline-flex">
        {digits.map((digit, i) => {
          const place = digits.length - 1 - i;
          return (
            <span key={`place-${place}`} className="relative inline-flex overflow-hidden py-[0.08em]">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={`${place}-${digit}`}
                  className="inline-block"
                  initial={reduce ? { opacity: 0 } : { y: "50%", opacity: 0 }}
                  animate={reduce ? { opacity: 1 } : { y: "0%", opacity: 1 }}
                  exit={reduce ? { opacity: 0 } : { y: "-50%", opacity: 0 }}
                  transition={{ duration: reduce ? 0 : 0.4, ease: EASE_SILK, delay: reduce ? 0 : place * 0.03 }}
                >
                  {digit}
                </motion.span>
              </AnimatePresence>
            </span>
          );
        })}
        {suffix ? <span className="inline-block">{suffix}</span> : null}
      </span>
    </span>
  );
});

/**
 * Text state swap: the outgoing phrase exhales upward and blurs, the new one settles in.
 * Keyed by the text itself, so only genuine changes animate.
 */
export const TextSwap = memo(function TextSwap({ text, className, as = "span" }: { text: string; className?: string; as?: "span" | "p" }) {
  const reduce = useReducedMotion();
  const Tag = as === "p" ? motion.p : motion.span;
  return (
    <span className="relative block overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <Tag
          key={text}
          className={`block ${className ?? ""}`}
          initial={reduce ? { opacity: 0 } : { y: "40%", opacity: 0, filter: "blur(4px)" }}
          animate={reduce ? { opacity: 1 } : { y: "0%", opacity: 1, filter: "blur(0px)" }}
          exit={reduce ? { opacity: 0 } : { y: "-35%", opacity: 0, filter: "blur(4px)" }}
          transition={{ duration: reduce ? 0.2 : 0.55, ease: EASE_SILK }}
        >
          {text}
        </Tag>
      </AnimatePresence>
    </span>
  );
});
