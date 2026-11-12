"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { useEffect } from "react";
import { REDUCED_MOTION } from "@/lib/device";

/**
 * Ink-in for every hand-drawn line in the book. Renders nothing; mounted last in page.tsx, so its
 * effect runs once the whole page has hydrated (it also leaves the 'aetheria:hydrated' mark).
 *
 * Drawings ship complete. On mount, unless the visitor prefers reduced motion or the device is lite,
 * ONE IntersectionObserver watches every [data-ink] drawing. Its first report (which costs no forced
 * layout, unlike reading each rect) sorts them: what is already on screen is marked "instant" and
 * never rewinds; what is off screen is marked "wait" (globals.css rewinds its .ink paths while it
 * waits), and html gets .ink-ready. A waiting drawing flips to "draw" once 30% of it is visible, which
 * runs the stroke-dashoffset transition once, then it is no longer watched.
 * Drawings that mount later are left alone (complete); they can opt into data-ink-now instead.
 */
export function InkObserver() {
  useEffect(() => {
    const root = document.documentElement;
    performance.mark("aetheria:hydrated");
    root.dataset.hydrated = "1";

    if (root.hasAttribute("data-lite") || window.matchMedia(REDUCED_MOTION).matches) return;

    // Re-runs (StrictMode in dev) pick "wait" drawings up again; finished ones are left alone.
    const drawings = [...document.querySelectorAll<HTMLElement>("[data-ink]")].filter((drawing) => {
      const state = drawing.dataset.inked;
      return state !== "instant" && state !== "draw";
    });
    if (drawings.length === 0) return;

    const sorted = new WeakSet<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        let first = false;
        for (const entry of entries) {
          const drawing = entry.target as HTMLElement;
          if (!sorted.has(drawing)) {
            sorted.add(drawing);
            first = true;
            if (entry.isIntersecting) {
              drawing.dataset.inked = "instant";
              observer.unobserve(drawing);
            } else {
              drawing.dataset.inked = "wait";
            }
            continue;
          }
          if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
            drawing.dataset.inked = "draw";
            observer.unobserve(drawing);
          }
        }
        if (first) root.classList.add("ink-ready");
      },
      { threshold: [0, 0.3] },
    );
    drawings.forEach((drawing) => observer.observe(drawing));
    return () => observer.disconnect();
  }, []);

  return null;
}
