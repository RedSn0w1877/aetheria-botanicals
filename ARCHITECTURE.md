# Aetheria Botanicals — Architecture Overview

**HVNF Studios portfolio showcase piece demonstrating advanced motion design patterns for web.**

## Stack

- **Next.js 16.3.5** — App Router with Turbopack, static export (`output: "export"`)
- **React 19** — Server/client boundary with strategic client directives
- **Three.js + R3F** — Procedural 3D glass flacon with custom geometry and shaders
- **GSAP + ScrollTrigger** — Scroll-driven animations with horizontal containerAnimation
- **Lenis** — Smooth scroll integrated with GSAP ticker
- **motion/react** (Framer Motion) — Declarative component animations
- **Tailwind CSS v4** — Custom tokens, fluid typography

## Code Metrics

- **Total lines**: 10,645 TypeScript/TSX
- **Components**: 53 React components (48 client, 5 server)
- **Three.js implementation**: 1,264 lines (geometry + scene + shaders)
- **Content data**: 632 lines (blend formulas, terroir lots, ritual phases)
- **Build output**: 3.2 MB total, ~2.4 MB JavaScript
- **Bundle chunks**: 14 chunks, largest 968K (Three.js, lazy-loaded)

## Project Structure

```
src/
├── app/                  # Next.js App Router
│   ├── page.tsx         # Main landing (6 sections)
│   └── layout.tsx       # Root with fonts, LenisProvider
│
├── components/
│   ├── ApothecaryHero.tsx              # Folio I — hero with 3D flacon
│   ├── CompoundBlender.tsx             # Folio II — interactive perfume blender
│   ├── TerroirInspector.tsx            # Folio III — harvest lot selector
│   ├── ExtractionRitual.tsx            # Folio IV — 4-phase ritual
│   ├── AllocationDrawer.tsx            # Request allocation modal
│   └── MonographFooter.tsx             # Footer with zone clocks
│   │
│   ├── blender/         # Compound Blender internals
│   │   ├── botanical-glyph.tsx         # SVG line-drawing glyphs (9 botanicals)
│   │   ├── sensory-radar.tsx           # 6-axis radar chart with memoization
│   │   ├── ratio-bar.tsx               # Stacked ratio visualization
│   │   ├── cure-timeline.tsx           # 180-day timeline with vessel
│   │   ├── flacon-arch.tsx             # 3D flacon in arched niche
│   │   └── readout-motion.tsx          # NumberRoll, TextSwap animations
│   │
│   ├── three/           # WebGL scene
│   │   ├── flacon-scene.tsx            # Main scene with shaders (619 lines)
│   │   ├── flacon-geometry.ts          # Procedural lathe with radial fluting (559 lines)
│   │   ├── lazy-flacon.tsx             # Dynamic import wrapper (ssr: false)
│   │   └── scene-guard.tsx             # WebGL capability detection
│   │
│   ├── ritual/          # Ritual section (pinned/stacked layouts)
│   │   ├── pinned-ritual.tsx           # Desktop horizontal scroll with pin
│   │   ├── stacked-ritual.tsx          # Mobile/reduced-motion fallback
│   │   └── phase-parts.tsx             # RitualPlate, PhaseMetrics
│   │
│   ├── terroir/         # Terroir section components
│   │   ├── herbarium-plate.tsx         # Animated botanical specimen
│   │   ├── instruments.tsx             # Animated gauge readouts
│   │   └── intake-seal.tsx             # Rotating verification stamp
│   │
│   ├── hero/            # Hero section internals
│   │   ├── apothecary-arch.tsx         # SVG arch line-drawing
│   │   ├── komorebi-backdrop.tsx       # Parallax light particles
│   │   ├── opening-veil.tsx            # Initial page load transition
│   │   └── rolling-number.tsx          # Badge figure animations
│   │
│   └── providers/
│       └── lenis-provider.tsx          # Smooth scroll + GSAP ticker
│
└── lib/                 # Pure utilities and data
    ├── blend-formulas.ts               # 9 botanicals, 12 formula functions
    ├── terroir-lots.ts                 # 3 harvest lot specifications
    ├── ritual-phases.ts                # 4-phase extraction data
    ├── flacon-store.ts                 # Mutable animation state (heroFlacon, blendFlacon)
    ├── gsap.ts                         # GSAP + ScrollTrigger registration
    └── motion.ts                       # Easing curves (EASE_SILK)
```

