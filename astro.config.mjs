// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://zeelandschakelt.nl',
  // Static by default; alleen de /api routes renderen on-demand (export const prerender = false).
  // Vercel-adapter: static pagina's + serverless function voor /api/maatje (Gemini).
  adapter: vercel(),
  server: {
    port: 4371,
    host: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
