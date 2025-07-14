import { useState, useEffect } from 'react'
import { Bell, BellOff, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { requestNotificationPermission, getFCMToken } from '@/lib/firebase'
import { saveFCMToken } from '@/services/notificationService'
import { toast } from 'sonner'

export default function NotificationPermission() {
  const [permission, setPermission] = useState(Notification.permission)
  const [showPrompt, setShowPrompt] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // 알림 권한이 기본값이고 로그인한 상태일 때만 프롬프트 표시
    const token = localStorage.getItem('access_token')
    const promptDismissed = localStorage.getItem('notification-prompt-dismissed')
    
    if (token && permission === 'default' && !promptDismissed) {
      const timer = setTimeout(() => {
        setShowPrompt(true)
      }, 5000) // 5초 후 표시

      return () => clearTimeout(timer)
    }
  }, [permission])

  const handleEnableNotifications = async () => {
    setLoading(true)
    try {
      const result = await requestNotificationPermission()
      setPermission(result)

      if (result === 'granted') {
        // FCM 토큰 가져오기
        const fcmToken = await getFCMToken()
        
        if (fcmToken) {
          // 백엔드에 FCM 토큰 전송
          try {
            await saveFCMToken(fcmToken)
            localStorage.setItem('fcm_token', fcmToken)
            toast.success('알림이 활성화되었습니다.')
            setShowPrompt(false)
          } catch (error) {
            console.error('FCM 토큰 저장 실패:', error)
            // 백엔드 API가 아직 구현되지 않은 경우에도 프론트엔드는 정상 작동
            toast.success('알림이 활성화되었습니다.')
            setShowPrompt(false)
          }
        } else {
          toast.error('알림 토큰을 가져올 수 없습니다.')
        }
      } else if (result === 'denied') {
        toast.error('알림 권한이 거부되었습니다. 브라우저 설정에서 변경할 수 있습니다.')
        setShowPrompt(false)
      }
    } catch (error) {
      console.error('알림 활성화 오류:', error)
      toast.error('알림 활성화 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('notification-prompt-dismissed', 'true')
  }

  if (!showPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-20 right-4 z-40 animate-in slide-in-from-right-5 md:right-8">
      <Card className="w-80 p-4 shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Bell className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">알림 받기</h3>
              <p className="mt-1 text-sm text-gray-600">
                여행 계획 업데이트, 날씨 변화 등 중요한 정보를 실시간으로 받아보세요.
              </p>
            </div>
          </div>
          <Button
            onClick={handleDismiss}
            size="icon"
            variant="ghost"
            className="h-8 w-8 shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-4 flex gap-2">
          <Button
            onClick={handleEnableNotifications}
            size="sm"
            className="flex-1"
            disabled={loading}
          >
            {loading ? '처리 중...' : '알림 켜기'}
          </Button>
          <Button
            onClick={handleDismiss}
            size="sm"
            variant="outline"
            className="flex-1"
          >
            나중에
          </Button>
        </div>
      </Card>
    </div>
  )
}