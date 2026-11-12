// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

/*
 * Step 3 of the offline flacon pipeline: npm run encode-renders (node blender/encode.mjs).
 *
 * Turns render.py's 16-bit PNGs (blender/out/*.png) into the AVIFs the page ships
 * (src/assets/renders/*.avif) and writes their manifest (src/assets/renders/index.ts):
 *   poster-960/720/480  white-balanced so the set's top band lands on the niche's parchment #DBC5A0
 *   compose-set         the same gain; compose-glass gets it too (same lights), with its alpha
 *   compose-liquid-*    grey + alpha, normalised (median .75, max .96) for CSS multiply tinting
 *   glint               white + alpha (alpha = luminance x alpha, x GLINT_GAIN so the sweep reads at 1x)
 *   leaflight(-800)     white-balanced so its median is the page's kraft stock #C7A982, its shade at
 *                       LEAF_CONTRAST, the HVNF papermaker's watermark (small, 2%, a second-look mark),
 *                       and its bottom 12% feathered to exact kraft; 800w for phones
 * The colours come from src/lib/palette.ts (PALETTE), the same values globals.css holds as tokens.
 * Every file: AVIF effort 6, 4:2:0, quality from its own start (52 by default) down in steps of 4
 * to 40 until it fits its budget (else exit 1), and the EXIF copyright. PNG previews of each, plus two composites of the
 * layered Compose flacon, go to blender/out/previews/ — LOOK at them.
 *
 * Flags:
 *   --placeholders   write flat stand-ins at the final sizes (no renders needed), so the page can be
 *                    built and measured while Blender works
 *   --only a,b       encode only these assets (file stems, e.g. poster,leaflight)
 * Without --placeholders, an asset whose render is missing keeps its current AVIF (or gets a stand-in).
 */
import sharp from "sharp";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PALETTE } from "../src/lib/palette.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const site = path.resolve(here, "..");
const OUT = path.join(here, "out");
const RENDERS = path.join(site, "src", "assets", "renders");
const PREVIEWS = path.join(OUT, "previews");
mkdirSync(RENDERS, { recursive: true });
mkdirSync(PREVIEWS, { recursive: true });

const args = process.argv.slice(2);
const PLACEHOLDERS = args.includes("--placeholders");
const onlyIndex = args.indexOf("--only");
const ONLY = onlyIndex >= 0 ? new Set(args[onlyIndex + 1].split(",")) : null;

const COPYRIGHT = "© 2026 HVNF Studios — portfolio sample, do not redistribute";
const KB = 1000; // budgets are in kilobytes of 1000 bytes: the stricter reading
const Q_START = 52;
const Q_STEP = 4;
const Q_FLOOR = 40;
/** How dark the glass layer's caught shadow may be, relative to what Cycles' catcher returns. */
const CATCHER_STRENGTH = 0.38;
/**
 * How much of the rendered leaf shade the page's leaf light keeps (1 = all of it). 0.3: the plate,
 * not the backdrop, carries the title page's values, and the h1 sits on near-clean stock.
 */
const LEAF_CONTRAST = 0.3;
/** The glint pass's strength: the sweep has to be seen to travel across the crystal at 1x DPR. */
const GLINT_GAIN = 2.6;
/** The papermaker's watermark: multiply strength and height (share of the sheet). Found on a second look. */
const MARK_STRENGTH = 0.02;
const MARK_HEIGHT = 0.18;

const hexRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
/** The niche the poster stands in, and the page's kraft stock under the leaf light. */
const PARCHMENT = hexRgb(PALETTE.parchment);
const LINEN = hexRgb(PALETTE.linen);

