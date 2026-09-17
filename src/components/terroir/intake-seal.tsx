"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { motion, useReducedMotion } from "motion/react";
import { EASE_PETAL, EASE_SILK } from "@/lib/motion";
import { useSafeId } from "./instruments";

type IntakeSealProps = {
  lotCode: string;
  verificationCode: string;
  date: string;
  className?: string;
};

const RING_R = 58;

/**
 * The atelier's own intake stamp, pressed onto the specimen sheet when a lot arrives
 * in Grasse. Ink texture comes from a turbulence displacement plus a speckled mask,
 * so the impression looks inked by hand rather than drawn by a machine.
 * Remount it (via `key`) to press it again.
 */
export function IntakeSeal({ lotCode, verificationCode, date, className }: IntakeSealProps) {
  const reduce = useReducedMotion();
  const ringId = useSafeId("seal-ring");
  const inkId = useSafeId("seal-ink");
  const ringText = `VERIFIED AT INTAKE · GRASSE · LOT ${lotCode} · `;

  return (
    <motion.div
      className={`pointer-events-none select-none ${className ?? ""}`}
      initial={reduce ? false : { scale: 1.15, rotate: 4, opacity: 0 }}
      whileInView={{ scale: 1, rotate: -9, opacity: 0.93 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{
        delay: reduce ? 0 : 1.4,
        scale: { duration: 0.75, ease: EASE_PETAL, delay: reduce ? 0 : 1.4 },
        rotate: { duration: 1.2, ease: EASE_SILK, delay: reduce ? 0 : 1.4 },
        opacity: { duration: 0.35, delay: reduce ? 0 : 1.4 },
      }}
    >
      <svg viewBox="0 0 160 160" className="h-full w-full text-terracotta" role="img" aria-label={`Intake seal: verified at intake in Grasse, code ${verificationCode}, ${date}`}>
        <defs>
          <path id={ringId} d={`M80 80 m-${RING_R} 0 a${RING_R} ${RING_R} 0 1 1 ${RING_R * 2} 0 a${RING_R} ${RING_R} 0 1 1 -${RING_R * 2} 0`} />
          <filter id={inkId} x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" result="grain" />
            <feDisplacementMap in="SourceGraphic" in2="grain" scale="1.8" xChannelSelector="R" yChannelSelector="G" result="bled" />
            <feTurbulence type="fractalNoise" baseFrequency="0.45" numOctaves="3" seed="19" result="speckle" />
            <feColorMatrix in="speckle" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  3.4 0 0 0 -0.95" result="mask" />
            <feComposite in="bled" in2="mask" operator="in" />
          </filter>
        </defs>

        {/* Ink spreading into the paper as the stamp lands. */}
        {reduce ? null : (
          <motion.circle
            cx="80"
            cy="80"
            r="74"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            initial={{ scale: 0.96, opacity: 0 }}
            whileInView={{ scale: 1.1, opacity: [0, 0.35, 0] }}
            viewport={{ once: true }}
            transition={{ duration: 1.6, ease: EASE_SILK, delay: 1.55 }}
            style={{ transformOrigin: "80px 80px" }}
          />
        )}

        <g filter={`url(#${inkId})`} fill="currentColor" stroke="currentColor">
          <circle cx="80" cy="80" r="74" fill="none" strokeWidth="2.2" />
          <circle cx="80" cy="80" r="69.5" fill="none" strokeWidth="0.7" />
          <circle cx="80" cy="80" r="46" fill="none" strokeWidth="1" />
          <circle cx="80" cy="80" r="43" fill="none" strokeWidth="0.5" />
          <text fontSize="8.6" letterSpacing="1.6" stroke="none" className="font-sans" fontWeight="500">
            <textPath href={`#${ringId}`} textLength={Math.round(2 * Math.PI * RING_R) - 4} lengthAdjust="spacing">
              {ringText}
            </textPath>
          </text>

          {/* A small pressed sprig above the code. */}
          <path d="M80 50 L80 62" fill="none" strokeWidth="0.9" strokeLinecap="round" />
          <path d="M80 56 C76 53 73 53 71 55 C74 57 77 57 80 56 Z" stroke="none" />
          <path d="M80 54 C84 51 87 51 89 53 C86 55 83 55 80 54 Z" stroke="none" />

          <text x="80" y="72" textAnchor="middle" fontSize="6" letterSpacing="2.4" stroke="none" className="font-sans">
            AETHERIA
          </text>
          <text x="80" y="88" textAnchor="middle" fontSize="13" stroke="none" className="font-serif" fontWeight="600">
            {verificationCode}
          </text>
          <line x1="62" x2="98" y1="93" y2="93" strokeWidth="0.6" />
          <text x="80" y="103" textAnchor="middle" fontSize="7.4" letterSpacing="1.4" stroke="none" className="font-sans">
            {date.toUpperCase()}
          </text>
        </g>
      </svg>
    </motion.div>
  );
}
