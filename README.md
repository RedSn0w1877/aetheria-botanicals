# Aetheria Botanicals — portfolio concept

© 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

Showcase piece #3: a fictional small-batch perfumer in Grasse that makes perfume from wild plants steeped in the cold for 180 days. The site is **the book you write back to**: a centred frontispiece, plates drawn in code, a thumb-cut chapter index, margin notes instead of stat cells, and a letter you fill in to commission a sample of the scent you composed. It is drawn the way old botanical studies were, in "trois crayons" on toned paper: a kraft stock, sepia-black ink, brass rules, sanguine for the one seal, and white gouache heightening on the drawings only. The only dark chapter is the night spread where the provenance lives. The palette lives in `src/app/globals.css` (tokens) and `src/lib/palette.ts` (the same values as hex, for the plate generators and the encoder).

Kroma Labs is a keyboard you play and Apex Dynamics is a night-race poster; this one is slow on purpose: drawings ink themselves in, pages turn, and nothing loops.

Live: https://redsn0w1877.github.io/aetheria-botanicals/

## Run it

```bash
npm install
npm run dev -- -p 3002
```

Pushing to `main` builds the static export and deploys it to GitHub Pages (`.github/workflows/deploy-pages.yml`).

## How it's built

- **Next.js App Router, static export.** React 19, TypeScript, Tailwind v4 tokens plus CSS modules. The production build is served under `/aetheria-botanicals`; `lib/base-path.ts` prefixes the raw URLs Next doesn't rewrite.
- **Server-rendered editorial, small client islands.** The composer (II), the lot pager (III) and the letter (V) are the only interactive islands. The chapter index, the ink observer, the leaf light and the poster glint are tiny behaviour islands. The Contents sheet is a native `<dialog>` opened by `<button commandfor>`, so it works with JavaScript off.
- **No WebGL.** The fluted crystal flacon is rendered offline in Blender Cycles (real refraction and caustics) and shipped as small AVIF layers; the liquid takes the colour of your formula through CSS blending (`background-blend-mode: multiply` plus a mask).
- **No motion library and no scroll library.** Native scroll, CSS transitions, `@starting-style`, and a CSS scroll-driven timeline for the ritual (with a passive, IntersectionObserver-gated fallback where `animation-timeline` is unsupported). An idle page runs no rAF, no timers and no animations.
- **Two typefaces, four files, one preload:** Cormorant Garamond 300 (roman and italic) and Newsreader 400 (roman and italic), latin only.
- **Plates as static files.** Large drawings are generated as SVG strings by force-static route handlers under `src/app/plates/`, so they're cacheable, lazy and never serialized into the page twice.
- **Lint guard.** `three`, `@react-three/*`, `gsap`, `lenis`, `motion`, `sonner`, `canvas-confetti` and `lucide-react` stay installed (the lockfile is frozen) but importing them is a lint error, as is `next/image`.

## The chapters

| | Chapter | What it does |
| --- | --- | --- |
| I | Frontispiece | The headline, the Cycles flacon in an apothecary niche, ink-drawn vetiver and birch, margin notes |
| II | Compose a scent | Choose a top, heart and base note and how strongly each speaks; the glass takes the colour of the blend, with ratios, a scent radar and a cure time |
| III | Provenance | Three harvest lots on a night spread: herbarium plates you turn like pages, instruments, and the foraging charter |
| IV | The ritual | Four slow steps, from dawn harvest to gravity filtration, each plate drawing itself as you scroll |
| V | Commission a sample | A fill-in-the-blanks letter that names your composition and seals with wax |
| VI | Colophon | How the book was made, Terms and Privacy |

## Renders

The offline glass pipeline lives in `blender/` (outside the TypeScript and lint scopes; its output folder `blender/out/` is ignored):

```bash
npm run export-flacon     # flacon geometry → blender/out/flacon.obj
blender -b --factory-startup -P blender/render.py -- --job poster --out blender/out   # Blender 5, one job per run
npm run encode-renders    # PNG renders → budgeted AVIFs in src/assets/renders/ + manifest
```

All figures are illustrative. Aetheria Botanicals is not a real business, and the commission letter sends nothing anywhere.
