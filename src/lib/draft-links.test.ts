import { describe, expect, it } from 'vitest';
import { findDeadDraftLinks, deadLinkMessage } from './draft-links.ts';

const NEXT_CASE = (to: string) => `<a className="next-case" href="/work/${to}">next</a>`;

describe('findDeadDraftLinks', () => {
  it('catches a published case linking to a draft one', () => {
    const dead = findDeadDraftLinks(
      [{ slug: 'north-coast-bjj', text: NEXT_CASE('databrew') }],
      ['north-coast-bjj'],
    );
    expect(dead).toEqual([{ from: 'north-coast-bjj', to: 'databrew' }]);
  });

  it('ignores links inside a draft, since drafts are not built', () => {
    const dead = findDeadDraftLinks(
      [{ slug: 'databrew', text: NEXT_CASE('savr-app') }],
      ['north-coast-bjj'],
    );
    expect(dead).toEqual([]);
  });

  it('allows a link between two published cases', () => {
    const dead = findDeadDraftLinks(
      [{ slug: 'north-coast-bjj', text: NEXT_CASE('databrew') }],
      ['north-coast-bjj', 'databrew'],
    );
    expect(dead).toEqual([]);
  });

  it('ignores links to /work itself, the escape hatch for a lone published case', () => {
    const dead = findDeadDraftLinks(
      [{ slug: 'north-coast-bjj', text: '<a href="/work">back</a>' }],
      ['north-coast-bjj'],
    );
    expect(dead).toEqual([]);
  });

  it('reports every dead link, not just the first', () => {
    const dead = findDeadDraftLinks(
      [{ slug: 'a', text: NEXT_CASE('b') + NEXT_CASE('c') }],
      ['a'],
    );
    expect(dead).toHaveLength(2);
  });
});

describe('deadLinkMessage', () => {
  it('names the case, the target and how to fix it', () => {
    const message = deadLinkMessage([{ from: 'north-coast-bjj', to: 'databrew' }]);
    expect(message).toContain('north-coast-bjj links to /work/databrew');
    expect(message).toContain('src/lib/site.ts');
  });
});
