// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import type { PlateKind } from "@/lib/terroir-lots";
import { hashString, openSmoothPath, r2, seededRandom } from "./seeded";

/**
 * Pressed-specimen line art, generated once per plant from a fixed seed.
 * Each stroke carries its own draw delay so the plate inks itself in a natural
 * order: stem first, then leaves / needles, then the finer detail.
 *
 * Drawing space: 260 × 340.
 */

export const PLATE_W = 260;
export const PLATE_H = 340;

export type InkStroke = {
  d: string;
  /** Seconds before this stroke starts drawing. */
  delay: number;
  /** Seconds the stroke takes to draw. */
  duration: number;
  width: number;
  /** Solid parchment fill to occlude strokes behind (petals, cone). */
  occlude?: boolean;
  /** Accent strokes print in terracotta instead of ink. */
  accent?: boolean;
  /**
   * Strokes authored in the cone's local frame. "cone" is the outline itself;
   * "cone-clip" is detail clipped to that outline.
   */
  frame?: "cone" | "cone-clip";
};

export type Botanical = {
  strokes: InkStroke[];
  /** The cone's local frame and clip outline (pine only). */
  cone?: { d: string; transform: string };
};

type Pt = readonly [number, number];

const DEG = Math.PI / 180;

function cubicAt(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return [a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]];
}

function cubicAngle(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): number {
  const u = 1 - t;
  const dx = 3 * u * u * (p1[0] - p0[0]) + 6 * u * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0]);
  const dy = 3 * u * u * (p1[1] - p0[1]) + 6 * u * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1]);
  return Math.atan2(dy, dx);
}

const cubicD = (p0: Pt, p1: Pt, p2: Pt, p3: Pt) =>
  `M${r2(p0[0])} ${r2(p0[1])}C${r2(p1[0])} ${r2(p1[1])} ${r2(p2[0])} ${r2(p2[1])} ${r2(p3[0])} ${r2(p3[1])}`;

/** Longest reach from `from` along `angle` that stays inside the plate margin. */
function reachWithin(from: Pt, angle: number, wanted: number, margin = 10): number {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  let limit = wanted;
  if (dx > 0) limit = Math.min(limit, (PLATE_W - margin - from[0]) / dx);
  if (dx < 0) limit = Math.min(limit, (margin - from[0]) / dx);
  if (dy > 0) limit = Math.min(limit, (PLATE_H - margin - from[1]) / dy);
  if (dy < 0) limit = Math.min(limit, (margin - from[1]) / dy);
  return Math.max(6, limit);
}

/** A slightly bowed line, the building block for needles, blades and roots. */
function bowedLine(from: Pt, angle: number, length: number, bow: number): string {
  const to: Pt = [from[0] + Math.cos(angle) * length, from[1] + Math.sin(angle) * length];
  const mx = (from[0] + to[0]) / 2 - Math.sin(angle) * bow;
  const my = (from[1] + to[1]) / 2 + Math.cos(angle) * bow;
  return `M${r2(from[0])} ${r2(from[1])}Q${r2(mx)} ${r2(my)} ${r2(to[0])} ${r2(to[1])}`;
}

/* -------------------------------------------------------------------------- */
/* Maritime pine: a woody sprig with paired needles in brushes, and a cone.     */
/* -------------------------------------------------------------------------- */

