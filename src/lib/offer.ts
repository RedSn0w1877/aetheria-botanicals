// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

/**
 * What the atelier sells, and who makes it: one source for the first screen, the commission letter
 * and the Contents, so the names and figures never drift between chapters. All of it is fiction,
 * inside the portfolio sample's fiction (FICTION_NOTICE); the prices are illustrative.
 */

/** The perfume on the frontispiece. */
export const NO_019 = { name: "No. 019", size: "50 ml", price: "€185" } as const;

/** The way in for a visitor who isn't ready for a full bottle. */
export const SAMPLE_SET = { name: "sample set", contents: "three 2 ml vials", price: "€24" } as const;

/**
 * The first screen's two ways in, under the plate. Deliberately different jobs: make your own,
 * or try ours small. "Commission a scent" lives only in the masthead's corner.
 */
export const FIRST_LINKS = {
  compose: { href: "#compose", label: "Compose your own scent" },
  sample: { href: "#commission", label: "Try a sample set of three vials" },
} as const;

/** The one plain price line, as its two halves (book/price-line.tsx sets them with a brass dot). */
export const PRICE_LINE = [
  `${NO_019.name}, ${NO_019.size} · ${NO_019.price}`,
  `Sample set, ${SAMPLE_SET.contents} · ${SAMPLE_SET.price}`,
] as const;

/**
 * The maker, for the signed margin note beside the plate: a name and a hand, not a testimonial.
 * The plants come from the lots in lib/terroir-lots.ts (Peloponnese, Kyoto Prefecture, Taif).
 */
export const MAKER = {
  name: "Odile Varenne",
  role: "perfumer, Grasse",
  note: "Our pickers gather each plant where it grows wild, from the Peloponnese to Kyoto, and I meet every lot the morning it reaches Grasse.",
} as const;
