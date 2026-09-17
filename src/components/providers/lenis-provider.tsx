"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import Lenis from "lenis";
import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

type Target = string | HTMLElement | number;

type ScrollApi = {
  /** Glide to an element, selector or pixel offset. Falls back to native scrolling. */
  glideTo: (target: Target, options?: { offset?: number; duration?: number }) => void;
  /** Freeze page scroll while a drawer or dialog is open. */
  hold: () => void;
  release: () => void;
};

/** Height of the fixed header, so anchored sections don't tuck underneath it. */
export const HEADER_OFFSET = -72;

const ScrollContext = createContext<ScrollApi>({
  glideTo: () => {},
  hold: () => {},
  release: () => {},
});

export const useGlide = () => useContext(ScrollContext);

/**
 * Lenis gives the page its weighted, inertial scroll. A low `lerp` means each
 * wheel tick eases in over several frames — the unhurried feel the brand wants.
 *
 * Lenis is driven from GSAP's ticker so there's one animation clock for the whole
 * page, and every Lenis scroll event nudges ScrollTrigger so pinned and scrubbed
 * timelines never drift out of sync with what's on screen.
 */
export function LenisProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ lerp: 0.07, wheelMultiplier: 0.9, smoothWheel: true });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);

    const raf = (seconds: number) => lenis.raf(seconds * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const api = useMemo<ScrollApi>(
    () => ({
      glideTo: (target, options) => {
        const offset = options?.offset ?? HEADER_OFFSET;
        const lenis = lenisRef.current;
        if (lenis) {
          lenis.scrollTo(target, { offset, duration: options?.duration ?? 1.8 });
          return;
        }
        if (typeof target === "number") {
          window.scrollTo({ top: target });
          return;
        }
        const node = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
        if (node) window.scrollTo({ top: node.getBoundingClientRect().top + window.scrollY + offset });
      },
      hold: () => {
        lenisRef.current?.stop();
        document.documentElement.style.overflow = "hidden";
      },
      release: () => {
        lenisRef.current?.start();
        document.documentElement.style.overflow = "";
      },
    }),
    [],
  );

  return <ScrollContext.Provider value={api}>{children}</ScrollContext.Provider>;
}
