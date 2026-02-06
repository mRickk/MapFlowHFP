import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
    plugins: [
        vue(),
        tailwindcss(),
        basicSsl(),
      ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 5173,
        host: '0.0.0.0', //DOCKER
        watch: {
            usePolling: true,
            interval: 100,
          }
    },
    build: {
        outDir: 'dist',
    },
})
