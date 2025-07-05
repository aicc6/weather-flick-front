import { useGetMeQuery } from '@/store/api'
import { STORAGE_KEYS } from '@/constants/storage'

/**
 * RTK Query 기반 인증 훅
 * 기존 AuthContext를 대체하여 사용할 수 있습니다.
 */
export const useRTKAuth = () => {
  // 토큰이 있을 때만 사용자 정보 조회
  const hasToken = !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)

  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useGetMeQuery(undefined, {
    skip: !hasToken, // 토큰이 없으면 쿼리 실행하지 않음
  })

  // 토큰 저장 함수
  const setToken = (token, userInfo) => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token)
    if (userInfo) {
      localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo))
    }
    // 사용자 정보 다시 가져오기
    refetch()
  }

  // 토큰 제거 함수
  const clearToken = () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER_INFO)
  }

  // 로그인 상태 확인
  const isLoggedIn = hasToken && !!user && !error

  return {
    user,
    isLoading,
    error,
    isLoggedIn,
    setToken,
    clearToken,
    refetch,
  }
}
