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
    // 브라우저 정보 감지
    const userAgent = navigator.userAgent.toLowerCase()
    const isFirefox = userAgent.includes('firefox')
    const isSafari = userAgent.includes('safari') && !userAgent.includes('chrome')
    
    console.log('브라우저 정보:', {
      isFirefox,
      isSafari,
      userAgent: navigator.userAgent.substring(0, 50) + '...'
    })
    
    // 서비스 워커 등록 확인
    let registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js')
    
    if (!registration) {
      console.log('Firebase 서비스 워커가 등록되지 않았습니다. 등록 시도 중...')
      
      // 브라우저별 최적화된 설정
      const maxRetries = isFirefox ? 10 : isSafari ? 7 : 5
      const retryDelay = isFirefox ? 3000 : isSafari ? 2000 : 1000
      
      for (let i = 0; i < maxRetries; i++) {
        try {
          // 기존 서비스 워커 모두 언레지스터 (Firefox 대응)
          if (isFirefox && i === 0) {
            const registrations = await navigator.serviceWorker.getRegistrations()
            for (const reg of registrations) {
              if (reg.scope.includes(window.location.origin)) {
                await reg.unregister()
                console.log('기존 서비스 워커 언레지스터:', reg.scope)
              }
            }
            // 언레지스터 후 대기
            await new Promise((resolve) => setTimeout(resolve, 2000))
          }
          
          // 서비스 워커 등록
          registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
            scope: '/',
            updateViaCache: 'none'
          })
          
          console.log(`서비스 워커 등록 시도 ${i + 1}/${maxRetries} - 상태:`, registration.active ? 'active' : 'installing')
          
          // 활성화 대기
          if (!registration.active) {
            await new Promise((resolve) => {
              const stateChangeHandler = () => {
                if (registration.active) {
                  registration.installing?.removeEventListener('statechange', stateChangeHandler)
                  registration.waiting?.removeEventListener('statechange', stateChangeHandler)
                  resolve()
                }
              }
              
              if (registration.installing) {
                registration.installing.addEventListener('statechange', stateChangeHandler)
              }
              if (registration.waiting) {
                registration.waiting.addEventListener('statechange', stateChangeHandler)
              }
              
              // 타임아웃 설정
              setTimeout(() => resolve(), 5000)
            })
          }
          
          // 등록 완료 확인
          await navigator.serviceWorker.ready
          console.log('Firebase 서비스 워커 등록 성공')
          break
        } catch (regError) {
          console.error(`서비스 워커 등록 시도 ${i + 1}/${maxRetries} 실패:`, regError)
          if (i < maxRetries - 1) {
            await new Promise((resolve) => setTimeout(resolve, retryDelay))
          }
        }
      }
      
      // 최종 확인
      registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js')
      if (!registration) {
        throw new Error('서비스 워커 등록 실패 - 최대 재시도 횟수 초과')
      }
    }

    // 브라우저별 추가 대기 시간
    if (isFirefox) {
      console.log('Firefox 감지 - 추가 대기 중...')
      await new Promise((resolve) => setTimeout(resolve, 2000))
    } else if (isSafari) {
      console.log('Safari 감지 - 추가 대기 중...')
      await new Promise((resolve) => setTimeout(resolve, 1500))
    }

    // FCM 토큰 요청 전 재확인
    if (!registration.active) {
      console.warn('서비스 워커가 아직 활성화되지 않음. 활성화 대기 중...')
      await navigator.serviceWorker.ready
    }

    console.log('FCM 토큰 요청 중...')
    const currentToken = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    })

    if (currentToken) {
      console.log('FCM 토큰 생성 성공:', currentToken.substring(0, 10) + '...')
      console.log('브라우저:', isFirefox ? 'Firefox' : isSafari ? 'Safari' : 'Other')
      console.log('서비스 워커 상태:', registration.active ? 'Active' : 'Not Active')
      return currentToken
    } else {
      console.log('FCM 토큰을 가져올 수 없습니다.')
      return null
    }
  } catch (error) {
    console.error('FCM 토큰 가져오기 오류:', error)
    console.error('에러 스택:', error.stack)
    
    // 특정 에러에 대한 자세한 설명
    if (error.code === 'messaging/permission-blocked') {
      console.error('알림 권한이 차단되었습니다. 브라우저 설정에서 알림을 허용해주세요.')
    } else if (error.code === 'messaging/failed-service-worker-registration') {
      console.error('서비스 워커 등록 실패. 브라우저가 서비스 워커를 지원하는지 확인하세요.')
    } else if (error.code === 'messaging/token-subscribe-failed') {
      console.error('FCM 토큰 구독 실패. 네트워크 연결을 확인하세요.')
    } else if (error.message && error.message.includes('Failed to register a ServiceWorker')) {
      console.error('서비스 워커 등록 실패. 브라우저 설정을 확인하세요.')
    } else if (error.message && error.message.includes('timeout')) {
      console.error('요청 시간 초과. 네트워크 상태를 확인하세요.')
    }
    return null
  }
}

