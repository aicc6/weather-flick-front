import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell, X, Clock, Check } from '@/components/icons'
import {
  getScheduledNotifications,
  removeScheduledNotification,
  updateScheduledNotificationStatus,
  addNotificationChangeListener,
} from '@/utils/notificationStorage'
import {
  cancelScheduledNotification,
  formatNotificationTime,
} from '@/utils/notificationUtils'
import { cleanupExpiredNotifications } from '@/utils/notificationCleanup'
import { toast } from 'sonner'

/**
 * 헤더 알림 아이콘 컴포넌트
 * 스케줄된 알림 개수를 배지로 표시하고 드롭다운으로 알림 목록 관리
 */
export function NotificationIcon({ className = '' }) {
  const [notifications, setNotifications] = useState([])
  const [isOpen, setIsOpen] = useState(false)

  // 컴포넌트 마운트 및 실시간 알림 업데이트
  useEffect(() => {
    loadNotifications()

    // 알림 변경 이벤트 리스너 등록
    const unsubscribe = addNotificationChangeListener(loadNotifications)

    // 10초마다 알림 목록 업데이트 (만료된 알림 정리용)
    const interval = setInterval(loadNotifications, 10000)

    return () => {
      unsubscribe()
      clearInterval(interval)
    }
  }, [])

  // 스케줄된 알림 목록 로드
  const loadNotifications = () => {
    // 만료된 알림 먼저 정리
    cleanupExpiredNotifications()

    const scheduled = getScheduledNotifications()

    // 현재 시간 기준으로 유효한 알림만 필터링
    const now = new Date()
    const validNotifications = scheduled.filter((notification) => {
      const scheduledTime = new Date(notification.scheduledTime)
      return scheduledTime > now && notification.status === 'scheduled'
    })

    setNotifications(validNotifications)
  }

  // 알림 취소
  const handleCancelNotification = (notificationId) => {
    cancelScheduledNotification(notificationId)
    removeScheduledNotification(notificationId)
    loadNotifications()

    toast.success('알림이 취소되었습니다')
  }

  // 알림 읽음 처리
  const handleMarkAsRead = (notificationId) => {
    updateScheduledNotificationStatus(notificationId, 'read')
    loadNotifications()
  }

  // 모든 알림 삭제
  const handleClearAll = () => {
    notifications.forEach((notification) => {
      cancelScheduledNotification(notification.id)
      removeScheduledNotification(notification.id)
    })

    loadNotifications()
    setIsOpen(false)
    toast.success('모든 알림이 삭제되었습니다')
  }

  // 활성 알림 개수
  const activeCount = notifications.length

  // 알림 타입별 아이콘
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'departure':
        return '🚗'
      case 'traffic':
        return '🚦'
      case 'weather':
        return '🌧️'
      case 'arrival':
        return '🏁'
      default:
        return '📢'
    }
  }

  // 남은 시간 계산
  const getTimeRemaining = (scheduledTime) => {
    const now = new Date()
    const scheduled = new Date(scheduledTime)
    const diffMs = scheduled.getTime() - now.getTime()

    if (diffMs <= 0) return '곧 알림'

    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) return `${diffDays}일 후`
    if (diffHours > 0) return `${diffHours}시간 후`
    if (diffMinutes > 0) return `${diffMinutes}분 후`
    return '곧 알림'
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`relative ${className}`}
          aria-label="알림"
        >
          <Bell className="h-5 w-5" />
          {activeCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center p-0 text-xs"
            >
              {activeCount > 99 ? '99+' : activeCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="max-h-96 w-96 overflow-y-auto"
        align="end"
        sideOffset={5}
      >
        <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">예약된 알림</h3>
            {activeCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="h-auto p-1 text-xs text-gray-500 hover:text-gray-700"
              >
                모두 삭제
              </Button>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {activeCount}개의 예약된 알림
          </p>
        </div>

        {activeCount === 0 ? (
          <div className="px-4 py-8 text-center">
            <Bell className="mx-auto mb-2 h-8 w-8 text-gray-400" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              예약된 알림이 없습니다
            </p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              여행 계획에서 알림을 설정해보세요
            </p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((notification, index) => (
              <div key={notification.id}>
                <DropdownMenuItem
                  className="cursor-default px-4 py-3 focus:bg-transparent"
                  onSelect={(e) => e.preventDefault()}
                >
                  <div className="flex w-full items-start justify-between space-x-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center space-x-2">
                        <span className="text-base">
                          {getNotificationIcon(notification.type)}
                        </span>
                        <span className="truncate text-sm font-medium">
                          {notification.title}
                        </span>
                      </div>

                      <p className="mb-2 line-clamp-2 text-xs text-gray-600 dark:text-gray-400">
                        {notification.body}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>
                            {getTimeRemaining(notification.scheduledTime)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatNotificationTime(
                            new Date(notification.scheduledTime),
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleCancelNotification(notification.id)
                        }
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </DropdownMenuItem>

                {index < notifications.length - 1 && <DropdownMenuSeparator />}
              </div>
            ))}
          </div>
        )}

        {activeCount > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="px-4 py-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                💡 브라우저가 열려있을 때만 알림이 작동합니다
              </p>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default NotificationIcon
