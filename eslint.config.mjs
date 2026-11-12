// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/*
 * These packages stay installed (package.json and the lockfile are frozen), but the book ships none
 * of them: a package that is never imported costs 0 bytes, and one stray import blows the ~41 KB gz
 * budget left above the framework floor. So importing them is a lint error.
 */
const BANNED_PACKAGE = "Not in the book: no WebGL, no GSAP/Lenis, no motion library. Use CSS (transitions, @starting-style, scroll timelines) and native scroll.";
const LEGACY_MODULE = "Legacy shim, deleted in step A2. Use lib/formula-store, lib/device or the book components instead.";

// Step A2 has landed: the legacy shims are deleted and the guard covers every file in src/.
const LEGACY_UNTIL_A2 = [];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // The book uses plain <img> on purpose: a static export has no image optimizer, and each image
      // sets its own srcSet, sizes, fetchPriority and loading (React 19 auto-preloads eager images).
      "@next/next/no-img-element": "off",
    },
  },
  {
    files: ["src/**/*.{ts,tsx,mts}"],
    ignores: LEGACY_UNTIL_A2,
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            ...["gsap", "@gsap/react", "lenis", "motion", "three", "sonner", "canvas-confetti", "lucide-react"].map(
              (name) => ({ name, message: BANNED_PACKAGE }),
            ),
            {
              name: "next/image",
              message: "No next/image in a static export without an optimizer: use <img> with srcSet and an explicit fetchPriority or loading.",
            },
          ],
          patterns: [
            { group: ["gsap/*", "lenis/*", "motion/*", "three/*", "@react-three/*"], message: BANNED_PACKAGE },
            {
              group: [
                "@/lib/gsap",
                "@/lib/gsap-lazy",
                "@/lib/motion",
                "@/lib/use-media",
                "@/lib/flacon-store",
                "@/lib/allocation-store",
                "@/components/brand/folio-mark",
                "@/components/ui/*",
                "@/components/three/*",
                "@/components/providers/*",
              ],
              message: LEGACY_MODULE,
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // The offline Blender pipeline runs under plain node and imports three; it never ships.
    "blender/**",
  ]),
]);

export default eslintConfig;
