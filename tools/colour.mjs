// Shared JPEG settings for export.mjs and resize.mjs.
// Full-resolution colour (4:4:4) and the photo's own colour profile are kept so reds and
// other saturated colours look the same as the original; an untagged photo is tagged sRGB.
export function colourOptions(pipeline, meta, quality) {
  const p = meta.icc ? pipeline.keepIccProfile() : pipeline.withIccProfile("srgb");
  return p.jpeg({ quality, chromaSubsampling: "4:4:4", mozjpeg: true });
}
