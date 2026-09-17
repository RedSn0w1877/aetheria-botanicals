"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import dynamic from "next/dynamic";
import type { FlaconSceneProps } from "./flacon-types";
import { SceneGuard } from "./scene-guard";

function Loading() {
  return (
    <div role="status" aria-label="Preparing the 3D flacon" className="flex h-full w-full items-center justify-center">
      <span className="font-serif text-lg italic text-rosemary/40">Warming the glass…</span>
    </div>
  );
}

function StillLife() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8 text-center">
      <p className="max-w-xs font-sans text-[10px] uppercase leading-relaxed tracking-[0.3em] text-rosemary/50">
        The glass study needs WebGL, which this device has declined. The full formulation is described alongside.
      </p>
    </div>
  );
}

// three.js needs the browser (window + WebGL), so this chunk never renders on the server.
const FlaconScene = dynamic(() => import("./flacon-scene"), { ssr: false, loading: () => <Loading /> });

export function LazyFlacon(props: FlaconSceneProps) {
  return (
    <SceneGuard fallback={<StillLife />}>
      <FlaconScene {...props} />
    </SceneGuard>
  );
}
