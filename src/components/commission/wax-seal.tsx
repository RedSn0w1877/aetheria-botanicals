// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { PALETTE } from "@/lib/palette";

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

/** The rim legend runs once around a circle of this radius, starting at the top. */
const RIM_R = 26.4;
const RIM_PATH = `M40 ${40 - RIM_R} a${RIM_R} ${RIM_R} 0 1 1 0 ${RIM_R * 2} a${RIM_R} ${RIM_R} 0 1 1 0 ${-RIM_R * 2}`;
const RIM_LENGTH = Math.round(2 * Math.PI * RIM_R * 0.97 * 100) / 100;

/** Sanguine wax, lit from the upper left like every drawing in the book. */
const WAX = {
  light: "#AD5A40",
  body: PALETTE.terracotta,
  shade: "#62200F",
  well: "#7A2B19",
  wellEdge: "#511A0B",
  wellRing: "#B8664C",
} as const;

/**
 * The wax seal on the letter: sanguine wax in twelve lobes, an impressed centre with the visitor's
 * first initial (or Æ) struck in gilt, and the studio's rim legend "HVNF STUDIOS · MMXXVI ·" on a
 * circular path in pale parchment, one of the book's watermarks. Static: the press is a CSS
 * animation on the button that holds it.
 */
export function WaxSeal({ initial, className }: { initial: string; className?: string }) {
  // One seal per page, in the letter, which hydrates as its own root: a fixed id, not useId.
  const uid = "letter";
  const rim = `seal-rim-${uid}`;
  const sheen = `seal-sheen-${uid}`;
  const letter = initial.slice(0, 1) || "Æ";

  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden="true" focusable="false">
      <defs>
        <path id={rim} d={RIM_PATH} />
        <radialGradient id={sheen} cx="0.36" cy="0.3" r="0.75">
          <stop offset="0" stopColor={WAX.light} />
          <stop offset="0.55" stopColor={WAX.body} />
          <stop offset="1" stopColor={WAX.shade} />
        </radialGradient>
      </defs>
      <path d={WAX_PATH} fill={`url(#${sheen})`} />
      <circle cx="40" cy="40" r="20.5" fill={WAX.well} stroke={WAX.wellEdge} strokeWidth="1" />
      <circle cx="40" cy="40" r="19.2" fill="none" stroke={WAX.wellRing} strokeOpacity="0.55" strokeWidth="0.6" />
      <text
        fill={PALETTE.parchment}
        fillOpacity="0.9"
        style={{ fontFamily: "var(--font-text)", fontSize: "7px", letterSpacing: "0.04em" }}
      >
        <textPath href={`#${rim}`} textLength={RIM_LENGTH} lengthAdjust="spacing">
          HVNF STUDIOS · MMXXVI ·
        </textPath>
      </text>
      <text
        x="40"
        y="41"
        textAnchor="middle"
        dominantBaseline="central"
        fill={PALETTE.brassLight}
        style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300, fontSize: "27px" }}
      >
        {letter}
      </text>
    </svg>
  );
}
