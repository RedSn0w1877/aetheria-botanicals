"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { FolioMark } from "@/components/brand/folio-mark";
import { BrassLink } from "@/components/ui/brass-link";
import { TickerBand } from "@/components/ui/ticker-band";
import { UnfurlText } from "@/components/ui/unfurl-text";
import { BotanicalGlyph, HerbariumSprig } from "@/components/blender/botanical-glyph";
import { CureTimeline } from "@/components/blender/cure-timeline";
import { FlaconArch } from "@/components/blender/flacon-arch";
import { RatioBar } from "@/components/blender/ratio-bar";
import { TextSwap } from "@/components/blender/readout-motion";
import { SensoryRadar } from "@/components/blender/sensory-radar";
import { TierControl } from "@/components/blender/tier-control";
import { openAllocation } from "@/lib/allocation-store";
import {
  DEFAULT_SELECTION,
  HOUSE_PRESETS,
  INTENSITY_MAX,
  INTENSITY_MIN,
  TIERS,
  TIER_IDS,
  blendName,
  computeProfile,
  computeRatios,
  dominantTags,
  fillLevel,
  mixTincture,
  recommendCure,
  type GlyphId,
  type Selection,
  type TierId,
} from "@/lib/blend-formulas";
import { COPYRIGHT_MARK } from "@/lib/copyright";
import { blendFlacon, hexToRgb } from "@/lib/flacon-store";
import { useScrollAnimation } from "@/lib/gsap-lazy";
import { EASE_SILK } from "@/lib/motion";

const HEADING = "Compose a scent of your own.";

const TICKER = TIERS.flatMap((tier) => tier.notes.map((note) => `${note.name} — ${note.origin}`));

const sameSelection = (a: Selection, b: Selection) =>
  TIER_IDS.every((id) => a[id].noteId === b[id].noteId && a[id].intensity === b[id].intensity);

/**
 * Folio II: the interactive compound blender.
 * Pick one note per layer, set how strongly each speaks, and every readout (the glass,
 * the ratio, the sensory radar, the cure) re-balances from the same pure formulas.
 */
