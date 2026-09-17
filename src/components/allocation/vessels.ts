// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

/**
 * The three vessels Batch 019 is poured into. Heights are relative to the tallest
 * flacon, so the silhouettes can stand side by side at true-ish scale.
 */
export type VesselId = "50" | "100" | "250";

export type Vessel = {
  id: VesselId;
  volume: string;
  name: string;
  note: string;
  /** Rendered height as a fraction of the 250 ml crystal. */
  scale: number;
};

export const VESSELS: readonly Vessel[] = [
  {
    id: "50",
    volume: "50 ml",
    name: "Field flacon",
    note: "Pocket-weight and round-shouldered, for carrying one season with you.",
    scale: 0.52,
  },
  {
    id: "100",
    volume: "100 ml",
    name: "Atelier flacon",
    note: "The house size: a year of slow wear, kept on a dresser away from the sun.",
    scale: 0.74,
  },
  {
    id: "250",
    volume: "250 ml",
    name: "Fluted Crystal",
    note: "Hand-cut crystal with a ground stopper, poured only to order.",
    scale: 1,
  },
] as const;

export const DEFAULT_VESSEL: VesselId = "100";

export function vesselById(id: VesselId): Vessel {
  return VESSELS.find((vessel) => vessel.id === id) ?? VESSELS[1];
}

/** Batch figures used across the invitation and the drawer. Illustrative only. */
export const BATCH = {
  number: "019",
  flacons: 312,
  macerationDays: 180,
} as const;