/** Every shipped render: source PNG, true size, budget (KB) and how it is processed. */
const ASSETS = [
  // Start quality per asset: every file sits far under its budget at 52, so spend the headroom on
  // fidelity (glass edges, the soft leaf shadows) before anything else. The loop still steps down.
  { stem: "poster-960", from: "poster.png", w: 960, h: 1344, budget: 80, kind: "poster", quality: 72 },
  { stem: "poster-720", from: "poster.png", w: 720, h: 1008, budget: 50, kind: "poster", quality: 72 },
  { stem: "poster-480", from: "poster.png", w: 480, h: 672, budget: 25, kind: "poster", quality: 70 },
  { stem: "compose-set", from: "compose-set.png", w: 600, h: 840, budget: 25, kind: "set", quality: 66, dither: true },
  { stem: "compose-glass", from: "compose-glass.png", w: 600, h: 840, budget: 45, kind: "glass", quality: 68 },
  { stem: "compose-liquid-low", from: "compose-liquid-low.png", w: 600, h: 840, budget: 20, kind: "liquid", quality: 64 },
  { stem: "compose-liquid-mid", from: "compose-liquid-mid.png", w: 600, h: 840, budget: 20, kind: "liquid", quality: 64 },
  { stem: "compose-liquid-high", from: "compose-liquid-high.png", w: 600, h: 840, budget: 20, kind: "liquid", quality: 64 },
  { stem: "glint", from: "glint.png", w: 960, h: 1344, budget: 15, kind: "glint", quality: 60 },
  { stem: "leaflight", from: "leaflight.png", w: 1600, h: 1000, budget: 45, kind: "leaflight", quality: 66, dither: true },
  { stem: "leaflight-800", from: "leaflight.png", w: 800, h: 500, budget: 20, kind: "leaflight", quality: 66, dither: true },
];

// ------------------------------------------------------------------------------- pixels and colour
const toLinear = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const toSrgb = (v) => (v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055);
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const LIN16 = new Float32Array(65536).map((_, i) => toLinear(i / 65535));

/** A 16-bit PNG as floats 0..1 (sRGB-encoded), with its size and channel count. */
async function readPng(file) {
  // rgb16 first: without it libvips casts 8-bit-scaled values into the ushort buffer (0..255, not
  // 0..65535), and every gain comes out about 250x too strong. rgb16 keeps an alpha channel.
  const { data, info } = await sharp(file).toColourspace("rgb16").raw({ depth: "ushort" }).toBuffer({ resolveWithObject: true });
  const u16 = new Uint16Array(new Uint8Array(data).buffer);
  return { u16, width: info.width, height: info.height, channels: info.channels };
}

/** Floats (sRGB-encoded 0..1) back to a 16-bit sharp pipeline, optionally with ±1/2 of an 8-bit level of TPDF dither. */
function toSharp(floats, width, height, channels, dither = false) {
  const u16 = new Uint16Array(floats.length);
  let seed = 0x9e3779b9;
  const rnd = () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 4294967296;
  };
  for (let i = 0; i < floats.length; i++) {
    let v = floats[i];
    if (dither && (channels < 4 || i % 4 !== 3)) v += ((rnd() - rnd()) * 1) / 255;
    u16[i] = Math.round(clamp01(v) * 65535);
  }
  return sharp(u16, { raw: { width, height, channels } });
}

function median(values) {
  const sorted = Float32Array.from(values).sort();
  return sorted[sorted.length >> 1];
}

/** Per-channel linear gain that moves the median of rows [y0, y1) onto `target` (8-bit sRGB). */
function bandGain(img, y0, y1, target) {
  const { u16, width, channels } = img;
  const gains = [];
  for (let c = 0; c < 3; c++) {
    const vals = [];
    for (let y = y0; y < y1; y++) for (let x = 0; x < width; x++) vals.push(LIN16[u16[(y * width + x) * channels + c]]);
    gains.push(toLinear(target[c] / 255) / median(vals));
  }
  return gains;
}

/** Applies a linear-light gain to RGB; alpha passes through. Returns sRGB-encoded floats. */
function applyGain(img, gains) {
  const { u16, channels } = img;
  const out = new Float32Array(u16.length);
  for (let i = 0; i < u16.length; i++) {
    const c = i % channels;
    out[i] = c < 3 ? toSrgb(clamp01(LIN16[u16[i]] * gains[c])) : u16[i] / 65535;
  }
  return out;
}

