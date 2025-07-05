import { createContext, useContext, useCallback, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import {
  useGetMeQuery,
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useUpdateProfileMutation,
  authApi,
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
  const dispatch = useDispatch()
  
  // 토큰 상태를 React state로 관리
  const [hasToken, setHasToken] = useState(
    !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  )

  // RTK Query hooks
  const {
    data: user,
    isLoading,
    error: getUserError,
    refetch,
  } = useGetMeQuery(undefined, {
    skip: !hasToken, // React state 기반으로 skip 결정
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

  // 토큰 관리 헬퍼 함수들 (useMemo로 최적화)
  const tokenManager = useMemo(
    () => ({
      setToken: (token, userInfo) => {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token)
        setHasToken(true) // React state 업데이트
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
        setHasToken(false) // React state 업데이트
      },
      isLoggedIn: () => !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
    }),
    [setHasToken],
  )

  // 로그인 함수
  const login = useCallback(
    async (credentials) => {
      const response = await loginMutation(credentials).unwrap()
      const { user_info, access_token } = response

      // 토큰과 사용자 정보 저장
      tokenManager.setToken(access_token, user_info)

      // RTK Query 캐시 갱신을 위해 쿼리 재실행
      refetch()

      return response
    },
    [loginMutation, refetch, tokenManager],
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
      
      // RTK Query 캐시 리셋 - 사용자 정보 완전 제거
      dispatch(authApi.util.resetApiState())
    }
  }, [logoutMutation, tokenManager, dispatch])

  // 회원가입 함수
  const register = useCallback(
    async (userData) => {
      const response = await registerMutation(userData).unwrap()
      return response
    },
    [registerMutation],
  )

  // 사용자 정보 업데이트 함수
  const updateUserProfile = useCallback(
    async (userData) => {
      const updatedUser = await updateProfileMutation(userData).unwrap()

      // localStorage에도 업데이트된 정보 저장
      tokenManager.setUserInfo(updatedUser)

      return updatedUser
    },
    [updateProfileMutation, tokenManager],
  )

  // Google OAuth 로그인 성공 후 처리 함수
  const handleGoogleAuthSuccess = useCallback(
    (userInfo, accessToken) => {
      // 토큰과 사용자 정보 저장
      tokenManager.setToken(accessToken, userInfo)

      // RTK Query 캐시 갱신
      refetch()
    },
    [refetch, tokenManager],
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
    [refetch, tokenManager],
  )

  // 인증 상태 직접 설정 함수 (OAuth 콜백 등에서 사용)
  const setIsAuthenticated = useCallback(() => {
    // RTK Query에서는 토큰 존재 여부로 자동 판단
    refetch()
  }, [refetch])

  // 현재 인증 상태 계산
  const isAuthenticated = !!user && hasToken
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
