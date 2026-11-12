// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

/*
 * The book's ornament: a botanical floral heart (a heart leaf with two curling tendrils and a bud),
 * drawn as SVG because the ❦ glyph isn't in the latin font subset. 24×16, decorative only.
 *
 * Server markup ships twice in a static export (HTML plus the RSC payload), so the drawing is defined
 * once per page as a <symbol> (FleuronSprite, fleuron-sprite.tsx, in the document shell) and every
 * Fleuron is a ~100-byte <use>.
 */
export const FLEURON_ID = "aeth-fleuron";

/** The fleuron itself. Brass by default via the global .bk-fleuron class; it paints in currentColor. */
export function Fleuron({ className }: { className?: string }) {
  return (
    <svg
      className={className ? `bk-fleuron ${className}` : "bk-fleuron"}
      width="24"
      height="16"
      viewBox="0 0 24 16"
      aria-hidden="true"
      focusable="false"
    >
      <use href={`#${FLEURON_ID}`} />
    </svg>
  );
}
