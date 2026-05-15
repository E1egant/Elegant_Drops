import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    build: {
        outDir: '../src/main/resources/static/admin-react',
        emptyOutDir: true,
    },
    server: {
        proxy: {
            '/elegant-2026': 'http://localhost:8080',
            '/checkout': 'http://localhost:8080',
        }
    }
})