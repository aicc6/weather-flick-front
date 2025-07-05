import { createContext, useContext, useCallback } from 'react'
import {
  useGetMeQuery,
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useUpdateProfileMutation,
} from '@/store/api'
import { STORAGE_KEYS } from '@/constants/storage'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  // RTK Query hooks
  const {
    data: user,
    isLoading,
    error: getUserError,
    refetch,
  } = useGetMeQuery(undefined, {
    skip: !localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN), // 토큰이 없으면 쿼리 실행 안함
  })

  const [loginMutation, { isLoading: loginLoading, error: loginError }] =
    useLoginMutation()
  const [logoutMutation] = useLogoutMutation()
  const [
    registerMutation,
    { isLoading: registerLoading, error: registerError },
  ] = useRegisterMutation()
  const [
    updateProfileMutation,
    { isLoading: updateLoading, error: updateError },
  ] = useUpdateProfileMutation()

  // 토큰 관리 헬퍼 함수들
  const tokenManager = {
    setToken: (token, userInfo) => {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token)
      if (userInfo) {
        localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo))
      }
    },
    getToken: () => localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
    getUserInfo: () => {
      const userInfo = localStorage.getItem(STORAGE_KEYS.USER_INFO)
      return userInfo ? JSON.parse(userInfo) : null
    },
    setUserInfo: (userInfo) => {
      if (userInfo) {
        localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo))
      } else {
        localStorage.removeItem(STORAGE_KEYS.USER_INFO)
      }
    },
    clearTokens: () => {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.USER_INFO)
    },
    isLoggedIn: () => !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
  }

  // 로그인 함수
  const login = useCallback(
    async (credentials) => {
      try {
        const response = await loginMutation(credentials).unwrap()
        const { user_info, access_token } = response

        // 토큰과 사용자 정보 저장
        tokenManager.setToken(access_token, user_info)

        // RTK Query 캐시 갱신을 위해 쿼리 재실행
        refetch()

        return response
      } catch (error) {
        throw error
      }
    },
    [loginMutation, refetch],
  )

  // 로그아웃 함수
  const logout = useCallback(async () => {
    try {
      // 서버에 로그아웃 요청 (토큰이 있는 경우에만)
      if (tokenManager.isLoggedIn()) {
        try {
          await logoutMutation().unwrap()
        } catch {
          // 서버 요청 실패해도 클라이언트 로그아웃은 진행
        }
      }
    } finally {
      // 클라이언트 상태 정리
      tokenManager.clearTokens()

      // RTK Query 캐시도 정리 (옵션)
      // 페이지 리로드로 캐시 자동 정리됨
    }
  }, [logoutMutation])

  // 회원가입 함수
  const register = useCallback(
    async (userData) => {
      try {
        const response = await registerMutation(userData).unwrap()
        return response
      } catch (error) {
        throw error
      }
    },
    [registerMutation],
  )

  // 사용자 정보 업데이트 함수
  const updateUserProfile = useCallback(
    async (userData) => {
      try {
        const updatedUser = await updateProfileMutation(userData).unwrap()

        // localStorage에도 업데이트된 정보 저장
        tokenManager.setUserInfo(updatedUser)

        return updatedUser
      } catch (error) {
        throw error
      }
    },
    [updateProfileMutation],
  )

  // Google OAuth 로그인 성공 후 처리 함수
  const handleGoogleAuthSuccess = useCallback(
    (userInfo, accessToken) => {
      // 토큰과 사용자 정보 저장
      tokenManager.setToken(accessToken, userInfo)

      // RTK Query 캐시 갱신
      refetch()
    },
    [refetch],
  )

  // 에러 정리 함수
  const clearError = useCallback(() => {
    // RTK Query에서는 에러가 자동으로 관리되므로 별도 처리 불필요
  }, [])

  // 사용자 정보 직접 설정 함수 (OAuth 콜백 등에서 사용)
  const setUser = useCallback(
    (userData) => {
      if (userData) {
        tokenManager.setUserInfo(userData)
        refetch() // 캐시 갱신
      }
    },
    [refetch],
  )

  // 인증 상태 직접 설정 함수 (OAuth 콜백 등에서 사용)
  const setIsAuthenticated = useCallback(() => {
    // RTK Query에서는 토큰 존재 여부로 자동 판단
    refetch()
  }, [refetch])

  // 현재 인증 상태 계산
  const isAuthenticated = !!user && tokenManager.isLoggedIn()
  const loading = isLoading || loginLoading || registerLoading || updateLoading

  // 에러 통합 관리
  const error = getUserError || loginError || registerError || updateError

  const value = {
    // 상태
    user,
    isAuthenticated,
    loading,
    error,

    // 액션 함수들
    login,
    logout,
    register,
    updateUserProfile,
    clearError,

    // OAuth 관련 함수들
    setUser,
    setIsAuthenticated,
    handleGoogleAuthSuccess,

    // 편의 함수들 (기존 호환성 유지)
    isLoggedIn: isAuthenticated,
    updateProfile: updateUserProfile,
    updateUser: updateUserProfile,

    // 토큰 관리 (기존 호환성)
    tokenManager,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
