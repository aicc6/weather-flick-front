import { getFCMToken } from '@/lib/firebase'
import { http } from '@/lib/http'

// FCM 토큰을 백엔드에 저장
export const saveFCMToken = async (token) => {
  try {
    const response = await http.post('/api/notifications/fcm-token', {
      token,
      device_type: 'web',
      device_info: navigator.userAgent,
    })
    return response.data
  } catch (error) {
    console.error('FCM 토큰 저장 오류:', error)
    throw error
  }
}

// FCM 토큰 삭제 (로그아웃 시)
export const deleteFCMToken = async (token) => {
  try {
    const response = await http.delete('/api/notifications/fcm-token', {
      data: { token },
    })
    return response.data
  } catch (error) {
    console.error('FCM 토큰 삭제 오류:', error)
    throw error
  }
}

// 알림 설정 조회
export const getNotificationSettings = async () => {
  try {
    const response = await http.get('/api/notifications/settings')
    return response.data
  } catch (error) {
    console.error('알림 설정 조회 오류:', error)
    throw error
  }
}

// 알림 설정 업데이트
export const updateNotificationSettings = async (settings) => {
  try {
    const response = await http.put('/api/notifications/settings', settings)
    return response.data
  } catch (error) {
    console.error('알림 설정 업데이트 오류:', error)
    throw error
  }
}

// 알림 히스토리 조회
export const getNotificationHistory = async (params = {}) => {
  try {
    const response = await http.get('/api/notifications/history', { params })
    return response.data
  } catch (error) {
    console.error('알림 히스토리 조회 오류:', error)
    throw error
  }
}

// 알림 읽음 처리
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await http.put(`/api/notifications/${notificationId}/read`)
    return response.data
  } catch (error) {
    console.error('알림 읽음 처리 오류:', error)
    throw error
  }
}

// 전체 알림 읽음 처리
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await http.put('/api/notifications/read-all')
    return response.data
  } catch (error) {
    console.error('전체 알림 읽음 처리 오류:', error)
    throw error
  }
}

// FCM 토큰 초기화 및 저장
export const initializeFCMToken = async () => {
  try {
    const permission = await Notification.requestPermission()

    if (permission === 'granted') {
      const token = await getFCMToken()

      if (token) {
        await saveFCMToken(token)
        localStorage.setItem('fcm_token', token)
        return token
      }
    }

    return null
  } catch (error) {
    console.error('FCM 토큰 초기화 오류:', error)
    return null
  }
}

// FCM 토큰 정리 (로그아웃 시)
export const cleanupFCMToken = async () => {
  try {
    const token = localStorage.getItem('fcm_token')

    if (token) {
      await deleteFCMToken(token)
      localStorage.removeItem('fcm_token')
    }
  } catch (error) {
    console.error('FCM 토큰 정리 오류:', error)
  }
}
