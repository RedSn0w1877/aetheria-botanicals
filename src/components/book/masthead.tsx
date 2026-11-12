// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import s from "./book.module.css";
import { Fleuron } from "./fleuron";
import { withBase } from "@/lib/base-path";

/**
 * The masthead, set like a book's title line: "Contents" on the left, the italic wordmark centred over
 * "botanical perfumery · Grasse", "Commission a scent" on the right, and a hairline rule with the fleuron
 * below. Static, so it scrolls away with the frontispiece (FrontispieceChapter renders it).
 *
 * - variant "book" (home): Contents is a native invoker button, so the dialog opens with zero JS.
 * - variant "notes" (legal pages, the 404): the left becomes a way back, and every link goes through
 *   a plain <a> with the deploy basePath added by withBase(). No next/link: its router chunk would load on
 *   every page, and a visit to the notes should not pull the whole book's payload in the background;
 *   the book loads when the reader asks for it.
 *
 * "Commission a scent" lives only here, in the corner. On phones it reads "Commission" (the rest is
 * kept for screen readers), so it stays on one line and never collides with the "Grasse" tagline.
 */
export function Masthead({ variant }: { variant: "book" | "notes" }) {
  const book = variant === "book";
  return (
    <header className={s.masthead}>
      <div className={s.mastGrid}>
        <div className={s.mastLeft}>
          {book ? (
            <button type="button" commandfor="contents" command="show-modal" className={s.mastAction}>
              Contents
            </button>
          ) : (
            <a href={withBase("/")} className={s.mastAction}>
              ‹ Return to the book
            </a>
          )}
        </div>
        {book ? (
          <a href="#frontispiece" className={s.wordmark}>
            Aetheria
          </a>
        ) : (
          <a href={withBase("/")} className={s.wordmark}>
            Aetheria
          </a>
        )}
        <div className={s.mastRight}>
          {book ? (
            <a href="#commission" className={s.mastCommission}>
              Commission<span className={s.mastLong}> a scent</span>
            </a>
          ) : (
            <a href={withBase("/#commission")} className={s.mastCommission}>
              Commission<span className={s.mastLong}> a scent</span>
            </a>
          )}
        </div>
        <p className={s.tagline}>botanical perfumery · Grasse</p>
      </div>
      <div className={s.mastRule} aria-hidden="true">
        <Fleuron />
      </div>
    </header>
  );
}