## Performance Patterns

### 1. Mutable Stores for Animation Loops

The 3D flacon reads from **mutable objects** outside React state to avoid re-renders in the 60fps `useFrame` loop:

```typescript
// lib/flacon-store.ts
export const heroFlacon = {
  capLift: 0,   // 0 = seated, 1 = lifted
  vapour: 0,    // 0..1 vapour amount
  spin: 0,      // extra rotation in radians
};

// GSAP writes directly to the store:
tl.to(heroFlacon, { capLift: 1, vapour: 1, spin: 0.8 }, 0);

// Three.js reads it every frame, no React re-render:
useFrame(() => {
  const lift = heroFlacon.capLift;
  stopper.position.y = FLACON.collarTopY + lift * FLACON.stopperLift;
});
```

### 2. Code Splitting for Three.js

The 968K Three.js chunk is isolated behind a dynamic import with `ssr: false`:

```typescript
const FlaconScene = dynamic(() => import("./flacon-scene"), {
  ssr: false,
  loading: () => <LoadingSpinner />
});
```

Only loaded when the component mounts client-side, never during SSG.

### 3. GSAP + Lenis Shared Ticker

Smooth scroll and scroll-driven animations run on a single ticker to prevent layout thrashing:

```typescript
const lenis = new Lenis({ duration: 1.2, easing: (t) => 1 - (1 - t) ** 3 });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
```

### 4. Strategic Memoization

- **Component boundaries**: `React.memo` on 5 leaf components (BotanicalGlyph, NumberRoll, etc.)
- **Render-path arrays**: `useMemo` on 8 hot-path computations (sensory-radar vertices, ratio-bar segments)
- **Not memoized**: Simple lookups, values that change on every interaction

### 5. Compositor Animations

Hero entrance uses pure CSS `@keyframes` with `will-change: transform, opacity` so animations run on the compositor thread, not main thread.

### 6. Reduced Motion Guards

8 components check `useReducedMotion()` and either skip animations entirely or use simplified motion:

```typescript
const reduce = useReducedMotion();
const glide = reduce ? { duration: 0 } : { duration: 1.6, ease: EASE_SILK };
```

## Three.js Implementation

### Custom Geometry

The flacon is built from scratch with **procedural lathe geometry** because `THREE.LatheGeometry` can't handle:
1. Radial fluting (radius displaced by angle) with correct normals
2. Seamless wraparound (no UV seam artefacts)
3. Hard edges between profile runs (brass rims) while each run stays smooth

```typescript
// Define profile as 2D points, spin around Y axis
const profile: ProfilePoint[] = [[r, y], ...];

// Add radial fluting with fade-in/fade-out
const flute: FluteSpec = {
  count: 16,        // 16 flutes around the body
  depth: 0.012,     // groove depth in world units
  fadeIn: [0.2, 0.4],
  fadeOut: [1.1, 1.3],
};

// Build indexed BufferGeometry with positions, normals, UVs
const geometry = buildLatheSolid([{ points: profile, segments: 48, flute }]);
```

### Custom Shaders

**Motes** (golden particles inside the flacon):
- Vertex shader: slow rise with wrap, lateral wander, size attenuation
- Fragment shader: soft radial gradient, alpha squared for soft edges
- 420 particles with seeded randomness

**Vapour** (rising from the stopper):
- Vertex shader: helical rise with noise displacement, life cycle fade
- Fragment shader: same soft gradient as motes
- 56 particles, opacity driven by `heroFlacon.vapour` and stopper lift

