// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import type { CSSProperties } from "react";

/** Two full turns of the dial, so every digit (even 0) visibly rolls into place. */
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
const CELL_EM = 1.2;

/**
 * An odometer-style figure. Each digit is a column of numerals whose resting position
 * is written inline, and a CSS keyframe rolls it up from zero. Because the final
 * position is the element's own style, the right number shows even with no JS and
 * with reduced motion. Screen readers get the plain value.
 */
export function RollingNumber({ value, delay = 0, className }: { value: string; delay?: number; className?: string }) {
  const chars = value.split("");
  return (
    <span className={`relative inline-flex tabular-nums ${className ?? ""}`}>
      <span className="sr-only">{value}</span>
      <span aria-hidden className="inline-flex">
        {chars.map((char, index) => {
          const digit = Number.parseInt(char, 10);
          if (Number.isNaN(digit)) {
            return (
              <span key={`${char}-${index}`} className="inline-block" style={{ lineHeight: `${CELL_EM}em` }}>
                {char}
              </span>
            );
          }
          const style = {
            transform: `translate3d(0, ${-(10 + digit) * CELL_EM}em, 0)`,
            "--ae-delay": `${(delay + index * 0.14).toFixed(2)}s`,
          } as CSSProperties;
          return (
            <span
              key={`${char}-${index}`}
              className="inline-block overflow-hidden"
              style={{ height: `${CELL_EM}em`, lineHeight: `${CELL_EM}em` }}
            >
              <span className="ae-roll flex flex-col" style={style}>
                {DIGITS.map((n, row) => (
                  <span key={row} className="block text-center" style={{ height: `${CELL_EM}em` }}>
                    {n}
                  </span>
                ))}
              </span>
            </span>
          );
        })}
      </span>
    </span>
  );
}
