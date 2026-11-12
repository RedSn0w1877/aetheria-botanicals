"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { lazy, Suspense, useEffect, useRef, useState, useSyncExternalStore, type ComponentType } from "react";
import { hydrateRoot } from "react-dom/client";

/*
 * Deferred islands: the book's three big interactive spreads below the title page (the composer, the
 * lot pager and the letter) load AND hydrate only when their chapter comes near the screen, each as
 * its own small React root, instead of shipping in the page's first script and hydration pass.
 *
 * Each island's code sits behind a dynamic import(), so it is its own chunk. The server awaits that
 * import and renders the spread in place, inline, so the first paint and no-JS readers get the finished
 * spread. In the browser this wrapper hydrates as an empty box with dangerouslySetInnerHTML, which React
 * leaves exactly as the server wrote it. When the chapter is a screen and a half away the chunk starts
 * downloading; within half a screen, hydrateRoot() adopts that same DOM with the island, so its handlers
 * attach then, in a task of its own. The island's CSS module is also imported by its server chapter,
 * so its styles ship with the page, not with the chunk.
 *
 * Islands hydrated this way must not use useId (a separate root cannot reproduce the prerendered
 * ids); they use fixed or prop-derived ids instead. They share state through module stores
 * (lib/formula-store.ts), never through React context.
 */

export type IslandName = "compose" | "provenance" | "commission";

/** One chunk per island. The paths are written out so the bundler can split each one. */
const LOADERS: Record<IslandName, () => Promise<ComponentType>> = {
  compose: () => import("@/components/CompoundBlender").then((m) => m.CompoundBlender),
  provenance: () => import("@/components/terroir/lot-pager").then((m) => m.LotPager),
  commission: () => import("@/components/commission/commission-letter").then((m) => m.CommissionLetter),
};

const modules = new Map<IslandName, Promise<ComponentType>>();

/** The island's component, imported once and shared by every caller (hydration and the lazy map). */
function load(name: IslandName): Promise<ComponentType> {
  let pending = modules.get(name);
  if (!pending) {
    pending = LOADERS[name]();
    modules.set(name, pending);
  }
  return pending;
}

/*
 * A link that jumps straight to an island's chapter (the hero's "Compose your own scent", the
 * masthead's "Commission a scent", the Contents entries) skips the nearness margin, so its chunk starts
 * on intent instead: hover, keyboard focus or the press itself, a beat before the jump lands.
 */
let intentWatched = false;
function watchIntent() {
  if (intentWatched) return;
  intentWatched = true;
  const onIntent = (event: Event) => {
    const link = event.target instanceof Element ? event.target.closest("a[href*='#']") : null;
    const hash = link?.getAttribute("href")?.split("#")[1];
    if (hash && Object.prototype.hasOwnProperty.call(LOADERS, hash)) void load(hash as IslandName).catch(() => null);
  };
  for (const type of ["pointerover", "focusin", "pointerdown"]) {
    document.addEventListener(type, onIntent, { capture: true, passive: true });
  }
}

const gates = new Map<string, Promise<void>>();

/** Resolves once #id is within `margin` of the viewport. One promise (and one observer) per section and margin. */
function near(id: string, margin: string): Promise<void> {
  const key = `${id} ${margin}`;
  const existing = gates.get(key);
  if (existing) return existing;
  const gate = new Promise<void>((resolve) => {
    const section = document.getElementById(id);
    if (!section || typeof IntersectionObserver === "undefined") {
      resolve();
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        resolve();
      },
      { rootMargin: margin },
    );
    observer.observe(section);
  });
  gates.set(key, gate);
  return gate;
}

const EMPTY = { __html: "" };
const noop = () => () => {};

/**
 * true while React is hydrating prerendered HTML (the server snapshot is only used then), false on a
 * fresh client render, such as arriving at the book from a legal page by client-side navigation,
 * where there is no server HTML to keep and the island simply renders in place.
 */
function useHydrating(): boolean {
  return useSyncExternalStore(
    noop,
    () => false,
    () => true,
  );
}

/**
 * The same islands as lazy components, for rendering in place: on the server (where the prerender waits
 * for the import, so the spread is written inline) and on a fresh client render. Hydration uses load().
 */
const LAZY: Record<IslandName, ComponentType> = {
  compose: lazy(() => load("compose").then((Component) => ({ default: Component }))),
  provenance: lazy(() => load("provenance").then((Component) => ({ default: Component }))),
  commission: lazy(() => load("commission").then((Component) => ({ default: Component }))),
};

/**
 * `section`: the chapter's id, watched for nearness, and the island it holds. `margin`: how far ahead
 * to hydrate (default half a screen). The wrapper box is display: contents, so layout is unchanged.
 */
export function Island({ section, margin = "50% 0px" }: { section: IslandName; margin?: string }) {
  const box = useRef<HTMLDivElement>(null);
  // Decided once, at the first render: later renders (and the post-hydration re-check) keep it.
  const hydrating = useHydrating();
  const [deferred] = useState(hydrating);

  useEffect(() => {
    const container = box.current;
    if (!deferred || !container) return;
    let live = true;
    // Fetch the chunk a little before it is needed (or on a link's intent), then hydrate once the chapter is close.
    watchIntent();
    void near(section, "150% 0px").then(() => load(section).catch(() => null));
    near(section, margin)
      .then(() => load(section))
      .then(
        (Component) => {
          // Once per box (StrictMode re-runs effects in development).
          if (!live || container.dataset.island === "live") return;
          container.dataset.island = "live";
          hydrateRoot(container, <Component />);
        },
        // If the chunk fails to load, the server-rendered spread stays as it is: readable, not interactive.
        () => {},
      );
    return () => {
      live = false;
    };
  }, [deferred, section, margin]);

  const Spread = LAZY[section];
  if (typeof window === "undefined") {
    // No Suspense boundary on the server: the prerender waits for the import and writes the spread
    // inline, with no fallback and no streamed swap.
    return (
      <div ref={box} data-island={section} style={{ display: "contents" }}>
        <Spread />
      </div>
    );
  }
  if (!deferred) {
    return (
      <div ref={box} data-island={section} style={{ display: "contents" }}>
        <Suspense fallback={null}>
          <Spread />
        </Suspense>
      </div>
    );
  }
  return (
    <div
      ref={box}
      data-island={section}
      style={{ display: "contents" }}
      dangerouslySetInnerHTML={EMPTY}
      suppressHydrationWarning
    />
  );
}
