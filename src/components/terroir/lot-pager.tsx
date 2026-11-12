"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { useEffect, useRef, useState, type AnimationEvent, type KeyboardEvent, type MouseEvent, type PointerEvent } from "react";
import { MarginNote } from "@/components/book/margin-note";
import s from "@/components/chapters/provenance.module.css";
import { prefersReducedMotion } from "@/lib/device";
import { formatCoordinates, groupThousands, TERROIR_LOTS } from "@/lib/terroir-lots";
import { useNearView } from "@/lib/use-near-view";
import { HerbariumPlate, herbariumSrc } from "./herbarium-plate";
import { contourSrc, InstrumentLedger } from "./instruments";

/*
 * Chapter III's spread: three harvest lots as pages you turn. The left page is the lot's text and
 * instrument ledger; the right page is the herbarium sheet under three ribbon bookmarks.
 *
 * A turn is two DOM pages, keyed by lot so React never remounts or moves a page mid-turn:
 * - forward (next): the new lot becomes the sheet at once, and the old sheet turns away over the
 *   spine as a leaf, rotateY 0 → −180°, fading in its last 15%;
 * - backward: the incoming lot's leaf swings in from −180° over the old sheet, then becomes the sheet.
 * The leaf goes when its own animation ends. Text and readings swap at click time and never animate.
 * Reduced motion is checked when the reader acts (matchMedia), never during render: no leaf at all.
 * Arrow keys, Home and End also swap instantly: a keyboard reader steps through lots fast, and a
 * 700 ms leaf per key press would only make the keys feel slow (the turn is for clicks and swipes).
 * So do Enter and Space on the buttons (a click with detail 0). A keyboard turn also sets
 * data-instant on the pager, so the instruments jump to their readings and the stamp is simply there.
 *
 * A second turn while a leaf is still in the air never cuts it off: the leaf finishes at triple speed
 * and the newest choice turns as soon as it lands (the text has already moved on at click time).
 * The intake stamp of the first lot lands only once the reader can see it (data-seen), not at load.
 */

type Leaf = { lot: number; dir: 1 | -1 } | null;
type Stack = { sheet: number; leaf: Leaf };
type Turn = { next: number; dir: 1 | -1 };

/** The stack after starting a turn from `sheet` to `next`. */
const turning = (sheet: number, next: number, dir: 1 | -1): Stack =>
  dir > 0 ? { sheet: next, leaf: { lot: sheet, dir: 1 } } : { sheet, leaf: { lot: next, dir: -1 } };
type Page = { lot: number; role: "sheet" | "fwd" | "back" };

const LAST = TERROIR_LOTS.length - 1;
const SWIPE_X = 48;
const SWIPE_Y = 32;
/** Warmed images, kept referenced so the browser keeps them decoded. */
const warmed: HTMLImageElement[] = [];

