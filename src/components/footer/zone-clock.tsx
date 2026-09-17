"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EASE_SILK } from "@/lib/motion";

/*
 * A shared one-second clock.
 *
 * The time lives outside React. The server (and the hydrating client) always
 * read 0, which renders a neutral placeholder, so the HTML matches exactly.
 * Once a clock subscribes, the store samples the real time and ticks on each
 * whole second; React notices the new snapshot and re-renders. With no
 * subscribers left, the timer stops.
 */
let now = 0;
let timer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

function schedule() {
  timer = setTimeout(tick, 1000 - (Date.now() % 1000) + 8);
}

function tick() {
  now = Date.now();
  listeners.forEach((listener) => listener());
  schedule();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    now = Date.now();
    schedule();
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };
}

const getSnapshot = () => now;
const getServerSnapshot = () => 0;

function useNow() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

type Formatters = { time: Intl.DateTimeFormat; offset: Intl.DateTimeFormat };
const formatterCache = new Map<string, Formatters>();

function formattersFor(timeZone: string): Formatters {
  const cached = formatterCache.get(timeZone);
  if (cached) return cached;
  const created: Formatters = {
    time: new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }),
    offset: new Intl.DateTimeFormat("en-GB", { timeZone, timeZoneName: "shortOffset" }),
  };
  formatterCache.set(timeZone, created);
  return created;
}

type Reading = { h: number; m: number; s: number; text: string; offset: string };

function read(timestamp: number, timeZone: string): Reading {
  const { time, offset } = formattersFor(timeZone);
  const parts = time.formatToParts(timestamp);
  const pick = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const h = pick("hour");
  const m = pick("minute");
  const s = pick("second");
  const pad = (n: number) => String(n).padStart(2, "0");
  const zone = offset.formatToParts(timestamp).find((p) => p.type === "timeZoneName")?.value ?? "";
  return { h, m, s, text: `${pad(h)}:${pad(m)}:${pad(s)}`, offset: zone.replace("GMT", "UTC") };
}

function dayPart(hour: number): string {
  if (hour < 5) return "Night";
  if (hour < 8) return "First light";
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  if (hour < 21) return "Evening";
  return "Night";
}

const PLACEHOLDER = "--:--:--";

/**
 * Local time at one of the laboratories: a hairline dial plus rolling digits.
 * Digits that change slide up out of a mask; the rest stay perfectly still.
 */
export function ZoneClock({ timeZone, place }: { timeZone: string; place: string }) {
  const reduce = useReducedMotion();
  const timestamp = useNow();
  const reading = timestamp === 0 ? null : read(timestamp, timeZone);
  const text = reading?.text ?? PLACEHOLDER;

  const hourDeg = reading ? ((reading.h % 12) + reading.m / 60) * 30 : 0;
  const minuteDeg = reading ? (reading.m + reading.s / 60) * 6 : 0;
  const secondDeg = reading ? reading.s * 6 : 0;

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 48 48" className="h-12 w-12 shrink-0" aria-hidden>
        <circle cx="24" cy="24" r="22" fill="none" stroke="#a88243" strokeOpacity="0.7" strokeWidth="0.75" />
        {Array.from({ length: 12 }, (_, i) => (
          <line
            key={i}
            x1="24"
            y1={i % 3 === 0 ? 4.5 : 5.5}
            x2="24"
            y2="7.5"
            stroke="#f5f2eb"
            strokeOpacity={i % 3 === 0 ? 0.7 : 0.35}
            strokeWidth="0.75"
            transform={`rotate(${i * 30} 24 24)`}
          />
        ))}
        <g opacity={reading ? 1 : 0} style={{ transition: "opacity 1.2s ease" }}>
          <line x1="24" y1="24" x2="24" y2="13" stroke="#f5f2eb" strokeWidth="1.4" strokeLinecap="round" transform={`rotate(${hourDeg} 24 24)`} />
          <line x1="24" y1="26" x2="24" y2="8.5" stroke="#f5f2eb" strokeWidth="0.9" strokeLinecap="round" transform={`rotate(${minuteDeg} 24 24)`} />
          <line x1="24" y1="28" x2="24" y2="6.5" stroke="#b8583d" strokeWidth="0.6" strokeLinecap="round" transform={`rotate(${secondDeg} 24 24)`} />
        </g>
        <circle cx="24" cy="24" r="1.3" fill="#a88243" />
      </svg>

      <div className="min-w-0">
        <p className="font-serif text-3xl font-light leading-none text-linen [font-feature-settings:'lnum','tnum']">
          <span className="sr-only">
            {reading ? `Local time in ${place}: ${reading.text.slice(0, 5)}` : `Local time in ${place}`}
          </span>
          <span aria-hidden className="inline-flex">
            {text.split("").map((char, i) => (
              <span key={i} className="relative inline-block h-[1.1em] overflow-hidden leading-[1.1em]">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={char}
                    className="inline-block"
                    initial={reduce ? { opacity: 0 } : { y: "100%" }}
                    animate={reduce ? { opacity: 1 } : { y: "0%" }}
                    exit={reduce ? { opacity: 0 } : { y: "-100%" }}
                    transition={{ duration: reduce ? 0.2 : 0.7, ease: EASE_SILK }}
                  >
                    {char}
                  </motion.span>
                </AnimatePresence>
              </span>
            ))}
          </span>
        </p>
        <p className="mt-2 font-sans text-[10px] uppercase tracking-[0.28em] text-linen/65">
          {reading ? `${dayPart(reading.h)} · ${reading.offset}` : "Local time"}
        </p>
      </div>
    </div>
  );
}
