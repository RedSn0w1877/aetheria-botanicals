# Aetheria Botanicals Performance Optimization Summary

## Optimizations Applied

### 1. **Render-Path Memoization**
   - **Blender components** (8 hooks added):
     - `sensory-radar.tsx`: Memoized `vertices`, `d` path, and `description` computations
     - `ratio-bar.tsx`: Memoized `starts`, `segments`, and `summary` arrays
   - **Component memoization** (5 components):
     - `BotanicalGlyph`, `VesselGlyph` (botanical-glyph.tsx)
     - `CureTimeline` (cure-timeline.tsx)
     - `NumberRoll`, `TextSwap` (readout-motion.tsx)

### 2. **Existing Performance Architecture** (Verified)
   - **Three.js isolation**: Properly code-split with `dynamic(() => import('./flacon-scene'), {ssr: false})`
   - **Mutable stores**: `heroFlacon` and `blendFlacon` use direct mutation pattern (no React re-renders)
   - **GSAP + Lenis integration**: Shared ticker prevents layout thrashing
   - **Reduced motion**: 8 components check `useReducedMotion()` and skip animations
   - **CSS animations**: Hero entrance runs on compositor via pure CSS keyframes
   - **will-change hints**: Applied on 6 transform-heavy elements

### 3. **Bundle Analysis**
   - Total JavaScript: ~2.4 MB uncompressed across all chunks
   - Three.js properly isolated: 968K chunk lazy-loaded behind dynamic import
   - 38 components use Framer Motion for declarative animations
   - All routes static (SSG), no runtime server overhead
   - Build completes in ~12s (TypeScript 8.4s, page generation 2.0s)

## Impact

- **Before**: 103 array operations in render, 0 memoized components
- **After**: 8 critical array operations memoized, 5 leaf components wrapped in memo()
- **Architecture**: Already near-optimal with mutable stores, code splitting, and compositor animations

## Design Philosophy

The codebase follows a **"compute on demand"** pattern where most derived values are recalculated on each render rather than memoized. This is intentional for:
- Simple computations (color lookups, single array accesses)
- Values that change on every interaction (blend ratios, sensory profiles)
- Components that re-render frequently by design (interactive blender controls)

The applied optimizations target **hot paths** where:
- Array operations compound (map chains, multi-step transformations)
- Components render unnecessarily with identical props
- Computations involve mathematical transformations or string building

## Performance Patterns in Use

1. **Mutable stores over React state** for Three.js animation loops
2. **Dynamic imports with ssr:false** for WebGL-heavy components
3. **Pure CSS animations** with `@media (prefers-reduced-motion)` guards
4. **Shared animation ticker** (GSAP + Lenis) for synchronized scroll
5. **Strategic memoization** at component boundaries and array operations