// --------------------------------------------------------------------------------------- encoding
async function writeAvif(asset, pipelineFor) {
  const file = path.join(RENDERS, `${asset.stem}.avif`);
  let quality = asset.quality ?? Q_START;
  for (;;) {
    const buffer = await pipelineFor()
      .avif({ quality, effort: 6, chromaSubsampling: "4:2:0" })
      .withExif({ IFD0: { Copyright: COPYRIGHT } })
      .toBuffer();
    if (buffer.length <= asset.budget * KB) {
      writeFileSync(file, buffer);
      return { quality, bytes: buffer.length };
    }
    if (quality - Q_STEP < Q_FLOOR) {
      console.error(`✗ ${asset.stem}: ${buffer.length} B at quality ${quality} is over its ${asset.budget} KB budget`);
      process.exit(1);
    }
    quality -= Q_STEP;
  }
}

async function preview(stem) {
  const file = path.join(RENDERS, `${stem}.avif`);
  await sharp(file).png().toFile(path.join(PREVIEWS, `${stem}.png`));
}

// ------------------------------------------------------------------------------------- processing
const cache = new Map();
async function source(name) {
  if (!cache.has(name)) cache.set(name, await readPng(path.join(OUT, name)));
  return cache.get(name);
}

/** The set's white balance, shared by the poster (its own top band) and the compose layers. */
async function setGain(name) {
  const img = await source(name);
  const band = Math.round(24 * (img.height / 1344));
  return bandGain(img, 0, Math.max(band, 8), PARCHMENT);
}

const processed = new Map();
async function processAsset(asset) {
  const key = `${asset.kind}:${asset.from}`;
  if (processed.has(key)) return processed.get(key);
  const img = await source(asset.from);
  const { width, height, channels } = img;
  let floats;
  let outChannels = channels;
  let note = "";

  if (asset.kind === "poster" || asset.kind === "set") {
    const gains = await setGain(asset.from);
    floats = applyGain(img, gains);
    note = `gain ${gains.map((g) => g.toFixed(3)).join("/")}`;
  } else if (asset.kind === "glass") {
    const gains = existsSync(path.join(OUT, "compose-set.png")) ? await setGain("compose-set.png") : [1, 1, 1];
    floats = applyGain(img, gains);
    // The shadow catchers (floor and wall) return pure black with the shadow as alpha, but they treat
    // the crystal as opaque: the wall shadow came out near-black (alpha up to .93) where the poster,
    // which lets light through the glass, shows a soft grey one. Lighten catcher-only pixels (pure
    // black) to match the poster; glass, collar and stopper pixels always carry colour and keep theirs.
    let lightened = 0;
    for (let i = 0; i < floats.length; i += 4) {
      if (Math.max(floats[i], floats[i + 1], floats[i + 2]) < 0.004 && floats[i + 3] > 0) {
        floats[i + 3] *= CATCHER_STRENGTH;
        lightened++;
      }
    }
    note = `set gain ${gains.map((g) => g.toFixed(3)).join("/")}, ${lightened} shadow px x${CATCHER_STRENGTH}`;
  } else if (asset.kind === "liquid") {
    // Grey + alpha: luminance of the refracted white liquid, normalised for CSS multiply tinting.
    // A refraction-only vessel turns total internal reflection into black, semi-opaque rims; those are
    // glass, not liquid, so their alpha is ramped away (only lit liquid may carry the tint).
    const n = width * height;
    const grey = new Float32Array(n);
    const alpha = new Float32Array(n);
    const inside = [];
    for (let p = 0; p < n; p++) {
      const i = p * channels;
      const y = 0.2126 * (img.u16[i] / 65535) + 0.7152 * (img.u16[i + 1] / 65535) + 0.0722 * (img.u16[i + 2] / 65535);
      const t = clamp01((y - 0.1) / 0.2);
      grey[p] = y;
      alpha[p] = (channels === 4 ? img.u16[i + 3] / 65535 : 1) * t * t * (3 - 2 * t);
      if (alpha[p] > 0.5) inside.push(y);
    }
    const scale = inside.length ? 0.75 / median(inside) : 1;
    floats = new Float32Array(n * 4);
    let max = 0;
    for (let p = 0; p < n; p++) {
      let v = grey[p] * scale;
      // Soft knee above .9 so the brightest refraction never passes .96.
      if (v > 0.9) v = 0.9 + 0.06 * (1 - Math.exp(-(v - 0.9) / 0.06));
      if (alpha[p] > 0.01) max = Math.max(max, v);
      floats[p * 4] = floats[p * 4 + 1] = floats[p * 4 + 2] = v;
      floats[p * 4 + 3] = alpha[p];
    }
    outChannels = 4;
    note = `median→.75 (x${scale.toFixed(3)}), max ${max.toFixed(3)}, ${inside.length} liquid px`;
  } else if (asset.kind === "glint") {
    // White light only: alpha = luminance x alpha, rescaled so the brightest streak sits at .9.
    const n = width * height;
    const a = new Float32Array(n);
    let max = 0;
    for (let p = 0; p < n; p++) {
      const i = p * channels;
      const y = 0.2126 * LIN16[img.u16[i]] + 0.7152 * LIN16[img.u16[i + 1]] + 0.0722 * LIN16[img.u16[i + 2]];
      a[p] = toSrgb(clamp01(y)) * (channels === 4 ? img.u16[i + 3] / 65535 : 1);
      max = Math.max(max, a[p]);
    }
    const k = max > 0 ? (0.9 / max) * GLINT_GAIN : 1;
    floats = new Float32Array(n * 4);
    for (let p = 0; p < n; p++) {
      floats[p * 4] = floats[p * 4 + 1] = floats[p * 4 + 2] = 1;
      // Gain, then a soft shoulder at .95 so the brightest streaks never clip to a flat white bar.
      const v = a[p] * k;
      floats[p * 4 + 3] = v > 0.8 ? 0.8 + 0.15 * (1 - Math.exp(-(v - 0.8) / 0.15)) : v;
    }
    outChannels = 4;
    note = `alpha x${k.toFixed(2)} (gain ${GLINT_GAIN})`;
  } else if (asset.kind === "leaflight") {
    floats = await leafLight(img);
    outChannels = 3;
    note = `linen median, shade x${LEAF_CONTRAST}, watermark ${MARK_STRENGTH * 100}%, bottom 12% feathered`;
  }
  const result = { floats, width, height, channels: outChannels, note };
  processed.set(key, result);
  return result;
}

