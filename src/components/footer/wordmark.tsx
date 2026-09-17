"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useScrollAnimation } from "@/lib/gsap-lazy";

const WORD = "Aetheria";
const LETTERS = WORD.split("");

/**
 * The closing wordmark, set edge to edge. Letters are spread with
 * justify-between so the word always spans the column, whatever the width;
 * the size is capped so it never runs wider than a 375px phone allows.
 *
 * Each letter rises out of its own mask when the footer comes into view, then
 * the row settles through a gentle scroll-scrubbed wave.
 */
export function Wordmark({ caption }: { caption: string }) {
  const reduce = useReducedMotion();
  const rowRef = useRef<HTMLSpanElement>(null);

  useScrollAnimation(
    (gsap) => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const row = rowRef.current;
        if (!row) return;
        Array.from(row.querySelectorAll<HTMLElement>("[data-letter]")).forEach((node, i) => {
          gsap.fromTo(
            node,
            { yPercent: i % 2 === 0 ? 14 : -8 },
            {
              yPercent: 0,
              ease: "none",
              scrollTrigger: { trigger: row, start: "top bottom", end: "bottom 70%", scrub: 1.5 },
            },
          );
        });
      });
      return () => mm.revert();
    },
    { scope: rowRef },
  );

  return (
    <h2 aria-label={caption} className="font-serif font-light italic leading-[0.82] tracking-tight text-linen">
      <span
        ref={rowRef}
        aria-hidden
        className="flex w-full select-none justify-between text-[min(27vw,30rem)]"
      >
        {LETTERS.map((letter, i) => (
          <span
            key={`${letter}-${i}`}
            data-letter
            className="-mb-[0.14em] -mt-[0.12em] inline-block overflow-hidden px-[0.04em] pb-[0.14em] pt-[0.12em]"
          >
            <motion.span
              className="inline-block origin-bottom-left will-change-transform"
              initial={reduce ? false : { y: "115%", rotate: 7 }}
              whileInView={{ y: "0%", rotate: 0 }}
              viewport={{ once: true, margin: "0px 0px -6% 0px" }}
              transition={{ duration: 1.9, ease: [0.16, 1, 0.3, 1], delay: i * 0.085 }}
            >
              {letter}
            </motion.span>
          </span>
        ))}
      </span>
    </h2>
  );
}
