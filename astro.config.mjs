// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import matomo from 'astro-matomo';

// https://astro.build/config
export default defineConfig({
  site: "https://realsalari.es",
  integrations: [
    tailwind(),
    react(),
    matomo({
      enabled: import.meta.env.PROD, // Only load in production
      host: "https://analytics.realsalari.es",
      siteId: 1,
    }),
  ]
});
