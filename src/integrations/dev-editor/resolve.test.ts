import { describe, expect, it } from 'vitest';
import {
  slugToCaseFile,
  candidateFiles,
  findUniqueMatch,
  validateReplacement,
  isInsideAllowedRoot,
  findPlaceholderBlock,
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

describe('findPlaceholderBlock', () => {
  const multiline = `      <MediaFrame className="case-cover" hint="cover — 1600×900">
        hero shot of the finished, live site
      </MediaFrame>`;

  it('finds a multi-line placeholder and keeps its className', () => {
    const found = findPlaceholderBlock(`<div>\n${multiline}\n</div>`, 'cover — 1600×900');
    expect(found?.block).toBe(multiline.trim());
    expect(found?.className).toBe('case-cover');
  });

  it('finds a self-closing placeholder', () => {
    const text = `<div><MediaFrame hint="1600×900" /></div>`;
    const found = findPlaceholderBlock(text, '1600×900');
    expect(found?.block).toBe('<MediaFrame hint="1600×900" />');
    expect(found?.className).toBeNull();
  });

  it('picks the right one when a file has several placeholders', () => {
    const text = `<MediaFrame hint="one" />\n<MediaFrame hint="two">x</MediaFrame>`;
    expect(findPlaceholderBlock(text, 'one')?.block).toBe('<MediaFrame hint="one" />');
    expect(findPlaceholderBlock(text, 'two')?.block).toBe(
      '<MediaFrame hint="two">x</MediaFrame>',
    );
  });

  it('refuses a hint that appears twice rather than replacing the wrong figure', () => {
    const text = `<MediaFrame hint="same" />\n<MediaFrame hint="same" />`;
    expect(findPlaceholderBlock(text, 'same')).toBeNull();
  });

  it('returns null for a hint that is not there', () => {
    expect(findPlaceholderBlock('<div />', 'nope')).toBeNull();
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
