"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import type { MouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { FolioMark } from "@/components/brand/folio-mark";
import { Wordmark } from "@/components/footer/wordmark";
import { ZoneClock } from "@/components/footer/zone-clock";
import { useGlide } from "@/components/providers/lenis-provider";
import { BrassLink } from "@/components/ui/brass-link";
import { TickerBand } from "@/components/ui/ticker-band";
import { BRAND, COPYRIGHT_LINE, FICTION_NOTICE, STUDIO } from "@/lib/copyright";
import { EASE_SILK } from "@/lib/motion";

const ARCHIVE = ["Archive AE/019/2026", "Ledger vol. VII", "Plate 04 of 06"] as const;

const CHARTER = [
  "We never take more than a third of any wild stand, and we always leave the roots.",
  "We only harvest land we have walked with the people who tend it.",
  "Every plant is weighed, dated and traced to its hillside in the ledger.",
  "Maceration runs cold and slow: 180 days, with no heat applied.",
  "Spent botanicals return, as compost, to the soil they came from.",
] as const;

const ROMAN = ["I", "II", "III", "IV", "V"] as const;

const LABORATORIES = [
  {
    city: "Grasse",
    country: "France",
    role: "Maceration and pouring",
    coordinates: "43.6588° N, 6.9237° E",
    timeZone: "Europe/Paris",
  },
  {
    city: "Kyoto",
    country: "Japan",
    role: "Wood, moss and resin studies",
    coordinates: "35.0116° N, 135.7681° E",
    timeZone: "Asia/Tokyo",
  },
] as const;

const INDEX = [
  { href: "/#blender", hash: "#blender", label: "The compound blender" },
  { href: "/#terroir", hash: "#terroir", label: "Terroir and harvests" },
  { href: "/#ritual", hash: "#ritual", label: "The extraction ritual" },
] as const;

const FORAGING_CALENDAR = [
  "Mimosa — February",
  "Hinoki — March",
  "Rose de mai — May",
  "Lavender — July",
  "Jasmine — August",
  "Tuberose — September",
  "Vetiver — October",
  "Bergamot — November",
  "Yuzu — December",
  "Oakmoss — January",
] as const;

/**
 * Folio VI, the colophon. Shared by the home page and the legal pages, so every
 * internal link goes through next/link (it respects the deploy basePath).
 */
