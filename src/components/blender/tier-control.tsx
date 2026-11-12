"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { memo, type CSSProperties } from "react";
import {
  INTENSITY_MAX,
  INTENSITY_MIN,
  describeIntensity,
  getNote,
  type GlyphId,
  type Tier,
  type TierChoice,
  type TierId,
} from "@/lib/blend-formulas";
import { BotanicalGlyph } from "./botanical-glyph";
import { lowerFirst } from "./formula-text";
import s from "./compose.module.css";

type TierControlProps = {
  tier: Tier;
  choice: TierChoice;
  /** This tier's share of the blend, in parts per hundred. */
  share: number;
  /** Stable callbacks from the composer; the tier passes its own id back. */
  onNote: (tier: TierId, id: GlyphId) => void;
  onIntensity: (tier: TierId, value: number) => void;
};

/**
 * One layer of the perfume as a specimen entry: its heading, three notes to choose from (a native
 * radio group, so arrow keys, form semantics and screen readers work for free), the chosen note's
 * line, and its strength. Selection styling reads the real :checked state, so it stays right even
 * before hydration. Memoised: a drag on another tier's slider only re-renders this one for its share.
 */
export const TierControl = memo(function TierControl({ tier, choice, share, onNote, onIntensity }: TierControlProps) {
  // One composer per page, and it hydrates as its own root (book/islands.tsx): a fixed name, not useId.
  const groupName = `tier-${tier.id}`;
  const sliderId = `${groupName}-strength`;
  const note = getNote(choice.noteId);
  const describe = describeIntensity(choice.intensity);

  return (
    <div className={s.tier}>
      <div className={s.tierHead}>
        <span className={s.tierNumeral} aria-hidden="true">
          {tier.numeral}
        </span>
        <h3 className={s.tierTitle}>{tier.label}</h3>
        <span className={s.tierRole}>{lowerFirst(tier.role)}</span>
      </div>
      <p className={s.tierWhisper}>{tier.whisper}</p>

      <fieldset className={s.entries}>
        <legend className="bk-sr">Choose the {tier.label.toLowerCase()}</legend>
        {tier.notes.map((option) => (
          <label key={option.id} className={s.entry}>
            <input
              type="radio"
              className="bk-sr"
              name={groupName}
              value={option.id}
              checked={option.id === choice.noteId}
              onChange={() => onNote(tier.id, option.id)}
            />
            <span className={s.glyph} data-ink="">
              <BotanicalGlyph id={option.id} />
            </span>
            <span className={s.entryName}>{option.name}</span>
            <span className={s.entryOrigin}>{option.origin}</span>
          </label>
        ))}
      </fieldset>

      <p className={s.descriptor} aria-live="polite">
        {note.descriptor}
      </p>

      <div className={s.strength}>
        <label htmlFor={sliderId} className={s.strengthLabel}>
          strength<span className="bk-sr"> of {note.name}</span>
        </label>
        <span className={s.strengthValue}>
          {describe} · <span className={`bk-tabular ${s.figure}`}>{choice.intensity}</span>%
        </span>
      </div>
      <StrengthSlider
        id={sliderId}
        tier={tier.id}
        value={choice.intensity}
        tone={tier.tone}
        valueText={`${choice.intensity} percent, ${describe}`}
        onChange={onIntensity}
      />
      <p className={`bk-label ${s.share}`}>This note makes {share} parts in a hundred of the blend.</p>
    </div>
  );
});

/**
 * A native range input (keyboard, touch and screen readers all native) laid over a hand-drawn rail.
 * The real input is transparent and its thumb is exactly as wide as the drawn bead, and the rail is
 * inset by half a thumb, so --pct places the fill (scaleX) and the bead (translate) exactly where the
 * browser has the thumb. No transition and no spring: the bead tracks the thumb frame for frame.
 */

/*
 * The readouts (ratio bar, cure ruler, radar, tint) glide 600-900ms after a preset click. While the
 * slider is dragged they follow in 200ms, so the data stays attached to the hand; for arrow keys they
 * are instant ([data-instant]), so repeated presses never lag. Set on the compose chapter, in CSS.
 */
function setMode(input: HTMLElement, mode: "dragging" | "instant", on: boolean) {
  input.closest("section")?.toggleAttribute(`data-${mode}`, on);
}

function StrengthSlider({
  id,
  tier,
  value,
  tone,
  valueText,
  onChange,
}: {
  id: string;
  tier: TierId;
  value: number;
  tone: string;
  valueText: string;
  onChange: (tier: TierId, value: number) => void;
}) {
  const pct = (value - INTENSITY_MIN) / (INTENSITY_MAX - INTENSITY_MIN);
  return (
    <div className={s.slider} style={{ "--pct": pct.toFixed(4), "--tone": tone } as CSSProperties}>
      <input
        id={id}
        type="range"
        className={s.range}
        min={INTENSITY_MIN}
        max={INTENSITY_MAX}
        step={1}
        value={value}
        aria-valuetext={valueText}
        onChange={(event) => onChange(tier, Number(event.currentTarget.value))}
        onPointerDown={(event) => setMode(event.currentTarget, "dragging", true)}
        onPointerUp={(event) => setMode(event.currentTarget, "dragging", false)}
        onPointerCancel={(event) => setMode(event.currentTarget, "dragging", false)}
        onKeyDown={(event) => setMode(event.currentTarget, "instant", true)}
        onKeyUp={(event) => setMode(event.currentTarget, "instant", false)}
        onBlur={(event) => setMode(event.currentTarget, "instant", false)}
      />
      <span className={s.rail} aria-hidden="true">
        <span className={s.fill} />
        <span className={s.beadTrack}>
          <span className={s.bead} />
        </span>
      </span>
    </div>
  );
}
