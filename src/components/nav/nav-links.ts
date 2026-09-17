// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

export type NavLink = { id: string; label: string; folio: string };

/** In-page sections the header links to, in page order. */
export const NAV_LINKS: readonly NavLink[] = [
  { id: "blender", label: "The Blender", folio: "II" },
  { id: "terroir", label: "Terroir", folio: "III" },
  { id: "ritual", label: "The Ritual", folio: "IV" },
];

/** Sections that exist on the page but aren't linked; crossing them clears the indicator. */
export const UNLINKED_SECTIONS: readonly string[] = ["atelier", "allocation"];
