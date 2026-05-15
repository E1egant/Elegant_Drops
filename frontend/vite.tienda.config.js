import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: 'tienda',
  build: {
    outDir: '../../src/main/resources/static/tienda',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/index.js',
        chunkFileNames: 'assets/index.js',
        assetFileNames: 'assets/index.[ext]',
      }
    }
  },
  server: {
    port: 5174,
    proxy: {
      '/api': 'http://localhost:8080',
      '/elegant-2026': 'http://localhost:8080',
      '/checkout': 'http://localhost:8080',
    }
  }
})