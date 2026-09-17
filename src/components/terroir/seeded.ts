// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

/**
 * Deterministic randomness for hand-drawn detail. Seeding from a string (the lot code)
 * means the server and the browser draw the exact same wobble, so hydration never trips.
 */

export function hashString(input: string): number {
  // FNV-1a, 32-bit.
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32: tiny, fast, good enough for illustration jitter. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fixed precision keeps SVG strings short and identical across runtimes. */
export const r2 = (n: number): string => (Math.round(n * 100) / 100).toString();

/** A closed, smooth path through points using Catmull-Rom converted to cubic Béziers. */
export function closedSmoothPath(points: ReadonlyArray<readonly [number, number]>): string {
  const n = points.length;
  if (n < 3) return "";
  let d = `M${r2(points[0][0])} ${r2(points[0][1])}`;
  for (let i = 0; i < n; i += 1) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C${r2(c1x)} ${r2(c1y)} ${r2(c2x)} ${r2(c2y)} ${r2(p2[0])} ${r2(p2[1])}`;
  }
  return `${d}Z`;
}

export type ContourRing = { d: string; index: boolean };

/**
 * Wobbly concentric contour lines around an off-centre summit, like a survey sheet.
 * Higher ground gets more rings. Every fifth ring is an "index contour" (drawn heavier).
 */
export function contourRings(
  seedKey: string,
  altitudeM: number,
  width: number,
  height: number,
): { rings: ContourRing[]; summit: readonly [number, number] } {
  const rand = seededRandom(hashString(seedKey));
  const count = Math.max(4, Math.min(11, Math.round(altitudeM / 180) + 3));
  const cx = width * (0.42 + rand() * 0.16);
  const cy = height * (0.44 + rand() * 0.12);
  const maxR = Math.min(width, height) * 0.56;
  const minR = maxR * 0.08;
  // Shared low-frequency harmonics make neighbouring rings "agree" like real terrain.
  const harmonics = Array.from({ length: 4 }, (_, k) => ({
    freq: k + 2,
    amp: (0.05 + rand() * 0.07) / (k * 0.6 + 1),
    phase: rand() * Math.PI * 2,
  }));
  const stretch = 0.72 + rand() * 0.2;
  // A slow, continuous twist from summit to foot, so rings differ without ever crossing.
  const drift = 0.25 + rand() * 0.35;
  const tilt = rand() * Math.PI;
  const rings: ContourRing[] = [];
  const steps = 36;
  for (let ring = 0; ring < count; ring += 1) {
    const t = ring / (count - 1);
    const base = minR + (maxR - minR) * Math.pow(t, 0.85);
    const pts: Array<readonly [number, number]> = [];
    for (let s = 0; s < steps; s += 1) {
      const a = (s / steps) * Math.PI * 2;
      let wobble = 1;
      for (const h of harmonics) {
        wobble += h.amp * (0.45 + t * 0.75) * Math.sin(h.freq * a + h.phase + t * drift * (h.freq - 1));
      }
      const rx = base * wobble * 1.22;
      const ry = base * wobble * stretch * 0.9;
      const x0 = Math.cos(a) * rx;
      const y0 = Math.sin(a) * ry;
      const x = cx + x0 * Math.cos(tilt) - y0 * Math.sin(tilt);
      const y = cy + x0 * Math.sin(tilt) + y0 * Math.cos(tilt);
      pts.push([x, y]);
    }
    rings.push({ d: closedSmoothPath(pts), index: (count - 1 - ring) % 4 === 0 });
  }
  return { rings: rings.reverse(), summit: [cx, cy] };
}

/** An open, smooth path through points (Catmull-Rom → cubic Béziers). */
export function openSmoothPath(points: ReadonlyArray<readonly [number, number]>): string {
  const n = points.length;
  if (n < 2) return "";
  let d = `M${r2(points[0][0])} ${r2(points[0][1])}`;
  for (let i = 0; i < n - 1; i += 1) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(n - 1, i + 2)];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C${r2(c1x)} ${r2(c1y)} ${r2(c2x)} ${r2(c2y)} ${r2(p2[0])} ${r2(p2[1])}`;
  }
  return d;
}
