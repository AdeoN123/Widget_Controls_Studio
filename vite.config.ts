import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // Perf fix: monaco-editor's ESM build ships as hundreds of individual
  // small JS/CSS files. Vite normally serves linked-package ESM files as-is
  // rather than pre-bundling them, which meant every one of those files was
  // read on demand from this project's Yarn Berry zip-based package cache
  // (@fs/.../monaco-editor-npm-*.zip/...) instead of a plain extracted
  // node_modules directory — reading hundreds of files out of a zip archive
  // one at a time on first load was dramatically slower than normal and a
  // real contributor to Monaco taking a very long time (or appearing to
  // hang) the first time an editor mounted. Explicitly including it in
  // optimizeDeps makes esbuild pre-bundle it into one flat file up front, so
  // the dev server serves a single fast response instead of hundreds of
  // slow zip reads.
  optimizeDeps: {
    include: ['monaco-editor'],
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
})
