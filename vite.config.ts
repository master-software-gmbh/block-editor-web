import { resolve } from 'node:path';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      formats: ['es'],
      fileName: (_, entryName) => `${entryName}.min.js`,
      cssFileName: 'block-editor.min',
      entry: {
        'block-editor': resolve(__dirname, 'src/lib/editor.ts'),
        'block-viewer': resolve(__dirname, 'src/lib/viewer.ts'),
      },
    },
    rollupOptions: {
      external: ['vue'],
    },
  },
});
