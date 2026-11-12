// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import type { CSSProperties } from "react";
import s from "./commission.module.css";
import type { VesselId } from "./vessels";

type Drawing = {
  viewBox: string;
  /** Glass outline: stopper, collar, shoulders, body. */
  outline: string[];
  /** Cut facets, label panels, flutes. */
  detail: string[];
  /** The resting line of the perfume inside. */
  liquid: string;
  /** Fill for the perfume below the liquid line. */
  pour: string;
  /** A single highlight where light catches the glass. */
  glint: string;
};

/**
 * Hand-authored line drawings, one per vessel. Each fills its own viewBox; the parent sets the height,
 * so the three can stand together at relative scale.
 */
const DRAWINGS: Record<VesselId, Drawing> = {
  "50": {
    viewBox: "0 0 100 150",
    outline: [
      "M40 6 H60 A4 4 0 0 1 64 10 V28 H36 V10 A4 4 0 0 1 40 6 Z",
      "M33 28 H67 V36 H33 Z",
      "M41 36 V43 C41 52 12 58 12 93 C12 128 27 145 50 145 C73 145 88 128 88 93 C88 58 59 52 59 43 V36",
    ],
    detail: ["M44 10 V26", "M50 10 V26", "M56 10 V26", "M30 145 C38 141 62 141 70 145"],
    liquid: "M15 104 C30 100 44 106 56 103 C68 100 78 104 85 102",
    pour: "M15 104 C30 100 44 106 56 103 C68 100 78 104 85 102 C84 126 72 142 50 142 C28 142 16 126 15 104 Z",
    glint: "M22 84 C22 72 29 63 38 59",
  },
  "100": {
    viewBox: "0 0 100 190",
    outline: [
      "M38 4 H62 L67 10 V32 H33 V10 Z",
      "M30 32 H70 V41 H30 Z",
      "M42 41 V47 L15 62 V172 A13 13 0 0 0 28 185 H72 A13 13 0 0 0 85 172 V62 L58 47 V41",
    ],
    detail: ["M33 10 H67", "M27 112 H73 V152 H27 Z", "M33 120 H67", "M40 134 H60", "M44 144 H56"],
    liquid: "M18 94 C34 91 48 96 60 93 C70 91 78 94 82 93",
    pour: "M18 94 C34 91 48 96 60 93 C70 91 78 94 82 93 V171 A10 10 0 0 1 72 181 H28 A10 10 0 0 1 18 171 Z",
    glint: "M22 70 V138",
  },
  "250": {
    viewBox: "0 0 120 232",
    outline: [
      "M60 2 L81 21 L73 44 H47 L39 21 Z",
      "M43 44 H77 V55 H43 Z",
      "M50 55 V61 C50 72 10 73 10 97 L16 214 A12 12 0 0 0 28 226 H92 A12 12 0 0 0 104 214 L110 97 C110 73 70 72 70 61 V55",
    ],
    detail: [
      "M39 21 H81",
      "M49 21 L60 44 L71 21",
      "M60 2 V21",
      "M28 104 L32 220",
      "M44 99 L46 224",
      "M60 97 V225",
      "M76 99 L74 224",
      "M92 104 L88 220",
    ],
    liquid: "M13 130 C36 125 58 134 78 129 C92 126 101 130 107 129",
    pour: "M13 130 C36 125 58 134 78 129 C92 126 101 130 107 129 L102 213 A10 10 0 0 1 92 222 H28 A10 10 0 0 1 18 213 Z",
    glint: "M20 104 C19 128 21 160 24 196",
  },
};

/** The pen's order: each stroke starts a beat after the last. */
const pen = (order: number, seconds = 1.4): CSSProperties =>
  ({ "--d": `${(order * 0.14).toFixed(2)}s`, "--t": `${seconds}s` }) as CSSProperties;

/**
 * A vessel drawn in ink. Every stroke is class="ink" with pathLength="1", so the global ink mechanism
 * can draw it: wrap it in [data-ink-now] to ink it in the moment it mounts (the reply card does), or in
 * [data-ink] to ink it when it scrolls into view. It ships complete, so no-JS, lite and reduced motion
 * see it whole. Inks come from the book's tokens (commission.module.css): sepia lines, a sanguine
 * perfume at 16%, and the glint in white gouache, the one highlight a drawing on kraft is allowed.
 */
export function FlaconSilhouette({
  vessel,
  className,
  style,
}: {
  vessel: VesselId;
  className?: string;
  style?: CSSProperties;
}) {
  const drawing = DRAWINGS[vessel];
  return (
    <svg
      viewBox={drawing.viewBox}
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      preserveAspectRatio="xMidYMax meet"
    >
      <path d={drawing.pour} className={s.silPour} stroke="none" />
      {drawing.outline.map((d, i) => (
        <path key={d} className={`ink ${s.silLine}`} pathLength={1} d={d} strokeWidth={1.15} style={pen(i)} />
      ))}
      <g opacity={0.55}>
        {drawing.detail.map((d, i) => (
          <path key={d} className={`ink ${s.silLine}`} pathLength={1} d={d} strokeWidth={0.7} style={pen(i + 2, 0.9)} />
        ))}
      </g>
      <path className={`ink ${s.silLiquid}`} pathLength={1} d={drawing.liquid} strokeWidth={0.9} style={pen(4)} />
      <path
        className={`ink ${s.silGlint}`}
        pathLength={1}
        d={drawing.glint}
        strokeWidth={1.8}
        opacity={0.9}
        style={pen(5, 1)}
      />
    </svg>
  );
}
