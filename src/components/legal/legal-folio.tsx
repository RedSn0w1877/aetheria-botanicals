// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import Link from "next/link";
import type { ReactNode } from "react";
import { MoveLeft } from "lucide-react";
import { MonographFooter } from "@/components/MonographFooter";
import { FICTION_NOTICE } from "@/lib/copyright";

export type LegalClause = { heading: string; body: ReactNode };

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

/** Shared layout for Terms and Privacy: one typeset column, clauses numbered in roman. */
export function LegalFolio({ title, updated, clauses }: { title: string; updated: string; clauses: LegalClause[] }) {
  return (
    <>
      <main className="mx-auto max-w-2xl px-6 pb-28 pt-16 md:px-10">
        <Link
          href="/"
          className="inline-flex items-center gap-3 font-sans text-[10px] uppercase tracking-[0.32em] text-rosemary/60 transition-colors duration-500 hover:text-terracotta"
        >
          <MoveLeft aria-hidden className="h-3.5 w-3.5" strokeWidth={1.25} />
          Return to the atelier
        </Link>
        <h1 className="mt-14 font-serif text-5xl font-light italic tracking-tight text-rosemary md:text-6xl">{title}</h1>
        <p className="mt-4 font-sans text-[10px] uppercase tracking-[0.32em] text-rosemary/50">Last revised {updated}</p>
        <p className="mt-8 border-t border-b border-hairline py-5 font-serif text-lg italic leading-relaxed text-rosemary/75">
          {FICTION_NOTICE}
        </p>
        <div className="mt-14 flex flex-col gap-12">
          {clauses.map((clause, i) => (
            <section key={clause.heading} className="border-t border-hairline pt-7">
              <h2 className="flex items-baseline gap-4 font-serif text-2xl italic text-rosemary">
                <span className="font-sans text-[10px] not-italic uppercase tracking-[0.3em] text-brass">
                  {ROMAN[i] ?? i + 1}
                </span>
                {clause.heading}
              </h2>
              <div className="mt-4 space-y-4 text-[15px] font-light leading-[1.85] text-rosemary/75">{clause.body}</div>
            </section>
          ))}
        </div>
      </main>
      <MonographFooter />
    </>
  );
}
