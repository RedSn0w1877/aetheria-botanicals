"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { useEffect, useRef, type RefObject } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { REDUCED_MOTION_QUERY } from "./use-client-flags";

/**
 * Komorebi — sunlight filtered through leaves.
 *
 * Three layers of soft leaf shadows fall across the linen, as if a window with a
 * birch outside sits just off the top-left of the page. Each layer is blurred by a
 * different amount (nearer leaves are sharper), sways on its own slow CSS loop,
 * and parallaxes with the pointer (heavy damped springs) and with scroll.
 *
 * A warm band of window light sweeps diagonally across it all: a *linear* gradient,
 * never a radial glow.
 *
 * The leaf geometry is generated from a seeded PRNG at module load, rounded to one
 * decimal, so the server and browser produce byte-identical SVG.
 */

type Layer = {
  seed: number;
  sprigs: number;
  leafScale: number;
  blur: number;
  opacity: number;
  /** How strongly this layer follows the pointer and scroll. */
  depth: number;
  drift: "ae-drift-a" | "ae-drift-b" | "ae-drift-c";
};

type Sprig = { stem: string; leaves: string[] };

const LAYERS: readonly Layer[] = [
  { seed: 19, sprigs: 4, leafScale: 1.45, blur: 22, opacity: 0.07, depth: 0.35, drift: "ae-drift-c" },
  { seed: 7, sprigs: 5, leafScale: 1.05, blur: 11, opacity: 0.085, depth: 0.7, drift: "ae-drift-b" },
  { seed: 43, sprigs: 4, leafScale: 0.8, blur: 5, opacity: 0.1, depth: 1.1, drift: "ae-drift-a" },
];

/** A single leaf pointing down the +y axis, 100 units long. */
const LEAF_PATH = "M0 0 C 30 20 27 72 0 100 C -27 72 -30 20 0 0 Z";

const VIEW_W = 1440;
const VIEW_H = 900;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (n: number) => n.toFixed(1);

function buildSprigs(layer: Layer): Sprig[] {
  const rand = mulberry32(layer.seed);
  const range = (min: number, max: number) => min + rand() * (max - min);
  const sprigs: Sprig[] = [];

  for (let s = 0; s < layer.sprigs; s += 1) {
    // Branches reach in from above and from the right edge, like a canopy outside the window.
    const fromTop = rand() < 0.62;
    const sx = fromTop ? range(-80, VIEW_W + 80) : VIEW_W + range(20, 90);
    const sy = fromTop ? range(-140, -30) : range(-40, VIEW_H * 0.75);
    const tx = range(VIEW_W * 0.1, VIEW_W * 0.9);
    const ty = range(VIEW_H * 0.25, VIEW_H * 0.95);
    const dx = tx - sx;
    const dy = ty - sy;
    const length = Math.hypot(dx, dy);
    const bow = range(-0.28, 0.28) * length;
    // Control point: the chord midpoint pushed sideways, for a natural arc.
    const cx = sx + dx / 2 + (-dy / length) * bow;
    const cy = sy + dy / 2 + (dx / length) * bow;

    const leaves: string[] = [];
    const count = Math.round(range(7, 12));
    for (let i = 0; i < count; i += 1) {
      const t = 0.14 + (i / (count - 1)) * 0.86;
      const u = 1 - t;
      const px = u * u * sx + 2 * u * t * cx + t * t * tx;
      const py = u * u * sy + 2 * u * t * cy + t * t * ty;
      const gx = 2 * u * (cx - sx) + 2 * t * (tx - cx);
      const gy = 2 * u * (cy - sy) + 2 * t * (ty - cy);
      const heading = (Math.atan2(gy, gx) * 180) / Math.PI - 90;
      const isTip = i === count - 1;
      const side = i % 2 === 0 ? 1 : -1;
      const splay = isTip ? 0 : side * range(38, 64);
      const scale = layer.leafScale * (1.15 - 0.45 * t) * range(0.8, 1.2);
      leaves.push(`translate(${f(px)} ${f(py)}) rotate(${f(heading + splay)}) scale(${scale.toFixed(3)})`);
    }

    sprigs.push({ stem: `M${f(sx)} ${f(sy)} Q${f(cx)} ${f(cy)} ${f(tx)} ${f(ty)}`, leaves });
  }
  return sprigs;
}

const LAYER_SPRIGS: readonly Sprig[][] = LAYERS.map(buildSprigs);

function LeafLayer({
  layer,
  sprigs,
  pointerX,
  pointerY,
  scroll,
}: {
  layer: Layer;
  sprigs: Sprig[];
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
  scroll: MotionValue<number>;
}) {
  const x = useTransform(pointerX, (v) => v * 46 * layer.depth);
  const y = useTransform([pointerY, scroll], ([py, sc]: number[]) => py * 30 * layer.depth - sc * 260 * layer.depth);

  return (
    <motion.div className="absolute -inset-[10%] will-change-transform" style={{ x, y }}>
      <div className={`absolute inset-0 ${layer.drift}`}>
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="xMidYMid slice"
          className="h-full w-full text-rosemary"
          style={{ filter: `blur(${layer.blur}px)`, opacity: layer.opacity }}
          role="presentation"
        >
          <g fill="currentColor">
            {sprigs.map((sprig, s) => (
              <g key={s}>
                <path d={sprig.stem} fill="none" stroke="currentColor" strokeWidth={5 * layer.leafScale} />
                {sprig.leaves.map((transform, l) => (
                  <path key={l} d={LEAF_PATH} transform={transform} />
                ))}
              </g>
            ))}
          </g>
        </svg>
      </div>
    </motion.div>
  );
}

export function KomorebiBackdrop({ targetRef }: { targetRef: RefObject<HTMLElement | null> }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const pointerX = useSpring(rawX, { stiffness: 22, damping: 14, mass: 1.6 });
  const pointerY = useSpring(rawY, { stiffness: 22, damping: 14, mass: 1.6 });
  const { scrollYProgress } = useScroll({ target: targetRef, offset: ["start start", "end start"] });
  const lightX = useTransform(pointerX, (v) => v * -28);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia(REDUCED_MOTION_QUERY);
    let visible = true;

    // Pause the CSS drift and ignore the pointer while the hero is off screen.
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
      root.dataset.paused = visible ? "false" : "true";
    });
    observer.observe(root);

    const onMove = (event: PointerEvent) => {
      if (!visible || reduced.matches || event.pointerType !== "mouse") return;
      rawX.set((event.clientX / window.innerWidth) * 2 - 1);
      rawY.set((event.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, [rawX, rawY]);

  return (
    <div ref={rootRef} aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Warm window light, swept slowly across the diagonal. */}
      <motion.div className="absolute -inset-[30%]" style={{ x: lightX }}>
        <div
          className="ae-sweep absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(118deg, rgba(249,247,242,0) 30%, rgba(255,249,236,0.75) 41%, rgba(232,203,150,0.16) 47%, rgba(249,247,242,0) 55%, rgba(255,249,236,0.45) 61%, rgba(249,247,242,0) 68%)",
          }}
        />
      </motion.div>

      <div className="absolute inset-0 mix-blend-multiply">
        {LAYERS.map((layer, index) => (
          <LeafLayer
            key={layer.seed}
            layer={layer}
            sprigs={LAYER_SPRIGS[index] ?? []}
            pointerX={pointerX}
            pointerY={pointerY}
            scroll={scrollYProgress}
          />
        ))}
      </div>

      {/* Settle the lower edge into the ticker. */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-linen/0 to-linen" />
    </div>
  );
}
