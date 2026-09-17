"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { useEffect, useSyncExternalStore } from "react";
import { motion } from "motion/react";
import { COPYRIGHT_MARK } from "@/lib/copyright";
import { EASE_DRIFT, EASE_SILK } from "@/lib/motion";
import { REDUCED_MOTION_QUERY, useHydrated } from "./use-client-flags";

/**
 * The opening veil: a sheet of linen with the wordmark writing itself, which then
 * lifts away like a curtain. Shown once per browser session.
 *
 * Safety rails, because an intro must never trap anyone:
 * - Nothing renders on the server or during hydration.
 * - Reduced-motion visitors and repeat visits skip it entirely.
 * - Click or Escape lifts it early.
 * - A hard deadline tears it down 2.4s after it appears, whatever else happens.
 * - While lifting it ignores the pointer, so clicks fall through to the page.
 */

export type VeilPhase = "pending" | "veiled" | "lifting" | "lifted";

const SEEN_KEY = "aetheria:veil-seen";
const LIFT_AT_MS = 1600;
const LIFT_MS = 800;
const TEARDOWN_MS = LIFT_AT_MS + LIFT_MS; // 2400ms — inside the 2.5s promise.

const ORDER: Record<VeilPhase, number> = { pending: 0, veiled: 1, lifting: 2, lifted: 3 };

// A tiny module-level store so the hero can replay its entrance once the veil lifts.
let phase: VeilPhase = "pending";
let deadline = 0;
const listeners = new Set<() => void>();

/** Phases only ever move forward, so a late timer can never re-cover the page. */
function advance(next: VeilPhase) {
  if (ORDER[next] <= ORDER[phase]) return;
  phase = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const serverPhase = (): VeilPhase => "pending";

export function useVeilPhase(): VeilPhase {
  return useSyncExternalStore(subscribe, () => phase, serverPhase);
}

function skip() {
  deadline = Math.min(deadline, performance.now() + LIFT_MS + 60);
  advance("lifting");
}

export function OpeningVeil() {
  const hydrated = useHydrated();
  const current = useVeilPhase();

  // Decide once, after mount, whether this visit gets the veil.
  useEffect(() => {
    if (phase !== "pending") return;
    let show = false;
    try {
      const reduced = window.matchMedia(REDUCED_MOTION_QUERY).matches;
      show = !reduced && window.sessionStorage.getItem(SEEN_KEY) !== "1";
      if (show) window.sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      show = false;
    }
    if (show) {
      deadline = performance.now() + TEARDOWN_MS;
      advance("veiled");
    } else {
      advance("lifted");
    }
  }, []);

  // Lift on schedule, and tear down by the hard deadline no matter what.
  useEffect(() => {
    if (current !== "veiled" && current !== "lifting") return;
    const now = performance.now();
    const timers: number[] = [];
    if (current === "veiled") {
      const liftIn = Math.max(0, deadline - LIFT_MS - now);
      timers.push(window.setTimeout(() => advance("lifting"), liftIn));
    }
    timers.push(window.setTimeout(() => advance("lifted"), Math.max(0, deadline - now)));
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [current]);

  useEffect(() => {
    if (current !== "veiled") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") skip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current]);

  if (!hydrated || current === "pending" || current === "lifted") return null;

  const lifting = current === "lifting";

  return (
    <motion.div
      aria-hidden
      onClick={skip}
      className="fixed inset-0 z-[58] flex cursor-pointer flex-col items-center justify-center bg-linen px-6"
      style={{ pointerEvents: lifting ? "none" : "auto" }}
      initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
      animate={{ clipPath: lifting ? "inset(0% 0% 100% 0%)" : "inset(0% 0% 0% 0%)" }}
      transition={{ duration: LIFT_MS / 1000, ease: EASE_SILK }}
    >
      <motion.div
        className="flex w-full max-w-[34rem] flex-col items-center"
        animate={{ y: lifting ? "-8vh" : "0vh" }}
        transition={{ duration: LIFT_MS / 1000, ease: EASE_SILK }}
      >
        <motion.p
          className="font-sans text-[10px] uppercase tracking-[0.42em] text-rosemary/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, ease: EASE_DRIFT, delay: 0.15 }}
        >
          Botanical perfume atelier · Grasse
        </motion.p>

        <svg viewBox="0 0 520 170" className="mt-4 w-full overflow-visible text-rosemary" role="presentation">
          <motion.text
            x="260"
            y="112"
            textAnchor="middle"
            fontSize="124"
            fontStyle="italic"
            fontWeight={300}
            stroke="currentColor"
            strokeWidth={0.7}
            fill="currentColor"
            strokeDasharray={1600}
            style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif" }}
            initial={{ strokeDashoffset: 1600, fillOpacity: 0 }}
            animate={{ strokeDashoffset: 0, fillOpacity: 1 }}
            transition={{
              strokeDashoffset: { duration: 1.35, ease: EASE_DRIFT },
              fillOpacity: { duration: 0.8, ease: EASE_DRIFT, delay: 0.7 },
            }}
          >
            Aetheria
          </motion.text>
          <motion.path
            d="M70 146 C 160 134 230 156 300 144 S 420 132 452 140"
            fill="none"
            stroke="#a88243"
            strokeWidth={1}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.1, ease: EASE_SILK, delay: 0.45 }}
          />
          <motion.circle
            cx="452"
            cy="140"
            r="2.4"
            fill="#a88243"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, ease: EASE_SILK, delay: 1.3 }}
          />
        </svg>
      </motion.div>

      <div className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-2 font-sans text-[9px] uppercase tracking-[0.36em] text-rosemary/50">
        <span>Click or press Esc to enter</span>
        <span>{COPYRIGHT_MARK} — do not redistribute</span>
      </div>
    </motion.div>
  );
}
