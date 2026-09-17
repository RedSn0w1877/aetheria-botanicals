"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { useInView, useReducedMotion, useTransform, type MotionValue } from "motion/react";
import type { ReactNode, RefObject } from "react";
import { COPYRIGHT_MARK } from "@/lib/copyright";

/**
 * Shared plumbing for the four ritual plates.
 *
 * Every plate receives one `progress` motion value (0..1). On desktop the
 * horizontal scroll writes to it; on phones a timed tween does. The plates
 * never care which — they just map slices of that single number onto
 * pathLength, position and opacity, so there are no React re-renders per frame.
 */

export type DiagramProps = {
  /** 0 = blank paper, 1 = fully drawn. */
  progress: MotionValue<number>;
};

/** Colours as CSS variables, so the SVGs follow the Tailwind tokens. */
export const INK = "var(--color-rosemary)";
export const SAGE = "var(--color-sage)";
export const CLAY = "var(--color-terracotta)";
export const BRASS = "var(--color-brass)";
export const VIOLET = "var(--color-violet-glass)";
export const PAPER = "var(--color-parchment)";

/** Maps the slice [from, to] of the overall progress onto 0..1 (clamped). */
export function useSegment(progress: MotionValue<number>, from: number, to: number) {
  return useTransform(progress, [from, to], [0, 1]);
}

/**
 * Whether a plate's idle loops (drops, swaying stems, drifting vapour) should run:
 * only while the plate is on screen, and never for reduced-motion visitors.
 * IntersectionObserver also reports `display: none` plates as out of view,
 * so the hidden desktop/mobile duplicate never burns frames.
 */
export function useIdleLoops(ref: RefObject<Element | null>) {
  const reduce = useReducedMotion();
  const inView = useInView(ref, { margin: "80px 0px 80px 0px" });
  return inView && !reduce;
}

/** Shared stroke settings for the line-art. */
export const LINE = {
  fill: "none",
  stroke: INK,
  strokeWidth: 1.25,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/**
 * The paper plate every diagram sits on: parchment stock, hairline border,
 * brass registration corners and a caption that carries the studio mark.
 */
export function PlateFrame({
  numeral,
  caption,
  children,
  className,
}: {
  numeral: string;
  caption: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <figure className={`relative flex min-w-0 flex-col border border-hairline bg-parchment ${className ?? ""}`}>
      <Corners />
      <div className="flex items-center justify-between gap-4 border-b border-hairline px-4 py-2 font-sans text-[10px] uppercase tracking-[0.3em] text-rosemary/60">
        <span>Plate {numeral}</span>
        <span aria-hidden className="text-brass">
          {"//"}
        </span>
        <span className="truncate">Drawn by hand</span>
      </div>
      <div className="relative min-h-0 flex-1 px-3 py-3">{children}</div>
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-hairline px-4 py-2">
        <span className="font-serif text-[15px] italic leading-tight text-rosemary/80">{caption}</span>
        <span className="select-none font-sans text-[9px] uppercase tracking-[0.28em] text-rosemary/45">
          {COPYRIGHT_MARK}
        </span>
      </figcaption>
    </figure>
  );
}

function Corners() {
  const corner = "pointer-events-none absolute h-3 w-3 border-brass/80";
  return (
    <>
      <span aria-hidden className={`${corner} -left-px -top-px border-l border-t`} />
      <span aria-hidden className={`${corner} -right-px -top-px border-r border-t`} />
      <span aria-hidden className={`${corner} -bottom-px -left-px border-b border-l`} />
      <span aria-hidden className={`${corner} -bottom-px -right-px border-b border-r`} />
    </>
  );
}

/** A tiny, faint studio mark inside the drawing itself, like a printer's imprint. */
export function SvgImprint({ x = 392, y = 394 }: { x?: number; y?: number }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="end"
      fill={INK}
      opacity={0.3}
      style={{ fontFamily: "var(--font-sans)", fontSize: 7, letterSpacing: "0.2em" }}
    >
      {COPYRIGHT_MARK.toUpperCase()}
    </text>
  );
}

/** Tracked-out microcopy label inside a plate. */
export function SvgLabel({
  x,
  y,
  children,
  anchor = "start",
  opacity,
  fill = INK,
}: {
  x: number;
  y: number;
  children: ReactNode;
  anchor?: "start" | "middle" | "end";
  opacity?: number;
  fill?: string;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fill={fill}
      opacity={opacity}
      style={{ fontFamily: "var(--font-sans)", fontSize: 9, letterSpacing: "0.22em" }}
    >
      {children}
    </text>
  );
}
