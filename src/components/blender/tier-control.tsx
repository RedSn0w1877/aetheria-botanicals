"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { useId, type ChangeEvent } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  INTENSITY_MAX,
  INTENSITY_MIN,
  describeIntensity,
  getNote,
  type GlyphId,
  type Tier,
  type TierChoice,
} from "@/lib/blend-formulas";
import { BotanicalGlyph } from "./botanical-glyph";
import { NumberRoll, TextSwap } from "./readout-motion";

type TierControlProps = {
  tier: Tier;
  choice: TierChoice;
  share: number;
  onNote: (id: GlyphId) => void;
  onIntensity: (value: number) => void;
};

/**
 * One layer of the composition: pick a note (a native radio group, so arrow keys,
 * form semantics and screen readers all work for free), then set its strength.
 */
export function TierControl({ tier, choice, share, onNote, onIntensity }: TierControlProps) {
  const reduce = useReducedMotion();
  const uid = useId();
  const groupName = `blender-${tier.id}-${uid}`;
  const sliderId = `${groupName}-strength`;
  const note = getNote(choice.noteId);

  return (
    <div className="relative border-t border-hairline pt-8">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div className="min-w-0">
          <p className="font-sans text-[10px] uppercase tracking-[0.32em] text-sage">
            <span className="text-brass">{tier.numeral}</span>
            <span aria-hidden className="mx-2 text-hairline">
              /
            </span>
            {tier.role}
          </p>
          <h3 className="mt-2 font-serif text-[clamp(1.9rem,3.4vw,2.6rem)] font-light leading-none tracking-tight text-rosemary">
            {tier.label}
          </h3>
        </div>
        <p className="max-w-[16rem] font-serif text-base italic leading-snug text-rosemary/60">{tier.whisper}</p>
      </div>

      <fieldset className="mt-6 min-w-0">
        <legend className="sr-only">Choose the {tier.label.toLowerCase()}</legend>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {tier.notes.map((option) => {
            const selected = option.id === choice.noteId;
            return (
              <label
                key={option.id}
                className={`group relative flex min-h-[9.5rem] min-w-0 cursor-pointer flex-col justify-between border px-2.5 pb-3 pt-3 transition-[border-color,background-color] duration-700 has-[:focus-visible]:outline has-[:focus-visible]:outline-1 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-brass sm:px-4 sm:pt-4 ${
                  selected ? "border-brass bg-parchment" : "border-hairline bg-transparent hover:border-sage/60 hover:bg-parchment/70"
                }`}
              >
                <input
                  type="radio"
                  name={groupName}
                  value={option.id}
                  checked={selected}
                  onChange={() => onNote(option.id)}
                  className="sr-only"
                />
                {selected ? (
                  <motion.span
                    layoutId={`blender-marker-${tier.id}`}
                    aria-hidden
                    className="absolute -top-px left-1/2 h-[3px] w-10 -translate-x-1/2 bg-terracotta"
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 140, damping: 22, mass: 0.9 }}
                  />
                ) : null}
                <span
                  className={`block h-11 w-11 transition-[transform,color] duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1 group-hover:rotate-[-4deg] sm:h-14 sm:w-14 ${
                    selected ? "text-terracotta" : "text-moss/70"
                  }`}
                >
                  <BotanicalGlyph id={option.id} className="h-full w-full" />
                </span>
                <span className="mt-3 block min-w-0">
                  <span className="block font-serif text-[15px] leading-[1.1] text-rosemary [overflow-wrap:anywhere] sm:text-lg">
                    {option.name}
                  </span>
                  <span className="mt-1.5 block font-sans text-[9px] uppercase leading-snug tracking-[0.2em] text-rosemary/55 sm:text-[10px]">
                    {option.origin}
                  </span>
                </span>
                <span
                  aria-hidden
                  className="absolute right-2 top-2 h-2 w-2 rounded-full border border-brass/70 transition-colors duration-700"
                  style={{ backgroundColor: selected ? option.tincture : "transparent" }}
                />
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-4 min-h-[3rem]" aria-live="polite">
        <TextSwap text={note.descriptor} className="font-serif text-lg italic leading-snug text-moss" />
      </div>

      <div className="mt-5">
        <div className="flex items-baseline justify-between gap-4">
          <label htmlFor={sliderId} className="font-sans text-[10px] uppercase tracking-[0.3em] text-rosemary/70">
            Concentration
            <span className="sr-only"> of {note.name}</span>
          </label>
          <div className="flex items-baseline gap-3 font-sans text-[10px] uppercase tracking-[0.26em] text-rosemary/55">
            <span className="hidden sm:inline">
              <TextSwap text={describeIntensity(choice.intensity)} />
            </span>
            <NumberRoll value={choice.intensity} suffix="%" className="font-serif text-2xl normal-case tracking-normal text-rosemary" />
          </div>
        </div>
        <StrengthSlider
          id={sliderId}
          value={choice.intensity}
          tone={tier.tone}
          onChange={onIntensity}
          valueText={`${choice.intensity} percent, ${describeIntensity(choice.intensity)}`}
        />
        <p className="mt-1 font-sans text-[10px] uppercase tracking-[0.26em] text-rosemary/50">
          Share of the blend <span className="text-rosemary">{share}%</span>
          <span className="sm:hidden"> · {describeIntensity(choice.intensity)}</span>
        </p>
      </div>
    </div>
  );
}

const THUMB = 22;

/**
 * A native range input (keyboard, touch, screen readers all native) laid over a
 * hand-drawn track. The real input is transparent but its thumb is the same width
 * as the drawn bead, so the drawing sits exactly where the browser thinks it is.
 * The drawn rail is inset by half a thumb, which makes the fill a plain scaleX(pct)
 * and the bead a plain translateX(pct): transform-only, no layout work while dragging.
 */
function StrengthSlider({
  id,
  value,
  tone,
  valueText,
  onChange,
}: {
  id: string;
  value: number;
  tone: string;
  valueText: string;
  onChange: (value: number) => void;
}) {
  const reduce = useReducedMotion();
  const pct = (value - INTENSITY_MIN) / (INTENSITY_MAX - INTENSITY_MIN);
  const handle = (event: ChangeEvent<HTMLInputElement>) => onChange(Number(event.target.value));
  const spring = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 260, damping: 32, mass: 0.6 };

  return (
    <div className="group/slider relative mt-2 h-12 touch-pan-y">
      <input
        id={id}
        type="range"
        min={INTENSITY_MIN}
        max={INTENSITY_MAX}
        step={1}
        value={value}
        onChange={handle}
        aria-valuetext={valueText}
        className="absolute inset-0 z-10 h-full w-full cursor-grab appearance-none bg-transparent opacity-0 active:cursor-grabbing [&::-moz-range-thumb]:h-12 [&::-moz-range-thumb]:w-[22px] [&::-moz-range-thumb]:appearance-none [&::-webkit-slider-thumb]:h-12 [&::-webkit-slider-thumb]:w-[22px] [&::-webkit-slider-thumb]:appearance-none"
      />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-hairline" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0" style={{ left: THUMB / 2, right: THUMB / 2 }}>
        {[0.25, 0.5, 0.75].map((tick) => (
          <span key={tick} className="absolute top-1/2 h-2 w-px -translate-y-1/2 bg-hairline" style={{ left: `${tick * 100}%` }} />
        ))}
        <motion.div
          className="absolute left-0 top-1/2 -mt-[1.5px] h-[3px] w-full origin-left"
          style={{ backgroundColor: tone }}
          initial={false}
          animate={{ scaleX: pct }}
          transition={spring}
        />
        <motion.div className="absolute inset-0" initial={false} animate={{ x: `${pct * 100}%` }} transition={spring}>
          <span className="absolute left-0 top-1/2 block -translate-x-1/2 -translate-y-1/2">
            <span className="block transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/slider:scale-110 group-active/slider:scale-125">
              <span className="relative block h-[22px] w-[22px] rounded-full border border-brass bg-parchment shadow-[0_2px_6px_rgba(24,35,28,0.18)]">
                <span className="absolute inset-[5px] rounded-full bg-brass" />
              </span>
            </span>
            <span className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border border-brass opacity-0 transition-opacity duration-500 group-has-[:focus-visible]/slider:opacity-100" />
          </span>
        </motion.div>
      </div>
    </div>
  );
}
