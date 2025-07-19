import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID || 'weather-flick-default',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY

// Firebase 초기화
let app
let messaging
let analytics

try {
  // Firebase 필수 설정 확인
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.warn(
      'Firebase 설정이 완전하지 않습니다. 일부 기능이 비활성화됩니다.',
    )
    throw new Error('Firebase configuration incomplete')
  }

  app = initializeApp(firebaseConfig)

  // Analytics 초기화 (선택사항)
  if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
    analytics = getAnalytics(app)
  }

  // Messaging 초기화
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    messaging = getMessaging(app)
  }
} catch (error) {
  console.warn('Firebase 초기화 건너뛰기:', error.message)
  // Firebase 없이도 앱이 동작하도록 처리
}

// FCM 토큰 가져오기
export const getFCMToken = async () => {
  if (!messaging) {
    console.error('Firebase Messaging이 초기화되지 않았습니다.')
    return null
  }

  // 알림 권한이 이미 허용된 경우에만 토큰을 가져옴
  if (Notification.permission !== 'granted') {
    console.log('알림 권한이 없습니다. 토큰을 가져올 수 없습니다.')
    return null
  }

  try {
    // 서비스 워커 등록 확인
    const registration = await navigator.serviceWorker.getRegistration()
    if (!registration) {
      console.log('서비스 워커가 등록되지 않았습니다. 대기 중...')
      // 서비스 워커 등록 대기
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    const currentToken = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    })

    if (currentToken) {
      console.log('FCM 토큰 생성 성공:', currentToken.substring(0, 10) + '...')
      return currentToken
    } else {
      console.log('FCM 토큰을 가져올 수 없습니다.')
      return null
    }
  } catch (error) {
    console.error('FCM 토큰 가져오기 오류:', error)
    // 특정 에러에 대한 자세한 설명
    if (error.code === 'messaging/permission-blocked') {
      console.error('알림 권한이 차단되었습니다.')
    } else if (error.code === 'messaging/failed-service-worker-registration') {
      console.error('서비스 워커 등록 실패')
    }
    return null
  }
}

// 포그라운드 메시지 리스너
export const onMessageListener = () => {
  if (!messaging) {
    console.error('Firebase Messaging이 초기화되지 않았습니다.')
    return Promise.reject(new Error('Messaging not initialized'))
  }

  return new Promise((resolve) => {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('포그라운드 메시지 수신:', payload)
      resolve(payload)
    })

    // unsubscribe 함수를 반환하여 정리할 수 있도록 함
    return unsubscribe
  })
}

// 알림 권한 요청
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission()
    console.log('알림 권한:', permission)
    return permission
  } catch (error) {
    console.error('알림 권한 요청 오류:', error)
    return 'denied'
  }
}

export { app, messaging, analytics }
