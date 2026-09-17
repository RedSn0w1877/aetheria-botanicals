// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

/**
 * Harvest provenance for the three illustrative lots shown in Folio III.
 * Aetheria is fictional: every figure below is plausible but invented.
 * Place names and approximate coordinates are real geography.
 */

export type PlateKind = "pine" | "vetiver" | "rose";

export type TerroirLot = {
  /** Two-digit lot number, shown as the huge serif numeral. */
  number: string;
  /** Batch code printed on the specimen label. */
  code: string;
  commonName: string;
  /** Compact name for narrow selectors. */
  shortName: string;
  latinName: string;
  region: string;
  country: string;
  /** Decimal degrees; positive = north / east. */
  lat: number;
  lng: number;
  altitudeM: number;
  /** One-line summary of the ground, e.g. "Shaded riparian zone". */
  siteSummary: string;
  habitat: string;
  harvestWindow: string;
  harvestHour: string;
  /** Cold vacuum distillation temperature in °C. */
  distillationC: number;
  soilPh: number;
  /** Annual sunshine hours at the site. */
  solarHours: number;
  /** 0..1 share of that light the plants actually receive under canopy / slope. */
  solarFraction: number;
  yieldNote: string;
  verification: {
    code: string;
    /** Pre-formatted so server and client render the identical string. */
    date: string;
  };
  fieldNote: string;
  accords: readonly string[];
  plate: PlateKind;
};

export const TERROIR_LOTS: readonly TerroirLot[] = [
  {
    number: "01",
    code: "AE-019-01",
    commonName: "High-Altitude Maritime Pine",
    shortName: "Maritime Pine",
    latinName: "Pinus pinaster",
    region: "Peloponnese",
    country: "Greece",
    lat: 37.51,
    lng: 22.37,
    altitudeM: 1420,
    siteSummary: "Wind-combed limestone ridge",
    habitat: "Scattered stands on thin limestone scree, facing the Argolic Gulf. Sea air rises every afternoon and leaves salt on the needles.",
    harvestWindow: "Late June, one week",
    harvestHour: "05:40 – 08:10",
    distillationC: 34,
    soilPh: 5.6,
    solarHours: 2840,
    solarFraction: 0.74,
    yieldNote: "Around 1.1 kg of needle tips and resin tears for each millilitre of extract.",
    verification: { code: "VX-0624-PP", date: "24 Jun 2026" },
    fieldNote: "Cut only the new growth, before the sun warms the resin. By nine the ridge smells of hot stone instead.",
    accords: ["Green resin", "Salted needle", "Warm stone"],
    plate: "pine",
  },
  {
    number: "02",
    code: "AE-019-02",
    commonName: "Wild Riverbed Vetiver",
    shortName: "Riverbed Vetiver",
    latinName: "Chrysopogon zizanioides",
    region: "Kyoto Prefecture",
    country: "Japan",
    lat: 35.02,
    lng: 135.66,
    altitudeM: 82,
    siteSummary: "Shaded riparian zone",
    habitat: "A gravel bank under maple and cedar, flooded each spring. The roots grow long and pale, chasing water through the stones.",
    harvestWindow: "Mid October, after the rains",
    harvestHour: "07:00 – 11:30",
    distillationC: 29,
    soilPh: 6.7,
    solarHours: 1790,
    solarFraction: 0.38,
    yieldNote: "Roots rest forty days in cedar crates. Roughly 1.3 kg of oil from every 100 kg.",
    verification: { code: "VX-1019-KY", date: "19 Oct 2026" },
    fieldNote: "Lift the clump with the river still in it. Wash each root by hand; the smell is wet earth first, smoke much later.",
    accords: ["Damp root", "River stone", "Soft smoke"],
    plate: "vetiver",
  },
  {
    number: "03",
    code: "AE-019-03",
    commonName: "Highland Damask Rose",
    shortName: "Damask Rose",
    latinName: "Rosa × damascena",
    region: "Taif",
    country: "Saudi Arabia",
    lat: 21.27,
    lng: 40.42,
    altitudeM: 1760,
    siteSummary: "Pre-dawn hand harvest",
    habitat: "Terraced granite slopes in the Sarawat range. Cold nights and dry days keep the petals small, thick and heavy with oil.",
    harvestWindow: "April, before first heat",
    harvestHour: "03:50 – 06:20",
    distillationC: 23,
    soilPh: 7.8,
    solarHours: 3320,
    solarFraction: 0.88,
    yieldNote: "About three kilograms of petals, close to a thousand blooms, for one gram of absolute.",
    verification: { code: "VX-0412-TF", date: "12 Apr 2026" },
    fieldNote: "Pick by lamplight while the dew is on. Once the sun clears the ridge, half the scent is gone into the air.",
    accords: ["Honeyed petal", "Dew", "Clove heart"],
    plate: "rose",
  },
] as const;

/** "1,420" without locale APIs, so server and client always agree. */
export function groupThousands(value: number): string {
  const rounded = Math.round(value);
  const sign = rounded < 0 ? "-" : "";
  return sign + String(Math.abs(rounded)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** "37.51° N, 22.37° E" */
export function formatCoordinates(lat: number, lng: number): string {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(2)}° ${ns}, ${Math.abs(lng).toFixed(2)}° ${ew}`;
}
