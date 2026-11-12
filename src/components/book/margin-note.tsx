// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import type { ReactNode } from "react";

/**
 * A note in the margin: where this book puts its figures, instead of stat cells. An optional figure
 * set large in Cormorant ("180 days"), then a small italic line. Styled by the global .bk-note class;
 * `side` (data-side) right-aligns a left-margin note towards the spine from 640px up. Placing it in
 * the outer margin at 1280px+ is the chapter's job (pass a className).
 *
 * `signed` turns it into the maker's own note: her name in the display italic under the line, and
 * `signedRole` in small type beneath ("perfumer, Grasse"). A name and a hand, never a testimonial.
 */
export function MarginNote({
  figure,
  side,
  signed,
  signedRole,
  className,
  children,
}: {
  figure?: string;
  side?: "left" | "right";
  signed?: string;
  signedRole?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <aside className={className ? `bk-note ${className}` : "bk-note"} data-side={side}>
      {figure ? <b>{figure}</b> : null}
      {children}
      {signed ? (
        <span className="bk-note-sign">
          {signed}
          {signedRole ? <small>{signedRole}</small> : null}
        </span>
      ) : null}
    </aside>
  );
}
