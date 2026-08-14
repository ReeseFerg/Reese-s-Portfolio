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
 * `npm run check` runs `prettier --check`, and these exact files were verified
 * Prettier-stable during the Astro migration. The `&#32;` entities in
 * contact.astro and 404.astro sit *between* elements and are never inside a
 * replaced span, so a within-node replacement cannot disturb them.
 *
 * On any failure the original content is written back, so a half-formatted or
 * truncated source file is not a reachable state.
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
  // String.replace with a string pattern replaces the first occurrence only.
  // The caller has already proved there is exactly one.
  const updated = original.replace(before, after);

  try {
    await writeFile(abs, updated, 'utf8');
    await formatFile(abs);
  } catch (error) {
    await writeFile(abs, original, 'utf8');
    throw error;
  }
}

export async function formatFile(abs: string): Promise<void> {
  const prettier = await import('prettier');
  const config = await prettier.resolveConfig(abs);
  const info = await prettier.getFileInfo(abs, {
    plugins: config?.plugins as string[] | undefined,
  });
  if (info.ignored || !info.inferredParser) return;

  const text = await readFile(abs, 'utf8');
  const formatted = await prettier.format(text, { ...config, filepath: abs });
  await writeFile(abs, formatted, 'utf8');
}
