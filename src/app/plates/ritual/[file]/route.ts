// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { dawnSvg } from "@/components/ritual/plates/dawn";
import { filtrationSvg } from "@/components/ritual/plates/filtration";
import { flaconSvg } from "@/components/ritual/plates/flacon";
import { pressSvg } from "@/components/ritual/plates/press";
import { steepSvg } from "@/components/ritual/plates/steep";
import type { RitualPhaseId } from "@/lib/ritual-phases";

/*
 * Chapter IV's four plates as real static files: out/plates/ritual/{forage,press,steep,filter}.svg,
 * named by RITUAL_PHASES ids, plus atomizer.svg, the finished flacon that closes the chapter. They ship complete, as <img>; ritual/plate-drawing.tsx fetches the same
 * file and swaps it inline only when the plate can be scrubbed by scroll. Written at build time by a
 * force-static route handler (dynamicParams = false: nothing else exists under this path).
 */
export const dynamic = "force-static";
export const dynamicParams = false;

const FILES: Record<`${RitualPhaseId}.svg` | "atomizer.svg", () => string> = {
  "forage.svg": dawnSvg,
  "press.svg": pressSvg,
  "steep.svg": steepSvg,
  "filter.svg": filtrationSvg,
  "atomizer.svg": () => flaconSvg("day"),
};

export function generateStaticParams() {
  return Object.keys(FILES).map((file) => ({ file }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const build = FILES[file as keyof typeof FILES];
  if (!build) return new Response("Not found", { status: 404 });
  return new Response(build(), { headers: { "Content-Type": "image/svg+xml; charset=utf-8" } });
}
