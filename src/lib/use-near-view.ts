// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { useEffect, useState, type RefObject } from "react";

/*
 * One IntersectionObserver per rootMargin, shared by every caller on the page, so twenty lazy
 * figures cost one observer, not twenty. Each target is unobserved the moment it first comes near.
 */
type Pool = { observer: IntersectionObserver; waiting: Map<Element, Set<() => void>> };
const pools = new Map<string, Pool>();

function poolFor(rootMargin: string): Pool {
  const existing = pools.get(rootMargin);
  if (existing) return existing;
  const waiting = new Map<Element, Set<() => void>>();
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const callbacks = waiting.get(entry.target);
        if (!callbacks) continue;
        waiting.delete(entry.target);
        observer.unobserve(entry.target);
        callbacks.forEach((callback) => callback());
      }
    },
    { rootMargin },
  );
  const pool = { observer, waiting };
  pools.set(rootMargin, pool);
  return pool;
}

function watch(target: Element, rootMargin: string, callback: () => void): () => void {
  const { observer, waiting } = poolFor(rootMargin);
  let callbacks = waiting.get(target);
  if (!callbacks) {
    callbacks = new Set();
    waiting.set(target, callbacks);
    observer.observe(target);
  }
  callbacks.add(callback);
  return () => {
    const current = waiting.get(target);
    if (!current) return;
    current.delete(callback);
    if (current.size === 0) {
      waiting.delete(target);
      observer.unobserve(target);
    }
  };
}

/**
 * One-shot: false on the server and until `ref`'s element first comes within `rootMargin` of the
 * viewport (default: one screen above or below), then true for good. Use it to defer work such as
 * applying layered renders or swapping a plate <img> for its inline SVG.
 */
export function useNearView(ref: RefObject<Element | null>, rootMargin = "100% 0px"): boolean {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const target = ref.current;
    if (near || !target) return;
    return watch(target, rootMargin, () => setNear(true));
  }, [ref, rootMargin, near]);
  return near;
}
