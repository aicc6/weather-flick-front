// 알림 권한 요청 보호 장치
import { isAuthenticated } from '@/utils/authCheck'

// 원본 Notification.requestPermission 저장
const originalRequestPermission = window.Notification?.requestPermission

// Notification.requestPermission을 오버라이드하여 로그인 상태 확인
if (window.Notification && originalRequestPermission) {
  window.Notification.requestPermission = async function (...args) {
    // 로그인하지 않은 상태에서는 권한 요청을 차단
    if (!isAuthenticated()) {
      console.warn('로그인하지 않은 상태에서는 알림 권한을 요청할 수 없습니다.')
      return 'default'
    }

    // 로그인한 상태에서만 원본 함수 호출
    return originalRequestPermission.apply(this, args)
  }
}

export { originalRequestPermission }
