// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  site: 'https://zeelandschakelt.nl',
  // Static by default; alleen de /api routes renderen on-demand (export const prerender = false).
  adapter: node({ mode: 'standalone' }),
  server: {
    port: 4371,
    host: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
