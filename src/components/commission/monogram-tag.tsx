// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import s from "./commission.module.css";

/** "HV" → "H · V": how the book writes a monogram. */
export function spacedMonogram(letters: string): string {
  return letters.split("").join(" · ");
}

/**
 * The brass luggage tag that hangs beside the letter and letters itself as the visitor types their
 * initials: a flat parchment-brass tag (#F1E7CF with a 1px brass edge and a punched eyelet), tilted
 * a few degrees, with the letters debossed in Cormorant italic.
 *
 * Each change of letters remounts the letters (key), which replays a single 300ms CSS press, so no
 * effect and no timer is involved; the initial, empty tag never animates. Decorative: the initials
 * are already in the letter's own blank.
 */
export function MonogramTag({ letters, className }: { letters: string; className?: string }) {
  const empty = letters.length === 0;
  return (
    <div className={className ? `${s.tag} ${className}` : s.tag} aria-hidden="true">
      <div className={s.tagBody}>
        <span className={s.tagEyelet} />
        <span
          key={letters}
          className={s.tagLetters}
          data-count={empty ? 2 : letters.length}
          data-press={empty ? undefined : ""}
          data-ghost={empty ? "" : undefined}
        >
          {empty ? "A · E" : spacedMonogram(letters)}
        </span>
        <span className={s.tagCaption}>lettered in brass</span>
      </div>
    </div>
  );
}
