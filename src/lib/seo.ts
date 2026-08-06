import { ROUTES, SITE_NAME, SITE_URL, type RouteMeta } from './site.ts';

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** The <head> block written into each route's static HTML at build time. */
export function seoBlock(meta: RouteMeta): string {
  const url = SITE_URL + meta.path;
  const title = escape(meta.title);
  const description = escape(meta.description);

  return [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${escape(SITE_NAME)}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${SITE_URL}/og.png" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:image" content="${SITE_URL}/og.png" />`,
  ].join('\n    ');
}

export function sitemap(): string {
  const urls = ROUTES.map((r) => `  <url><loc>${SITE_URL}${r.path}</loc></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

export function robots(): string {
  return `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
}
