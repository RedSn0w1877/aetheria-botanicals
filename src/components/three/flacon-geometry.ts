// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import * as THREE from "three";

/**
 * Procedural geometry for the fluted crystal flacon.
 *
 * Everything is authored as a 2D profile in (radius, height) space and spun around
 * the Y axis. We build our own lathe instead of THREE.LatheGeometry because we need
 * three things it cannot give us:
 *  1. radial fluting (radius displaced by angle) with normals that follow it,
 *  2. no seam artefact when normals are recomputed (we wrap around analytically),
 *  3. hard edges between profile "runs" (brass rims) while each run stays smooth.
 *
 * Units: the flacon base sits on y = 0, the glass lip is at y = 1.62, the brass collar
 * tops out at y = 1.64 and the seated stopper reaches y ≈ 2.23.
 */

export type ProfilePoint = readonly [r: number, y: number];

export type FluteSpec = {
  /** Number of flutes around the body. */
  count: number;
  /** Maximum groove depth in world units (grooves are cut inward only). */
  depth: number;
  /** Heights where the fluting fades in (from base) … */
  fadeIn: readonly [number, number];
  /** … and fades out again (toward the shoulder). */
  fadeOut: readonly [number, number];
};

export type LatheRun = {
  points: readonly ProfilePoint[];
  segments: number;
  flute?: FluteSpec;
};

/* ------------------------------------------------------------------ */
/* Dimensions shared by the model, vapour and camera rig               */
/* ------------------------------------------------------------------ */

export const FLACON = {
  glassLipY: 1.62,
  neckOuter: 0.15,
  bore: 0.085,
  collarBottomY: 1.395,
  collarTopY: 1.64,
  /** How far the stopper rises at capLift = 1. */
  stopperLift: 0.52,
  /** Height of the stopper above its seat. */
  stopperHeight: 0.585,
  /** Lowest / highest liquid surface (level 0 / level 1). */
  liquidMinY: 0.3,
  liquidMaxY: 1.18,
  /** Where the liquid body stops (always above liquidMaxY + max tilt). */
  liquidTopY: 1.3,
  /** Wall-to-liquid clearance. */
  liquidInset: 0.014,
  heroLevel: 0.62,
} as const;

/** Layer used for things the contact-shadow camera must not see. */
export const STAGE_LAYER = 1;

/* ------------------------------------------------------------------ */
/* Small maths helpers                                                 */
/* ------------------------------------------------------------------ */

/** Deterministic PRNG (mulberry32). Same seed, same flacon, every render. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

export function smoothstep(e0: number, e1: number, x: number): number {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
}

/** Open Chaikin corner-cutting that keeps both endpoints pinned. */
export function chaikin(points: readonly ProfilePoint[], iterations: number): ProfilePoint[] {
  let pts: ProfilePoint[] = points.slice();
  for (let it = 0; it < iterations; it++) {
    const next: ProfilePoint[] = [pts[0]];
    for (let i = 0; i < pts.length - 1; i++) {
      const [r0, y0] = pts[i];
      const [r1, y1] = pts[i + 1];
      next.push([0.75 * r0 + 0.25 * r1, 0.75 * y0 + 0.25 * y1]);
      next.push([0.25 * r0 + 0.75 * r1, 0.25 * y0 + 0.75 * y1]);
    }
    next.push(pts[pts.length - 1]);
    pts = next;
  }
  return pts;
}

/** Evenly re-space a polyline by arc length so the mesh density is uniform. */
export function resample(points: readonly ProfilePoint[], count: number): ProfilePoint[] {
  const lengths = [0];
  for (let i = 1; i < points.length; i++) {
    const dr = points[i][0] - points[i - 1][0];
    const dy = points[i][1] - points[i - 1][1];
    lengths.push(lengths[i - 1] + Math.hypot(dr, dy));
  }
  const total = lengths[lengths.length - 1];
  const out: ProfilePoint[] = [];
  let seg = 0;
  for (let k = 0; k < count; k++) {
    const target = (k / (count - 1)) * total;
    while (seg < points.length - 2 && lengths[seg + 1] < target) seg++;
    const span = lengths[seg + 1] - lengths[seg] || 1;
    const t = clamp01((target - lengths[seg]) / span);
    out.push([
      points[seg][0] + (points[seg + 1][0] - points[seg][0]) * t,
      points[seg][1] + (points[seg + 1][1] - points[seg][1]) * t,
    ]);
  }
  return out;
}