// 포그라운드 메시지 리스너
export const onMessageListener = (callback) => {
  if (!messaging) {
    console.error('Firebase Messaging이 초기화되지 않았습니다.')
    return () => {} // 빈 cleanup 함수 반환
  }

  try {
    // 브라우저 정보
    const isFirefox = navigator.userAgent.toLowerCase().includes('firefox')
    const isSafari = navigator.userAgent.toLowerCase().includes('safari') && !navigator.userAgent.toLowerCase().includes('chrome')
    
    // 직접 콜백을 사용하도록 변경
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('포그라운드 메시지 수신:', payload)
      console.log('페이로드 구조:', {
        notification: payload.notification,
        data: payload.data,
        messageId: payload.messageId,
        from: payload.from
      })
      
      // Firefox와 Safari에서 알림 표시 (백업 메커니즘)
      if (Notification.permission === 'granted' && (isFirefox || isSafari)) {
        try {
          const notificationTitle = payload.notification?.title || payload.data?.title || '새로운 알림'
          const notificationBody = payload.notification?.body || payload.data?.body || '알림 내용이 없습니다.'
          const notificationIcon = payload.notification?.icon || payload.data?.icon || '/pwa-192x192.png'
          
          const notification = new Notification(notificationTitle, {
            body: notificationBody,
            icon: notificationIcon,
            badge: '/pwa-64x64.png',
            tag: payload.messageId || `fcm-${Date.now()}`,
            requireInteraction: false,
            silent: false,
            data: payload.data || {}
          })

          // 자동 닫기 (5초 후)
          setTimeout(() => {
            notification.close()
          }, 5000)

          notification.onclick = () => {
            notification.close()
            window.focus()
            
            // 알림 클릭 시 해당 페이지로 이동
            if (payload.data?.url) {
              window.location.href = payload.data.url
            } else if (payload.data?.click_action) {
              window.location.href = payload.data.click_action
            }
          }

          notification.onerror = (err) => {
            console.error('Notification 표시 오류:', err)
          }
          
          console.log(`${isFirefox ? 'Firefox' : 'Safari'}에서 백업 알림 표시 완료`)
        } catch (notifError) {
          console.error('백업 알림 표시 실패:', notifError)
        }
      }
      
      // 콜백 실행
      if (callback && typeof callback === 'function') {
        try {
          callback(payload)
        } catch (callbackError) {
          console.error('알림 콜백 실행 오류:', callbackError)
        }
      }
    })

    console.log('포그라운드 메시지 리스너 등록 완료')
    return unsubscribe
  } catch (error) {
    console.error('메시지 리스너 등록 오류:', error)
    return () => {} // 빈 cleanup 함수 반환
  }
}

// 알림 권한 요청
export const requestNotificationPermission = async () => {
  try {
    // 브라우저 알림 지원 확인
    if (!('Notification' in window)) {
      console.error('이 브라우저는 알림을 지원하지 않습니다.')
      return 'unsupported'
    }

    // 현재 권한 상태 확인
    let permission = Notification.permission
    console.log('현재 알림 권한 상태:', permission)

    // 권한이 기본값(default)인 경우에만 요청
    if (permission === 'default') {
      // Firefox의 경우 특별 처리
      const isFirefox = navigator.userAgent.toLowerCase().includes('firefox')
      
      if (isFirefox) {
        console.log('Firefox 감지 - 알림 권한 요청 중...')
        // Firefox는 사용자 제스처 없이 권한 요청이 제한될 수 있음
        try {
          permission = await Notification.requestPermission()
        } catch (firefoxError) {
          console.error('Firefox 권한 요청 오류:', firefoxError)
          // 대체 방법 시도
          return new Promise((resolve) => {
            Notification.requestPermission((result) => {
              console.log('Firefox 권한 요청 결과:', result)
              resolve(result)
            })
          })
        }
      } else {
        permission = await Notification.requestPermission()
      }
    }

    console.log('최종 알림 권한:', permission)
    
    // 권한이 허용된 경우 테스트 알림
    if (permission === 'granted') {
      console.log('알림 권한이 허용되었습니다.')
    } else if (permission === 'denied') {
      console.warn('알림 권한이 거부되었습니다. 브라우저 설정에서 변경할 수 있습니다.')
    }
    
    return permission
  } catch (error) {
    console.error('알림 권한 요청 오류:', error)
    return 'denied'
  }
}

export { app, messaging, analytics }
