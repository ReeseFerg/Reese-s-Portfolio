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
  { ok: true; file: string } | { ok: false; reason: 'not-found' | 'ambiguous'; count: number };

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
 *
 * Refusing an ambiguous match is deliberate: guessing which of two identical
 * paragraphs the user meant would silently corrupt the other one. With 120
 * distinct `[TODO: …]` markers a collision should be rare, and refusing beats
 * corrupting.
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

export type PlaceholderBlock = { block: string; className: string | null };

/**
 * Finds the whole `<MediaFrame …>…</MediaFrame>` element carrying `hint`.
 *
 * The browser can't send the source text of a placeholder — it only sees the
 * rendered DOM, and the source is multi-line JSX with attributes and children
 * the DOM doesn't preserve. So the drop sends the hint, which is unique per
 * placeholder, and the block is located here.
 *
 * Returns `null` if the hint isn't found or appears more than once, so an
 * ambiguous drop is refused rather than replacing the wrong figure. Any
 * `className` on the element is handed back so the replacement can keep it —
 * losing `case-cover` would silently change a case study's layout.
 */
export function findPlaceholderBlock(text: string, hint: string): PlaceholderBlock | null {
  const needle = `hint="${hint}"`;
  const first = text.indexOf(needle);
  if (first === -1 || text.indexOf(needle, first + needle.length) !== -1) return null;

  const open = text.lastIndexOf('<MediaFrame', first);
  if (open === -1) return null;

  // MediaFrame placeholders never nest, so the next terminator after the
  // opening tag is this element's own.
  const selfClose = text.indexOf('/>', first);
  const pairClose = text.indexOf('</MediaFrame>', first);

  let end: number;
  if (pairClose === -1 && selfClose === -1) return null;
  else if (pairClose === -1) end = selfClose + 2;
  else if (selfClose === -1 || pairClose < selfClose) end = pairClose + '</MediaFrame>'.length;
  else end = selfClose + 2;

  const block = text.slice(open, end);
  const className = block.match(/className="([^"]*)"/)?.[1] ?? null;
  return { block, className };
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
  return allowed.some((root) => resolved === root || resolved.startsWith(root + path.sep));
}
