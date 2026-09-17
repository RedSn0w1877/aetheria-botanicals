"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { useEffect } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { groupThousands } from "@/lib/terroir-lots";
import { EASE_SILK } from "@/lib/motion";
import { useTurn } from "./turn-context";

type RollingNumberProps = {
  value: number;
  decimals?: number;
  /** Insert thousands separators ("1,420"). */
  grouped?: boolean;
  className?: string;
  duration?: number;
};

function format(v: number, decimals: number, grouped: boolean): string {
  if (grouped) return groupThousands(v);
  return v.toFixed(decimals);
}

/**
 * A figure that counts smoothly from the previous lot's value to the new one,
 * and lifts into place with a small pop when it changes. The motion value is
 * created with the real value, so the server renders the settled number.
 */
export function RollingNumber({ value, decimals = 0, grouped = false, className, duration = 1.6 }: RollingNumberProps) {
  const reduce = useReducedMotion();
  const { turns } = useTurn();
  const mv = useMotionValue(value);
  const text = useTransform(mv, (v) => format(v, decimals, grouped));

  useEffect(() => {
    if (reduce) {
      mv.jump(value);
      return;
    }
    const controls = animate(mv, value, { duration, ease: EASE_SILK });
    return () => controls.stop();
  }, [value, reduce, mv, duration]);

  return (
    <span className={`inline-block tabular-nums ${className ?? ""}`}>
      <motion.span
        key={`${turns}`}
        className="inline-block"
        initial={turns === 0 || reduce ? false : { y: "0.35em", scale: 0.94, opacity: 0.25 }}
        animate={{ y: "0em", scale: 1, opacity: 1 }}
        transition={{ duration: 1.1, ease: EASE_SILK }}
      >
        {text}
      </motion.span>
    </span>
  );
}
