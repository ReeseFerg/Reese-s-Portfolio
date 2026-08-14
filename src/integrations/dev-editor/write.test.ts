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
