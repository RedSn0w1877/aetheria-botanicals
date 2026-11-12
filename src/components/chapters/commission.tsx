// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { ChapterHead } from "@/components/book/chapter-head";
import { Island } from "@/components/book/islands";
// The letter is a deferred island; its styles ship with the page so the prerendered letter is set at first paint.
import "@/components/commission/commission.module.css";

/**
 * Chapter V · Try a sample set: the conversion, written as a letter. Made to order, with no
 * scarcity and no payment; the letter names whatever was composed in chapter II (or the house scent).
 * The masthead's "Commission a scent" link lands here.
 */
export function CommissionChapter() {
  return (
    <section id="commission" aria-labelledby="commission-title" className="bk-chapter">
      <ChapterHead
        id="commission"
        numeral="V"
        title="Try a sample set"
        lead="Write to us, and we’ll pour three small vials of what you made."
      />
      <Island section="commission" />
    </section>
  );
}