export function LotPager() {
  const [index, setIndex] = useState(0);
  const [stack, setStack] = useState<Stack>({ sheet: 0, leaf: null });
  const [instant, setInstant] = useState(false);
  const pending = useRef<Turn | null>(null);
  const tablist = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const swipe = useRef<{ x: number; y: number; id: number } | null>(null);
  const lot = TERROIR_LOTS[index] ?? TERROIR_LOTS[0];

  // Near view: fetch and decode every other sheet and contour, so a turn never reveals an empty page.
  const near = useNearView(stackRef);
  // The reader can see the sheet: the first lot's stamp may land now.
  const seen = useNearView(stackRef, "0px 0px -30% 0px");
  useEffect(() => {
    if (!near || warmed.length) return;
    for (const l of TERROIR_LOTS) {
      for (const src of [herbariumSrc(l), contourSrc(l)]) {
        const image = new Image();
        image.decoding = "async";
        image.src = src;
        image.decode().catch(() => {});
        warmed.push(image);
      }
    }
  }, [near]);

  const turnTo = (next: number, dir: 1 | -1, now = false) => {
    if (next === index) return;
    setIndex(next);
    setInstant(now);
    if (now || prefersReducedMotion()) {
      pending.current = null;
      setStack({ sheet: next, leaf: null });
    } else if (stack.leaf) {
      // A leaf is still turning: let it land quickly, then turn to the newest choice (onTurnEnd).
      pending.current = { next, dir };
      stackRef.current
        ?.querySelectorAll("[data-leaf]")
        .forEach((leaf) => leaf.getAnimations({ subtree: true }).forEach((animation) => (animation.playbackRate = 3)));
    } else {
      setStack(turning(stack.sheet, next, dir));
    }
  };
  /** Enter or Space on a button is a click with detail 0: a keyboard turn, so it is instant. */
  const byKeyboard = (event: MouseEvent) => event.detail === 0;
  const nextLot = (now = false) => turnTo(index === LAST ? 0 : index + 1, 1, now);
  const previousLot = (now = false) => turnTo(index === 0 ? LAST : index - 1, -1, now);

  const onTurnEnd = (pageLot: number) => (event: AnimationEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    const queued = pending.current;
    pending.current = null;
    setStack((current) => {
      if (current.leaf?.lot !== pageLot) return current;
      const settled = { sheet: current.leaf.dir < 0 ? current.leaf.lot : current.sheet, leaf: null };
      return queued && queued.next !== settled.sheet ? turning(settled.sheet, queued.next, queued.dir) : settled;
    });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, [number, 1 | -1]> = {
      ArrowRight: [index === LAST ? 0 : index + 1, 1],
      ArrowDown: [index === LAST ? 0 : index + 1, 1],
      ArrowLeft: [index === 0 ? LAST : index - 1, -1],
      ArrowUp: [index === 0 ? LAST : index - 1, -1],
      Home: [0, -1],
      End: [LAST, 1],
    };
    const hit = keys[event.key];
    if (!hit) return;
    event.preventDefault();
    turnTo(hit[0], hit[1], true);
    tablist.current?.querySelectorAll<HTMLButtonElement>("[role=tab]")[hit[0]]?.focus();
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    swipe.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
  };
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = swipe.current;
    swipe.current = null;
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    if (Math.abs(dx) > SWIPE_X && Math.abs(event.clientY - start.y) < SWIPE_Y) {
      if (dx < 0) nextLot();
      else previousLot();
    }
  };

  // Pages in lot order, so a page that stays never moves in the DOM (moving it would restart its animations).
  const pages: Page[] = [{ lot: stack.sheet, role: "sheet" }];
  if (stack.leaf) pages.push({ lot: stack.leaf.lot, role: stack.leaf.dir > 0 ? "fwd" : "back" });
  pages.sort((a, b) => a.lot - b.lot);

  const accords = lot.accords.map((accord) => accord.toLowerCase());

  return (
    <div className={`bk-book ${s.pager}`} data-seen={seen ? "" : undefined} data-instant={instant ? "" : undefined}>
      <div className={`bk-spread ${s.spread}`}>
        <div className={s.platePage}>
          <div className={s.ribbonRow}>
            <p className={s.ribbonName} aria-hidden="true">
              {lot.ribbon}
            </p>
            <div ref={tablist} role="tablist" aria-label="Harvest lots" className={s.ribbons} onKeyDown={onKeyDown}>
              {TERROIR_LOTS.map((l, i) => (
                <button
                  key={l.code}
                  type="button"
                  role="tab"
                  id={`lot-tab-${l.number}`}
                  aria-selected={i === index}
                  aria-controls="lot-panel"
                  aria-label={`Lot ${l.number}, ${l.commonName}`}
                  tabIndex={i === index ? 0 : -1}
                  data-tone={i}
                  className={s.ribbon}
                  onClick={(event) => turnTo(i, i > index ? 1 : -1, byKeyboard(event))}
                >
                  <span className={s.ribbonClip}>
                    <span className={s.ribbonStrip}>
                      <span className={s.ribbonNumeral}>{l.number}</span>
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div
            ref={stackRef}
            className={s.stack}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={() => {
              swipe.current = null;
            }}
          >
            {pages.map(({ lot: pageLot, role }) => {
              const pageData = TERROIR_LOTS[pageLot];
              if (!pageData) return null;
              return (
                <div
                  key={pageData.code}
                  className={role === "sheet" ? s.page : `${s.page} ${role === "fwd" ? s.turnFwd : s.turnBack}`}
                  data-leaf={role === "sheet" ? undefined : ""}
                  aria-hidden={pageLot !== index || undefined}
                  onAnimationEnd={role === "sheet" ? undefined : onTurnEnd(pageLot)}
                >
                  <div className={s.rotor}>
                    <HerbariumPlate lot={pageData} />
                    <div className={s.back} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className={s.controls}>
            <button type="button" className={s.control} aria-label="Previous lot" onClick={(event) => previousLot(byKeyboard(event))}>
              ‹ previous lot
            </button>
            <p className={s.count} aria-live="polite">
              {index + 1} of {TERROIR_LOTS.length}
            </p>
            <button type="button" className={s.control} aria-label="Next lot" onClick={(event) => nextLot(byKeyboard(event))}>
              next lot ›
            </button>
          </div>
        </div>

        <div className="bk-gutter" aria-hidden="true" />

        <div id="lot-panel" role="tabpanel" aria-labelledby={`lot-tab-${lot.number}`} className={s.textPage}>
          <p className="bk-label">lot {lot.number}</p>
          <h3 className={s.lotTitle}>{lot.commonName}</h3>
          <p className={s.latin}>{lot.latinName}</p>
          <p className={s.location}>
            {lot.region}, {lot.country} · {formatCoordinates(lot.lat, lot.lng)} · {groupThousands(lot.altitudeM)} m above
            the sea
          </p>
          <div className={s.prose}>
            <p>{lot.habitat}</p>
            <p>{lot.harvestSentence}</p>
            <p>
              It smells of {accords.slice(0, -1).join(", ")} and {accords[accords.length - 1]}.
            </p>
          </div>
          <div className={s.field}>
            <blockquote className={s.quote}>
              <p>“{lot.fieldNote}”</p>
            </blockquote>
            <p className={`bk-label ${s.quoteBy}`}>field note, harvest team</p>
            <MarginNote side="left" className={s.yield}>
              {lot.yieldNote}
            </MarginNote>
          </div>
          <InstrumentLedger lot={lot} />
        </div>
      </div>
    </div>
  );
}
