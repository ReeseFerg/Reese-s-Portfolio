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
    title: 'databrew — Reese Ferguson',
    description: 'A Chromium extension people will actually install. Design and front end.',
  },
  {
    path: '/work/savr-app',
    title: 'savr-app — Reese Ferguson',
    description: 'A course project whose value is the documented user testing.',
  },
  {
    path: '/work/project-cadence',
    title: 'project-cadence — Reese Ferguson',
    description: 'Early-stage work in progress. The interesting part is the open question.',
  },
];

export function metaForPath(path: string): RouteMeta {
  return ROUTES.find((r) => r.path === path) ?? ROUTES[0];
}
