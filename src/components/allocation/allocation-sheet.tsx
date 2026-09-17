"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { closeAllocation, useAllocation } from "@/lib/allocation-store";
import { COPYRIGHT_MARK } from "@/lib/copyright";
import { EASE_DRIFT, EASE_SILK } from "@/lib/motion";
import { useGlide } from "@/components/providers/lenis-provider";
import { AllocationForm, type AllocationDraft } from "./allocation-form";
import { AllocationReceiptView, type AllocationReceipt } from "./allocation-receipt";
import { ledgerReference } from "./ledger-reference";
import { releasePetals } from "./petal-confetti";
import { BATCH, DEFAULT_VESSEL } from "./vessels";

type Phase = "form" | "pending" | "done";

const EMPTY_DRAFT: AllocationDraft = { name: "", email: "", vessel: DEFAULT_VESSEL, monogram: "" };
const PENDING_MS = 1400;

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** A damped spring: heavy, slow to settle, never overshoots. */
const SHEET_SPRING = { type: "spring", stiffness: 58, damping: 19, mass: 1.1 } as const;

/**
 * The private allocation drawer. It lives at the page root and listens to the
 * allocation store, so any "Request an allocation" link on the page can open it.
 *
 * The form state is held here, outside the animated sheet, so closing the drawer
 * keeps what the visitor typed (and keeps a confirmed request on the ledger).
 */
