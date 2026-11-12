"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { memo, type CSSProperties } from "react";
import { CURE_MAX_DAYS, type CureRecommendation } from "@/lib/blend-formulas";
import { VesselGlyph } from "./botanical-glyph";
import { cureSentence } from "./formula-text";
import s from "./compose.module.css";

/** One label per month along the 180-day ruler. */
const MONTH_LABELS = ["day 0", "1 mo", "2", "3", "4", "5", "6"] as const;

const labelStyle = (i: number): CSSProperties => ({
  left: `${((i / (MONTH_LABELS.length - 1)) * 100).toFixed(3)}%`,
  // The ends hang inward so the ruler never overflows its column.
  translate: i === 0 ? "0" : i === MONTH_LABELS.length - 1 ? "-100%" : "-50%",
});

/**
 * The cure, as a sentence first ("Rest it 120 days in a clay amphora before it is poured.") and then a
 * day ruler from 0 to 180 with month ticks. The resting stretch and the diamond marker move by
 * transform (900ms silk); the vessel drawing swaps instantly. The ruler is a picture of the sentence.
 */
export const CureTimeline = memo(function CureTimeline({
  cure,
  className,
}: {
  cure: CureRecommendation;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className={s.cureHead}>
        <VesselGlyph vessel={cure.vessel} className={s.cureVessel} />
        <p className={s.cureSentence}>{cureSentence(cure)}</p>
      </div>
      <div
        className={s.ruler}
        aria-hidden="true"
        style={{ "--pct": (cure.days / CURE_MAX_DAYS).toFixed(4) } as CSSProperties}
      >
        <span className={s.rulerRest} />
        <span className={s.rulerTrack}>
          <span className={s.rulerMarker} />
        </span>
        {MONTH_LABELS.map((label, i) => (
          <span key={label} style={labelStyle(i)}>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
});
