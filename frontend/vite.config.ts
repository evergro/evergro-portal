/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import frappeui from 'frappe-ui/vite'
import path from 'node:path'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/assets/portal/portal/' : '/',

  plugins: [
    // The page is rendered by Jinja (portal/www/portal), so the plugin must not rewrite index.html or the build output.
    frappeui({ frontendRoute: '/portal', jinjaBootData: false, buildConfig: false }),
    vue(),
  ],

  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },

  server: {
    host: '0.0.0.0',
    port: 8080,
    strictPort: true,
    allowedHosts: ['evergro.local'],
  },

  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
  },

  build: {
    outDir: path.resolve(import.meta.dirname, '../portal/public/portal'),
    emptyOutDir: true,
    target: 'es2015',
    manifest: true,
  },
}))
