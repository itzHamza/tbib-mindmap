import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@tbib-mindmap/core': path.resolve(__dirname, '../core/src/index.ts'),
      '@tbib-mindmap/react': path.resolve(__dirname, '../react/src/index.ts'),
    },
  },
});
