/**
 * One list of routes, used two ways: each route's per-page SEO tags (read by
 * BaseLayout.astro via metaForPath) and the sitemap. Adding a page means
 * editing this and nothing else.
 */

export const SITE_URL = 'https://reeseferguson.com';
export const SITE_NAME = 'Reese Ferguson';

export type RouteMeta = {
  path: string;
  title: string;
  description: string;
  /**
   * Not ready to be seen. Drafts build under `astro dev` so they can be worked
   * on, but are excluded from the production build, from /work's cards and from
   * the sitemap — a case study still full of [TODO: …] markers reads as
   * abandoned rather than in progress, on the page arguing the opposite.
   */
  draft?: true;
};

/** Case study slugs, in the order they appear on the work page. */
export const CASE_SLUGS = [
  'north-coast-bjj',
  'databrew',
  'savr-app',
  'project-cadence',
] as const;

export type CaseSlug = (typeof CASE_SLUGS)[number];

export const ROUTES: RouteMeta[] = [
  {
    path: '/',
    title: 'Reese Ferguson — UX Designer',
    description:
      'UX designer and business graduate. I design interfaces in Figma and Paper, then ship them with Claude Code.',
  },
  {
    path: '/work',
    title: 'Selected work — Reese Ferguson',
    description:
      'Client projects and case studies. Start with north-coast-bjj — real client, real research, shipped product.',
  },
  {
    path: '/about',
    title: 'About — Reese Ferguson',
    description:
      'UX designer and business graduate who designs with AI in the loop. Less deck, more demo.',
  },
  {
    path: '/contact',
    title: 'Contact — Reese Ferguson',
    description: 'Open to opportunities. Get in touch by email or LinkedIn.',
  },
  {
    path: '/work/north-coast-bjj',
    title: 'north-coast-bjj — Reese Ferguson',
    description:
      'A booking experience for a jiu-jitsu club. Real client, real user research, live site.',
  },
  {
    path: '/work/databrew',
    draft: true,
    title: 'databrew — Reese Ferguson',
    description: 'A Chromium extension people will actually install. Design and front end.',
  },
  {
    path: '/work/savr-app',
    draft: true,
    title: 'savr-app — Reese Ferguson',
    description: 'A course project whose value is the documented user testing.',
  },
  {
    path: '/work/project-cadence',
    draft: true,
    title: 'project-cadence — Reese Ferguson',
    description: 'Early-stage work in progress. The interesting part is the open question.',
  },
];

export function metaForPath(path: string): RouteMeta {
  return ROUTES.find((r) => r.path === path) ?? ROUTES[0];
}

export function isDraft(path: string): boolean {
  return ROUTES.find((r) => r.path === path)?.draft === true;
}

/** Case slugs that should exist publicly, in work-page order. */
export function publishedCaseSlugs(): readonly string[] {
  return CASE_SLUGS.filter((slug) => !isDraft(`/work/${slug}`));
}

/**
 * Whether a route should be rendered at all. Drafts stay visible under
 * `astro dev` — you cannot write a case study you cannot see — and disappear
 * from the production build.
 */
export function isVisible(path: string): boolean {
  return import.meta.env.DEV || !isDraft(path);
}
