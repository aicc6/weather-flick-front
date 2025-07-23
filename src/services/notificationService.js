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
    const data = await response.json()
    return data
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
    // 브라우저 정보
    const isFirefox = navigator.userAgent.toLowerCase().includes('firefox')
    const isSafari = navigator.userAgent.toLowerCase().includes('safari') && !navigator.userAgent.toLowerCase().includes('chrome')
    
    console.log('FCM 토큰 초기화 시작...', {
      browser: isFirefox ? 'Firefox' : isSafari ? 'Safari' : 'Other',
      currentPermission: Notification.permission
    })

    // 이미 권한이 있는 경우 바로 토큰 요청
    let permission = Notification.permission
    
    // 권한이 없는 경우만 요청
    if (permission === 'default') {
      permission = await Notification.requestPermission()
      console.log('알림 권한 요청 결과:', permission)
    }

    if (permission === 'granted') {
      // Firefox/Safari의 경우 약간의 지연 추가
      if (isFirefox || isSafari) {
        console.log(`${isFirefox ? 'Firefox' : 'Safari'} 감지 - 토큰 요청 전 대기 중...`)
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      // 여러 번 시도
      let token = null
      const maxAttempts = isFirefox ? 5 : 3
      
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          console.log(`FCM 토큰 요청 시도 ${attempt}/${maxAttempts}...`)
          token = await getFCMToken()
          
          if (token) {
            console.log(`FCM 토큰 획득 성공 (시도 ${attempt})`)
            break
          }
          
          // 실패 시 재시도 전 대기
          if (attempt < maxAttempts) {
            const delay = isFirefox ? 2000 : 1000
            console.log(`토큰 획득 실패. ${delay}ms 후 재시도...`)
            await new Promise(resolve => setTimeout(resolve, delay))
          }
        } catch (tokenError) {
          console.error(`토큰 요청 시도 ${attempt} 실패:`, tokenError)
          if (attempt < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 2000))
          }
        }
      }

      if (token) {
        try {
          await saveFCMToken(token)
          localStorage.setItem('fcm_token', token)
          console.log('FCM 토큰 저장 완료')
          return token
        } catch (saveError) {
          console.error('FCM 토큰 저장 실패:', saveError)
          // 저장 실패해도 토큰은 반환
          return token
        }
      } else {
        console.error('FCM 토큰 획득 실패 - 모든 시도 소진')
      }
    } else {
      console.log('알림 권한이 거부되었습니다:', permission)
    }

    return null
  } catch (error) {
    console.error('FCM 토큰 초기화 오류:', error)
    console.error('오류 상세:', {
      message: error.message,
      stack: error.stack
    })
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
