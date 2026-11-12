// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { ChapterHead } from "@/components/book/chapter-head";
import { Fleuron } from "@/components/book/fleuron";
import { Island } from "@/components/book/islands";
import { withBase } from "@/lib/base-path";
import s from "./provenance.module.css";

/** The foraging charter, moved verbatim from the old footer, closing the night chapter. */
export const CHARTER = [
  "We never take more than a third of any wild stand, and we always leave the roots.",
  "We only harvest land we have walked with the people who tend it.",
  "Every plant is weighed, dated and traced to its hillside in the ledger.",
  "Maceration runs cold and slow: 180 days, with no heat applied.",
  "Spent botanicals return, as compost, to the soil they came from.",
] as const;

const ROMAN = ["i", "ii", "iii", "iv", "v"] as const;

/**
 * III · Provenance: the book's one night chapter, on the sepia-black ground. The lot pager is the
 * only client island; the head, the nocturne, the charter and the no-script note are server markup.
 *
 * The nocturne opens the spread: one bottle, one light, and the lead's first sentence split either
 * side of it ("Every batch begins in one place," | the flacon | "at one altitude, on one morning.").
 * The light is its own file behind the bottle, so the chapter can bring it up once as the reader
 * arrives (the ink observer's data-inked, CSS only); without motion it is simply on. The sentence
 * stays one <p> for screen readers and never moves; only the light does.
 */
export function ProvenanceChapter() {
  return (
    <section id="provenance" aria-labelledby="provenance-title" className={`bk-chapter bk-night ${s.chapter}`}>
      <ChapterHead id="provenance" numeral="III" title="Provenance" />
      <div className={s.nocturne} data-ink="">
        <p className={s.nocturneLine}>
          <span className={s.nocturneLeft}>Every batch begins in one place,</span>{" "}
          <span className={s.nocturneRight}>at one altitude, on one morning.</span>
        </p>
        <div className={s.nocturneBottle}>
          <img
            className={s.nocturneLight}
            src={withBase("/plates/terroir/nocturne-light.svg")}
            width={900}
            height={880}
            loading="lazy"
            decoding="async"
            alt=""
          />
          <img
            className={s.nocturneFlacon}
            src={withBase("/plates/terroir/nocturne.svg")}
            width={300}
            height={440}
            loading="lazy"
            decoding="async"
            alt="One flacon of No. 019, fluted crystal with a brass collar and amber perfume, standing alone under a single light."
          />
        </div>
      </div>
      <p className={`bk-measure ${s.nocturneLead}`}>
        Turn the pages to see where each plant was picked, and what we measured when it reached Grasse.
      </p>
      <noscript>
        <p className={`bk-label ${s.noscript}`}>Turning the pages needs JavaScript; lot 01 is shown.</p>
      </noscript>
      <Island section="provenance" />
      <div className={`bk-measure ${s.charter}`}>
        <Fleuron />
        <h3 className={s.charterTitle}>The rules we forage by</h3>
        <ol className={s.charterList}>
          {CHARTER.map((line, i) => (
            <li key={line}>
              <span className={s.charterNumeral} aria-hidden="true">
                {ROMAN[i]}
              </span>{" "}
              {line}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
