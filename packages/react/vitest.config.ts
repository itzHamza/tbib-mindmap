import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'happy-dom',
  },
  resolve: {
    alias: {
      '@tbib-mindmap/core': path.resolve(__dirname, '../core/src/index.ts'),
    },
  },
});
