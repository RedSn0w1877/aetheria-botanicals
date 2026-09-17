"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { memo } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { GlyphId, Vessel } from "@/lib/blend-formulas";
import { EASE_SILK } from "@/lib/motion";

/**
 * Hand-authored line drawings, one per note, on a 48×48 grid.
 * Each glyph is a list of single-stroke paths so they can be "inked" in with pathLength.
 */
const GLYPHS: Record<GlyphId, readonly string[]> = {
  bergamot: [
    "M24 15c-7.6 0-13 5.9-13 13.2C11 35.6 16.9 41 24.2 41 31.4 41 37 35.4 37 28c0-7.2-5.6-13-13-13Z",
    "M24 15c0-3 .6-5.4 2-7.4",
    "M26 10.6c3.4-3.2 8.4-3.6 11.8-1.4-2.6 3.8-7.6 5-11.8 1.4Z",
    "M18.5 24.5c1.2-2.4 3.2-3.9 5.6-4.4",
  ],
  yuzu: [
    "M24 13.5c3 0 4.2 1.4 6.8 2.2 2.8.9 5.6 2.4 6.2 6.2.5 3 1.8 4.4 1 7.4-.9 3.4-3.2 4.4-4.8 7-1.8 2.8-5.2 4.2-9.2 4.2-4.2 0-6.8-1.6-8.8-4-1.8-2.2-4.4-3.6-4.6-7.4-.2-3.4 1-4.6 2-7.6 1.2-3.6 3.6-4.6 6.2-6.4 2-1.4 3.2-1.6 5.2-1.6Z",
    "M24 13.5c-.4-2.4.4-4.4 2.2-6",
    "M19 27.5h.01M24.5 24h.01M28.5 30h.01M22 33h.01M31 24.5h.01",
  ],
  pine: [
    "M8 38c9-6 20-15 32-30",
    "M14 34l-5-9M14 34l9-1.5M19.5 29.5l-4.5-9.5M19.5 29.5l9.5-1",
    "M25 24l-3.6-9.6M25 24l9.4-.4M30 18.4l-2.4-8.6M30 18.4l8.4.2",
    "M34.6 13l-.8-6M34.6 13l6-.8",
  ],
  vetiver: [
    "M8 26h32",
    "M24 26c-1-7-4.6-12.4-9-17M24 26c.4-7.4 2.4-13 6.6-18M24 26c1.6-5 4.6-8.6 9.4-10.4M24 26c-2.2-4-5.6-6.4-10-7",
    "M24 26c-.6 5 .6 9 -1.4 14M24 26c2.4 3.6 3 7.6 6 11M24 26c-2.8 3-6 5-7.6 9.6M22 32c-2 .6-3.4 1.8-4 3.4M27.4 32.6c1.8.2 3.2 1.2 4 2.6",
  ],
  rose: [
    "M24 22.5c1.6-.6 3 .8 2.4 2.4-.8 2-4.2 2-5-.4-1-3 2.4-5.6 5.4-4.8 4 1 4.8 6.4 1.8 9-3.6 3.2-10 1.6-10.8-3.4-.8-5.4 4.4-9.6 9.8-8.6",
    "M27.6 16.7c5 1.4 7.6 6.8 5.6 11.8-2.2 5.6-9.4 8-15 5",
    "M24 36v6.5",
    "M24 39.5c-2.8-2.6-6.6-2.8-9-1.2 2.6 2.6 6.4 3 9 1.2Z",
  ],
  cedar: [
    "M24 6v36",
    "M24 12l-6 6h12l-6-6",
    "M24 18l-9 8h18l-9-8",
    "M24 26l-12 9h24l-12-9",
    "M17.5 40c1.4-1 2.4-1 3.6 0M27.4 40c1.4-1 2.4-1 3.6 0",
  ],
  moss: [
    "M6 38c3-6.4 9-10.4 18-10.4S39 31.6 42 38",
    "M6 38h36",
    "M14 31.6c-.4-3 .6-5.6 2.4-7.6M16.4 24c1 .4 1.4 1.4 1.2 2.4",
    "M24 27.6c0-4.4 1-8.4 3.2-11.6M27.2 16c1.2.2 2 1.2 2 2.4",
    "M33 30.6c.8-2.8 2.6-4.6 4.6-5.4M37.6 25.2c.6.8.6 1.8 0 2.6",
    "M20 34h.01M29 33.5h.01M12 35.5h.01",
  ],
  amber: [
    "M24 6c-5 9-11 15.4-11 23a11 11 0 0 0 22 0c0-7.6-6-14-11-23Z",
    "M19 30c0 3.2 2.2 5.6 5 6.2",
    "M24 18l-4.4 9.6h8.8L24 18",
  ],
  labdanum: [
    "M24 24c-2.4-5.6-1.6-12.4 3.6-14.4 5.4-2 8.6 4 6 8.4-1.8 3.2-5.6 4.8-9.6 6",
    "M24 24c5.6-2.2 12.2-1 13.4 4.2 1.2 5.4-4.6 8-8.6 5.4-3-2-4.4-5.8-4.8-9.6",
    "M24 24c2 5.8.4 12.4-5 13.6-5.6 1.2-7.8-4.8-4.8-8.8 2.2-3 6-4.2 9.8-4.8",
    "M24 24c-6 .8-12.2-1.6-12.6-7-.4-5.4 5.8-7 9.2-3.6 2.6 2.6 3.2 6.6 3.4 10.6",
    "M22 24a2 2 0 1 0 4 0 2 2 0 1 0-4 0",
  ],
};

