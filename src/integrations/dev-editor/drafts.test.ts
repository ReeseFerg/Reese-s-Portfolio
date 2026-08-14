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
    expect(xml).not.toContain('/work/savr-app');
    expect(xml).not.toContain('/work/project-cadence');
  });

  it('keeps the non-case pages in the sitemap', () => {
    const xml = sitemap();
    for (const p of ['/', '/work', '/about', '/contact']) {
      expect(xml).toContain(`<loc>https://reeseferguson.com${p}</loc>`);
    }
  });
});
