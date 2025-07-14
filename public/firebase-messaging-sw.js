// Firebase 서비스 워커 스크립트
importScripts(
  'https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js',
)
importScripts(
  'https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js',
)

// Firebase 설정 - 빌드 시 환경변수로 대체됨
firebase.initializeApp({
  apiKey: '__VITE_FIREBASE_API_KEY__',
  authDomain: '__VITE_FIREBASE_AUTH_DOMAIN__',
  projectId: '__VITE_FIREBASE_PROJECT_ID__',
  storageBucket: '__VITE_FIREBASE_STORAGE_BUCKET__',
  messagingSenderId: '__VITE_FIREBASE_MESSAGING_SENDER_ID__',
  appId: '__VITE_FIREBASE_APP_ID__',
})

const messaging = firebase.messaging()

// 백그라운드 메시지 처리
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] 백그라운드 메시지 수신:', payload)

  const notificationTitle = payload.notification?.title || '새로운 알림'
  const notificationOptions = {
    body: payload.notification?.body || '알림 내용이 없습니다.',
    icon: '/pwa-192x192.png',
    badge: '/pwa-64x64.png',
    data: payload.data,
    actions: [
      {
        action: 'open',
        title: '열기',
      },
      {
        action: 'close',
        title: '닫기',
      },
    ],
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})

// 알림 클릭 이벤트 처리
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] 알림 클릭:', event)

  event.notification.close()

  if (event.action === 'close') {
    return
  }

  // 알림 데이터에서 URL 가져오기
  const urlToOpen = event.notification.data?.url || '/'

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // 이미 열려있는 창이 있는지 확인
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i]
          if (
            client.url.includes(self.registration.scope) &&
            'focus' in client
          ) {
            return client.focus().then(() => {
              return client.navigate(urlToOpen)
            })
          }
        }

        // 열려있는 창이 없으면 새 창 열기
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      }),
  )
})
