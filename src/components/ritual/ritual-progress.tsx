"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { useEffect } from "react";

/** Scrub mode's media half; ritual.module.css uses the same query. Under 641px tall the plate stays static. */
export const SCRUB_QUERY = "(prefers-reduced-motion: no-preference) and (min-height: 641px)";

/**
 * Whether chapter IV scrubs its plates with the scroll: scripted page, not lite, motion allowed, tall
 * enough. Call it at event or effect time, never during render.
 */
export function scrubMode(): boolean {
  if (typeof document === "undefined") return false;
  const root = document.documentElement;
  return root.classList.contains("js") && !root.hasAttribute("data-lite") && window.matchMedia(SCRUB_QUERY).matches;
}

/**
 * The fallback for browsers without CSS scroll-driven animations (Firefox today). Where
 * `animation-timeline: view()` works this renders nothing and runs nothing. Otherwise it writes the
 * same --p the view timeline would (on the stage and each plate), from passive scroll and resize listeners that exist only while
 * the chapter is on screen (one IntersectionObserver), coalesced to one write per frame.
 */
export function RitualProgress() {
  useEffect(() => {
    if (CSS.supports("animation-timeline: view()") || !scrubMode()) return;
    const rt = document.querySelector<HTMLElement>("[data-rt]");
    const steps = rt?.querySelector<HTMLElement>("[data-rt-steps]");
    const stage = rt?.querySelector<HTMLElement>("[data-rt-stage]");
    if (!rt || !steps || !stage) return;
    // --p does not inherit (globals.css), so it is written on the stage and on each of its plates.
    const targets = [stage, ...stage.querySelectorAll<HTMLElement>(":scope > figure")];

    let frame = 0;
    let listening = false;
    const write = () => {
      frame = 0;
      const height = window.innerHeight;
      const p = (height - steps.getBoundingClientRect().top) / (steps.offsetHeight + height);
      const value = Math.min(1, Math.max(0, p)).toFixed(4);
      for (const target of targets) target.style.setProperty("--p", value);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(write);
    };
    const listen = (on: boolean) => {
      if (on === listening) return;
      listening = on;
      if (on) {
        window.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", schedule, { passive: true });
      } else {
        window.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", schedule);
      }
      schedule();
    };

    const observer = new IntersectionObserver(([entry]) => listen(Boolean(entry?.isIntersecting)));
    observer.observe(rt);
    return () => {
      observer.disconnect();
      listen(false);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