function pine(): Botanical {
  const rand = seededRandom(hashString("pinus-pinaster"));
  const strokes: InkStroke[] = [];
  const S0: Pt = [58, 326];
  const S1: Pt = [82, 262];
  const S2: Pt = [112, 190];
  const S3: Pt = [168, 104];

  // Woody stem, drawn as two close lines so it reads as a twig, not a wire.
  strokes.push({ d: cubicD(S0, S1, S2, S3), delay: 0.1, duration: 1.6, width: 2.1 });
  strokes.push({
    d: cubicD([S0[0] + 4, S0[1]], [S1[0] + 4, S1[1] + 1], [S2[0] + 3, S2[1] + 2], [S3[0] + 1, S3[1] + 2]),
    delay: 0.25,
    duration: 1.6,
    width: 0.7,
  });

  // Leaf-base scars along the lower stem: small chevrons.
  for (let i = 0; i < 9; i += 1) {
    const t = 0.08 + i * 0.035;
    const p = cubicAt(S0, S1, S2, S3, t);
    const a = cubicAngle(S0, S1, S2, S3, t);
    const l = 3.2;
    const tip: Pt = [p[0] + Math.cos(a) * l, p[1] + Math.sin(a) * l];
    const left: Pt = [p[0] + Math.cos(a + 2.4) * l, p[1] + Math.sin(a + 2.4) * l];
    const right: Pt = [p[0] + Math.cos(a - 2.4) * l, p[1] + Math.sin(a - 2.4) * l];
    strokes.push({
      d: `M${r2(left[0])} ${r2(left[1])}L${r2(tip[0])} ${r2(tip[1])}L${r2(right[0])} ${r2(right[1])}`,
      delay: 0.9 + i * 0.05,
      duration: 0.5,
      width: 0.6,
    });
  }

  // Needle brushes. Pinus pinaster carries its needles in pairs (fascicles of two).
  const clusters = [0.4, 0.48, 0.56, 0.64, 0.72, 0.8, 0.88, 0.95, 1];
  const offsets = [-66, -48, -32, -17, 15, 30, 46, 64];
  clusters.forEach((t, ci) => {
    const base = cubicAt(S0, S1, S2, S3, t);
    const along = cubicAngle(S0, S1, S2, S3, t);
    const narrow = t > 0.9 ? 0.62 : 1;
    offsets.forEach((off, oi) => {
      const angle = along + off * narrow * DEG + (rand() - 0.5) * 6 * DEG;
      const wanted = (62 + rand() * 30) * (0.82 + 0.25 * t);
      const len = reachWithin(base, angle, wanted);
      const bow = (off > 0 ? 1 : -1) * (2.5 + rand() * 3);
      const delay = 0.75 + ci * 0.1 + oi * 0.025;
      strokes.push({ d: bowedLine(base, angle, len, bow), delay, duration: 1.3, width: 0.75 });
      const twin = angle + (off > 0 ? 2.6 : -2.6) * DEG;
      strokes.push({
        d: bowedLine(base, twin, reachWithin(base, twin, len * 0.97), bow * 1.1),
        delay: delay + 0.06,
        duration: 1.3,
        width: 0.55,
      });
    });
    // Papery sheath where the brush meets the twig.
    const sheath = bowedLine(base, along - 90 * DEG, 3, 1);
    strokes.push({ d: sheath, delay: 0.7 + ci * 0.1, duration: 0.4, width: 0.9 });
  });

  // Terminal bud: a slim scaled spindle at the tip.
  const tipAngle = cubicAngle(S0, S1, S2, S3, 1);
  const budLen = 18;
  const bx = Math.cos(tipAngle);
  const by = Math.sin(tipAngle);
  const nx = -by;
  const ny = bx;
  const budTip: Pt = [S3[0] + bx * budLen, S3[1] + by * budLen];
  strokes.push({
    d: `M${r2(S3[0] + nx * 3)} ${r2(S3[1] + ny * 3)}Q${r2(S3[0] + bx * 10 + nx * 5)} ${r2(S3[1] + by * 10 + ny * 5)} ${r2(budTip[0])} ${r2(budTip[1])}Q${r2(S3[0] + bx * 10 - nx * 5)} ${r2(S3[1] + by * 10 - ny * 5)} ${r2(S3[0] - nx * 3)} ${r2(S3[1] - ny * 3)}`,
    delay: 1.9,
    duration: 0.9,
    width: 0.9,
    occlude: true,
  });
  for (let k = 1; k <= 3; k += 1) {
    const c: Pt = [S3[0] + bx * k * 4.2, S3[1] + by * k * 4.2];
    const w = 4.2 - k * 0.7;
    strokes.push({
      d: `M${r2(c[0] + nx * w)} ${r2(c[1] + ny * w)}Q${r2(c[0] + bx * 3)} ${r2(c[1] + by * 3)} ${r2(c[0] - nx * w)} ${r2(c[1] - ny * w)}`,
      delay: 2.2 + k * 0.08,
      duration: 0.5,
      width: 0.5,
    });
  }

  // Cone: ovoid-conic, hanging down and outward from the lower stem on a short stalk.
  const attach = cubicAt(S0, S1, S2, S3, 0.33);
  const coneBase: Pt = [attach[0] + 15, attach[1] + 1];
  const transform = `translate(${r2(coneBase[0])} ${r2(coneBase[1])}) rotate(-44) scale(0.8)`;
  strokes.push({
    d: `M${r2(attach[0])} ${r2(attach[1])}Q${r2(attach[0] + 10)} ${r2(attach[1] - 3)} ${r2(coneBase[0])} ${r2(coneBase[1])}`,
    delay: 1.1,
    duration: 0.6,
    width: 1.6,
  });
  const coneOutline = "M0 0C22 4 31 30 27 58C24 78 12 96 0 104C-12 96 -24 78 -27 58C-31 30 -22 4 0 0Z";
  strokes.push({ d: coneOutline, delay: 1.3, duration: 1.8, width: 1.2, occlude: true, frame: "cone" });

  // Scale lattice: two families of gently curved spirals crossing at the umbos.
  for (let i = -6; i <= 13; i += 1) {
    const y = i * 9;
    strokes.push({
      d: `M-34 ${r2(y - 14)}Q0 ${r2(y + 6)} 34 ${r2(y + 16)}`,
      delay: 1.8 + (i + 6) * 0.04,
      duration: 1,
      width: 0.6,
      frame: "cone-clip",
    });
    strokes.push({
      d: `M34 ${r2(y - 14)}Q0 ${r2(y + 6)} -34 ${r2(y + 16)}`,
      delay: 1.85 + (i + 6) * 0.04,
      duration: 1,
      width: 0.6,
      frame: "cone-clip",
    });
  }
  // Tiny prickle on each scale row centre, printed in accent.
  for (let k = 0; k < 7; k += 1) {
    const y = 14 + k * 12.5;
    strokes.push({
      d: `M-1.4 ${r2(y)}L0 ${r2(y - 2.4)}L1.4 ${r2(y)}`,
      delay: 2.6 + k * 0.06,
      duration: 0.4,
      width: 0.7,
      accent: true,
      frame: "cone-clip",
    });
  }

  return { strokes, cone: { d: coneOutline, transform } };
}

