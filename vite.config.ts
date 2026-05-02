import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3001
  },
  preview: {
    host: true,
    allowedHosts: ['.traefik.me', 'admin.ahijewellery.com']
  },
  build: {
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  }
})
