/**
 * Behaviour checks for the dev-only visual editor.
 *
 * Runs against `astro dev`, not `astro preview`: the editor mounts from
 * astro:server:setup, which never runs in a build, so scripts/smoke.mjs
 * structurally cannot cover any of this.
 *
 *   npm run dev
 *   node scripts/edit-smoke.mjs [baseUrl]   # defaults to http://localhost:5173
 *
 * Every check that writes restores the file afterwards, so a run leaves the
 * working tree exactly as it found it.
 */
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const baseUrl = process.argv[2] ?? 'http://localhost:5173';
const route = '/work/north-coast-bjj';
const CASE_FILE = 'src/content/cases/NorthCoastBjj.tsx';
const MARKER = '[TODO: a statement, not the slug.]';

const results = [];
const check = (name, pass, detail = '') => {
  results.push({ name, pass });
  console.log(`  ${pass ? 'ok  ' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`);
};

// Restoring the file triggers Vite HMR, which reloads the page and destroys the
// execution context the next page.evaluate would run in. Re-navigate after each
// restore so the following check starts from a live page.
const restore = async () => {
  execFileSync('git', ['checkout', '--', CASE_FILE]);
  // Let HMR's own reload fire first, then navigate. Racing it aborts the
  // navigation; retry once, since the abort is the reload winning, not a fault.
  await page.waitForTimeout(600);
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
      return;
    } catch {
      await page.waitForTimeout(800);
    }
  }
  await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded' });
};
const source = () => readFileSync(CASE_FILE, 'utf8');

const post = (page, body) =>
  page.evaluate(async (b) => {
    const res = await fetch('/__edit/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(b),
    });
    return { status: res.status, body: await res.json() };
  }, body);

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`${baseUrl}/work/north-coast-bjj`, { waitUntil: 'networkidle' });

const original = source();

// 1. A real edit reaches disk.
const edited = 'A booking site the club actually uses.';
const ok = await post(page, { route, before: MARKER, after: edited });
check('an edit returns 200', ok.status === 200, JSON.stringify(ok.body));
check('the new text is on disk', source().includes(edited));
check('the marker it replaced is gone', !source().includes(MARKER));
await restore();

// 2. Text that no longer matches is refused, not guessed at.
const stale = await post(page, { route, before: 'NOT_IN_ANY_FILE_xyz', after: 'nope' });
check('stale text is refused with 409', stale.status === 409);

// 3. Characters that would break the parse are refused.
const brace = await post(page, { route, before: MARKER, after: 'a { b' });
check('a brace is refused with 400', brace.status === 400);
check('the file is untouched after a refusal', source() === original);

// 4. An empty replacement would silently delete content.
const empty = await post(page, { route, before: MARKER, after: '   ' });
check('an empty replacement is refused with 400', empty.status === 400);

// 5. A route with no editable source is refused rather than guessed.
const unknown = await post(page, { route: '/nope', before: MARKER, after: 'x' });
check('an unknown route is refused with 403', unknown.status === 403);

// 6. Edit mode makes nodes editable, and leaves nothing behind when off.
//    The "off" state matters: setting contentEditable while idle is what used
//    to make the terminal hydrate against attributes React had not rendered.
await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
check(
  'no contenteditable attributes while edit mode is off',
  (await page.locator('[contenteditable]').count()) === 0,
);
await page.click('#editModeToggle');
await page.waitForTimeout(400);
const editable = await page.locator('[contenteditable="true"]').count();
check('edit mode makes nodes editable', editable > 0, `${editable} nodes`);

// 7. Media placeholders expose the hint the drop handler needs.
await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
await page.click('#editModeToggle');
await page.waitForTimeout(400);
const slots = await page.locator('.media-slot[data-hint]').count();
check('media placeholders are drop targets', slots > 0, `${slots} slots`);

await restore();
await browser.close();

const passed = results.filter((r) => r.pass).length;
console.log(`\n${passed}/${results.length} passed`);
process.exit(passed === results.length ? 0 : 1);
