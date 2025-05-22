import { resolve } from 'node:path';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    vue(),
    dts({
      include: ['src/types.ts'],
    }),
  ],
  resolve: {
    alias: {
      vue: resolve(__dirname, 'node_modules/vue/dist/vue.esm-browser.prod.js'),
    },
  },
  build: {
    lib: {
      formats: ['es'],
      fileName: (_, entryName) => `${entryName}.min.js`,
      cssFileName: 'block-editor.min',
      entry: {
        'block-editor': resolve(__dirname, 'lib/editor.ts'),
        'block-viewer': resolve(__dirname, 'lib/viewer.ts'),
        setup: resolve(__dirname, 'lib/setup.ts'),
      },
    },
  },
});
