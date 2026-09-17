"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { useRef, type CSSProperties, type ReactNode } from "react";
import { ArrowDownRight } from "lucide-react";
import { FolioMark } from "@/components/brand/folio-mark";
import { ApothecaryArch } from "@/components/hero/apothecary-arch";
import { HeroStyles } from "@/components/hero/hero-styles";
import { KomorebiBackdrop } from "@/components/hero/komorebi-backdrop";
import { OpeningVeil, useVeilPhase } from "@/components/hero/opening-veil";
import { RollingNumber } from "@/components/hero/rolling-number";
import { useGlide } from "@/components/providers/lenis-provider";
import { BrassLink } from "@/components/ui/brass-link";
import { TickerBand } from "@/components/ui/ticker-band";
import { UnfurlText } from "@/components/ui/unfurl-text";
import { openAllocation } from "@/lib/allocation-store";
import { heroFlacon } from "@/lib/flacon-store";
import { useScrollAnimation } from "@/lib/gsap-lazy";

const HEADLINE = "Sculpted by terroir. Preserved by time.";

const TICKER = [
  "AUTUMN HARVEST BATCH 019",
  "COLD MACERATION: 180 DAYS",
  "WILD VETIVER & SMOKED BIRCH",
  "100% BOTANICAL EXTRACTION",
] as const;

/** Stagger for the pure-CSS rise (see hero-styles). */
const rise = (seconds: number) => ({ "--ae-delay": `${seconds}s` }) as CSSProperties;

function resetFlacon() {
  heroFlacon.capLift = 0;
  heroFlacon.vapour = 0;
  heroFlacon.spin = 0;
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <li className="inline-flex min-h-9 items-center gap-2 rounded-full border border-brass/55 bg-parchment/60 px-4 py-1.5 font-sans text-[10px] uppercase tracking-[0.26em] text-rosemary/80">
      <span aria-hidden className="size-1 shrink-0 rotate-45 bg-brass" />
      <span>{children}</span>
    </li>
  );
}

/** Serif numerals inside the tracked sans badges. */
function Figure({ value, delay }: { value: string; delay: number }) {
  return (
    <RollingNumber
      value={value}
      delay={delay}
      className="mx-[0.1em] align-[-0.26em] font-serif text-[15px] font-normal italic normal-case tracking-normal text-rosemary"
    />
  );
}

/**
 * Folio I — the atelier.
 *
 * Plain language first (the kicker says exactly what this is), then the poetry of the
 * headline. The flacon's stopper lifts and vapour rises as the visitor scrolls away,
 * scrubbed by a GSAP timeline that writes straight into the 3D scene's store.
 */
