"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { FLEURON_ID } from "./fleuron";

/*
 * The fleuron's <symbol>, mounted once per page by BookDocument. A client component only so its path
 * data ships once, in the JS, not twice (HTML and the RSC payload of every page); it has no state and
 * no effects, and is server-rendered, so every <use> resolves from the first paint.
 */

export function FleuronSprite() {
  return (
    <svg
      width="0"
      height="0"
      aria-hidden="true"
      focusable="false"
      style={{ position: "absolute", overflow: "hidden" }}
    >
      <symbol id={FLEURON_ID} viewBox="0 0 24 16">
        <path
          fill="currentColor"
          d="M12 15.3C10.5 13.8 7.8 12 7.8 9.4 7.8 7.7 9 6.6 10.3 6.6c.8 0 1.4.4 1.7 1.1.3-.7.9-1.1 1.7-1.1 1.3 0 2.5 1.1 2.5 2.8 0 2.6-2.7 4.4-4.2 5.9ZM12 1c.9.6.9 1.6 0 2.2-.9-.6-.9-1.6 0-2.2ZM1.2 10.6c.9-1.2 2.3-1.3 3.2-.4-1.1 1-2.4 1.1-3.2.4Zm21.6 0c-.9-1.2-2.3-1.3-3.2-.4 1.1 1 2.4 1.1 3.2.4Z"
        />
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.05"
          strokeLinecap="round"
          d="M11.7 7.3C11 4.6 8.2 3.3 5.6 4.3c-2 .8-2.3 3.3-.6 3.9 1.2.4 1.9-.7 1.3-1.4m6 .5c.7-2.7 3.5-4 6.1-3 2 .8 2.3 3.3.6 3.9-1.2.4-1.9-.7-1.3-1.4M12 7.6V2.2"
        />
        {/* White gouache heightening on the heart's lit shoulder, as on a study drawn on toned paper. */}
        <path
          fill="none"
          strokeWidth=".7"
          strokeLinecap="round"
          style={{ stroke: "var(--color-gouache)" }}
          d="M8.7 9.2c.1-.9.7-1.6 1.5-1.7"
        />
      </symbol>
    </svg>
  );
}
