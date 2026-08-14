# Dev Visual Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let Reese type portfolio copy directly into the running site and drop in screenshots and video, with every edit written back to the real source files, so a first draft can be written in the browser instead of as a sequence of prompts.

**Architecture:** A dev-only connect middleware, mounted from an Astro integration's `astro:server:setup` hook, receives `{ route, before, after }` from the browser, resolves a small set of candidate source files from the route, requires `before` to appear exactly once across that set, replaces it, and runs Prettier on the file. Vite HMR reloads. Edits land as ordinary uncommitted git changes. Because `astro:server:setup` only runs under `astro dev`, and the site is `output: 'static'` with no production server, the editor cannot ship.

**Tech Stack:** Astro 7, React 19, TypeScript, Vite dev middleware (connect), Prettier programmatic API, Vitest (new), Playwright (already used, `--no-save`).

**Spec:** `docs/superpowers/specs/2026-08-13-dev-visual-editor-design.md`

## Global Constraints

1. **The editor must never reach production.** No `import.meta.env.DEV` guards as the primary mechanism — the code lives behind `astro:server:setup`, which does not run in a build. Every task that adds client code must prove `grep -r "__edit" dist/` is empty.
2. **`src/content/cases/*.tsx` are content, not code.** No IDs, no data layer, no schema, no restructuring. The editor must work against them exactly as they are. The only writes are the string replacements the user themselves triggers.
3. **`.astro` markup is whitespace-sensitive.** JSX strips whitespace-containing-newlines at the edges of an element's children; HTML collapses it to a real space; Astro's `compressHTML` **deletes** newline-adjacent whitespace between sibling tags entirely. `404.astro` and `contact.astro` use `&#32;` entities for load-bearing spaces. Never disturb them.
4. **`<!-- prettier-ignore -->` is unusable.** `prettier-plugin-astro@0.14.1` has a byte-offset/UTF-16 bug that corrupts markup on files containing multi-byte characters.
5. **CSS load order is fixed:** fontsource, then tokens, base, terminal, views, case, dev, **responsive last**. Editor styles go in `src/styles/dev.css`, which is already in that order.
6. **`.prettierignore` keeps ignoring `*.css`.** Stylelint owns CSS.
7. **`eslint-plugin-astro` is pinned to 1.7.0** — 2.x+ requires ESLint ≥10 and this repo is on ESLint 9.
8. **The pixel bar:** `node scripts/pixeldiff.mjs .context/before <dir>` — 14 of 16 images at exactly 0. `desktop-home` and `mobile-home` are expected to differ (pixelmatch 1 each; ~1,553 / 0.120% / max delta 46, and ~1,534 / 0.322% / max delta 44). That is approved font-rasterisation variance, not a regression.
9. **Smoke stays at 20/20.** Serve with `npx astro preview --port 4321`, never `npx vite preview` — it ignores `trailingSlash: 'never'` and serves the homepage shell for every route.
10. **`npm i --no-save <pkg>` prunes previously `--no-save`-installed packages.** Install `playwright pixelmatch pngjs` in one command.
11. **Commit at the end of each task.** Branch `ReeseFerg/dev-visual-editor`. Do not push, do not open a PR.

### One decision this plan makes explicitly

`CLAUDE.md` currently says "No backend, no tests" and "There is no test suite." **This plan adds Vitest**, scoped to the editor's pure logic. The justification: this is the first feature in the repo that *writes to the user's own source files*, and the failure mode is corrupting 120 markers' worth of hand-written case-study copy. Path containment, match uniqueness and replacement validation are exactly the logic that deserves fast, direct tests rather than being exercised only through a browser. Task 7 updates `CLAUDE.md` to say so.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/integrations/dev-editor/resolve.ts` (create) | Pure: route → candidate files, uniqueness matching, replacement validation, path containment. No I/O. |
| `src/integrations/dev-editor/write.ts` (create) | I/O: read, replace, write, Prettier-format a file. |
| `src/integrations/dev-editor/index.ts` (create) | The Astro integration and connect middleware. Wires HTTP to the two modules above. |
| `src/components/dev/editor-client.ts` (create) | DOM: `contentEditable` lifecycle, paste/Enter/Escape handling, save states, media drop targets. |
| `src/components/dev/DevPanel.tsx` (modify, `:63-75`) | Calls `attachEditor()` instead of setting `contentEditable` inline. |
| `src/components/case/MediaFrame.tsx` (modify) | Gains `video`/`poster` props and reduced-motion fallback. |
| `src/lib/site.ts` (modify, `:10-14`, `:26-71`) | `RouteMeta` gains `draft?: true`; add `publishedCaseSlugs()`. |
| `src/lib/seo.ts` (modify, `:4`) | `sitemap()` filters drafts. |
| `src/pages/work/[slug].astro` (modify, `:9-11`) | `getStaticPaths()` filters drafts in production only. |
| `src/pages/work/index.astro` (modify, `:19-63`) | Draft cards not rendered. |
| `src/styles/dev.css` (modify) | Editor visual states. |
| `scripts/edit-smoke.mjs` (create) | Dev-mode behaviour tests. |
| `src/integrations/dev-editor/*.test.ts` (create) | Vitest unit tests for the pure logic. |

---

## Task 1: The pure core — resolver, validator, path containment

The safety-critical logic, with no I/O so it can be tested directly and fast. Everything that decides *whether* a write is allowed lives here; Task 2 does the writing.

**Files:**
- Create: `src/integrations/dev-editor/resolve.ts`
- Create: `src/integrations/dev-editor/resolve.test.ts`
- Modify: `package.json` (add `vitest` devDependency, `test` script)
- Create: `vitest.config.ts`

**Interfaces:**
- Consumes: `CASE_SLUGS` from `src/lib/site.ts`
- Produces:
  ```ts
  export function slugToCaseFile(slug: string): string;          // 'north-coast-bjj' -> 'NorthCoastBjj.tsx'
  export function candidateFiles(route: string): string[];        // repo-relative paths
  export type MatchResult =
    | { ok: true; file: string }
    | { ok: false; reason: 'not-found' | 'ambiguous'; count: number };
  export function findUniqueMatch(
    contents: ReadonlyArray<{ file: string; text: string }>,
    before: string,
  ): MatchResult;
  export type Validation = { ok: true } | { ok: false; reason: string };
  export function validateReplacement(after: string): Validation;
  export function isInsideAllowedRoot(absPath: string, repoRoot: string): boolean;
  ```

- [ ] **Step 1: Add Vitest**

```bash
npm i -D vitest
```

Add to `package.json` scripts, after `"lint:css"`:

```json
"test": "vitest run",
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

// Scoped to the dev editor's pure logic. This is the first feature in the repo
// that writes to the user's own source files, so match uniqueness, replacement
// validation and path containment get direct tests rather than being exercised
// only through a browser.
export default defineConfig({
  test: {
    include: ['src/integrations/**/*.test.ts'],
  },
});
```

- [ ] **Step 2: Write the failing tests**

