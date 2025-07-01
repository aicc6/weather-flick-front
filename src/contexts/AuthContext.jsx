import { createContext, useContext, useState, useEffect } from 'react'
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

  // 초기 로드 시 사용자 정보 확인
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (tokenManager.isLoggedIn()) {
          const userInfo = await authAPI.getMe()
          setUser(userInfo)
          setIsLoggedIn(true)
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
  }, [])

  // 로그인
  const login = async (credentials) => {
    try {
      console.log('로그인 시도:', credentials)
      const response = await authAPI.login(credentials)
      console.log('로그인 응답:', response)
      console.log('사용자 정보:', response.user_info)
      tokenManager.setToken(response.access_token, response.user_info)
      setUser(response.user_info)
      setIsLoggedIn(true)
      console.log('로그인 성공, 사용자 상태 업데이트됨:', response.user_info)
      return response
    } catch (error) {
      console.error('로그인 오류:', error)
      throw error
    }
  }

  // 로그아웃
  const logout = async () => {
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
    }
  }

  // 회원가입
  const register = async (userData) => {
    const response = await authAPI.register(userData)
    return response
  }

  // 구글 로그인
  const googleLogin = async (accessToken) => {
    try {
      console.log('구글 로그인 시도:', accessToken)
      const response = await authAPI.googleLogin(accessToken)
      console.log('구글 로그인 응답:', response)
      tokenManager.setToken(response.access_token, response.user_info)
      setUser(response.user_info)
      setIsLoggedIn(true)
      console.log('구글 로그인 성공, 사용자 상태 업데이트됨')
      return response
    } catch (error) {
      console.error('구글 로그인 오류:', error)
      throw error
    }
  }

  // 사용자 정보 업데이트
  const updateProfile = async (userData) => {
    const updatedUser = await authAPI.updateProfile(userData)
    setUser(updatedUser)
    return updatedUser
  }

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    googleLogin,
    updateProfile,
    setUser,
    isLoggedIn,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
