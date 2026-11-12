"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { PlateImprint } from "@/components/book/plate-imprint";
import s from "@/components/chapters/provenance.module.css";
import { withBase } from "@/lib/base-path";
import type { TerroirLot } from "@/lib/terroir-lots";
import { IntakeSeal } from "./intake-seal";

export const herbariumSrc = (lot: TerroirLot) => withBase(`/plates/terroir/herbarium-${lot.plate}.svg`);

/**
 * One sheet of the herbarium, Plate III: a parchment card taped at the corners, the pressed specimen
 * (a static file from app/plates/terroir, loaded lazily), its Latin name and origin, the plate's one
 * imprint, and the intake stamp pressed over the bottom-right corner.
 */
export function HerbariumPlate({ lot }: { lot: TerroirLot }) {
  return (
    <figure className={`bk-paper ${s.sheet}`}>
      <span aria-hidden="true" className={s.tape} data-at="tl" />
      <span aria-hidden="true" className={s.tape} data-at="tr" />
      <span aria-hidden="true" className={s.tape} data-at="bl" />
      <span aria-hidden="true" className={s.tape} data-at="br" />
      <p className={`bk-label ${s.sheetLabel}`}>herbarium · {lot.code.toLowerCase()}</p>
      <img
        className={s.specimen}
        src={herbariumSrc(lot)}
        width={520}
        height={680}
        loading="lazy"
        decoding="async"
        draggable={false}
        alt={`Pressed specimen drawing of ${lot.commonName}, ${lot.latinName}.`}
      />
      <figcaption className={s.sheetCaption}>
        <p className={s.sheetLatin}>{lot.latinName}</p>
        <p className="bk-label">
          {lot.region}, {lot.country}
        </p>
        <PlateImprint plate="III" what={`lot ${lot.number}, pressed`} className={s.sheetImprint} />
      </figcaption>
      <IntakeSeal lotCode={lot.code} verificationCode={lot.verification.code} date={lot.verification.date} />
    </figure>
  );
}