Create `src/integrations/dev-editor/resolve.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  slugToCaseFile,
  candidateFiles,
  findUniqueMatch,
  validateReplacement,
  isInsideAllowedRoot,
} from './resolve.ts';

describe('slugToCaseFile', () => {
  it('converts a kebab slug to the PascalCase component file', () => {
    expect(slugToCaseFile('north-coast-bjj')).toBe('NorthCoastBjj.tsx');
    expect(slugToCaseFile('savr-app')).toBe('SavrApp.tsx');
    expect(slugToCaseFile('databrew')).toBe('Databrew.tsx');
  });
});

describe('candidateFiles', () => {
  it('maps a case route to exactly its own content file', () => {
    expect(candidateFiles('/work/north-coast-bjj')).toEqual([
      'src/content/cases/NorthCoastBjj.tsx',
    ]);
  });

  it('maps the work index to its page', () => {
    expect(candidateFiles('/work')).toEqual(['src/pages/work/index.astro']);
  });

  it('maps about and contact to their pages', () => {
    expect(candidateFiles('/about')).toEqual(['src/pages/about.astro']);
    expect(candidateFiles('/contact')).toEqual(['src/pages/contact.astro']);
  });

  it('maps the homepage to every file the terminal copy could live in', () => {
    const files = candidateFiles('/');
    expect(files).toContain('src/components/Terminal/Terminal.tsx');
    expect(files).toContain('src/lib/commands.ts');
    expect(files.length).toBeGreaterThan(1);
  });

  it('returns nothing for an unknown route rather than guessing', () => {
    expect(candidateFiles('/nope')).toEqual([]);
    expect(candidateFiles('/work/not-a-case')).toEqual([]);
  });
});

describe('findUniqueMatch', () => {
  const before = '[TODO: a statement, not the slug.]';

  it('finds the one file containing the text', () => {
    const result = findUniqueMatch(
      [
        { file: 'a.tsx', text: `x ${before} y` },
        { file: 'b.tsx', text: 'nothing here' },
      ],
      before,
    );
    expect(result).toEqual({ ok: true, file: 'a.tsx' });
  });

  it('refuses when the text appears in no file', () => {
    const result = findUniqueMatch([{ file: 'a.tsx', text: 'nothing' }], before);
    expect(result).toEqual({ ok: false, reason: 'not-found', count: 0 });
  });

  it('refuses when the text appears twice in one file', () => {
    const result = findUniqueMatch(
      [{ file: 'a.tsx', text: `${before} and again ${before}` }],
      before,
    );
    expect(result).toEqual({ ok: false, reason: 'ambiguous', count: 2 });
  });

  it('refuses when the text appears in two different files', () => {
    const result = findUniqueMatch(
      [
        { file: 'a.tsx', text: before },
        { file: 'b.tsx', text: before },
      ],
      before,
    );
    expect(result).toEqual({ ok: false, reason: 'ambiguous', count: 2 });
  });
});

describe('validateReplacement', () => {
  it('accepts ordinary prose including the punctuation this site uses', () => {
    expect(validateReplacement("Reese's work — a case study · 2026")).toEqual({ ok: true });
    expect(validateReplacement('Résumé, naïve, ✳ and ↗')).toEqual({ ok: true });
  });

  it('rejects characters that would break the JSX or Astro parse', () => {
    for (const bad of ['a { b', 'a } b', 'a < b', 'a > b']) {
      const result = validateReplacement(bad);
      expect(result.ok).toBe(false);
    }
  });

  it('rejects an empty replacement, which would silently delete content', () => {
    expect(validateReplacement('').ok).toBe(false);
    expect(validateReplacement('   ').ok).toBe(false);
  });
});

describe('isInsideAllowedRoot', () => {
  const root = '/repo';

  it('allows paths under src/', () => {
    expect(isInsideAllowedRoot('/repo/src/content/cases/A.tsx', root)).toBe(true);
  });

  it('allows paths under public/media/', () => {
    expect(isInsideAllowedRoot('/repo/public/media/demo.mp4', root)).toBe(true);
  });

  it('rejects traversal outside the repo', () => {
    expect(isInsideAllowedRoot('/repo/../secrets.txt', root)).toBe(false);
    expect(isInsideAllowedRoot('/etc/passwd', root)).toBe(false);
  });

  it('rejects paths inside the repo but outside the two allowed roots', () => {
    expect(isInsideAllowedRoot('/repo/package.json', root)).toBe(false);
    expect(isInsideAllowedRoot('/repo/public/favicon.svg', root)).toBe(false);
  });
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Cannot find module './resolve.ts'`

- [ ] **Step 4: Implement the resolver**

Create `src/integrations/dev-editor/resolve.ts`:

```ts
import path from 'node:path';
import { CASE_SLUGS } from '../../lib/site.ts';

/** Characters that would break the JSX or Astro parse if written into markup. */
const FORBIDDEN = /[{}<>]/;

/** Every file the terminal's copy could live in. `/` has no single source file. */
const HOME_FILES = [
  'src/components/Terminal/Terminal.tsx',
  'src/components/Terminal/CommandInput.tsx',
  'src/components/Terminal/OutputLog.tsx',
  'src/lib/commands.ts',
];

const PAGE_ROUTES: Record<string, string> = {
  '/work': 'src/pages/work/index.astro',
  '/about': 'src/pages/about.astro',
  '/contact': 'src/pages/contact.astro',
};

export function slugToCaseFile(slug: string): string {
  const pascal = slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
  return `${pascal}.tsx`;
}

/**
 * The files an edit made on `route` is allowed to touch.
 *
 * Uniqueness is later required across the whole set rather than per file, which
 * is what makes `/` work: a node's text there could originate in any of several
 * terminal source files, and requiring one match across all of them avoids
 * needing per-node provenance.
 *
 * An unknown route returns nothing rather than a guess.
 */
export function candidateFiles(route: string): string[] {
  const clean = route.replace(/\/+$/, '') || '/';

  if (clean === '/') return [...HOME_FILES];
  if (PAGE_ROUTES[clean]) return [PAGE_ROUTES[clean]];

  const caseMatch = clean.match(/^\/work\/([a-z0-9-]+)$/);
  if (caseMatch) {
    const slug = caseMatch[1];
    if (!(CASE_SLUGS as readonly string[]).includes(slug)) return [];
    return [`src/content/cases/${slugToCaseFile(slug)}`];
  }

  return [];
}

export type MatchResult =
  | { ok: true; file: string }
  | { ok: false; reason: 'not-found' | 'ambiguous'; count: number };

function countOccurrences(haystack: string, needle: string): number {
  if (!needle) return 0;
  let count = 0;
  let index = haystack.indexOf(needle);
  while (index !== -1) {
    count += 1;
    index = haystack.indexOf(needle, index + needle.length);
  }
  return count;
}

/**
 * Requires `before` to appear exactly once across the whole candidate set.
 * Refusing an ambiguous match is deliberate: guessing which of two identical
 * paragraphs the user meant would silently corrupt the other one.
 */
export function findUniqueMatch(
  contents: ReadonlyArray<{ file: string; text: string }>,
  before: string,
): MatchResult {
  let total = 0;
  let found: string | null = null;

  for (const { file, text } of contents) {
    const n = countOccurrences(text, before);
    if (n > 0 && found === null) found = file;
    total += n;
  }

  if (total === 0) return { ok: false, reason: 'not-found', count: 0 };
  if (total > 1) return { ok: false, reason: 'ambiguous', count: total };
  return { ok: true, file: found as string };
}

export type Validation = { ok: true } | { ok: false; reason: string };

export function validateReplacement(after: string): Validation {
  if (after.trim() === '') {
    return { ok: false, reason: 'Replacement is empty — that would delete the content.' };
  }
  if (FORBIDDEN.test(after)) {
    return {
      ok: false,
      reason: 'Text cannot contain { } < > — they would break the JSX or Astro parse.',
    };
  }
  return { ok: true };
}

/** Writes are confined to source and uploaded media. Nothing else is reachable. */
export function isInsideAllowedRoot(absPath: string, repoRoot: string): boolean {
  const resolved = path.resolve(absPath);
  const allowed = [path.join(repoRoot, 'src'), path.join(repoRoot, 'public', 'media')];
  return allowed.some(
    (root) => resolved === root || resolved.startsWith(root + path.sep),
  );
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS, all suites green.

- [ ] **Step 6: Confirm nothing else broke**

Run: `npm run check`
Expected: 0 errors, 0 warnings.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/integrations/
git commit -m "feat: add the dev editor's resolver, validator and path guard"
```

