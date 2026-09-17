"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { useId } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EASE_SILK } from "@/lib/motion";

/**
 * A little leather swing tag with the visitor's initials foil-stamped into it.
 *
 * Three layers of type make the stamp read as pressed rather than printed:
 * a dark copy nudged up (the shadow inside the deboss), a pale copy nudged down
 * (the lit lower lip of the impression) and the brass foil on top. A band of
 * light crosses the foil every few seconds, clipped to the letters by a mask.
 * Changing the letters flips the stamp layer out and presses a fresh one in.
 */
export function MonogramTag({ letters, className }: { letters: string; className?: string }) {
  const reduce = useReducedMotion();
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const leather = `leather-${uid}`;
  const grain = `grain-${uid}`;
  const foil = `foil-${uid}`;
  const sheen = `sheen-${uid}`;
  const mask = `mask-${uid}`;

  const empty = letters.length === 0;
  const shown = empty ? "AE" : letters;
  const size = shown.length === 3 ? 44 : shown.length === 2 ? 54 : 64;

  return (
    <div className={`relative select-none [perspective:700px] ${className ?? ""}`}>
      <svg viewBox="0 0 220 140" className="block h-auto w-full" aria-hidden>
        <defs>
          <linearGradient id={leather} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#6d3b27" />
            <stop offset="0.55" stopColor="#56301f" />
            <stop offset="1" stopColor="#3e2317" />
          </linearGradient>
          <filter id={grain} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="7" result="noise" />
            <feColorMatrix
              in="noise"
              values="0 0 0 0 0.12  0 0 0 0 0.07  0 0 0 0 0.04  0 0 0 0.35 0"
              result="tint"
            />
            <feComposite in="tint" in2="SourceGraphic" operator="in" />
          </filter>
        </defs>

        {/* The string, looping through the punched eyelet. */}
        <path d="M0 58 C14 50 22 62 34 66" stroke="#a88243" strokeWidth="1.2" fill="none" opacity="0.8" />
        <path d="M0 76 C12 82 24 72 34 70" stroke="#8a6a32" strokeWidth="1.2" fill="none" opacity="0.7" />

        {/* Tag body: a clipped-corner leather label with a stitched border. */}
        <path d="M42 22 H206 A8 8 0 0 1 214 30 V110 A8 8 0 0 1 206 118 H42 L20 92 V48 Z" fill={`url(#${leather})`} />
        <path d="M42 22 H206 A8 8 0 0 1 214 30 V110 A8 8 0 0 1 206 118 H42 L20 92 V48 Z" filter={`url(#${grain})`} fill="#000" />
        <path
          d="M45 29 H203 A4 4 0 0 1 207 33 V107 A4 4 0 0 1 203 111 H45 L27 90 V50 Z"
          fill="none"
          stroke="#c9a36a"
          strokeOpacity="0.45"
          strokeWidth="0.9"
          strokeDasharray="3 3"
        />
        {/* Brass eyelet. */}
        <circle cx="36" cy="70" r="7" fill="#3e2317" stroke="#a88243" strokeWidth="2.2" />
        <circle cx="36" cy="70" r="2.8" fill="#1f130c" />
        <text x="203" y="106" textAnchor="end" className="font-sans" fontSize="5.5" letterSpacing="1.2" fill="#c9a36a" opacity="0.55">
          © 2026 HVNF STUDIOS
        </text>
      </svg>

      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={shown + (empty ? "-ghost" : "")}
          className="absolute inset-0"
          style={{ transformOrigin: "60% 50%" }}
          initial={reduce ? { opacity: 0 } : { rotateX: -80, opacity: 0, scale: 1.12 }}
          animate={reduce ? { opacity: 1 } : { rotateX: 0, opacity: 1, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { rotateX: 70, opacity: 0, scale: 0.96 }}
          transition={{ duration: reduce ? 0.2 : 0.9, ease: EASE_SILK }}
        >
          <svg viewBox="0 0 220 140" className="block h-auto w-full" aria-hidden>
            <defs>
              <linearGradient id={foil} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#f0dca8" />
                <stop offset="0.35" stopColor="#c9a36a" />
                <stop offset="0.55" stopColor="#8a6a32" />
                <stop offset="0.8" stopColor="#d9bb7c" />
                <stop offset="1" stopColor="#a88243" />
              </linearGradient>
              <linearGradient id={sheen} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#fff8e6" stopOpacity="0" />
                <stop offset="0.5" stopColor="#fff8e6" stopOpacity="0.9" />
                <stop offset="1" stopColor="#fff8e6" stopOpacity="0" />
              </linearGradient>
              <mask id={`${mask}-${shown}`}>
                <text x="122" y="70" textAnchor="middle" dominantBaseline="central" className="font-serif" fontSize={size} fontStyle="italic" letterSpacing="2" fill="#fff">
                  {shown}
                </text>
              </mask>
            </defs>
            {empty ? (
              <text
                x="122"
                y="70"
                textAnchor="middle"
                dominantBaseline="central"
                className="font-serif"
                fontSize={size}
                fontStyle="italic"
                letterSpacing="2"
                fill="#f5f2eb"
                opacity="0.16"
              >
                {shown}
              </text>
            ) : (
              <g className="font-serif" fontSize={size} fontStyle="italic" letterSpacing="2" textAnchor="middle" dominantBaseline="central">
                <text x="122" y="69" fill="#1c0f09" opacity="0.85">
                  {shown}
                </text>
                <text x="122" y="71.2" fill="#b98a6a" opacity="0.35">
                  {shown}
                </text>
                <text x="122" y="70" fill={`url(#${foil})`}>
                  {shown}
                </text>
                <g mask={`url(#${mask}-${shown})`}>
                  <motion.rect
                    y="20"
                    width="46"
                    height="100"
                    fill={`url(#${sheen})`}
                    initial={{ x: 40 }}
                    animate={reduce ? { x: 40, opacity: 0 } : { x: [40, 200] }}
                    transition={
                      reduce ? { duration: 0 } : { duration: 2.6, ease: "easeInOut", repeat: Infinity, repeatDelay: 3.4, delay: 0.8 }
                    }
                  />
                </g>
              </g>
            )}
          </svg>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