export function MonographFooter() {
  const { glideTo } = useGlide();
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const onHome = pathname === "/";

  // On the home page, section links glide instead of jumping.
  const glideIfHome = (hash: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (!onHome || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    glideTo(hash);
    window.history.replaceState(null, "", hash);
  };

  const rule = (delay = 0) => (
    <motion.div
      aria-hidden
      className="h-px w-full origin-left bg-linen/15"
      initial={reduce ? false : { scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: "0px 0px -5% 0px" }}
      transition={{ duration: 2.2, ease: EASE_SILK, delay }}
    />
  );

  return (
    <footer className="relative overflow-x-clip bg-rosemary text-linen" aria-label={`${BRAND} monograph and colophon`}>
      <div className="mx-auto max-w-[1600px] px-6 pt-16 md:px-12 md:pt-24">
        <FolioMark folio="VI" title="Monograph" tone="linen" />

        <ul className="mt-6 flex flex-wrap gap-x-10 gap-y-2 font-sans text-[10px] uppercase tracking-[0.32em] text-linen/65">
          {ARCHIVE.map((entry) => (
            <li key={entry} className="flex items-center gap-3">
              <span aria-hidden className="h-px w-5 bg-brass" />
              {entry}
            </li>
          ))}
        </ul>

        <div className="mt-10 md:mt-16">
          <Wordmark caption={BRAND} />
        </div>

        <div className="mt-8 flex flex-col gap-8 md:mt-12 md:flex-row md:items-end md:justify-between">
          <p className="max-w-xl font-serif text-[clamp(1.5rem,2.6vw,2.2rem)] font-light italic leading-snug text-linen/90">
            Botanical perfume, pressed cold from wild plants and poured by hand in small batches.
          </p>
          <div className="shrink-0">
            <BrassLink tone="linen" onClick={() => glideTo(0, { offset: 0, duration: 2.6 })}>
              Return to the first page
              <span aria-hidden className="inline-block h-px w-8 bg-current transition-all duration-700 group-hover:w-12" />
            </BrassLink>
          </div>
        </div>

        <div className="mt-14 md:mt-20">{rule()}</div>

        <div className="grid gap-14 py-14 md:grid-cols-12 md:gap-10 md:py-20">
          {/* The atelier's own rules. */}
          <section aria-labelledby="charter-heading" className="min-w-0 md:col-span-5">
            <h3 id="charter-heading" className="font-serif text-3xl font-light italic text-linen">
              Our foraging charter
            </h3>
            <p className="mt-3 max-w-md text-[14px] font-light leading-relaxed text-linen/70">
              Rules the atelier wrote for itself and keeps in the front of every ledger.
            </p>
            <ol className="mt-8 border-t border-linen/15">
              {CHARTER.map((line, i) => (
                <motion.li
                  key={line}
                  className="flex gap-5 border-b border-linen/15 py-4"
                  initial={reduce ? false : { x: -14 }}
                  whileInView={{ x: 0 }}
                  viewport={{ once: true, margin: "0px 0px -6% 0px" }}
                  transition={{ duration: 1.3, ease: EASE_SILK, delay: i * 0.09 }}
                >
                  <span className="w-8 shrink-0 pt-1 font-sans text-[10px] uppercase tracking-[0.3em] text-brass">
                    {ROMAN[i]}
                  </span>
                  <span className="min-w-0 text-[15px] font-light leading-relaxed text-linen/85">{line}</span>
                </motion.li>
              ))}
            </ol>
          </section>

          {/* Where the work happens, and what time it is there. */}
          <section aria-labelledby="labs-heading" className="min-w-0 md:col-span-4 md:col-start-7">
            <h3 id="labs-heading" className="font-serif text-3xl font-light italic text-linen">
              Laboratories
            </h3>
            <div className="mt-8 flex flex-col border-t border-linen/15">
              {LABORATORIES.map((lab) => (
                <div key={lab.city} className="border-b border-linen/15 py-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <p className="font-serif text-2xl text-linen">
                      {lab.city}
                      <span className="text-linen/60">, {lab.country}</span>
                    </p>
                    <p className="font-sans text-[10px] uppercase tracking-[0.24em] text-linen/65">{lab.coordinates}</p>
                  </div>
                  <p className="mt-1 text-[13px] font-light text-linen/65">{lab.role}</p>
                  <div className="mt-5">
                    <ZoneClock timeZone={lab.timeZone} place={lab.city} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Index of the monograph. */}
          <nav aria-labelledby="index-heading" className="min-w-0 md:col-span-2 md:col-start-11">
            <h3 id="index-heading" className="font-serif text-3xl font-light italic text-linen">
              Index
            </h3>
            <ul className="mt-8 flex flex-col border-t border-linen/15">
              {INDEX.map((item) => (
                <li key={item.href} className="border-b border-linen/15">
                  <Link
                    href={item.href}
                    onClick={glideIfHome(item.hash)}
                    className="group flex min-h-[48px] items-center justify-between gap-3 py-2 font-sans text-[11px] uppercase tracking-[0.2em] text-linen/80 transition-colors duration-500 hover:text-linen"
                  >
                    <span>{item.label}</span>
                    <span
                      aria-hidden
                      className="h-px w-3 shrink-0 bg-brass transition-transform duration-700 ease-out group-hover:scale-x-[2.2] origin-right"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <TickerBand
        items={FORAGING_CALENDAR}
        seconds={120}
        reverse
        className="border-y border-linen/10 py-4 font-sans text-[10px] uppercase tracking-[0.34em] text-linen/60"
      />

      <div className="mx-auto max-w-[1600px] px-6 pb-10 pt-8 md:px-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <ul className="flex gap-8 font-sans text-[10px] uppercase tracking-[0.32em]">
            <li>
              <Link
                href="/legal/terms"
                className="inline-flex min-h-[44px] items-center text-linen/80 underline decoration-brass/60 underline-offset-[6px] transition-colors duration-500 hover:text-linen"
              >
                Terms
              </Link>
            </li>
            <li>
              <Link
                href="/legal/privacy"
                className="inline-flex min-h-[44px] items-center text-linen/80 underline decoration-brass/60 underline-offset-[6px] transition-colors duration-500 hover:text-linen"
              >
                Privacy
              </Link>
            </li>
          </ul>
          <div className="max-w-2xl space-y-2 md:text-right">
            <p className="font-sans text-[10px] uppercase leading-relaxed tracking-[0.24em] text-linen/65">
              {COPYRIGHT_LINE}
            </p>
            <p className="text-[12px] font-light leading-relaxed text-linen/60">{FICTION_NOTICE}</p>
            <p className="font-sans text-[10px] uppercase tracking-[0.24em] text-brass">
              Designed and built by {STUDIO}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
