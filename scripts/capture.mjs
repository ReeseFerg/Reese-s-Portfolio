/**
 * Visual baseline / comparison capture.
 *
 * Screenshots every route at desktop and mobile so the React port can be diffed
 * against the single-file build it replaces.
 *
 *   node scripts/capture.mjs <baseUrl> <outDir> [--hash]
 *
 * --hash uses the legacy `#/work` routes; without it, real paths (`/work`).
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const [baseUrl, outDir] = process.argv.slice(2);
const useHash = process.argv.includes('--hash');

if (!baseUrl || !outDir) {
  console.error('usage: node scripts/capture.mjs <baseUrl> <outDir> [--hash]');
  process.exit(1);
}

const ROUTES = [
  ['home', ''],
  ['work', '/work'],
  ['about', '/about'],
  ['contact', '/contact'],
  ['case-north-coast-bjj', '/work/north-coast-bjj'],
  ['case-databrew', '/work/databrew'],
  ['case-savr-app', '/work/savr-app'],
  ['case-project-cadence', '/work/project-cadence'],
];

const VIEWPORTS = [
  ['desktop', 1440, 900],
  ['mobile', 390, 844],
];

mkdirSync(outDir, { recursive: true });

// CHROME_PATH lets this reuse an already-downloaded Chromium instead of making
// every machine pull the exact build this Playwright version ships with.
const browser = await chromium.launch(
  process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {},
);

for (const [vpName, width, height] of VIEWPORTS) {
  // Reduced motion pins the typewriter and blinking cursor to a stable frame,
  // so diffs show layout changes rather than whichever letter was mid-type.
  const context = await browser.newContext({
    viewport: { width, height },
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();

  for (const [name, path] of ROUTES) {
    const url = useHash ? `${baseUrl}/${path ? '#' + path : ''}` : `${baseUrl}${path}`;
    await page.goto(url, { waitUntil: 'networkidle' });
    // Hash routes don't reload, so give render() a frame to swap views.
    await page.waitForTimeout(400);
    // The dev panel shows on a localhost dev server but not in a production
    // build, which would otherwise be the only diff between the two.
    await page.addStyleTag({ content: '.dev-panel { display: none !important; }' });
    await page.screenshot({
      path: `${outDir}/${vpName}-${name}.png`,
      fullPage: true,
    });
    console.log(`${vpName}-${name}`);
  }

  await context.close();
}

await browser.close();
