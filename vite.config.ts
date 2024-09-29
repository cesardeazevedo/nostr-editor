/// <reference types="vitest" />
import { defineConfig } from 'vite'
import path from 'path'
import dts from 'vite-plugin-dts'
import { visualizer } from 'rollup-plugin-visualizer'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      name: 'nostr-editor',
      entry: path.resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'umd', 'cjs'],
    },
    sourcemap: true,
    minify: false,
  },
  plugins: [dts({ rollupTypes: true }), peerDepsExternal(), visualizer()],
  test: {
    globals: true,
    environment: 'happy-dom',
  },
})
