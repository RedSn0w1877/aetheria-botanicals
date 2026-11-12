"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { startTransition, useEffect, useRef, useState } from "react";
import s from "@/components/chapters/ritual.module.css";
import { withBase } from "@/lib/base-path";
import { useNearView } from "@/lib/use-near-view";
import { scrubMode } from "./ritual-progress";

/**
 * One ritual plate. The server renders the finished drawing as a lazy <img> of its static file, and
 * that is what no-JS, reduced motion, lite and short screens keep. In scrub mode, once the plate's
 * figure is within a screen and a half, the same file is fetched and set inline, where
 * ritual.module.css can rewind and redraw it from the scroll timeline. The swap is React state and the
 * first client render equals the server's <img>, so hydration always matches.
 *
 * The four plates are stacked on one stage, so they all come near together: plate I swaps at once and
 * the others follow one per idle period, each as a transition, so no single frame inserts all four.
 * The figure is watched rather than the <img>, because a plate waiting its turn is content-visibility:
 * hidden and its <img> has no box to intersect (and so never loads a throwaway copy either).
 */
export function PlateDrawing({ file, alt, order = 0 }: { file: string; alt: string; order?: number }) {
  const img = useRef<HTMLImageElement>(null);
  const figure = useRef<Element | null>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const src = withBase(`/plates/ritual/${file}`);

  // Declared before useNearView, so the figure is in place when its effect reads the ref.
  useEffect(() => {
    figure.current = img.current?.closest("figure") ?? img.current;
  }, []);
  const near = useNearView(figure, "150% 0px");

  useEffect(() => {
    if (!near || !scrubMode()) return;
    let current = true;
    let idle = 0;
    let timer = 0;
    const load = () =>
      fetch(src)
        .then((response) => (response.ok ? response.text() : null))
        .then((text) => {
          // Drop the <title> (inline, it would turn into a hover tooltip); the wrapper keeps the label.
          if (current && text) startTransition(() => setSvg(text.replace(/<title>[\s\S]*?<\/title>/, "")));
        })
        .catch(() => {});
    if (order === 0) load();
    else if (typeof window.requestIdleCallback === "function") idle = window.requestIdleCallback(load, { timeout: 400 * order });
    else timer = window.setTimeout(load, 250 * order);
    return () => {
      current = false;
      if (idle) window.cancelIdleCallback(idle);
      if (timer) window.clearTimeout(timer);
    };
  }, [near, src, order]);

  if (svg) return <div role="img" aria-label={alt} className={s.live} dangerouslySetInnerHTML={{ __html: svg }} />;
  return (
    <img
      ref={img}
      className={s.still}
      src={src}
      width={400}
      height={400}
      loading="lazy"
      decoding="async"
      fetchPriority="low"
      alt={alt}
    />
  );
}
