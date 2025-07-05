/**
 * RTK Query 마이그레이션 헬퍼 유틸리티
 * 기존 커스텀 HTTP 클라이언트와 RTK Query 간의 호환성을 위한 헬퍼 함수들
 */

import { STORAGE_KEYS } from '@/constants/storage'

/**
 * 토큰 관리 유틸리티 (기존 tokenManager와 호환)
 */
export const tokenManager = {
  // 토큰 저장
  setToken: (token, userInfo) => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token)
    if (userInfo) {
      localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo))
    }
  },

  // 토큰 가져오기
  getToken: () => {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  },

  // 사용자 정보 가져오기
  getUserInfo: () => {
    const userInfo = localStorage.getItem(STORAGE_KEYS.USER_INFO)
    return userInfo ? JSON.parse(userInfo) : null
  },

  // 사용자 정보만 별도로 저장
  setUserInfo: (userInfo) => {
    if (userInfo) {
      localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo))
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER_INFO)
    }
  },

  // 토큰 제거
  removeToken: () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER_INFO)
  },

  // 모든 토큰 및 사용자 정보 제거
  clearTokens: () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER_INFO)
  },

  // 로그인 상태 확인
  isLoggedIn: () => {
    return !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  },
}

/**
 * 기존 API 응답 형식과 RTK Query 응답 형식 간 변환
 */
export const responseTransformer = {
  // RTK Query 응답을 기존 형식으로 변환
  toLegacyFormat: (rtkResponse) => {
    if (rtkResponse.isLoading) {
      return { loading: true, data: null, error: null }
    }

    if (rtkResponse.error) {
      return {
        loading: false,
        data: null,
        error: rtkResponse.error.message || 'API Error',
      }
    }

    return {
      loading: false,
      data: rtkResponse.data,
      error: null,
    }
  },

  // 기존 handleResponse 로직 재현
  handleRTKResponse: (response) => {
    if (response.error) {
      const error = new Error(`HTTP Error: ${response.error.status}`)
      error.status = response.error.status
      error.data = response.error.data
      throw error
    }

    return response.data
  },
}

/**
 * 점진적 마이그레이션을 위한 래퍼 함수들
 */
export const migrationWrappers = {
  // 기존 authAPI.login을 RTK Query로 래핑
  wrapLogin: (useLoginMutation) => {
    return () => {
      const [loginMutation] = useLoginMutation()

      return {
        login: async (credentials) => {
          try {
            const result = await loginMutation(credentials).unwrap()
            return result
          } catch (error) {
            throw responseTransformer.handleRTKResponse({ error })
          }
        },
      }
    }
  },

  // 기존 API 호출 패턴을 RTK Query 패턴으로 변환하는 헬퍼
  convertToRTKPattern: (legacyApiCall, rtkHook) => {
    return (params) => {
      const result = rtkHook(params)
      return responseTransformer.toLegacyFormat(result)
    }
  },
}

/**
 * 마이그레이션 체크리스트 및 로깅
 */
export const migrationLogger = {
  logApiCall: (apiName, method, params) => {
    if (import.meta.env.DEV) {
      console.log(`🔄 RTK Query API Call: ${apiName}.${method}`, params)
    }
  },

  logMigrationStatus: (component, status) => {
    if (import.meta.env.DEV) {
      console.log(`📊 Migration Status: ${component} - ${status}`)
    }
  },
}
