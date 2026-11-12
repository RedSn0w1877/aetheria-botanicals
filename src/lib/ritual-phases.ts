// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

/**
 * The four steps of the Aetheria extraction ritual, from field to flacon (chapter IV).
 * Every figure here is illustrative: Aetheria is a fictional atelier.
 */

/** A margin note: the figure set large in Cormorant, then one small italic line. */
export type RitualNote = {
  figure: string;
  text: string;
};

export type RitualPhaseId = "forage" | "press" | "steep" | "filter";

export type RitualPhase = {
  id: RitualPhaseId;
  numeral: "I" | "II" | "III" | "IV";
  /** Lowercase roman for the plate's number, as in "Plate IV·i". */
  roman: "i" | "ii" | "iii" | "iv";
  /** Plain-language title: what happens, not the technique's name. */
  title: string;
  /** Two or three plain, precise sentences. */
  description: string;
  /** The technical name, set small after the plain description. */
  technique: string;
  /** Where and when this step happens, lowercase like every label. */
  place: string;
  notes: readonly RitualNote[];
  /** Caption for the drawn plate. */
  plate: string;
  /** Plain description of the plate for screen readers. */
  plateAlt: string;
};

export const RITUAL_PHASES: readonly RitualPhase[] = [
  {
    id: "forage",
    numeral: "I",
    roman: "i",
    title: "Picked by hand at dawn",
    description:
      "We walk the terraces before the sun clears the ridge, while the petals still hold the night’s cool and their oils sit closest to the surface. One stem in five is taken; the rest are left to seed next year’s field. Everything is carried out in baskets of woven willow, never sacks, so nothing bruises on the way down.",
    technique: "hand foraging",
    place: "the terraces, at first light",
    notes: [
      { figure: "05:10", text: "the harvest window opens" },
      { figure: "1 in 5", text: "stems taken from each plant" },
      { figure: "07:00", text: "the last stem is cut" },
    ],
    plate: "Plate IV·i — the dawn harvest",
    plateAlt:
      "Line drawing of the sun rising along a dotted arc over a hill line, with wild stems on the slope and a woven willow basket of cut stems in the foreground.",
  },
  {
    id: "press",
    numeral: "II",
    roman: "ii",
    title: "Frozen, then pressed by hand",
    description:
      "Within forty minutes of the last cut, the harvest is flash-frozen in liquid nitrogen so the fragile top notes cannot drift away as warmth. Two chilled steel plates then close slowly by hand, cracking the frozen cells open without the heat a mill would add.",
    technique: "cryogenic nitrogen pressing",
    place: "the press room, in the morning",
    notes: [
      { figure: "−196 °C", text: "the nitrogen bath" },
      { figure: "40 min", text: "from field to press, at most" },
    ],
    plate: "Plate IV·ii — the frost press",
    plateAlt:
      "Line drawing of a hand-turned press closing two plates over frozen petals, with six-armed frost stars forming around it and a small clock marking forty minutes.",
  },
  {
    id: "steep",
    numeral: "III",
    roman: "iii",
    title: "Steeped in the cold for six months",
    description:
      "The pressed botanicals rest in grain alcohol held just below freezing, in sealed glass vessels in the cellar. The cold keeps the bright green edges intact while the scent slowly gives itself up. Once a week, every vessel is turned by hand, for six months.",
    technique: "sub-zero cold alcohol maceration",
    place: "the cellar, for six months",
    notes: [
      { figure: "−18 °C", text: "in the cellar" },
      { figure: "180 days", text: "resting in the cold" },
      { figure: "26 turns", text: "by hand, once a week" },
    ],
    plate: "Plate IV·iii — the long steep",
    plateAlt:
      "Line drawing of a lidded glass vessel slowly filling with liquid and suspended leaves, beside a thermometer reading minus eighteen degrees and a counter rolling from day zero to day one hundred and eighty.",
  },
  {
    id: "filter",
    numeral: "IV",
    roman: "iv",
    title: "Filtered by gravity into glass",
    description:
      "The finished extract finds its own way down through folded paper, one drop at a time. It falls straight into fluted crystal, stoppered at once and kept from the light that would dull it over the years.",
    technique: "gravity filtration",
    place: "the bottling table, drop by drop",
    notes: [
      { figure: "1 drop", text: "every four seconds" },
      { figure: "50 ml", text: "in each sealed flacon" },
    ],
    plate: "Plate IV·iv — gravity filtration",
    plateAlt:
      "Line drawing of a funnel lined with folded filter paper, releasing slow single drops into a glass flacon that fills as the light is held back.",
  },
] as const;
