// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

// A namespace import on purpose: React's server build has no useSyncExternalStore, and a named
// import of it would fail the build the moment a server component imported this module for one of
// its pure helpers (fillBand, formatWords, getFormula). The hooks below only ever run in client islands.
import * as React from "react";
import { compositionNumber, DEFAULT_SELECTION, getNote, TIER_IDS, type Selection } from "@/lib/blend-formulas";

/**
 * The visitor's formula: the one piece of state shared by the composer (II), both flacons (I and II)
 * and the letter (V). It replaces the old per-flacon and drawer stores.
 *
 * It lives outside React in a tiny subscribable store, so:
 * - React islands read it with useFormula()/useComposition() (useSyncExternalStore, hydration-safe:
 *   the server snapshot is the untouched house blend);
 * - the flacons never re-render to change colour. They register DOM sinks with onFormula() and write
 *   CSS variables directly, so a slider drag costs one React render of the composer and nothing else.
 *
 * No React state anywhere else holds the formula, and nothing is persisted.
 */

export type Formula = { selection: Selection; touched: boolean };

/** What the letter shows. A stable object that only changes with the note trio or `touched`. */
export type Composition = {
  touched: boolean;
  /** "010" etc. once the visitor has composed; "019", the house scent, until then. */
  number: string;
  /** "yuzu, vetiver & moss" */
  words: string;
};

export type FillBand = "low" | "mid" | "high";

type Sink = (formula: Formula) => void;

/** The server snapshot, and the client's state until the first setFormula: the house blend, untouched. */
const HOUSE: Formula = { selection: DEFAULT_SELECTION, touched: false };

let current: Formula = HOUSE;
const listeners = new Set<() => void>();
const sinks = new Set<Sink>();

/** A sink that throws must not stop the others, or the React islands, from hearing about the change. */
function runSink(sink: Sink, formula: Formula) {
  try {
    sink(formula);
  } catch (error) {
    queueMicrotask(() => {
      throw error;
    });
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getFormula(): Formula {
  return current;
}

const getHouse = () => HOUSE;

/**
 * Sets a new selection and marks the formula touched. Notifies React subscribers and DOM sinks
 * synchronously. Pass a new object for every change (never mutate the current selection).
 */
export function setFormula(next: Selection): void {
  if (current.touched && current.selection === next) return;
  current = { selection: next, touched: true };
  for (const listener of listeners) listener();
  for (const sink of sinks) runSink(sink, current);
}

/** The whole formula, re-rendering on every change (the composer uses this). */
export function useFormula(): Formula {
  return React.useSyncExternalStore(subscribe, getFormula, getHouse);
}

/** "yuzu, vetiver & moss": the three notes' short names, lowercase, top to base. */
export function formatWords(selection: Selection): string {
  const [top, heart, base] = TIER_IDS.map((id) => getNote(selection[id].noteId).short.toLowerCase());
  return `${top}, ${heart} & ${base}`;
}

const trioKey = (f: Formula) =>
  `${f.touched ? 1 : 0}|${f.selection.top.noteId}|${f.selection.heart.noteId}|${f.selection.base.noteId}`;

const toComposition = (f: Formula): Composition => ({
  touched: f.touched,
  number: f.touched ? String(compositionNumber(f.selection)).padStart(3, "0") : "019",
  words: formatWords(f.selection),
});

const HOUSE_COMPOSITION = toComposition(HOUSE);
let composition = HOUSE_COMPOSITION;
let compositionKey = trioKey(HOUSE);

/** Cached per note trio, so useSyncExternalStore sees the same object while only intensities change. */
function getComposition(): Composition {
  const key = trioKey(current);
  if (key !== compositionKey) {
    compositionKey = key;
    composition = toComposition(current);
  }
  return composition;
}

const getHouseComposition = () => HOUSE_COMPOSITION;

/**
 * The composition the letter names. Re-renders only when the note trio or `touched` changes, so
 * dragging a strength slider never re-renders the letter.
 */
export function useComposition(): Composition {
  return React.useSyncExternalStore(subscribe, getComposition, getHouseComposition);
}

/**
 * Registers a DOM sink (B's flacons). It is called once immediately with the current formula, then
 * synchronously on every setFormula. Returns the unsubscribe function, for an effect's cleanup.
 */
export function onFormula(sink: Sink): () => void {
  sinks.add(sink);
  runSink(sink, current);
  return () => {
    sinks.delete(sink);
  };
}

/** Which rendered liquid pass to show. fillLevel() spans 0.372..0.800; every preset lands in "mid". */
export function fillBand(level: number): FillBand {
  if (level < 0.5) return "low";
  if (level < 0.68) return "mid";
  return "high";
}
