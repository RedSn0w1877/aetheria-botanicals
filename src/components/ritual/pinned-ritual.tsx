"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { motion, useMotionValue } from "motion/react";
import { useMemo, useRef, useState } from "react";
import { useGlide } from "@/components/providers/lenis-provider";
import { useScrollAnimation } from "@/lib/gsap-lazy";
import type { ScrollTrigger as ScrollTriggerInstance } from "gsap/ScrollTrigger";
import { EASE_SILK } from "@/lib/motion";
import type { RitualPhase } from "@/lib/ritual-phases";
import { PhaseMetrics, RitualPlate } from "./phase-parts";

/** Same query as the Tailwind classes that reveal this layout (`lg:motion-safe:`). */
const PINNED_QUERY = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";

/**
 * If JavaScript never runs, the horizontal track would hide phases II–IV off to
 * the side. This fallback stacks the panels vertically instead.
 */
const NO_SCRIPT_CSS =
  "[data-ritual-stage]{height:auto!important;overflow:visible!important}" +
  "[data-ritual-track]{flex-direction:column!important}" +
  "[data-ritual-selector]{display:none!important}" +
  "[data-ritual-panel]{height:auto!important;padding-bottom:4rem}" +
  "[data-ritual-plate]{height:36rem!important}";

/**
 * Desktop: the stage pins to the viewport and the four panels travel sideways
 * as the page scrolls, like turning the leaves of a long folded map. Each plate
 * draws itself as its panel arrives, driven by a ScrollTrigger that watches the
 * horizontal tween (`containerAnimation`) rather than the page.
 */
