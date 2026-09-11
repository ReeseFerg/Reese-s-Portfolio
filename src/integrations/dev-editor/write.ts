import { mkdir, readFile, writeFile } from 'node:fs/promises';
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

export type SaveMediaInput = {
  kind: 'image' | 'video';
  bytes: Buffer;
  filename: string;
  posterBytes: Buffer | null;
  slug: string;
  targetFile: string;
  alt: string;
  width: number;
  height: number;
  /** The exact source text of the placeholder element being replaced. */
  placeholder: string;
  /** Carried over from the placeholder, e.g. "case-cover". */
  className?: string | null;
};

/** Only what a browser will actually decode, so a stray file can't be written. */
const IMAGE_EXT = new Set(['png', 'jpg', 'jpeg', 'webp', 'avif', 'gif', 'svg']);
const VIDEO_EXT = new Set(['mp4', 'webm', 'mov', 'm4v']);

/**
 * Writes a dropped file and rewrites the placeholder that was standing in for it.
 *
 * Images go to src/assets/, imported and passed through `getImage()` from
 * `astro:assets` — the only way to reach Astro's compression/resize pipeline
 * from a plain `.tsx` module, since `<Image>`/`<Picture>` can't be used inside
 * a framework component. A plain `import` alone only gets Vite's hash and
 * copy, not compression. Videos go to public/media/ as plain paths: they are
 * multi-megabyte binaries that gain nothing from the image pipeline and would
 * only bloat the bundle graph.
 */
export async function saveMedia(
  repoRoot: string,
  input: SaveMediaInput,
): Promise<{ file: string; asset: string }> {
  const ext = (input.filename.split('.').pop() ?? '').toLowerCase();
  const allowed = input.kind === 'video' ? VIDEO_EXT : IMAGE_EXT;
  if (!allowed.has(ext)) {
    throw new Error(`${ext || 'that file type'} is not a supported ${input.kind} format.`);
  }

  const stem = `${input.slug}-${Date.now().toString(36)}`;
  // Carried over so a replacement can't silently drop e.g. `case-cover`, which
  // is what gives a case study's hero its full-bleed layout.
  const cls = input.className ? ` className="${input.className}"` : '';

  if (input.kind === 'video') {
    const rel = `public/media/${stem}.${ext}`;
    await writeAsset(repoRoot, rel, input.bytes);

    let posterAttr = '';
    if (input.posterBytes) {
      await writeAsset(repoRoot, `public/media/${stem}-poster.png`, input.posterBytes);
      posterAttr = ` poster="/media/${stem}-poster.png"`;
    }

    const markup =
      `<MediaFrame${cls} video="/media/${stem}.${ext}"${posterAttr}` +
      ` width={${input.width}} height={${input.height}} alt="${input.alt}" />`;
    await replaceMarkup(repoRoot, input.targetFile, input.placeholder, markup);
    return { file: input.targetFile, asset: `/media/${stem}.${ext}` };
  }

  const rel = `src/assets/${stem}.${ext}`;
  await writeAsset(repoRoot, rel, input.bytes);

  const ident = `media${stem.replace(/[^a-zA-Z0-9]/g, '')}`;
  // The getImage import is identical across every call, so it's deduped by
  // replaceMarkup; the source import and getImage() call are unique per
  // image (the identifier embeds the stem) and are always added.
  const getImageImport = `import { getImage } from 'astro:assets';\n`;
  const sourceImport = `import ${ident}Source from '../../assets/${stem}.${ext}';\n`;
  const getImageCall =
    `const ${ident} = await getImage({ src: ${ident}Source, width: ${input.width}, ` +
    `height: ${input.height} });\n`;
  const markup =
    `<MediaFrame${cls} src={${ident}.src} width={${input.width}} height={${input.height}}` +
    ` alt="${input.alt}" />`;

  await replaceMarkup(repoRoot, input.targetFile, input.placeholder, markup, [
    getImageImport,
    sourceImport,
    getImageCall,
  ]);
  return { file: input.targetFile, asset: rel };
}

async function writeAsset(repoRoot: string, rel: string, bytes: Buffer): Promise<void> {
  const abs = path.resolve(repoRoot, rel);
  if (!isInsideAllowedRoot(abs, repoRoot)) {
    throw new Error(`Refusing to write outside src/ or public/media/: ${rel}`);
  }
  await mkdir(path.dirname(abs), { recursive: true });
  await writeFile(abs, bytes);
}

/**
 * Swaps placeholder markup for real markup, prepending any preamble lines
 * (imports, `getImage()` calls) that aren't already in the file. Each line is
 * deduped independently by exact match, so a constant line shared across
 * multiple dropped images (the `getImage` import) is added once while a
 * per-image line (which embeds a unique identifier) is always added. Restores
 * the original file on any failure, so a broken import or a half-written
 * component is not a reachable state.
 */
async function replaceMarkup(
  repoRoot: string,
  file: string,
  before: string,
  after: string,
  preambleLines?: string[],
): Promise<void> {
  const abs = path.resolve(repoRoot, file);
  if (!isInsideAllowedRoot(abs, repoRoot)) {
    throw new Error(`Refusing to write outside src/ or public/media/: ${file}`);
  }

  const original = await readFile(abs, 'utf8');
  let updated = original.replace(before, after);
  const missing = (preambleLines ?? []).filter((line) => !updated.includes(line));
  if (missing.length > 0) updated = missing.join('') + updated;

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
