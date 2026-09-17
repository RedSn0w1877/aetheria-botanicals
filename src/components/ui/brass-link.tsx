"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import type { MouseEvent, ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";

type BrassLinkProps = {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
  /** "ink" for linen backgrounds, "linen" for rosemary backgrounds. */
  tone?: "ink" | "linen";
  ariaLabel?: string;
};

/**
 * A call to action framed in a brushed-brass hairline. It drifts gently toward the
 * cursor (a heavy, damped spring — no bounce), and a sheen of brass sweeps across
 * the frame on hover. Renders an <a> when given `href`, otherwise a <button>.
 */
export function BrassLink({ children, onClick, href, className, tone = "ink", ariaLabel }: BrassLinkProps) {
  const reduce = useReducedMotion();
  const dx = useMotionValue(0);
  const dy = useMotionValue(0);
  const x = useSpring(dx, { stiffness: 120, damping: 18, mass: 0.8 });
  const y = useSpring(dy, { stiffness: 120, damping: 18, mass: 0.8 });
  const innerX = useTransform(x, (v) => v * 0.35);
  const innerY = useTransform(y, (v) => v * 0.35);

  const onMove = (event: MouseEvent<HTMLElement>) => {
    if (reduce) return;
    const box = event.currentTarget.getBoundingClientRect();
    dx.set((event.clientX - (box.left + box.width / 2)) * 0.28);
    dy.set((event.clientY - (box.top + box.height / 2)) * 0.4);
  };
  const onLeave = () => {
    dx.set(0);
    dy.set(0);
  };

  const palette =
    tone === "ink"
      ? "border-brass/70 text-rosemary hover:bg-rosemary hover:text-linen"
      : "border-brass/70 text-linen hover:bg-linen hover:text-rosemary";

  const classes = `group relative inline-flex items-center gap-4 overflow-hidden border px-7 py-4 font-sans text-[11px] uppercase tracking-[0.34em] transition-colors duration-700 ${palette} ${className ?? ""}`;

  const content = (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-brass/35 to-transparent opacity-0 transition-all duration-[1400ms] ease-out group-hover:left-[120%] group-hover:opacity-100"
      />
      <motion.span className="relative inline-flex items-center gap-4" style={reduce ? undefined : { x: innerX, y: innerY }}>
        {children}
      </motion.span>
    </>
  );

  const shared = {
    onMouseMove: onMove,
    onMouseLeave: onLeave,
    style: reduce ? undefined : { x, y },
    className: classes,
    "aria-label": ariaLabel,
  };

  if (href) {
    return (
      <motion.a href={href} onClick={onClick} {...shared}>
        {content}
      </motion.a>
    );
  }
  return (
    <motion.button type="button" onClick={onClick} {...shared}>
      {content}
    </motion.button>
  );
}
