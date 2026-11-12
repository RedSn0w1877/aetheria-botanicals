"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import s from "@/components/chapters/provenance.module.css";
import { safeId } from "./instruments";

type IntakeSealProps = {
  lotCode: string;
  verificationCode: string;
  date: string;
};

const RING_R = 58;
const RING_D = `M80 80m-${RING_R} 0a${RING_R} ${RING_R} 0 1 1 ${RING_R * 2} 0a${RING_R} ${RING_R} 0 1 1 -${RING_R * 2} 0`;

/**
 * The atelier's rubber stamp, pressed onto a specimen sheet when its lot was received in Grasse.
 * The ink texture is a turbulence displacement plus a speckled mask, so the impression looks inked
 * by hand. A stamp is an object, so it keeps its capitals.
 *
 * Every client renders the same markup: there is no branch on motion preference (that branch was
 * React error #418). The press is CSS, run once when the sheet mounts (provenance.module.css), and
 * only with JavaScript, without lite, and when the reader allows motion.
 */
export function IntakeSeal({ lotCode, verificationCode, date }: IntakeSealProps) {
  const ringId = safeId("seal-ring", lotCode);
  const inkId = safeId("seal-ink", lotCode);

  return (
    <div className={s.seal}>
      <svg
        viewBox="0 0 160 160"
        role="img"
        aria-label={`Intake stamp: received in Grasse, entry ${verificationCode}, ${date}`}
      >
        <defs>
          <path id={ringId} d={RING_D} />
          <filter id={inkId} x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" result="grain" />
            <feDisplacementMap in="SourceGraphic" in2="grain" scale="1.8" xChannelSelector="R" yChannelSelector="G" result="bled" />
            <feTurbulence type="fractalNoise" baseFrequency="0.45" numOctaves="3" seed="19" result="speckle" />
            <feColorMatrix in="speckle" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  3.4 0 0 0 -0.95" result="mask" />
            <feComposite in="bled" in2="mask" operator="in" />
          </filter>
        </defs>
        <g filter={`url(#${inkId})`} fill="currentColor" stroke="currentColor">
          <circle cx="80" cy="80" r="74" fill="none" strokeWidth="2.2" />
          <circle cx="80" cy="80" r="69.5" fill="none" strokeWidth="0.7" />
          <circle cx="80" cy="80" r="46" fill="none" strokeWidth="1" />
          <circle cx="80" cy="80" r="43" fill="none" strokeWidth="0.5" />
          <text fontSize="8.6" letterSpacing="1.4" stroke="none">
            <textPath href={`#${ringId}`} textLength={Math.round(2 * Math.PI * RING_R) - 4} lengthAdjust="spacing">
              {`RECEIVED IN GRASSE · LOT ${lotCode} · `}
            </textPath>
          </text>
          {/* A small pressed sprig above the entry code. */}
          <path d="M80 50V62" fill="none" strokeWidth="0.9" strokeLinecap="round" />
          <path d="M80 56C76 53 73 53 71 55C74 57 77 57 80 56ZM80 54C84 51 87 51 89 53C86 55 83 55 80 54Z" stroke="none" />
          <text x="80" y="72" textAnchor="middle" fontSize="6" letterSpacing="2.4" stroke="none">
            AETHERIA
          </text>
          <text x="80" y="88" textAnchor="middle" fontSize="12.5" stroke="none">
            {verificationCode}
          </text>
          <path d="M62 93H98" strokeWidth="0.6" />
          <text x="80" y="103" textAnchor="middle" fontSize="7.4" letterSpacing="1.4" stroke="none">
            {date.toUpperCase()}
          </text>
        </g>
      </svg>
    </div>
  );
}
