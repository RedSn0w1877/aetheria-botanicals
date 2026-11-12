// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { ChapterHead } from "@/components/book/chapter-head";
import { Island } from "@/components/book/islands";
import s from "@/components/blender/compose.module.css";

/**
 * Chapter II · Compose a scent of your own. The chapter head is server markup; the composer below it is
 * the client island (CompoundBlender, loaded and hydrated on its own as the chapter nears: book/islands.tsx), server-rendered with our daily blend, so the spread reads whole
 * before hydration and without JavaScript.
 */
export function ComposeChapter() {
  return (
    <section id="compose" aria-labelledby="compose-title" className="bk-chapter">
      <ChapterHead
        id="compose"
        numeral="II"
        title="Compose a scent of your own"
        lead="Choose one note for each layer of the perfume: the first impression, the heart, and the base that lingers. Set how strongly each one speaks, and the bottle beside you takes the colour of what you make."
        aside="Nine wild tinctures, drawn cold over months. Twenty-seven ways to wear them."
      />
      <noscript>
        <p className={`bk-label ${s.noscript}`}>Composing needs JavaScript. Shown here is our daily blend.</p>
      </noscript>
      <Island section="compose" />
    </section>
  );
}
