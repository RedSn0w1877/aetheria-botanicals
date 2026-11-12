// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

/*
 * String builders for the plate files that app/plates/<group>/[file]/route.ts writes into out/plates/.
 * Two facts drive this: react-dom/server cannot be imported in a route handler (hard build error), and a
 * server-rendered SVG ships twice in a static export (HTML plus the RSC payload). So big drawings are
 * plain strings served as static, cacheable files.
 *
 * A plate is loaded through <img>, which can't see page CSS or page fonts: use hard-coded hex colours,
 * and keep any text that matters in HTML beside the image.
 */

export const SVG_COPYRIGHT = "<!-- © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute. -->";

export type AttrValue = string | number | null | undefined | false;
export type Attrs = Record<string, AttrValue>;

/** Rounds to `digits` decimals (2 by default) and prints the shortest form: 12, 12.5, -0.25. Use it inside path data. */
export function num(value: number, digits = 2): string {
  const factor = 10 ** digits;
  const rounded = Math.round(value * factor) / factor;
  return String(Object.is(rounded, -0) ? 0 : rounded);
}

/** Escapes a string for an XML attribute value or text node. */
export function esc(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/**
 * One element as a string. Attribute values are escaped and numbers rounded to 2 decimals; null,
 * undefined and false drop the attribute (XML has no bare boolean attributes). Children are markup:
 * nest el() calls, and wrap raw text in esc().
 * el("path", { class: "i", pathLength: 1, d }) → '<path class="i" pathLength="1" d="…"/>'
 */
export function el(tag: string, attrs: Attrs | null = null, ...children: Array<string | false | null | undefined>): string {
  let open = `<${tag}`;
  if (attrs) {
    for (const [name, value] of Object.entries(attrs)) {
      if (value === null || value === undefined || value === false) continue;
      open += ` ${name}="${typeof value === "number" ? num(value) : esc(value)}"`;
    }
  }
  const inner = children.filter((child): child is string => typeof child === "string" && child.length > 0).join("");
  return inner ? `${open}>${inner}</${tag}>` : `${open}/>`;
}

/**
 * A complete standalone SVG file: the copyright comment, then <svg xmlns viewBox> with a <title> first.
 * `attrs` adds root attributes (fill, stroke defaults and so on).
 */
export function svgDoc({ viewBox, title, body, attrs }: { viewBox: string; title: string; body: string; attrs?: Attrs }): string {
  const root = el("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox, ...attrs }, el("title", null, esc(title)), body);
  return `${SVG_COPYRIGHT}\n${root}\n`;
}
