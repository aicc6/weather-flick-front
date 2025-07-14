/**
 * 브라우저 알림 관련 유틸리티 함수들
 * 외부 API 없이 브라우저 기본 기능만 사용
 */

/**
 * 브라우저 알림 지원 여부 확인
 */
export const isNotificationSupported = () => {
  return 'Notification' in window
}

/**
 * 알림 권한 상태 확인
 */
export const getNotificationPermission = () => {
  if (!isNotificationSupported()) {
    return 'unsupported'
  }
  return Notification.permission
}

/**
 * 알림 권한 요청
 */
export const requestNotificationPermission = async () => {
  if (!isNotificationSupported()) {
    return 'unsupported'
  }

  try {
    const permission = await Notification.requestPermission()
    return permission
  } catch (error) {
    console.error('알림 권한 요청 실패:', error)
    return 'denied'
  }
}

/**
 * 브라우저 알림 표시
 */
export const showNotification = (title, options = {}) => {
  const permission = getNotificationPermission()
  
  if (permission !== 'granted') {
    console.warn('알림 권한이 없습니다:', permission)
    return null
  }

  const defaultOptions = {
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    requireInteraction: false,
    silent: false,
    ...options,
  }

  try {
    const notification = new Notification(title, defaultOptions)

    // 알림 클릭 이벤트
    notification.onclick = () => {
      window.focus()
      notification.close()

      // 콜백 함수가 있으면 실행
      if (options.onClick) {
        options.onClick()
      }
    }

    // 자동 닫기 (기본 5초)
    if (options.autoClose !== false) {
      setTimeout(() => {
        notification.close()
      }, options.autoCloseDelay || 5000)
    }

    return notification
  } catch (error) {
    console.error('알림 표시 실패:', error)
    return null
  }
}

/**
 * 여행 알림 타입별 아이콘 및 설정
 */
export const getNotificationConfig = (type) => {
  const configs = {
    departure: {
      icon: '🚗',
      title: '출발 시간 알림',
      defaultBody: '곧 출발할 시간입니다!',
      requireInteraction: true,
      tag: 'departure-reminder',
    },
    traffic: {
      icon: '🚦',
      title: '교통 상황 변화',
      defaultBody: '경로의 교통 상황이 변경되었습니다',
      requireInteraction: false,
      tag: 'traffic-update',
    },
    weather: {
      icon: '🌧️',
      title: '날씨 변화 알림',
      defaultBody: '날씨가 변했습니다. 준비물을 확인하세요',
      requireInteraction: false,
      tag: 'weather-alert',
    },
    arrival: {
      icon: '🏁',
      title: '도착 예정 알림',
      defaultBody: '목적지 근처에 도착했습니다',
      requireInteraction: false,
      tag: 'arrival-reminder',
    },
  }

  return configs[type] || configs.departure
}

/**
 * 여행 출발 알림 생성
 */
export const createDepartureNotification = (routeInfo, minutesBefore = 30) => {
  const config = getNotificationConfig('departure')

  const title = `${config.icon} ${config.title}`
  const body = `${routeInfo.departure_name || '출발지'}에서 ${routeInfo.destination_name || '도착지'}로 ${minutesBefore}분 후 출발 예정입니다`

  return showNotification(title, {
    body,
    icon: config.icon,
    tag: `departure-${routeInfo.route_id || Date.now()}`,
    requireInteraction: config.requireInteraction,
    data: {
      type: 'departure',
      routeId: routeInfo.route_id,
      planId: routeInfo.plan_id,
    },
    onClick: () => {
      // 여행 계획 페이지로 이동
      if (routeInfo.plan_id) {
        window.location.href = `/travel-plans/${routeInfo.plan_id}`
      }
    },
  })
}

/**
 * 스케줄된 알림 관리를 위한 타이머 ID 저장소
 */
const scheduledNotifications = new Map()

/**
 * 지연된 알림 스케줄링
 */
