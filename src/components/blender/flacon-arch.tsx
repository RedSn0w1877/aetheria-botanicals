"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { LazyFlacon } from "@/components/three/lazy-flacon";
import { COPYRIGHT_MARK } from "@/lib/copyright";
import { blendFlacon } from "@/lib/flacon-store";
import { useMedia } from "@/lib/use-media";
import { BotanicalGlyph } from "./botanical-glyph";
import { TextSwap } from "./readout-motion";

/**
 * The 3D flacon, set in a tall arched niche like a shelf in an old apothecary.
 * The brass arch outline is drawn by the section's scroll timeline (data-blender-arch).
 * Its markup starts fully drawn, so without JS the frame is simply there.
 */
export function FlaconArch({ tincture }: { tincture: string }) {
  const wide = useMedia("(min-width: 768px)");

  return (
    <div className="relative mx-auto aspect-[3/4] w-full max-w-[320px] lg:w-[min(100%,clamp(225px,33vh,315px))] lg:max-w-none">
      <div className="absolute inset-0 overflow-hidden rounded-t-full bg-herb">
        {/* a low, warm shelf line for the flacon to stand on */}
        <div aria-hidden className="absolute inset-x-0 bottom-[14%] h-px bg-hairline" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-[14%] bg-parchment/60" />
        {/*
          Desktop only. The hero already holds a WebGL context on this page, and a
          phone running two of them at once pays for it in frame rate and battery.
          Below the breakpoint a drawn flacon carries the same reading: it takes the
          tincture colour, so the blend still answers back.
        */}
        {wide ? (
          <LazyFlacon source={blendFlacon} variant="blender" motes={420} parallax={0.5} className="absolute inset-0 h-full w-full" />
        ) : (
          <div aria-hidden className="absolute inset-0 flex items-end justify-center pb-[16%]">
            <span className="relative block h-[46%] w-[38%] rounded-[38%_38%_28%_28%/22%_22%_16%_16%] border border-brass/40 shadow-[inset_0_-10px_24px_rgba(24,35,28,0.18)] transition-colors duration-[1400ms]"
              style={{ backgroundColor: tincture }}
            >
              <span className="absolute -top-[26%] left-1/2 h-[26%] w-[26%] -translate-x-1/2 rounded-t-sm border border-b-0 border-brass/40 bg-parchment/70" />
              <span className="absolute inset-x-[18%] top-[12%] h-[3px] rounded-full bg-parchment/50" />
            </span>
          </div>
        )}
      </div>
      <svg aria-hidden viewBox="0 0 300 400" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" fill="none">
        <path
          data-blender-arch
          d="M1 400V150A149 149 0 0 1 299 150V400"
          stroke="#a88243"
          strokeWidth={1}
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={0}
          vectorEffect="non-scaling-stroke"
        />
        <path d="M14 400V156A136 136 0 0 1 286 156V400" stroke="#a88243" strokeOpacity={0.35} strokeWidth={0.75} vectorEffect="non-scaling-stroke" />
      </svg>
      <span aria-hidden className="absolute -left-3 top-[38%] h-10 w-10 -rotate-12 text-sage/70" data-blender-parallax data-speed="0.6">
        <BotanicalGlyph id="labdanum" className="h-full w-full" ink={false} />
      </span>
      <div className="absolute inset-x-0 bottom-3 flex items-center justify-between gap-2 px-4 font-sans text-[9px] uppercase tracking-[0.22em] text-rosemary/60">
        <span className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden
            className="h-3 w-3 shrink-0 rounded-full border border-brass/70 transition-colors duration-[1400ms]"
            style={{ backgroundColor: tincture }}
          />
          <span className="sr-only">Tincture colour </span>
          <TextSwap text={tincture.toUpperCase()} className="tabular-nums" />
        </span>
        <span className="shrink-0 select-none text-rosemary/40">{COPYRIGHT_MARK}</span>
      </div>
    </div>
  );
}