/**
 * Offset a y-increasing profile toward the axis (to the left of travel) by `d`.
 * Used to derive the liquid from the cavity so it can never touch the glass.
 */
export function offsetLeft(points: readonly ProfilePoint[], d: number): ProfilePoint[] {
  const n = points.length;
  return points.map((p, i) => {
    const a = points[Math.max(i - 1, 0)];
    const b = points[Math.min(i + 1, n - 1)];
    const tr = b[0] - a[0];
    const ty = b[1] - a[1];
    const len = Math.hypot(tr, ty) || 1;
    // Left normal of the travel direction (tr, ty) is (-ty, tr).
    const r = p[0] + (-ty / len) * d;
    const y = p[1] + (tr / len) * d;
    return [p[0] === 0 ? 0 : Math.max(0, r), y] as ProfilePoint;
  });
}

/* ------------------------------------------------------------------ */
/* Profiles                                                            */
/* ------------------------------------------------------------------ */

/** Outside of the glass, base centre → lip, y increasing. */
const OUTER_CONTROL: ProfilePoint[] = [
  [0, 0],
  [0.4, 0],
  [0.49, 0.008],
  [0.515, 0.05],
  [0.52, 0.15],
  [0.535, 0.2],
  [0.585, 0.42],
  [0.6, 0.64],
  [0.585, 0.86],
  [0.52, 1.04],
  [0.36, 1.2],
  [0.2, 1.3],
  [0.158, 1.36],
  [0.15, 1.42],
  [0.15, 1.5],
  [0.15, FLACON.glassLipY],
];

/** Inside of the glass (the cavity), bore top → cavity floor centre, y decreasing. */
const INNER_CONTROL: ProfilePoint[] = [
  [FLACON.bore, FLACON.glassLipY],
  [FLACON.bore, 1.5],
  [FLACON.bore, 1.4],
  [0.095, 1.33],
  [0.2, 1.25],
  [0.4, 1.12],
  [0.495, 0.98],
  [0.54, 0.82],
  [0.55, 0.64],
  [0.535, 0.44],
  [0.49, 0.32],
  [0.42, 0.275],
  [0.3, 0.265],
  [0, 0.265],
];

export const FLUTING: FluteSpec = {
  count: 20,
  depth: 0.016,
  fadeIn: [0.17, 0.32],
  fadeOut: [0.84, 1.06],
};

export const OUTER_PROFILE = resample(chaikin(OUTER_CONTROL, 4), 150);
export const CAVITY_PROFILE = resample(chaikin(INNER_CONTROL, 4), 110);

/** Liquid wall: cavity reversed (y increasing), pushed inward, trimmed below the neck. */
function buildLiquidProfile(): ProfilePoint[] {
  const upward = CAVITY_PROFILE.slice().reverse();
  const inset = offsetLeft(upward, FLACON.liquidInset);
  const trimmed: ProfilePoint[] = [];
  for (let i = 0; i < inset.length; i++) {
    const p = inset[i];
    if (p[1] <= FLACON.liquidTopY) {
      trimmed.push(p);
      continue;
    }
    // Interpolate the exact crossing so the top ring sits at liquidTopY.
    const prev = inset[i - 1];
    const t = (FLACON.liquidTopY - prev[1]) / (p[1] - prev[1]);
    trimmed.push([prev[0] + (p[0] - prev[0]) * t, FLACON.liquidTopY]);
    break;
  }
  return trimmed;
}

export const LIQUID_PROFILE = buildLiquidProfile();

/** Radius of a y-increasing profile at height y (largest crossing). */
export function profileRadiusAt(profile: readonly ProfilePoint[], y: number): number {
  let best = 0;
  for (let i = 0; i < profile.length - 1; i++) {
    const [r0, y0] = profile[i];
    const [r1, y1] = profile[i + 1];
    const lo = Math.min(y0, y1);
    const hi = Math.max(y0, y1);
    if (y < lo || y > hi) continue;
    const t = hi - lo < 1e-9 ? 0 : (y - y0) / (y1 - y0);
    best = Math.max(best, r0 + (r1 - r0) * t);
  }
  return best;
}

