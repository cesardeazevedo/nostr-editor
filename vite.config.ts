/// <reference types="vitest" />
import { defineConfig } from 'vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      name: 'nostr-editor',
      entry: path.resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'umd'],
    },
    sourcemap: true,
    minify: false,
  },
  test: {
    globals: true,
    environment: 'happy-dom',
  },
})
