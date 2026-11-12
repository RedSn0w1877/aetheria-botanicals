"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import type { CSSProperties, ReactNode } from "react";
import s from "@/components/chapters/frontispiece.module.css";
import { withBase } from "@/lib/base-path";
import { PALETTE } from "@/lib/palette";

/*
 * A client component only so its path data ships once, in the JS, rather than twice (in the HTML and
 * again in the RSC payload). It renders the same markup on the server, has no state and no effects.
 */

/*
 * The engraver's hand over the photograph, in the niche's own 500 × 700 units (the poster fills the
 * same 5:7 box, so the Cycles camera's framing maps straight onto it: the body spans x 142–356, the
 * amber x 152–346 from y ≈ 420 to its rounded foot at y ≈ 528).
 * - Sepia hatching across the amber (generated in arch-hatch-svg.ts): cross-contour arcs (the liquid's level sections, seen from just
 *   above, sagging more towards the foot), broken where each crosses a flute, closer on the shade
 *   side, faded by a soft mask so the shade gathers away from the window and at the foot (the
 *   glass's own flutes give the verticals, so there is no second, crossing layer).
 *   Multiplied onto the render, so it shades the liquid the way a plate engraver would, whatever
 *   colour is poured.
 * - White gouache heightening on the glass where the window catches it: the left flank, the shoulder,
 *   the cut-glass finial, the collar and the foot's rim. Gouache is for drawings and glass, never text.
 * Every mark is an inked path (class ink, pathLength 1) under the stems' data-ink-now, drawn by CSS
 * from first paint after the stems, and complete for no-JS, lite and reduced motion.
 */
const r1 = (n: number) => Math.round(n * 10) / 10;

/** The moulding's edge where the window catches it: 2 units inside it, from 8 o'clock over the crown. */
const MOULDING_LIGHT = (() => {
  const r = 250 - 28;
  const a0 = Math.PI * 1.04;
  const a1 = Math.PI * 1.7;
  const at = (a: number) => `${r1(250 + r * Math.cos(a))} ${r1(250 + r * Math.sin(a))}`;
  return `M${at(a0)}A${r} ${r} 0 0 1 ${at(a1)}`;
})();

const GOUACHE: readonly string[] = [
  // The left flank, a long streak following the bulge, and a second, shorter one inside it.
  "M171 394Q160 436 167 484",
  "M181 432Q176 452 179 474",
  // The shoulder, catching the light where it turns.
  "M204 328Q182 342 168 370",
  // The cut-glass finial and two of the stopper's facets.
  "M238 186Q229 198 231 214",
  "M246 222L238 236",
  "M262 210L270 220",
  // The collar's lit edge.
  "M233 258L233 280",
  // The foot's rim.
  "M182 566Q204 574 228 576",
];


const ink = (d: number, t: number) => ({ "--d": `${r1(d * 100) / 100}s`, "--t": `${t}s` }) as CSSProperties;

/** One overlay layer in the niche's units, drawn from first paint by the global ink rules. */
function Layer({ className, children }: { className: string; children: ReactNode }) {
  return (
    <svg
      className={className}
      viewBox="0 0 500 700"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      data-ink-now=""
      fill="none"
      strokeLinecap="round"
    >
      {children}
    </svg>
  );
}

/**
 * Two layers: the hatching multiplies into the photograph (a static file, about 5 KB, drawn in by a
 * left-to-right clip from first paint, like an engraver's pass); the gouache sits on top of it.
 */
export function Heightening() {
  return (
    <>
      {/* The hatching is a static file used as a mask over sepia ink (plates/arch/hatch.svg). */}
      <div
        className={s.hatch}
        style={{ "--hatch": `url(${withBase("/plates/arch/hatch.svg")})` } as CSSProperties}
        aria-hidden="true"
      />
      <Layer className={s.heightening}>
        <g stroke={PALETTE.gouache} strokeWidth={2.4} strokeOpacity={0.92}>
          {GOUACHE.map((d, i) => (
            <path key={`g${i}`} className="ink" pathLength={1} d={d} style={ink(1.5 + i * 0.06, 0.6)} />
          ))}
          <path className="ink" pathLength={1} d={MOULDING_LIGHT} strokeWidth={1.3} strokeOpacity={0.85} style={ink(1.1, 1.1)} />
        </g>
      </Layer>
    </>
  );
}
