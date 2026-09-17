"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { motion, useReducedMotion } from "motion/react";
import { EASE_SILK } from "@/lib/motion";

/** A scalloped wax blob: twelve soft lobes around a circle. */
const WAX_PATH = (() => {
  const lobes = 12;
  const points: string[] = [];
  for (let i = 0; i < lobes; i += 1) {
    const a0 = (i / lobes) * Math.PI * 2;
    const a1 = ((i + 0.5) / lobes) * Math.PI * 2;
    const a2 = ((i + 1) / lobes) * Math.PI * 2;
    const p = (a: number, r: number) => `${(40 + Math.cos(a) * r).toFixed(2)} ${(40 + Math.sin(a) * r).toFixed(2)}`;
    if (i === 0) points.push(`M${p(a0, 33)}`);
    points.push(`Q${p(a1, 38.5)} ${p(a2, 33)}`);
  }
  return `${points.join(" ")} Z`;
})();

/**
 * The pending state: a brass seal presses down into a pool of terracotta wax,
 * the wax spreads out under it, and the seal lifts away leaving the impression.
 * Plays once per request (about 1.3s), never loops.
 */
export function WaxSeal({ initial, className }: { initial: string; className?: string }) {
  const reduce = useReducedMotion();
  const letter = initial.slice(0, 1) || "Æ";

  if (reduce) {
    return (
      <svg viewBox="0 0 80 80" className={className} aria-hidden>
        <path d={WAX_PATH} fill="#9c4630" />
        <circle cx="40" cy="40" r="22" fill="none" stroke="#6f2e1d" strokeWidth="1.5" />
        <text x="40" y="41" textAnchor="middle" dominantBaseline="central" className="font-serif" fontStyle="italic" fontSize="24" fill="#6f2e1d">
          {letter}
        </text>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 80 80" className={`overflow-visible ${className ?? ""}`} aria-hidden>
      {/* Wax pool spreading as the seal lands. */}
      <motion.path
        d={WAX_PATH}
        fill="#9c4630"
        style={{ transformOrigin: "40px 40px" }}
        initial={{ scale: 0.35, opacity: 0.4 }}
        animate={{ scale: [0.35, 0.5, 1.04, 1], opacity: 1 }}
        transition={{ duration: 1.2, times: [0, 0.35, 0.72, 1], ease: EASE_SILK }}
      />
      <motion.circle
        cx="40"
        cy="40"
        r="30"
        fill="none"
        stroke="#c9a36a"
        strokeWidth="0.6"
        style={{ transformOrigin: "40px 40px" }}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: [0.6, 1.35], opacity: [0, 0.7, 0] }}
        transition={{ duration: 1.1, delay: 0.42, ease: EASE_SILK }}
      />
      {/* The impression left behind. */}
      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.7 }}>
        <circle cx="40" cy="40" r="22" fill="#8a3b27" stroke="#6f2e1d" strokeWidth="1.5" />
        <circle cx="40" cy="40" r="18.5" fill="none" stroke="#6f2e1d" strokeWidth="0.6" strokeDasharray="1.5 2" />
        <text x="40" y="41" textAnchor="middle" dominantBaseline="central" className="font-serif" fontStyle="italic" fontSize="24" fill="#5a2415">
          {letter}
        </text>
      </motion.g>
      {/* The brass seal itself: drops, presses, lifts away. */}
      <motion.g
        style={{ transformOrigin: "40px 40px" }}
        initial={{ y: -46, scale: 1.25, opacity: 0 }}
        animate={{ y: [-46, 0, 0, -30], scale: [1.25, 0.94, 0.94, 1.1], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 1.3, times: [0, 0.38, 0.62, 1], ease: EASE_SILK }}
      >
        <circle cx="40" cy="40" r="23" fill="#a88243" />
        <circle cx="40" cy="40" r="23" fill="none" stroke="#f0dca8" strokeOpacity="0.6" strokeWidth="1" />
        <circle cx="40" cy="40" r="17" fill="none" stroke="#7a5a28" strokeWidth="1" />
        <text x="40" y="41" textAnchor="middle" dominantBaseline="central" className="font-serif" fontStyle="italic" fontSize="22" fill="#5c4219">
          {letter}
        </text>
      </motion.g>
    </svg>
  );
}
