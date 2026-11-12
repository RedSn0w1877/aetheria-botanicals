// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { COPYRIGHT_LINE, FICTION_NOTICE } from "@/lib/copyright";
import s from "./book.module.css";
import { EmbossSeal } from "./emboss-seal";
import { Fleuron } from "./fleuron";
import { withBase } from "@/lib/base-path";

/**
 * Chapter VI, the colophon: how the book was made, set small and centred like the last page of a
 * printed book. It closes the home page and both legal pages. The printer's imprint (the full
 * copyright line) sits beside a blind-embossed HVNF seal.
 *
 * `variant="notes"` (legal pages, the 404) routes the return link back to the home page. Every link is a
 * plain <a> with the basePath added by withBase(): next/link here would put its router chunk on every page.
 */
export function Colophon({ variant = "book" }: { variant?: "book" | "notes" }) {
  return (
    <footer id="colophon" aria-labelledby="colophon-title" className={s.colophon}>
      <div className="bk-measure">
        <Fleuron />
        <h2 id="colophon-title" className={s.colophonTitle}>
          Colophon
        </h2>
        <p className={s.colophonText}>
          Set in Cormorant Garamond and Newsreader. Plates drawn in code; glass rendered in Blender. Composed by HVNF
          Studios, MMXXVI.
        </p>
        <p className={s.colophonNotice}>{FICTION_NOTICE}</p>
        {/*
          No prefetch: nobody needs the notes warmed in advance, and Next 16.3's static export writes the
          segment prefetch file nested (__next.legal/terms/__PAGE__.txt) while the router asks for it
          flat, so every prefetch was a 404 in the console.
        */}
        <p className={s.colophonLinks}>
          <a href={withBase("/legal/terms/")} className="bk-link">
            Terms
          </a>
          <span className={s.colophonDot} aria-hidden="true">
            ·
          </span>
          <a href={withBase("/legal/privacy/")} className="bk-link">
            Privacy
          </a>
        </p>
        <p className={s.colophonReturn}>
          {variant === "book" ? (
            <a className="bk-link" href="#frontispiece">
              Return to the frontispiece
            </a>
          ) : (
            <a className="bk-link" href={withBase("/#frontispiece")}>
              Return to the frontispiece
            </a>
          )}
        </p>
        <div className={s.printer}>
          <EmbossSeal className={s.printerSeal} />
          <p className={s.printerLine}>{COPYRIGHT_LINE}</p>
        </div>
      </div>
    </footer>
  );
}
