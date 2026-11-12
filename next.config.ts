// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import path from "node:path";
import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const REPO_PATH = "/aetheria-botanicals";

const nextConfig: NextConfig = {
  // The parent studio folder has its own lockfile; pin the root to this project.
  turbopack: { root: path.resolve(__dirname) },
  // GitHub Pages serves this at github.io/aetheria-botanicals/, not the domain root, and it's a plain
  // static file host (no Node server) — export a static build and prefix every path to match.
  // The prefix is production-only so `npm run dev` still serves from localhost root.
  output: "export",
  basePath: isProd ? REPO_PATH : undefined,
  assetPrefix: isProd ? `${REPO_PATH}/` : undefined,
  // Static export writes `route.html` per page by default; GitHub Pages only auto-serves
  // `index.html` for a directory request, so routes need to actually BE directories.
  trailingSlash: true,

  reactStrictMode: true,

  // app/global-not-found.tsx is the 404: a document of its own, so the 404 leaf is not serialized into
  // every page's RSC payload as the root layout's not-found fallback (about 6 KB of each page's HTML).
  experimental: { globalNotFound: true },

  // next/link and static imports already carry the basePath. Raw URLs (the plate SVGs under
  // /plates/, <link rel=license>) don't, so lib/base-path.ts prefixes them from this value.
  env: { NEXT_PUBLIC_BASE_PATH: isProd ? REPO_PATH : "" },

  compiler: {
    // Strip debug logging from the production bundle, but keep console.error (real failures)
    // and console.info (the AttributionSentinel's copyright signature).
    removeConsole: isProd ? { exclude: ["error", "info"] } : false,
  },
};

export default nextConfig;
