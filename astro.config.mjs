import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://imprerial-law.com',
  compressHTML: true,
  build: { inlineStylesheets: 'auto' },
});
