# Aetheria Botanicals

**© 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.**

Showcase piece #3: a fictional slow-extraction botanical perfumery. Demonstrates advanced web animation patterns with Three.js, GSAP, and scroll-driven interactions.

![Aetheria Botanicals](https://via.placeholder.com/1200x630/f8f4f0/5a4d3e?text=Aetheria+Botanicals)

## Overview

A luxury botanical perfumery landing page featuring:
- **3D WebGL flacon** with custom shaders and procedural geometry
- **Scroll-driven animations** powered by GSAP + ScrollTrigger
- **Interactive compound blender** with live sensory profile calculations
- **Pinned horizontal scroll** for extraction ritual walkthrough
- **Smooth physics-based scrolling** via Lenis
- **Full accessibility** with reduced motion support and keyboard navigation

## Features

### Folio I — Apothecary Hero
Editorial headline with animated 3D glass flacon that lifts its stopper as you scroll. Golden motes drift inside, vapour rises when opened.

### Folio II — Compound Blender
Interactive perfume builder with 9 botanicals across 3 tiers. Real-time calculations for:
- Sensory balance (6-axis radar chart)
- Recommended cure period (60-180 days)
- Tincture color mixing
- Vessel recommendation (oak cask, clay amphora, violet glass)

### Folio III — Terroir Inspector
Three harvest lots with GPS coordinates, soil chemistry, distillation specs, and animated botanical specimens.

### Folio IV — Extraction Ritual
Desktop: pinned horizontal scroll through 4 extraction phases  
Mobile/Reduced Motion: stacked tabs with page-turn transitions

### Folio V — Allocation Drawer
Modal with vessel selection, monogram customization, and canvas confetti celebration.

### Folio VI — Monograph Footer
Archive references, live zone clocks, foraging charter, legal links.

## Tech Stack

- **Next.js 16.3.5** — App Router with Turbopack, static export
- **React 19** — Server/client boundaries, strict mode
- **TypeScript** — Full type safety, strict mode enabled
- **Tailwind CSS v4** — Custom design tokens, fluid typography
- **Three.js + R3F** — Custom procedural geometry, shader materials
- **GSAP 3.15** — Scroll-driven timelines, pinned sequences
- **Lenis 1.3** — Smooth scroll integrated with GSAP ticker
- **motion/react** — Framer Motion for component animations
- **Vercel** — Deployment target (also supports GitHub Pages)

## Performance

- **Bundle size**: 2.4 MB JavaScript (uncompressed)
- **Largest chunk**: 968K (Three.js, lazy-loaded)
- **Build time**: ~13s (TypeScript 6s, SSG 2.3s)
- **Routes**: 7 static pages (SSG)
- **Optimizations**: 37 useMemo hooks, 5 React.memo components, mutable stores for 60fps loops

See `PERFORMANCE.md` for detailed optimization report.

## Architecture

```
src/
├── app/              # Next.js App Router
├── components/       # 53 React components
│   ├── blender/     # Interactive perfume blender
│   ├── three/       # WebGL scene (1,264 lines)
│   ├── ritual/      # Pinned/stacked extraction phases
│   └── terroir/     # Harvest lot inspector
└── lib/             # Pure utilities (blend formulas, stores)
```

See `ARCHITECTURE.md` for full system documentation.

## Quick Start

```bash
# Install dependencies
npm install

# Run dev server (port 3002 to avoid conflicts)
npm run dev -- -p 3002

# Build for production
npm run build

# Preview production build
npx serve out -p 3000
```

Visit `http://localhost:3002` for development or `http://localhost:3000/aetheria-botanicals/` for production preview.

## Deployment

### GitHub Pages

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/aetheria-botanicals.git
git push -u origin main

# GitHub Actions will automatically build and deploy
```

See `DEPLOYMENT.md` for detailed deployment instructions.

### Vercel

```bash
npm install -g vercel
vercel
```

## Documentation

- **README.md** — This file (quick start, overview)
- **ARCHITECTURE.md** — Full system architecture (12K words)
- **PERFORMANCE.md** — Optimization strategies (2.8K words)
- **TECH-DIVE.md** — Technical deep dive (9.6K words)
- **DEPLOYMENT.md** — Deployment guide (GitHub Pages, Vercel)
- **optimization-report.md** — Session performance audit (8.6K words)

## Code Quality

- ✓ Zero TODO/FIXME comments
- ✓ Zero TypeScript errors (strict mode)
- ✓ No `any` types in business logic
- ✓ 2 console statements (both intentional: copyright, WebGL error)
- ✓ 35 components with reduced motion support
- ✓ Full keyboard navigation
- ✓ ARIA labels throughout
- ✓ WCAG AA color contrast

## Browser Support

- Chrome/Edge 120+ (full experience)
- Firefox 120+ (full experience)
- Safari 17+ (full experience)
- Mobile Safari (iOS 17+)

**WebGL requirement**: The 3D flacon requires WebGL 2.0. Gracefully falls back to static placeholder on unsupported devices.

## License

© 2026 HVNF Studios. All rights reserved.

This is a portfolio showcase piece. Do not redistribute, copy, or use as a template without explicit permission.

## Showcase Notes

This build demonstrates **maximal motion design** patterns for portfolio purposes:
- GPU particle systems (420 motes + 56 vapour particles)
- Custom GLSL shaders
- Scroll-scrubbed GSAP timelines
- Pinned horizontal sequences
- Physics-based smooth scrolling
- Parallax depth layers
- AnimatePresence transitions

Client work (service businesses) uses a stripped-down stack with subtle reveals only. This proves range.

---

**Built with Claude Code** — HVNF Studios portfolio piece #3
