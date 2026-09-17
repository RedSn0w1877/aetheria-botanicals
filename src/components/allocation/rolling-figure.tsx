"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { motion, useReducedMotion } from "motion/react";
import { EASE_SILK } from "@/lib/motion";

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
/** Two full turns of the wheel; each cell is 1/20th of the strip. */
const STRIP = [...DIGITS, ...DIGITS];
const CELL = 100 / STRIP.length;

/**
 * A figure that rolls up like an odometer when it scrolls into view.
 *
 * The strip is two cycles long. Its resting position (the `style`) is the target
 * digit in the second cycle, so the server HTML and any no-JS visit already read
 * the correct number. On entry, the wheel starts one cycle back and rolls forward.
 */
export function RollingFigure({ value, className, delay = 0 }: { value: string; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  const chars = value.split("");

  return (
    <span className={`inline-flex tabular-nums [font-feature-settings:"lnum","tnum"] ${className ?? ""}`}>
      <span className="sr-only">{value}</span>
      {chars.map((char, i) => {
        const digit = DIGITS.indexOf(char);
        if (digit < 0) {
          return (
            <span key={`${char}-${i}`} aria-hidden>
              {char}
            </span>
          );
        }
        const rest = `-${(10 + digit) * CELL}%`;
        const from = `-${digit * CELL}%`;
        return (
          <span key={`${char}-${i}`} aria-hidden className="relative inline-block h-[1.15em] overflow-hidden leading-[1.15em]">
            <span className="invisible block">{char}</span>
            <motion.span
              className="absolute inset-x-0 top-0 flex flex-col"
              style={{ y: rest }}
              whileInView={reduce ? undefined : { y: [from, rest] }}
              viewport={{ once: true, margin: "0px 0px -12% 0px" }}
              transition={{ duration: 2 + (chars.length - i) * 0.25, ease: EASE_SILK, delay: delay + i * 0.08 }}
            >
              {STRIP.map((d, k) => (
                <span key={k} className="block h-[1.15em] leading-[1.15em]">
                  {d}
                </span>
              ))}
            </motion.span>
          </span>
        );
      })}
    </span>
  );
}
