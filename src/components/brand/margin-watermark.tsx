// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { COPYRIGHT_MARK } from "@/lib/copyright";

/**
 * A quiet line of type set in the left margin on wide screens, the way a book
 * prints its imprint up the gutter. Pointer events are off, so it never blocks anything.
 */
export function MarginWatermark() {
  return (
    <div aria-hidden className="pointer-events-none fixed left-3 top-1/2 z-30 hidden -translate-y-1/2 select-none 2xl:block">
      <p className="rotate-180 whitespace-nowrap font-sans text-[9px] uppercase tracking-[0.42em] text-rosemary/30 mix-blend-multiply [writing-mode:vertical-rl]">
        {COPYRIGHT_MARK} · Portfolio sample · Do not redistribute
      </p>
    </div>
  );
}
