"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { FolioMark } from "@/components/brand/folio-mark";
import { UnfurlText } from "@/components/ui/unfurl-text";
import { TickerBand } from "@/components/ui/ticker-band";
import { PinnedRitual } from "@/components/ritual/pinned-ritual";
import { StackedRitual } from "@/components/ritual/stacked-ritual";
import { RITUAL_PHASES, RITUAL_TICKER } from "@/lib/ritual-phases";

const HEADLINE = "Four slow steps from field to flacon.";

/**
 * Folio IV. On a wide screen with motion allowed, the four phases travel sideways
 * through a pinned stage as you scroll. Everywhere else they sit behind a tab selector.
 * Both layouts render; CSS decides which one shows, and the pinned one only builds
 * its ScrollTriggers when the same media query matches.
 */
export function ExtractionRitual() {
  return (
    <section id="ritual" aria-labelledby="ritual-title" className="relative bg-linen">
      <div className="mx-auto max-w-[1440px] px-5 pt-24 md:px-10 md:pt-32">
        <FolioMark folio="IV" title="The extraction ritual" />
        <div className="mt-12 grid gap-8 md:mt-16 lg:grid-cols-12 lg:items-end">
          <h2
            id="ritual-title"
            aria-label={HEADLINE}
            className="font-serif text-[clamp(2.6rem,7vw,5.5rem)] font-light leading-[0.98] tracking-tight text-rosemary lg:col-span-7"
          >
            <UnfurlText text={HEADLINE} />
          </h2>
          <p className="max-w-md font-sans text-[15px] font-light leading-[1.8] text-rosemary/75 lg:col-span-5 lg:justify-self-end">
            Every plant is picked by hand at dawn, frozen within the hour, steeped cold for six months, then filtered
            by gravity alone. Nothing is heated and nothing is rushed, so the scent keeps the shape it had in the field.
          </p>
        </div>
      </div>

      <TickerBand
        items={RITUAL_TICKER}
        seconds={70}
        className="mt-14 border-y border-hairline py-3 font-sans text-[10px] uppercase tracking-[0.32em] text-rosemary/60"
      />

      <div className="hidden lg:motion-safe:block">
        <PinnedRitual phases={RITUAL_PHASES} />
      </div>
      <div className="pt-12 lg:motion-safe:hidden">
        <StackedRitual phases={RITUAL_PHASES} />
      </div>
    </section>
  );
}
