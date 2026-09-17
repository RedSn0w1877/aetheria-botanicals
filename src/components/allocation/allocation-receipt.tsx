"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { MoveRight } from "lucide-react";
import { EASE_PETAL, EASE_SILK } from "@/lib/motion";
import { FlaconSilhouette } from "./flacon-silhouette";
import { MonogramTag } from "./monogram-tag";
import { vesselById, type VesselId } from "./vessels";

export type AllocationReceipt = {
  reference: string;
  name: string;
  vessel: VesselId;
  monogram: string;
  note?: string;
};

type AllocationReceiptProps = {
  receipt: AllocationReceipt;
  /** True when the visitor closed the drawer after confirming and has come back. */
  returning: boolean;
  onStartNew: () => void;
  onLeave: () => void;
};

/**
 * The confirmation page of the ledger. The reference number pops in character by
 * character; the vessel draws itself; focus lands on the heading so screen reader
 * users hear the outcome straight away.
 */
export function AllocationReceiptView({ receipt, returning, onStartNew, onLeave }: AllocationReceiptProps) {
  const reduce = useReducedMotion();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const vessel = vesselById(receipt.vessel);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-rosemary/65">
            {returning ? "Already in the ledger" : "Entered in the ledger"}
          </p>
          <h3
            ref={headingRef}
            tabIndex={-1}
            data-autofocus
            className="mt-4 font-serif text-[clamp(2.1rem,7vw,3.2rem)] font-light italic leading-[1.02] tracking-tight text-rosemary focus:outline-none"
          >
            Your request is in the ledger.
          </h3>
          {returning ? (
            <p className="mt-4 text-[14px] font-light leading-relaxed text-rosemary/70">
              You entered this request earlier in your visit. It stays here until you start a new one.
            </p>
          ) : null}
        </div>
        <FlaconSilhouette vessel={receipt.vessel} draw className="h-28 w-auto shrink-0 sm:h-32" />
      </div>

      <dl className="border-t border-hairline">
        <Row label="Reference">
          <span className="sr-only">{receipt.reference}</span>
          <span aria-hidden className="inline-flex font-serif text-3xl font-light tracking-[0.06em] text-rosemary">
            {receipt.reference.split("").map((char, i) => (
              <span key={`${char}-${i}`} className="inline-block overflow-hidden pb-[0.08em]">
                <motion.span
                  className="inline-block"
                  initial={reduce ? false : { y: "90%", opacity: 0, scale: 0.7 }}
                  animate={{ y: "0%", opacity: 1, scale: 1 }}
                  transition={{ duration: 0.9, ease: EASE_PETAL, delay: 0.35 + i * 0.05 }}
                >
                  {char === "-" ? "‑" : char}
                </motion.span>
              </span>
            ))}
          </span>
        </Row>
        <Row label="Name in the ledger">
          <span className="break-words font-serif text-xl text-rosemary">{receipt.name}</span>
        </Row>
        <Row label="Vessel">
          <span className="font-serif text-xl text-rosemary">
            {vessel.volume} <span className="italic text-rosemary/70">{vessel.name}</span>
          </span>
        </Row>
        {receipt.note ? (
          <Row label="Composition">
            <span className="font-serif text-lg italic leading-snug text-rosemary">{receipt.note}</span>
          </Row>
        ) : null}
        <Row label="Monogram">
          {receipt.monogram ? (
            <span className="flex items-center gap-4">
              <span className="font-serif text-xl tracking-[0.3em] text-rosemary">{receipt.monogram}</span>
              <MonogramTag letters={receipt.monogram} className="w-32" />
            </span>
          ) : (
            <span className="font-serif text-xl italic text-rosemary/60">Left unstamped</span>
          )}
        </Row>
      </dl>

      <motion.div
        className="border border-hairline bg-herb/60 px-5 py-4"
        initial={reduce ? false : { y: 12 }}
        animate={{ y: 0 }}
        transition={{ duration: 1.1, ease: EASE_SILK, delay: 0.6 }}
      >
        <p className="font-serif text-lg italic text-rosemary">Concept site: nothing was sent anywhere.</p>
        <p className="mt-1 text-[13px] font-light leading-relaxed text-rosemary/70">
          Your details stayed in this browser tab and disappear when you leave.{" "}
          <Link
            href="/legal/privacy"
            onClick={onLeave}
            className="inline-flex min-h-[44px] items-center gap-2 text-rosemary underline decoration-brass underline-offset-4 transition-colors duration-500 hover:text-terracotta"
          >
            Read the privacy note
            <MoveRight aria-hidden className="h-3.5 w-3.5" strokeWidth={1.25} />
          </Link>
        </p>
      </motion.div>

      <button
        type="button"
        onClick={onStartNew}
        className="group relative flex min-h-14 w-full items-center justify-center gap-4 overflow-hidden border border-brass/70 px-6 py-4 font-sans text-[11px] uppercase tracking-[0.34em] text-rosemary transition-colors duration-700 hover:bg-rosemary hover:text-linen"
      >
        Start a new request
      </button>
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-hairline py-4 sm:grid-cols-[9rem_minmax(0,1fr)] sm:items-baseline sm:gap-6">
      <dt className="font-sans text-[10px] uppercase tracking-[0.3em] text-rosemary/65">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}
