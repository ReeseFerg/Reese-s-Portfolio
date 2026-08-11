import { sitemap } from '../lib/seo.ts';

// Not @astrojs/sitemap: that integration emits sitemap-index.xml and no
// robots.txt, which would change the URLs this site has always served.
// output: 'static' prerenders this by default.
export const GET = () =>
  new Response(sitemap(), {
    headers: { 'Content-Type': 'application/xml' },
  });