const VESSELS: Record<Vessel, readonly string[]> = {
  "Oak cask": [
    "M14 10c-2.4 4-3.4 9-3.4 14s1 10 3.4 14h20c2.4-4 3.4-9 3.4-14s-1-10-3.4-14H14Z",
    "M11.6 17h24.8M11.6 31h24.8",
    "M20 10c-1.4 4-2 9-2 14s.6 10 2 14M28 10c1.4 4 2 9 2 14s-.6 10-2 14",
  ],
  "Clay amphora": [
    "M20 6h8M21 6v5c-6 3-9 9-9 15 0 7 5 12 9 16h6c4-4 9-9 9-16 0-6-3-12-9-15V6",
    "M21 11c-4-1-7 1-7 5M27 11c4-1 7 1 7 5",
    "M15 24h18",
  ],
  "Violet glass": [
    "M21 5h6v5h-6zM20 10h8",
    "M20 13c-4 1.4-6 4.4-6 8.4V39a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V21.4c0-4-2-7-6-8.4",
    "M14 27h20",
    "M18 31v7",
  ],
};

type GlyphProps = {
  paths: readonly string[];
  className?: string;
  /** Draw the lines in once when scrolled into view. Decorative only. */
  ink?: boolean;
  strokeWidth?: number;
  title?: string;
};

function LineDrawing({ paths, className, ink = true, strokeWidth = 1.1, title }: GlyphProps) {
  const reduce = useReducedMotion();
  const animateInk = ink && !reduce;
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      {paths.map((d, i) => (
        <motion.path
          key={d}
          d={d}
          vectorEffect="non-scaling-stroke"
          initial={animateInk ? { pathLength: 0, opacity: 0.2 } : false}
          whileInView={animateInk ? { pathLength: 1, opacity: 1 } : undefined}
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          transition={{ duration: 1.8, ease: EASE_SILK, delay: 0.15 + i * 0.22 }}
        />
      ))}
    </svg>
  );
}

export const BotanicalGlyph = memo(function BotanicalGlyph({ id, className, ink, strokeWidth }: { id: GlyphId; className?: string; ink?: boolean; strokeWidth?: number }) {
  return <LineDrawing paths={GLYPHS[id]} className={className} ink={ink} strokeWidth={strokeWidth} />;
});

export const VesselGlyph = memo(function VesselGlyph({ vessel, className }: { vessel: Vessel; className?: string }) {
  return <LineDrawing paths={VESSELS[vessel]} className={className} ink={false} strokeWidth={1.1} />;
});

/**
 * Large, faint herbarium sprigs that drift behind the section (GSAP parallax targets).
 * Viewbox 0 0 120 320.
 */
export function HerbariumSprig({ variant, className }: { variant: "fern" | "stem"; className?: string }) {
  const fern = [
    "M60 316C58 240 62 150 70 8",
    ...Array.from({ length: 11 }, (_, i) => {
      const y = 280 - i * 24;
      const x = 59 + i * 0.9;
      const reach = 44 - i * 3.2;
      return `M${x} ${y}c-${reach * 0.5} -6 -${reach} -16 -${reach} -30M${x} ${y}c${reach * 0.5} -8 ${reach} -20 ${reach * 1.02} -34`;
    }),
  ];
  const stem = [
    "M40 318c10-70 4-130 20-200s28-90 30-112",
    "M52 200c-18-6-30-20-32-40 18 2 30 16 32 40Z",
    "M58 146c16-10 34-10 46 2-14 10-32 10-46-2Z",
    "M48 250c-16 0-28-10-32-26 16-2 28 8 32 26Z",
    "M90 6c-10 4-16 12-16 22 10-2 16-10 16-22Z",
    "M76 72c-6-4-8-12-6-18 6 4 8 10 6 18Z",
  ];
  return (
    <svg
      viewBox="0 0 120 320"
      fill="none"
      stroke="currentColor"
      strokeWidth={0.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {(variant === "fern" ? fern : stem).map((d) => (
        <path key={d} d={d} vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  );
}