Both use the same `SOFT_FRAGMENT` shader for consistency.

## Scroll Architecture

### Desktop: Pinned Horizontal Scroll

`pinned-ritual.tsx` uses GSAP's `containerAnimation` to drive horizontal travel through a pinned stage:

```typescript
const travel = gsap.to(track, {
  x: () => -(track.scrollWidth - stage.clientWidth),
  scrollTrigger: {
    trigger: stage,
    start: "top top",
    end: () => `+=${track.scrollWidth - stage.clientWidth}`,
    pin: true,
    scrub: 1,
    anticipatePin: 1,
  },
});

// Each plate's ScrollTrigger watches the horizontal tween, not the page:
ScrollTrigger.create({
  trigger: panel,
  containerAnimation: travel,
  start: "left 85%",
  end: "left 8%",
  onUpdate: (self) => progress.set(self.progress),
});
```

Parallax on numerals and plates is also driven by `containerAnimation`.

### Mobile/Reduced Motion: Stacked Tabs

`stacked-ritual.tsx` shows the same content as a tab selector with page-turn transitions. CSS hides one layout and shows the other; both render, but only one builds ScrollTriggers.

## Content Model

### Blend Formulas (379 lines)

9 botanicals across 3 tiers (Top, Heart, Base), each with:
- **Sensory vector**: 6 axes (Verdant Citrus, Floral, Dry Woody, Resinous Smoke, Earthy Moss, Sweet Balsam)
- **Cure days**: 60–180 days
- **Vessel**: Oak cask, Clay amphora, or Violet glass
- **Tincture color**: RGB in sRGB color space

12 pure functions compute blend ratios, sensory profile, dominant tags, recommended cure, tincture color, and composition number.

### Terroir Lots (139 lines)

3 harvest lots with GPS coordinates, altitude, harvest window, soil pH, distillation temperature, solar hours, accords, and field notes.

### Ritual Phases (114 lines)

4 extraction phases (Harvest, Cryo-stabilization, Cold maceration, Gravity filtration) with illustrations, metrics that animate on reveal, and procedural step descriptions.

## Build Configuration

```typescript
// next.config.ts
const config = {
  output: "export",              // Static site generation
  trailingSlash: true,           // Directory-based routing
  basePath: IS_PROD ? "/aetheria-botanicals" : "",
  images: { unoptimized: true }, // No image optimization in static export
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
};
```

Deployed to GitHub Pages with basePath only in production.

## Design Philosophy

### Visual Direction

- **Palette**: Linen, parchment, rosemary, terracotta, brass, sage, moss
- **Typography**: Cormorant Garamond (serif display), Jost (sans body), fluid clamp() scales
- **Motion**: Silk easing (`cubic-bezier(0.16, 1, 0.3, 1)`), generous durations (0.7–1.6s)
- **Layout**: CSS Grid for page structure, Flexbox inside components

### Interaction

- **Blender**: 3×3 matrix (3 tiers, 3 notes each), intensity 5–100, live recalculation
- **Terroir**: 3 harvest lots, page-turn transitions with `clipPath` animation
- **Ritual**: Desktop horizontal scroll with pin, mobile tab selector
- **Allocation**: Drawer modal with form, canvas confetti on submit

### Accessibility

- Screen reader labels on all interactive elements
- `prefers-reduced-motion` guards in 8 components
- Keyboard navigation (arrow keys, Home/End on tab selectors)
- ARIA roles and `aria-current` on active tabs
- Focus management in modals

## Showcase Characteristics

This is a **portfolio piece**, not a client site, so it uses the full toolkit:
- WebGL/Three.js with custom shaders
- GSAP ScrollTrigger with containerAnimation and parallax
- Lenis smooth scroll
- Framer Motion with AnimatePresence
- Procedural geometry and particle systems
- 10,645 lines of TypeScript/React

Client work (plumbers, clinics, detailers) uses a stripped-down stack: Next.js, Tailwind, subtle reveals only. Showcase pieces prove range.
