import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://backend:5000',   // 👈 Backend server (use the backend service name)
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