/* -------------------------------------------------------------------------- */
/* Vetiver: an arching clump of narrow blades over a mass of fibrous roots.     */
/* -------------------------------------------------------------------------- */

function vetiver(): Botanical {
  const rand = seededRandom(hashString("chrysopogon-zizanioides"));
  const strokes: InkStroke[] = [];
  const groundY = 196;
  const crownX = 130;

  // Riverbank: a soft ground line with sparse diagonal hatching beneath.
  const ground: Pt[] = [];
  for (let i = 0; i <= 8; i += 1) {
    ground.push([18 + i * 28, groundY + Math.sin(i * 1.3) * 1.6 + (i === 4 ? 2 : 0)]);
  }
  strokes.push({ d: openSmoothPath(ground), delay: 0.05, duration: 1.5, width: 0.9 });
  for (let i = 0; i < 16; i += 1) {
    const x = 24 + i * 14 + rand() * 5;
    if (Math.abs(x - crownX) < 22) continue;
    const y = groundY + 5 + rand() * 4;
    strokes.push({
      d: `M${r2(x)} ${r2(y)}l${r2(-5 - rand() * 3)} ${r2(5 + rand() * 2)}`,
      delay: 0.4 + i * 0.03,
      duration: 0.5,
      width: 0.5,
    });
  }

  // Blades: long, narrow, arching outward. Each is a thin closed leaf shape.
  const bladeCount = 15;
  for (let i = 0; i < bladeCount; i += 1) {
    const f = i / (bladeCount - 1);
    const spread = (f - 0.5) * 2; // -1 .. 1
    const bx = crownX + spread * 11 + (rand() - 0.5) * 3;
    const lean = spread * (0.55 + rand() * 0.2) + (rand() - 0.5) * 0.12;
    const height = 150 + (1 - Math.abs(spread)) * 32 + rand() * 12;
    const reachX = lean * 118;
    const tipX = Math.max(14, Math.min(PLATE_W - 14, bx + reachX));
    const tipY = Math.max(14, groundY - height + Math.abs(lean) * 70);
    const c1: Pt = [bx + reachX * 0.05, groundY - height * 0.55];
    const c2: Pt = [bx + reachX * 0.55, groundY - height * 1.02 + Math.abs(lean) * 20];
    const w = 2.2 + rand() * 1.2;
    const d =
      `M${r2(bx - w)} ${r2(groundY)}` +
      `C${r2(c1[0] - w)} ${r2(c1[1])} ${r2(c2[0] - w * 0.6)} ${r2(c2[1])} ${r2(tipX)} ${r2(tipY)}` +
      `C${r2(c2[0] + w * 0.6)} ${r2(c2[1] + 3)} ${r2(c1[0] + w)} ${r2(c1[1])} ${r2(bx + w)} ${r2(groundY)}`;
    const order = Math.abs(spread);
    strokes.push({ d, delay: 0.3 + order * 0.6 + rand() * 0.15, duration: 1.9, width: 0.8, occlude: true });
    if (i % 2 === 0) {
      strokes.push({
        d: `M${r2(bx)} ${r2(groundY - 2)}C${r2(c1[0])} ${r2(c1[1])} ${r2(c2[0])} ${r2(c2[1] + 1.5)} ${r2(tipX)} ${r2(tipY)}`,
        delay: 0.9 + order * 0.6,
        duration: 1.6,
        width: 0.4,
      });
    }
  }

  // Culm base: a tight tuft of sheaths at the crown.
  for (let k = -3; k <= 3; k += 1) {
    const x = crownX + k * 3.2;
    strokes.push({
      d: `M${r2(x)} ${r2(groundY + 1)}Q${r2(x + k * 0.6)} ${r2(groundY - 10)} ${r2(x + k * 1.3)} ${r2(groundY - 20 + Math.abs(k) * 2)}`,
      delay: 0.2 + Math.abs(k) * 0.05,
      duration: 0.8,
      width: 0.9,
    });
  }

  // Fibrous roots: many long wandering threads, some with side rootlets.
  const rootCount = 24;
  for (let i = 0; i < rootCount; i += 1) {
    const f = i / (rootCount - 1);
    const spread = (f - 0.5) * 2;
    const startX = crownX + spread * 12;
    const endX = crownX + spread * (70 + rand() * 30);
    const depth = 96 + rand() * 38 - Math.abs(spread) * 18;
    const pts: Pt[] = [];
    const segs = 7;
    for (let s = 0; s <= segs; s += 1) {
      const u = s / segs;
      const ease = 1 - Math.pow(1 - u, 1.6);
      const x = startX + (endX - startX) * ease + (s === 0 ? 0 : (rand() - 0.5) * 7);
      const y = groundY + 3 + depth * u;
      pts.push([Math.max(12, Math.min(PLATE_W - 12, x)), Math.min(PLATE_H - 10, y)]);
    }
    const delay = 1.2 + rand() * 0.8;
    strokes.push({ d: openSmoothPath(pts), delay, duration: 1.8, width: 0.35 + rand() * 0.45 });
    if (i % 3 === 0) {
      const from = pts[3 + Math.floor(rand() * 3)];
      const dir = (spread >= 0 ? 1 : -1) * (0.6 + rand() * 0.5) + Math.PI / 2 - (spread >= 0 ? 1.2 : -1.2);
      strokes.push({
        d: bowedLine(from, dir, reachWithin(from, dir, 14 + rand() * 12), 2),
        delay: delay + 0.9,
        duration: 0.9,
        width: 0.35,
      });
    }
  }

  // A few river pebbles caught in the roots, in accent ink.
  const pebbles: Array<[number, number, number]> = [
    [86, 262, 5],
    [178, 248, 4],
    [150, 300, 6],
  ];
  pebbles.forEach(([x, y, rr], k) => {
    strokes.push({
      d: `M${x - rr} ${y}C${x - rr} ${y - rr * 0.8} ${x + rr} ${y - rr * 0.9} ${x + rr} ${y}C${x + rr} ${y + rr * 0.7} ${x - rr} ${y + rr * 0.8} ${x - rr} ${y}Z`,
      delay: 2.4 + k * 0.12,
      duration: 0.8,
      width: 0.7,
      accent: true,
      occlude: true,
    });
  });

  return { strokes };
}

