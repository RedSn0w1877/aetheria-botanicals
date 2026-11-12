// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import {
  compositionNumber,
  dominantTags,
  type AxisName,
  type CureRecommendation,
  type Selection,
  type SensoryVector,
  type Vessel,
} from "@/lib/blend-formulas";
import type { Composition } from "@/lib/formula-store";

/*
 * The words the book uses for a formula. Pure string builders, shared by the composer (II) and the
 * letter (V), so the prescription and the letter always name a blend the same way.
 */

/** "yuzu, vetiver & moss". It lives in the store (the letter needs it too); re-exported here. */
export { formatWords } from "@/lib/formula-store";

/** "Composition 010": one number per note trio, 001 to 027. */
export function compositionTitle(selection: Selection): string {
  return `Composition ${String(compositionNumber(selection)).padStart(3, "0")}`;
}

/** The house scent, named in the letter until the visitor composes something of their own. */
export const HOUSE_SCENT = "No. 019, the house scent of vetiver & smoked birch";

/** What the letter asks for: the house scent, or "Composition 013 — yuzu, rose & moss". */
export function letterComposition(composition: Composition): string {
  return composition.touched ? `Composition ${composition.number} — ${composition.words}` : HOUSE_SCENT;
}

/** How each sensory axis reads in a sentence. */
const AXIS_PHRASE: Record<AxisName, string> = {
  "Verdant Citrus": "green citrus",
  Floral: "flowers",
  "Dry Woody": "dry wood",
  "Resinous Smoke": "resin and smoke",
  "Earthy Moss": "earthy moss",
  "Sweet Balsam": "sweet balsam",
};

/** The radar in one line: "Mostly earthy moss, then dry wood and green citrus." */
export function dominantSentence(profile: SensoryVector): string {
  const [first, second, third] = dominantTags(profile).map((axis) => AXIS_PHRASE[axis]);
  return `Mostly ${first}, then ${second} and ${third}.`;
}

/** An axis name as a radar label: authored lowercase, never transformed by CSS. */
export function axisLabel(axis: AxisName): string {
  return axis.toLowerCase();
}

const VESSEL_PHRASE: Record<Vessel, string> = {
  "Oak cask": "an oak cask",
  "Clay amphora": "a clay amphora",
  "Violet glass": "violet glass",
};

/** "Rest it 120 days in a clay amphora before it is poured." */
export function cureSentence(cure: CureRecommendation): string {
  return `Rest it ${cure.days} days in ${VESSEL_PHRASE[cure.vessel]} before it is poured.`;
}

/** A tier's role in running text: "The first impression" → "the first impression". */
export function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}
