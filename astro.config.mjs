import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

import { SITE_URL } from './src/lib/site.ts';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  output: 'static',
  // No adapter: this is a static SPA-shell build, deployed as plain files.
  build: {
    // Emits dist/work/north-coast-bjj/index.html, the same on-disk shape the old
    // routeShells Vite plugin produced, so vercel.json's cleanUrls keeps working.
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
