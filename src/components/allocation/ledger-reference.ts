// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { BATCH } from "./vessels";

/**
 * FNV-1a, 32-bit. A tiny, stable string hash: the same inputs always produce the
 * same ledger reference, so nothing random ever runs (and nothing is stored).
 */
function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

/** No 0/O, 1/I, 2/Z, 5/S or 8/B: easy to read aloud over the phone. */
const LEDGER_ALPHABET = "ACDEFGHJKLMNPQRTUVWXY34679";

export type LedgerInput = {
  name: string;
  email: string;
  vessel: string;
  monogram: string;
  note?: string;
};

/** A reference like AE-019-K7QD, derived only from what the visitor typed. */
export function ledgerReference({ name, email, vessel, monogram, note }: LedgerInput): string {
  const seed = [name.trim().toLowerCase(), email.trim().toLowerCase(), vessel, monogram, note ?? ""].join("|");
  let hash = fnv1a(seed);
  let code = "";
  for (let i = 0; i < 4; i += 1) {
    code += LEDGER_ALPHABET[hash % LEDGER_ALPHABET.length];
    hash = Math.floor(hash / LEDGER_ALPHABET.length);
  }
  return `AE-${BATCH.number}-${code}`;
}
