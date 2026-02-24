import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),  // ← enables @/composables/... etc.
    },
  },

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: {
        index:         resolve(__dirname, 'index.html'),
        background:    resolve(__dirname, 'src/background/background.ts'),

      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === 'background')    return 'background/background.js';
          if (chunk.name === 'contentScript') return 'content/contentScript.js';
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames:  'assets/[name]-[hash].js',
        assetFileNames:  'assets/[name]-[hash][extname]',
      },
    },
  },
});
