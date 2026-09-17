// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

/**
 * Pure-CSS motion for the hero.
 *
 * Entrance rises, digit rolls and the slow leaf drift are CSS keyframes rather than
 * JS animations, for two reasons: they run even if JavaScript never loads (so the copy
 * is never stranded at opacity 0), and transform keyframes run on the compositor.
 * Everything sits inside a `prefers-reduced-motion: no-preference` query, so reduced
 * motion users simply get the settled page.
 *
 * React 19 hoists a <style> that has `href` + `precedence` into <head> and dedupes it.
 */
const HERO_CSS = `
@media (prefers-reduced-motion: no-preference) {
  .ae-rise {
    animation: ae-rise 1.5s cubic-bezier(0.16, 1, 0.3, 1) both;
    animation-delay: var(--ae-delay, 0s);
  }
  .ae-roll {
    animation: ae-roll 2.6s cubic-bezier(0.16, 1, 0.3, 1) both;
    animation-delay: var(--ae-delay, 0s);
  }
  .ae-drift-a { animation: ae-drift-a 23s ease-in-out infinite alternate; }
  .ae-drift-b { animation: ae-drift-b 31s ease-in-out infinite alternate; }
  .ae-drift-c { animation: ae-drift-c 39s ease-in-out infinite alternate; }
  .ae-sweep { animation: ae-sweep 26s ease-in-out infinite alternate; }
  [data-paused="true"] .ae-drift-a,
  [data-paused="true"] .ae-drift-b,
  [data-paused="true"] .ae-drift-c,
  [data-paused="true"] .ae-sweep {
    animation-play-state: paused;
  }
}
@keyframes ae-rise {
  from { opacity: 0; transform: translate3d(0, 1.1rem, 0); }
}
@keyframes ae-roll {
  from { transform: translate3d(0, 0, 0); }
}
@keyframes ae-drift-a {
  from { transform: translate3d(-1.6%, -1.1%, 0) rotate(-1.4deg); }
  to { transform: translate3d(1.4%, 1.3%, 0) rotate(1.2deg); }
}
@keyframes ae-drift-b {
  from { transform: translate3d(1.2%, -0.8%, 0) rotate(0.9deg); }
  to { transform: translate3d(-1.5%, 1.1%, 0) rotate(-1.6deg); }
}
@keyframes ae-drift-c {
  from { transform: translate3d(-0.8%, 1.2%, 0) rotate(-0.6deg) scale(1.02); }
  to { transform: translate3d(1.1%, -1%, 0) rotate(0.8deg) scale(1); }
}
@keyframes ae-sweep {
  from { transform: translate3d(-22%, 0, 0); }
  to { transform: translate3d(22%, 0, 0); }
}
`;

/** When scripts are off, the masked headline words would stay tucked below their masks. */
const NOSCRIPT_CSS = `.ae-unfurl span { transform: none !important; }`;

export function HeroStyles() {
  return (
    <>
      <style href="aetheria-hero-motion" precedence="default">
        {HERO_CSS}
      </style>
      <noscript>
        <style>{NOSCRIPT_CSS}</style>
      </noscript>
    </>
  );
}
