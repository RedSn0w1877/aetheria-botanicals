// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

/**
 * The lite flag and the `js` class, decided once before first paint.
 *
 * No "use client" on purpose: layout.tsx is a server component and inlines liteScript() as a
 * string at the top of <head>, and client islands read the same answer back from <html> at event
 * time. Nothing here touches the browser at import time.
 *
 * Aetheria's rule differs from the studio site's: this book has no WebGL, so a phone is a layout
 * concern, not a performance one. Only reduced motion, a small CPU (4 cores or fewer), little memory
 * (4 GB or less), data saver and slow networks make a device lite. Lite gets the reduced-motion
 * visuals (static ritual, no glint, no leaf parallax, drawings complete), but click-driven motion
 * (the page turn, the tint cross-fade, the seal press) still runs there.
 */

export const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
export const LITE_QUERIES = [REDUCED_MOTION] as const;

/** Four cores or fewer, or 4 GB or less, is a phone-class budget whatever the screen says. */
export const LITE_MAX_CORES = 4;
export const LITE_MAX_MEMORY_GB = 4;
export const LITE_SLOW_NETWORK = /^(slow-2g|2g|3g)$/;

/**
 * The pre-paint guess, a few hundred bytes. It runs while the HTML is still parsing, so CSS can
 * branch on html.js and html[data-lite] from the very first frame. Wrapped in try/catch: a browser
 * that cannot answer is treated as full.
 */
export function liteScript(): string {
  return (
    `(function(){var d=document.documentElement,n=navigator,c=n.connection||{};d.classList.add("js");` +
    `try{if(${JSON.stringify(LITE_QUERIES)}.some(function(q){return matchMedia(q).matches})` +
    `||(n.hardwareConcurrency>0&&n.hardwareConcurrency<=${LITE_MAX_CORES})` +
    `||n.deviceMemory<=${LITE_MAX_MEMORY_GB}` +
    `||c.saveData===true` +
    `||${LITE_SLOW_NETWORK}.test(c.effectiveType||""))d.setAttribute("data-lite","")}catch(e){}})()`
  );
}

/*
 * Event-time checks for client code. Call them inside effects and event handlers, never during
 * render: branching render output on them is what caused React error #418 before.
 */

/** true when liteScript marked this device lite. */
export function isLite(): boolean {
  return typeof document !== "undefined" && document.documentElement.hasAttribute("data-lite");
}

/** The visitor asked the operating system for less motion. */
export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia(REDUCED_MOTION).matches;
}

/**
 * Ambient motion (the glint, leaf parallax, scroll-drawn plates) may run: scripted page, not lite,
 * no reduced-motion request. Click-driven motion only checks prefersReducedMotion().
 */
export function ambientMotionAllowed(): boolean {
  if (typeof document === "undefined") return false;
  const root = document.documentElement;
  return root.classList.contains("js") && !root.hasAttribute("data-lite") && !prefersReducedMotion();
}