/** The page's leaf light: white balance to the kraft stock, the papermaker's watermark, a feathered foot. */
async function leafLight(img) {
  const { u16, width, height, channels } = img;
  // White balance: the median of the whole sheet becomes the kraft stock (PALETTE.linen).
  const gains = [];
  for (let c = 0; c < 3; c++) {
    const vals = new Float32Array(width * height);
    for (let p = 0; p < width * height; p++) vals[p] = LIN16[u16[p * channels + c]];
    gains.push(toLinear(LINEN[c] / 255) / median(vals));
  }
  // Then soften the shade towards the stock: full-strength, the dapple sat behind the type like dark
  // blots across the whole title page. At LEAF_CONTRAST the light still reads as leaves at a window.
  const floats = new Float32Array(width * height * 3);
  for (let p = 0; p < width * height; p++) {
    for (let c = 0; c < 3; c++) {
      const v = toSrgb(clamp01(LIN16[u16[p * channels + c]] * gains[c]));
      const stock = LINEN[c] / 255;
      floats[p * 3 + c] = stock + (v - stock) * LEAF_CONTRAST;
    }
  }

  // The HVNF papermaker's watermark: the cube and wordmark, lower left, MARK_STRENGTH darker (multiply),
  // applied after the shade is softened, small enough to be found only on a second look.
  const markSvg = readFileSync(path.join(here, "assets", "hvnf-mark.svg"), "utf8")
    // A paper mould's wires are heavier than the screen mark: thicken the cube's hairlines.
    .replace(/stroke-width="([\d.]+)"/g, (_, w) => `stroke-width="${(Number(w) * 2.6).toFixed(2)}"`);
  // Lower left, in the empty margin beside the links: in the lower right it sat behind the perfumer's
  // signed note, and a studio mark under her signature says the wrong thing about who made the book.
  const markH = Math.round(height * MARK_HEIGHT);
  const mark = await sharp(Buffer.from(markSvg), { density: 300 }).resize({ height: markH }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const mx0 = Math.round(width * 0.1 - mark.info.width / 2);
  const my0 = Math.round(height * 0.78 - markH / 2);
  for (let y = 0; y < mark.info.height; y++) {
    for (let x = 0; x < mark.info.width; x++) {
      const px = mx0 + x;
      const py = my0 + y;
      if (px < 0 || py < 0 || px >= width || py >= height) continue;
      const m = mark.data[(y * mark.info.width + x) * mark.info.channels + 3] / 255;
      if (!m) continue;
      const k = 1 - MARK_STRENGTH * m;
      const i = (py * width + px) * 3;
      floats[i] *= k;
      floats[i + 1] *= k;
      floats[i + 2] *= k;
    }
  }

  // Feather the bottom 12% to exact kraft, so the frontispiece ends on the page's own colour.
  const start = Math.floor(height * 0.88);
  for (let y = start; y < height; y++) {
    const t = (y - start) / (height - 1 - start);
    const w = t * t * (3 - 2 * t);
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 3;
      for (let c = 0; c < 3; c++) floats[i + c] = floats[i + c] * (1 - w) + (LINEN[c] / 255) * w;
    }
  }
  return floats;
}