/* -------------------------------------------------------------------------- */
/* Damask rose: a full, many-petalled bloom, a closed bud and pinnate leaves.   */
/* -------------------------------------------------------------------------- */

function leaflet(center: Pt, angle: number, length: number, width: number, teeth: number): { outline: string; veins: string[] } {
  const ca = Math.cos(angle);
  const sa = Math.sin(angle);
  const toWorld = (u: number, v: number): Pt => {
    // u along the axis from base (-L/2) to tip (+L/2); v across.
    const x = u * length - length / 2;
    return [center[0] + x * ca - v * sa, center[1] + x * sa + v * ca];
  };
  const half = (u: number) => (width / 2) * Math.pow(Math.sin(Math.PI * Math.min(1, u * 0.94 + 0.03)), 0.75);
  const left: Pt[] = [];
  const right: Pt[] = [];
  const n = teeth * 2;
  for (let i = 0; i <= n; i += 1) {
    const u = i / n;
    const notch = i % 2 === 1 && u > 0.12 && u < 0.92 ? 0.84 : 1;
    const shift = i % 2 === 1 ? 0.012 : 0;
    left.push(toWorld(u + shift, -half(u) * notch));
    right.push(toWorld(u + shift, half(u) * notch));
  }
  const pts = [...left, ...right.reverse()];
  const outline = `M${pts.map((p) => `${r2(p[0])} ${r2(p[1])}`).join("L")}Z`;
  const base = toWorld(0, 0);
  const tip = toWorld(1, 0);
  const veins: string[] = [`M${r2(base[0])} ${r2(base[1])}L${r2(tip[0])} ${r2(tip[1])}`];
  for (let k = 1; k <= 3; k += 1) {
    const u = k / 4.2;
    const on = toWorld(u, 0);
    for (const side of [-1, 1]) {
      const out = toWorld(u + 0.14, side * half(u + 0.14) * 0.72);
      veins.push(`M${r2(on[0])} ${r2(on[1])}L${r2(out[0])} ${r2(out[1])}`);
    }
  }
  return { outline, veins };
}

