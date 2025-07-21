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
          skipWaiting: true,
          clientsClaim: true,
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
          enabled: true, // 개발 모드에서 PWA 활성화 (FCM 테스트를 위해)
          type: 'module',
        },
        includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png', '*.png'],
      }),
      {
        name: 'firebase-sw-env-replace',
        async configureServer(server) {
          // 개발 서버에서 firebase-messaging-sw.js 요청 처리
          server.middlewares.use(
            '/firebase-messaging-sw.js',
            async (req, res, next) => {
              if (req.method !== 'GET') return next()

              const fs = await import('fs')
              const path = await import('path')

              const swPath = path.resolve('public/firebase-messaging-sw.js')
              let content = fs.readFileSync(swPath, 'utf-8')

              content = content
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

              res.setHeader('Content-Type', 'application/javascript')
              res.end(content)
            },
          )
        },
        async writeBundle() {
          const fs = await import('fs')
          const path = await import('path')

          // firebase-messaging-sw.js 처리
          const firebaseSwPath = path.resolve('dist/firebase-messaging-sw.js')

          if (fs.existsSync(firebaseSwPath)) {
            let content = fs.readFileSync(firebaseSwPath, 'utf-8')

            content = content
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

            fs.writeFileSync(firebaseSwPath, content)
            console.log('Firebase service worker 환경변수 대체 완료')
          }

          // sw.js (PWA 서비스 워커) 처리
          const pwaSwPath = path.resolve('dist/sw.js')

          if (fs.existsSync(pwaSwPath)) {
            let content = fs.readFileSync(pwaSwPath, 'utf-8')

            content = content
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

            fs.writeFileSync(pwaSwPath, content)
            console.log('PWA service worker 환경변수 대체 완료')
          }
        },
      },
      // 프론트엔드 보안 헤더 플러그인
      {
        name: 'security-headers',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            // 보안 헤더 적용
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('X-Frame-Options', 'DENY');
            res.setHeader('X-XSS-Protection', '1; mode=block');
            res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
            res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
            res.setHeader(
              'Content-Security-Policy',
              [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://maps.gstatic.com https://*.googleapis.com https://www.googletagmanager.com",
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://maps.googleapis.com",
                "font-src 'self' https://fonts.gstatic.com",
                "img-src 'self' data: blob: https: http: https://maps.googleapis.com https://maps.gstatic.com https://*.googleapis.com https://*.gstatic.com",
                "connect-src 'self' http://localhost:8000 https://api.openweathermap.org https://pixabay.com https://maps.googleapis.com https://*.googleapis.com",
                "frame-src 'self' https://maps.google.com https://www.google.com",
                "object-src 'none'",
                "base-uri 'self'",
                "form-action 'self'",
                "upgrade-insecure-requests"
              ].join('; ')
            );
            next();
          });
        },
      },
    ],
    server: {
      port: 5173,
      allowedHosts: true,
      // 보안 헤더 미들웨어 추가
      middlewareMode: false,
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
          manualChunks: (id) => {
            // Node modules 분리
            if (id.includes('node_modules')) {
              // React 관련 라이브러리 (더 정확한 조건)
              if (id.includes('react') || id.includes('react-dom')) {
                if (id.includes('react-router')) {
                  return 'react-router-vendor';
                }
                if (id.includes('react-redux') || id.includes('@reduxjs')) {
                  return 'state-vendor';
                }
                if (id.includes('react-hook-form')) {
                  return 'form-vendor';
                }
                // 핵심 React 라이브러리만 포함
                if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('react/index') || id.includes('react-dom/index')) {
                  return 'react-core';
                }
                return 'react-vendor';
              }
              
              // UI 컴포넌트 라이브러리 (세분화)
              if (id.includes('@radix-ui')) {
                return 'radix-vendor';
              }
              
              if (id.includes('lucide-react')) {
                return 'icons-vendor';
              }
              
              if (id.includes('class-variance-authority') || id.includes('clsx') || 
                  id.includes('tailwind-merge')) {
                return 'ui-utils-vendor';
              }
              
              // 상태 관리
              if (id.includes('@reduxjs') || id.includes('react-redux') || id.includes('redux')) {
                return 'state-vendor';
              }
              
              // Firebase (동적 로딩 대상 - 청크 분리)
              if (id.includes('firebase')) {
                if (id.includes('firebase/app') || id.includes('firebase/auth')) {
                  return 'firebase-core';
                }
                if (id.includes('firebase/messaging')) {
                  return 'firebase-messaging';
                }
                return 'firebase-vendor';
              }
              
              // 애니메이션 (동적 로딩 대상)
              if (id.includes('framer-motion')) {
                return 'animation-vendor';
              }
              
              // 지도 관련 (동적 로딩 대상)
              if (id.includes('@googlemaps') || id.includes('google-maps')) {
                return 'maps-vendor';
              }
              
              // 드래그앤드롭 (동적 로딩 대상)
              if (id.includes('@dnd-kit')) {
                return 'dnd-vendor';
              }
              
              // 캐러셀 (동적 로딩 대상)
              if (id.includes('embla-carousel')) {
                return 'carousel-vendor';
              }
              
              // 유틸리티 (자주 사용되는 것만)
              if (id.includes('date-fns') || id.includes('zod')) {
                return 'utils-vendor';
              }
              
              // 폼 관련
              if (id.includes('react-hook-form') || id.includes('@hookform')) {
                return 'form-vendor';
              }
              
              // 알림 및 기타
              if (id.includes('sonner') || id.includes('react-hot-toast')) {
                return 'notification-vendor';
              }
              
              // 나머지 vendor 라이브러리
              return 'vendor';
            }
            
            // 페이지별 분리
            if (id.includes('src/pages/')) {
              if (id.includes('customized-schedule')) return 'customized-schedule';
              if (id.includes('recommend')) return 'recommend';
              if (id.includes('planner')) return 'planner';
              if (id.includes('profile')) return 'profile';
              if (id.includes('auth')) return 'auth';
              return 'pages';
            }
            
            // 컴포넌트별 분리
            if (id.includes('src/components/')) {
              if (id.includes('ui/')) return 'ui-components';
              if (id.includes('layout/')) return 'layout-components';
              return 'components';
            }
          },
        },
      },
      // 청크 크기 경고 임계값 감소 (최적화 목표)
      chunkSizeWarningLimit: 500,
      // 소스맵 비활성화 (번들 크기 감소)
      sourcemap: false,
      // 압축 최적화 (terser로 변경하여 더 강력한 압축)
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true, // console.log 제거
          drop_debugger: true, // debugger 제거
        },
      },
      // 번들 분석을 위한 설정
      reportCompressedSize: true,
    },
    // 의존성 최적화
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'framer-motion',
        'date-fns',
        'date-fns/locale',
        'date-fns/locale/ko',
        'lucide-react',
        'zod',
        'sonner',
        'react-day-picker',
        '@radix-ui/react-popover',
        '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-slot',
      ],
      exclude: ['@firebase/app'],
      force: true,
    },
    resolve: {
      dedupe: ['react', 'react-dom'],
    },
  }
})