// ----------------------------------------------------------------------------------- placeholders
function placeholder(asset) {
  const { w, h, kind } = asset;
  if (kind === "poster" || kind === "set") return sharp({ create: { width: w, height: h, channels: 3, background: rgb(PARCHMENT) } });
  if (kind === "leaflight") return sharp({ create: { width: w, height: h, channels: 3, background: rgb(LINEN) } });
  // Layers that composite: fully transparent stand-ins.
  return sharp({ create: { width: w, height: h, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 0 } } });
}
const rgb = ([r, g, b]) => ({ r, g, b });

// ------------------------------------------------------------------------------------- manifest
async function writeManifest() {
  const entries = [];
  for (const asset of ASSETS) {
    const meta = await sharp(path.join(RENDERS, `${asset.stem}.avif`)).metadata();
    entries.push({ ...asset, trueW: meta.width, trueH: meta.height });
  }
  const id = (stem) => stem.replace(/-(\w)/g, (_, c) => c.toUpperCase());
  const ref = (stem) => {
    const e = entries.find((x) => x.stem === stem);
    return `render(${id(stem)}, ${e.trueW}, ${e.trueH})`;
  };
  const lines = [
    "// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.",
    "",
    "// GENERATED by blender/encode.mjs. Do not edit by hand: re-run `npm run encode-renders`.",
    "//",
    "// The offline Cycles renders, as hashed static imports (the URLs carry the basePath). Sizes come from",
    "// the encoded files themselves: Turbopack reports every AVIF as 100x100, so never read width/height",
    "// off the imports.",
    ...entries.map((e) => `import ${id(e.stem)} from "./${e.stem}.avif";`),
    "",
    "export type Render = { src: string; w: number; h: number };",
    "",
    "const render = (image: { src: string }, w: number, h: number): Render => ({ src: image.src, w, h });",
    "",
    "/** The frontispiece flacon, 5:7, in the three widths of its srcset. */",
    `export const POSTER = { 480: ${ref("poster-480")}, 720: ${ref("poster-720")}, 960: ${ref("poster-960")} } as const;`,
    "",
    "/** The layered Compose flacon: the empty set, the glass, and one grey+alpha liquid pass per fill band. */",
    "export const COMPOSE = {",
    `  set: ${ref("compose-set")},`,
    `  glass: ${ref("compose-glass")},`,
    `  liquid: { low: ${ref("compose-liquid-low")}, mid: ${ref("compose-liquid-mid")}, high: ${ref("compose-liquid-high")} },`,
    "} as const;",
    "",
    "/** The highlight the poster's one-time glint sweeps across (white + alpha). */",
    `export const GLINT = ${ref("glint")};`,
    "",
    "/** Window light through leaves on linen, behind the frontispiece. Carries the HVNF paper watermark. 800w for phones. */",
    `export const LEAFLIGHT = ${ref("leaflight")};`,
    `export const LEAFLIGHT_800 = ${ref("leaflight-800")};`,
    "",
  ];
  writeFileSync(path.join(RENDERS, "index.ts"), lines.join("\n"));
  return entries;
}