const LIQUID_RADIUS_TABLE = (() => {
  const n = 128;
  const table = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const y = FLACON.liquidMinY + ((FLACON.liquidTopY - FLACON.liquidMinY) * i) / (n - 1);
    table[i] = profileRadiusAt(LIQUID_PROFILE, y);
  }
  return table;
})();

/** Fast, allocation-free liquid radius lookup for the render loop. */
export function liquidRadiusAt(y: number): number {
  const n = LIQUID_RADIUS_TABLE.length;
  const f = clamp01((y - FLACON.liquidMinY) / (FLACON.liquidTopY - FLACON.liquidMinY)) * (n - 1);
  const i = Math.min(Math.floor(f), n - 2);
  const t = f - i;
  return LIQUID_RADIUS_TABLE[i] * (1 - t) + LIQUID_RADIUS_TABLE[i + 1] * t;
}

/** Groove depth for a vertex at angle θ and height y (0 on the ridges). */
export function fluteDepth(spec: FluteSpec, theta: number, y: number): number {
  const w = smoothstep(spec.fadeIn[0], spec.fadeIn[1], y) * (1 - smoothstep(spec.fadeOut[0], spec.fadeOut[1], y));
  if (w <= 0) return 0;
  const u = (theta * spec.count) / (Math.PI * 2);
  const f = u - Math.floor(u);
  const scallop = 1 - Math.pow(Math.abs(2 * f - 1), 2.4);
  return spec.depth * w * scallop;
}

/* ------------------------------------------------------------------ */
/* Lathe builder                                                       */
/* ------------------------------------------------------------------ */

/**
 * Spin one or more profile runs into a single indexed BufferGeometry.
 * Each run is its own vertex strip, so runs meet at hard edges.
 *
 * Orientation: for a profile travelling "clockwise" in (r, y) — out along the
 * bottom, up the outside, in across the top, down the inside — the normal
 * n = ∂P/∂θ × ∂P/∂t points out of the solid. That is exactly how every run in
 * this file is authored, and the triangle winding below matches that normal.
 */
export function buildLatheSolid(runs: readonly LatheRun[]): THREE.BufferGeometry {
  let vertexTotal = 0;
  let indexTotal = 0;
  for (const run of runs) {
    vertexTotal += run.points.length * (run.segments + 1);
    indexTotal += (run.points.length - 1) * run.segments * 6;
  }

  const positions = new Float32Array(vertexTotal * 3);
  const normals = new Float32Array(vertexTotal * 3);
  const uvs = new Float32Array(vertexTotal * 2);
  const indices = vertexTotal > 65535 ? new Uint32Array(indexTotal) : new Uint16Array(indexTotal);

  let vOffset = 0;
  let iOffset = 0;

  for (const run of runs) {
    const rows = run.points.length;
    const N = run.segments;
    const grid = new Float64Array(rows * N * 3);

    // Arc-length v coordinate.
    const arc = new Float64Array(rows);
    for (let i = 1; i < rows; i++) {
      arc[i] = arc[i - 1] + Math.hypot(run.points[i][0] - run.points[i - 1][0], run.points[i][1] - run.points[i - 1][1]);
    }
    const arcTotal = arc[rows - 1] || 1;

    for (let i = 0; i < rows; i++) {
      const [r0, y] = run.points[i];
      for (let j = 0; j < N; j++) {
        const theta = (j / N) * Math.PI * 2;
        const r = run.flute && r0 > 0 ? Math.max(0, r0 - fluteDepth(run.flute, theta, y)) : r0;
        const k = (i * N + j) * 3;
        grid[k] = r * Math.sin(theta);
        grid[k + 1] = y;
        grid[k + 2] = r * Math.cos(theta);
      }
    }

    for (let i = 0; i < rows; i++) {
      const ip = Math.min(i + 1, rows - 1);
      const im = Math.max(i - 1, 0);
      for (let j = 0; j <= N; j++) {
        const jj = j % N;
        const jp = (jj + 1) % N;
        const jm = (jj - 1 + N) % N;
        const theta = (jj / N) * Math.PI * 2;

        const a = (i * N + jp) * 3;
        const b = (i * N + jm) * 3;
        let ax = grid[a] - grid[b];
        let ay = grid[a + 1] - grid[b + 1];
        let az = grid[a + 2] - grid[b + 2];
        if (ax * ax + ay * ay + az * az < 1e-14) {
          // On the axis the ring collapses: use the analytic tangent direction.
          ax = Math.cos(theta);
          ay = 0;
          az = -Math.sin(theta);
        }

        const c = (ip * N + jj) * 3;
        const d = (im * N + jj) * 3;
        const tx = grid[c] - grid[d];
        const ty = grid[c + 1] - grid[d + 1];
        const tz = grid[c + 2] - grid[d + 2];

        let nx = ay * tz - az * ty;
        let ny = az * tx - ax * tz;
        let nz = ax * ty - ay * tx;
        const len = Math.hypot(nx, ny, nz);
        if (len > 1e-12) {
          nx /= len;
          ny /= len;
          nz /= len;
        } else {
          nx = 0;
          ny = 1;
          nz = 0;
        }

        const src = (i * N + jj) * 3;
        const v = vOffset + i * (N + 1) + j;
        positions[v * 3] = grid[src];
        positions[v * 3 + 1] = grid[src + 1];
        positions[v * 3 + 2] = grid[src + 2];
        normals[v * 3] = nx;
        normals[v * 3 + 1] = ny;
        normals[v * 3 + 2] = nz;
        uvs[v * 2] = j / N;
        uvs[v * 2 + 1] = arc[i] / arcTotal;
      }
    }

    for (let i = 0; i < rows - 1; i++) {
      for (let j = 0; j < N; j++) {
        const a = vOffset + i * (N + 1) + j;
        const b = a + 1;
        const c = a + (N + 1);
        const d = c + 1;
        indices[iOffset++] = a;
        indices[iOffset++] = b;
        indices[iOffset++] = c;
        indices[iOffset++] = b;
        indices[iOffset++] = d;
        indices[iOffset++] = c;
      }
    }

    vOffset += rows * (N + 1);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}

/** Straight segment sampled into `count` points (keeps normals exact on flats). */
function line(a: ProfilePoint, b: ProfilePoint, count = 3): ProfilePoint[] {
  const out: ProfilePoint[] = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
  }
  return out;
}

