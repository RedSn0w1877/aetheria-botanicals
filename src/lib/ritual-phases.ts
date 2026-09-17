// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

/**
 * The four steps of the Aetheria extraction ritual, from field to flacon.
 * Every figure here is illustrative: Aetheria is a fictional atelier.
 */

export type RitualMetric = {
  /** The figure itself, set large in the serif. */
  value: string;
  /** Optional unit set small beside the figure. */
  unit?: string;
  /** What the figure measures, in tracked-out microcopy. */
  label: string;
};

export type RitualPhaseId = "forage" | "press" | "steep" | "filter";

export type RitualPhase = {
  id: RitualPhaseId;
  numeral: "I" | "II" | "III" | "IV";
  /** Short verb for the compact phase selector. */
  short: string;
  title: string;
  /** Two or three plain, precise sentences. */
  description: string;
  metrics: readonly RitualMetric[];
  /** Running footer microcopy: where and when this step happens. */
  place: string;
  /** Caption for the hand-drawn plate. */
  plate: string;
  /** Plain description of the plate for screen readers. */
  plateAlt: string;
};

export const RITUAL_PHASES: readonly RitualPhase[] = [
  {
    id: "forage",
    numeral: "I",
    short: "Forage",
    title: "Hand foraging at dawn",
    description:
      "We walk the terraces before the sun clears the ridge, while the petals still hold the night’s cool and their oils sit closest to the surface. One stem in five is taken; the rest are left to seed next year’s field. Everything is carried out in baskets of woven willow, never sacks, so nothing bruises on the way down.",
    metrics: [
      { value: "05:10", label: "Harvest window opens" },
      { value: "1 in 5", label: "Stems taken per plant" },
      { value: "07:00", label: "Last stem cut" },
    ],
    place: "The terraces · first light",
    plate: "Plate I — The dawn harvest",
    plateAlt:
      "Line drawing of the sun rising along a dotted arc over a hill line, with wild stems on the slope and a woven willow basket of cut stems in the foreground.",
  },
  {
    id: "press",
    numeral: "II",
    short: "Press",
    title: "Cryogenic nitrogen pressing",
    description:
      "Within forty minutes of the last cut, the harvest is flash-frozen in liquid nitrogen so the fragile top notes cannot drift away as warmth. Two chilled steel plates then close slowly by hand, cracking the frozen cells open without the heat a mill would add.",
    metrics: [
      { value: "−196", unit: "°C", label: "Nitrogen bath" },
      { value: "40", unit: "min", label: "Field to press, at most" },
      { value: "0", label: "Heat added" },
    ],
    place: "The press room · morning",
    plate: "Plate II — The frost press",
    plateAlt:
      "Line drawing of a hand-turned press closing two plates over frozen petals, with hexagonal frost crystals forming around it and a small clock marking forty minutes.",
  },
  {
    id: "steep",
    numeral: "III",
    short: "Steep",
    title: "Sub-zero cold alcohol maceration",
    description:
      "The pressed botanicals rest in grain alcohol held just below freezing, in sealed glass vessels in the cellar. The cold keeps the bright green edges intact while the scent slowly gives itself up. Once a week, every vessel is turned by hand, for six months.",
    metrics: [
      { value: "−18", unit: "°C", label: "Cellar temperature" },
      { value: "180", unit: "days", label: "Resting in the cold" },
      { value: "26", unit: "turns", label: "By hand, once a week" },
    ],
    place: "The cellar · six months",
    plate: "Plate III — The long steep",
    plateAlt:
      "Line drawing of a lidded glass vessel slowly filling with liquid and suspended leaves, beside a thermometer reading minus eighteen degrees and a counter rolling from day zero to day one hundred and eighty.",
  },
  {
    id: "filter",
    numeral: "IV",
    short: "Filter",
    title: "Gravity filtration into violet glass",
    description:
      "No pumps and no pressure: the finished extract finds its own way down through folded paper, one drop at a time. It falls straight into violet glass, which shields the perfume from the light that would otherwise dull it over the years.",
    metrics: [
      { value: "1", unit: "drop", label: "Every four seconds" },
      { value: "0", unit: "pumps", label: "Gravity alone" },
      { value: "30", unit: "ml", label: "Per sealed flacon" },
    ],
    place: "The bottling table · by the drop",
    plate: "Plate IV — Gravity filtration",
    plateAlt:
      "Line drawing of a funnel lined with folded filter paper, releasing slow single drops into a violet glass flacon that fills as the light is held back.",
  },
] as const;

export const RITUAL_TICKER = [
  "Picked at dawn",
  "Frozen at −196 °C",
  "Steeped cold for 180 days",
  "Turned by hand each week",
  "Filtered by gravity alone",
  "Sealed in violet glass",
] as const;
