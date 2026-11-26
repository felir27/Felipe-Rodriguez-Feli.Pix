// Makes the smaller copies the site loads on small screens, and js/sizes.js.
// Run from the repo root after adding or replacing a photo in images/:
//   npm i --no-save sharp && node tools/resize.mjs
import sharp from "sharp";
import { readdir, mkdir, writeFile, rm } from "node:fs/promises";
import { colourOptions } from "./colour.mjs";

const WIDTHS = [800, 1600];
const files = (await readdir("images")).filter((f) => /\.jpe?g$/i.test(f)).sort();
const sizes = {};
for (const w of WIDTHS) { await rm(`images/${w}`, { recursive: true, force: true }); await mkdir(`images/${w}`, { recursive: true }); }
for (const f of files) {
  const src = `images/${f}`;
  const meta = await sharp(src).metadata();
  sizes[src] = [meta.width, meta.height];
  for (const w of WIDTHS) {
    if (w >= meta.width) continue;
    // Width-only resize keeps the photo's aspect ratio; EXIF and location are dropped.
    await colourOptions(sharp(src).resize({ width: w }), meta, 86).toFile(`images/${w}/${f}`);
  }
}
const body = Object.entries(sizes).map(([k, v]) => `  ${JSON.stringify(k)}: [${v}]`).join(",\n");
await writeFile("js/sizes.js",
  `/* Made by tools/resize.mjs: each photo's full width and height, and the smaller copies that exist. Don't edit by hand. */\n` +
  `const SIZES = {\n${body}\n};\nconst SIZE_STEPS = ${JSON.stringify(WIDTHS)};\n`);
console.log(`${files.length} photos, sizes written to js/sizes.js`);
