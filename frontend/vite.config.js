import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  base: '/assets/portal/portal/',
  plugins: [vue()],
  server: {
    port: 8080,
  },
  build: {
    outDir: path.resolve(__dirname, '../portal/public/portal'),
    emptyOutDir: true,
    target: 'es2015',
    manifest: true,
  },
})