import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Bell, X, Clock, Trash2 } from '@/components/icons'
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
import {
  getReceivedNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteReceivedNotification,
  clearAllReceivedNotifications,
  addReceivedNotificationChangeListener,
} from '@/utils/receivedNotifications'
import { toast } from 'sonner'

/**
 * 헤더 알림 아이콘 컴포넌트
 * 받은 알림과 예약된 알림을 탭으로 분리하여 표시
 * 읽지 않은 알림 개수를 배지로 표시
 */
export function NotificationIcon({ className = '' }) {
  const [scheduledNotifications, setScheduledNotifications] = useState([])
  const [receivedNotifications, setReceivedNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('received')

  // 컴포넌트 마운트 및 실시간 알림 업데이트
  useEffect(() => {
    loadScheduledNotifications()
    loadReceivedNotifications()

    // 스케줄된 알림 변경 이벤트 리스너 등록
    const unsubscribeScheduled = addNotificationChangeListener(loadScheduledNotifications)
    
    // 받은 알림 변경 이벤트 리스너 등록
    const unsubscribeReceived = addReceivedNotificationChangeListener(loadReceivedNotifications)

    // 10초마다 알림 목록 업데이트 (만료된 알림 정리용)
    const interval = setInterval(() => {
      loadScheduledNotifications()
      loadReceivedNotifications()
    }, 10000)

    return () => {
      unsubscribeScheduled()
      unsubscribeReceived()
      clearInterval(interval)
    }
  }, [])

  // 스케줄된 알림 목록 로드
  const loadScheduledNotifications = () => {
    // 만료된 알림 먼저 정리
    cleanupExpiredNotifications()

    const scheduled = getScheduledNotifications()

    // 현재 시간 기준으로 유효한 알림만 필터링
    const now = new Date()
    const validNotifications = scheduled.filter((notification) => {
      const scheduledTime = new Date(notification.scheduledTime)
      return scheduledTime > now && notification.status === 'scheduled'
    })

    setScheduledNotifications(validNotifications)
  }

  // 받은 알림 목록 로드
  const loadReceivedNotifications = () => {
    const received = getReceivedNotifications()
    const unread = getUnreadNotificationCount()
    
    setReceivedNotifications(received)
    setUnreadCount(unread)
  }

  // 스케줄된 알림 취소
  const handleCancelNotification = (notificationId) => {
    cancelScheduledNotification(notificationId)
    removeScheduledNotification(notificationId)
    loadScheduledNotifications()

    toast.success('알림이 취소되었습니다')
  }

  // 받은 알림 읽음 처리
  const handleMarkAsRead = (notificationId) => {
    markNotificationAsRead(notificationId)
    loadReceivedNotifications()
  }

  // 받은 알림 삭제
  const handleDeleteReceived = (notificationId) => {
    deleteReceivedNotification(notificationId)
    loadReceivedNotifications()
    toast.success('알림이 삭제되었습니다')
  }

  // 모든 스케줄된 알림 삭제
  const handleClearAllScheduled = () => {
    scheduledNotifications.forEach((notification) => {
      cancelScheduledNotification(notification.id)
      removeScheduledNotification(notification.id)
    })

    loadScheduledNotifications()
    toast.success('모든 예약된 알림이 삭제되었습니다')
  }

  // 모든 받은 알림 읽음 처리
  const handleMarkAllAsRead = () => {
    markAllNotificationsAsRead()
    loadReceivedNotifications()
    toast.success('모든 알림을 읽음 처리했습니다')
  }

  // 모든 받은 알림 삭제
  const handleClearAllReceived = () => {
    clearAllReceivedNotifications()
    loadReceivedNotifications()
    toast.success('모든 받은 알림이 삭제되었습니다')
  }

  // 배지에 표시할 개수 (읽지 않은 받은 알림 + 예약된 알림)
  const badgeCount = unreadCount + scheduledNotifications.length

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
      case 'fcm':
        return '📱'
      case 'system':
        return '⚙️'
      default:
        return '📢'
    }
  }

  // 시간 포맷팅 (받은 알림용)
  const formatReceivedTime = (timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now.getTime() - time.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) return `${diffDays}일 전`
    if (diffHours > 0) return `${diffHours}시간 전`
    if (diffMinutes > 0) return `${diffMinutes}분 전`
    return '방금 전'
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
          {badgeCount > 0 && (
            <Badge
              variant={unreadCount > 0 ? "destructive" : "secondary"}
              className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center p-0 text-xs"
            >
              {badgeCount > 99 ? '99+' : badgeCount}
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
          <h3 className="text-sm font-semibold">알림</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            받은 알림 {receivedNotifications.length}개 • 예약된 알림 {scheduledNotifications.length}개
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="received" className="relative">
              받은 알림
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-1 h-4 w-4 p-0 text-xs"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="scheduled">
              예약된 알림
              {scheduledNotifications.length > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1 h-4 w-4 p-0 text-xs"
                >
                  {scheduledNotifications.length > 9 ? '9+' : scheduledNotifications.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* 받은 알림 탭 */}
          <TabsContent value="received" className="m-0">
            <div className="border-b border-gray-200 px-4 py-2 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {receivedNotifications.length}개의 받은 알림
                </span>
                {receivedNotifications.length > 0 && (
                  <div className="flex space-x-1">
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleMarkAllAsRead}
                        className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700"
                      >
                        모두 읽음
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearAllReceived}
                      className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
                    >
                      모두 삭제
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {receivedNotifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  받은 알림이 없습니다
                </p>
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto">
                {receivedNotifications.map((notification, index) => (
                  <div key={notification.id}>
                    <DropdownMenuItem
                      className={`cursor-pointer px-4 py-3 ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-950' : ''}`}
                      onClick={() => {
                        if (!notification.isRead) {
                          handleMarkAsRead(notification.id)
                        }
                      }}
                    >
                      <div className="flex w-full items-start justify-between space-x-3">
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center space-x-2">
                            <span className="text-base">
                              {getNotificationIcon(notification.type)}
                            </span>
                            <span className={`truncate text-sm ${!notification.isRead ? 'font-semibold' : 'font-medium'}`}>
                              {notification.title}
                            </span>
                            {!notification.isRead && (
                              <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                            )}
                          </div>

                          <p className="mb-2 line-clamp-2 text-xs text-gray-600 dark:text-gray-400">
                            {notification.body}
                          </p>

                          <div className="text-xs text-gray-400">
                            {formatReceivedTime(notification.timestamp)}
                          </div>
                        </div>

                        <div className="flex flex-col space-y-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteReceived(notification.id)
                            }}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </DropdownMenuItem>

                    {index < receivedNotifications.length - 1 && <DropdownMenuSeparator />}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* 예약된 알림 탭 */}
          <TabsContent value="scheduled" className="m-0">
            <div className="border-b border-gray-200 px-4 py-2 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {scheduledNotifications.length}개의 예약된 알림
                </span>
                {scheduledNotifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAllScheduled}
                    className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
                  >
                    모두 삭제
                  </Button>
                )}
              </div>
            </div>

            {scheduledNotifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Clock className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  예약된 알림이 없습니다
                </p>
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  여행 계획에서 알림을 설정해보세요
                </p>
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto">
                {scheduledNotifications.map((notification, index) => (
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

                    {index < scheduledNotifications.length - 1 && <DropdownMenuSeparator />}
                  </div>
                ))}
              </div>
            )}

            {scheduledNotifications.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <div className="px-4 py-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    💡 브라우저가 열려있을 때만 알림이 작동합니다
                  </p>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default NotificationIcon
