// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { FICTION_NOTICE } from "@/lib/copyright";
import s from "./book.module.css";
import { CHAPTERS } from "./chapters";

/**
 * The table of contents: a full-page native <dialog>, opened by any
 * <button commandfor="contents" command="show-modal"> (the masthead's, or the docked one on phones).
 *
 * Zero React JS. showModal() already gives us what mobile-sheet.tsx used to hand-write: it traps
 * focus inside, focuses the first control (Close), closes on Escape, returns focus to the opener, and
 * globals.css locks page scroll with html:has(dialog[open]). ChapterIndex adds the two small
 * behaviours HTML can't: closing when an entry is followed, and an opener for browsers without invokers.
 */
export function Contents() {
  return (
    <dialog id="contents" aria-labelledby="contents-title" className={s.contents} data-print="hide">
      <div className={s.contentsPage}>
        <button type="button" commandfor="contents" command="close" className={s.contentsClose}>
          Close
        </button>
        <h2 id="contents-title" className={s.contentsTitle}>
          Contents
        </h2>
        <ol className={s.contentsList}>
          {CHAPTERS.map((chapter) => (
            <li key={chapter.id}>
              {/* The {" "} spaces only matter to the accessible name ("Provenance III where each…"); flex drops them visually. */}
              <a href={`#${chapter.id}`} className={s.entry}>
                <span className={s.entryLine}>
                  <span className={s.entryTitle}>{chapter.title}</span>{" "}
                  <span className={s.leader} aria-hidden="true" />{" "}
                  <span className={s.entryNumeral}>{chapter.numeral}</span>
                </span>{" "}
                <span className={s.entryDescriptor}>{chapter.descriptor}</span>
              </a>
            </li>
          ))}
        </ol>
        <p className={s.contentsNotice}>{FICTION_NOTICE}</p>
      </div>
    </dialog>
  );
}
