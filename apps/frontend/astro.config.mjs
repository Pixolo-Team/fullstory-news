import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

// SSR, not static: Stories, listings and search are all request-time data from
// the backend. The Vercel adapter emits serverless functions, which is what
// www.fullstorynews.com is deployed on; the standalone node adapter built a
// server nothing on Vercel invokes, so every route 404'd at the edge.
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? 'http://localhost:4321',
  output: 'server',
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  },
});
