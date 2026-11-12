// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import type { Metadata, Viewport } from "next";
import "./globals.css";
import s from "@/components/book/book.module.css";
import { Colophon } from "@/components/book/colophon";
import { Fleuron } from "@/components/book/fleuron";
import { BookDocument } from "@/components/book/book-document";
import { Masthead } from "@/components/book/masthead";
import { COPYRIGHT_LINE, STUDIO } from "@/lib/copyright";
import { withBase } from "@/lib/base-path";

/**
 * The 404, set as a leaf that was never bound in: the notes masthead (a way back), one centred line,
 * a link to the book, and the colophon with Terms, Privacy and the HVNF imprint, so a stray URL still
 * lands on kraft, inside the book's world. Server-rendered; no client JS beyond the shell's.
 *
 * It is the global 404 (experimental.globalNotFound in next.config.ts), a document of its own outside
 * the root layout, so it binds itself in BookDocument. Being global keeps this leaf out of every other
 * page: a root not-found.tsx is serialized into each page's RSC payload as the layout's fallback.
 */
export const metadata: Metadata = {
  title: "Page not found — Aetheria Botanicals",
  applicationName: "Aetheria Botanicals",
  authors: [{ name: STUDIO }],
  robots: { index: false, follow: false },
  other: { copyright: COPYRIGHT_LINE },
};

export const viewport: Viewport = {
  themeColor: "#c7a982",
  colorScheme: "light",
};

export default function GlobalNotFound() {
  return (
    <BookDocument>
      <Masthead variant="notes" />
      <main id="main" className={`${s.notes} ${s.lost}`}>
        <div className="bk-measure">
          <h1 className={s.notesTitle}>This page was never bound into the book</h1>
          <p className={s.lostText}>
            The address may be mistyped, or the page may have moved. Everything Aetheria makes is in the one book.
          </p>
          <Fleuron />
          <p className={s.lostLink}>
            <a href={withBase("/")} className="bk-link">
              Return to the book
            </a>
          </p>
        </div>
      </main>
      <Colophon variant="notes" />
    </BookDocument>
  );
}
