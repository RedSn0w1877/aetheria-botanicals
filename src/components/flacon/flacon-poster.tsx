"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { useEffect, useRef, type CSSProperties } from "react";
import { COMPOSE, GLINT, POSTER } from "@/assets/renders";
import { mixTincture } from "@/lib/blend-formulas";
import { ambientMotionAllowed } from "@/lib/device";
import { onFormula } from "@/lib/formula-store";
import s from "./flacon.module.css";
import { applyTincture } from "./tincture";

const ALT =
  "A fluted crystal perfume bottle with a brass collar and a cut-glass stopper, two-thirds full of amber perfume, standing in an arched niche in soft window light.";

const SRC_SET = [POSTER[480], POSTER[720], POSTER[960]].map((render) => `${render.src} ${render.w}w`).join(", ");

/** The hero always pours the mid fill; the glint image waits until the poster has decoded. */
const LAYERS = {
  "--liq": `url(${COMPOSE.liquid.mid.src})`,
  "--glint": `url(${GLINT.src})`,
} as CSSProperties;

/**
 * The frontispiece flacon: an offline Cycles photograph (fluted crystal, brass collar, amber, caustics),
 * the page's one preloaded image. It paints as soon as it decodes: no fade, no veil.
 *
 * Two small behaviours, both after hydration and neither touching React state:
 * - once the poster has decoded and the stems and gouache have inked in (1.5 s), one 1.2 s glint
 *   crosses the glass: draw, then light, as the title page's last beat (not on lite or reduced motion);
 * - once the visitor composes a scent below, the liquid takes its colour (an onFormula sink).
 */
export function FlaconPoster() {
  const figureRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const figure = figureRef.current;
    const image = imageRef.current;
    if (!figure || !image) return;
    const start = performance.now();

    const stop = onFormula((formula) => {
      if (!formula.touched) return;
      figure.dataset.custom = "true";
      applyTincture(figure, mixTincture(formula.selection));
    });

    let live = true;
    let timer = 0;
    if (ambientMotionAllowed()) {
      image
        .decode()
        .then(() => {
          const highlight = new Image();
          highlight.src = GLINT.src;
          return highlight.decode();
        })
        .then(() => {
          // The stems and gouache ink in from first paint and are done about 2.1 s into the page's
          // life: light the glass after them, never alongside (at least 600 ms after hydration).
          const wait = Math.max(600 - (performance.now() - start), 2100 - performance.now(), 0);
          timer = window.setTimeout(() => {
            if (live && figure.dataset.glint === "idle") figure.dataset.glint = "run";
          }, wait);
        })
        .catch(() => {
          // A poster that fails to decode simply keeps still.
        });
    }

    return () => {
      live = false;
      window.clearTimeout(timer);
      stop();
    };
  }, []);

  return (
    <figure ref={figureRef} data-flacon="" data-custom="false" data-glint="idle" className={s.poster} style={LAYERS}>
      <img
        ref={imageRef}
        className={s.posterImg}
        src={POSTER[960].src}
        srcSet={SRC_SET}
        sizes="(min-width:1024px) 430px, 62vw"
        width={960}
        height={1344}
        fetchPriority="high"
        alt={ALT}
      />
      <div className={s.tint} aria-hidden="true">
        <span data-tint="a" />
        <span data-tint="b" />
      </div>
      <div
        className={s.glintWin}
        aria-hidden="true"
        onAnimationEnd={() => {
          if (figureRef.current) figureRef.current.dataset.glint = "done";
        }}
      >
        <span className={s.glintImg} />
      </div>
    </figure>
  );
}
