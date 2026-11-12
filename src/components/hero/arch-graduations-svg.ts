// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { PALETTE } from "@/lib/palette";
import { num, svgDoc } from "@/lib/svg-string";

/*
 * The apothecary niche's brass furniture as a static file: out/plates/arch/graduations.svg, written at
 * build time by app/plates/arch/[file]/route.ts and shown over the poster as a low-priority <img>.
 * Inline it cost 12.7 KB twice (HTML plus the RSC payload); as a file it is about 2 KB, cached.
 *
 * Geometry is the old inline arch's, in the same 500 × 700 box as the niche (a 5:7 box whose top is
 * a full semicircle), so it scales uniformly onto the rounded border:
 * - the inner moulding, 26 units inside the edge;
 * - 41 ticks around the arch, every fifth one long;
 * - a measuring column down the right side (major every 10, mid every 5), a sparser one on the left.
 * Two paths only, major and minor, with 1-decimal coordinates. No text: the "100 … 0" and "ml"
 * labels are HTML spans in apothecary-arch.tsx. The page uses this file as a CSS mask over a brass
 * fill (so it is never a largest-contentful-paint candidate; as an <img> it beat the h1 and the
 * poster on phones), which means only its alpha counts; the PALETTE brass keeps the file itself
 * correct when it is opened on its own. Strokes don't scale with the image (they are never inked,
 * so non-scaling strokes are safe here). The gouache catch-light on the moulding is drawn inline
 * with the rest of the heightening.
 */

const W = 500;
const R = W / 2;
const CX = R;
const CY = R;
const BRASS = PALETTE.brass;
const p = (n: number) => num(n, 1);

export function archGraduationsSvg(): string {
  const major: string[] = [];
  const minor: string[] = [];

  // Inner moulding.
  minor.push(`M26 700V${CY}A${R - 26} ${R - 26} 0 0 1 ${W - 26} ${CY}V700`);

  // Ticks around the arch, from the left spring point over the crown to the right.
  for (let i = 0; i <= 40; i += 1) {
    const angle = Math.PI + (i / 40) * Math.PI;
    const isMajor = i % 5 === 0;
    const r0 = R - 7;
    const r1 = r0 - (isMajor ? 16 : 8);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const x0 = CX + r0 * cos;
    const y0 = CY + r0 * sin;
    const tick = `M${p(x0)} ${p(y0)}l${p((r1 - r0) * cos)} ${p((r1 - r0) * sin)}`;
    (isMajor ? major : minor).push(tick);
  }

  // Measuring column on the right: 100 ml at y = 300 down to 0 at y = 660.
  for (let i = 0; i <= 40; i += 1) {
    const y = 300 + i * 9;
    const isMajor = i % 10 === 0;
    const length = isMajor ? 20 : i % 5 === 0 ? 13 : 7;
    (isMajor ? major : minor).push(`M${W - 7} ${y}h-${length}`);
  }

  // A sparser column down the left side.
  for (let i = 0; i <= 20; i += 1) {
    const y = 300 + i * 18;
    const isMajor = i % 5 === 0;
    (isMajor ? major : minor).push(`M7 ${y}h${isMajor ? 13 : 6}`);
  }

  const body = [
    `<path d="${minor.join("")}" stroke-width="0.8" stroke-opacity="0.55" vector-effect="non-scaling-stroke"/>`,
    `<path d="${major.join("")}" stroke-width="1.3" stroke-opacity="0.9" vector-effect="non-scaling-stroke"/>`,
  ].join("");

  return svgDoc({
    viewBox: `0 0 ${W} 700`,
    title: "Brass graduations of the apothecary niche",
    body,
    attrs: { fill: "none", stroke: BRASS, "stroke-linecap": "round" },
  });
}
