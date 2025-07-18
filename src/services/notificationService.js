import { getFCMToken } from '@/lib/firebase'
import { authHttp } from '@/lib/http'

// FCM 토큰을 백엔드에 저장
export const saveFCMToken = async (token) => {
  try {
    const response = await authHttp.POST('/notifications/device-tokens', {
      body: {
        device_token: token,
        device_type: 'web',
        device_name: 'Web Browser',
        app_version: '1.0.0',
        os_version: navigator.userAgent,
        user_agent: navigator.userAgent,
      },
    })
    return response.data
  } catch (error) {
    console.error('FCM 토큰 저장 오류:', error)
    throw error
  }
}

// FCM 토큰 삭제 (로그아웃 시)
export const deleteFCMToken = async (tokenId) => {
  try {
    const response = await authHttp.DELETE(
      `/notifications/device-tokens/${tokenId}`,
    )
    return response.data
  } catch (error) {
    console.error('FCM 토큰 삭제 오류:', error)
    throw error
  }
}

// 사용자의 디바이스 토큰 목록 조회
export const getUserDeviceTokens = async () => {
  try {
    const response = await authHttp.GET('/notifications/device-tokens')
    return response.data
  } catch (error) {
    console.error('디바이스 토큰 목록 조회 오류:', error)
    throw error
  }
}

// 알림 설정 조회
export const getNotificationSettings = async () => {
  try {
    const response = await authHttp.GET('/notifications/settings')
    const data = await response.json()
    return data
  } catch (error) {
    console.error('알림 설정 조회 오류:', error)
    throw error
  }
}

// 알림 설정 업데이트
export const updateNotificationSettings = async (settings) => {
  try {
    const response = await authHttp.PUT('/notifications/settings', {
      body: settings,
    })
    const data = await response.json()
    return data
  } catch (error) {
    console.error('알림 설정 업데이트 오류:', error)
    throw error
  }
}

// 알림 히스토리 조회
export const getNotificationHistory = async (params = {}) => {
  try {
    const response = await authHttp.GET('/notifications/history', {
      params,
    })
    const data = await response.json()
    return data
  } catch (error) {
    console.error('알림 히스토리 조회 오류:', error)
    throw error
  }
}

// 알림 읽음 처리
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await authHttp.PUT(`/notifications/${notificationId}/read`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('알림 읽음 처리 오류:', error)
    throw error
  }
}

// 전체 알림 읽음 처리
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await authHttp.PUT('/notifications/read-all')
    const data = await response.json()
    return data
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
      // 사용자의 디바이스 토큰 목록을 조회하여 해당 토큰의 ID를 찾아서 삭제
      const deviceTokens = await getUserDeviceTokens()
      const targetToken = deviceTokens.find((dt) => dt.device_token === token)

      if (targetToken) {
        await deleteFCMToken(targetToken.id)
      }

      localStorage.removeItem('fcm_token')
    }
  } catch (error) {
    console.error('FCM 토큰 정리 오류:', error)
  }
}
