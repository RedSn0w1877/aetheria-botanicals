// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import localFont from "next/font/local";

/*
 * Four self-hosted font files, one preload (67.6 KB in all; Google's latin files were 91.3 KB). Each is
 * Google's latin cut of the face, subset with fontTools to what the book sets: Basic Latin, the accented
 * letters of Latin-1 (so a reader's own name still sets in the face when the letter echoes it), and the
 * punctuation in the copy (dashes, curly quotes, guillemets, °, ·, €, −), keeping kerning, ligatures
 * and the numeral styles. Both typefaces are SIL Open Font License; the name tables carry the notice.
 *
 * Both Cormorant calls declare the SAME family, "Cormorant Garamond", so `font-style: italic` on display
 * type picks the italic face. globals.css names those families directly (the --nf-* variables point at
 * next/font's internal names); each .variable class is still applied below or its @font-face is dropped.
 * Only the roman display face (the h1) is preloaded.
 */
const display = localFont({
  src: "./fonts/cormorant-garamond-300.woff2",
  weight: "300",
  style: "normal",
  display: "swap",
  variable: "--nf-display",
  preload: true,
  adjustFontFallback: "Times New Roman",
  declarations: [{ prop: "font-family", value: "Cormorant Garamond" }],
});
const displayItalic = localFont({
  src: "./fonts/cormorant-garamond-300-italic.woff2",
  weight: "300",
  style: "italic",
  display: "swap",
  variable: "--nf-display-italic",
  preload: false,
  adjustFontFallback: "Times New Roman",
  declarations: [{ prop: "font-family", value: "Cormorant Garamond" }],
});
const text = localFont({
  src: [
    { path: "./fonts/newsreader-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/newsreader-400-italic.woff2", weight: "400", style: "italic" },
  ],
  display: "swap",
  variable: "--nf-text",
  preload: false,
  adjustFontFallback: "Times New Roman",
  declarations: [{ prop: "font-family", value: "Newsreader" }],
});

/** The three .variable classes for <html>. Applying them is what makes next/font ship the @font-face rules. */
export const FONT_CLASSES = `${display.variable} ${displayItalic.variable} ${text.variable}`;
