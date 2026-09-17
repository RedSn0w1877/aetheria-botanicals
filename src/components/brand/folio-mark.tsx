// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { COPYRIGHT_MARK } from "@/lib/copyright";

const FOLIO_COUNT = "VI";

/**
 * Editorial running head for each section, like the top of a printed monograph page.
 * The right side doubles as the section's copyright mark.
 */
export function FolioMark({ folio, title, tone = "ink" }: { folio: string; title: string; tone?: "ink" | "linen" }) {
  const base = tone === "ink" ? "border-hairline text-rosemary/55" : "border-linen/15 text-linen/55";
  const strong = tone === "ink" ? "text-rosemary" : "text-linen";
  return (
    <div
      className={`flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1 border-b pb-3 font-sans text-[10px] uppercase tracking-[0.32em] ${base}`}
    >
      <span>
        <span className={strong}>
          Folio {folio} / {FOLIO_COUNT}
        </span>
        <span aria-hidden className="mx-3 text-brass">
          ·
        </span>
        {title}
      </span>
      <span className="select-none">{COPYRIGHT_MARK} — Do not redistribute</span>
    </div>
  );
}
