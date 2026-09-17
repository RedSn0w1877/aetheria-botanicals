// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import type { FlaconSource } from "@/lib/flacon-store";

/**
 * Contract for the 3D flacon scene. Sections only ever import `LazyFlacon`
 * and pass these props; the scene implementation lives in `flacon-scene.tsx`.
 */
export type FlaconSceneProps = {
  /** Mutable store the render loop reads each frame (see lib/flacon-store). */
  source: FlaconSource;
  /**
   * "hero": large still-life, slow turntable, dense drifting pollen, stopper lifts on scroll.
   * "blender": tighter framing, liquid colour/level/swirl driven by the Compound Blender.
   */
  variant: "hero" | "blender";
  /** Cursor parallax strength, 0..1. */
  parallax?: number;
  /** Botanical mote count. Keep secondary scenes light. */
  motes?: number;
  className?: string;
};
