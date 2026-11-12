// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import type { CSSProperties } from "react";
import s from "@/components/chapters/frontispiece.module.css";
import { FlaconPoster } from "@/components/flacon/flacon-poster";
import { withBase } from "@/lib/base-path";
import { BotanicalDrawing } from "./botanical-drawing";
import { Heightening } from "./heightening";

/** The measuring column's labels, top to bottom, on the right of the niche (ml). */
const GRADUATIONS = ["100", "75", "50", "25", "0"] as const;

/**
 * Plate I: the apothecary niche. A 5:7 parchment box whose top is a full semicircle holds the Cycles
 * poster of the flacon, hatched and heightened by hand (above); over it lie the brass graduations (a
 * generated static SVG used as a CSS mask on a brass fill, so it never competes for LCP), their
 * labels as HTML, a CSS
 * keystone at the crown and a brass baseline that runs past the niche on both sides; the vetiver and
 * birch drawing grows around it all.
 *
 * Sized by --niche-w: from 1024px, clamp(220px, (100svh - 500px) x .714, 430px), which is 286 x 400
 * at 1440 x 900 and 430 x 602 at 2560 x 1440, so the whole frontispiece fits the first screen.
 * Below that, min(62vw, 300px). Server-rendered; the poster is the only client island inside.
 */
export function ApothecaryArch() {
  return (
    <div className={s.arch}>
      <div className={s.niche}>
        <FlaconPoster />
        <Heightening />
      </div>
      <div
        className={s.graduations}
        style={{ "--grad": `url(${withBase("/plates/arch/graduations.svg")})` } as CSSProperties}
        aria-hidden="true"
      />
      <span className={s.gradUnit} aria-hidden="true">
        ml
      </span>
      {GRADUATIONS.map((label, i) => (
        <span
          key={label}
          className={s.gradLabel}
          style={{ top: `${(((300 + i * 90 + 4) / 700) * 100).toFixed(3)}%` }}
          aria-hidden="true"
        >
          {label}
        </span>
      ))}
      <BotanicalDrawing className={s.stems} />
    </div>
  );
}
