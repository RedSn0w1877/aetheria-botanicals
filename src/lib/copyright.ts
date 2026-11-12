// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

export const STUDIO = "HVNF Studios";
export const BRAND = "Aetheria Botanicals";
export const COPYRIGHT_YEAR = 2026;
export const COPYRIGHT_MARK = `© ${COPYRIGHT_YEAR} ${STUDIO}`;
export const COPYRIGHT_LINE = `${COPYRIGHT_MARK}. All rights reserved. Portfolio sample — do not redistribute.`;
/** Stated wherever a reader might mistake the brand for a real business. */
export const FICTION_NOTICE = `${BRAND} is a fictional atelier designed by ${STUDIO} as a portfolio sample. Nothing here is for sale.`;

/**
 * The one imprint a figure carries, set under it like a printer's line in a plate book:
 * imprint("II", "your formula, poured") →
 * "Plate II · your formula, poured for Aetheria · © 2026 HVNF Studios · do not redistribute".
 * Rendered by book/plate-imprint.tsx; exactly one per figure.
 *
 * `{ credit: false }` drops the HVNF credit ("Plate I · drawn for Aetheria"). Only the frontispiece
 * uses it: a studio credit directly under the hero plate made visitors think the site was not the
 * perfumer's, so on the title page the credit moves to the margin (PAGE_IMPRINT) and the colophon.
 */
export function imprint(plate: string, what: string, { credit = true }: { credit?: boolean } = {}): string {
  const line = `Plate ${plate} · ${what} for Aetheria`;
  return credit ? `${line} · ${COPYRIGHT_MARK} · do not redistribute` : line;
}

/** The printer's line in the title page's outer margin (book/plate-imprint.tsx PageImprint). */
export const PAGE_IMPRINT = `A portfolio sample · ${COPYRIGHT_MARK} · do not redistribute`;
