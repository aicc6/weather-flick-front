/**
 * 알림 설정 로컬 스토리지 관리
 * 사용자의 알림 설정을 브라우저에 안전하게 저장
 */

const STORAGE_KEYS = {
  NOTIFICATION_SETTINGS: 'travel_notification_settings',
  SCHEDULED_NOTIFICATIONS: 'scheduled_notifications',
  NOTIFICATION_PERMISSION: 'notification_permission_status',
}

/**
 * 기본 알림 설정
 */
const DEFAULT_SETTINGS = {
  enabled: false,
  departureReminder: true,
  minutesBefore: 30,
  trafficUpdates: false,
  weatherAlerts: false,
  sound: true,
  vibrate: true,
  autoClose: true,
  autoCloseDelay: 5000,
}

/**
 * 로컬 스토리지에 안전하게 데이터 저장
 */
const safeSetItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.warn('로컬 스토리지 저장 실패:', error)
    return false
  }
}

/**
 * 로컬 스토리지에서 안전하게 데이터 조회
 */
const safeGetItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.warn('로컬 스토리지 조회 실패:', error)
    return defaultValue
  }
}

/**
 * 사용자 알림 설정 저장
 */
export const saveNotificationSettings = (settings) => {
  const mergedSettings = {
    ...DEFAULT_SETTINGS,
    ...settings,
    lastUpdated: new Date().toISOString(),
  }

  return safeSetItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, mergedSettings)
}

/**
 * 사용자 알림 설정 조회
 */
export const getNotificationSettings = () => {
  const settings = safeGetItem(
    STORAGE_KEYS.NOTIFICATION_SETTINGS,
    DEFAULT_SETTINGS,
  )

  // 기본값과 병합하여 누락된 설정 보완
  return {
    ...DEFAULT_SETTINGS,
    ...settings,
  }
}

/**
 * 특정 여행 계획의 알림 설정 저장
 */
export const savePlanNotificationSettings = (planId, settings) => {
  const allSettings = safeGetItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, {})

  if (!allSettings.plans) {
    allSettings.plans = {}
  }

  allSettings.plans[planId] = {
    ...settings,
    lastUpdated: new Date().toISOString(),
  }

  return safeSetItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, allSettings)
}

/**
 * 특정 여행 계획의 알림 설정 조회
 */
export const getPlanNotificationSettings = (planId) => {
  const allSettings = safeGetItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, {})
  const globalSettings = getNotificationSettings()

  if (allSettings.plans && allSettings.plans[planId]) {
    return {
      ...globalSettings,
      ...allSettings.plans[planId],
    }
  }

  return globalSettings
}

/**
 * 경로별 알림 설정 저장
 */
export const saveRouteNotificationSettings = (routeId, settings) => {
  const allSettings = safeGetItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, {})

  if (!allSettings.routes) {
    allSettings.routes = {}
  }

  allSettings.routes[routeId] = {
    ...settings,
    lastUpdated: new Date().toISOString(),
  }

  return safeSetItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, allSettings)
}

/**
 * 경로별 알림 설정 조회
 */
export const getRouteNotificationSettings = (routeId, planId = null) => {
  const allSettings = safeGetItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, {})
  const planSettings = planId
    ? getPlanNotificationSettings(planId)
    : getNotificationSettings()

  if (allSettings.routes && allSettings.routes[routeId]) {
    return {
      ...planSettings,
      ...allSettings.routes[routeId],
    }
  }

  return planSettings
}

/**
 * 알림 변경 이벤트 리스너들
 */
const notificationChangeListeners = new Set()

/**
 * 알림 변경 이벤트 리스너 등록
 */
export const addNotificationChangeListener = (listener) => {
  notificationChangeListeners.add(listener)
  return () => notificationChangeListeners.delete(listener)
}

/**
 * 알림 변경 이벤트 발생
 */
const notifyListeners = () => {
  notificationChangeListeners.forEach(listener => {
    try {
      listener()
    } catch (error) {
      // 조용한 실행 - 개발 환경에서만 로그 출력
      if (process.env.NODE_ENV === 'development') {
        console.warn('알림 리스너 실행 오류:', error)
      }
    }
  })
}

/**
 * 스케줄된 알림 정보 저장
 */
export const saveScheduledNotification = (notificationData) => {
  const scheduled = safeGetItem(STORAGE_KEYS.SCHEDULED_NOTIFICATIONS, [])

  const notification = {
    id: notificationData.id || `notification_${Date.now()}`,
    title: notificationData.title,
    body: notificationData.body,
    scheduledTime: notificationData.scheduledTime,
    type: notificationData.type,
    routeId: notificationData.routeId,
    planId: notificationData.planId,
    status: 'scheduled',
    createdAt: new Date().toISOString(),
  }

  // 기존 동일 ID 알림 제거
  const filtered = scheduled.filter((n) => n.id !== notification.id)
  filtered.push(notification)

  safeSetItem(STORAGE_KEYS.SCHEDULED_NOTIFICATIONS, filtered)
  notifyListeners() // 알림 변경 이벤트 발생
  return notification
}

