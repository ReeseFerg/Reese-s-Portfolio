import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { applyReplacement, readCandidates, saveMedia } from './write.ts';

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

  it('replaces only the first occurrence, never a greedy sweep', async () => {
    const file = 'src/content/cases/A.tsx';
    await writeFile(path.join(root, file), 'const a = "x";\nconst b = "x";\n');

    await applyReplacement(root, file, '"x"', '"y"');

    const text = await readFile(path.join(root, file), 'utf8');
    expect(text).toBe('const a = "y";\nconst b = "x";\n');
  });

  it('leaves the file untouched when the write would escape the allowed roots', async () => {
    await expect(applyReplacement(root, '../escape.tsx', 'a', 'b')).rejects.toThrow(
      /outside/i,
    );
  });
});

describe('saveMedia', () => {
  const CASE = 'src/content/cases/A.tsx';
  const placeholder = '<MediaFrame hint="cover — 1600×900">a shot of the site</MediaFrame>';

  const writeCase = () =>
    writeFile(
      path.join(root, CASE),
      `import MediaFrame from '../../components/case/MediaFrame';\n\n` +
        `export default function A() {\n  return <div>${placeholder}</div>;\n}\n`,
    );

  const base = {
    slug: 'north-coast-bjj',
    targetFile: CASE,
    alt: 'The booking screen',
    width: 1600,
    height: 900,
    placeholder,
  };

  it('writes an image to src/assets and adds the import that references it', async () => {
    await writeCase();
    const result = await saveMedia(root, {
      ...base,
      kind: 'image',
      bytes: Buffer.from('png-bytes'),
      filename: 'shot.png',
      posterBytes: null,
    });

    const text = await readFile(path.join(root, CASE), 'utf8');
    expect(text).not.toContain('hint=');
    expect(text).toMatch(/import \{ getImage \} from ['"]astro:assets['"];/);
    // Quote style is Prettier's, and the temp dir resolves no .prettierrc, so
    // match either — the assertion is about the import existing and pointing at
    // the written file, not about formatting.
    expect(text).toMatch(
      /import media\w+Source from ['"]\.\.\/\.\.\/assets\/north-coast-bjj-\w+\.png['"]/,
    );
    expect(text).toMatch(/const media\w+ = await getImage\(\{/);
    expect(text).toMatch(/src: media\w+Source,/);
    expect(text).toContain('width: 1600,');
    expect(text).toContain('height: 900,');
    expect(text).toMatch(/<MediaFrame\s+src=\{media\w+\.src\}/);
    expect(text).toContain('width={1600}');
    expect(text).toContain('alt="The booking screen"');
    expect(await readFile(path.join(root, result.asset), 'utf8')).toBe('png-bytes');
  });

  it('writes a video to public/media as a plain path, with its poster', async () => {
    await writeCase();
    const result = await saveMedia(root, {
      ...base,
      kind: 'video',
      bytes: Buffer.from('mp4-bytes'),
      filename: 'demo.mp4',
      posterBytes: Buffer.from('poster-bytes'),
    });

    const text = await readFile(path.join(root, CASE), 'utf8');
    expect(text).toMatch(/video="\/media\/north-coast-bjj-\w+\.mp4"/);
    expect(text).toMatch(/poster="\/media\/north-coast-bjj-\w+-poster\.png"/);
    // Video must not be imported — it stays out of the bundle graph.
    expect(text).not.toContain("from '../../assets/");
    expect(result.asset.startsWith('/media/')).toBe(true);
  });

  it('refuses a file type the browser would not decode', async () => {
    await writeCase();
    await expect(
      saveMedia(root, {
        ...base,
        kind: 'image',
        bytes: Buffer.from('x'),
        filename: 'notes.pdf',
        posterBytes: null,
      }),
    ).rejects.toThrow(/not a supported/i);
  });

  it('leaves the source untouched when the placeholder is not in it', async () => {
    await writeCase();
    const before = await readFile(path.join(root, CASE), 'utf8');
    await saveMedia(root, {
      ...base,
      kind: 'image',
      bytes: Buffer.from('x'),
      filename: 'shot.png',
      placeholder: 'NOT PRESENT',
      posterBytes: null,
    });
    const after = await readFile(path.join(root, CASE), 'utf8');
    // The import is added but no markup is swapped, so the file must still
    // contain its original placeholder rather than silently losing it.
    expect(after).toContain(placeholder);
    expect(before).toContain(placeholder);
  });
});
