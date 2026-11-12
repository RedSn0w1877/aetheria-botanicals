"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { PALETTE } from "@/lib/palette";

/*
 * The HVNF impossible-cube mark (from brand/hvnf-blueprint), rounded to one decimal. Master box 256.
 * Stroked twice below, never filled: a blind emboss has no ink, only light and shadow.
 */
const CUBE_LINES =
  "M114.1 72 114.1 104M114.1 136 114.1 148.8M114.1 171.2 114.1 200M128 48 128 112M128 128 128 140.8M128 163.2 128 224M141.9 72 141.9 104M141.9 155.2 141.9 200M72.6 144 100.3 128M128 112 183.4 80M58.7 168 114.1 136M128 128 211.1 80M86.4 88 128 64M72.6 80 128 48M58.7 104 58.7 168M72.6 112 72.6 160M44.9 80 128 128M155.7 144 197.3 168M72.6 80 128 112M169.6 136 183.4 144M58.7 104 114.1 136M141.9 152 169.6 168M128 64 169.6 88M128 48 183.4 80M72.6 160 86.4 168M100.3 176 114.1 184M58.7 168 114.1 200M183.4 112 183.4 160M197.3 104 197.3 168M141.9 184 183.4 160M141.9 200 197.3 168M72.6 176 197.3 104M86.4 184 183.4 128";
const CUBE_OUTLINE = "M128 32 211.1 80 211.1 176 128 224 44.9 176 44.9 80Z";

/** Scale of the 256-unit mark inside the 64-unit seal (the cube ends up about 36px tall). */
const MARK_SCALE = 0.19;

/**
 * The printer's seal beside the colophon's copyright line: a 64px blind emboss of the HVNF cube in a
 * double ring. One copy is a gouache highlight nudged up-left, the other a sepia shadow nudged
 * down-right, so the mark reads as pressed into the kraft stock. The stock is mid-toned, so both carry
 * more weight than they would on white paper. No filter, no fill, no motion.
 *
 * A client component only so its path data ships once, in the JS, not twice (HTML and RSC payload);
 * like the hero drawing it has no state and no effects, and is server-rendered.
 */
export function EmbossSeal({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <g id="hvnf-emboss-mark">
          <circle cx="32" cy="32" r="30.5" strokeWidth="1" />
          <circle cx="32" cy="32" r="27.6" strokeWidth=".6" />
          <g transform={`translate(32 32) scale(${MARK_SCALE}) translate(-128 -128)`}>
            <path strokeWidth={0.75 / MARK_SCALE} d={CUBE_LINES} />
            <path strokeWidth={1 / MARK_SCALE} d={CUBE_OUTLINE} />
          </g>
        </g>
      </defs>
      <use href="#hvnf-emboss-mark" x=".6" y=".6" stroke={PALETTE.rosemary} strokeOpacity=".26" />
      <use href="#hvnf-emboss-mark" x="-.6" y="-.6" stroke={PALETTE.gouache} strokeOpacity=".55" />
    </svg>
  );
}
