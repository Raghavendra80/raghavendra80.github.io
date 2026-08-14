import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://raghavendra80.github.io',
  outDir: './docs',
  trailingSlash: 'always',
  integrations: [sitemap()],
});
