"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { useEffect, useRef, type CSSProperties } from "react";
import { COMPOSE } from "@/assets/renders";
import { fillLevel, mixTincture } from "@/lib/blend-formulas";
import { fillBand, onFormula } from "@/lib/formula-store";
import { useNearView } from "@/lib/use-near-view";
import s from "./flacon.module.css";
import { applyTincture, setFill } from "./tincture";

/** Every layer comes from the same Cycles camera, so they register pixel for pixel. */
const LAYERS = {
  "--set": `url(${COMPOSE.set.src})`,
  "--glass": `url(${COMPOSE.glass.src})`,
  "--liq-low": `url(${COMPOSE.liquid.low.src})`,
  "--liq-mid": `url(${COMPOSE.liquid.mid.src})`,
  "--liq-high": `url(${COMPOSE.liquid.high.src})`,
} as CSSProperties;

/**
 * Compose's flacon, poured to the visitor's formula: three offline renders stacked in a 5:7 niche.
 * - the empty set with its leaf dapple;
 * - the liquid: the visitor's tint multiplied into a grey+alpha pass of the liquid (refraction through
 *   the flutes baked in), one pass per fill band (low / mid / high);
 * - the glass on top: reflections, the brass collar, the stopper and the contact shadow.
 * Nothing loads until the figure is within a screen of the viewport. Colour and fill reach it only
 * through an onFormula sink that writes CSS variables, so composing never re-renders it.
 */
export function FlaconFigure({ className }: { className?: string }) {
  const ref = useRef<HTMLElement>(null);
  const near = useNearView(ref);

  useEffect(() => {
    const figure = ref.current;
    if (!figure) return;
    return onFormula((formula) => {
      applyTincture(figure, mixTincture(formula.selection));
      setFill(figure, fillBand(fillLevel(formula.selection)));
    });
  }, []);

  return (
    <figure
      ref={ref}
      data-flacon=""
      data-fill="mid"
      data-near={near ? "true" : "false"}
      aria-hidden="true"
      className={className ? `${s.figure} ${className}` : s.figure}
      style={LAYERS}
    >
      <div className={s.set} />
      <div className={s.liquid} data-liquid="">
        <span data-tint="a" />
        <span data-tint="b" />
      </div>
      <div className={s.glass} />
    </figure>
  );
}
