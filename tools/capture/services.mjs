/**
 * Build the Services-card thumbnails from the raw captures in ./out.
 *
 *   node services.mjs
 *
 * Writes assets/services/service-0N-{480,720,960}.webp (2:1, used through srcset).
 * Every crop is taken from at least 960 source pixels, so no output is ever upscaled.
 * Crops leave calm headroom at the top: the card number and line-art are overlaid there.
 * They also avoid the demos' illustrative statistics, which must never appear on VANTERA's site.
 *
 * Not part of the capture workflow on purpose: the crops below are hand-picked, so a
 * redesign of a live demo can't silently move them onto an awkward part of the page.
 * After a re-capture, run this manually and check the crops if you want fresh thumbnails.
 */
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const src = (name) => path.join(here, 'out', `${name}.webp`);
const dest = path.resolve(here, '../../assets/services');
await fs.mkdir(dest, { recursive: true });

const W = 1920, H = 960; // master canvas (2× the largest output)
const sizes = [960, 720, 480];
const quality = { 960: 72, 720: 74, 480: 76 };

// Full-page captures are 1440 px wide (1×); desktop captures are 2880×1800 (2×).
const cards = [
  { n: '01', what: 'Imperial Royal: Signature Collection', from: 'imperial-royal-full', crop: { left: 0, top: 1990, width: 1440, height: 720 } },
  { n: '02', what: 'Elite Academy: landing-page hero', from: 'elite-academy-desktop', crop: { left: 0, top: 120, width: 2880, height: 1440 } },
  { n: '03', what: 'ABC Estates: curated collections', from: 'abc-estates-full', crop: { left: 0, top: 3546, width: 1440, height: 720 } },
  { n: '04', what: 'Imperial Royal: search & filter interface', from: 'imperial-royal-full', crop: { left: 0, top: 892, width: 1200, height: 600 } },
  { n: '05', what: 'Elite Academy: programme cards', from: 'elite-academy-full', crop: { left: 0, top: 1370, width: 1440, height: 720 } },
  { n: '06', what: 'All three demos on mobile', phones: ['imperial-royal-mobile', 'abc-estates-mobile', 'elite-academy-mobile'] },
];

async function phonesMaster(names) {
  // three phone screens (1170×1992 captures) rising from the bottom edge; the top band stays
  // clear for the card number (top-left) and line-art (top-right) that sit over the thumbnail
  const pw = 440, ph = Math.round((pw * 1992) / 1170), gap = 64, r = 38;
  const left0 = Math.round((W - (3 * pw + 2 * gap)) / 2);
  const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${pw}" height="${ph}"><rect width="${pw}" height="${ph}" rx="${r}" ry="${r}" fill="#fff"/></svg>`);
  const ring = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${pw}" height="${ph}"><rect x="1" y="1" width="${pw - 2}" height="${ph - 2}" rx="${r - 1}" ry="${r - 1}" fill="none" stroke="rgba(232,211,166,0.32)" stroke-width="2"/></svg>`);
  const layers = [];
  for (const [i, name] of names.entries()) {
    const screen = await sharp(src(name)).resize(pw, ph, { fit: 'cover', position: 'top' })
      .composite([{ input: mask, blend: 'dest-in' }, { input: ring }]).png().toBuffer();
    layers.push({ input: screen, left: left0 + i * (pw + gap), top: i === 1 ? 380 : 430 });
  }
  const glow = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><radialGradient id="g" cx="50%" cy="35%" r="60%"><stop offset="0" stop-color="#1c1a17"/><stop offset="1" stop-color="#0b0b0d"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#g)"/></svg>`);
  // crop to the canvas (phones extend below it)
  const full = await sharp({ create: { width: W, height: H + 900, channels: 3, background: '#0b0b0d' } })
    .composite([{ input: glow, left: 0, top: 0 }, ...layers]).png().toBuffer();
  return sharp(full).extract({ left: 0, top: 0, width: W, height: H }).png().toBuffer();
}

// Legibility veil, baked in (cheaper than live CSS gradients on every repaint): darker under the
// card number (top-left) and line-art (top-right), clear in the middle, grounded at the base.
// Proportions match the 2:1 window; the colour equals the window background, so the result is
// identical to an overlay drawn on top of the image at any opacity.
const veil = (w, h) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs>
    <linearGradient id="l" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#09090a" stop-opacity=".88"/><stop offset=".24" stop-color="#09090a" stop-opacity=".5"/>
      <stop offset=".56" stop-color="#09090a" stop-opacity="0"/><stop offset="1" stop-color="#09090a" stop-opacity=".42"/>
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
  if (!c.phones && c.crop.width < 960) throw new Error(`${c.n}: crop narrower than 960px would be upscaled`);
  // crops go straight from the source pixels to each output size (downscale only)
  const master = c.phones ? await phonesMaster(c.phones) : await sharp(src(c.from)).extract(c.crop).png().toBuffer();
  for (const s of sizes) {
    const file = path.join(dest, `service-${c.n}-${s}.webp`);
    const sized = await sharp(master).resize(s, s / 2, { kernel: 'lanczos3' }).modulate({ saturation: 0.9 }).png().toBuffer();
    await sharp(sized).composite([{ input: veil(s, s / 2) }])
      .webp({ quality: quality[s], effort: 6, smartSubsample: true }).toFile(file);
    const { size } = await fs.stat(file);
    console.log(`  ${path.basename(file).padEnd(24)} ${s}×${s / 2}  ${(size / 1024).toFixed(1)} KB  ${c.what}`);
  }
}
