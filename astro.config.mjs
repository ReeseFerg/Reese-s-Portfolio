import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

import { SITE_URL } from './src/lib/site.ts';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  output: 'static',
  // No adapter: every route is prerendered to its own complete HTML document
  // and deployed as plain static files — there is no client router deciding
  // what to serve.
  build: {
    // Emits dist/work/north-coast-bjj/index.html, the same on-disk shape the old
    // Vite SPA's build-time SEO shell generator produced, so vercel.json's
    // cleanUrls keeps working.
    format: 'directory',
  },
  // Matches vercel.json's trailingSlash: false.
  trailingSlash: 'never',
  integrations: [react()],
  vite: {
    resolve: {
      alias: {
        // Groundwork for shadcn's `@/components/ui/*` convention — nothing
        // imports via `@` yet.
        '@': '/src',
      },
    },
  },
  server: {
    port: 5173,
  },
});
