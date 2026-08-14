/**
 * Functional smoke test for the things a screenshot can't see: the typewriter,
 * theme switching, the command input, keyboard navigation and routing.
 *
 *   node scripts/smoke.mjs [baseUrl]   # defaults to http://localhost:4321
 */
import { chromium } from 'playwright';

const baseUrl = process.argv[2] ?? 'http://localhost:4321';
const browser = await chromium.launch(
  process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {},
);
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const results = [];
const check = async (name, fn) => {
  try {
    await fn();
    results.push([true, name]);
  } catch (err) {
    results.push([false, `${name} — ${err.message.split('\n')[0]}`]);
  }
};
const assert = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

await page.goto(baseUrl, { waitUntil: 'networkidle' });

await check('typewriter types the first phrase', async () => {
  await page.waitForFunction(() => document.querySelector('.phrase')?.textContent?.length > 3, {
    timeout: 5000,
  });
  const t = await page.textContent('.phrase');
  assert('a UX designer'.startsWith(t.trim()), `unexpected phrase text: "${t}"`);
});

await check('clicking a tool re-themes the accent and swaps the mascot', async () => {
  await page.click('.tool:has-text("Figma")');
  const accent = await page.evaluate(() =>
    document.documentElement.style.getPropertyValue('--accent').trim(),
  );
  assert(accent === '#f24e1e', `accent was "${accent}"`);
  assert(await page.locator('svg[data-logo="figma"]').isVisible(), 'figma mascot not shown');
  assert(
    (await page.locator('svg[data-logo="claude"]').count()) === 0,
    'claude mascot still mounted',
  );
  await page.click('.tool:has-text("Claude Code")');
});

await check('typing a slash command opens suggestions and Tab completes', async () => {
  await page.click('#cmd');
  await page.fill('#cmd', '/wo');
  await page.waitForSelector('.suggest.is-open', { timeout: 2000 });
  const rows = await page.locator('.suggest-row').count();
  assert(rows > 0, 'no suggestion rows');
  await page.keyboard.press('Tab');
  assert((await page.inputValue('#cmd')) === '/work', 'Tab did not complete');
});

await check('Enter runs the command, echoes it and navigates', async () => {
  await page.keyboard.press('Enter');
  await page.waitForURL('**/work', { timeout: 3000 });
  assert(await page.locator('.view#work').isVisible(), 'work view not visible');
});

await check('nav marks the current section', async () => {
  const cls = await page.getAttribute('a.nav-link[href="/work"]', 'class');
  assert(cls.includes('is-active'), `nav class was "${cls}"`);
});

await check('work card opens the case study at a real URL', async () => {
  await page.click('.work-card.wc-lead');
  await page.waitForURL('**/work/north-coast-bjj', { timeout: 3000 });
  assert(await page.locator('#case-north-coast-bjj').isVisible(), 'case not visible');
});

await check('case study renders its table of contents and chapters', async () => {
  assert((await page.locator('.toc-link').count()) === 7, 'expected 7 TOC entries');
  assert((await page.locator('.chapter').count()) === 7, 'expected 7 chapters');
});

await check('scrolling a case study advances the TOC and the progress bar', async () => {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.5));
  await page.waitForTimeout(500);
  const active = await page.locator('.toc-link.is-active').count();
  assert(active === 1, `expected exactly 1 active TOC link, got ${active}`);
  const width = await page.evaluate(() => document.getElementById('readBar').style.width);
  assert(parseFloat(width) > 5, `progress bar width was "${width}"`);
});

await check('TOC click jumps to that chapter', async () => {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.click('.toc-link[data-target="bjj-outcome"]');
  // Smooth-scrolling ~7,700px takes well over a second. Waiting on the arrival
  // condition itself is both the wait and the assertion — no guessing at
  // durations, and no heuristic for "has it stopped moving yet".
  await page.waitForFunction(
    () => Math.abs(document.getElementById('bjj-outcome').getBoundingClientRect().top) < 200,
    { timeout: 8000, polling: 100 },
  );
});

await check('back link returns to work', async () => {
  await page.click('.back-link');
  await page.waitForURL('**/work', { timeout: 3000 });
});

await check('deep link to a real URL loads that page directly', async () => {
  await page.goto(`${baseUrl}/work/savr-app`, { waitUntil: 'networkidle' });
  assert(await page.locator('#case-savr-app').isVisible(), 'savr-app not visible');
});

await check('legacy hash URL redirects to the real path', async () => {
  await page.goto(`${baseUrl}/#/work/databrew`, { waitUntil: 'networkidle' });
  await page.waitForURL('**/work/databrew', { timeout: 3000 });
  assert(await page.locator('#case-databrew').isVisible(), 'databrew not visible');
});

await check('unknown path renders the 404 view', async () => {
  await page.goto(`${baseUrl}/work/nope`, { waitUntil: 'networkidle' });
  assert(await page.locator('#not-found').isVisible(), '404 view not visible');
});

