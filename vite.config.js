import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import yManifest from './extensions/y/manifest.config.js';

export default defineConfig({
  plugins: [crx({ manifest: yManifest })],
  build: {
    outDir: 'dist'
  }
});