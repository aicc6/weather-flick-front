import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  server: {
    port: 5173,
    allowedHosts: true,
    proxy: {
      '/images': {
        target: 'https://images.unsplash.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/images/, ''),
      },
      '/google-api': {
        target: 'https://www.googleapis.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/google-api/, ''),
      },
    },
  },
})
