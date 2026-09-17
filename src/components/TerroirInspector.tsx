"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { FolioMark } from "@/components/brand/folio-mark";
import { UnfurlText } from "@/components/ui/unfurl-text";
import { HerbariumPlate } from "@/components/terroir/herbarium-plate";
import { InstrumentLedger } from "@/components/terroir/instruments";
import { IntakeSeal } from "@/components/terroir/intake-seal";
import { TurnContext, type TurnState } from "@/components/terroir/turn-context";
import { EASE_SILK } from "@/lib/motion";
import { formatCoordinates, groupThousands, TERROIR_LOTS } from "@/lib/terroir-lots";

const HEADLINE = "Provenance.";

/**
 * Folio III — a deep rosemary band. Three harvest lots sit behind a tab selector;
 * switching turns the specimen sheet like a page, re-inks the herbarium drawing,
 * rolls every instrument to its new reading and presses a fresh intake stamp.
 */
export function TerroirInspector() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [turn, setTurn] = useState<TurnState>({ turns: 0, direction: 1 });
  const tablist = useRef<HTMLDivElement>(null);
  const lot = TERROIR_LOTS[index] ?? TERROIR_LOTS[0];

  const select = (next: number) => {
    if (next === index) return;
    setTurn((t) => ({ turns: t.turns + 1, direction: next > index ? 1 : -1 }));
    setIndex(next);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const last = TERROIR_LOTS.length - 1;
    const map: Record<string, number> = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowDown: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      ArrowUp: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    };
    const next = map[event.key];
    if (next === undefined) return;
    event.preventDefault();
    select(next);
    tablist.current?.querySelectorAll<HTMLButtonElement>("[role=tab]")[next]?.focus();
  };

  const turnVariants = useMemo(
    () => ({
      enter: (dir: 1 | -1) =>
        reduce ? { opacity: 0 } : { opacity: 0, x: dir * 40, rotate: dir * 0.8, clipPath: dir > 0 ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)" },
      center: { opacity: 1, x: 0, rotate: 0, clipPath: "inset(0 0% 0 0%)" },
      exit: (dir: 1 | -1) =>
        reduce ? { opacity: 0 } : { opacity: 0, x: dir * -30, rotate: dir * -0.6, clipPath: dir > 0 ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)" },
    }),
    [reduce],
  );

  if (!lot) return null;

  return (
    <section id="terroir" aria-labelledby="terroir-title" className="relative overflow-hidden bg-rosemary text-linen">
      <div className="mx-auto max-w-[1440px] px-5 py-24 md:px-10 md:py-32">
        <FolioMark folio="III" title="Harvest provenance" tone="linen" />

        <div className="mt-12 grid gap-8 md:mt-16 lg:grid-cols-12 lg:items-end">
          <h2
            id="terroir-title"
            aria-label={HEADLINE}
            className="font-serif text-[clamp(2.6rem,7vw,5.5rem)] font-light leading-[0.98] tracking-tight lg:col-span-7"
          >
            <UnfurlText text={HEADLINE} />
          </h2>
          <p className="max-w-md font-sans text-[15px] font-light leading-[1.8] text-linen/75 lg:col-span-5 lg:justify-self-end">
            Each batch begins in one place, at one altitude, on one morning. Choose a harvest lot to see the ground it
            came from and the readings we took when it arrived in Grasse.
          </p>
        </div>

        {/* Lot selector */}
        <div
          ref={tablist}
          role="tablist"
          aria-label="Harvest lots"
          onKeyDown={onKeyDown}
          className="mt-14 grid border-y border-linen/15 sm:grid-cols-3"
        >
          {TERROIR_LOTS.map((l, i) => {
            const on = i === index;
            return (
              <button
                key={l.code}
                type="button"
                role="tab"
                id={`terroir-tab-${l.number}`}
                aria-selected={on}
                aria-controls="terroir-panel"
                tabIndex={on ? 0 : -1}
                onClick={() => select(i)}
                className={`group relative flex min-h-16 min-w-0 items-center gap-5 px-2 py-4 text-left transition-colors duration-700 sm:flex-col sm:items-start sm:gap-3 sm:px-6 sm:py-7 ${
                  i > 0 ? "border-t border-linen/15 sm:border-l sm:border-t-0" : ""
                } ${on ? "text-linen" : "text-linen/45 hover:text-linen/80"}`}
              >
                <span className="font-serif text-5xl font-light italic leading-none sm:text-7xl">{l.number}</span>
                <span className="min-w-0">
                  <span className="block font-serif text-xl leading-tight sm:text-2xl">{l.commonName}</span>
                  <span className="mt-1 block font-sans text-[10px] uppercase tracking-[0.28em] text-linen/55">
                    {l.region}, {l.country}
                  </span>
                </span>
                {on ? (
                  <motion.span
                    layoutId="terroir-lot-marker"
                    aria-hidden
                    className="absolute inset-y-0 left-0 w-[2px] bg-brass sm:inset-x-6 sm:inset-y-auto sm:-bottom-px sm:h-[2px] sm:w-auto"
                    transition={{ duration: 1, ease: EASE_SILK }}
                  />
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Specimen sheet */}
        <TurnContext.Provider value={turn}>
          <div
            id="terroir-panel"
            role="tabpanel"
            aria-labelledby={`terroir-tab-${lot.number}`}
            className="relative mt-14 grid gap-14 lg:grid-cols-12 lg:gap-16"
          >
            <div className="relative lg:col-span-5">
              <AnimatePresence mode="wait" custom={turn.direction} initial={false}>
                <motion.div
                  key={lot.code}
                  custom={turn.direction}
                  variants={turnVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 1.1, ease: EASE_SILK }}
                  className="relative"
                >
                  <HerbariumPlate lot={lot} />
                  <IntakeSeal
                    key={`seal-${lot.code}`}
                    lotCode={lot.code}
                    verificationCode={lot.verification.code}
                    date={lot.verification.date}
                    className="absolute -bottom-10 -right-2 h-32 w-32 text-terracotta sm:-right-8 sm:h-36 sm:w-36"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="min-w-0 lg:col-span-7">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`copy-${lot.code}`}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10 }}
                  transition={{ duration: 0.8, ease: EASE_SILK }}
                >
                  <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-brass">
                    {formatCoordinates(lot.lat, lot.lng)} {"//"} Alt {groupThousands(lot.altitudeM)} m {"//"} {lot.siteSummary}
                  </p>
                  <h3 className="mt-4 font-serif text-[clamp(2rem,4.4vw,3.5rem)] font-light leading-[1.02] tracking-tight">
                    Lot {lot.number}: {lot.commonName}
                  </h3>
                  <p className="mt-5 max-w-2xl font-sans text-[15px] font-light leading-[1.8] text-linen/75">{lot.habitat}</p>

                  <dl className="mt-8 grid grid-cols-2 gap-px border border-linen/15 bg-linen/15 sm:grid-cols-3">
                    {[
                      { label: "Harvest window", value: lot.harvestWindow },
                      { label: "Picked between", value: lot.harvestHour },
                      { label: "Intake code", value: lot.verification.code },
                    ].map((row) => (
                      <div key={row.label} className="min-w-0 bg-rosemary px-4 py-4 last:col-span-2 sm:last:col-span-1">
                        <dt className="font-sans text-[9px] uppercase tracking-[0.28em] text-linen/55">{row.label}</dt>
                        <dd className="mt-2 font-serif text-lg leading-snug text-linen">{row.value}</dd>
                      </div>
                    ))}
                  </dl>

                  <ul className="mt-6 flex flex-wrap gap-2" aria-label="Scent accords">
                    {lot.accords.map((accord) => (
                      <li
                        key={accord}
                        className="border border-brass/50 px-3 py-1.5 font-sans text-[10px] uppercase tracking-[0.24em] text-linen/80"
                      >
                        {accord}
                      </li>
                    ))}
                  </ul>

                  <blockquote className="mt-8 max-w-2xl border-t border-linen/15 pt-6 font-serif text-2xl font-light italic leading-snug text-linen/85">
                    “{lot.fieldNote}”
                    <footer className="mt-3 font-sans text-[10px] not-italic uppercase tracking-[0.28em] text-linen/50">
                      Field note, harvest team · {lot.yieldNote}
                    </footer>
                  </blockquote>
                </motion.div>
              </AnimatePresence>

              <div className="mt-12">
                <InstrumentLedger
                  code={lot.code}
                  celsius={lot.distillationC}
                  ph={lot.soilPh}
                  solarHours={lot.solarHours}
                  solarFraction={lot.solarFraction}
                  altitudeM={lot.altitudeM}
                />
              </div>
            </div>
          </div>
        </TurnContext.Provider>
      </div>
    </section>
  );
}
