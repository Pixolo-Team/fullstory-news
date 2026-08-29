import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import { fileURLToPath } from 'node:url';

// The Remarque design system is plain CSS custom properties, served from
// public/ds. Tailwind is deliberately absent: two token systems on one page is
// exactly what the design decision ruled out.
//
// SSR, not static: Stories, listings and search are all request-time data from
// the backend. The node adapter runs anywhere a process can; a platform
// adapter can replace it without touching page code.
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? 'http://localhost:4321',
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  vite: {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  },
});
