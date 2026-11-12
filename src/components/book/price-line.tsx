// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { PRICE_LINE } from "@/lib/offer";

/**
 * The one plain price line: "No. 019, 50 ml · €185 · Sample set, three 2 ml vials · €24", set as a
 * sentence in the running italic, never as a card. The two halves wrap as units on a phone.
 * Server-safe, no JS. Styled by the global .bk-price class (globals.css); pass a className to place it.
 */
export function PriceLine({ className }: { className?: string }) {
  const [perfume, sampleSet] = PRICE_LINE;
  return (
    <p className={className ? `bk-price ${className}` : "bk-price"}>
      <span className="bk-price-item">{perfume}</span>
      <span className="bk-price-sep" aria-hidden="true">
        ·
      </span>
      <span className="bk-sr">; </span>
      <span className="bk-price-item">{sampleSet}</span>
    </p>
  );
}
