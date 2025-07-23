import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Bell, X } from '@/components/icons'
import { Card } from '@/components/ui/card'
import { initializeFCMToken } from '@/services/notificationService'
import { toast } from 'sonner'

/**
 * 알림 권한 요청 배너
 * 알림 권한이 없는 경우 표시되며, 사용자에게 알림 권한을 요청합니다.
 */
export function NotificationPermissionBanner() {
  const [show, setShow] = useState(false)
  const [isRequesting, setIsRequesting] = useState(false)

  useEffect(() => {
    // 브라우저 알림 지원 확인
    if (!('Notification' in window)) {
      return
    }

    // 로그인 상태 확인
    const isLoggedIn = localStorage.getItem('access_token')
    if (!isLoggedIn) {
      return
    }

    // 알림 권한 상태 확인
    if (Notification.permission === 'default') {
      // 배너 표시 여부 확인 (7일간 다시 표시하지 않음)
      const dismissedAt = localStorage.getItem('notification_banner_dismissed')
      if (dismissedAt) {
        const dismissedDate = new Date(dismissedAt)
        const now = new Date()
        const daysDiff = (now - dismissedDate) / (1000 * 60 * 60 * 24)
        if (daysDiff < 7) {
          return
        }
      }
      setShow(true)
    }
  }, [])

  const handleRequestPermission = async () => {
    setIsRequesting(true)
    try {
      const token = await initializeFCMToken()
      if (token) {
        toast.success('알림이 활성화되었습니다! 이제 중요한 알림을 받으실 수 있습니다.')
        setShow(false)
      } else if (Notification.permission === 'denied') {
        toast.error('알림 권한이 거부되었습니다. 브라우저 설정에서 알림을 허용해주세요.')
        setShow(false)
      }
    } catch (error) {
      toast.error('알림 설정 중 오류가 발생했습니다.')
    } finally {
      setIsRequesting(false)
    }
  }

  const handleDismiss = () => {
    localStorage.setItem('notification_banner_dismissed', new Date().toISOString())
    setShow(false)
  }

  if (!show) return null

  return (
    <Card className="mx-4 mt-4 mb-2 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3 flex-1">
          <div className="flex-shrink-0">
            <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
              알림을 받으시겠습니까?
            </h3>
            <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
              여행 일정 알림, 날씨 정보 등 유용한 알림을 받아보세요.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleRequestPermission}
            disabled={isRequesting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isRequesting ? '설정 중...' : '알림 허용'}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="text-blue-600 hover:text-blue-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default NotificationPermissionBanner