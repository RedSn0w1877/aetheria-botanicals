"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { motion, useReducedMotion } from "motion/react";
import { COPYRIGHT_MARK } from "@/lib/copyright";
import { EASE_DRIFT } from "@/lib/motion";
import type { TerroirLot } from "@/lib/terroir-lots";
import { botanicalFor, PLATE_H, PLATE_W, type InkStroke } from "./botanicals";
import { useSafeId } from "./instruments";
import { useTurn } from "./turn-context";

const INK = "var(--color-rosemary)";
const CLAY = "var(--color-terracotta)";
const PAPER = "var(--color-parchment)";

/**
 * A pressed specimen mounted on parchment: tape at the corners, the plant inked in
 * stroke by stroke, and a handwritten-style latin label. The drawing only animates
 * after the visitor turns to another lot (or scrolls it into view the first time),
 * so the server render is always the finished plate.
 */
export function HerbariumPlate({ lot }: { lot: TerroirLot }) {
  const reduce = useReducedMotion();
  const { turns } = useTurn();
  const clipId = useSafeId("cone-clip");
  const art = botanicalFor(lot.plate);

  const stroke = (s: InkStroke, i: number) => {
    const draw = !reduce;
    return (
      <motion.path
        key={i}
        d={s.d}
        fill={s.occlude ? PAPER : "none"}
        stroke={s.accent ? CLAY : INK}
        strokeWidth={s.width}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={draw ? { pathLength: 0, opacity: 0 } : false}
        {...(turns > 0
          ? { animate: { pathLength: 1, opacity: 1 } }
          : { whileInView: { pathLength: 1, opacity: 1 }, viewport: { once: true, margin: "0px 0px -10% 0px" } })}
        transition={{
          pathLength: { duration: s.duration * 1.2, ease: EASE_DRIFT, delay: s.delay },
          opacity: { duration: 0.2, delay: s.delay },
        }}
      />
    );
  };

  const loose = art.strokes.filter((s) => !s.frame);
  const coneOutline = art.strokes.filter((s) => s.frame === "cone");
  const coneDetail = art.strokes.filter((s) => s.frame === "cone-clip");

  return (
    <figure className="relative mx-auto w-full max-w-[420px]">
      <div className="relative bg-parchment px-6 pb-5 pt-8 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.55)] sm:px-8">
        {/* Linen tape at the corners, slightly askew as if pressed by hand. */}
        <span aria-hidden className="absolute -left-3 top-4 h-5 w-16 -rotate-[32deg] bg-herb/90" />
        <span aria-hidden className="absolute -right-3 top-5 h-5 w-16 rotate-[28deg] bg-herb/90" />
        <span aria-hidden className="absolute -bottom-1 -left-2 h-5 w-14 rotate-[24deg] bg-herb/90" />
        <span aria-hidden className="absolute -bottom-1 -right-2 h-5 w-14 -rotate-[20deg] bg-herb/90" />

        <div className="flex items-baseline justify-between font-sans text-[9px] uppercase tracking-[0.3em] text-rosemary/55">
          <span>Herbarium · {lot.code}</span>
          <span>Plate {lot.number}</span>
        </div>

        <svg
          viewBox={`0 0 ${PLATE_W} ${PLATE_H}`}
          role="img"
          aria-label={`Pressed specimen drawing of ${lot.commonName}, ${lot.latinName}.`}
          className="mt-3 block h-auto w-full"
        >
          {art.cone ? (
            <defs>
              <clipPath id={clipId}>
                <path d={art.cone.d} />
              </clipPath>
            </defs>
          ) : null}
          {loose.map(stroke)}
          {art.cone ? (
            <g transform={art.cone.transform}>
              {coneOutline.map(stroke)}
              <g clipPath={`url(#${clipId})`}>{coneDetail.map(stroke)}</g>
            </g>
          ) : null}
        </svg>

        <figcaption className="mt-2 border-t border-hairline pt-3">
          <p className="font-serif text-2xl italic leading-tight text-rosemary">{lot.latinName}</p>
          <div className="mt-1 flex items-baseline justify-between gap-4 font-sans text-[9px] uppercase tracking-[0.26em] text-rosemary/55">
            <span>
              {lot.region}, {lot.country}
            </span>
            <span className="shrink-0">{COPYRIGHT_MARK}</span>
          </div>
        </figcaption>
      </div>
    </figure>
  );
}
