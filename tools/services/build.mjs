/**
 * Build the Services-card images from the AI-generated masters in ./src.
 *
 *   cd tools/services && npm install --no-save sharp@0.33.5 && node build.mjs
 *
 * Writes assets/services/service-0N-{480,720,960}.webp (2:1, used through srcset).
 *
 * Every file already carries its final look, so the page draws it as-is: fully opaque on phones,
 * with no live gradients, filters or transparency to recompute while scrolling.
 *   1. a 2:1 crop of the master (downscale only; the masters are 1584 × 672),
 *   2. dimmed towards the window colour so the picture stays a quiet backdrop,
 *   3. a legibility veil under the card number (top-left) and line-art (top-right).
 *
 * To replace a picture: save the new master as src/service-0N.webp (any size at least
 * 1344 × 672, roughly 2:1 or wider, subject low and centred, calm and dark across the top),
 * adjust `focus` below if the subject is off-centre, then run this script.
 */
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const dest = path.resolve(here, '../../assets/services');
await fs.mkdir(dest, { recursive: true });

const sizes = [960, 720, 480];
// Dark, smooth gradients block up at ordinary WebP settings (visible as squares on bright phone screens).
// q92 with the 'drawing' preset (less smoothing of flat areas) keeps them clean at a few KB more.
const quality = { 960: 92, 720: 92, 480: 92 };
const DIM = 0.8; // share of the picture kept; the rest is the window colour
const WINDOW = [11, 11, 13]; // #0b0b0d = --bg-2, the window behind the picture

// focus: horizontal centre of the 2:1 crop, 0 = left edge … 1 = right edge
const cards = [
  { n: '01', what: 'Premium Website Development: laptop on black stone', focus: 0.5 },
  { n: '02', what: 'High-Converting Landing Pages: phone with a gold call to action', focus: 0.5 },
  { n: '03', what: 'Error Fixing & Bug Resolution: gold tweezers fixing one fault', focus: 1 },
  { n: '04', what: 'Website Optimization: performance gauge', focus: 0.5 },
  { n: '05', what: 'AI-Assisted Development: gold neural filaments', focus: 0.5 },
  { n: '06', what: 'Testing & Quality Assurance: laptop, tablet and phone', focus: 0.5 },
];

// Legibility veil: darker under the card number (top-left) and line-art (top-right), clear in the
// middle, grounded at the base. Proportions match the 2:1 window; the colour is the window colour.
const veil = (w, h) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs>
    <linearGradient id="l" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#09090a" stop-opacity=".8"/><stop offset=".24" stop-color="#09090a" stop-opacity=".4"/>
      <stop offset=".52" stop-color="#09090a" stop-opacity="0"/><stop offset="1" stop-color="#09090a" stop-opacity=".34"/>
    </linearGradient>
    <radialGradient id="tr" gradientUnits="userSpaceOnUse" cx="${0.874 * w}" cy="${0.253 * h}" r="${0.41 * w}" gradientTransform="translate(${0.874 * w} ${0.253 * h}) scale(1 ${(0.66 * h) / (0.41 * w)}) translate(${-0.874 * w} ${-0.253 * h})">
      <stop offset="0" stop-color="#09090a" stop-opacity=".62"/><stop offset=".7" stop-color="#09090a" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="tl" gradientUnits="userSpaceOnUse" cx="${0.093 * w}" cy="${0.121 * h}" r="${0.356 * w}" gradientTransform="translate(${0.093 * w} ${0.121 * h}) scale(1 ${(0.396 * h) / (0.356 * w)}) translate(${-0.093 * w} ${-0.121 * h})">
      <stop offset="0" stop-color="#09090a" stop-opacity=".6"/><stop offset=".72" stop-color="#09090a" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#l)"/><rect width="${w}" height="${h}" fill="url(#tr)"/><rect width="${w}" height="${h}" fill="url(#tl)"/>
</svg>`);

for (const c of cards) {
  const src = path.join(here, 'src', `service-${c.n}.webp`);
  const { width, height } = await sharp(src).metadata();
  const ch = Math.min(height, Math.floor(width / 2));
  const cw = ch * 2;
  if (cw < 960) throw new Error(`${c.n}: master too small; a ${cw}px crop would be upscaled`);
  const left = Math.round(Math.min(Math.max(c.focus * width - cw / 2, 0), width - cw));
  const top = Math.round((height - ch) / 2);
  const crop = await sharp(src).extract({ left, top, width: cw, height: ch }).png().toBuffer();
  for (const s of sizes) {
    const file = path.join(dest, `service-${c.n}-${s}.webp`);
    const sized = await sharp(crop)
      .resize(s, s / 2, { kernel: 'lanczos3' })
      .linear([DIM, DIM, DIM], WINDOW.map((v) => (1 - DIM) * v))
      .png()
      .toBuffer();
    await sharp(sized)
      .composite([{ input: veil(s, s / 2) }])
      .flatten({ background: '#0b0b0d' })
      .webp({ quality: quality[s], effort: 6, smartSubsample: true, preset: 'drawing' })
      .toFile(file);
    const { size } = await fs.stat(file);
    console.log(`  ${path.basename(file).padEnd(24)} ${s}×${s / 2}  ${(size / 1024).toFixed(1).padStart(5)} KB  ${c.what}`);
  }
}
