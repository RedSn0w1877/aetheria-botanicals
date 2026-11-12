"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { useEffect, useRef } from "react";
import s from "./book.module.css";
import { CHAPTER_IDS, CHAPTERS } from "./chapters";
import { useActiveSection } from "./use-active-section";

/**
 * The thumb-cut chapter index, like the tabs cut into a dictionary's fore-edge.
 *
 * - From 1024px: six herb tabs fixed to the right edge, mostly off-screen. The current chapter's tab
 *   steps out and turns sanguine (aria-current); keyboard focus, or hover with a real pointer, slides a
 *   tab out to show the chapter's name.
 *   Only transforms animate.
 * - Below 1024px: no fixed bar. A small "Contents" button docks bottom-left once the frontispiece has
 *   scrolled away.
 *
 * It also carries the Contents dialog's two scripted behaviours: closing it when one of its entries is
 * followed, and opening/closing it in browsers that don't support invoker commands yet.
 */
export function ChapterIndex() {
  // Null until the observer first reports; the book opens on the frontispiece, so show I as current.
  const active = useActiveSection(CHAPTER_IDS) ?? CHAPTERS[0].id;
  const dock = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // The docked Contents button only appears after the frontispiece. One observer, attribute only:
    // no React state, so scrolling never re-renders this component.
    const button = dock.current;
    const frontispiece = document.getElementById("frontispiece");
    let observer: IntersectionObserver | undefined;
    if (button && frontispiece) {
      observer = new IntersectionObserver(([entry]) => {
        button.toggleAttribute("data-show", !entry.isIntersecting);
      });
      observer.observe(frontispiece);
    }

    const invokersAreNative = "commandForElement" in HTMLButtonElement.prototype;
    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;

      // Following an entry closes the dialog first, then the browser makes the anchor jump.
      const link = event.target.closest('a[href^="#"]');
      if (link) {
        const contents = document.getElementById("contents");
        if (contents instanceof HTMLDialogElement && contents.open && contents.contains(link)) contents.close();
        return;
      }

      if (invokersAreNative) return;
      const invoker = event.target.closest("button[commandfor]");
      if (!invoker) return;
      const dialog = document.getElementById(invoker.getAttribute("commandfor") ?? "");
      if (!(dialog instanceof HTMLDialogElement)) return;
      const command = invoker.getAttribute("command");
      if (command === "show-modal" && !dialog.open) dialog.showModal();
      else if (command === "close" && dialog.open) dialog.close();
    };
    document.addEventListener("click", onClick);

    return () => {
      observer?.disconnect();
      document.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <>
      <nav aria-label="Chapters" data-print="hide" className={s.index}>
        <ol className={s.indexList}>
          {CHAPTERS.map((chapter) => (
            <li key={chapter.id}>
              <a
                href={`#${chapter.id}`}
                className={s.tab}
                aria-current={active === chapter.id ? "location" : undefined}
              >
                <span className={s.tabNumeral}>{chapter.numeral}</span>
                <span className="bk-sr"> · </span>
                <span className={s.tabTitle}>{chapter.tab}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
      <button
        ref={dock}
        type="button"
        commandfor="contents"
        command="show-modal"
        className={s.dock}
        data-print="hide"
      >
        {/* A closed book seen from its fore-edge: three ruled leaves. Compact, so it never sits over captions. */}
        <svg className={s.dockGlyph} viewBox="0 0 20 20" aria-hidden="true">
          <path d="M3 4.5h14M3 10h14M3 15.5h9" />
        </svg>
        <span className="bk-sr">Contents</span>
      </button>
    </>
  );
}