function rose(): Botanical {
  const rand = seededRandom(hashString("rosa-damascena"));
  const strokes: InkStroke[] = [];
  const cx = 132;
  const cy = 92;
  const squash = 0.74;
  const polar = (a: number, rr: number): Pt => [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * squash];
  const pt = (p: Pt) => `${r2(p[0])} ${r2(p[1])}`;

  // Stem: from beneath the bloom down to the cut end, with a gentle S.
  const T0: Pt = [132, 128];
  const T1: Pt = [138, 190];
  const T2: Pt = [112, 250];
  const T3: Pt = [118, 330];
  strokes.push({ d: cubicD(T0, T1, T2, T3), delay: 0.05, duration: 1.6, width: 1.8 });
  strokes.push({
    d: `M${r2(T3[0] - 3)} ${r2(T3[1] - 1)}L${r2(T3[0] + 4)} ${r2(T3[1] + 2)}`,
    delay: 1.2,
    duration: 0.3,
    width: 0.9,
  });
  // Hooked prickles.
  [0.28, 0.46, 0.63, 0.82].forEach((t, k) => {
    const p = cubicAt(T0, T1, T2, T3, t);
    const a = cubicAngle(T0, T1, T2, T3, t);
    const side = k % 2 === 0 ? 1 : -1;
    const nA = a + side * (Math.PI / 2);
    const tip: Pt = [p[0] + Math.cos(nA) * 6 - Math.cos(a) * 3, p[1] + Math.sin(nA) * 6 - Math.sin(a) * 3];
    const b1: Pt = [p[0] - Math.cos(a) * 3, p[1] - Math.sin(a) * 3];
    const b2: Pt = [p[0] + Math.cos(a) * 3, p[1] + Math.sin(a) * 3];
    strokes.push({ d: `M${pt(b1)}Q${pt([tip[0], tip[1]])} ${pt(tip)}Q${pt(p)} ${pt(b2)}`, delay: 1 + k * 0.1, duration: 0.5, width: 0.8 });
  });

  // Side shoot carrying a closed bud, up and to the left.
  const J: Pt = cubicAt(T0, T1, T2, T3, 0.38);
  const budBase: Pt = [60, 150];
  strokes.push({ d: `M${pt(J)}C${pt([118, 196])} ${pt([78, 186])} ${pt(budBase)}`, delay: 0.5, duration: 1.2, width: 1.2 });
  const budAngle = -118 * DEG;
  const bdx = Math.cos(budAngle);
  const bdy = Math.sin(budAngle);
  const bnx = -bdy;
  const bny = bdx;
  const budAt = (u: number, v: number): Pt => [budBase[0] + bdx * u + bnx * v, budBase[1] + bdy * u + bny * v];
  strokes.push({
    d: `M${pt(budAt(4, -7))}C${pt(budAt(14, -12))} ${pt(budAt(26, -6))} ${pt(budAt(34, 0))}C${pt(budAt(26, 6))} ${pt(budAt(14, 12))} ${pt(budAt(4, 7))}Z`,
    delay: 1.3,
    duration: 1,
    width: 0.9,
    occlude: true,
  });
  strokes.push({ d: `M${pt(budAt(8, -2))}C${pt(budAt(18, -5))} ${pt(budAt(26, -2))} ${pt(budAt(33, 0))}`, delay: 1.7, duration: 0.8, width: 0.5, accent: true });
  // Long feathery sepals wrapping the bud.
  for (const side of [-1, 1]) {
    strokes.push({
      d: `M${pt(budAt(2, side * 3))}C${pt(budAt(12, side * 13))} ${pt(budAt(24, side * 11))} ${pt(budAt(40, side * 4))}`,
      delay: 1.6,
      duration: 0.9,
      width: 0.7,
    });
  }
  strokes.push({ d: `M${pt(budAt(-1, -4))}Q${pt(budAt(3, 0))} ${pt(budAt(-1, 4))}`, delay: 1.5, duration: 0.4, width: 0.9 });

  // Pinnate leaves: rachis with a terminal leaflet and two opposite pairs.
  const leaves: Array<{ from: number; ctrl: Pt; end: Pt; delay: number }> = [
    { from: 0.56, ctrl: [170, 220], end: [214, 196], delay: 0.8 },
    { from: 0.78, ctrl: [88, 286], end: [42, 268], delay: 1 },
  ];
  leaves.forEach((leaf) => {
    const s = cubicAt(T0, T1, T2, T3, leaf.from);
    strokes.push({ d: `M${pt(s)}Q${pt(leaf.ctrl)} ${pt(leaf.end)}`, delay: leaf.delay, duration: 1, width: 0.9 });
    const q = (t: number): Pt => {
      const u = 1 - t;
      return [
        u * u * s[0] + 2 * u * t * leaf.ctrl[0] + t * t * leaf.end[0],
        u * u * s[1] + 2 * u * t * leaf.ctrl[1] + t * t * leaf.end[1],
      ];
    };
    const qa = (t: number) => {
      const a = q(Math.max(0, t - 0.02));
      const b = q(Math.min(1, t + 0.02));
      return Math.atan2(b[1] - a[1], b[0] - a[0]);
    };
    const endA = qa(1);
    const termLen = 34;
    const term = leaflet(
      [leaf.end[0] + Math.cos(endA) * (termLen / 2 - 2), leaf.end[1] + Math.sin(endA) * (termLen / 2 - 2)],
      endA,
      termLen,
      19,
      9,
    );
    const place = (lf: { outline: string; veins: string[] }, d0: number) => {
      strokes.push({ d: lf.outline, delay: d0, duration: 1.2, width: 0.8, occlude: true });
      lf.veins.forEach((v, vi) => strokes.push({ d: v, delay: d0 + 0.5 + vi * 0.04, duration: 0.7, width: 0.4 }));
    };
    [0.42, 0.74].forEach((t, pi) => {
      const base = q(t);
      const a = qa(t);
      const len = 27 - pi * 1 + rand() * 3;
      for (const side of [-1, 1]) {
        const ang = a + side * 58 * DEG;
        const c: Pt = [base[0] + Math.cos(ang) * (len / 2), base[1] + Math.sin(ang) * (len / 2)];
        place(leaflet(c, ang, len, 15, 8), leaf.delay + 0.35 + pi * 0.2);
      }
    });
    place(term, leaf.delay + 0.8);
  });

  // Calyx: receptacle and sepals peeping out from under the bloom.
  strokes.push({
    d: `M${pt([124, 124])}C${pt([122, 134])} ${pt([128, 140])} ${pt([132, 140])}C${pt([136, 140])} ${pt([142, 134])} ${pt([140, 124])}`,
    delay: 0.6,
    duration: 0.8,
    width: 0.9,
    occlude: true,
  });
  const sepals: ReadonlyArray<readonly [Pt, Pt, Pt]> = [
    [[126, 128], [104, 132], [86, 126]],
    [[138, 128], [160, 134], [178, 124]],
    [[132, 132], [134, 142], [150, 148]],
  ];
  sepals.forEach(([a, c, e], k) => {
    strokes.push({
      d: `M${pt(a)}Q${pt(c)} ${pt(e)}`,
      delay: 0.7 + k * 0.08,
      duration: 0.8,
      width: 0.7,
    });
  });

  // Bloom: layered, notched petals, outermost printed first so inner ones overlap.
  const layers = [
    { n: 8, rin: 30, rout: 56, off: 0.45, delay: 1.5 },
    { n: 7, rin: 20, rout: 42, off: 0.12, delay: 1.2 },
    { n: 6, rin: 11, rout: 29, off: 0.32, delay: 0.95 },
    { n: 5, rin: 4, rout: 17, off: 0.05, delay: 0.75 },
  ];
  layers.forEach((layer, li) => {
    const step = (Math.PI * 2) / layer.n;
    const span = step * 1.28;
    for (let k = 0; k < layer.n; k += 1) {
      const am = layer.off + k * step + (rand() - 0.5) * 0.12;
      const a1 = am - span / 2;
      const a2 = am + span / 2;
      const ro = layer.rout * (0.94 + rand() * 0.1);
      const d =
        `M${pt(polar(a1, layer.rin))}` +
        `Q${pt(polar(a1 - 0.12, ro * 1.04))} ${pt(polar(am - span * 0.14, ro))}` +
        `Q${pt(polar(am, ro * 0.98))} ${pt(polar(am, ro * 0.9))}` +
        `Q${pt(polar(am, ro * 0.98))} ${pt(polar(am + span * 0.14, ro))}` +
        `Q${pt(polar(a2 + 0.12, ro * 1.04))} ${pt(polar(a2, layer.rin))}`;
      strokes.push({ d, delay: layer.delay + k * 0.05, duration: 1.3, width: li === 0 ? 0.95 : 0.8, occlude: true });
      if (li <= 1) {
        // Cupping line: the curl of the petal's rim toward the viewer.
        strokes.push({
          d: `M${pt(polar(am - span * 0.3, ro * 0.7))}Q${pt(polar(am, ro * 0.82))} ${pt(polar(am + span * 0.3, ro * 0.7))}`,
          delay: layer.delay + 0.5 + k * 0.05,
          duration: 0.8,
          width: 0.45,
        });
      }
    }
  });

  // Heart of the rose: a tight spiral of unopened petals.
  strokes.push({
    d: `M${pt([cx + 1, cy - 1])}c3 -3 8 -1 7 4c-1 5 -9 6 -12 1c-3 -6 3 -12 11 -11c7 1 10 7 8 12`,
    delay: 0.6,
    duration: 1.4,
    width: 0.9,
    occlude: true,
  });
  strokes.push({ d: `M${pt([cx - 3, cy + 1])}q2 3 5 1`, delay: 1.6, duration: 0.5, width: 0.7, accent: true });

  return { strokes };
}

const CACHE = new Map<PlateKind, Botanical>();

export function botanicalFor(kind: PlateKind): Botanical {
  const hit = CACHE.get(kind);
  if (hit) return hit;
  const made = kind === "pine" ? pine() : kind === "vetiver" ? vetiver() : rose();
  CACHE.set(kind, made);
  return made;
}
