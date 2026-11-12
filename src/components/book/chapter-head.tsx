// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import type { ReactNode } from "react";
import s from "./book.module.css";
import { Fleuron } from "./fleuron";

export type ChapterHeadProps = {
  /** The chapter's section id. The heading gets `${id}-title`, for the section's aria-labelledby. */
  id: string;
  /** Roman numeral, e.g. "II". */
  numeral: string;
  title: string;
  /** Plain-language lead, set in the 42rem measure. A string becomes a <p>. */
  lead?: ReactNode;
  /** One italic line in moss under the lead. */
  aside?: ReactNode;
};

/**
 * A chapter opener, centred on the spine: the italic numeral, a brass fleuron rule, the title,
 * then the lead and an optional aside. Pure markup, usable from server or client components.
 * On a .bk-night chapter the numeral turns light brass and the aside night-dim.
 */
export function ChapterHead({ id, numeral, title, lead, aside }: ChapterHeadProps) {
  return (
    <header className={s.head}>
      <span className={s.headNumeral} aria-hidden="true">
        {numeral}
      </span>
      <span className={s.headRule} aria-hidden="true">
        <Fleuron />
      </span>
      <h2 id={`${id}-title`} className={s.headTitle}>
        {title}
      </h2>
      {typeof lead === "string" ? (
        <p className={`bk-measure ${s.headLead}`}>{lead}</p>
      ) : lead ? (
        <div className={`bk-measure ${s.headLead}`}>{lead}</div>
      ) : null}
      {aside ? <p className={s.headAside}>{aside}</p> : null}
    </header>
  );
}
