// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

export type ChapterId = "frontispiece" | "compose" | "provenance" | "ritual" | "commission" | "colophon";

export type Chapter = {
  /** The section (or, for VI, the footer) id on the home page. */
  id: ChapterId;
  numeral: string;
  /** Short title on the thumb-cut chapter index tab. */
  tab: string;
  /** Entry title in the Contents dialog. */
  title: string;
  /** The one-line italic descriptor under each Contents entry. */
  descriptor: string;
};

/** The book's six chapters, in page order. Shared by the chapter index and the Contents dialog. */
export const CHAPTERS: readonly Chapter[] = [
  { id: "frontispiece", numeral: "I", tab: "Frontispiece", title: "Frontispiece", descriptor: "the perfume, the bottle, the 180 days" },
  {
    id: "compose",
    numeral: "II",
    tab: "Compose a scent",
    title: "Compose a scent of your own",
    descriptor: "choose three notes and watch the glass take their colour",
  },
  {
    id: "provenance",
    numeral: "III",
    tab: "Provenance",
    title: "Provenance",
    descriptor: "where each plant was picked, and what we measured",
  },
  { id: "ritual", numeral: "IV", tab: "The ritual", title: "The ritual", descriptor: "four slow steps from field to flacon" },
  {
    id: "commission",
    numeral: "V",
    tab: "Try a sample set",
    title: "Try a sample set",
    descriptor: "three 2 ml vials, written for by letter",
  },
  { id: "colophon", numeral: "VI", tab: "Colophon", title: "Colophon", descriptor: "how this book was made" },
];

export const CHAPTER_IDS: readonly ChapterId[] = CHAPTERS.map((chapter) => chapter.id);
