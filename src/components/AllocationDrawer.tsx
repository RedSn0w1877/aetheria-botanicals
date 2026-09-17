"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { FolioMark } from "@/components/brand/folio-mark";
import { BrassLink } from "@/components/ui/brass-link";
import { UnfurlText } from "@/components/ui/unfurl-text";
import { AllocationSheet } from "@/components/allocation/allocation-sheet";
import { FlaconSilhouette } from "@/components/allocation/flacon-silhouette";
import { RollingFigure } from "@/components/allocation/rolling-figure";
import { BATCH, VESSELS } from "@/components/allocation/vessels";
import { openAllocation } from "@/lib/allocation-store";
import { COPYRIGHT_MARK } from "@/lib/copyright";
import { useScrollAnimation } from "@/lib/gsap-lazy";
import { EASE_SILK } from "@/lib/motion";

const HEADLINE_A = `Batch ${BATCH.number} is poured by hand.`;
const HEADLINE_B = "Flacons are reserved by request.";

const STEPS = [
  { numeral: "I", title: "You send a request", body: "Name, email, the vessel you would like, and an optional monogram." },
  { numeral: "II", title: "The atelier writes back", body: "In the order requests arrive, with the pouring date for your flacon." },
  { numeral: "III", title: "Poured, stamped, sealed", body: "Filled from the macerating vat, foil-stamped and closed under wax." },
] as const;

const FACTS = [
  { value: String(BATCH.flacons), label: `Flacons in Batch ${BATCH.number}` },
  { value: String(BATCH.macerationDays), label: "Days of cold maceration" },
  { value: "0", label: "Payment taken at request" },
] as const;

/** Millimetre-style ticks for the measuring rule beside the vessels. */
const RULE_TICKS = Array.from({ length: 21 }, (_, i) => i);

/**
 * Folio V. An invitation to request a flacon from the current batch, with the
 * three vessels drawn side by side at relative scale, plus the drawer that the
 * whole page opens into.
 */