// ------------------------------------------------------------------------------------ composites
/** Simulates the CSS layering of flacon-figure.tsx: set, tinted liquid (multiply + mask), glass. */
async function composeComposite(tint, name) {
  const files = ["compose-set", "compose-liquid-mid", "compose-glass"].map((s) => path.join(RENDERS, `${s}.avif`));
  if (!files.every(existsSync)) return;
  const [set, liq, glass] = await Promise.all(files.map((f) => sharp(f).ensureAlpha().raw().toBuffer({ resolveWithObject: true })));
  const { width, height } = set.info;
  const out = Buffer.alloc(width * height * 3);
  const t = [1, 3, 5].map((i) => parseInt(tint.slice(i, i + 2), 16) / 255);
  for (let p = 0; p < width * height; p++) {
    const i = p * 4;
    for (let c = 0; c < 3; c++) {
      let v = set.data[i + c] / 255;
      const la = liq.data[i + 3] / 255;
      const lv = (liq.data[i + c] / 255) * t[c];
      v = v * (1 - la) + lv * la;
      const ga = glass.data[i + 3] / 255;
      v = v * (1 - ga) + (glass.data[i + c] / 255) * ga;
      out[p * 3 + c] = Math.round(clamp01(v) * 255);
    }
  }
  await sharp(out, { raw: { width, height, channels: 3 } }).png().toFile(path.join(PREVIEWS, name));
}

// ------------------------------------------------------------------------------------------- main
const report = [];
for (const asset of ASSETS) {
  if (ONLY && !ONLY.has(asset.stem) && !ONLY.has(asset.kind)) continue;
  const src = path.join(OUT, asset.from);
  const target = path.join(RENDERS, `${asset.stem}.avif`);
  let result;
  let note;
  if (PLACEHOLDERS || (!existsSync(src) && !existsSync(target))) {
    result = await writeAvif(asset, () => placeholder(asset));
    note = "placeholder";
  } else if (!existsSync(src)) {
    report.push({ asset: asset.stem, kept: true, bytes: statSync(target).size });
    continue;
  } else {
    const p = await processAsset(asset);
    const resize = asset.w !== p.width || asset.h !== p.height;
    result = await writeAvif(asset, () => {
      let s = toSharp(p.floats, p.width, p.height, p.channels, asset.dither);
      if (resize) s = s.resize(asset.w, asset.h, { kernel: "lanczos3" });
      return s;
    });
    note = p.note;
  }
  await preview(asset.stem);
  report.push({ asset: asset.stem, quality: result.quality, bytes: result.bytes, budget: asset.budget * KB, note });
}

const entries = await writeManifest();
await composeComposite("#81763b", "compose-default.png");
await composeComposite("#98784e", "compose-rose.png");

let total = 0;
for (const e of entries) total += statSync(path.join(RENDERS, `${e.stem}.avif`)).size;
for (const r of report) {
  const size = `${String(r.bytes).padStart(6)} B`;
  console.log(r.kept ? `= ${r.asset.padEnd(20)} ${size} (render missing, kept)` : `✓ ${r.asset.padEnd(20)} ${size} / ${r.budget} q${r.quality}  ${r.note}`);
}
for (const e of entries) {
  if (e.trueW !== e.w || e.trueH !== e.h) {
    console.error(`✗ ${e.stem} is ${e.trueW}x${e.trueH}, expected ${e.w}x${e.h}`);
    process.exit(1);
  }
}
console.log(`total ${total} B / 345000 B; manifest ${path.join(RENDERS, "index.ts")}`);
if (total > 345 * KB) {
  console.error("✗ over the 345 KB total");
  process.exit(1);
}