---

## Task 2: The integration and the text endpoint

Wires HTTP to Task 1's logic and performs the write. The endpoint exists only under `astro dev`.

**Files:**
- Create: `src/integrations/dev-editor/write.ts`
- Create: `src/integrations/dev-editor/write.test.ts`
- Create: `src/integrations/dev-editor/index.ts`
- Modify: `astro.config.mjs:21`

**Interfaces:**
- Consumes: everything Task 1 produced.
- Produces:
  ```ts
  // write.ts
  export async function readCandidates(
    repoRoot: string, files: string[],
  ): Promise<Array<{ file: string; text: string }>>;
  export async function applyReplacement(
    repoRoot: string, file: string, before: string, after: string,
  ): Promise<void>;
  // index.ts
  export default function devEditor(): AstroIntegration;
  ```
- The browser contract, relied on by Task 3:
  `POST /__edit/text` with `{ route: string, before: string, after: string }`
  → `200 { file }` | `400 { error }` | `403 { error }` | `409 { error }` | `500 { error }`

- [ ] **Step 1: Write the failing test**

Create `src/integrations/dev-editor/write.test.ts`:

```ts
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { applyReplacement, readCandidates } from './write.ts';

let root: string;

beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), 'dev-editor-'));
  await mkdir(path.join(root, 'src', 'content', 'cases'), { recursive: true });
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

describe('readCandidates', () => {
  it('reads the files that exist and skips the ones that do not', async () => {
    await writeFile(path.join(root, 'src/content/cases/A.tsx'), 'hello');
    const result = await readCandidates(root, [
      'src/content/cases/A.tsx',
      'src/content/cases/Missing.tsx',
    ]);
    expect(result).toEqual([{ file: 'src/content/cases/A.tsx', text: 'hello' }]);
  });
});

describe('applyReplacement', () => {
  it('replaces the text and leaves the rest of the file untouched', async () => {
    const file = 'src/content/cases/A.tsx';
    await writeFile(
      path.join(root, file),
      'export default function A() {\n  return <p>[TODO: write this]</p>;\n}\n',
    );

    await applyReplacement(root, file, '[TODO: write this]', 'A real sentence.');

    const text = await readFile(path.join(root, file), 'utf8');
    expect(text).toContain('A real sentence.');
    expect(text).not.toContain('[TODO: write this]');
    expect(text).toContain('export default function A()');
  });

  it('leaves the file untouched when the write would escape the allowed roots', async () => {
    await expect(
      applyReplacement(root, '../escape.tsx', 'a', 'b'),
    ).rejects.toThrow(/outside/i);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module './write.ts'`

- [ ] **Step 3: Implement the writer**

Create `src/integrations/dev-editor/write.ts`:

```ts
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { isInsideAllowedRoot } from './resolve.ts';

export async function readCandidates(
  repoRoot: string,
  files: string[],
): Promise<Array<{ file: string; text: string }>> {
  const out: Array<{ file: string; text: string }> = [];
  for (const file of files) {
    try {
      out.push({ file, text: await readFile(path.join(repoRoot, file), 'utf8') });
    } catch {
      // A candidate that doesn't exist is not an error — the set is a superset
      // for routes like `/` where the copy could live in any of several files.
    }
  }
  return out;
}

/**
 * Replaces `before` with `after` in `file`, then formats the file with Prettier.
 *
 * Formatting after every write is what stops the editor causing format drift:
 * `npm run check` runs `prettier --check`, and Task 8 of the Astro migration
 * verified these exact files are Prettier-stable. The `&#32;` entities in
 * contact.astro and 404.astro sit *between* elements and are never inside a
 * replaced span, so a within-node replacement cannot disturb them.
 */
export async function applyReplacement(
  repoRoot: string,
  file: string,
  before: string,
  after: string,
): Promise<void> {
  const abs = path.resolve(repoRoot, file);
  if (!isInsideAllowedRoot(abs, repoRoot)) {
    throw new Error(`Refusing to write outside src/ or public/media/: ${file}`);
  }

  const original = await readFile(abs, 'utf8');
  const updated = original.replace(before, after);

  try {
    await writeFile(abs, updated, 'utf8');
    await formatFile(abs);
  } catch (error) {
    await writeFile(abs, original, 'utf8');
    throw error;
  }
}

