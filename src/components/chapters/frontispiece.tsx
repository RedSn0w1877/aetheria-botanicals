// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { Masthead } from "@/components/book/masthead";
import { MarginNote } from "@/components/book/margin-note";
import { PageImprint, PlateImprint } from "@/components/book/plate-imprint";
import { PriceLine } from "@/components/book/price-line";
import { ApothecaryArch } from "@/components/hero/apothecary-arch";
import { LeafLight } from "@/components/hero/leaf-light";
import { FIRST_LINKS, MAKER } from "@/lib/offer";
import s from "./frontispiece.module.css";

/**
 * I · Frontispiece. The book's title page, centred on the spine: the masthead, the plain-language
 * h1 (what this is, within three seconds), the subline, then Plate I (the flacon in its apothecary
 * niche between two margin notes, the right one countersigned by the perfumer), its imprint, the two
 * ways in (make your own, or try ours small) and one plain line of prices. "Commission a scent" lives
 * only in the masthead's corner. The HVNF credit sits in the page's margin (PageImprint), never
 * directly under the plate, so the title page reads as the perfumer's own.
 *
 * Server-rendered. The only client code is two small islands: the leaf light's pointer drift and the
 * poster's glint/tint sinks. section#frontispiece and h1#frontispiece-title are load-bearing: the
 * chapter index, the docked Contents button and the skip link all point at them.
 */
export function FrontispieceChapter() {
  return (
    <section id="frontispiece" aria-labelledby="frontispiece-title" className={s.frontispiece}>
      <LeafLight />
      <Masthead variant="book" />
      <div className={s.page}>
        <h1 id="frontispiece-title" className={s.title}>
          Perfume made from wild plants, steeped in the cold for 180 days.
        </h1>
        <p className={s.subline}>Small batches, picked by hand at dawn and bottled in our Grasse atelier.</p>

        <figure className={s.plate}>
          <MarginNote figure="No. 019" side="left" className={s.noteLeft}>
            an autumn harvest of vetiver and smoked birch, poured into fluted crystal
          </MarginNote>
          <ApothecaryArch />
          <div className={s.noteRight}>
            <MarginNote figure="180 days" side="right">
              steeped cold, turned by hand each week, filtered by gravity alone
            </MarginNote>
            <MarginNote side="right" signed={MAKER.name} signedRole={MAKER.role} className={s.signed}>
              {MAKER.note}
            </MarginNote>
          </div>
          <figcaption className={s.caption}>
            <PlateImprint plate="I" what="drawn" credit={false} />
          </figcaption>
        </figure>

        <p className={s.links}>
          <a href={FIRST_LINKS.compose.href} className={s.compose}>
            {FIRST_LINKS.compose.label}
          </a>
          <a href={FIRST_LINKS.sample.href} className={`bk-link ${s.sample}`}>
            {FIRST_LINKS.sample.label}
          </a>
        </p>
        <PriceLine className={s.price} />
      </div>
      <PageImprint className={s.pageImprint} />
    </section>
  );
}
