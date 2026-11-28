// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.wandervienna.com',
  // /about is built as about.html, so URLs stay exactly as on Webflow (no trailing slash).
  trailingSlash: 'never',
  build: { format: 'file' },
});
