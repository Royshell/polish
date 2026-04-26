import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import fs from 'fs';

// Set TARGET=firefox to produce a Firefox build, e.g.:
//   TARGET=firefox pnpm build
//   TARGET=firefox pnpm dev
const target = (process.env.TARGET ?? 'chrome') as 'chrome' | 'firefox';

export default defineConfig({
  plugins: [
    vue(),
    // Swaps manifest.json in dist/ based on the TARGET env var.
    // For chrome (default), public/manifest.json is already copied by Vite.
    // For firefox, we overwrite it with public/manifest.firefox.json.
    {
      name: 'polish-browser-manifest',
      closeBundle() {
        if (target === 'firefox') {
          const src = resolve(__dirname, 'public/manifest.firefox.json');
          const dest = resolve(__dirname, 'dist/manifest.json');
          fs.copyFileSync(src, dest);
          console.log('[polish] Wrote Firefox manifest → dist/manifest.json');
        }
      },
    },
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        background: resolve(__dirname, 'src/background/background.ts'),
        contentScript: resolve(__dirname, 'src/content/contentScript.ts'),
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === 'background') {
            return 'background/background.js';
          }
          if (chunk.name === 'contentScript') {
            return 'content/contentScript.js';
          }
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
});
