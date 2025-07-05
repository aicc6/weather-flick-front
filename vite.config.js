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
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React 관련 라이브러리를 별도 청크로 분리
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],

          // UI 라이브러리를 별도 청크로 분리
          'ui-vendor': [
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-slot',
            'lucide-react',
            'class-variance-authority',
            'clsx',
            'tailwind-merge',
          ],

          // 애니메이션 라이브러리를 별도 청크로 분리
          'animation-vendor': ['framer-motion'],

          // 유틸리티 라이브러리를 별도 청크로 분리
          'utils-vendor': ['date-fns', 'zod', 'sonner'],

          // 페이지별 청크 분리
          planner: ['./src/pages/planner/index.jsx'],
          recommend: [
            './src/pages/recommend/index.jsx',
            './src/pages/recommend/region.jsx',
            './src/pages/recommend/period.jsx',
            './src/pages/recommend/who.jsx',
            './src/pages/recommend/style.jsx',
            './src/pages/recommend/schedule.jsx',
            './src/pages/recommend/result.jsx',
          ],
          profile: [
            './src/pages/profile/index.jsx',
            './src/pages/profile/edit.jsx',
            './src/pages/profile/change-password.jsx',
          ],
          reviews: [
            './src/pages/reviews/index.jsx',
            './src/pages/reviews/write.jsx',
          ],
        },
      },
    },
    // 청크 크기 경고 임계값 증가
    chunkSizeWarningLimit: 1000,
    // 소스맵 최적화
    sourcemap: false,
    // 압축 최적화 (esbuild 사용)
    minify: 'esbuild',
  },
  // 의존성 최적화
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'date-fns',
      'lucide-react',
      'zod',
      'sonner',
    ],
  },
})
