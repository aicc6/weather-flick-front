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

  // 초기 로드 시 사용자 정보 확인
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (tokenManager.isLoggedIn()) {
          const userInfo = await authAPI.getMe()
          setUser(userInfo)
        }
      } catch (error) {
        console.error('사용자 정보 로드 실패:', error)
        tokenManager.removeToken()
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  // 로그인
  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials)
      tokenManager.setToken(response.access_token, response.user_info)
      setUser(response.user_info)
      return response
    } catch (error) {
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
    }
  }

  // 회원가입
  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData)
      return response
    } catch (error) {
      throw error
    }
  }

  // 사용자 정보 업데이트
  const updateProfile = async (userData) => {
    try {
      const updatedUser = await authAPI.updateProfile(userData)
      setUser(updatedUser)
      return updatedUser
    } catch (error) {
      throw error
    }
  }

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    updateProfile,
    isLoggedIn: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
