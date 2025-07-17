import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      tailwindcss(),
      tsconfigPaths(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        manifest: {
          name: 'Weather Flick',
          short_name: 'WeatherFlick',
          description: '날씨 기반 여행지 추천 서비스',
          lang: 'ko',
          theme_color: '#1e293b',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: '/pwa-64x64.png',
              sizes: '64x64',
              type: 'image/png',
            },
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: '/maskable-icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable',
            },
            {
              src: '/maskable-icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
          categories: ['travel', 'weather', 'lifestyle'],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
          navigateFallback: '/offline',
          navigateFallbackDenylist: [/^\/api/],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/pixabay\.com\/api\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'pixabay-images',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^http:\/\/localhost:8000\/api\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                networkTimeoutSeconds: 10,
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24, // 1 day
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
        },
        includeAssets: ['firebase-messaging-sw.js'],
      }),
      {
        name: 'firebase-sw-env-replace',
        transformIndexHtml() {
          return []
        },
        generateBundle(options, bundle) {
          const swFile = bundle['firebase-messaging-sw.js']
          if (swFile && 'source' in swFile) {
            swFile.source = swFile.source
              .replace(
                '__VITE_FIREBASE_API_KEY__',
                env.VITE_FIREBASE_API_KEY || '',
              )
              .replace(
                '__VITE_FIREBASE_AUTH_DOMAIN__',
                env.VITE_FIREBASE_AUTH_DOMAIN || '',
              )
              .replace(
                '__VITE_FIREBASE_PROJECT_ID__',
                env.VITE_FIREBASE_PROJECT_ID || '',
              )
              .replace(
                '__VITE_FIREBASE_STORAGE_BUCKET__',
                env.VITE_FIREBASE_STORAGE_BUCKET || '',
              )
              .replace(
                '__VITE_FIREBASE_MESSAGING_SENDER_ID__',
                env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
              )
              .replace(
                '__VITE_FIREBASE_APP_ID__',
                env.VITE_FIREBASE_APP_ID || '',
              )
          }
        },
      },
    ],
    server: {
      port: 5173,
      allowedHosts: true,
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        },
        '/images': {
          target: 'https://pixabay.com/api',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/images/, ''),
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
              './src/pages/recommend/detail.jsx',
              './src/pages/recommend/enhanced-compatible.jsx',
              './src/pages/recommend/enhanced-index.jsx',
              './src/pages/recommend/RecommendCourseCard.jsx',
            ],
            'customized-schedule': [
              './src/pages/customized-schedule/customized-schedule.jsx',
              './src/pages/customized-schedule/region.jsx',
              './src/pages/customized-schedule/period.jsx',
              './src/pages/customized-schedule/who.jsx',
              './src/pages/customized-schedule/style.jsx',
              './src/pages/customized-schedule/schedule.jsx',
              './src/pages/customized-schedule/result.jsx',
            ],
            profile: [
              './src/pages/profile/index.jsx',
              './src/pages/profile/edit.jsx',
              './src/pages/profile/change-password.jsx',
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
  }
})
