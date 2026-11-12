"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { Fragment, useCallback, useMemo } from "react";
import { PlateImprint } from "@/components/book/plate-imprint";
import { CureTimeline } from "@/components/blender/cure-timeline";
import { compositionTitle, formatWords } from "@/components/blender/formula-text";
import { RatioBar } from "@/components/blender/ratio-bar";
import { SensoryRadar } from "@/components/blender/sensory-radar";
import { TierControl } from "@/components/blender/tier-control";
import s from "@/components/blender/compose.module.css";
import { FlaconFigure } from "@/components/flacon/flacon-figure";
import {
  HOUSE_PRESETS,
  INTENSITY_MAX,
  INTENSITY_MIN,
  TIERS,
  TIER_IDS,
  computeProfile,
  computeRatios,
  mixTincture,
  recommendCure,
  type GlyphId,
  type Ratios,
  type Selection,
  type TierId,
} from "@/lib/blend-formulas";
import { getFormula, setFormula, useFormula } from "@/lib/formula-store";

const sameSelection = (a: Selection, b: Selection) =>
  TIER_IDS.every((id) => a[id].noteId === b[id].noteId && a[id].intensity === b[id].intensity);

/**
 * "Let the atelier choose": for each layer, a different note from the current one where possible,
 * at a lively strength. Called only from the click handler, never during render.
 */
function atelierChoice(prev: Selection): Selection {
  const pick = (id: TierId) => {
    const notes = TIERS.find((t) => t.id === id)?.notes ?? [];
    const others = notes.filter((n) => n.id !== prev[id].noteId);
    const pool = others.length > 0 ? others : notes;
    const note = pool[Math.floor(Math.random() * pool.length)];
    const intensity = Math.round(INTENSITY_MIN + 20 + Math.random() * (INTENSITY_MAX - INTENSITY_MIN - 25));
    return { noteId: note?.id ?? prev[id].noteId, intensity };
  };
  return { top: pick("top"), heart: pick("heart"), base: pick("base") };
}

/**
 * Chapter II's island: compose a scent on a two-page spread.
 *
 * Left page: the presets line and three specimen tiers (pick a note, set its strength).
 * Right page: "your formula", a prescription set around the flacon. The name, the ratio, the cure and
 * the radar are all derived during render from one selection, held in lib/formula-store and nowhere
 * else. Every input calls setFormula exactly once, which is one React render of this subtree; the
 * flacons on this page and the frontispiece re-tint through the store's DOM sinks, never through
 * React, and the letter in chapter V re-renders only when the note trio changes.
 */
export function CompoundBlender() {
  const { selection } = useFormula();

  const ratios = useMemo(() => computeRatios(selection), [selection]);
  const profile = useMemo(() => computeProfile(selection), [selection]);
  const cure = useMemo(() => recommendCure(selection), [selection]);
  const tincture = useMemo(() => mixTincture(selection), [selection]);
  const title = useMemo(() => compositionTitle(selection), [selection]);
  const words = useMemo(() => formatWords(selection), [selection]);

  // Stable handlers that read the store at event time, so the memoised tiers never see new callbacks.
  const setNote = useCallback((tier: TierId, noteId: GlyphId) => {
    const current = getFormula().selection;
    if (current[tier].noteId === noteId) return;
    setFormula({ ...current, [tier]: { ...current[tier], noteId } });
  }, []);

  const setIntensity = useCallback((tier: TierId, intensity: number) => {
    const current = getFormula().selection;
    if (current[tier].intensity === intensity) return;
    setFormula({ ...current, [tier]: { ...current[tier], intensity } });
  }, []);

  const letAtelierChoose = useCallback(() => setFormula(atelierChoice(getFormula().selection)), []);

  return (
    <div className={`bk-book bk-spread ${s.spread}`}>
      <div className={s.left}>
        <MobileSummary tincture={tincture} words={words} ratios={ratios} />

        <p className={s.presets}>
          <span className={s.presetsLead}>Or begin from one of ours:</span>{" "}
          {/* Each name keeps its trailing dot (nowrap), so a line never starts with a separator. */}
          {HOUSE_PRESETS.map((preset) => (
            <Fragment key={preset.id}>
              <span className={s.presetItem}>
                <button
                  type="button"
                  className={s.preset}
                  aria-pressed={sameSelection(preset.selection, selection)}
                  onClick={() => setFormula(preset.selection)}
                >
                  {preset.name}
                </button>
                <span className={s.presetSep} aria-hidden="true">
                  {" ·"}
                </span>
              </span>{" "}
            </Fragment>
          ))}
          <button type="button" className={s.preset} onClick={letAtelierChoose}>
            let the atelier choose
          </button>
        </p>

        <div className={s.tiers}>
          {TIERS.map((tier) => (
            <TierControl
              key={tier.id}
              tier={tier}
              choice={selection[tier.id]}
              share={ratios[tier.id]}
              onNote={setNote}
              onIntensity={setIntensity}
            />
          ))}
        </div>

        <p className={`bk-label ${s.footnote}`}>
          Heavier layers carry further: base notes count 1.2 times, top notes 0.85. All figures are illustrative.
        </p>
      </div>

      <div className="bk-gutter" aria-hidden="true" />

      <div className={s.right}>
        <div className={s.formula}>
          <div className={s.head}>
            <p className="bk-label">your formula</p>
            <h3 className={s.formulaTitle}>{title}</h3>
            <p className={s.formulaWords}>{words}</p>
          </div>
          <div className={s.plate}>
            <FlaconFigure className={s.flacon} />
            <PlateImprint plate="II" what="your formula, poured" className={s.imprint} />
          </div>
          <RatioBar ratios={ratios} className={s.ratio} />
          <CureTimeline cure={cure} className={s.cure} />
          <SensoryRadar profile={profile} className={s.radar} />
          <p className={s.cta}>
            <a className="bk-link" href="#commission">
              Try this as a sample set
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Phones and tablets: a slim bar that rides along at the top of the left page while the visitor works
 * through the three layers, so the colour and the balance stay in view. Hidden from assistive tech:
 * it repeats what the right page says.
 */
function MobileSummary({ tincture, words, ratios }: { tincture: string; words: string; ratios: Ratios }) {
  return (
    <div className={s.summary} aria-hidden="true">
      <span className={s.summarySwatch} style={{ background: tincture }} />
      <span className={s.summaryWords}>{words}</span>
      <span className={`bk-tabular ${s.summaryRatio}`}>
        {ratios.top} · {ratios.heart} · {ratios.base}
      </span>
    </div>
  );
}
