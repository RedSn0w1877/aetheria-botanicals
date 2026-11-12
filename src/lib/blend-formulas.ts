// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

/**
 * The Compound Blender's formulary.
 *
 * Everything in here is plain data plus pure functions, so the UI can call them during
 * render without side effects and the numbers are identical on server and client.
 * All figures are illustrative: Aetheria is a fictional atelier.
 */

export const TIER_IDS = ["top", "heart", "base"] as const;
export type TierId = (typeof TIER_IDS)[number];

export const AXES = ["Verdant Citrus", "Floral", "Dry Woody", "Resinous Smoke", "Earthy Moss", "Sweet Balsam"] as const;
export type AxisName = (typeof AXES)[number];

/** One value per axis, in AXES order, each 0..1. */
export type SensoryVector = readonly [number, number, number, number, number, number];

export type Vessel = "Oak cask" | "Clay amphora" | "Violet glass";

export type GlyphId = "bergamot" | "yuzu" | "pine" | "vetiver" | "rose" | "cedar" | "moss" | "amber" | "labdanum";

export type Note = {
  id: GlyphId;
  tier: TierId;
  name: string;
  /** The word used in composition names. */
  short: string;
  origin: string;
  /** One whispered line. */
  descriptor: string;
  /** Tincture colour as it sits in the glass. */
  tincture: `#${string}`;
  vector: SensoryVector;
  /** How many days of resting this note asks for on its own. */
  cureDays: number;
  vessel: Vessel;
};

export type Tier = {
  id: TierId;
  numeral: string;
  label: string;
  /** Plain-language role of the layer. */
  role: string;
  whisper: string;
  /** How much each point of intensity counts. Base notes are dense and carry further. */
  weight: number;
  /**
   * This tier's ink in the ratio bar and the strength rail: the book's trois crayons on kraft
   * (brass for the top, sanguine for the heart, sepia for the base). Same hex as lib/palette.ts.
   */
  tone: `#${string}`;
  notes: readonly Note[];
};

export type TierChoice = { noteId: GlyphId; intensity: number };
export type Selection = Record<TierId, TierChoice>;
export type Ratios = Record<TierId, number>;

export const INTENSITY_MIN = 5;
export const INTENSITY_MAX = 100;

export const TIERS: readonly Tier[] = [
  {
    id: "top",
    numeral: "I",
    label: "Top note",
    role: "The first impression",
    whisper: "Bright and fleeting. Gone within the hour.",
    weight: 0.85,
    tone: "#7b5a26",
    notes: [
      {
        id: "bergamot",
        tier: "top",
        name: "Cold-Pressed Bergamot",
        short: "Bergamot",
        origin: "Reggio Calabria, Italy",
        descriptor: "Rind pressed by hand before sunrise: cold, green, faintly bitter.",
        tincture: "#c9b458",
        vector: [0.95, 0.35, 0.1, 0, 0.1, 0.2],
        cureDays: 60,
        vessel: "Violet glass",
      },
      {
        id: "yuzu",
        tier: "top",
        name: "Wild Yuzu",
        short: "Yuzu",
        origin: "Shikoku, Japan",
        descriptor: "Knotted mountain fruit, sharp as frost on a windowpane.",
        tincture: "#d9b23c",
        vector: [1, 0.25, 0.05, 0, 0.05, 0.3],
        cureDays: 60,
        vessel: "Violet glass",
      },
      {
        id: "pine",
        tier: "top",
        name: "Crushed Pine Needles",
        short: "Pine",
        origin: "Hautes-Alpes, France",
        descriptor: "A handful of needles rolled between the palms after rain.",
        tincture: "#6f8a4e",
        vector: [0.55, 0.05, 0.45, 0.2, 0.5, 0.1],
        cureDays: 75,
        vessel: "Oak cask",
      },
    ],
  },
  {
    id: "heart",
    numeral: "II",
    label: "Heart note",
    role: "The character",
    whisper: "Rises once the brightness fades, and stays the afternoon.",
    weight: 1,
    tone: "#8a3320",
    notes: [
      {
        id: "vetiver",
        tier: "heart",
        name: "Smoked Vetiver",
        short: "Vetiver",
        origin: "Les Cayes, Haiti",
        descriptor: "Roots dried over a slow fire, earthen and dusky.",
        tincture: "#7a5a36",
        vector: [0.1, 0.05, 0.8, 0.75, 0.45, 0.1],
        cureDays: 120,
        vessel: "Oak cask",
      },
      {
        id: "rose",
        tier: "heart",
        name: "Damascus Rose Otto",
        short: "Rose",
        origin: "Kazanlak Valley, Bulgaria",
        descriptor: "Petals gathered in the dew hour, honeyed and a little wine-dark.",
        tincture: "#b8606a",
        vector: [0.2, 1, 0.1, 0.05, 0.1, 0.45],
        cureDays: 105,
        vessel: "Violet glass",
      },
      {
        id: "cedar",
        tier: "heart",
        name: "Charred Cedar",
        short: "Cedar",
        origin: "Middle Atlas, Morocco",
        descriptor: "Split heartwood kissed by flame: pencil shavings and embers.",
        tincture: "#5a3b2a",
        vector: [0.05, 0, 0.95, 0.7, 0.2, 0.15],
        cureDays: 135,
        vessel: "Oak cask",
      },
    ],
  },
  {
    id: "base",
    numeral: "III",
    label: "Base note",
    role: "What lingers",
    whisper: "The quiet foundation, still on the skin the next morning.",
    weight: 1.2,
    tone: "#35271a",
    notes: [
      {
        id: "moss",
        tier: "base",
        name: "Damp Forest Moss",
        short: "Moss",
        origin: "Argyll rainforest, Scotland",
        descriptor: "Cool stone and deep shade, the floor of an old wood.",
        tincture: "#4f6a3e",
        vector: [0.2, 0.1, 0.3, 0.1, 1, 0.1],
        cureDays: 150,
        vessel: "Clay amphora",
      },
      {
        id: "amber",
        tier: "base",
        name: "Aged Amber Resin",
        short: "Amber",
        origin: "Dhofar, Oman",
        descriptor: "Tears of resin warmed in the hand until they glow.",
        tincture: "#b9772e",
        vector: [0.05, 0.2, 0.3, 0.35, 0.05, 1],
        cureDays: 165,
        vessel: "Oak cask",
      },
      {
        id: "labdanum",
        tier: "base",
        name: "Fermented Labdanum",
        short: "Labdanum",
        origin: "Crete, Greece",
        descriptor: "Sticky rockrose gum, leathery, animalic, slow to let go.",
        tincture: "#6b3f2a",
        vector: [0, 0.15, 0.35, 0.6, 0.35, 0.85],
        cureDays: 180,
        vessel: "Clay amphora",
      },
    ],
  },
];

