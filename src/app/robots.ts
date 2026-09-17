// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import type { MetadataRoute } from "next";

// Static export can't run this at request time, so it's rendered once at build.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  // A portfolio sample, not a real storefront, so keep it out of search results.
  return { rules: { userAgent: "*", disallow: "/" } };
}
