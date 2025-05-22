import { resolve } from 'node:path';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      vue: resolve(__dirname, 'node_modules/vue/dist/vue.esm-browser.prod.js'),
    },
  },
  build: {
    lib: {
      formats: ['es'],
      fileName: (_, entryName) => `${entryName}.min.js`,
      cssFileName: 'editor.min',
      entry: {
        editor: resolve(__dirname, 'lib/editor.ts'),
        viewer: resolve(__dirname, 'lib/viewer.ts'),
        setup: resolve(__dirname, 'lib/setup.ts'),
      },
    },
  },
});
