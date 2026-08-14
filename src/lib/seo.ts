import { ROUTES, SITE_URL } from './site.ts';

export function sitemap(): string {
  // Drafts are absent from the production build, so listing them would point
  // search engines at URLs that 404.
  const urls = ROUTES.filter((r) => !r.draft)
    .map((r) => `  <url><loc>${SITE_URL}${r.path}</loc></url>`)
    .join('\n');
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
