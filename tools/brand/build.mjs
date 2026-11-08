/**
 * Regenerate every derived brand asset from the official transparent logo master.
 *
 *   cd tools/brand && npm install sharp@0.33.5 && node build.mjs
 *
 * Source (never modified):
 *   assets/brand/vantera-logo-transparent.png   the official emblem, background removed
 *
 * Writes:
 *   assets/brand/logo.webp            320 px tall — shown in the navigation, footer and contact section
 *   assets/brand/logo.png             320 px tall — structured data (JSON-LD) and general use
 *   assets/brand/favicon-32.png       32 × 32, transparent
 *   assets/brand/apple-touch-icon.png 180 × 180 on the site's obsidian background
 *   assets/brand/icon-192.png         192 × 192 (web app manifest)
 *   assets/brand/icon-512.png         512 × 512 (web app manifest)
 *   favicon.ico                       16 / 32 / 48 (repository root)
 *
 * The emblem is only ever scaled — never cropped, stretched or recoloured.
 * The share image (assets/brand/og-image.jpg) is rendered separately from tools/og/og.html.
 */
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const brand = path.join(root, 'assets/brand');
const master = path.join(brand, 'vantera-logo-transparent.png');

const CLEAR = { r: 0, g: 0, b: 0, alpha: 0 };
const OBSIDIAN = { r: 7, g: 7, b: 8, alpha: 1 }; // #070708 — matches theme-color

// The emblem centred on a square canvas, scaled to `fill` of the canvas height.
async function square(size, fill, background) {
  const mark = await sharp(master).resize({ height: Math.round(size * fill) }).toBuffer();
  const { width, height } = await sharp(mark).metadata();
  return sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: mark, left: Math.round((size - width) / 2), top: Math.round((size - height) / 2) }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

// Minimal ICO writer with PNG-compressed entries (supported by all current browsers).
function ico(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(entries.length, 4);
  const dir = Buffer.alloc(16 * entries.length);
  let offset = 6 + dir.length;
  entries.forEach(({ size, png }, i) => {
    const o = i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, o);
    dir.writeUInt8(size >= 256 ? 0 : size, o + 1);
    dir.writeUInt8(0, o + 2); // palette colours
    dir.writeUInt8(0, o + 3); // reserved
    dir.writeUInt16LE(1, o + 4); // colour planes
    dir.writeUInt16LE(32, o + 6); // bits per pixel
    dir.writeUInt32LE(png.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += png.length;
  });
  return Buffer.concat([header, dir, ...entries.map((e) => e.png)]);
}

const meta = await sharp(master).metadata();
console.log(`master ${meta.width}×${meta.height} (ratio ${(meta.width / meta.height).toFixed(3)})`);

await sharp(master).resize({ height: 320 }).webp({ quality: 92, alphaQuality: 100, effort: 6 }).toFile(path.join(brand, 'logo.webp'));
await sharp(master).resize({ height: 320 }).png({ compressionLevel: 9 }).toFile(path.join(brand, 'logo.png'));

await fs.writeFile(path.join(brand, 'favicon-32.png'), await square(32, 1, CLEAR));
await fs.writeFile(path.join(brand, 'apple-touch-icon.png'), await square(180, 0.74, OBSIDIAN));
await fs.writeFile(path.join(brand, 'icon-192.png'), await square(192, 0.72, OBSIDIAN));
await fs.writeFile(path.join(brand, 'icon-512.png'), await square(512, 0.72, OBSIDIAN));

const icoEntries = [];
for (const size of [16, 32, 48]) icoEntries.push({ size, png: await square(size, 1, CLEAR) });
await fs.writeFile(path.join(root, 'favicon.ico'), ico(icoEntries));

console.log('brand assets written to assets/brand/ and favicon.ico');
