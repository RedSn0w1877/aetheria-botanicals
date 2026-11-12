// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { ChapterIndex } from "@/components/book/chapter-index";
import { Colophon } from "@/components/book/colophon";
import { Contents } from "@/components/book/contents";
import { InkObserver } from "@/components/book/ink-observer";
import { CommissionChapter } from "@/components/chapters/commission";
import { ComposeChapter } from "@/components/chapters/compose";
import { FrontispieceChapter } from "@/components/chapters/frontispiece";
import { ProvenanceChapter } from "@/components/chapters/provenance";
import { RitualChapter } from "@/components/chapters/ritual";

/**
 * The book: a frontispiece, four chapters and a colophon, read top to bottom with native scroll.
 * Server-rendered editorial with a few client islands; the Contents sheet is a native <dialog>.
 * InkObserver goes last so it runs once everything above it has hydrated.
 */
export default function BookPage() {
  return (
    <>
      <a href="#frontispiece-title" className="bk-skip">
        Skip to the book
      </a>
      <ChapterIndex />
      <Contents />
      <main id="main">
        <FrontispieceChapter />
        <ComposeChapter />
        <ProvenanceChapter />
        <RitualChapter />
        <CommissionChapter />
      </main>
      <Colophon />
      <InkObserver />
    </>
  );
}
