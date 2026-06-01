// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://zeelandschakelt.nl',
  server: {
    port: 4371,
    host: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
