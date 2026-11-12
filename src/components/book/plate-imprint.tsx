// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { imprint, PAGE_IMPRINT } from "@/lib/copyright";

/**
 * The printer's line under a plate: "Plate II · your formula, poured for Aetheria · © 2026 HVNF Studios ·
 * do not redistribute". Exactly ONE per figure; it is the figure's watermark, so no other © goes inside.
 *
 * `credit={false}` sets just "Plate I · drawn for Aetheria". The frontispiece uses it, and carries the
 * HVNF credit in its margin with <PageImprint/> instead (plus the colophon), so the studio's name never
 * sits directly under the hero plate.
 */
export function PlateImprint({
  plate,
  what,
  credit = true,
  className,
}: {
  plate: string;
  what: string;
  credit?: boolean;
  className?: string;
}) {
  return <p className={className ? `bk-imprint ${className}` : "bk-imprint"}>{imprint(plate, what, { credit })}</p>;
}

/**
 * The title page's margin imprint: "A portfolio sample · © 2026 HVNF Studios ·
 * do not redistribute". From 1280px it sits small in the foot of the outer (right) margin, clear of the
 * plate and the links; the parent section must be position: relative. Below 1280px it is a centred
 * line at the foot of the page. Global class .bk-margin-imprint (globals.css).
 */
export function PageImprint({ className }: { className?: string }) {
  return <p className={className ? `bk-margin-imprint ${className}` : "bk-margin-imprint"}>{PAGE_IMPRINT}</p>;
}
