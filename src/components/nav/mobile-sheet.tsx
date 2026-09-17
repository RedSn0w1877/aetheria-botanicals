"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import { BrassLink } from "@/components/ui/brass-link";
import { COPYRIGHT_MARK } from "@/lib/copyright";
import { EASE_SILK } from "@/lib/motion";
import type { NavLink } from "./nav-links";

const LEDGER = [
  { term: "Atelier", value: "Grasse, Alpes-Maritimes" },
  { term: "Coordinates", value: "43.6589° N · 6.9237° E" },
  { term: "Cellar", value: "12 °C, unlit" },
  { term: "Current batch", value: "No. 019 · Autumn" },
] as const;

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

type MobileSheetProps = {
  id: string;
  links: readonly NavLink[];
  active: string | null;
  onClose: () => void;
  onNavigate: (id: string) => void;
  onAllocate: () => void;
};

/**
 * Full-screen linen sheet for small screens. It is a modal dialog: focus moves in on
 * open, Tab wraps inside it, Escape closes it. The parent returns focus to the menu
 * button and handles scroll locking.
 */
export function MobileSheet({ id, links, active, onClose, onNavigate, onAllocate }: MobileSheetProps) {
  const reduce = useReducedMotion();
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const trapFocus = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return;
    const sheet = sheetRef.current;
    if (!sheet) return;
    const items = Array.from(sheet.querySelectorAll<HTMLElement>(FOCUSABLE));
    const first = items[0];
    const last = items[items.length - 1];
    if (!first || !last) return;
    const current = document.activeElement;
    if (event.shiftKey && (current === first || !sheet.contains(current))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (current === last || !sheet.contains(current))) {
      event.preventDefault();
      first.focus();
    }
  };

  const slow = (seconds: number, delay = 0) => (reduce ? { duration: 0 } : { duration: seconds, ease: EASE_SILK, delay });

  return (
    <motion.div
      ref={sheetRef}
      id={id}
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      onKeyDown={trapFocus}
      data-lenis-prevent
      className="fixed inset-0 z-[55] flex flex-col overflow-y-auto overscroll-contain bg-linen px-4 pb-8 pt-3 sm:px-8"
      initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
      animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
      exit={{ clipPath: "inset(0% 0% 100% 0%)", transition: slow(0.8) }}
      transition={slow(1.1)}
    >
      <div className="flex h-14 items-center justify-between border-b border-hairline">
        <p className="flex items-baseline gap-2.5">
          <span className="font-serif text-[1.65rem] font-light italic leading-none">Aetheria</span>
          <span className="font-sans text-[9px] uppercase tracking-[0.42em] text-rosemary/60">Botanicals</span>
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="-mr-2 inline-flex size-11 items-center justify-center text-rosemary transition-colors duration-500 hover:text-terracotta"
        >
          <X aria-hidden className="size-5" strokeWidth={1.1} />
        </button>
      </div>

      <nav aria-label="Sections" className="mt-10 flex-1">
        <p className="font-sans text-[10px] uppercase tracking-[0.34em] text-rosemary/55">The monograph</p>
        <ol className="mt-5 flex flex-col">
          {links.map((link, index) => {
            const isActive = active === link.id;
            return (
              <li key={link.id} className="overflow-hidden border-b border-hairline">
                <motion.a
                  href={`#${link.id}`}
                  aria-current={isActive ? "location" : undefined}
                  onClick={(event) => {
                    event.preventDefault();
                    onNavigate(link.id);
                  }}
                  className="group flex min-h-[4.5rem] items-baseline gap-4 py-3"
                  initial={reduce ? false : { y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={slow(1.1, 0.28 + index * 0.1)}
                >
                  <span className="w-8 shrink-0 font-sans text-[10px] uppercase tracking-[0.3em] text-brass">
                    {link.folio}
                  </span>
                  <span
                    className={`font-serif text-[clamp(2.5rem,12vw,3.75rem)] font-light italic leading-[1.05] tracking-tight transition-colors duration-500 group-hover:text-terracotta ${
                      isActive ? "text-terracotta" : "text-rosemary"
                    }`}
                  >
                    {link.label}
                  </span>
                </motion.a>
              </li>
            );
          })}
        </ol>

        <motion.div
          className="mt-10"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={slow(1.1, 0.65)}
        >
          <BrassLink onClick={onAllocate}>Request allocation</BrassLink>
        </motion.div>
      </nav>

      <motion.footer
        className="mt-12"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={slow(1.4, 0.8)}
      >
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-hairline pt-5">
          {LEDGER.map((row) => (
            <div key={row.term} className="min-w-0">
              <dt className="font-sans text-[9px] uppercase tracking-[0.32em] text-rosemary/55">{row.term}</dt>
              <dd className="mt-1 font-serif text-[15px] italic leading-snug text-rosemary">{row.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-8 font-sans text-[9px] uppercase tracking-[0.32em] text-rosemary/50">
          {COPYRIGHT_MARK} — Portfolio sample, do not redistribute
        </p>
      </motion.footer>
    </motion.div>
  );
}
