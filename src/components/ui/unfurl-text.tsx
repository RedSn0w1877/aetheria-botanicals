"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { motion, useReducedMotion } from "motion/react";
import { EASE_SILK } from "@/lib/motion";

type UnfurlTextProps = {
  /** The visible words. Screen readers get `text` via the parent's aria-label. */
  text: string;
  className?: string;
  /** Seconds before the first word begins. */
  delay?: number;
  /** Seconds between words. */
  stagger?: number;
  /** Animate on mount instead of when scrolled into view. */
  immediate?: boolean;
};

/**
 * Serif headline text that rises word by word out of a mask.
 *
 * Details that matter:
 * - Every word keeps a real space character after it, so copy/paste and wrapping behave.
 * - The mask has padding on top and to the right (cancelled by negative margins) so
 *   tall italic capitals and swashes are never sliced by the overflow clip.
 * - The words start below the mask but the text is always in the DOM — if JS never
 *   runs, nothing is lost. Reduced-motion users see it settled.
 * - This layer is `aria-hidden`; put the plain sentence on the heading's aria-label.
 */
export function UnfurlText({ text, className, delay = 0, stagger = 0.08, immediate = false }: UnfurlTextProps) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  const target = { y: "0%", rotate: 0 };

  return (
    <span aria-hidden className={`block ${className ?? ""}`}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`}>
          <span className="-mb-[0.1em] -ml-[0.08em] -mr-[0.2em] -mt-[0.25em] inline-block overflow-hidden pb-[0.1em] pl-[0.08em] pr-[0.2em] pt-[0.25em] align-bottom">
            <motion.span
              className="inline-block origin-bottom-left will-change-transform"
              initial={reduce ? false : { y: "110%", rotate: 4 }}
              {...(immediate ? { animate: target } : { whileInView: target, viewport: { once: true, margin: "0px 0px -8% 0px" } })}
              transition={{ duration: 1.3, ease: EASE_SILK, delay: delay + i * stagger }}
            >
              {word}
            </motion.span>
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </span>
  );
}
