// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

/**
 * The three flacon sizes a letter can ask for, once the sample vials suit. Heights are relative to the
 * tallest flacon, so the silhouettes stand at true-ish scale. Illustrative only: nothing is for sale.
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
