import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  base: 'portal/',

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
    cors: false,
    hmr: {
      protocol: 'ws',
      host: 'evergro.local',
      port: 8080,
    },
    proxy: {
      // Catch Frappe API, method calls, and standard auth endpoints
      '^/(api|login|logout|app)': {
        target: 'http://127.0.0.1:8000', // Using 127.0.0.1 helps avoid localhost cookie mismatches
        changeOrigin: true,
        secure: false,
        // Crucial fix: Forward cookies from your browser down to Frappe
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Ensures the session cookie is correctly sent to Frappe
            if (req.headers.cookie) {
              proxyReq.setHeader('cookie', req.headers.cookie);
            }
          });
        },
      },
    },
  },

  build: {
    outDir: path.resolve(__dirname, '../portal/public/portal'),
    emptyOutDir: true,
    target: 'es2015',
    manifest: true,
  },
})
