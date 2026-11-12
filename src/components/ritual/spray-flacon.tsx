"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent } from "react";
import s from "@/components/chapters/ritual.module.css";
import { FLACON_H, FLACON_W, HOSE_X, HOSE_Y, NOZZLE_X, NOZZLE_Y } from "@/components/ritual/plates/flacon-grid";
import { getNote, mixTincture, type Selection } from "@/lib/blend-formulas";
import { withBase } from "@/lib/base-path";
import { REDUCED_MOTION } from "@/lib/device";
import { onFormula, useComposition } from "@/lib/formula-store";
import { PALETTE } from "@/lib/palette";
import { useNearView } from "@/lib/use-near-view";
import type { Mist, createMist as CreateMist } from "./mist";

/*
 * The ritual's last page: the finished flacon, fitted with an atomizer. Hold the bottle and its silk
 * bulb squeezes and a fine mist leaves the nozzle for as long as you hold; let go and the last of it
 * drifts off. A tap lets one puff go. Space and Enter work like a press.
 *
 * Reduced motion: nothing happens and nothing invites it (the button is disabled and the hint is
 * hidden); the drawing stays. No JS: the hint is hidden by CSS, the drawing stays.
 * The mist engine (./mist) is its own chunk, fetched when the flacon comes near the screen; its
 * canvas is made on the first press, in the layer laid over the coda.
 *
 * The two interactions of the book meet here: whatever the reader composed in chapter II names the
 * bottle ("Composition 013"), tints its liquid wash and its mist (mixTincture, through the store's
 * DOM sink, never a re-render per slider step), and after the first spray one line of the scent's
 * order settles under the bottle ("yuzu first, then moss").
 */

/** "r,g,b" of a hex colour, mixed toward gouache so a dark tincture still reads as a fine mist. */
function mistColour(hex: string): string {
  const n = Number.parseInt(hex.slice(1), 16);
  const mix = (c: number, g: number) => Math.round(c * 0.55 + g * 0.45);
  return `${mix((n >> 16) & 255, 251)},${mix((n >> 8) & 255, 245)},${mix(n & 255, 230)}`;
}

/** How the scent opens and closes: "yuzu first, then moss". */
function order(selection: Selection): string {
  const top = getNote(selection.top.noteId).short.toLowerCase();
  const base = getNote(selection.base.noteId).short.toLowerCase();
  return `${top} first, then ${base}`;
}

const TAP_MS = 180;

/** The reduced-motion preference as a store, so render never branches on matchMedia during hydration. */
function subscribeMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const reducedNow = () => window.matchMedia(REDUCED_MOTION).matches;
const reducedOnServer = () => false;

/** The liquid below the meniscus (flacon.ts BODY clipped at LIQUID_TOP), for the composition's wash. */
const TINT = "M70 262C69 300 74 338 84 360C94 380 106 384 118 384H182C194 384 206 380 216 360C226 338 231 300 230 262Q150 268 70 262Z";

/** The bulb hangs off the hose spigot on the left; it squeezes about its own top. Same 300 × 440 grid. */
const HOSE = `M${HOSE_X - 8} ${HOSE_Y}C100 ${HOSE_Y} 64 148 50 182`;

