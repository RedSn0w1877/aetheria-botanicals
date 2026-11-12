// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

/*
 * The atomizer's mist, on a 2D canvas: white gouache stippling that leaves the nozzle fast, slows in
 * the air, drifts, swells and fades. Loaded on demand by ritual/spray-flacon.tsx (its own chunk, never
 * in the page's eager JavaScript), and only ever asked to run when the reader allows motion.
 *
 * Idle costs nothing: the animation frame loop runs only while the bulb is held or a droplet is still
 * in the air, then clears the canvas and stops. No timers, no context until the first press.
 */

export type Point = { x: number; y: number };

export type Mist = {
  /** The bulb goes down: start spraying from `from` (canvas CSS pixels). */
  press(from: Point): void;
  /** The bulb comes back. A tap (a short press) still lets one full puff go. */
  release(tap: boolean): void;
  /** The mist's colour, "r,g,b": gouache by default, tinted by the visitor's composition. */
  tint(rgb: string): void;
  dispose(): void;
};

const MAX = 1400;
/** Gouache, #fbf5e6: the default colour (see Mist.tint). */
const MIST = "251,245,230";
/** The spray leaves slightly upward of horizontal, to the right, within ±11°. */
const AIM = (-13 * Math.PI) / 180;
const SPREAD = (11 * Math.PI) / 180;
/** Emission falls from a burst to a steady hiss over the first half second, and stops after 3.2s. */
const BURST = 1300;
const HISS = 170;
const HOLD_MAX = 3.2;

export function createMist(canvas: HTMLCanvasElement): Mist {
  const ctx = canvas.getContext("2d");
  const x = new Float32Array(MAX);
  const y = new Float32Array(MAX);
  const vx = new Float32Array(MAX);
  const vy = new Float32Array(MAX);
  const age = new Float32Array(MAX);
  const life = new Float32Array(MAX);
  const size = new Float32Array(MAX);
  const seed = new Float32Array(MAX);
  let count = 0;
  let colour = MIST;
  let frame = 0;
  let last = 0;
  let clock = 0;
  let holding = false;
  let heldFor = 0;
  let debt = 0;
  let origin: Point = { x: 0, y: 0 };
  let scale = 1;
  let ratio = 1;

  const fit = () => {
    ratio = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (canvas.width !== Math.round(w * ratio) || canvas.height !== Math.round(h * ratio)) {
      canvas.width = Math.round(w * ratio);
      canvas.height = Math.round(h * ratio);
    }
    // Speeds and sizes follow the drawing's size, so a phone's mist is a phone-sized mist.
    scale = Math.max(0.55, Math.min(1.4, w / 900));
  };

  const emit = (n: number) => {
    for (let k = 0; k < n && count < MAX; k += 1) {
      const i = count;
      count += 1;
      const a = AIM + (Math.random() * 2 - 1) * SPREAD * (0.4 + Math.random() * 0.6);
      const speed = (300 + Math.random() * 420) * scale;
      x[i] = origin.x;
      y[i] = origin.y;
      vx[i] = Math.cos(a) * speed;
      vy[i] = Math.sin(a) * speed;
      age[i] = 0;
      life[i] = 1.1 + Math.random() * 1.5;
      // Most droplets are fine; one in nine is a soft cloud that gives the mist its body.
      size[i] = Math.random() < 0.11 ? -(6 + Math.random() * 10) * scale : (0.5 + Math.random() * 1.2) * scale;
      seed[i] = Math.random() * 100;
    }
  };

  const step = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    clock += dt;

    if (holding) {
      heldFor += dt;
      if (heldFor < HOLD_MAX) {
        debt += (BURST * Math.exp(-heldFor / 0.45) + HISS) * dt;
        const n = Math.floor(debt);
        debt -= n;
        emit(n);
      }
    }

    // Move, then compact the arrays over the droplets that have gone.
    const drag = Math.exp(-3.4 * dt);
    let live = 0;
    for (let i = 0; i < count; i += 1) {
      age[i] += dt;
      if (age[i] >= life[i]) continue;
      vx[i] = vx[i] * drag + Math.sin(y[i] * 0.021 + clock * 1.7 + seed[i]) * 26 * scale * dt;
      vy[i] = vy[i] * drag - 18 * scale * dt + Math.cos(x[i] * 0.017 + clock * 1.3 + seed[i]) * 20 * scale * dt;
      x[i] += vx[i] * dt;
      y[i] += vy[i] * dt;
      if (live !== i) {
        x[live] = x[i];
        y[live] = y[i];
        vx[live] = vx[i];
        vy[live] = vy[i];
        age[live] = age[i];
        life[live] = life[i];
        size[live] = size[i];
        seed[live] = seed[i];
      }
      live += 1;
    }
    count = live;

    if (ctx) {
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < count; i += 1) {
        const t = age[i] / life[i];
        const fadeIn = Math.min(1, age[i] * 14);
        const fadeOut = (1 - t) ** 1.5;
        const cloud = size[i] < 0;
        const r = (cloud ? -size[i] : size[i]) * (1 + t * (cloud ? 2.2 : 1.4));
        ctx.fillStyle = `rgba(${colour},${(cloud ? 0.055 : 0.8) * fadeIn * fadeOut})`;
        ctx.beginPath();
        ctx.arc(x[i], y[i], r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (holding || count > 0) {
      frame = requestAnimationFrame(step);
    } else {
      frame = 0;
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const run = () => {
    if (frame) return;
    last = performance.now();
    frame = requestAnimationFrame(step);
  };

  return {
    tint(rgb) {
      colour = rgb;
    },
    press(from) {
      fit();
      origin = from;
      holding = true;
      heldFor = 0;
      debt = 0;
      run();
    },
    release(tap) {
      holding = false;
      // A tap is too short for the burst to have built up: let one puff go anyway.
      if (tap) emit(Math.round(140 * Math.max(0.7, scale)));
      run();
    },
    dispose() {
      holding = false;
      count = 0;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    },
  };
}
