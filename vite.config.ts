import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

import { ROUTES } from './src/lib/site.ts';
import { robots, seoBlock, sitemap } from './src/lib/seo.ts';

/**
 * Writes one static HTML file per route, each with that route's own <title> and
 * og: tags baked into the <head>.
 *
 * Link scrapers — LinkedIn, Slack, iMessage, Twitter — fetch the HTML and read
 * the meta tags without ever running JavaScript. A single-page app serves the
 * same shell for every path, so without this every shared link would preview
 * with the homepage's title. The body is still rendered by React on load; only
 * the head has to be correct up front.
 *
 * It also means any static host can serve real URLs without rewrite rules:
 * /work/index.html already exists on disk.
 */
function routeShells(): Plugin {
  return {
    name: 'route-shells',
    apply: 'build',
    enforce: 'post',
    closeBundle() {
      const outDir = 'dist';
      const shell = readFileSync(join(outDir, 'index.html'), 'utf-8');

      for (const route of ROUTES) {
        const html = shell.replace(
          /<!--seo-->[\s\S]*?<!--\/seo-->/,
          `<!--seo-->\n    ${seoBlock(route)}\n    <!--/seo-->`,
        );

        const file =
          route.path === '/'
            ? join(outDir, 'index.html')
            : join(outDir, route.path.replace(/^\//, ''), 'index.html');

        mkdirSync(dirname(file), { recursive: true });
        writeFileSync(file, html);
      }

      writeFileSync(join(outDir, 'sitemap.xml'), sitemap());
      writeFileSync(join(outDir, 'robots.txt'), robots());

      // Hosts that fall back to 404.html (GitHub Pages) get a copy of the shell,
      // so unknown paths still boot the app and render the in-app 404 view.
      writeFileSync(join(outDir, '404.html'), shell);

      this.info(`wrote ${ROUTES.length} route shells, sitemap, robots.txt and 404.html`);
    },
  };
}

export default defineConfig({
  plugins: [react(), routeShells()],
  server: {
    port: 5173,
  },
});