export const scheduleNotification = (notificationData, delayMs, uniqueId) => {
  // 기존 알림이 있으면 취소
  if (scheduledNotifications.has(uniqueId)) {
    clearTimeout(scheduledNotifications.get(uniqueId))
  }

  const timerId = setTimeout(() => {
    const { title, options } = notificationData
    showNotification(title, options)
    scheduledNotifications.delete(uniqueId)
  }, delayMs)

  scheduledNotifications.set(uniqueId, timerId)

  return {
    id: uniqueId,
    scheduledTime: new Date(Date.now() + delayMs),
    cancel: () => cancelScheduledNotification(uniqueId),
  }
}

/**
 * 스케줄된 알림 취소
 */
export const cancelScheduledNotification = (uniqueId) => {
  if (scheduledNotifications.has(uniqueId)) {
    clearTimeout(scheduledNotifications.get(uniqueId))
    scheduledNotifications.delete(uniqueId)
    return true
  }
  return false
}

/**
 * 모든 스케줄된 알림 취소
 */
export const cancelAllScheduledNotifications = () => {
  scheduledNotifications.forEach((timerId) => {
    clearTimeout(timerId)
  })
  scheduledNotifications.clear()
}

/**
 * 활성 알림 목록 조회
 */
export const getActiveNotifications = () => {
  const activeNotifications = []

  scheduledNotifications.forEach((timerId, uniqueId) => {
    activeNotifications.push({
      id: uniqueId,
      status: 'scheduled',
    })
  })

  return activeNotifications
}

/**
 * 출발 시간으로부터 알림 시간 계산
 */
export const calculateNotificationTime = (departureTime, minutesBefore) => {
  const departure = new Date(departureTime)
  const notification = new Date(departure.getTime() - minutesBefore * 60 * 1000)
  const now = new Date()

  // 출발 시간이 이미 지났는지 확인
  const isDepartureInPast = departure.getTime() <= now.getTime()
  
  // 알림 시간이 이미 지났는지 확인
  const isNotificationInPast = notification.getTime() <= now.getTime()
  
  // 최종 알림 시간 결정
  let finalNotificationTime = notification
  
  if (isDepartureInPast) {
    // 출발 시간이 과거면 알림 불가
    return {
      notificationTime: null,
      delayMs: 0,
      isInPast: true,
      isImmediateNotification: false
    }
  }
  
  if (isNotificationInPast) {
    // 알림 시간이 과거이지만 출발 시간이 미래라면 즉시 알림
    finalNotificationTime = new Date(now.getTime() + 2000) // 2초 후
  }

  return {
    notificationTime: finalNotificationTime,
    delayMs: Math.max(0, finalNotificationTime.getTime() - now.getTime()),
    isInPast: false,
    isImmediateNotification: isNotificationInPast
  }
}

/**
 * 시간 형식화 (알림 표시용)
 */
export const formatNotificationTime = (date) => {
  return date.toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * 알림 설정 유효성 검사
 */
export const validateNotificationSettings = (settings) => {
  const errors = []

  if (settings.minutesBefore < 0 || settings.minutesBefore > 1440) {
    errors.push('알림 시간은 0분~24시간 사이여야 합니다')
  }

  if (settings.departureTime && new Date(settings.departureTime) < new Date()) {
    errors.push('출발 시간이 과거입니다')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * 테스트 알림 표시 (설정 테스트용)
 */
export const showTestNotification = () => {
  // 권한 상태 확인
  const permission = getNotificationPermission()
  
  // 브라우저 지원 여부 확인
  const supported = isNotificationSupported()
  
  if (!supported) {
    console.error('브라우저가 알림을 지원하지 않습니다')
    return null
  }
  
  if (permission !== 'granted') {
    console.error('알림 권한이 허용되지 않았습니다:', permission)
    return null
  }
  
  const result = showNotification('🧪 테스트 알림', {
    body: '알림이 정상적으로 작동합니다!',
    tag: 'test-notification',
    autoClose: true,
    autoCloseDelay: 3000,
  })
  
  console.log('테스트 알림 전송:', result ? '성공' : '실패')
  return result
}
