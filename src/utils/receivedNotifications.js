// 받은 알림 관리 유틸리티

const STORAGE_KEY = 'weather_flick_received_notifications'
const MAX_NOTIFICATIONS = 100 // 최대 저장할 알림 개수

/**
 * 받은 알림 데이터 구조:
 * {
 *   id: string,
 *   title: string,
 *   body: string,
 *   data?: object,
 *   timestamp: string (ISO),
 *   isRead: boolean,
 *   type: 'fcm' | 'system' | 'scheduled'
 * }
 */

// 받은 알림 목록 조회
export const getReceivedNotifications = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    
    const notifications = JSON.parse(stored)
    
    // 최신순으로 정렬
    return notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  } catch (error) {
    console.error('받은 알림 목록 조회 오류:', error)
    return []
  }
}

// 새 알림 저장
export const saveReceivedNotification = (notification) => {
  try {
    const notifications = getReceivedNotifications()
    
    const newNotification = {
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: notification.title || '알림',
      body: notification.body || '',
      data: notification.data || {},
      timestamp: new Date().toISOString(),
      isRead: false,
      type: notification.type || 'fcm',
      ...notification
    }
    
    // 새 알림을 맨 앞에 추가
    notifications.unshift(newNotification)
    
    // 최대 개수 제한
    if (notifications.length > MAX_NOTIFICATIONS) {
      notifications.splice(MAX_NOTIFICATIONS)
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
    
    // 알림 변경 이벤트 발생
    window.dispatchEvent(new CustomEvent('receivedNotificationChange', {
      detail: { type: 'add', notification: newNotification }
    }))
    
    return newNotification
  } catch (error) {
    console.error('알림 저장 오류:', error)
    return null
  }
}

// 알림 읽음 처리
export const markNotificationAsRead = (notificationId) => {
  try {
    const notifications = getReceivedNotifications()
    const index = notifications.findIndex(n => n.id === notificationId)
    
    if (index === -1) return false
    
    notifications[index].isRead = true
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
    
    // 알림 변경 이벤트 발생
    window.dispatchEvent(new CustomEvent('receivedNotificationChange', {
      detail: { type: 'read', notificationId }
    }))
    
    return true
  } catch (error) {
    console.error('알림 읽음 처리 오류:', error)
    return false
  }
}

// 모든 알림 읽음 처리
export const markAllNotificationsAsRead = () => {
  try {
    const notifications = getReceivedNotifications()
    const updatedNotifications = notifications.map(n => ({
      ...n,
      isRead: true
    }))
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotifications))
    
    // 알림 변경 이벤트 발생
    window.dispatchEvent(new CustomEvent('receivedNotificationChange', {
      detail: { type: 'readAll' }
    }))
    
    return true
  } catch (error) {
    console.error('모든 알림 읽음 처리 오류:', error)
    return false
  }
}

// 알림 삭제
export const deleteReceivedNotification = (notificationId) => {
  try {
    const notifications = getReceivedNotifications()
    const filteredNotifications = notifications.filter(n => n.id !== notificationId)
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredNotifications))
    
    // 알림 변경 이벤트 발생
    window.dispatchEvent(new CustomEvent('receivedNotificationChange', {
      detail: { type: 'delete', notificationId }
    }))
    
    return true
  } catch (error) {
    console.error('알림 삭제 오류:', error)
    return false
  }
}

// 모든 알림 삭제
export const clearAllReceivedNotifications = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
    
    // 알림 변경 이벤트 발생
    window.dispatchEvent(new CustomEvent('receivedNotificationChange', {
      detail: { type: 'clear' }
    }))
    
    return true
  } catch (error) {
    console.error('모든 알림 삭제 오류:', error)
    return false
  }
}

// 읽지 않은 알림 개수 조회
export const getUnreadNotificationCount = () => {
  try {
    const notifications = getReceivedNotifications()
    return notifications.filter(n => !n.isRead).length
  } catch (error) {
    console.error('읽지 않은 알림 개수 조회 오류:', error)
    return 0
  }
}

// 알림 변경 이벤트 리스너 등록
export const addReceivedNotificationChangeListener = (callback) => {
  const handleChange = (event) => {
    callback(event.detail)
  }
  
  window.addEventListener('receivedNotificationChange', handleChange)
  
  // 정리 함수 반환
  return () => {
    window.removeEventListener('receivedNotificationChange', handleChange)
  }
}

// 오래된 알림 정리 (30일 이상)
export const cleanupOldNotifications = () => {
  try {
    const notifications = getReceivedNotifications()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const filteredNotifications = notifications.filter(n => {
      const notificationDate = new Date(n.timestamp)
      return notificationDate > thirtyDaysAgo
    })
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredNotifications))
    
    return notifications.length - filteredNotifications.length // 삭제된 개수 반환
  } catch (error) {
    console.error('오래된 알림 정리 오류:', error)
    return 0
  }
}

// FCM 메시지에서 알림 데이터 추출
export const extractNotificationFromFCM = (payload) => {
  const { notification, data } = payload
  
  return {
    title: notification?.title || data?.title || '알림',
    body: notification?.body || data?.body || '',
    data: data || {},
    type: 'fcm'
  }
}