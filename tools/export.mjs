// Export a photo for the site from its full-size original.
//   npm i --no-save sharp && node tools/export.mjs "<original.jpg>" images/<name>.jpg
// Keeps the original's aspect ratio (2400px on the long edge, never upscaled), keeps its
// colour profile and full colour detail (4:4:4), and drops everything else (EXIF, location).
import sharp from "sharp";
import { colourOptions } from "./colour.mjs";

const [src, out] = process.argv.slice(2);
if (!src || !out) { console.error('usage: node tools/export.mjs "<original.jpg>" images/<name>.jpg'); process.exit(1); }
const meta = await sharp(src).metadata();
const [w, h] = meta.orientation >= 5 ? [meta.height, meta.width] : [meta.width, meta.height];
const fit = w >= h ? { width: Math.min(2400, w) } : { height: Math.min(2400, h) };
const img = colourOptions(sharp(src).rotate().resize(fit), meta, 90);
const r = await img.toFile(out);
console.log(`${out}: ${w}x${h} -> ${r.width}x${r.height}`);