export function CompoundBlender() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [selection, setSelection] = useState<Selection>(DEFAULT_SELECTION);
  const prevTrioRef = useRef<string | null>(null);

  // Everything below is derived during render from one piece of state.
  const ratios = useMemo(() => computeRatios(selection), [selection]);
  const profile = useMemo(() => computeProfile(selection), [selection]);
  const tags = useMemo(() => dominantTags(profile), [profile]);
  const cure = useMemo(() => recommendCure(selection), [selection]);
  const tincture = useMemo(() => mixTincture(selection), [selection]);
  const level = useMemo(() => fillLevel(selection), [selection]);
  const name = useMemo(() => blendName(selection), [selection]);
  const [compositionLabel, compositionWords] = useMemo(() => name.split(" — "), [name]);
  const trio = useMemo(() => `${selection.top.noteId}|${selection.heart.noteId}|${selection.base.noteId}`, [selection.top.noteId, selection.heart.noteId, selection.base.noteId]);
  const meanIntensity = useMemo(() => TIER_IDS.reduce((sum, id) => sum + selection[id].intensity, 0) / TIER_IDS.length, [selection]);

  // Feed the 3D scene. It reads these plain objects every frame, so no re-render reaches the canvas.
  useEffect(() => {
    blendFlacon.liquid = hexToRgb(tincture);
    blendFlacon.level = level;
    blendFlacon.vapour = 0.15 + (meanIntensity / INTENSITY_MAX) * 0.45;
    blendFlacon.swirl = Math.max(blendFlacon.swirl, 0.3);
  }, [tincture, level, meanIntensity]);

  // A new note is a bigger event than a nudge of strength: give the glass a proper swirl.
  useEffect(() => {
    const changed = prevTrioRef.current !== null && prevTrioRef.current !== trio;
    if (changed) {
      blendFlacon.swirl = 1;
    }
    prevTrioRef.current = trio;
  }, [trio]);

  const setNote = useCallback((tier: TierId, noteId: GlyphId) => {
    setSelection((prev) => ({ ...prev, [tier]: { ...prev[tier], noteId } }));
  }, []);

  const setIntensity = useCallback((tier: TierId, intensity: number) => {
    setSelection((prev) => ({ ...prev, [tier]: { ...prev[tier], intensity } }));
  }, []);

  const letAtelierChoose = useCallback(() => {
    setSelection((prev) => {
      const pick = (id: TierId) => {
        const notes = TIERS.find((t) => t.id === id)?.notes ?? [];
        const others = notes.filter((n) => n.id !== prev[id].noteId);
        const pool = others.length > 0 ? others : notes;
        const note = pool[Math.floor(Math.random() * pool.length)];
        const intensity = Math.round(INTENSITY_MIN + 20 + Math.random() * (INTENSITY_MAX - INTENSITY_MIN - 25));
        return { noteId: note?.id ?? prev[id].noteId, intensity };
      };
      return { top: pick("top"), heart: pick("heart"), base: pick("base") };
    });
  }, []);

  const reserve = () => {
    openAllocation({ note: `${name} — ${ratios.top}% / ${ratios.heart}% / ${ratios.base}%` });
  };

  useScrollAnimation(
    (gsap) => {
      const section = sectionRef.current;
      if (!section) return;
      const q = gsap.utils.selector(section);
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Herbarium sprigs and small glyphs drift at their own depths.
        q<HTMLElement>("[data-blender-parallax]").forEach((el) => {
          const speed = Number(el.dataset.speed ?? "1");
          gsap.fromTo(
            el,
            { yPercent: 14 * speed },
            {
              yPercent: -14 * speed,
              ease: "none",
              scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 1.4 },
            },
          );
        });

        // The ghost word slides slowly across the page like a title card.
        gsap.fromTo(
          q("[data-blender-drift]"),
          { xPercent: 4 },
          {
            xPercent: -22,
            ease: "none",
            scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 1.8 },
          },
        );

        // The brass arch is inked in as the flacon rises into view.
        const arch = q("[data-blender-arch]");
        if (arch.length) {
          gsap.fromTo(
            arch,
            { strokeDashoffset: 1 },
            {
              strokeDashoffset: 0,
              ease: "none",
              scrollTrigger: { trigger: arch[0], start: "top 90%", end: "top 30%", scrub: 1.6 },
            },
          );
        }

        // Hairline rule under the intro unrolls from the left.
        gsap.fromTo(
          q("[data-blender-rule]"),
          { scaleX: 0.08 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: { trigger: section, start: "top 80%", end: "top 20%", scrub: 1.2 },
          },
        );
      });

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="blender"
      aria-labelledby="blender-heading"
      className="relative overflow-x-clip bg-linen px-4 pb-24 pt-20 sm:px-8 lg:px-12 lg:pb-36 lg:pt-28"
    >
      {/* Decorative depth: ghost title and herbarium sprigs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <span
          data-blender-drift
          className="absolute left-[4%] top-[5.5rem] select-none whitespace-nowrap font-serif text-[clamp(7rem,24vw,24rem)] font-light italic leading-none tracking-tight text-herb"
        >
          Compose · Balance · Rest
        </span>
        <span data-blender-parallax data-speed="1.2" className="absolute -left-10 top-[34%] block h-[340px] w-[130px] text-sage/25 lg:left-2">
          <HerbariumSprig variant="fern" className="h-full w-full" />
        </span>
        <span data-blender-parallax data-speed="0.8" className="absolute -right-8 top-[62%] block h-[380px] w-[140px] -scale-x-100 text-terracotta/20">
          <HerbariumSprig variant="stem" className="h-full w-full" />
        </span>
        <span data-blender-parallax data-speed="1.6" className="absolute right-[36%] top-[16%] hidden h-16 w-16 rotate-12 text-brass/40 lg:block">
          <BotanicalGlyph id="rose" className="h-full w-full" ink={false} />
        </span>
      </div>

      <div className="relative mx-auto max-w-[1360px]">
        <FolioMark folio="II" title="The compound blender" />

        {/* Plain language first */}
        <header className="mt-12 grid gap-8 lg:mt-20 lg:grid-cols-12 lg:gap-12">
          <div className="min-w-0 lg:col-span-7">
            <p className="font-sans text-[10px] uppercase tracking-[0.34em] text-terracotta">
              Build your own perfume · Interactive
            </p>
            <h2
              id="blender-heading"
              aria-label={HEADING}
              className="mt-5 font-serif text-[clamp(2.9rem,7.4vw,6.6rem)] font-light leading-[0.92] tracking-tight text-rosemary"
            >
              <UnfurlText text="Compose a scent" />
              <UnfurlText text="of your own." delay={0.3} className="italic text-moss" />
            </h2>
          </div>
          <div className="min-w-0 lg:col-span-5 lg:pt-10">
            <p className="font-sans text-base font-light leading-relaxed text-rosemary/85 sm:text-lg">
              Choose one note from each layer (the first impression, the heart, and the base that lingers), set how
              strongly each one speaks, and watch the blend balance in the glass.
            </p>
            <p className="mt-5 font-serif text-xl italic leading-snug text-moss">
              Nine wild-foraged tinctures, cold-drawn over months. Twenty-seven ways to wear them.
            </p>
            <div className="mt-8">
              <p id="blender-presets-label" className="font-sans text-[10px] uppercase tracking-[0.3em] text-rosemary/60">
                Or begin from a house suggestion
              </p>
              <div role="group" aria-labelledby="blender-presets-label" className="mt-3 flex flex-wrap gap-2">
                {HOUSE_PRESETS.map((preset) => {
                  const active = sameSelection(preset.selection, selection);
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setSelection(preset.selection)}
                      className={`min-h-11 rounded-full border px-4 font-serif text-base italic transition-colors duration-700 ${
                        active
                          ? "border-rosemary bg-rosemary text-linen"
                          : "border-hairline text-rosemary hover:border-brass hover:bg-parchment"
                      }`}
                    >
                      {preset.name}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={letAtelierChoose}
                  className="group inline-flex min-h-11 items-center gap-2 rounded-full border border-dashed border-brass/70 px-4 font-sans text-[10px] uppercase tracking-[0.26em] text-rosemary transition-colors duration-700 hover:bg-parchment"
                >
                  <span aria-hidden className="block h-4 w-4 text-terracotta transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-[72deg]">
                    <BotanicalGlyph id="labdanum" className="h-full w-full" ink={false} strokeWidth={1.4} />
                  </span>
                  Let the atelier choose
                </button>
              </div>
            </div>
          </div>
        </header>

        <div aria-hidden data-blender-rule className="mt-14 h-px origin-left bg-brass/50" />

        <TickerBand
          items={TICKER}
          seconds={90}
          className="mt-3 font-sans text-[10px] uppercase tracking-[0.3em] text-rosemary/45"
        />

        <div className="mt-10 grid gap-14 lg:mt-16 lg:grid-cols-12 lg:gap-12 xl:gap-16">
          {/* Controls */}
          <div className="min-w-0 lg:col-span-5">
            <MobileSummary ratios={ratios} tincture={tincture} words={compositionWords ?? name} />
            <div className="space-y-12">
              {TIERS.map((tier) => (
                <TierControl
                  key={tier.id}
                  tier={tier}
                  choice={selection[tier.id]}
                  share={ratios[tier.id]}
                  onNote={(id) => setNote(tier.id, id)}
                  onIntensity={(value) => setIntensity(tier.id, value)}
                />
              ))}
            </div>
            <p className="mt-10 border-t border-hairline pt-4 font-sans text-[10px] uppercase leading-relaxed tracking-[0.24em] text-rosemary/50">
              Heavier layers carry further: base notes count 1.2×, top notes 0.85×. All figures are illustrative.
            </p>
          </div>

          {/* Readouts: sticky on tall desktop screens */}
          <div className="min-w-0 lg:col-span-7">
            <div className="[@media(min-width:1024px)_and_(min-height:820px)]:sticky [@media(min-width:1024px)_and_(min-height:820px)]:top-24">
              <div className="border border-hairline bg-parchment p-5 sm:p-8">
                <div className="grid items-center gap-8 sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">
                  <div className="flex min-w-0 justify-center">
                    <FlaconArch tincture={tincture} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-center font-sans text-[10px] uppercase tracking-[0.3em] text-rosemary/60">
                      Sensory balance
                    </p>
                    <SensoryRadar profile={profile} tags={tags} />
                  </div>
                </div>

                <div className="mt-8 grid gap-8 border-t border-hairline pt-6 md:grid-cols-2 md:gap-10">
                  <div className="min-w-0">
                    <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-rosemary/60">Your composition</p>
                    <h3 className="mt-2 font-serif text-rosemary" aria-live="polite">
                      <TextSwap text={compositionLabel ?? name} className="text-[clamp(1.6rem,2.6vw,2.2rem)] font-light leading-none tracking-tight" />
                      <TextSwap text={compositionWords ?? ""} className="mt-1 text-lg italic leading-snug text-moss" />
                    </h3>
                    <p className="mb-3 mt-5 font-sans text-[10px] uppercase tracking-[0.3em] text-rosemary/60">Extraction ratio</p>
                    <RatioBar ratios={ratios} selection={selection} />
                  </div>
                  <div className="min-w-0 md:border-l md:border-hairline md:pl-10">
                    <CureTimeline cure={cure} />
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-4 border-t border-hairline pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <BrassLink onClick={reserve}>
                    Reserve this composition
                    <motion.span
                      aria-hidden
                      className="block h-px w-8 origin-left bg-current"
                      initial={{ scaleX: 1 }}
                      animate={reduce ? undefined : { scaleX: [1, 0.55, 1] }}
                      transition={{ duration: 1.2, ease: EASE_SILK }}
                      key={trio}
                    />
                  </BrassLink>
                  <p className="max-w-[18rem] font-sans text-[10px] uppercase leading-relaxed tracking-[0.22em] text-rosemary/50">
                    Blended by hand in batches of forty. <span className="select-none">{COPYRIGHT_MARK}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Phones: a slim summary that rides along while the visitor works through the three layers. */
function MobileSummary({ ratios, tincture, words }: { ratios: ReturnType<typeof computeRatios>; tincture: string; words: string }) {
  return (
    <div className="sticky top-[72px] z-20 -mx-4 mb-8 border-b border-hairline bg-linen px-4 py-3 sm:-mx-8 sm:px-8 lg:hidden">
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="h-5 w-5 shrink-0 rounded-full border border-brass/70 transition-colors duration-[1400ms]"
          style={{ backgroundColor: tincture }}
        />
        <div className="min-w-0 flex-1">
          <TextSwap text={words} className="truncate font-serif text-base italic leading-tight text-rosemary" />
        </div>
        <p className="shrink-0 font-sans text-[10px] tabular-nums uppercase tracking-[0.18em] text-rosemary/70">
          {ratios.top} / {ratios.heart} / {ratios.base}
          <span className="sr-only"> percent top, heart and base</span>
        </p>
      </div>
      <div className="mt-2">
        <RatioBar ratios={ratios} compact />
      </div>
    </div>
  );
}
