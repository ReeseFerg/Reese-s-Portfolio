import { ROUTES, SITE_URL } from './site.ts';

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
