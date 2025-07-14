import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Clock, Bell, X, Settings } from '@/components/icons'
import {
  requestNotificationPermission,
  getNotificationPermission,
  isNotificationSupported,
  scheduleNotification,
  cancelScheduledNotification,
  showTestNotification,
  calculateNotificationTime,
  formatNotificationTime,
} from '@/utils/notificationUtils'
import {
  getRouteNotificationSettings,
  saveRouteNotificationSettings,
  saveScheduledNotification,
  getScheduledNotifications,
  removeScheduledNotification,
} from '@/utils/notificationStorage'
import { cleanupDuplicateNotifications } from '@/utils/notificationCleanup'

/**
 * 알림 설정 컴포넌트
 * 기존 기능에 영향을 주지 않는 안전한 구현
 */
export function NotificationSettings({
  route,
  planId,
  size = 'default',
  className = '',
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [settings, setSettings] = useState({})
  const [permission, setPermission] = useState('default')
  const [isLoading, setIsLoading] = useState(false)
  const [scheduledNotifications, setScheduledNotifications] = useState([])

  // 컴포넌트 마운트 시 설정 로드
  useEffect(() => {
    loadSettings()
    checkPermission()
    loadScheduledNotifications()
  }, [route?.route_id, planId])

  const loadSettings = () => {
    if (route?.route_id) {
      const routeSettings = getRouteNotificationSettings(route.route_id, planId)
      
      // 출발 시간이 없으면 현재 시간에서 1시간 후로 기본 설정
      if (!routeSettings.departureTime) {
        const now = new Date()
        const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)
        const defaultTime = oneHourLater.toISOString().slice(0, 16) // YYYY-MM-DDTHH:mm 형식
        routeSettings.departureTime = defaultTime
      }
      
      setSettings(routeSettings)
    }
  }

  const checkPermission = () => {
    const currentPermission = getNotificationPermission()
    setPermission(currentPermission)
  }

  const loadScheduledNotifications = () => {
    // 먼저 중복 알림 정리
    cleanupDuplicateNotifications(planId)
    
    const scheduled = getScheduledNotifications(planId)
    const routeNotifications = scheduled.filter(
      (n) =>
        n.routeId === route?.route_id ||
        n.routeId === route?.route_id?.toString(),
    )
    setScheduledNotifications(routeNotifications)
  }

  const handlePermissionRequest = async () => {
    setIsLoading(true)

    try {
      const newPermission = await requestNotificationPermission()
      setPermission(newPermission)

      if (newPermission === 'granted') {
        toast.success('알림 권한이 허용되었습니다', {
          description: '이제 여행 알림을 받을 수 있습니다',
          duration: 3000,
        })
      } else if (newPermission === 'denied') {
        toast.error('알림 권한이 거부되었습니다', {
          description: '브라우저 설정에서 알림을 허용해주세요',
          duration: 5000,
        })
      }
    } catch (error) {
      console.error('권한 요청 실패:', error)
      toast.error('권한 요청 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSettingsChange = (key, value) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)

    if (route?.route_id) {
      saveRouteNotificationSettings(route.route_id, newSettings)
      toast.success('설정이 저장되었습니다', {
        duration: 2000,
      })
    }
  }

  const handleTestNotification = () => {
    if (permission !== 'granted') {
      toast.error('알림 권한이 필요합니다')
      return
    }

    const result = showTestNotification()
    if (result) {
      toast.success('테스트 알림이 전송되었습니다')
    } else {
      toast.error('테스트 알림 전송에 실패했습니다')
    }
  }

  const handleScheduleNotification = () => {
    if (permission !== 'granted') {
      toast.error('알림 권한이 필요합니다')
      return
    }

    if (!route || !settings.departureTime) {
      toast.error('출발 시간 정보가 필요합니다')
      return
    }

    const result = calculateNotificationTime(
      settings.departureTime,
      settings.minutesBefore || 30,
    )

    if (result.isInPast) {
      toast.error('출발 시간이 이미 지났습니다')
      return
    }

    const { notificationTime, delayMs, isImmediateNotification } = result

    // 즉시 알림인 경우 사용자에게 안내
    if (isImmediateNotification) {
      toast.info('알림 시간이 이미 지나서 곧바로 알림을 전송합니다', {
        duration: 3000
      })
    }

    // 기존 알림이 있다면 먼저 취소
    const baseNotificationId = `departure_${route.route_id}`
    
    // 기존 동일 경로 알림들 취소 및 제거
    const existingNotifications = getScheduledNotifications(planId)
    existingNotifications.forEach(notification => {
      if (notification.routeId === route.route_id && notification.type === 'departure') {
        cancelScheduledNotification(notification.id)
        removeScheduledNotification(notification.id)
      }
    })
    
    // 새로운 알림 ID 생성
    const notificationId = `${baseNotificationId}_${Date.now()}`
    const notificationData = {
      title: `🚗 출발 알림`,
      options: {
        body: `${route.departure_name || '출발지'}에서 ${route.destination_name || '도착지'}로 ${settings.minutesBefore}분 후 출발 예정입니다`,
        tag: notificationId,
        data: {
          type: 'departure',
          routeId: route.route_id,
          planId: planId,
        },
      },
    }

    const scheduled = scheduleNotification(
      notificationData,
      delayMs,
      notificationId,
    )

    // 로컬 스토리지에 저장
    saveScheduledNotification({
      id: notificationId,
      title: notificationData.title,
      body: notificationData.options.body,
      scheduledTime: notificationTime.toISOString(),
      type: 'departure',
      routeId: route.route_id,
      planId: planId,
    })

    setScheduledNotifications((prev) => [
      ...prev,
      {
        id: notificationId,
        scheduledTime: notificationTime.toISOString(),
        type: 'departure',
        status: 'scheduled',
      },
    ])

    const successMessage = isImmediateNotification
      ? '출발 알림이 곧바로 전송됩니다'
      : '출발 알림이 예약되었습니다'
    
    const successDescription = isImmediateNotification
      ? '알림 시간이 지나서 즉시 알림을 보냅니다'
      : `${formatNotificationTime(notificationTime)}에 알림이 전송됩니다`

    toast.success(successMessage, {
      description: successDescription,
      duration: 3000,
    })
  }

  const handleCancelNotification = (notificationId) => {
    cancelScheduledNotification(notificationId)
    removeScheduledNotification(notificationId)
    setScheduledNotifications((prev) =>
      prev.filter((n) => n.id !== notificationId),
    )

    toast.success('알림이 취소되었습니다')
  }

  const handleCleanupDuplicates = () => {
    const removedCount = cleanupDuplicateNotifications(planId)
    if (removedCount > 0) {
      toast.success(`중복된 알림 ${removedCount}개가 정리되었습니다`)
      loadScheduledNotifications()
    } else {
      toast.info('정리할 중복 알림이 없습니다')
    }
  }

  const getPermissionStatus = () => {
    if (!isNotificationSupported()) {
      return { text: '지원되지 않음', color: 'gray', icon: '❌' }
    }

    switch (permission) {
      case 'granted':
        return { text: '허용됨', color: 'green', icon: '✅' }
      case 'denied':
        return { text: '거부됨', color: 'red', icon: '❌' }
      default:
        return { text: '요청 필요', color: 'yellow', icon: '⚠️' }
    }
  }

  const permissionStatus = getPermissionStatus()

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size={size}
          disabled={disabled}
          className={className}
        >
          <Clock className="mr-2 h-4 w-4" />
          알림 설정
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            여행 알림 설정
          </DialogTitle>
          <DialogDescription>
            {route?.departure_name || '출발지'} →{' '}
            {route?.destination_name || '도착지'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 알림 권한 상태 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm">
                알림 권한 상태
                <Badge
                  variant={
                    permissionStatus.color === 'green' ? 'default' : 'secondary'
                  }
                  className="text-xs"
                >
                  {permissionStatus.icon} {permissionStatus.text}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {permission !== 'granted' && (
                <Button
                  onClick={handlePermissionRequest}
                  disabled={isLoading || !isNotificationSupported()}
                  size="sm"
                  className="w-full"
                >
                  {isLoading ? '요청 중...' : '알림 권한 허용'}
                </Button>
              )}

              {permission === 'granted' && (
                <Button
                  onClick={handleTestNotification}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  테스트 알림
                </Button>
              )}
            </CardContent>
          </Card>

          {/* 출발 알림 설정 */}
          {permission === 'granted' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">출발 알림</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    출발 전 알림 시간
                  </label>
                  <select
                    value={settings.minutesBefore || 30}
                    onChange={(e) =>
                      handleSettingsChange(
                        'minutesBefore',
                        parseInt(e.target.value),
                      )
                    }
                    className="rounded border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800"
                  >
                    <option value={5}>5분 전</option>
                    <option value={10}>10분 전</option>
                    <option value={15}>15분 전</option>
                    <option value={30}>30분 전</option>
                    <option value={60}>1시간 전</option>
                    <option value={120}>2시간 전</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">출발 시간</label>
                  <input
                    type="datetime-local"
                    value={settings.departureTime || ''}
                    onChange={(e) =>
                      handleSettingsChange('departureTime', e.target.value)
                    }
                    className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    알림을 받을 출발 시간을 설정하세요
                  </p>
                </div>

                <Button
                  onClick={handleScheduleNotification}
                  disabled={!settings.departureTime}
                  size="sm"
                  className="w-full"
                >
                  <Bell className="mr-2 h-4 w-4" />
                  출발 알림 예약
                </Button>
              </CardContent>
            </Card>
          )}

          {/* 예약된 알림 목록 */}
          {scheduledNotifications.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  예약된 알림
                  <Button
                    onClick={handleCleanupDuplicates}
                    variant="ghost"
                    size="sm"
                    className="h-auto p-1 text-xs text-gray-500 hover:text-gray-700"
                  >
                    중복 정리
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {scheduledNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-center justify-between rounded border p-2 text-sm"
                    >
                      <div>
                        <div className="font-medium">출발 알림</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatNotificationTime(
                            new Date(notification.scheduledTime),
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={() =>
                          handleCancelNotification(notification.id)
                        }
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 도움말 */}
          <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
            💡 <strong>사용 팁:</strong><br/>
            • 출발 시간을 설정하고 "출발 알림 예약" 버튼을 클릭하세요<br/>
            • 설정한 시간 전에 알림이 자동으로 전송됩니다<br/>
            • 브라우저가 열려있을 때만 알림이 작동합니다
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default NotificationSettings
