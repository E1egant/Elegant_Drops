import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    build: {
        outDir: '../src/main/resources/static/admin-react',
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
        proxy: {
            '/elegant-2026': 'http://localhost:8080',
            '/checkout': 'http://localhost:8080',
        }
    }
})