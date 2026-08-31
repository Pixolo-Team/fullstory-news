import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import { fileURLToPath } from 'node:url';

// The Remarque design system is plain CSS custom properties, served from
// public/ds. Tailwind is deliberately absent: two token systems on one page is
// exactly what the design decision ruled out.
//
// SSR, not static: Stories, listings and search are all request-time data from
// the backend. The Vercel adapter emits serverless functions, which is what
// www.fullstorynews.com is deployed on; the standalone node adapter built a
// server nothing on Vercel invokes, so every route 404'd at the edge.
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? 'http://localhost:4321',
  output: 'server',
  adapter: vercel(),
  vite: {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  },
});
