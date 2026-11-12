// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import type { ReactNode } from "react";
import s from "@/components/book/book.module.css";
import { Colophon } from "@/components/book/colophon";
import { Masthead } from "@/components/book/masthead";
import { FICTION_NOTICE } from "@/lib/copyright";

export type LegalClause = { heading: string; body: ReactNode };

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

/**
 * Terms and Privacy, set as pages at the back of the book ("Notes on terms", "Notes on privacy"):
 * the masthead with a way back, one centred title, the fiction notice, then clauses numbered with
 * italic roman numerals, and the colophon. Server-rendered; no client JS.
 */
export function LegalPage({ title, revised, clauses }: { title: string; revised: string; clauses: LegalClause[] }) {
  return (
    <>
      <Masthead variant="notes" />
      <main id="main" className={s.notes}>
        <article className="bk-measure">
          <h1 className={s.notesTitle}>{title}</h1>
          <p className={`bk-label ${s.notesRevised}`}>last revised {revised}</p>
          <p className={s.notesFiction}>{FICTION_NOTICE}</p>
          <ol className={s.clauses}>
            {clauses.map((clause, i) => (
              <li key={clause.heading}>
                <h2 className={s.clauseHeading}>
                  <span className={s.clauseNumeral}>{ROMAN[i] ?? i + 1}</span>{" "}
                  {clause.heading}
                </h2>
                <div className={s.clauseBody}>{clause.body}</div>
              </li>
            ))}
          </ol>
        </article>
      </main>
      <Colophon variant="notes" />
    </>
  );
}