const NOTE_INDEX: ReadonlyMap<GlyphId, Note> = new Map(TIERS.flatMap((tier) => tier.notes.map((note) => [note.id, note] as const)));

export function getTier(id: TierId): Tier {
  const tier = TIERS.find((t) => t.id === id);
  if (!tier) throw new Error(`Unknown tier: ${id}`);
  return tier;
}

export function getNote(id: GlyphId): Note {
  const note = NOTE_INDEX.get(id);
  if (!note) throw new Error(`Unknown note: ${id}`);
  return note;
}

export const DEFAULT_SELECTION: Selection = {
  top: { noteId: "yuzu", intensity: 55 },
  heart: { noteId: "vetiver", intensity: 70 },
  base: { noteId: "moss", intensity: 60 },
};

export type HousePreset = { id: string; name: string; selection: Selection };

/** Starting points for visitors who would rather be handed something. */
export const HOUSE_PRESETS: readonly HousePreset[] = [
  { id: "orchard", name: "Morning orchard", selection: { top: { noteId: "bergamot", intensity: 80 }, heart: { noteId: "rose", intensity: 55 }, base: { noteId: "moss", intensity: 30 } } },
  { id: "hearth", name: "Hearth and resin", selection: { top: { noteId: "pine", intensity: 35 }, heart: { noteId: "cedar", intensity: 75 }, base: { noteId: "amber", intensity: 85 } } },
  { id: "garden", name: "Night garden", selection: { top: { noteId: "yuzu", intensity: 30 }, heart: { noteId: "rose", intensity: 90 }, base: { noteId: "labdanum", intensity: 60 } } },
  { id: "house", name: "Our daily blend", selection: DEFAULT_SELECTION },
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Exact tier shares (0..1, summing to 1) from the three intensities and the tier weights. */
export function computeShares(selection: Selection): Ratios {
  const raw = TIER_IDS.map((id) => clamp(selection[id].intensity, 0, INTENSITY_MAX) * getTier(id).weight);
  const total = raw[0] + raw[1] + raw[2];
  if (total <= 0) return { top: 1 / 3, heart: 1 / 3, base: 1 / 3 };
  return { top: raw[0] / total, heart: raw[1] / total, base: raw[2] / total };
}

/**
 * Whole-number percentages that always sum to exactly 100.
 * Largest-remainder (Hamilton) rounding: floor everything, then hand the leftover
 * points to the tiers with the biggest fractional parts (ties go to the earlier tier).
 */
export function computeRatios(selection: Selection): Ratios {
  const shares = computeShares(selection);
  const exact = TIER_IDS.map((id, index) => ({ id, index, value: shares[id] * 100 }));
  const floors = exact.map((entry) => Math.floor(entry.value));
  let leftover = 100 - floors.reduce((sum, v) => sum + v, 0);
  const order = [...exact].sort((a, b) => {
    const diff = (b.value - Math.floor(b.value)) - (a.value - Math.floor(a.value));
    return Math.abs(diff) > 1e-9 ? diff : a.index - b.index;
  });
  for (const entry of order) {
    if (leftover <= 0) break;
    floors[entry.index] += 1;
    leftover -= 1;
  }
  return { top: floors[0], heart: floors[1], base: floors[2] };
}

/** Weighted 6-axis sensory profile of the blend, each axis 0..1. */
export function computeProfile(selection: Selection): SensoryVector {
  const shares = computeShares(selection);
  const out = [0, 0, 0, 0, 0, 0];
  for (const id of TIER_IDS) {
    const vector = getNote(selection[id].noteId).vector;
    for (let axis = 0; axis < out.length; axis += 1) out[axis] += vector[axis] * shares[id];
  }
  const round = (v: number) => Math.round(clamp(v, 0, 1) * 1000) / 1000;
  return [round(out[0]), round(out[1]), round(out[2]), round(out[3]), round(out[4]), round(out[5])];
}

/** Axis indices sorted strongest first (ties keep axis order). */
function rankAxes(profile: SensoryVector): number[] {
  return profile
    .map((value, index) => ({ value, index }))
    .sort((a, b) => (b.value !== a.value ? b.value - a.value : a.index - b.index))
    .map((entry) => entry.index);
}

/** The three strongest axis names, strongest first. */
export function dominantTags(profile: SensoryVector): AxisName[] {
  return rankAxes(profile)
    .slice(0, 3)
    .map((index) => AXES[index]);
}

export type CureRecommendation = { days: number; vessel: Vessel; label: string };

export const CURE_MIN_DAYS = 60;
export const CURE_MAX_DAYS = 180;

const VESSEL_BY_AXIS: Record<AxisName, Vessel | null> = {
  "Verdant Citrus": "Violet glass",
  Floral: "Violet glass",
  "Dry Woody": "Oak cask",
  "Resinous Smoke": "Oak cask",
  "Earthy Moss": "Clay amphora",
  // Balsam is agreeable in any vessel, so the next-strongest axis decides.
  "Sweet Balsam": null,
};

/**
 * How long the blend should rest, and in what.
 * Days: the notes' own cure times weighted by share, nudged longer for a dense
 * (high intensity) blend, rounded to the nearest fortnight-ish 15 days, 60–180.
 * Vessel: oak for woody/smoky blends, clay for mossy ones, violet glass for bright ones.
 */
export function recommendCure(selection: Selection): CureRecommendation {
  const shares = computeShares(selection);
  const weighted = TIER_IDS.reduce((sum, id) => sum + getNote(selection[id].noteId).cureDays * shares[id], 0);
  const meanIntensity = TIER_IDS.reduce((sum, id) => sum + selection[id].intensity, 0) / TIER_IDS.length;
  const nudged = weighted + (meanIntensity - 50) * 0.4;
  const days = clamp(Math.round(nudged / 15) * 15, CURE_MIN_DAYS, CURE_MAX_DAYS);

  const profile = computeProfile(selection);
  let vessel: Vessel = getNote(selection.heart.noteId).vessel;
  for (const index of rankAxes(profile)) {
    const match = VESSEL_BY_AXIS[AXES[index]];
    if (match) {
      vessel = match;
      break;
    }
  }
  return { days, vessel, label: `${days} days, ${vessel.toLowerCase()}` };
}

const toHex = (n: number) => Math.round(clamp(n, 0, 255)).toString(16).padStart(2, "0");

/** The colour the three tinctures make together, weighted by their shares. */
export function mixTincture(selection: Selection): `#${string}` {
  const shares = computeShares(selection);
  let r = 0;
  let g = 0;
  let b = 0;
  for (const id of TIER_IDS) {
    const hex = getNote(selection[id].noteId).tincture.slice(1);
    const n = Number.parseInt(hex, 16);
    r += ((n >> 16) & 255) * shares[id];
    g += ((n >> 8) & 255) * shares[id];
    b += (n & 255) * shares[id];
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** 1..27, one number per possible trio of notes. */
export function compositionNumber(selection: Selection): number {
  const indexOf = (id: TierId) => Math.max(0, getTier(id).notes.findIndex((n) => n.id === selection[id].noteId));
  return 1 + indexOf("top") * 9 + indexOf("heart") * 3 + indexOf("base");
}

/** e.g. "Composition 019 — Yuzu, Vetiver, Moss". Deterministic per note trio. */
export function blendName(selection: Selection): string {
  const number = String(compositionNumber(selection)).padStart(3, "0");
  const words = TIER_IDS.map((id) => getNote(selection[id].noteId).short).join(", ");
  return `Composition ${number} — ${words}`;
}

/** Plain words for a concentration, used in slider aria-valuetext and captions. */
export function describeIntensity(value: number): string {
  if (value < 20) return "a bare whisper";
  if (value < 40) return "speaks softly";
  if (value < 60) return "present";
  if (value < 80) return "speaks clearly";
  return "fills the room";
}

/** Liquid fill for the 3D flacon: 0.35 when every note is faint, 0.8 at full strength. */
export function fillLevel(selection: Selection): number {
  const mean = TIER_IDS.reduce((sum, id) => sum + selection[id].intensity, 0) / TIER_IDS.length;
  return 0.35 + (clamp(mean, 0, INTENSITY_MAX) / INTENSITY_MAX) * 0.45;
}