export function AllocationSheet() {
  const { open, intent } = useAllocation();
  const { hold, release } = useGlide();
  const reduce = useReducedMotion();
  const titleId = useId();
  const descId = useId();
  const sheetRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);

  const [draft, setDraft] = useState<AllocationDraft>(EMPTY_DRAFT);
  const [phase, setPhase] = useState<Phase>("form");
  const [receipt, setReceipt] = useState<AllocationReceipt | null>(null);
  const [returning, setReturning] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Clean up a pending request if the whole page unmounts mid-press.
  useEffect(() => clearTimer, [clearTimer]);

  // While open: freeze the page, move focus inside, and hand focus back on close.
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    hold();
    const frame = window.requestAnimationFrame(() => {
      const sheet = sheetRef.current;
      if (!sheet) return;
      const target = sheet.querySelector<HTMLElement>("[data-autofocus]") ?? sheet.querySelector<HTMLElement>(FOCUSABLE) ?? sheet;
      target.focus({ preventScroll: true });
    });
    return () => {
      window.cancelAnimationFrame(frame);
      release();
      if (opener && opener.isConnected) opener.focus({ preventScroll: true });
    };
  }, [open, hold, release]);

  const dismiss = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimer();
      setPhase("form");
    }
    if (phase === "done") setReturning(true);
    closeAllocation();
  }, [clearTimer, phase]);

  const submit = useCallback(() => {
    if (timerRef.current !== null) return;
    const note = intent.note;
    const entry: AllocationReceipt = {
      reference: ledgerReference({ ...draft, note }),
      name: draft.name.trim(),
      vessel: draft.vessel,
      monogram: draft.monogram,
      note,
    };
    setPhase("pending");
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      setReceipt(entry);
      setReturning(false);
      setPhase("done");
      toast("Your request is in the ledger", {
        description: `Reference ${entry.reference}. Concept site: nothing was sent anywhere.`,
      });
      releasePetals();
    }, PENDING_MS);
  }, [draft, intent.note]);

  const startNew = useCallback(() => {
    clearTimer();
    setDraft(EMPTY_DRAFT);
    setReceipt(null);
    setReturning(false);
    setPhase("form");
    setFormKey((k) => k + 1);
  }, [clearTimer]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      dismiss();
      return;
    }
    if (event.key !== "Tab") return;
    const sheet = sheetRef.current;
    if (!sheet) return;
    const items = Array.from(sheet.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => el.getClientRects().length > 0,
    );
    if (items.length === 0) {
      event.preventDefault();
      sheet.focus();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && (active === first || active === sheet || !sheet.contains(active))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || !sheet.contains(active))) {
      event.preventDefault();
      first.focus();
    }
  };

  const showReceipt = phase === "done" && receipt !== null;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div key="allocation-layer" className="fixed inset-0 z-[70]" onKeyDown={onKeyDown}>
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-rosemary/40"
            onClick={dismiss}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.2 : 1.1, ease: EASE_DRIFT }}
          />
          <motion.div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            tabIndex={-1}
            className="absolute inset-y-0 right-0 flex h-[100dvh] w-full flex-col bg-parchment text-rosemary shadow-[-48px_0_96px_-48px_rgba(24,35,28,0.45)] focus:outline-none sm:w-[min(580px,94vw)] sm:border-l sm:border-hairline"
            initial={reduce ? { opacity: 0 } : { x: "100%" }}
            animate={reduce ? { opacity: 1 } : { x: "0%" }}
            exit={reduce ? { opacity: 0 } : { x: "100%", transition: { duration: 0.95, ease: EASE_DRIFT } }}
            transition={reduce ? { duration: 0.2 } : SHEET_SPRING}
          >
            {/* A brass hairline that draws down the sheet's leading edge as it arrives. */}
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 hidden w-px origin-top bg-brass/70 sm:block"
              initial={reduce ? false : { scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 2.2, ease: EASE_SILK, delay: 0.35 }}
            />

            <header className="shrink-0 px-6 pt-5 sm:px-10 sm:pt-7">
              <div className="flex items-center justify-between gap-4 border-b border-hairline pb-3">
                <p className="min-w-0 font-sans text-[10px] uppercase tracking-[0.32em] text-rosemary/65">
                  <span className="text-rosemary">Folio V</span>
                  <span aria-hidden className="mx-2 text-brass">
                    ·
                  </span>
                  Batch {BATCH.number} ledger
                </p>
                <button
                  type="button"
                  onClick={dismiss}
                  aria-label="Close the allocation drawer"
                  className="group -mr-3 grid h-11 w-11 shrink-0 place-items-center text-rosemary transition-colors duration-500 hover:text-terracotta"
                >
                  <X aria-hidden className="h-5 w-5 transition-transform duration-700 ease-out group-hover:rotate-90" strokeWidth={1} />
                </button>
              </div>
              <h2
                id={titleId}
                className="mt-6 font-serif text-[clamp(2.4rem,9vw,3.6rem)] font-light leading-[0.95] tracking-tight text-rosemary"
              >
                <span className="block overflow-hidden pb-[0.08em]">
                  <motion.span
                    className="block"
                    initial={reduce ? false : { y: "105%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 1.4, ease: EASE_SILK, delay: 0.2 }}
                  >
                    Request an <em className="font-light text-terracotta">allocation</em>
                  </motion.span>
                </span>
              </h2>
              <p id={descId} className="mt-3 max-w-md pb-6 text-[14px] font-light leading-relaxed text-rosemary/70">
                {BATCH.flacons} flacons from Batch {BATCH.number}, allocated in the order requests arrive. No payment is
                taken here.
              </p>
            </header>

            <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-12 pt-2 sm:px-10">
              <AnimatePresence mode="wait" initial={false}>
                {showReceipt ? (
                  <motion.div
                    key={`receipt-${receipt.reference}`}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, y: -16 }}
                    transition={{ duration: 0.9, ease: EASE_SILK }}
                  >
                    <AllocationReceiptView
                      receipt={receipt}
                      returning={returning}
                      onStartNew={startNew}
                      onLeave={dismiss}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key={`form-${formKey}`}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, y: -16, filter: "blur(4px)" }}
                    transition={{ duration: 0.8, ease: EASE_SILK }}
                  >
                    <AllocationForm
                      draft={draft}
                      onChange={(patch) => setDraft((current) => ({ ...current, ...patch }))}
                      onSubmit={submit}
                      pending={phase === "pending"}
                      note={intent.note}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <footer className="shrink-0 border-t border-hairline px-6 py-3 sm:px-10">
              <p className="select-none font-sans text-[9px] uppercase tracking-[0.32em] text-rosemary/50">
                {COPYRIGHT_MARK} · Concept site · Nothing is sent
              </p>
            </footer>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
