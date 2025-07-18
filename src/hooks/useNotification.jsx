import { useState, useEffect } from 'react'
import { messaging } from '@/lib/firebase'
import { onMessage } from 'firebase/messaging'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { isAuthenticated } from '@/utils/authCheck'
import { 
  saveReceivedNotification, 
  extractNotificationFromFCM 
} from '@/utils/receivedNotifications'

export function useNotification() {
  const [notification, setNotification] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // 로그인하지 않은 상태면 리스너 설정하지 않음
    if (!isAuthenticated()) {
      console.log('로그인하지 않은 상태에서는 알림 리스너를 설정하지 않습니다.')
      return
    }

    // 포그라운드 메시지 리스너 설정
    let unsubscribe

    const setupListener = async () => {
      try {
        // messaging이 없으면 early return
        if (!messaging) {
          console.log('Firebase Messaging이 초기화되지 않았습니다.')
          return
        }

        // onMessage 리스너 설정
        unsubscribe = onMessage(messaging, (payload) => {
          console.log('포그라운드 알림 수신:', payload)

          const { notification, data } = payload

          // 알림 표시
          if (!notification) return

          // 받은 알림을 저장소에 저장
          const notificationData = extractNotificationFromFCM(payload)
          const savedNotification = saveReceivedNotification(notificationData)
          console.log('알림 저장 완료:', savedNotification)

          // 커스텀 토스트 알림 표시
          toast.custom(
            (t) => (
              <div
                className="ring-opacity-5 flex w-full max-w-md items-start gap-3 rounded-lg bg-white p-4 shadow-lg ring-1 ring-black cursor-pointer"
                onClick={() => {
                  // 알림 클릭 시 동작
                  if (data?.url) {
                    navigate(data.url)
                  }
                  toast.dismiss(t)
                }}
              >
                <div className="relative">
                  <img
                    src="/pwa-64x64.png"
                    alt="Weather Flick"
                    className="h-10 w-10 rounded-full"
                  />
                  <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500"></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    {notification.title}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    {notification.body}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    방금 전
                  </p>
                </div>
              </div>
            ),
            {
              duration: 8000,
              position: 'top-right',
            },
          )

          // 상태 업데이트
          setNotification({
            title: notification.title,
            body: notification.body,
            data: data,
            timestamp: new Date().toISOString(),
          })
        })
      } catch (err) {
        console.error('메시지 리스너 오류:', err)
      }
    }

    setupListener()

    return () => {
      // 정리 함수
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe()
      }
    }
  }, [navigate])

  // 브라우저 알림 표시 (대체 방법)
  const showBrowserNotification = (title, body, data = {}) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      // 받은 알림으로 저장
      const notificationData = {
        title,
        body,
        data,
        type: 'system'
      }
      const savedNotification = saveReceivedNotification(notificationData)
      console.log('시스템 알림 저장 완료:', savedNotification)

      const notification = new Notification(title, {
        body,
        icon: '/pwa-192x192.png',
        badge: '/pwa-64x64.png',
        data,
      })

      notification.onclick = () => {
        window.focus()
        if (data.url) {
          navigate(data.url)
        }
        notification.close()
      }
    }
  }

  return {
    notification,
    showBrowserNotification,
  }
}