export function ApothecaryHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { glideTo } = useGlide();
  const veil = useVeilPhase();

  // While the opening veil covers the page, the headline and drawing play unseen.
  // A new key when it lifts remounts them, so the entrance plays again in view.
  const revealKey = veil === "veiled" ? "veiled" : "open";
  const afterVeil = veil === "lifting" ? 0.25 : 0;

  useScrollAnimation(
    (gsap) => {
      const section = sectionRef.current;
      if (!section) return;
      const mm = gsap.matchMedia();

      mm.add(
        { motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" },
        (context) => {
          const { motion } = context.conditions as { motion: boolean; reduce: boolean };
          if (!motion) {
            resetFlacon();
            return;
          }

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: { trigger: section, start: "top top", end: "+=80%", scrub: 1.4 },
          });

          tl.to(heroFlacon, { capLift: 1, vapour: 1, spin: 0.8 }, 0)
            .to("[data-hero-line='0']", { yPercent: -28 }, 0)
            .to("[data-hero-line='1']", { yPercent: -62 }, 0)
            .to("[data-hero-tail]", { y: -36 }, 0)
            .to("[data-hero-kicker]", { y: -14 }, 0)
            .to("[data-hero-arch]", { scale: 1.05, y: -28, transformOrigin: "50% 100%" }, 0);

          return () => resetFlacon();
        },
      );

      return () => {
        mm.revert();
        resetFlacon();
      };
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="atelier"
      ref={sectionRef}
      aria-labelledby="atelier-title"
      className="relative isolate flex flex-col overflow-hidden bg-linen lg:min-h-svh"
    >
      <HeroStyles />
      <OpeningVeil />
      <KomorebiBackdrop targetRef={sectionRef} />

      <div className="relative mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-4 pt-24 sm:px-8 lg:px-12 lg:pt-[5.75rem]">
        <FolioMark folio="I" title="The atelier" />

        <div className="grid flex-1 items-center gap-16 pb-14 pt-10 lg:grid-cols-[minmax(0,1.32fr)_minmax(0,1fr)] lg:gap-8 lg:py-8">
          <div className="min-w-0">
            <div data-hero-kicker>
              <p
                className="ae-rise flex items-start gap-4 font-sans text-[10px] uppercase leading-relaxed tracking-[0.3em] text-rosemary/75 sm:items-center sm:text-[11px]"
                style={rise(0.1)}
              >
                <span aria-hidden className="mt-[0.7em] h-px w-10 shrink-0 bg-brass sm:mt-0" />
                <span>Aetheria Botanicals — botanical perfume atelier, Grasse</span>
              </p>
            </div>

            <h1
              id="atelier-title"
              aria-label={HEADLINE}
              className="ae-unfurl mt-6 font-serif text-[clamp(3rem,13vw,4.25rem)] font-light leading-[0.95] tracking-[-0.02em] text-rosemary md:text-[clamp(4.25rem,9vw,5.75rem)] lg:mt-7 lg:text-[clamp(4.25rem,5.5vw,6.4rem)]"
            >
              <span data-hero-line="0" className="flex flex-wrap items-baseline gap-x-[0.24em]">
                <UnfurlText key={`sculpted-${revealKey}`} text="Sculpted by" immediate delay={0.2 + afterVeil} />
                <UnfurlText
                  key={`terroir-${revealKey}`}
                  text="terroir."
                  immediate
                  delay={0.42 + afterVeil}
                  className="italic text-terracotta"
                />
              </span>
              <span data-hero-line="1" className="flex flex-wrap items-baseline gap-x-[0.24em] sm:pl-[0.9em]">
                <UnfurlText key={`preserved-${revealKey}`} text="Preserved by" immediate delay={0.6 + afterVeil} />
                <UnfurlText
                  key={`time-${revealKey}`}
                  text="time."
                  immediate
                  delay={0.84 + afterVeil}
                  className="italic text-brass"
                />
              </span>
            </h1>

            <div data-hero-tail>
              <p
                className="ae-rise mt-7 max-w-[33rem] font-sans text-[15px] font-light leading-[1.8] text-rosemary/80 sm:text-[17px] lg:mt-8"
                style={rise(0.7)}
              >
                Small-batch perfume made from wild-foraged plants, left to steep in the cold for 180 days, then
                bottled by hand in our Grasse atelier.
              </p>

              <ul aria-label="This batch" className="ae-rise mt-7 flex flex-wrap gap-2.5" style={rise(0.9)}>
                <Badge>
                  Batch <Figure value="019" delay={1.1} /> · Autumn harvest
                </Badge>
                <Badge>
                  <Figure value="180" delay={1.25} /> days cold maceration
                </Badge>
                <Badge>
                  <Figure value="100" delay={1.4} />% botanical
                </Badge>
              </ul>

              <div className="ae-rise mt-9 flex flex-wrap items-center gap-x-8 gap-y-5 lg:mt-10" style={rise(1.1)}>
                <BrassLink onClick={() => glideTo("#blender")}>
                  Explore the apothecary
                  <ArrowDownRight
                    aria-hidden
                    strokeWidth={1.25}
                    className="size-4 transition-transform duration-700 group-hover:translate-x-0.5 group-hover:translate-y-0.5"
                  />
                </BrassLink>
                <button
                  type="button"
                  onClick={() => openAllocation()}
                  className="group relative inline-flex min-h-11 items-center font-sans text-[11px] uppercase tracking-[0.3em] text-rosemary/80 transition-colors duration-500 hover:text-rosemary"
                >
                  Request an allocation
                  <span aria-hidden className="absolute inset-x-0 bottom-2 h-px bg-rosemary/20" />
                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-2 h-px origin-left scale-x-0 bg-terracotta transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100"
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="min-w-0">
            <ApothecaryArch drawingKey={`drawing-${revealKey}`} drawingDelay={0.5 + afterVeil} />
          </div>
        </div>
      </div>

      <TickerBand
        items={TICKER}
        seconds={70}
        className="relative border-y border-hairline bg-parchment py-3.5 font-sans text-[10px] uppercase tracking-[0.3em] text-rosemary/70"
      />
    </section>
  );
}
