"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { useCallback, useEffect, useRef, useState, type FocusEvent, type MouseEvent } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
} from "motion/react";
import { MobileSheet } from "@/components/nav/mobile-sheet";
import { NAV_LINKS, UNLINKED_SECTIONS } from "@/components/nav/nav-links";
import { useActiveSection } from "@/components/nav/use-active-section";
import { useGlide } from "@/components/providers/lenis-provider";
import { openAllocation } from "@/lib/allocation-store";
import { EASE_SILK } from "@/lib/motion";

const SHEET_ID = "site-menu";
const HIDE_AFTER = 200;
const DESKTOP_QUERY = "(min-width: 768px)";

/**
 * The fixed header.
 *
 * - Solid linen, gaining a hairline rule and condensing slightly once the page moves.
 * - Tucks away while reading downward past 200px, returns on any upward scroll, and
 *   always stays put while it holds keyboard focus or the menu is open.
 * - A brass hairline (shared `layoutId`) glides between links as sections pass the
 *   reading line; a terracotta hairline along the bottom edge tracks page progress.
 *
 * Every piece of state starts identical on server and client and only changes inside
 * scroll, observer, or input callbacks.
 */
export function SiteNav() {
  const glide = useGlide();
  const reduce = useReducedMotion();
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 28, mass: 0.6, restDelta: 0.0005 });

  const [scrolled, setScrolled] = useState(false);
  const [tucked, setTucked] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const active = useActiveSection(
    NAV_LINKS.map((link) => link.id),
    UNLINKED_SECTIONS,
  );

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? latest;
    setScrolled(latest > 24);
    if (latest < HIDE_AFTER) setTucked(false);
    else if (latest > previous + 4) setTucked(true);
    else if (latest < previous - 4) setTucked(false);
  });

  // A reload can land mid-page without any scroll event; sync once on the next frame.
  useEffect(() => {
    const frame = requestAnimationFrame(() => setScrolled(window.scrollY > 24));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Freeze the page behind the sheet, and close the sheet if the viewport grows to desktop.
  useEffect(() => {
    if (!menuOpen) return;
    glide.hold();
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const onChange = () => {
      if (desktop.matches) setMenuOpen(false);
    };
    desktop.addEventListener("change", onChange);
    return () => {
      desktop.removeEventListener("change", onChange);
      glide.release();
    };
  }, [menuOpen, glide]);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    glide.release();
    requestAnimationFrame(() => menuButtonRef.current?.focus({ preventScroll: true }));
  }, [glide]);

  const navigateFromSheet = useCallback(
    (id: string) => {
      closeMenu();
      glide.glideTo(`#${id}`);
    },
    [closeMenu, glide],
  );

  const allocateFromSheet = useCallback(() => {
    setMenuOpen(false);
    glide.release();
    openAllocation();
  }, [glide]);

  const onLinkClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    glide.glideTo(`#${id}`);
  };

  const onBlurCapture = (event: FocusEvent<HTMLElement>) => {
    const next = event.relatedTarget;
    if (!(next instanceof Node) || !event.currentTarget.contains(next)) setFocusWithin(false);
  };

  const hidden = tucked && !menuOpen && !focusWithin;
  const settle = reduce ? { duration: 0 } : { duration: 0.9, ease: EASE_SILK };

  return (
    <>
      <motion.header
        className={`fixed inset-x-0 top-0 z-50 border-b bg-linen transition-colors duration-700 ${
          scrolled ? "border-hairline" : "border-transparent"
        }`}
        initial={false}
        animate={{ y: hidden ? "-101%" : "0%" }}
        transition={settle}
        onFocusCapture={() => setFocusWithin(true)}
        onBlurCapture={onBlurCapture}
      >
        <div
          className={`mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 transition-[height] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] sm:px-8 lg:px-12 ${
            scrolled ? "h-16" : "h-[4.5rem] lg:h-20"
          }`}
        >
          <button
            type="button"
            onClick={() => glide.glideTo(0, { offset: 0 })}
            aria-label="Aetheria Botanicals, back to the top"
            className="group flex min-h-11 min-w-0 items-baseline gap-2.5 text-rosemary"
          >
            <span
              className={`font-serif font-light italic leading-none tracking-tight transition-[font-size] duration-700 ${
                scrolled ? "text-[1.6rem]" : "text-[1.75rem] lg:text-[2rem]"
              }`}
            >
              Aetheria
            </span>
            <span className="font-sans text-[9px] uppercase tracking-[0.42em] text-rosemary/60 transition-colors duration-500 group-hover:text-terracotta">
              Botanicals
            </span>
          </button>

          <nav aria-label="Primary" className="hidden md:block">
            <LayoutGroup id="site-nav">
              <ul className="flex items-center gap-1 lg:gap-4">
                {NAV_LINKS.map((link) => {
                  const isActive = active === link.id;
                  return (
                    <li key={link.id}>
                      <a
                        href={`#${link.id}`}
                        aria-current={isActive ? "location" : undefined}
                        onClick={(event) => onLinkClick(event, link.id)}
                        className={`group relative inline-flex h-11 items-center px-3 font-sans text-[10px] uppercase tracking-[0.3em] transition-colors duration-500 hover:text-rosemary ${
                          isActive ? "text-rosemary" : "text-rosemary/65"
                        }`}
                      >
                        <span aria-hidden className="mr-2 font-serif text-[13px] normal-case italic tracking-normal text-brass">
                          {link.folio}
                        </span>
                        {link.label}
                        {isActive ? (
                          <motion.span
                            aria-hidden
                            layoutId="nav-active-rule"
                            className="absolute inset-x-3 bottom-1.5 h-px bg-brass"
                            transition={reduce ? { duration: 0 } : { duration: 1, ease: EASE_SILK }}
                          />
                        ) : (
                          <span
                            aria-hidden
                            className="absolute inset-x-3 bottom-1.5 h-px origin-left scale-x-0 bg-rosemary/25 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
                          />
                        )}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </LayoutGroup>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => openAllocation()}
              className="hidden h-11 items-center border border-brass/70 px-5 font-sans text-[10px] uppercase tracking-[0.3em] text-rosemary transition-colors duration-700 hover:bg-rosemary hover:text-linen sm:inline-flex"
            >
              Request allocation
            </button>
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-controls={SHEET_ID}
              aria-haspopup="dialog"
              className="-mr-2 inline-flex h-11 min-w-11 items-center justify-center gap-3 px-2 text-rosemary md:hidden"
            >
              <span className="font-sans text-[10px] uppercase tracking-[0.3em]">Menu</span>
              <span aria-hidden className="flex w-6 flex-col gap-[5px]">
                <span className="h-px w-full bg-rosemary" />
                <span className="h-px w-2/3 self-end bg-brass" />
              </span>
            </button>
          </div>
        </div>

        {/* Reading progress. */}
        <motion.div
          aria-hidden
          className="absolute inset-x-0 -bottom-px h-px origin-left bg-terracotta"
          style={{ scaleX: progress }}
        />
      </motion.header>

      <AnimatePresence>
        {menuOpen ? (
          <MobileSheet
            key="sheet"
            id={SHEET_ID}
            links={NAV_LINKS}
            active={active}
            onClose={closeMenu}
            onNavigate={navigateFromSheet}
            onAllocate={allocateFromSheet}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}
