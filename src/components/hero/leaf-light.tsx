"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { useEffect, useRef } from "react";
import { LEAFLIGHT, LEAFLIGHT_800 } from "@/assets/renders";
import s from "@/components/chapters/frontispiece.module.css";
import { ambientMotionAllowed } from "@/lib/device";

/** How far the light may drift with the pointer, each way (px). The image overhangs the section by 12. */
const DRIFT = 8;

/**
 * Window light falling through leaves onto the linen behind the frontispiece: one baked image (a
 * Cycles render of the old komorebi leaves, with the HVNF papermaker's watermark in it), low priority,
 * no blend mode, no filter, no loop. It fades to exact linen at its foot.
 *
 * On a fine pointer, with motion allowed and not lite, it drifts up to ±8 px against the pointer while
 * the pointer moves over the section (so only while it is on screen). Moves are coalesced into one
 * requestAnimationFrame per burst of pointer events and eased by a 900 ms CSS transition; a still
 * pointer schedules nothing, so the idle page runs no frames.
 */
export function LeafLight() {
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const image = ref.current;
    const section = image?.parentElement;
    if (!image || !section) return;
    if (!window.matchMedia("(pointer: fine)").matches || !ambientMotionAllowed()) return;

    let frame = 0;
    let x = 0;
    let y = 0;
    const apply = () => {
      frame = 0;
      const dx = -((x / window.innerWidth) * 2 - 1) * DRIFT;
      const dy = -((y / window.innerHeight) * 2 - 1) * DRIFT;
      image.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`;
    };
    const onMove = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      if (!frame) frame = window.requestAnimationFrame(apply);
    };
    section.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      section.removeEventListener("pointermove", onMove);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <img
      ref={ref}
      className={s.leafLight}
      src={LEAFLIGHT.src}
      srcSet={`${LEAFLIGHT_800.src} ${LEAFLIGHT_800.w}w, ${LEAFLIGHT.src} ${LEAFLIGHT.w}w`}
      sizes="100vw"
      width={LEAFLIGHT.w}
      height={LEAFLIGHT.h}
      alt=""
      aria-hidden="true"
      fetchPriority="low"
      decoding="async"
    />
  );
}
