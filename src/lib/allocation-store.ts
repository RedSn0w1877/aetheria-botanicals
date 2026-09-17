// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { useSyncExternalStore } from "react";

/**
 * Open/closed state for the private allocation drawer.
 *
 * The drawer is opened from several places (nav, hero, blender, footer), so the
 * state lives outside React in a tiny subscribable store. `useSyncExternalStore`
 * reads it safely during render and on the server (always closed there).
 */
export type AllocationIntent = {
  /** Optional context shown at the top of the drawer, e.g. the blend a visitor composed. */
  note?: string;
};

type Snapshot = { open: boolean; intent: AllocationIntent };

let snapshot: Snapshot = { open: false, intent: {} };
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((listener) => listener());

export function openAllocation(intent: AllocationIntent = {}) {
  snapshot = { open: true, intent };
  emit();
}

export function closeAllocation() {
  if (!snapshot.open) return;
  snapshot = { ...snapshot, open: false };
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const SERVER_SNAPSHOT: Snapshot = { open: false, intent: {} };

export function useAllocation() {
  return useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => SERVER_SNAPSHOT,
  );
}
