# Aetheria Botanicals — portfolio concept

© 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

Showcase piece #3: a fictional slow-extraction botanical perfumery. Kroma Labs is industrial and Apex Dynamics is kinetic; this one is unhurried, tactile and editorial, set in sun-bleached linen, rosemary ink, terracotta clay and brushed brass.

Live: https://redsn0w1877.github.io/aetheria-botanicals/

## Run it

```bash
npm install
npm run dev -- -p 3002
```

Pushing to `main` builds the static export and deploys it to GitHub Pages (`.github/workflows/deploy-pages.yml`).

## Stack

Next.js App Router (static export, production-only basePath), React 19, TypeScript, Tailwind v4 tokens, `motion/react`, Lenis smooth scroll bound to GSAP ScrollTrigger, React Three Fiber + drei (the procedural glass flacon and its GLSL mote/vapour shaders), `sonner`, `canvas-confetti`, `lucide-react`.

## Sections

| Folio | Component | What it does |
| --- | --- | --- |
| I | `ApothecaryHero` | Editorial headline, harvest ticker, 3D glass flacon whose stopper lifts as you scroll |
| II | `CompoundBlender` | Choose top, heart and base notes; live ratios, scent-balance radar, cure time, and the tincture in the flacon changes colour |
| III | `TerroirInspector` | Three harvest lots with herbarium drawings, distillation temperature, soil pH, sun exposure and an intake stamp |
| IV | `ExtractionRitual` | Pinned horizontal walk through the four extraction phases on desktop; tabs on mobile and for reduced motion |
| V | `AllocationDrawer` | Private reservation drawer: vessel size, monogram foil stamp, petal confetti on confirmation |
| VI | `MonographFooter` | Archive references, foraging charter, live Grasse and Kyoto clocks, legal |

All figures are illustrative. Aetheria Botanicals is not a real business, and the reservation form sends nothing anywhere.
