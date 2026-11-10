/**
 * Portfolio screenshot capture.
 *
 * Opens every live demo listed in targets.json in a real browser and saves:
 *   <slug>-desktop.webp       1440×900 viewport @2x  (hero / first screen)
 *   <slug>-full.webp          full page @1x, 1440 wide (capped height)
 *   <slug>-mobile.webp        390×844 viewport @3x  (iPhone-sized)
 *   <slug>-mobile-full.webp   full mobile page @2x (capped height)
 *
 *   node capture.mjs              → every target in targets.json
 *   node capture.mjs my-project   → one slug only (the workflow's "only" input)
 *
 * Runs in GitHub Actions (see .github/workflows/capture-portfolio.yml).
 * The site's optimised images are generated from these sources.
 */
import { chromium, devices } from 'playwright';
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(here, 'out');
await fs.mkdir(outDir, { recursive: true });

const targets = JSON.parse(await fs.readFile(path.join(here, 'targets.json'), 'utf8'));
const only = (process.argv[2] || '').trim();
if (only && !targets.some((t) => t.slug === only)) {
  console.error(`Unknown slug "${only}". Slugs in targets.json: ${targets.map((t) => t.slug).join(', ')}`);
  process.exit(1);
}

const DESKTOP_FULL_CAP = 7000; // CSS px
const MOBILE_FULL_CAP = 5200; // CSS px

async function settle(page, ms) {
  try { await page.waitForLoadState('networkidle', { timeout: 25000 }); } catch {}
  try { await page.evaluate(() => document.fonts && document.fonts.ready); } catch {}
  await page.waitForTimeout(ms);
}

/** Scroll through the page so lazy images load and reveal-on-scroll animations fire. */
async function walkPage(page) {
  await page.evaluate(async () => {
    const wait = (t) => new Promise((r) => setTimeout(r, t));
    const step = Math.max(200, Math.round(window.innerHeight * 0.45));
    let y = 0;
    let guard = 0;
    while (y < document.documentElement.scrollHeight && guard < 400) {
      window.scrollTo(0, y);
      await wait(140);
      y += step;
      guard++;
    }
    window.scrollTo(0, document.documentElement.scrollHeight);
    await wait(900);
    window.scrollTo(0, 0);
    await wait(400);
  });
}

/** Load twice: the second (warm-cache) load renders web fonts exactly as returning visitors see them. */
async function open(page, url, wait) {
  await page.goto(url, { waitUntil: 'load', timeout: 90000 });
  await settle(page, 2000);
  await page.reload({ waitUntil: 'load', timeout: 90000 });
  await settle(page, wait);
  try {
    const fonts = await page.evaluate(() =>
      [...new Set([...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family} ${f.weight} ${f.style}`))]
    );
    console.log(`  fonts: ${fonts.join(' | ') || '(none reported)'}`);
  } catch {}
}

async function toWebp(buf, file, quality = 86) {
  await sharp(buf).webp({ quality, effort: 5 }).toFile(path.join(outDir, file));
  const meta = await sharp(path.join(outDir, file)).metadata();
  console.log(`  saved ${file} ${meta.width}x${meta.height}`);
}

const browser = await chromium.launch();

for (const { slug, url } of targets) {
  if (only && slug !== only) continue;
  console.log(`\n▶ ${slug}  ${url}`);
  try {
    // ---------- Desktop ----------
    const desk = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
      reducedMotion: 'no-preference',
    });
    const dp = await desk.newPage();
    await open(dp, url, 4500);
    await toWebp(await dp.screenshot({ type: 'png' }), `${slug}-desktop.webp`);
    await desk.close();

    // Full desktop page at 1x
    const deskFull = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
      reducedMotion: 'no-preference',
    });
    const dfp = await deskFull.newPage();
    await open(dfp, url, 3500);
    await walkPage(dfp);
    await settle(dfp, 2500);
    const dh = await dfp.evaluate(() => document.documentElement.scrollHeight);
    const fullBuf = await dfp.screenshot({
      type: 'png',
      fullPage: true,
      clip: { x: 0, y: 0, width: 1440, height: Math.min(dh, DESKTOP_FULL_CAP) },
    });
    await toWebp(fullBuf, `${slug}-full.webp`, 84);
    await deskFull.close();

    // ---------- Mobile ----------
    const iphone = devices['iPhone 13'];
    const mob = await browser.newContext({ ...iphone, reducedMotion: 'no-preference' });
    const mp = await mob.newPage();
    await open(mp, url, 4500);
    await toWebp(await mp.screenshot({ type: 'png' }), `${slug}-mobile.webp`);
    await mob.close();

    const mobFull = await browser.newContext({ ...iphone, deviceScaleFactor: 2, reducedMotion: 'no-preference' });
    const mfp = await mobFull.newPage();
    await open(mfp, url, 3500);
    await walkPage(mfp);
    await settle(mfp, 2500);
    const mh = await mfp.evaluate(() => document.documentElement.scrollHeight);
    const mFullBuf = await mfp.screenshot({
      type: 'png',
      fullPage: true,
      clip: { x: 0, y: 0, width: 390, height: Math.min(mh, MOBILE_FULL_CAP) },
    });
    await toWebp(mFullBuf, `${slug}-mobile-full.webp`, 84);
    await mobFull.close();
  } catch (err) {
    console.error(`  ✖ failed: ${err.message}`);
    process.exitCode = 1;
  }
}

await browser.close();
