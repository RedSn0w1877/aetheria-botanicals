// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { flaconSvg, nocturneLightSvg } from "@/components/ritual/plates/flacon";
import { contourSvg } from "@/components/terroir/contour-svg";
import { herbariumSvg } from "@/components/terroir/herbarium-svg";
import { TERROIR_LOTS } from "@/lib/terroir-lots";

/*
 * Chapter III's drawings as real static files: out/plates/terroir/herbarium-{pine,vetiver,rose}.svg and
 * contour-{01,02,03}.svg, plus nocturne.svg and nocturne-light.svg, the chapter's one bottle and its one light. With output: "export", a force-static route handler plus generateStaticParams()
 * writes each one at build time, and dynamicParams = false means nothing else exists under this path.
 * The generators build plain strings (react-dom/server can't be imported in a route handler), and the
 * drawings stay out of the React tree, where a static export would ship them twice (HTML + RSC payload).
 */
export const dynamic = "force-static";
export const dynamicParams = false;

const FILES: Record<string, () => string> = {
  ...Object.fromEntries(
    TERROIR_LOTS.flatMap((lot) => [
      [`herbarium-${lot.plate}.svg`, () => herbariumSvg(lot)],
      [`contour-${lot.number}.svg`, () => contourSvg(lot)],
    ]),
  ),
  "nocturne.svg": () => flaconSvg("night"),
  "nocturne-light.svg": nocturneLightSvg,
};

export function generateStaticParams() {
  return Object.keys(FILES).map((file) => ({ file }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const build = FILES[file];
  if (!build) return new Response("Not found", { status: 404 });
  return new Response(build(), { headers: { "Content-Type": "image/svg+xml; charset=utf-8" } });
}
