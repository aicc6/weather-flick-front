import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
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
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [updateTrigger, setUpdateTrigger] = useState(0)
  const forceUpdateRef = useRef(0)

  // 강제 업데이트 함수
  const forceUpdate = useCallback(() => {
    forceUpdateRef.current += 1
    setUpdateTrigger((prev) => prev + 1)
  }, [])

  // 초기 로드 시 사용자 정보 확인
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (tokenManager.isLoggedIn()) {
          // 먼저 localStorage에서 사용자 정보 복원
          const storedUserInfo = tokenManager.getUserInfo()
          if (storedUserInfo) {
            setUser(storedUserInfo)
            setIsLoggedIn(true)
            forceUpdate()
          }

          // 서버에서 최신 사용자 정보 가져오기
          try {
            const userInfo = await authAPI.getMe()
            setUser(userInfo)
            setIsLoggedIn(true)
            forceUpdate()
          } catch (serverError) {
            // 서버 오류 시 localStorage 정보를 계속 사용
          }
        } else {
          setIsLoggedIn(false)
        }
      } catch (error) {
        console.error('사용자 정보 로드 실패:', error)
        tokenManager.removeToken()
        setIsLoggedIn(false)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [forceUpdate])

  // 로그인
  const login = useCallback(
    async (credentials) => {
      try {
        const response = await authAPI.login(credentials)

        // 토큰 저장
        tokenManager.setToken(response.access_token, response.user_info)

        // 상태 업데이트를 동기적으로 처리
        setUser(response.user_info)
        setIsLoggedIn(true)
        forceUpdate()

        // 상태 업데이트가 완료될 때까지 잠시 대기
        await new Promise((resolve) => setTimeout(resolve, 150))

        // 한 번 더 강제 업데이트
        forceUpdate()

        return response
      } catch (error) {
        console.error('로그인 오류:', error)
        throw error
      }
    },
    [forceUpdate],
  )

  // 로그아웃
  const logout = useCallback(async () => {
    try {
      if (tokenManager.isLoggedIn()) {
        await authAPI.logout()
      }
    } catch (error) {
      console.error('로그아웃 오류:', error)
    } finally {
      tokenManager.removeToken()
      setUser(null)
      setIsLoggedIn(false)
      forceUpdate()
    }
  }, [forceUpdate])

  // 회원가입
  const register = async (userData) => {
    const response = await authAPI.register(userData)
    return response
  }


  // 사용자 정보 업데이트
  const updateProfile = async (userData) => {
    const updatedUser = await authAPI.updateProfile(userData)
    setUser(updatedUser)
    return updatedUser
  }

  // 프로필 업데이트 (updateProfile의 별칭)
  const updateUser = async (userData) => {
    return await updateProfile(userData)
  }

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    updateProfile,
    updateUser,
    setUser,
    setIsAuthenticated: setIsLoggedIn,
    isLoggedIn,
    updateTrigger,
    forceUpdateRef: forceUpdateRef.current,
    forceUpdate,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