await check('arrow keys and Enter drive the question block', async () => {
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.keyboard.press('ArrowDown');
  const label = await page.textContent('.ask-option.is-selected .ask-label');
  assert(label.includes('Work'), `selected option was "${label}"`);
  await page.keyboard.press('Enter');
  await page.waitForURL('**/work', { timeout: 3000 });
});

await check('number keys jump straight to a section', async () => {
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.keyboard.press('3');
  await page.waitForURL('**/contact', { timeout: 3000 });
});

await check('the dev panel is absent from the production build', async () => {
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  assert((await page.locator('.dev-panel').count()) === 0, 'dev panel shipped to production');
});

// The regression test for double-bound listeners under <ClientRouter />: today
// the scroll-spy is only ever exercised via a deep link (a real document load),
// so a listener that fails to rebind — or rebinds twice — after a swap would
// go uncaught. This drives client-side navigation through a case study twice,
// with a stop at a case that honestly has no sidebar in between (only
// north-coast-bjj gets one — see src/pages/work/index.astro), and checks the
// DOM invariant a broken bind/teardown cycle would violate either direction:
// never more than one active TOC link, and never zero once scrolled past the
// first chapter.
await check(
  'navigating home → work → case → back → another case keeps exactly one active TOC link',
  async () => {
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await page.click('a.nav-link[href="/work"]');
    await page.waitForURL('**/work', { timeout: 3000 });

    await page.click('.work-card.wc-lead'); // north-coast-bjj — the only case with a TOC
    await page.waitForURL('**/work/north-coast-bjj', { timeout: 3000 });
    await page.waitForSelector('.toc-link', { timeout: 3000 });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.5));
    await page.waitForTimeout(500);
    let active = await page.locator('.toc-link.is-active').count();
    assert(
      active === 1,
      `case A (north-coast-bjj): expected exactly 1 active TOC link, got ${active}`,
    );

    await page.click('.back-link');
    await page.waitForURL('**/work', { timeout: 3000 });

    // databrew, savr-app and project-cadence don't have a TOC sidebar at all —
    // assert that honestly rather than pretending they do.
    await page.click('a.work-card[href="/work/databrew"]');
    await page.waitForURL('**/work/databrew', { timeout: 3000 });
    await page.waitForSelector('#case-databrew', { timeout: 3000 });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.5));
    await page.waitForTimeout(300);
    assert(
      (await page.locator('.toc-link').count()) === 0,
      'databrew unexpectedly rendered a TOC sidebar',
    );

    // Back to the work index, then a second visit to the TOC-bearing case —
    // the scroll-spy has to rebind cleanly on a revisit, not just once.
    await page.click('.back-link');
    await page.waitForURL('**/work', { timeout: 3000 });
    await page.click('.work-card.wc-lead');
    await page.waitForURL('**/work/north-coast-bjj', { timeout: 3000 });
    await page.waitForSelector('.toc-link', { timeout: 3000 });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.5));
    await page.waitForTimeout(500);
    active = await page.locator('.toc-link.is-active').count();
    assert(
      active === 1,
      `case A revisit (north-coast-bjj): expected exactly 1 active TOC link, got ${active}`,
    );
  },
);

await check('--accent survives a client-side swap', async () => {
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.click('.tool:has-text("Figma")');
  const before = await page.evaluate(() =>
    document.documentElement.style.getPropertyValue('--accent').trim(),
  );
  assert(before === '#f24e1e', `accent was "${before}" before navigating`);

  await page.click('a.nav-link[href="/work"]');
  await page.waitForURL('**/work', { timeout: 3000 });
  // astro:after-swap fires before paint, but give the assertion a beat anyway.
  await page.waitForTimeout(200);
  const after = await page.evaluate(() =>
    document.documentElement.style.getPropertyValue('--accent').trim(),
  );
  assert(after === '#f24e1e', `accent was "${after}" after the swap, expected it to survive`);
});

await check('case pages ship no astro-island element at all', async () => {
  for (const slug of ['north-coast-bjj', 'databrew', 'savr-app', 'project-cadence']) {
    await page.goto(`${baseUrl}/work/${slug}`, { waitUntil: 'networkidle' });
    const count = await page.locator('astro-island').count();
    assert(count === 0, `/work/${slug} shipped ${count} astro-island element(s)`);
  }
});

await check('no console errors anywhere', async () => {
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  for (const path of ['/', '/work', '/about', '/contact', '/work/north-coast-bjj']) {
    await page.goto(baseUrl + path, { waitUntil: 'networkidle' });
  }
  assert(errors.length === 0, errors.join(' | '));
});

await browser.close();

let failed = 0;
for (const [ok, name] of results) {
  if (!ok) failed++;
  console.log(`${ok ? '  ok  ' : ' FAIL '} ${name}`);
}
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
