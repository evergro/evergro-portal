import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  base: '/assets/portal/portal/',

  plugins: [
    vue(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    host: '0.0.0.0',
    port: 8080,
    strictPort: true,
  },

  build: {
    outDir: path.resolve(__dirname, '../portal/public/portal'),
    emptyOutDir: true,
    target: 'es2015',
    manifest: true,
  },
})