export function PinnedRitual({ phases }: { phases: readonly RitualPhase[] }) {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const pinTrigger = useRef<ScrollTriggerInstance | null>(null);
  const activeRef = useRef(0);

  const [active, setActive] = useState(0);
  const [plays, setPlays] = useState<readonly number[]>(() => phases.map(() => 0));
  const { glideTo } = useGlide();

  // One progress value per plate. They start at 1 so the server render and
  // no-JS visitors see finished drawings; the scroll timeline rewinds them.
  const p0 = useMotionValue(1);
  const p1 = useMotionValue(1);
  const p2 = useMotionValue(1);
  const p3 = useMotionValue(1);
  const progresses = useMemo(() => [p0, p1, p2, p3], [p0, p1, p2, p3]);
  const last = phases.length - 1;

  useScrollAnimation(
    (gsap, ScrollTrigger) => {
      const mm = gsap.matchMedia();

      mm.add(PINNED_QUERY, () => {
        const stageEl = stage.current;
        const trackEl = track.current;
        const barEl = bar.current;
        if (!stageEl || !trackEl || !barEl) return;

        const panels = gsap.utils.toArray<HTMLElement>("[data-ritual-panel]", trackEl);
        const setBar = gsap.quickSetter(barEl, "scaleX");
        const distance = () => Math.max(0, trackEl.scrollWidth - stageEl.clientWidth);

        progresses.forEach((p) => p.set(0));
        setBar(0);

        const markActive = (ratio: number) => {
          setBar(ratio);
          const index = Math.min(last, Math.max(0, Math.round(ratio * last)));
          if (index === activeRef.current) return;
          activeRef.current = index;
          setActive(index);
          setPlays((prev) => prev.map((value, i) => (i === index ? value + 1 : value)));
        };

        const travel = gsap.to(trackEl, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: stageEl,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
          // GSAP fires the first update while the tween is still being constructed,
          // so read progress from the tween itself (`this`), not the outer variable.
          onUpdate(this: gsap.core.Tween) {
            markActive(this.progress());
          },
        });
        pinTrigger.current = travel.scrollTrigger ?? null;

        // Plate I draws while the stage rises into view, so it is complete when the pin catches.
        ScrollTrigger.create({
          trigger: stageEl,
          start: "top 85%",
          end: "top top",
          onUpdate: (self) => progresses[0]?.set(self.progress),
        });

        panels.forEach((panel, i) => {
          if (i > 0) {
            ScrollTrigger.create({
              trigger: panel,
              containerAnimation: travel,
              start: "left 85%",
              end: "left 8%",
              onUpdate: (self) => progresses[i]?.set(self.progress),
            });
          }

          // Parallax: the huge numeral drifts faster than the panel, the plate a touch slower.
          const numeral = panel.querySelector<HTMLElement>("[data-ritual-numeral]");
          const plate = panel.querySelector<HTMLElement>("[data-ritual-plate]");
          const window = i === 0 ? { start: "left left", end: "right left" } : { start: "left right", end: "right left" };
          if (numeral) {
            gsap.fromTo(
              numeral,
              { xPercent: i === 0 ? 0 : 40 },
              { xPercent: -40, ease: "none", scrollTrigger: { trigger: panel, containerAnimation: travel, scrub: true, ...window } },
            );
          }
          if (plate) {
            gsap.fromTo(
              plate,
              { xPercent: i === 0 ? 0 : -10, rotate: i === 0 ? 0 : 1.2 },
              {
                xPercent: 10,
                rotate: -1.2,
                ease: "none",
                scrollTrigger: { trigger: panel, containerAnimation: travel, scrub: true, ...window },
              },
            );
          }
        });

        return () => {
          pinTrigger.current = null;
          activeRef.current = 0;
          progresses.forEach((p) => p.set(1));
        };
      });

      return () => mm.revert();
    },
    { scope: root, dependencies: [progresses, last] },
  );

  const jumpTo = (index: number) => {
    const trigger = pinTrigger.current;
    if (!trigger) {
      glideTo(`#ritual-panel-${phases[index]?.id ?? ""}`);
      return;
    }
    const target = trigger.start + (trigger.end - trigger.start) * (index / last);
    const hops = Math.abs(index - activeRef.current);
    glideTo(Math.round(target), { offset: 0, duration: 1.4 + hops * 0.5 });
  };

  return (
    <div ref={root}>
      <noscript>
        <style>{NO_SCRIPT_CSS}</style>
      </noscript>
      <div ref={stage} data-ritual-stage className="relative flex h-svh flex-col overflow-hidden bg-linen">
        {/* Phase selector */}
        <div data-ritual-selector className="relative z-10 mx-auto w-full max-w-[1440px] px-10 pt-[88px]">
          <div className="flex items-end justify-between gap-8">
            <p className="pb-3 font-sans text-[10px] uppercase tracking-[0.32em] text-rosemary/60">
              Step <span className="text-rosemary">{phases[active]?.numeral}</span> of {phases[last]?.numeral}
              <span aria-hidden className="mx-3 text-brass">
                ·
              </span>
              <span className="text-rosemary">{phases[active]?.short}</span>
            </p>
            <div role="group" aria-label="Jump to a step of the ritual" className="flex">
              {phases.map((phase, i) => {
                const on = i === active;
                return (
                  <button
                    key={phase.id}
                    type="button"
                    onClick={() => jumpTo(i)}
                    aria-current={on ? "step" : undefined}
                    aria-label={`Step ${phase.numeral}: ${phase.title}`}
                    className={`group relative flex min-h-11 items-baseline gap-2 px-4 pb-3 pt-2 transition-colors duration-700 ${
                      on ? "text-rosemary" : "text-rosemary/45 hover:text-rosemary"
                    }`}
                  >
                    <span className="font-serif text-2xl font-light italic leading-none">{phase.numeral}</span>
                    <span className="font-sans text-[10px] uppercase tracking-[0.28em]">{phase.short}</span>
                    {on ? (
                      <motion.span
                        layoutId="ritual-pinned-marker"
                        aria-hidden
                        className="absolute inset-x-3 bottom-0 h-[2px] bg-brass"
                        transition={{ duration: 0.9, ease: EASE_SILK }}
                      />
                    ) : (
                      <span
                        aria-hidden
                        className="absolute inset-x-3 bottom-0 h-px origin-left scale-x-0 bg-rosemary/30 transition-transform duration-700 group-hover:scale-x-100"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <div aria-hidden className="relative h-px bg-hairline">
            <span ref={bar} className="absolute inset-0 origin-left scale-x-0 bg-brass" />
          </div>
        </div>

        {/* The travelling track */}
        <div ref={track} data-ritual-track className="flex min-h-0 flex-1 will-change-transform">
          {phases.map((phase, i) => (
            <article
              key={phase.id}
              id={`ritual-panel-${phase.id}`}
              data-ritual-panel
              aria-labelledby={`ritual-pinned-title-${phase.id}`}
              className="relative flex h-full w-full shrink-0 flex-col"
            >
              <div className="mx-auto grid min-h-0 w-full max-w-[1440px] flex-1 grid-cols-12 gap-10 px-10 xl:gap-16">
                <div className="col-span-6 flex min-w-0 flex-col justify-center gap-[clamp(0.75rem,2.4vh,1.75rem)] py-6">
                  <div className="flex items-end gap-6">
                    <span
                      data-ritual-numeral
                      aria-hidden
                      className="block font-serif text-[clamp(5rem,min(13vw,19vh),12rem)] font-light italic leading-[0.78] tracking-tight text-rosemary/15"
                    >
                      {phase.numeral}
                    </span>
                    <span className="pb-2 font-sans text-[10px] uppercase tracking-[0.32em] text-rosemary/60">
                      {phase.place}
                    </span>
                  </div>
                  <h3
                    id={`ritual-pinned-title-${phase.id}`}
                    className="max-w-[16ch] font-serif text-[clamp(2rem,min(3.9vw,6.6vh),4rem)] font-light leading-[0.98] tracking-tight text-rosemary"
                  >
                    <span className="sr-only">Step {phase.numeral}: </span>
                    {phase.title}
                  </h3>
                  <p className="max-w-[46ch] font-sans text-[clamp(13px,1.95vh,16px)] font-light leading-[1.7] text-rosemary/80">
                    {phase.description}
                  </p>
                  <div className="max-w-xl">
                    <PhaseMetrics metrics={phase.metrics} play={plays[i] ?? 0} />
                  </div>
                </div>
                <div className="col-span-6 flex min-h-0 min-w-0 items-center justify-center py-[clamp(1rem,3vh,2.5rem)]">
                  <div data-ritual-plate className="aspect-[5/6] h-full max-h-[680px] max-w-full">
                    <RitualPlate phase={phase} progress={progresses[i] ?? p0} className="h-full w-full" />
                  </div>
                </div>
              </div>
              <div className="mx-auto flex w-full max-w-[1440px] items-center gap-6 px-10 pb-5 font-sans text-[10px] uppercase tracking-[0.32em] text-rosemary/50">
                <span className="text-rosemary/70">
                  {phase.numeral} / {phases[last]?.numeral}
                </span>
                <span aria-hidden className="h-px flex-1 bg-hairline" />
                <span>{i < last ? `Next — ${phases[i + 1]?.short ?? ""}` : "Sealed and resting"}</span>
              </div>
              {i > 0 ? <span aria-hidden className="absolute inset-y-10 left-0 w-px bg-hairline" /> : null}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