async function formatFile(abs: string): Promise<void> {
  const prettier = await import('prettier');
  const config = await prettier.resolveConfig(abs);
  const info = await prettier.getFileInfo(abs, { plugins: config?.plugins as string[] });
  if (info.ignored || !info.inferredParser) return;

  const text = await readFile(abs, 'utf8');
  const formatted = await prettier.format(text, {
    ...config,
    filepath: abs,
  });
  await writeFile(abs, formatted, 'utf8');
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Implement the integration**

Create `src/integrations/dev-editor/index.ts`:

```ts
import type { AstroIntegration } from 'astro';
import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  candidateFiles,
  findUniqueMatch,
  validateReplacement,
} from './resolve.ts';
import { applyReplacement, readCandidates } from './write.ts';

type TextEdit = { route?: unknown; before?: unknown; after?: unknown };

function json(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString('utf8');
}

/**
 * In-browser editing that writes back to source, for drafting portfolio copy.
 *
 * Mounted from `astro:server:setup`, which only runs under `astro dev`. The site
 * is `output: 'static'` with no adapter, so there is no production server for
 * this to exist on — it cannot ship, which is a stronger guarantee than an
 * `import.meta.env.DEV` guard (see the orphaned DevPanel chunk in CLAUDE.md).
 */
export default function devEditor(): AstroIntegration {
  return {
    name: 'dev-editor',
    hooks: {
      'astro:server:setup': ({ server }) => {
        const repoRoot = process.cwd();

        server.middlewares.use('/__edit/text', (req, res, next) => {
          if (req.method !== 'POST') return next();

          void (async () => {
            try {
              const body = JSON.parse(await readBody(req)) as TextEdit;
              const { route, before, after } = body;

              if (
                typeof route !== 'string' ||
                typeof before !== 'string' ||
                typeof after !== 'string'
              ) {
                return json(res, 400, { error: 'route, before and after must be strings.' });
              }

              const valid = validateReplacement(after);
              if (!valid.ok) return json(res, 400, { error: valid.reason });

              const files = candidateFiles(route);
              if (files.length === 0) {
                return json(res, 403, { error: `No editable source for route ${route}.` });
              }

              const contents = await readCandidates(repoRoot, files);
              const match = findUniqueMatch(contents, before);

              if (!match.ok) {
                const error =
                  match.reason === 'not-found'
                    ? 'That text is no longer in the source — reload the page and try again.'
                    : `That text appears ${match.count} times — make it unique in the source first.`;
                return json(res, 409, { error });
              }

              await applyReplacement(repoRoot, match.file, before, after);
              return json(res, 200, { file: match.file });
            } catch (error) {
              return json(res, 500, { error: (error as Error).message });
            }
          })();
        });
      },
    },
  };
}
```

- [ ] **Step 6: Register the integration**

Modify `astro.config.mjs`. Add the import at the top, beside the react import:

```js
import devEditor from './src/integrations/dev-editor/index.ts';
```

Change line 21 from `integrations: [react()],` to:

```js
  // devEditor only mounts from astro:server:setup, so it is inert in a build.
  integrations: [react(), devEditor()],
```

- [ ] **Step 7: Verify the endpoint works and does not ship**

```bash
npm run dev &
sleep 6
curl -s -X POST http://localhost:5173/__edit/text \
  -H 'Content-Type: application/json' \
  -d '{"route":"/work/north-coast-bjj","before":"NOT_IN_ANY_FILE_xyz","after":"hello"}'
```
Expected: `{"error":"That text is no longer in the source — reload the page and try again."}` with status 409.

```bash
pkill -f "astro dev"
npm run build && grep -r "__edit" dist/ ; echo "grep exit: $?"
```
Expected: no matches, `grep exit: 1`.

- [ ] **Step 8: Commit**

```bash
git add src/integrations/ astro.config.mjs
git commit -m "feat: add the dev-only text edit endpoint"
```

---

## Task 3: The editor client

Owns everything that happens in the browser for text. Replaces the `contentEditable` handling currently inline in `DevPanel.tsx:63-75`, which also fixes a real dev-only bug.

**Files:**
- Create: `src/components/dev/editor-client.ts`
- Modify: `src/components/dev/DevPanel.tsx:63-75`
- Modify: `src/styles/dev.css`

**Interfaces:**
- Consumes: `POST /__edit/text` from Task 2.
- Produces: `export function attachEditor(selector: string): () => void;` — returns a teardown function.

**The bug being fixed:** `DevPanel.tsx:66` currently runs `el.contentEditable = String(editing)` on mount, writing `contenteditable="false"` onto nodes even when edit mode is off. The terminal then hydrates against a DOM React did not render, producing a hydration mismatch warning on every dev page load. Production is unaffected (0 occurrences in `dist/`), but a permanently red dev console is one you stop reading. Setting the attribute only when editing, and removing it otherwise, fixes it.

- [ ] **Step 1: Write the client**

Create `src/components/dev/editor-client.ts`:

```ts
type SaveState = 'saving' | 'saved' | 'failed';

function setState(el: HTMLElement, state: SaveState | null, message?: string): void {
  el.classList.remove('is-saving', 'is-saved', 'is-failed');
  if (state) el.classList.add(`is-${state}`);
  if (message) el.title = message;
  else el.removeAttribute('title');
}

async function save(el: HTMLElement, before: string, after: string): Promise<void> {
  setState(el, 'saving');
  try {
    const res = await fetch('/__edit/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ route: window.location.pathname, before, after }),
    });
    if (!res.ok) {
      const { error } = (await res.json()) as { error: string };
      setState(el, 'failed', error);
      console.warn('[dev-editor]', error);
      return;
    }
    setState(el, 'saved');
    setTimeout(() => setState(el, null), 1200);
  } catch (error) {
    setState(el, 'failed', (error as Error).message);
  }
}

/**
 * Makes the matched elements editable in place and writes changes back to source.
 *
 * The original text is captured on `focus`, not on `blur`. Reading the node at
 * blur time would return the already-edited text, the server would search for a
 * string that is no longer in the file, and every save would fail. This is the
 * single most important detail in this module.
 */
export function attachEditor(selector: string): () => void {
  const controller = new AbortController();
  const { signal } = controller;
  const originals = new WeakMap<HTMLElement, string>();
  const els = [...document.querySelectorAll<HTMLElement>(selector)];

  for (const el of els) {
    el.contentEditable = 'true';
    el.classList.add('is-editable');
  }

  document.addEventListener(
    'focusin',
    (event) => {
      const el = (event.target as HTMLElement).closest<HTMLElement>(selector);
      if (el) originals.set(el, el.textContent ?? '');
    },
    { signal },
  );

  document.addEventListener(
    'focusout',
    (event) => {
      const el = (event.target as HTMLElement).closest<HTMLElement>(selector);
      if (!el) return;
      const before = originals.get(el);
      const after = el.textContent ?? '';
      if (before === undefined || before === after) return;
      void save(el, before, after);
    },
    { signal },
  );

  // contentEditable inserts <div> or <br> on Enter, which would go into the JSX
  // source as markup. Enter commits instead. Escape restores the original.
  document.addEventListener(
    'keydown',
    (event) => {
      const el = (event.target as HTMLElement).closest<HTMLElement>(selector);
      if (!el) return;
      if (event.key === 'Enter') {
        event.preventDefault();
        el.blur();
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        const before = originals.get(el);
        if (before !== undefined) el.textContent = before;
        setState(el, null);
        el.blur();
      }
    },
    { signal },
  );

  // Pasting from a browser or Notion carries <span style="..."> with it, which
  // would land in the JSX source. Force plain text.
  document.addEventListener(
    'paste',
    (event) => {
      const el = (event.target as HTMLElement).closest<HTMLElement>(selector);
      if (!el) return;
      event.preventDefault();
      const text = event.clipboardData?.getData('text/plain') ?? '';
      document.execCommand('insertText', false, text.replace(/\s+/g, ' '));
    },
    { signal },
  );

  return () => {
    controller.abort();
    for (const el of els) {
      el.removeAttribute('contenteditable');
      el.classList.remove('is-editable', 'is-saving', 'is-saved', 'is-failed');
    }
  };
}
```

- [ ] **Step 2: Call it from DevPanel**

Modify `src/components/dev/DevPanel.tsx`. Add the import at the top:

```ts
import { attachEditor } from './editor-client.ts';
```

Replace the effect at lines 63-75 with:

```tsx
  useEffect(() => {
    if (!editing) return;
    return attachEditor(EDITABLE);
  }, [editing]);
```

- [ ] **Step 3: Add the visual states**

Append to `src/styles/dev.css`:

```css
.is-editable { outline: 1px dashed var(--muted); outline-offset: 4px; }
.is-editable:focus { outline: 1px solid var(--accent); }
.is-saving { outline-color: var(--muted); opacity: 0.7; }
.is-saved { outline-color: #4ade80; }
.is-failed { outline: 2px solid #f87171; }
```

- [ ] **Step 4: Verify the hydration warning is gone and a real edit persists**

```bash
npm run dev &
sleep 6
```

In a browser at `http://localhost:5173/`: open the console, confirm **no hydration mismatch warning**. Then go to `/work/north-coast-bjj`, enable edit mode in the dev panel, click the `.case-title`, replace the text, press Enter, and confirm:

```bash
grep -c "a statement, not the slug" src/content/cases/NorthCoastBjj.tsx
```
Expected: `0` — the marker is gone from the source file.

```bash
git checkout src/content/cases/NorthCoastBjj.tsx
pkill -f "astro dev"
```

- [ ] **Step 5: Confirm production is untouched**

```bash
npm run build
grep -r "__edit\|attachEditor" dist/ ; echo "grep exit: $?"
npm run check
```
Expected: no matches (`grep exit: 1`), check green.

- [ ] **Step 6: Commit**

```bash
git add src/components/dev/ src/styles/dev.css
git commit -m "feat: edit text in place and save it back to source"
```

---

## Task 4: Video support in MediaFrame

Independent of the editor — a dropped video has nowhere to render until this exists.

**Files:**
- Modify: `src/components/case/MediaFrame.tsx`
- Modify: `src/styles/case.css`

**Interfaces:**
- Produces: `MediaFrame` accepts `video?: string` and `poster?: string`, used by Task 5.

- [ ] **Step 1: Add the props and the video branch**

Modify `src/components/case/MediaFrame.tsx`. Add to the `Props` type, after `height?: number;`:

```ts
  /** Public path to a silent looping clip, e.g. "/media/bjj-booking.mp4". */
  video?: string;
  /** Public path to the still shown before play and under reduced motion. */
  poster?: string;
```

Add `video` and `poster` to the destructured parameters, then replace the `{src ? (...) : (...)}` block with:

```tsx
        {video ? (
          // Silent looping prototype walkthroughs, so no controls. Under reduced
          // motion the poster stands in as a still image and nothing autoplays,
          // matching how the rest of the site treats movement.
          <>
            <video
              className="media-video"
              src={video}
              poster={poster}
              width={width}
              height={height}
              autoPlay
              loop
              muted
              playsInline
              aria-label={alt}
              style={width && height ? { aspectRatio: `${width} / ${height}` } : undefined}
            />
            {poster && (
              <img
                className="media-video-still"
                src={poster}
                alt={alt ?? ''}
                width={width}
                height={height}
                style={width && height ? { aspectRatio: `${width} / ${height}` } : undefined}
              />
            )}
          </>
        ) : src ? (
          <img
            src={src}
            alt={alt ?? ''}
            width={width}
            height={height}
            loading="lazy"
            decoding="async"
            style={width && height ? { aspectRatio: `${width} / ${height}` } : undefined}
          />
        ) : (
          <div className="media-slot">
            {hint && <span className="slot-hint">{hint}</span>}
            {children}
          </div>
        )}
```

- [ ] **Step 2: Add the reduced-motion swap**

Append to `src/styles/case.css`:

```css
.media-video-still { display: none; }

@media (prefers-reduced-motion: reduce) {
  .media-video { display: none; }
  .media-video-still { display: block; }
}
```

- [ ] **Step 3: Verify both states render**

Temporarily add to `src/content/cases/Databrew.tsx`, inside the first chapter:

```tsx
<MediaFrame video="/media/test.mp4" poster="/media/test.png" width={1600} height={900} alt="test" />
```

Put any small mp4 at `public/media/test.mp4` and any png at `public/media/test.png`, then:

```bash
npm run dev &
sleep 6
```

In the browser at `/work/databrew`, confirm the clip autoplays silently and loops. Then in DevTools, Rendering → "Emulate CSS prefers-reduced-motion: reduce", reload, and confirm the still shows instead and nothing plays.

```bash
pkill -f "astro dev"
git checkout src/content/cases/Databrew.tsx
rm -f public/media/test.mp4 public/media/test.png
```

- [ ] **Step 4: Confirm nothing moved**

```bash
npm run build && npx astro preview --port 4321 &
sleep 8
node scripts/capture.mjs http://localhost:4321 .context/after-t4
node scripts/pixeldiff.mjs .context/before .context/after-t4
node scripts/smoke.mjs
pkill -f "astro preview"
npm run check
```
Expected: 14 images at 0, the two home images at their approved values, smoke 20/20, check green.

- [ ] **Step 5: Commit**

```bash
git add src/components/case/MediaFrame.tsx src/styles/case.css
git commit -m "feat: render silent looping video in MediaFrame with a reduced-motion still"
```

---

## Task 5: Media drop and upload

**Files:**
- Modify: `src/integrations/dev-editor/index.ts`
- Modify: `src/components/dev/editor-client.ts`
- Modify: `src/styles/dev.css`

**Interfaces:**
- Consumes: `attachEditor` from Task 3, `MediaFrame`'s `video`/`poster` props from Task 4.
- Produces: `POST /__edit/media`, multipart, fields `route`, `alt`, `width`, `height`, `kind` (`image` | `video`), `placeholder` (the exact placeholder markup to replace), file `file`, optional file `poster`.

- [ ] **Step 1: Add the media endpoint**

Add to `src/integrations/dev-editor/index.ts`, inside the same `astro:server:setup` hook after the text middleware. Uses the platform `Request`/`FormData` rather than a multipart dependency:

```ts
        server.middlewares.use('/__edit/media', (req, res, next) => {
          if (req.method !== 'POST') return next();

          void (async () => {
            try {
              const chunks: Buffer[] = [];
              for await (const chunk of req) chunks.push(chunk as Buffer);
              const form = await new Response(Buffer.concat(chunks), {
                headers: { 'content-type': req.headers['content-type'] ?? '' },
              }).formData();

              const route = String(form.get('route') ?? '');
              const kind = String(form.get('kind') ?? '');
              const alt = String(form.get('alt') ?? '').trim();
              const width = Number(form.get('width'));
              const height = Number(form.get('height'));
              const placeholder = String(form.get('placeholder') ?? '');
              const file = form.get('file');

              if (!(file instanceof File)) {
                return json(res, 400, { error: 'No file received.' });
              }
              if (kind === 'image' && alt === '') {
                return json(res, 400, {
                  error: 'Alt text is required — describe what the image shows.',
                });
              }

              const files = candidateFiles(route);
              if (files.length === 0) {
                return json(res, 403, { error: `No editable source for route ${route}.` });
              }
              const contents = await readCandidates(repoRoot, files);
              const match = findUniqueMatch(contents, placeholder);
              if (!match.ok) {
                return json(res, 409, {
                  error:
                    match.reason === 'not-found'
                      ? 'That placeholder is no longer in the source — reload and try again.'
                      : `That placeholder appears ${match.count} times — make it unique first.`,
                });
              }

              const result = await saveMedia(repoRoot, {
                kind: kind as 'image' | 'video',
                file,
                poster: form.get('poster') instanceof File ? (form.get('poster') as File) : null,
                slug: route.split('/').pop() ?? 'media',
                targetFile: match.file,
                alt,
                width,
                height,
                placeholder,
              });

              return json(res, 200, result);
            } catch (error) {
              return json(res, 500, { error: (error as Error).message });
            }
          })();
        });
```

- [ ] **Step 2: Implement `saveMedia`**

Add to `src/integrations/dev-editor/write.ts`:

```ts
import { mkdir } from 'node:fs/promises';

type SaveMediaInput = {
  kind: 'image' | 'video';
  file: File;
  poster: File | null;
  slug: string;
  targetFile: string;
  alt: string;
  width: number;
  height: number;
  placeholder: string;
};

/**
 * Images are imported so Vite hashes, compresses and cache-busts them — the
 * contract MediaFrame.tsx:5-8 already documents. Videos are multi-megabyte
 * binaries that gain nothing from the image pipeline, so they stay plain paths
 * under public/ and never enter the bundle.
 */
export async function saveMedia(
  repoRoot: string,
  input: SaveMediaInput,
): Promise<{ file: string; asset: string }> {
  const ext = input.file.name.split('.').pop()?.toLowerCase() ?? 'bin';
  const stem = `${input.slug}-${Date.now().toString(36)}`;
  const bytes = Buffer.from(await input.file.arrayBuffer());

  if (input.kind === 'video') {
    const rel = `public/media/${stem}.${ext}`;
    const abs = path.resolve(repoRoot, rel);
    if (!isInsideAllowedRoot(abs, repoRoot)) throw new Error('Refusing to write outside.');
    await mkdir(path.dirname(abs), { recursive: true });
    await writeFile(abs, bytes);

    let posterAttr = '';
    if (input.poster) {
      const posterRel = `public/media/${stem}-poster.png`;
      await writeFile(
        path.resolve(repoRoot, posterRel),
        Buffer.from(await input.poster.arrayBuffer()),
      );
      posterAttr = ` poster="/media/${stem}-poster.png"`;
    }

    const markup =
      `<MediaFrame video="/media/${stem}.${ext}"${posterAttr}` +
      ` width={${input.width}} height={${input.height}} alt="${input.alt}" />`;
    await replaceMarkup(repoRoot, input.targetFile, input.placeholder, markup);
    return { file: input.targetFile, asset: `/media/${stem}.${ext}` };
  }

  const rel = `src/assets/${stem}.${ext}`;
  const abs = path.resolve(repoRoot, rel);
  if (!isInsideAllowedRoot(abs, repoRoot)) throw new Error('Refusing to write outside.');
  await mkdir(path.dirname(abs), { recursive: true });
  await writeFile(abs, bytes);

  const ident = `media${stem.replace(/[^a-zA-Z0-9]/g, '')}`;
  const importLine = `import ${ident} from '../../assets/${stem}.${ext}';\n`;
  const markup =
    `<MediaFrame src={${ident}} width={${input.width}} height={${input.height}}` +
    ` alt="${input.alt}" />`;

  await replaceMarkup(repoRoot, input.targetFile, input.placeholder, markup, importLine);
  return { file: input.targetFile, asset: rel };
}

async function replaceMarkup(
  repoRoot: string,
  file: string,
  before: string,
  after: string,
  importLine?: string,
): Promise<void> {
  const abs = path.resolve(repoRoot, file);
  if (!isInsideAllowedRoot(abs, repoRoot)) throw new Error('Refusing to write outside.');
  const original = await readFile(abs, 'utf8');
  let updated = original.replace(before, after);
  if (importLine && !updated.includes(importLine)) updated = importLine + updated;

  try {
    await writeFile(abs, updated, 'utf8');
    await formatFile(abs);
  } catch (error) {
    await writeFile(abs, original, 'utf8');
    throw error;
  }
}
```

Export `formatFile` from `write.ts` (change `async function formatFile` to `export async function formatFile`).

- [ ] **Step 3: Add drop handling to the client**

Add to `src/components/dev/editor-client.ts`, and call `attachMediaDrops(signal)` from inside `attachEditor` before the return:

```ts
async function measure(file: File): Promise<{ width: number; height: number; poster?: Blob }> {
  const url = URL.createObjectURL(file);
  try {
    if (file.type.startsWith('video/')) {
      const video = document.createElement('video');
      video.src = url;
      video.muted = true;
      await new Promise((ok) => video.addEventListener('loadeddata', ok, { once: true }));
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);
      const poster = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, 'image/png'));
      return { width: video.videoWidth, height: video.videoHeight, poster: poster ?? undefined };
    }
    const img = new Image();
    img.src = url;
    await img.decode();
    return { width: img.naturalWidth, height: img.naturalHeight };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function attachMediaDrops(signal: AbortSignal): void {
  for (const slot of document.querySelectorAll<HTMLElement>('.media-slot')) {
    slot.classList.add('is-drop-target');

    slot.addEventListener('dragover', (e) => e.preventDefault(), { signal });

    slot.addEventListener(
      'drop',
      (event) => {
        event.preventDefault();
        void (async () => {
          const file = event.dataTransfer?.files?.[0];
          if (!file) return;
          const kind = file.type.startsWith('video/') ? 'video' : 'image';

          let alt = '';
          if (kind === 'image') {
            alt = window.prompt('Alt text — what does this image show?')?.trim() ?? '';
            if (!alt) return;
          }

          const { width, height, poster } = await measure(file);
          const form = new FormData();
          form.set('route', window.location.pathname);
          form.set('kind', kind);
          form.set('alt', alt);
          form.set('width', String(width));
          form.set('height', String(height));
          form.set('placeholder', slot.dataset.placeholder ?? '');
          form.set('file', file);
          if (poster) form.set('poster', new File([poster], 'poster.png'));

          const res = await fetch('/__edit/media', { method: 'POST', body: form });
          if (!res.ok) {
            const { error } = (await res.json()) as { error: string };
            console.warn('[dev-editor]', error);
            slot.classList.add('is-failed');
          }
        })();
      },
      { signal },
    );
  }
}
```

- [ ] **Step 4: Give each placeholder its source markup**

The client needs to tell the server which placeholder to replace. Modify `MediaFrame.tsx`'s placeholder branch to carry a dev-only marker:

```tsx
          <div className="media-slot" data-placeholder={import.meta.env.DEV ? hint : undefined}>
```

`hint` is unique per placeholder within a case file (`"cover — 1600×900"`, and so on). The server's uniqueness check catches any that are not.

- [ ] **Step 5: Add drop-target styling**

Append to `src/styles/dev.css`:

```css
.is-drop-target { transition: outline-color 0.15s; }
.is-drop-target:hover { outline: 2px dashed var(--accent); outline-offset: 2px; }
```

- [ ] **Step 6: Verify a real drop end to end**

```bash
npm run dev &
sleep 6
```

At `/work/north-coast-bjj` with edit mode on, drag a PNG onto the cover placeholder, give it alt text, then:

```bash
ls src/assets/
grep -n "MediaFrame src=" src/content/cases/NorthCoastBjj.tsx
grep -c "^import media" src/content/cases/NorthCoastBjj.tsx
npm run check
```
Expected: the file is in `src/assets/`, the `<MediaFrame src={…} …>` call replaced the placeholder, the import was added, and check passes.

```bash
git checkout src/content/cases/NorthCoastBjj.tsx && rm -f src/assets/*.png
pkill -f "astro dev"
```

- [ ] **Step 7: Commit**

```bash
git add src/integrations/ src/components/ src/styles/dev.css
git commit -m "feat: drop images and video onto placeholders and write the markup"
```

---

## Task 6: The draft flag

**Files:**
- Modify: `src/lib/site.ts:10-14`, `:26-71`
- Modify: `src/lib/seo.ts:4`
- Modify: `src/pages/work/[slug].astro:9-11`
- Modify: `src/pages/work/index.astro:19-63`
- Create: `src/integrations/dev-editor/drafts.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export function isDraft(path: string): boolean;
  export function publishedCaseSlugs(): readonly string[];
  ```

- [ ] **Step 1: Write the failing test**

Create `src/integrations/dev-editor/drafts.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { ROUTES, isDraft, publishedCaseSlugs } from '../../lib/site.ts';
import { sitemap } from '../../lib/seo.ts';

describe('draft routes', () => {
  it('marks exactly the unwritten case studies as drafts', () => {
    expect(isDraft('/work/north-coast-bjj')).toBe(false);
    expect(isDraft('/work/databrew')).toBe(true);
    expect(isDraft('/work/savr-app')).toBe(true);
    expect(isDraft('/work/project-cadence')).toBe(true);
  });

  it('never marks a non-case page as a draft', () => {
    for (const p of ['/', '/work', '/about', '/contact']) {
      expect(isDraft(p)).toBe(false);
    }
  });

  it('publishedCaseSlugs returns only the published ones', () => {
    expect(publishedCaseSlugs()).toEqual(['north-coast-bjj']);
  });

  it('keeps every route in ROUTES so drafts still have their meta in dev', () => {
    expect(ROUTES.some((r) => r.path === '/work/databrew')).toBe(true);
  });

  it('excludes drafts from the sitemap', () => {
    const xml = sitemap();
    expect(xml).toContain('/work/north-coast-bjj');
    expect(xml).not.toContain('/work/databrew');
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test`
Expected: FAIL — `isDraft is not a function`.

- [ ] **Step 3: Add the flag**

Modify `src/lib/site.ts`. Add to `RouteMeta` after `description: string;`:

```ts
  /**
   * Not ready to be seen. Drafts build under `astro dev` so they can be worked
   * on, but are excluded from the production build, from /work's cards and from
   * the sitemap — a case study still full of [TODO: …] markers reads as
   * abandoned rather than in-progress.
   */
  draft?: true;
```

Add `draft: true,` to the `/work/databrew`, `/work/savr-app` and `/work/project-cadence` entries (lines 57, 62, 67).

Append after `metaForPath`:

```ts
export function isDraft(path: string): boolean {
  return ROUTES.find((r) => r.path === path)?.draft === true;
}

export function publishedCaseSlugs(): readonly string[] {
  return CASE_SLUGS.filter((slug) => !isDraft(`/work/${slug}`));
}
```

- [ ] **Step 4: Filter the sitemap**

Modify `src/lib/seo.ts` line 4:

```ts
  const urls = ROUTES.filter((r) => !r.draft)
    .map((r) => `  <url><loc>${SITE_URL}${r.path}</loc></url>`)
    .join('\n');
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS.

- [ ] **Step 6: Filter the build and add the link assertion**

Modify `src/pages/work/[slug].astro`. Replace `getStaticPaths` (lines 9-11):

```ts
export function getStaticPaths() {
  // Drafts build in dev so they can be worked on, and are absent from the
  // production build so their [TODO: …] markers are never public.
  const slugs = import.meta.env.DEV ? CASE_SLUGS : publishedCaseSlugs();
  return slugs.map((slug) => ({ params: { slug } }));
}
```

Update the import on line 3 to include `publishedCaseSlugs`.

Add above `getStaticPaths`, so the build fails rather than shipping a dead link:

```ts
// The case studies link to each other. Publishing only some of them would
// otherwise leave a published case ending in a link to a route that no longer
// exists in the build. Fail loudly instead — rewriting the link would mean
// editing content files, which is out of bounds.
if (!import.meta.env.DEV) {
  const published = new Set(publishedCaseSlugs());
  for (const slug of published) {
    const source = await import(`../../content/cases/${slugToCaseFile(slug)}?raw`);
    const links = [...String(source.default).matchAll(/href="\/work\/([a-z0-9-]+)"/g)];
    for (const [, target] of links) {
      if (!published.has(target)) {
        throw new Error(
          `${slug} links to /work/${target}, which is a draft and will not exist in ` +
            `the build. Point that link at /work or publish ${target}.`,
        );
      }
    }
  }
}
```

Import `slugToCaseFile` from `../../integrations/dev-editor/resolve.ts`.

- [ ] **Step 7: Hide draft cards**

Modify `src/pages/work/index.astro`. Add to the frontmatter:

```ts
import { isDraft } from '../../lib/site.ts';
```

Wrap each of the three draft cards (lines 30, 42, 53) in a conditional. **Keep the opening `{` and closing `}` on the same lines as the tags** so no whitespace is introduced at element edges — constraint 3:

```astro
        {!isDraft('/work/databrew') && (
          <a class="work-card" href="/work/databrew">
            ...unchanged...
          </a>
        )}
```

- [ ] **Step 8: Verify the whole flag**

```bash
npm run dev &
sleep 6
curl -s -o /dev/null -w "draft in dev: %{http_code}\n" http://localhost:5173/work/databrew
pkill -f "astro dev"

npm run build
ls dist/work/
grep -c "databrew" dist/sitemap.xml
grep -c "work/databrew" dist/work/index.html
```
Expected: 200 in dev; `dist/work/` contains only `index.html` and `north-coast-bjj/`; 0 in the sitemap; 0 in the work index.

Then confirm the assertion fires:

```bash
# NorthCoastBjj.tsx:353 links to /work/databrew, which is now a draft
npm run build 2>&1 | grep -i "links to /work/databrew"
```
Expected: the build fails with that message. Fix by changing `NorthCoastBjj.tsx:353`'s `href` to `/work`, then rebuild and confirm it succeeds.

- [ ] **Step 9: Confirm nothing moved**

```bash
npx astro preview --port 4321 &
sleep 8
node scripts/capture.mjs http://localhost:4321 .context/after-t6
node scripts/pixeldiff.mjs .context/before .context/after-t6
pkill -f "astro preview"
```

Expected: `/work` **will** differ now — three cards are gone, which is the intended change. Every other route must be unchanged. Record the `/work` numbers and state plainly that they are intended.

- [ ] **Step 10: Commit**

```bash
git add src/lib/ src/pages/ src/integrations/
git commit -m "feat: hide unfinished case studies behind a draft flag"
```

---

## Task 7: Dev-mode tests, docs, and proof it does not ship

**Files:**
- Create: `scripts/edit-smoke.mjs`
- Modify: `scripts/README.md`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Write the dev-mode smoke script**

Create `scripts/edit-smoke.mjs`:

```js
/**
 * Behaviour tests for the dev-only editor. Runs against `astro dev`, not
 * `astro preview` — the editor does not exist in a production build, so
 * scripts/smoke.mjs structurally cannot cover it.
 *
 *   npm run dev &
 *   node scripts/edit-smoke.mjs [baseUrl]   # defaults to http://localhost:5173
 */
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const baseUrl = process.argv[2] ?? 'http://localhost:5173';
const CASE_FILE = 'src/content/cases/NorthCoastBjj.tsx';
const results = [];
const check = (name, pass, detail = '') => {
  results.push({ name, pass, detail });
  console.log(`  ${pass ? 'ok  ' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`);
};

const post = async (page, body) =>
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

const original = readFileSync(CASE_FILE, 'utf8');
const marker = '[TODO: a statement, not the slug.]';

// 1. A real edit reaches disk
const ok = await post(page, {
  route: '/work/north-coast-bjj',
  before: marker,
  after: 'A booking site the club actually uses.',
});
check('an edit writes to the source file', ok.status === 200);
check(
  'the new text is on disk',
  readFileSync(CASE_FILE, 'utf8').includes('A booking site the club actually uses.'),
);
execFileSync('git', ['checkout', CASE_FILE]);

// 2. Stale text is refused
const stale = await post(page, {
  route: '/work/north-coast-bjj',
  before: 'NOT_IN_ANY_FILE_xyz',
  after: 'nope',
});
check('stale text is refused with 409', stale.status === 409);

// 3. Parse-breaking characters are refused
const bad = await post(page, {
  route: '/work/north-coast-bjj',
  before: marker,
  after: 'a { b',
});
check('a brace is refused with 400', bad.status === 400);
check('the file is unchanged after a refusal', readFileSync(CASE_FILE, 'utf8') === original);

// 4. An unknown route is refused
const unknown = await post(page, { route: '/nope', before: marker, after: 'x' });
check('an unknown route is refused with 403', unknown.status === 403);

await browser.close();

const passed = results.filter((r) => r.pass).length;
console.log(`\n${passed}/${results.length} passed`);
process.exit(passed === results.length ? 0 : 1);
```

- [ ] **Step 2: Run it**

```bash
npm run dev &
sleep 6
node scripts/edit-smoke.mjs
pkill -f "astro dev"
git status --short
```
Expected: all checks pass, working tree clean.

- [ ] **Step 3: Prove the editor does not ship**

```bash
npm run build
grep -r "__edit\|attachEditor\|dev-editor" dist/ ; echo "grep exit: $?"
npx astro preview --port 4321 &
sleep 8
node scripts/capture.mjs http://localhost:4321 .context/after-t7
node scripts/pixeldiff.mjs .context/before .context/after-t7
node scripts/smoke.mjs
pkill -f "astro preview"
npm run check && npm test
```
Expected: no matches (`grep exit: 1`); pixel diff unchanged except the intended `/work` change from Task 6; smoke 20/20; check and test green.

- [ ] **Step 4: Document it**

Add to `scripts/README.md` alongside the existing entries:

```
edit-smoke.mjs   4 behaviour checks for the dev-only editor. Runs against
                 `astro dev`, not `astro preview` — the editor does not exist
                 in a production build.
```

Add a section to `CLAUDE.md` after the dev panel paragraph:

```markdown
**The visual editor is dev-only by construction, not by a flag.**
`src/integrations/dev-editor/` mounts a connect middleware from Astro's
`astro:server:setup` hook, which only runs under `astro dev`. The site is
`output: 'static'` with no adapter, so there is no production server for it to
live on — unlike the DevPanel's `import.meta.env.DEV` guard, which still leaks
an orphaned chunk into `dist/`. Turning on "edit text" in the dev panel makes
everything in `DevPanel.tsx`'s `EDITABLE` list editable in place; each edit
POSTs `{ route, before, after }` and the server replaces that exact string in
the one source file that contains it, then runs Prettier on it. **It refuses
rather than guesses:** text that appears twice, text that no longer matches, and
text containing `{ } < >` are all rejected. Edits land as uncommitted working-tree
changes — `git checkout` and `git stash` will discard them, so commit as you go.
Tested by `scripts/edit-smoke.mjs` against `astro dev`; `scripts/smoke.mjs` runs
against a production preview and structurally cannot cover this.

**Unfinished case studies are hidden behind `draft: true` in `src/lib/site.ts`.**
Drafts build under `astro dev` so they can be worked on, and are excluded from
the production build, from `/work`'s cards and from the sitemap. Because the case
studies link to each other, `work/[slug].astro` fails the build if a published
case links to a draft one rather than shipping a dead link.
```

Also update the "no test suite" claim: `npm test` now runs Vitest over
`src/integrations/**/*.test.ts`.

- [ ] **Step 5: Commit**

```bash
git add scripts/ CLAUDE.md
git commit -m "test: add dev-mode editor checks and document the editor"
```

---

## Self-Review

**Spec coverage.** Component 1 (integration) → Task 2. Component 2 (resolver) → Task 1. Component 3 (editor client) → Task 3. Component 4 (MediaFrame video) → Task 4. Component 5 (media drops) → Task 5. Component 6 (draft flag) → Task 6. Error-handling table → Tasks 1 and 2. Testing section → Tasks 1, 2, 6 (unit) and 7 (dev-mode + production cleanliness). The spec's "known caveat" about uncommitted edits → Task 7's `CLAUDE.md` text.

**Type consistency.** `slugToCaseFile`, `candidateFiles`, `findUniqueMatch`, `validateReplacement`, `isInsideAllowedRoot` are defined in Task 1 and consumed under those exact names in Tasks 2, 5 and 6. `readCandidates`, `applyReplacement`, `saveMedia`, `formatFile` are defined in Tasks 2 and 5 and used consistently. `attachEditor(selector) => teardown` is defined in Task 3 and used in Task 3's DevPanel change. `isDraft` / `publishedCaseSlugs` are defined in Task 6 and used in Tasks 6's page changes and its test.

**One gap found and closed while reviewing:** Task 6's build-time link assertion needs `slugToCaseFile`, which lives in `src/integrations/dev-editor/resolve.ts` — a module otherwise only used in dev. That import is in a `getStaticPaths` context, so it runs at build time in Node and is not shipped to the client; the step above states the import explicitly.

**Known risk to watch during execution:** Task 5 Step 4 uses `MediaFrame`'s `hint` as the placeholder key. Hints are unique within a case file today, but nothing enforces it. The server's uniqueness check turns a collision into a clear refusal rather than a wrong write, which is the correct failure mode — but if a collision shows up in practice, the fix is to make the hint text unique in the content file, not to weaken the check.
