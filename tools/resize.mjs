// Makes the smaller copies the site loads on small screens, and js/sizes.js.
// Run from the repo root after adding or replacing a photo in images/:
//   npm i --no-save sharp && node tools/resize.mjs
import sharp from "sharp";
import { readdir, mkdir, writeFile } from "node:fs/promises";

const WIDTHS = [800, 1600];
const files = (await readdir("images")).filter((f) => /\.jpe?g$/i.test(f)).sort();
const sizes = {};
for (const w of WIDTHS) await mkdir(`images/${w}`, { recursive: true });
for (const f of files) {
  const src = `images/${f}`;
  const { width, height } = await sharp(src).metadata();
  sizes[src] = [width, height];
  for (const w of WIDTHS) {
    if (w >= width) continue;
    // sharp drops all metadata (including any location) unless asked to keep it
    await sharp(src).resize({ width: w }).jpeg({ quality: 80, mozjpeg: true }).toFile(`images/${w}/${f}`);
  }
}
const body = Object.entries(sizes).map(([k, v]) => `  ${JSON.stringify(k)}: [${v}]`).join(",\n");
await writeFile("js/sizes.js",
  `/* Made by tools/resize.mjs: each photo's full width and height, and the smaller copies that exist. Don't edit by hand. */\n` +
  `const SIZES = {\n${body}\n};\nconst SIZE_STEPS = ${JSON.stringify(WIDTHS)};\n`);
console.log(`${files.length} photos, sizes written to js/sizes.js`);
