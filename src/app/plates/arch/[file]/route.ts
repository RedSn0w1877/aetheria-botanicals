// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { archGraduationsSvg } from "@/components/hero/arch-graduations-svg";
import { archHatchSvg } from "@/components/hero/arch-hatch-svg";

/*
 * The frontispiece's niche furniture as a real static file. With output: "export", a force-static
 * route handler plus generateStaticParams() writes out/plates/arch/graduations.svg at build time;
 * dynamicParams = false means nothing else under /plates/arch/ exists. The generator builds a plain
 * string (react-dom/server can't be imported in a route handler).
 */
export const dynamic = "force-static";
export const dynamicParams = false;

const FILES: Record<string, () => string> = {
  "graduations.svg": archGraduationsSvg,
  "hatch.svg": archHatchSvg,
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
