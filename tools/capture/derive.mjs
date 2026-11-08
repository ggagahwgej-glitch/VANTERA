/**
 * Derive the optimised, site-ready portfolio images from the raw captures in ./out.
 *
 *   node derive.mjs              → every slug in targets.json
 *   node derive.mjs my-project   → one slug
 *
 * Writes to assets/portfolio/:
 *   <slug>-desktop-1600.webp  1600×1000  first screen (16:10)       → images.desktop
 *   <slug>-desktop-800.webp    800×500   small screens               → images.desktopSmall
 *   <slug>-full-1200.webp     1200 wide  full page (hover scroll)    → images.fullPage
 *   <slug>-full-700.webp       700 wide                              → images.fullPageSmall
 *   <slug>-mobile.webp         480×1039  phone screen (390:844)      → images.mobile
 *   <slug>-mobile-full.webp    400 wide  full mobile page            → images.mobileFull
 *
 * Runs automatically in GitHub Actions after capture.mjs.
 */
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(here, 'out');
const dest = path.resolve(here, '../../assets/portfolio');
await fs.mkdir(dest, { recursive: true });

const targets = JSON.parse(await fs.readFile(path.join(here, 'targets.json'), 'utf8'));
const only = process.argv[2];
const exists = (f) => fs.access(f).then(() => true, () => false);

async function save(pipeline, name) {
  const file = path.join(dest, name);
  await pipeline.toFile(file);
  const { width, height, size } = await sharp(file).metadata().then(async (m) => ({ ...m, size: (await fs.stat(file)).size }));
  console.log(`  ${name.padEnd(36)} ${width}×${height}  ${(size / 1024).toFixed(0)} KB`);
}

for (const { slug } of targets) {
  if (only && slug !== only) continue;
  console.log(`▶ ${slug}`);
  const desktop = path.join(src, `${slug}-desktop.webp`);
  const full = path.join(src, `${slug}-full.webp`);
  const mobileFull = path.join(src, `${slug}-mobile-full.webp`);

  if (await exists(desktop)) {
    await save(sharp(desktop).resize(1600, 1000, { fit: 'cover', position: 'top' }).webp({ quality: 80, effort: 6 }), `${slug}-desktop-1600.webp`);
    await save(sharp(desktop).resize(800, 500, { fit: 'cover', position: 'top' }).webp({ quality: 78, effort: 6 }), `${slug}-desktop-800.webp`);
  } else console.warn(`  (missing ${path.basename(desktop)})`);

  if (await exists(full)) {
    await save(sharp(full).resize({ width: 1200 }).webp({ quality: 66, effort: 6 }), `${slug}-full-1200.webp`);
    await save(sharp(full).resize({ width: 700 }).webp({ quality: 64, effort: 6 }), `${slug}-full-700.webp`);
  } else console.warn(`  (missing ${path.basename(full)})`);

  if (await exists(mobileFull)) {
    const { width, height } = await sharp(mobileFull).metadata();
    const screenH = Math.min(height, Math.round((width * 844) / 390)); // phone screen ratio 390:844
    await save(
      sharp(mobileFull).extract({ left: 0, top: 0, width, height: screenH }).resize(480, 1039, { fit: 'cover', position: 'top' }).webp({ quality: 78, effort: 6 }),
      `${slug}-mobile.webp`
    );
    await save(sharp(mobileFull).resize({ width: 400 }).webp({ quality: 64, effort: 6 }), `${slug}-mobile-full.webp`);
  } else console.warn(`  (missing ${path.basename(mobileFull)})`);
}
