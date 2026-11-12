"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { memo } from "react";
import { TIERS, type Ratios } from "@/lib/blend-formulas";
import s from "./compose.module.css";

/**
 * "In a hundred parts": one bar split into top / heart / base. Each segment is a full-width strip in its
 * tier's tone, slid to its start and scaled to its share (transform only, 600ms silk), with thin
 * parchment seams between them. The figures underneath are the real text; the bar is a picture of them.
 */
export const RatioBar = memo(function RatioBar({ ratios, className }: { ratios: Ratios; className?: string }) {
  const starts: Ratios = { top: 0, heart: ratios.top, base: ratios.top + ratios.heart };

  return (
    <div className={className}>
      <p className="bk-label">in a hundred parts</p>
      <div className={s.ratioBar} aria-hidden="true">
        {TIERS.map((tier) => (
          <span
            key={tier.id}
            className={s.ratioSegment}
            style={{
              background: tier.tone,
              transform: `translateX(${starts[tier.id]}%) scaleX(${ratios[tier.id] / 100})`,
            }}
          />
        ))}
        {/* Seams are zero-wide: cqi is the bar's own width, so 37cqi is 37 parts in a hundred. */}
        <span className={s.ratioSeam} style={{ transform: `translateX(${starts.heart}cqi)` }} />
        <span className={s.ratioSeam} style={{ transform: `translateX(${starts.base}cqi)` }} />
      </div>
      <p className={s.ratioLegend}>
        top {ratios.top} · heart {ratios.heart} · base {ratios.base}
      </p>
    </div>
  );
});