/** Arc through (r, y) centre, from angle a0 to a1 (radians, 0 = +r, π/2 = +y). */
function arc(cr: number, cy: number, radius: number, a0: number, a1: number, count: number): ProfilePoint[] {
  const out: ProfilePoint[] = [];
  for (let i = 0; i < count; i++) {
    const a = a0 + ((a1 - a0) * i) / (count - 1);
    out.push([cr + Math.cos(a) * radius, cy + Math.sin(a) * radius]);
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Parts                                                               */
/* ------------------------------------------------------------------ */

export function createVesselGeometry(): THREE.BufferGeometry {
  return buildLatheSolid([
    { points: OUTER_PROFILE, segments: 160, flute: FLUTING },
    { points: line([0.15, FLACON.glassLipY], [FLACON.bore, FLACON.glassLipY], 4), segments: 160 },
    { points: CAVITY_PROFILE, segments: 120 },
  ]);
}

export function createLiquidGeometry(): THREE.BufferGeometry {
  const top = LIQUID_PROFILE[LIQUID_PROFILE.length - 1];
  return buildLatheSolid([
    { points: LIQUID_PROFILE, segments: 96 },
    { points: line(top, [0, top[1]], 6), segments: 96 },
  ]);
}

/**
 * Brass collar crimped over the glass lip. Authored clockwise: out along the
 * bottom, up the bead and band, in across the top, down the inside.
 */
export function createCollarGeometry(): THREE.BufferGeometry {
  const b = FLACON.collarBottomY;
  const t = FLACON.collarTopY;
  const inner = FLACON.neckOuter + 0.002;
  const S = 128;
  return buildLatheSolid([
    { points: line([inner, b], [0.186, b]), segments: S },
    { points: arc(0.186, b + 0.02, 0.02, -Math.PI / 2, Math.PI / 2, 14), segments: S },
    { points: line([0.186, b + 0.04], [0.176, b + 0.05]), segments: S },
    { points: line([0.176, b + 0.05], [0.176, t - 0.045], 6), segments: S },
    { points: arc(0.176, t - 0.025, 0.02, -Math.PI / 2, 0, 8), segments: S },
    { points: line([0.196, t - 0.025], [0.196, t - 0.008]), segments: S },
    { points: arc(0.188, t - 0.008, 0.008, 0, Math.PI / 2, 6), segments: S },
    { points: line([0.188, t], [0.092, t], 4), segments: S },
    { points: line([0.092, t], [0.092, FLACON.glassLipY + 0.002]), segments: S },
    { points: line([0.092, FLACON.glassLipY + 0.002], [inner, FLACON.glassLipY + 0.002]), segments: S },
    { points: line([inner, FLACON.glassLipY + 0.002], [inner, b], 4), segments: S },
  ]);
}

/** Frosted ground-glass plug that drops into the bore (local y: -0.2 … 0). */
export function createStopperShankGeometry(): THREE.BufferGeometry {
  const r = FLACON.bore - 0.011;
  return buildLatheSolid([
    { points: line([0, -0.2], [r - 0.008, -0.2]), segments: 48 },
    { points: arc(r - 0.008, -0.192, 0.008, -Math.PI / 2, 0, 5), segments: 48 },
    { points: line([r, -0.192], [r, 0.0], 5), segments: 48 },
    { points: line([r, 0.0], [0, 0.0]), segments: 48 },
  ]);
}

/** Brass seat ring: its underside (local y = 0) lands on the collar top. */
export function createStopperSeatGeometry(): THREE.BufferGeometry {
  const inner = FLACON.bore - 0.011;
  const S = 96;
  return buildLatheSolid([
    { points: line([inner, 0], [0.19, 0]), segments: S },
    { points: arc(0.184, 0.006, 0.006, -Math.PI / 2, 0, 5), segments: S },
    { points: line([0.19, 0.006], [0.19, 0.02]), segments: S },
    { points: arc(0.172, 0.02, 0.018, 0, Math.PI / 2, 8), segments: S },
    { points: line([0.172, 0.038], [inner, 0.038]), segments: S },
    { points: line([inner, 0.038], [inner, 0]), segments: S },
  ]);
}

/** Cut-glass finial: few profile points + few segments = crisp facets (flat shaded). */
export function createStopperFinialGeometry(): THREE.BufferGeometry {
  const pts = [
    new THREE.Vector2(0.0001, 0.038),
    new THREE.Vector2(0.1, 0.038),
    new THREE.Vector2(0.19, 0.11),
    new THREE.Vector2(0.25, 0.22),
    new THREE.Vector2(0.256, 0.3),
    new THREE.Vector2(0.215, 0.4),
    new THREE.Vector2(0.125, 0.48),
    new THREE.Vector2(0.045, 0.515),
    new THREE.Vector2(0.0001, 0.52),
  ];
  return new THREE.LatheGeometry(pts, 12);
}

/** Small faceted brass cap crowning the finial. */
export function createStopperCapGeometry(): THREE.BufferGeometry {
  const pts = [
    new THREE.Vector2(0.0001, 0.5),
    new THREE.Vector2(0.05, 0.505),
    new THREE.Vector2(0.062, 0.535),
    new THREE.Vector2(0.05, 0.565),
    new THREE.Vector2(0.022, 0.58),
    new THREE.Vector2(0.0001, FLACON.stopperHeight),
  ];
  return new THREE.LatheGeometry(pts, 12);
}

/**
 * A pressed petal: teardrop outline, cupped across and curled along its length.
 * Vertex colours carry a darker claw and a faint central vein.
 */
export function createPetalGeometry(): THREE.BufferGeometry {
  const cols = 8;
  const rows = 12;
  const positions: number[] = [];
  const colors: number[] = [];
  const index: number[] = [];
  for (let iv = 0; iv <= rows; iv++) {
    const v = iv / rows;
    const width = Math.max(0.04, Math.pow(Math.sin(Math.PI * Math.pow(v, 0.72)), 0.85) * 0.42);
    for (let iu = 0; iu <= cols; iu++) {
      const u = (iu / cols) * 2 - 1;
      const x = u * width;
      const y = v - 0.5;
      const z = 0.36 * u * u * width + 0.28 * (v - 0.45) * (v - 0.45);
      positions.push(x, y, z);
      const shade = (0.7 + 0.3 * smoothstep(0, 0.55, v)) * (1 - 0.07 * Math.exp(-u * u * 40));
      colors.push(shade, shade, shade);
    }
  }
  for (let iv = 0; iv < rows; iv++) {
    for (let iu = 0; iu < cols; iu++) {
      const a = iv * (cols + 1) + iu;
      const b = a + 1;
      const c = a + cols + 1;
      const d = c + 1;
      index.push(a, b, c, b, d, c);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  return geometry;
}
