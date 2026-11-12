// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

/**
 * The book's stock and inks as plain hex, for everything that can't read CSS custom properties:
 * the plate generators (an <img> can't see page CSS), inline SVG attributes, the console signature,
 * the viewport theme colour and blender/encode.mjs (Node 24 runs this file with type stripping).
 * globals.css holds the same values as tokens; keep the two in step.
 *
 * The look is "trois crayons" on toned paper, the way old botanical studies were drawn:
 * a kraft/bistre stock, sepia-black ink, sanguine (red chalk) for the one accent, and white gouache
 * heightening on the drawings only. The token NAMES are the old ones (linen, rosemary, terracotta…)
 * so no consumer had to change; the comments give each one's role on the new stock.
 *
 * Contrast (WCAG 2.x), measured on the stock (#C7A982) unless noted:
 *   rosemary 8.07  moss 6.47  sage-ink 5.34 (4.74 on herb)  brass-ink 5.48 (4.86 on herb)
 *   terracotta 3.66 (type >= 24px only)  parchment-on-terracotta 4.86 (the active tab)
 *   on the night ground: linen 8.07  night-dim 8.32  brass-light 7.68
 */
export const PALETTE = {
  /** The page: toned kraft stock. */
  linen: "#C7A982",
  /** A lighter sheet laid on the stock: plates, the letter, the niche, the docked button. */
  parchment: "#DBC5A0",
  /** A deeper kraft: chapter tabs, tape strips, inset bars. */
  herb: "#BC9F77",
  /** Hairline rules and quiet borders. */
  hairline: "#977A54",
  /** Sepia-black ink, and the ground of the one night spread (III). */
  rosemary: "#1E150D",
  /** Secondary ink. */
  moss: "#35271A",
  /** Drawing lines ONLY (3.05:1). Never text. */
  sage: "#6B583D",
  /** Captions, labels, imprints. */
  sageInk: "#45341F",
  /** Sanguine: the wax seal, the current tab, type 24px and up only. */
  terracotta: "#8A3320",
  /** Rules, fleurons, graduations. */
  brass: "#7B5A26",
  /** Links and the letter's blanks. */
  brassInk: "#48310D",
  /** Secondary text on the night ground. */
  nightDim: "#C2AE8A",
  /** Numerals, labels and focus rings on the night ground. */
  brassLight: "#C9A462",
  /** White gouache heightening: highlights in drawings and on glass ONLY. Never text. */
  gouache: "#FBF5E6",
} as const;

export type PaletteKey = keyof typeof PALETTE;
