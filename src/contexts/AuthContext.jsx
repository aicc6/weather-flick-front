import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react'
import { authAPI, tokenManager } from '@/services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  // 단순화된 상태 관리
  const [authState, setAuthState] = useState({
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null,
  })

  // 상태 업데이트 헬퍼 함수
  const updateAuthState = useCallback((updates) => {
    setAuthState((prev) => ({ ...prev, ...updates }))
  }, [])

  // 로그아웃 함수 (미리 정의)
  const logout = useCallback(async () => {
    try {
      // 서버에 로그아웃 요청 (토큰이 있는 경우에만)
      if (tokenManager.isLoggedIn()) {
        try {
          await authAPI.logout()
        } catch {
          // 서버 요청 실패해도 클라이언트 로그아웃은 진행
        }
      }
    } finally {
      // 클라이언트 상태 정리
      tokenManager.clearTokens()
      updateAuthState({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      })
    }
  }, [updateAuthState])

  // 초기 로드 시 사용자 정보 확인
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (tokenManager.isLoggedIn()) {
          // 먼저 localStorage에서 사용자 정보 복원
          const storedUserInfo = tokenManager.getUserInfo()
          if (storedUserInfo) {
            updateAuthState({
              user: storedUserInfo,
              isAuthenticated: true,
              loading: false,
            })

            // 백그라운드에서 서버와 동기화
            try {
              const userInfo = await authAPI.getMe()
              updateAuthState({ user: userInfo })
              tokenManager.setUserInfo(userInfo)
            } catch {
              // 저장된 사용자 정보가 유효하므로 에러로 처리하지 않음
            }
          } else {
            // 토큰은 있지만 사용자 정보가 없는 경우 서버에서 가져오기
            const userInfo = await authAPI.getMe()
            updateAuthState({
              user: userInfo,
              isAuthenticated: true,
              loading: false,
            })
            tokenManager.setUserInfo(userInfo)
          }
        } else {
          updateAuthState({
            user: null,
            isAuthenticated: false,
            loading: false,
          })
        }
      } catch {
        // 토큰이 유효하지 않은 경우 로그아웃 처리
        await logout()
      }
    }

    initializeAuth()
  }, [updateAuthState, logout])

  // 로그인 함수
  const login = useCallback(
    async (credentials) => {
      try {
        updateAuthState({ loading: true, error: null })

        const response = await authAPI.login(credentials)
        const { user, access_token } = response

        // 토큰과 사용자 정보 저장
        tokenManager.setToken(access_token)
        tokenManager.setUserInfo(user)

        updateAuthState({
          user,
          isAuthenticated: true,
          loading: false,
          error: null,
        })

        return response
      } catch (error) {
        updateAuthState({
          loading: false,
          error: error.message,
        })
        throw error
      }
    },
    [updateAuthState],
  )

  // 사용자 정보 업데이트 함수
  const updateUserProfile = useCallback(
    async (userData) => {
      try {
        updateAuthState({ loading: true, error: null })

        const updatedUser = await authAPI.updateProfile(userData)

        // 토큰 매니저와 상태 동기화
        tokenManager.setUserInfo(updatedUser)
        updateAuthState({
          user: updatedUser,
          loading: false,
          error: null,
        })

        return updatedUser
      } catch (error) {
        updateAuthState({
          loading: false,
          error: error.message,
        })
        throw error
      }
    },
    [updateAuthState],
  )

  // 회원가입 함수
  const register = useCallback(
    async (userData) => {
      try {
        updateAuthState({ loading: true, error: null })

        const response = await authAPI.register(userData)

        updateAuthState({
          loading: false,
          error: null,
        })

        return response
      } catch (error) {
        updateAuthState({
          loading: false,
          error: error.message,
        })
        throw error
      }
    },
    [updateAuthState],
  )

  // 에러 클리어 함수
  const clearError = useCallback(() => {
    updateAuthState({ error: null })
  }, [updateAuthState])

  // 사용자 정보 직접 설정 함수 (OAuth 콜백 등에서 사용)
  const setUser = useCallback(
    (userData) => {
      updateAuthState({ user: userData })
      if (userData) {
        tokenManager.setUserInfo(userData)
      }
    },
    [updateAuthState],
  )

  // 인증 상태 직접 설정 함수 (OAuth 콜백 등에서 사용)
  const setIsAuthenticated = useCallback(
    (isAuth) => {
      updateAuthState({ isAuthenticated: isAuth })
    },
    [updateAuthState],
  )

  // Google OAuth 로그인 성공 후 처리 함수
  const handleGoogleAuthSuccess = useCallback(
    (userInfo, accessToken) => {
      // 토큰과 사용자 정보 저장
      tokenManager.setToken(accessToken)
      tokenManager.setUserInfo(userInfo)

      updateAuthState({
        user: userInfo,
        isAuthenticated: true,
        loading: false,
        error: null,
      })
    },
    [updateAuthState],
  )

  const value = {
    // 상태
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    loading: authState.loading,
    error: authState.error,

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
    isLoggedIn: authState.isAuthenticated,
    updateProfile: updateUserProfile,
    updateUser: updateUserProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
