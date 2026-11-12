// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

/*
 * Step 1 of the offline flacon pipeline: npm run export-flacon (node blender/export-flacon.mts).
 *
 * Re-runs the site's own procedural flacon builders (flacon-geometry.ts, a verbatim copy of the old
 * WebGL scene's geometry) under plain Node and writes:
 *   blender/out/flacon.obj   vessel, liquid, collar and the four stopper parts, Z-up
 *   blender/out/flacon.json  the FLACON dimensions (lip, collar, liquid range, hero level)
 * render.py imports both. Nothing here ships: the page only ever sees the encoded AVIF renders.
 *
 * Node 24 strips the TypeScript types natively; './flacon-geometry.ts' imports 'three', which resolves
 * from this repo's node_modules.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as FG from "./flacon-geometry.ts";

type Geometry = ReturnType<typeof FG.createVesselGeometry>;

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(here, "out");
mkdirSync(outDir, { recursive: true });

/*
 * three is Y-up, Blender is Z-up: (x, y, z) → (x, -z, y). The flacon's front (three's +z, where the old
 * camera stood) becomes Blender's -y, which is where render.py puts its camera.
 * Stopper parts stay in their local frame (seat at 0); render.py lifts them onto the collar.
 */
function objChunk(name: string, geometry: Geometry, offset: number): { text: string; count: number } {
  if (!geometry.attributes.normal) geometry.computeVertexNormals();
  const pos = geometry.attributes.position;
  const nor = geometry.attributes.normal;
  const lines = [`o ${name}`];
  for (let i = 0; i < pos.count; i++) {
    lines.push(`v ${pos.getX(i).toFixed(6)} ${(-pos.getZ(i)).toFixed(6)} ${pos.getY(i).toFixed(6)}`);
  }
  for (let i = 0; i < nor.count; i++) {
    lines.push(`vn ${nor.getX(i).toFixed(5)} ${(-nor.getZ(i)).toFixed(5)} ${nor.getY(i).toFixed(5)}`);
  }
  const index = geometry.index ? Array.from(geometry.index.array) : Array.from({ length: pos.count }, (_, i) => i);
  let tris = 0;
  for (let i = 0; i < index.length; i += 3) {
    const a = index[i] + 1 + offset;
    const b = index[i + 1] + 1 + offset;
    const c = index[i + 2] + 1 + offset;
    // Skip the slivers a lathe makes where a ring collapses onto the axis.
    if (a === b || b === c || a === c) continue;
    lines.push(`f ${a}//${a} ${b}//${b} ${c}//${c}`);
    tris++;
  }
  console.log(`  ${name.padEnd(15)} ${String(pos.count).padStart(6)} verts ${String(tris).padStart(7)} tris`);
  return { text: lines.join("\n"), count: pos.count };
}

const parts: Array<[string, Geometry]> = [
  ["vessel", FG.createVesselGeometry()],
  ["liquid", FG.createLiquidGeometry()],
  ["collar", FG.createCollarGeometry()],
  ["stopper_shank", FG.createStopperShankGeometry()],
  ["stopper_seat", FG.createStopperSeatGeometry()],
  ["stopper_finial", FG.createStopperFinialGeometry()],
  ["stopper_cap", FG.createStopperCapGeometry()],
];

console.log("flacon.obj");
let offset = 0;
const chunks = ["# © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute."];
for (const [name, geometry] of parts) {
  const { text, count } = objChunk(name, geometry, offset);
  chunks.push(text);
  offset += count;
}
writeFileSync(path.join(outDir, "flacon.obj"), chunks.join("\n") + "\n");
writeFileSync(path.join(outDir, "flacon.json"), JSON.stringify(FG.FLACON, null, 1) + "\n");
console.log(`wrote ${path.join(outDir, "flacon.obj")} (${offset} verts) and flacon.json`);
