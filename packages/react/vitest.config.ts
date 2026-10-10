import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'happy-dom',
  },
  resolve: {
    alias: {
      '@tbib-mindmap-viewer/core': path.resolve(__dirname, '../core/src/index.ts'),
    },
  },
});