export function SprayFlacon() {
  const reduced = useSyncExternalStore(subscribeMotion, reducedNow, reducedOnServer);
  const button = useRef<HTMLButtonElement>(null);
  const figure = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const mist = useRef<Mist | null>(null);
  const engine = useRef<Promise<typeof CreateMist | null> | null>(null);
  const pressedAt = useRef(0);
  const near = useNearView(button, "100% 0px");
  const composition = useComposition();
  const tint = useRef<string | null>(null);
  const [sprayed, setSprayed] = useState(false);
  const [line, setLine] = useState("vetiver first, then smoked birch");

  // The composition tints the liquid wash (a CSS variable on the figure) and the mist, without
  // re-rendering on every slider step. The house scent keeps the drawing's own amber.
  useEffect(
    () =>
      onFormula((formula) => {
        const hex = formula.touched ? mixTincture(formula.selection) : null;
        tint.current = hex;
        if (hex) figure.current?.style.setProperty("--spray-tint", hex);
        else figure.current?.style.removeProperty("--spray-tint");
        figure.current?.toggleAttribute("data-tinted", Boolean(hex));
        mist.current?.tint(hex ? mistColour(hex) : "251,245,230");
        if (formula.touched) setLine(order(formula.selection));
      }),
    [],
  );

  /** Fetch the mist engine's chunk (once, when the flacon nears the screen or on the first press). */
  const fetchEngine = () => {
    engine.current ??= import("./mist").then((m) => m.createMist).catch(() => null);
    return engine.current;
  };

  /** The engine and its canvas, made on the first press: no empty drawing surface before then. */
  const load = () =>
    fetchEngine().then((create) => {
      if (mist.current) return mist.current;
      if (!create || !layer.current) return null;
      canvas.current = document.createElement("canvas");
      layer.current.append(canvas.current);
      mist.current = create(canvas.current);
      if (tint.current) mist.current.tint(mistColour(tint.current));
      return mist.current;
    });

  useEffect(() => {
    if (near && !reduced) void fetchEngine();
  }, [near, reduced]);

  useEffect(() => () => mist.current?.dispose(), []);

  /** The nozzle tip, in the canvas's own CSS pixels. */
  const nozzle = () => {
    const box = figure.current?.getBoundingClientRect();
    const stage = canvas.current?.getBoundingClientRect();
    if (!box || !stage) return { x: 0, y: 0 };
    return {
      x: box.left - stage.left + (NOZZLE_X / FLACON_W) * box.width,
      y: box.top - stage.top + (NOZZLE_Y / FLACON_H) * box.height,
    };
  };

  const start = () => {
    if (reduced || pressedAt.current) return;
    pressedAt.current = performance.now();
    button.current?.setAttribute("data-pressed", "");
    void load().then((ready) => {
      // Still held once the engine is ready (the chunk is usually fetched already, on near view).
      if (ready && pressedAt.current) ready.press(nozzle());
    });
  };

  const stop = () => {
    if (!pressedAt.current) return;
    const tap = performance.now() - pressedAt.current < TAP_MS;
    pressedAt.current = 0;
    button.current?.removeAttribute("data-pressed");
    setSprayed(true);
    void load().then((ready) => {
      if (!ready) return;
      // A tap can end before the engine was ready: press and release in one go.
      if (tap) ready.press(nozzle());
      ready.release(tap);
    });
  };

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    start();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== " " && event.key !== "Enter") return;
    event.preventDefault();
    if (!event.repeat) start();
  };

  const onKeyUp = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== " " && event.key !== "Enter") return;
    event.preventDefault();
    stop();
  };

  return (
    <div className={s.coda}>
      <div ref={layer} className={s.mist} aria-hidden="true" />
      <p className={`bk-label ${s.codaLabel}`}>
        {composition.touched ? `Composition ${composition.number}` : "No. 019"}, the finished flacon
      </p>
      <button
        ref={button}
        type="button"
        className={s.spray}
        disabled={reduced}
        onPointerDown={onPointerDown}
        onPointerUp={stop}
        onPointerCancel={stop}
        onLostPointerCapture={stop}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onBlur={stop}
        onContextMenu={(event) => event.preventDefault()}
      >
        <span ref={figure} className={s.sprayFigure}>
          <img
            src={withBase("/plates/ritual/atomizer.svg")}
            width={FLACON_W}
            height={FLACON_H}
            loading="lazy"
            decoding="async"
            draggable={false}
            alt="The finished flacon of No. 019, with a brass atomizer and a silk bulb"
          />
          <svg viewBox={`0 0 ${FLACON_W} ${FLACON_H}`} className={s.sprayParts} aria-hidden="true">
            {/* The composition's tincture, washed into the liquid (shown only once the reader has composed). */}
            <path className={s.sprayTint} d={TINT} />
            <path d={HOSE} fill="none" stroke={PALETTE.rosemary} strokeWidth="1.6" strokeLinecap="round" />
            <g className={s.bulb}>
              <path d="M50 180V186" stroke={PALETTE.brass} strokeWidth="5" strokeLinecap="round" />
              <path
                d="M50 186C28 188 22 214 30 232C36 246 64 246 70 232C78 214 72 188 50 186Z"
                fill={PALETTE.terracotta}
                stroke={PALETTE.rosemary}
                strokeWidth="1.1"
              />
              <path d="M36 206C35 216 37 226 43 233" fill="none" stroke={PALETTE.gouache} strokeWidth="2.2" strokeLinecap="round" opacity="0.8" />
              <path d="M42 194Q50 191 58 194" fill="none" stroke={PALETTE.gouache} strokeWidth="1.1" opacity="0.6" />
              <path d="M50 244V262M46 262L42 290M50 262V292M54 262L58 290" fill="none" stroke={PALETTE.brass} strokeWidth="1.1" strokeLinecap="round" />
            </g>
          </svg>
        </span>
        <span className={s.sprayHint}>hold the bottle to spray it</span>
      </button>
      <p className={s.sprayLine} data-show={sprayed ? "" : undefined} aria-live="polite">
        {sprayed ? line : ""}
      </p>
    </div>
  );
}
