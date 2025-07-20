import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useState,
} from 'react'
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
    !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
  )

  // RTK Query hooks
  const {
    data: user,
    isLoading,
    error: getUserError,
    refetch: _refetch,
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
      setToken: (token, userInfo, refreshToken) => {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token)
        setHasToken(true) // React state 업데이트
        if (refreshToken) {
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
        }
        if (userInfo) {
          localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo))
        }
      },
      getToken: () => localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
      getRefreshToken: () => localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
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
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
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
      try {
        // FCM 토큰 생성 시도 (실패해도 로그인 진행)
        let fcmToken = null
        try {
          const { getFCMToken } = await import('@/lib/firebase')
          // 알림 권한이 이미 허용된 경우에만 토큰 생성
          if (Notification.permission === 'granted') {
            // 서비스 워커가 등록될 때까지 대기
            const maxRetries = 3
            for (let i = 0; i < maxRetries; i++) {
              fcmToken = await getFCMToken()
              if (fcmToken) {
                console.log(
                  `로그인 시 FCM 토큰 생성 성공 (시도 ${i + 1}/${maxRetries})`,
                )
                break
              }
              // 잠시 대기 후 재시도
              if (i < maxRetries - 1) {
                await new Promise((resolve) => setTimeout(resolve, 1000))
              }
            }

            if (!fcmToken) {
              console.warn('FCM 토큰 생성 실패 (모든 재시도 실패)')
            }
          } else {
            console.log('알림 권한 없음, FCM 토큰 생성 건너뜀')
          }
        } catch (fcmError) {
          console.warn('FCM 토큰 생성 실패 (로그인은 계속 진행):', fcmError)
        }

        // 로그인 요청에 FCM 토큰 포함
        const loginData = {
          ...credentials,
          ...(fcmToken && {
            fcm_token: fcmToken,
            device_type: 'web',
            device_name: 'Web Browser',
          }),
        }

        const response = await loginMutation(loginData).unwrap()
        const { user_info, access_token, refresh_token } = response

        // 토큰과 사용자 정보 저장
        tokenManager.setToken(access_token, user_info, refresh_token)

        // FCM 토큰을 로컬 스토리지에도 저장
        if (fcmToken) {
          localStorage.setItem('fcm_token', fcmToken)

          // FCM 토큰이 있으면 백엔드에 별도로 등록
          try {
            const { saveFCMToken } = await import(
              '@/services/notificationService'
            )
            await saveFCMToken(fcmToken)
            console.log('FCM 토큰 백엔드 등록 성공')
          } catch (error) {
            console.warn('FCM 토큰 백엔드 등록 실패:', error)
          }
        }

        return response
      } catch (error) {
        console.error('로그인 실패:', error)
        throw error
      }
    },
    [loginMutation, tokenManager],
  )

  // 로그아웃 함수
  const logout = useCallback(async () => {
    try {
      // FCM 토큰 정리 (로그아웃 전에 수행)
      try {
        const { cleanupFCMToken } = await import(
          '@/services/notificationService'
        )
        await cleanupFCMToken()
      } catch (fcmError) {
        console.warn('FCM 토큰 정리 실패 (로그아웃은 계속 진행):', fcmError)
      }

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

      // FCM 토큰도 로컬 스토리지에서 제거
      localStorage.removeItem('fcm_token')

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
    (userInfo, accessToken, refreshToken) => {
      // 토큰과 사용자 정보 저장
      tokenManager.setToken(accessToken, userInfo, refreshToken)
    },
    [tokenManager],
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
      }
    },
    [tokenManager],
  )

  // 인증 상태 직접 설정 함수 (OAuth 콜백 등에서 사용)
  const setIsAuthenticated = useCallback(() => {
    // RTK Query에서는 토큰 존재 여부로 자동 판단
  }, [])

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