export function AllocationDrawer() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  useScrollAnimation(
    (gsap, ScrollTrigger) => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const section = sectionRef.current;
        const band = section?.querySelector<HTMLElement>("[data-vessel-band]");
        if (!section || !band) return;
        const shelf = band.querySelector<HTMLElement>("[data-shelf]");
        const rule = band.querySelector<HTMLElement>("[data-rule]");
        const numeral = section.querySelector<HTMLElement>("[data-batch-numeral]");

        // Each vessel drifts at its own depth as the band passes, like objects on a shelf.
        Array.from(band.querySelectorAll<HTMLElement>("[data-vessel]")).forEach((node, i) => {
          gsap.fromTo(
            node,
            { yPercent: 6 + i * 3 },
            {
              yPercent: -(4 + i * 3),
              ease: "none",
              scrollTrigger: { trigger: band, start: "top bottom", end: "bottom top", scrub: 1.2 },
            },
          );
        });

        // The brass shelf line and the measuring rule draw in with the scroll.
        if (shelf) {
          gsap.fromTo(
            shelf,
            { scaleX: 0 },
            {
              scaleX: 1,
              ease: "none",
              scrollTrigger: { trigger: band, start: "top 85%", end: "center 55%", scrub: 1.4 },
            },
          );
        }
        if (rule) {
          gsap.fromTo(
            rule,
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: "none",
              scrollTrigger: { trigger: band, start: "top 80%", end: "center 50%", scrub: 1.4 },
            },
          );
        }

        // The oversized batch numeral slides slowly against the headline.
        if (numeral) {
          gsap.fromTo(
            numeral,
            { xPercent: 8 },
            {
              xPercent: -10,
              ease: "none",
              scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 1.6 },
            },
          );
        }
      });
      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <>
      <section
        ref={sectionRef}
        id="allocation"
        aria-labelledby="allocation-heading"
        className="relative overflow-x-clip bg-linen pb-24 pt-20 text-rosemary md:pb-36 md:pt-28"
      >
        <div className="relative mx-auto max-w-[1320px] px-6 md:px-12">
          <FolioMark folio="V" title="Private allocation" />

          {/* A huge, faint batch number behind the headline. */}
          <span
            aria-hidden
            data-batch-numeral
            className="pointer-events-none absolute right-0 top-16 select-none font-serif text-[clamp(9rem,30vw,26rem)] font-light italic leading-none text-hairline/70 md:top-10"
          >
            {BATCH.number}
          </span>

          <div className="relative mt-14 grid gap-12 md:mt-20 md:grid-cols-12 md:gap-8">
            <div className="min-w-0 md:col-span-7">
              <p className="font-sans text-[10px] uppercase tracking-[0.32em] text-rosemary/65">
                Small-batch botanical perfume
                <span aria-hidden className="mx-3 text-brass">
                  ·
                </span>
                Grasse, France
              </p>
              <h2
                id="allocation-heading"
                aria-label={`${HEADLINE_A} ${HEADLINE_B}`}
                className="mt-6 font-serif text-[clamp(2.6rem,6.4vw,5.6rem)] font-light leading-[0.98] tracking-tight"
              >
                <UnfurlText text={HEADLINE_A} stagger={0.07} />
                <UnfurlText text={HEADLINE_B} delay={0.35} stagger={0.07} className="italic text-moss" />
              </h2>
            </div>

            <div className="min-w-0 md:col-span-4 md:col-start-9 md:pt-12">
              <p className="text-[16px] font-light leading-[1.85] text-rosemary/80">
                There are {BATCH.flacons} flacons in this batch. They are allocated in the order requests arrive, and no
                payment is taken here: the atelier writes to you first, with a pouring date, before anything is filled.
              </p>

              <dl className="mt-10 grid grid-cols-3 border-t border-hairline">
                {FACTS.map((fact, i) => (
                  <div key={fact.label} className={`flex min-w-0 flex-col pt-5 ${i > 0 ? "border-l border-hairline pl-4" : "pr-4"}`}>
                    <dt className="order-2 mt-2 font-sans text-[9px] uppercase leading-relaxed tracking-[0.24em] text-rosemary/65 sm:text-[10px]">
                      {fact.label}
                    </dt>
                    <dd className="order-1 font-serif text-[clamp(2rem,4vw,2.8rem)] font-light leading-none text-rosemary">
                      <RollingFigure value={fact.value} delay={0.2 + i * 0.15} />
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-10">
                <BrassLink onClick={() => openAllocation()}>
                  Request an allocation
                  <span aria-hidden className="inline-block h-px w-8 bg-current transition-all duration-700 group-hover:w-12" />
                </BrassLink>
              </div>
            </div>
          </div>
        </div>

        {/* The vessel plate: three flacons standing on a herb-toned shelf, at relative scale. */}
        <div data-vessel-band className="relative mt-20 border-y border-hairline bg-herb md:mt-28">
          <div className="mx-auto max-w-[1320px] px-6 pb-10 pt-10 md:px-12 md:pb-14 md:pt-14">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 font-sans text-[10px] uppercase tracking-[0.32em] text-rosemary/65">
              <h3 className="text-rosemary">Plate V · The three vessels</h3>
              <p>Drawn at relative scale</p>
            </div>

            <div className="mt-8 flex gap-3 sm:gap-6 md:mt-12">
              {/* Measuring rule. */}
              <div aria-hidden className="relative hidden h-[clamp(220px,32vw,420px)] w-10 shrink-0 sm:block">
                <div data-rule className="absolute inset-y-0 right-0 w-px origin-bottom bg-rosemary/35" />
                {RULE_TICKS.map((tick) => (
                  <span
                    key={tick}
                    className={`absolute right-0 h-px bg-rosemary/35 ${tick % 5 === 0 ? "w-4" : "w-2"}`}
                    style={{ bottom: `${(tick / 20) * 100}%` }}
                  />
                ))}
                {[0, 50, 100].map((mark) => (
                  <span
                    key={mark}
                    className="absolute right-6 translate-y-1/2 font-sans text-[9px] tracking-[0.2em] text-rosemary/55"
                    style={{ bottom: `${mark}%` }}
                  >
                    {mark}
                  </span>
                ))}
              </div>

              <div className="min-w-0 flex-1">
                <ul className="grid h-[clamp(220px,32vw,420px)] grid-cols-3 items-end gap-3 sm:gap-10">
                  {VESSELS.map((vessel, i) => (
                    <li key={vessel.id} className="flex h-full min-w-0 items-end justify-center">
                      <div
                        data-vessel
                        className="group flex w-full items-end justify-center will-change-transform"
                        style={{ height: `${vessel.scale * 100}%` }}
                      >
                        <FlaconSilhouette
                          vessel={vessel.id}
                          draw
                          delay={i * 0.25}
                          title={`${vessel.volume} ${vessel.name}, line drawing`}
                          className="h-full w-auto max-w-full transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-2"
                        />
                      </div>
                    </li>
                  ))}
                </ul>
                {/* The brass shelf the vessels stand on. */}
                <div data-shelf className="h-px w-full origin-left bg-brass" />

                <ul className="mt-6 grid grid-cols-3 gap-3 sm:gap-10">
                  {VESSELS.map((vessel, i) => (
                    <motion.li
                      key={vessel.id}
                      className="min-w-0 text-center"
                      initial={reduce ? false : { y: 16 }}
                      whileInView={{ y: 0 }}
                      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
                      transition={{ duration: 1.4, ease: EASE_SILK, delay: 0.3 + i * 0.12 }}
                    >
                      <p className="font-serif text-[clamp(1.5rem,3.4vw,2.4rem)] font-light leading-none text-rosemary">
                        {vessel.volume}
                      </p>
                      <p className="mt-2 font-sans text-[9px] uppercase tracking-[0.22em] text-rosemary/70 sm:text-[10px] sm:tracking-[0.3em]">
                        {vessel.name}
                      </p>
                      <p className="mx-auto mt-3 hidden max-w-[26ch] text-[13px] font-light leading-relaxed text-rosemary/70 sm:block">
                        {vessel.note}
                      </p>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="mt-10 text-right font-sans text-[9px] uppercase tracking-[0.3em] text-rosemary/45">
              Illustration · {COPYRIGHT_MARK}
            </p>
          </div>
        </div>

        {/* How an allocation works, set as a single running line of three steps. */}
        <div className="mx-auto mt-16 max-w-[1320px] px-6 md:mt-24 md:px-12">
          <ol className="grid border-t border-hairline md:grid-cols-3">
            {STEPS.map((step, i) => (
              <li
                key={step.numeral}
                className={`relative flex gap-5 border-b border-hairline py-7 md:border-b-0 md:py-10 ${
                  i > 0 ? "md:border-l md:pl-8" : ""
                } ${i < STEPS.length - 1 ? "md:pr-8" : ""}`}
              >
                <span className="w-8 shrink-0 pt-1 font-sans text-[10px] uppercase tracking-[0.3em] text-brass">
                  {step.numeral}
                </span>
                <span className="min-w-0">
                  <span className="block font-serif text-2xl font-light italic text-rosemary">{step.title}</span>
                  <span className="mt-2 block text-[14px] font-light leading-relaxed text-rosemary/70">{step.body}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <AllocationSheet />
    </>
  );
}