/**
 * 스케줄된 알림 목록 조회
 */
export const getScheduledNotifications = (planId = null) => {
  const scheduled = safeGetItem(STORAGE_KEYS.SCHEDULED_NOTIFICATIONS, [])

  if (planId) {
    return scheduled.filter((n) => n.planId === planId)
  }

  return scheduled
}

/**
 * 스케줄된 알림 상태 업데이트
 */
export const updateScheduledNotificationStatus = (notificationId, status) => {
  const scheduled = safeGetItem(STORAGE_KEYS.SCHEDULED_NOTIFICATIONS, [])
  const updated = scheduled.map((n) =>
    n.id === notificationId
      ? { ...n, status, updatedAt: new Date().toISOString() }
      : n,
  )

  const result = safeSetItem(STORAGE_KEYS.SCHEDULED_NOTIFICATIONS, updated)
  notifyListeners() // 알림 변경 이벤트 발생
  return result
}

/**
 * 스케줄된 알림 삭제
 */
export const removeScheduledNotification = (notificationId) => {
  const scheduled = safeGetItem(STORAGE_KEYS.SCHEDULED_NOTIFICATIONS, [])
  const filtered = scheduled.filter((n) => n.id !== notificationId)

  const result = safeSetItem(STORAGE_KEYS.SCHEDULED_NOTIFICATIONS, filtered)
  notifyListeners() // 알림 변경 이벤트 발생
  return result
}

/**
 * 만료된 알림 정리 (24시간 이전 알림)
 */
export const cleanupExpiredNotifications = () => {
  const scheduled = safeGetItem(STORAGE_KEYS.SCHEDULED_NOTIFICATIONS, [])
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const valid = scheduled.filter((n) => {
    const scheduledTime = new Date(n.scheduledTime)
    return scheduledTime > oneDayAgo || n.status === 'scheduled'
  })

  return safeSetItem(STORAGE_KEYS.SCHEDULED_NOTIFICATIONS, valid)
}

/**
 * 알림 권한 상태 저장
 */
export const saveNotificationPermissionStatus = (permission) => {
  return safeSetItem(STORAGE_KEYS.NOTIFICATION_PERMISSION, {
    status: permission,
    lastChecked: new Date().toISOString(),
  })
}

/**
 * 알림 권한 상태 조회
 */
export const getNotificationPermissionStatus = () => {
  return safeGetItem(STORAGE_KEYS.NOTIFICATION_PERMISSION, {
    status: 'default',
    lastChecked: null,
  })
}

/**
 * 모든 알림 설정 초기화
 */
export const resetAllNotificationSettings = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATION_SETTINGS)
    localStorage.removeItem(STORAGE_KEYS.SCHEDULED_NOTIFICATIONS)
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATION_PERMISSION)
    return true
  } catch (error) {
    console.warn('알림 설정 초기화 실패:', error)
    return false
  }
}

/**
 * 알림 설정 내보내기 (JSON)
 */
export const exportNotificationSettings = () => {
  const settings = getNotificationSettings()
  const scheduled = getScheduledNotifications()
  const permission = getNotificationPermissionStatus()

  return {
    settings,
    scheduled,
    permission,
    exportedAt: new Date().toISOString(),
    version: '1.0',
  }
}

/**
 * 알림 설정 가져오기 (JSON)
 */
export const importNotificationSettings = (data) => {
  try {
    if (data.settings) {
      saveNotificationSettings(data.settings)
    }

    if (data.scheduled && Array.isArray(data.scheduled)) {
      safeSetItem(STORAGE_KEYS.SCHEDULED_NOTIFICATIONS, data.scheduled)
    }

    if (data.permission) {
      saveNotificationPermissionStatus(data.permission.status)
    }

    return { success: true }
  } catch (error) {
    console.error('알림 설정 가져오기 실패:', error)
    return { success: false, error: error.message }
  }
}

/**
 * 스토리지 사용량 확인
 */
export const getStorageUsage = () => {
  try {
    const settings = localStorage.getItem(STORAGE_KEYS.NOTIFICATION_SETTINGS)
    const scheduled = localStorage.getItem(STORAGE_KEYS.SCHEDULED_NOTIFICATIONS)
    const permission = localStorage.getItem(
      STORAGE_KEYS.NOTIFICATION_PERMISSION,
    )

    const sizes = {
      settings: settings ? settings.length : 0,
      scheduled: scheduled ? scheduled.length : 0,
      permission: permission ? permission.length : 0,
    }

    sizes.total = sizes.settings + sizes.scheduled + sizes.permission

    return sizes
  } catch (error) {
    console.warn('스토리지 사용량 확인 실패:', error)
    return { total: 0, settings: 0, scheduled: 0, permission: 0 }
  }
}
