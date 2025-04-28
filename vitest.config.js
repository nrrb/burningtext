import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()], // so SFCs compile inside tests
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)), // same alias as Vite
    },
  },
  test: {
    globals: true, // lets you omit importing it/expect
    environment: 'jsdom', // DOM APIs for component tests
    coverage: {
      reporter: ['text', 'html'], // optional ­– add `--coverage` to CLI
    },
    include: ['src/tests/**/*.spec.js'],
  },
})
