// HTTP 클라이언트 사용 예시들

import { http, authHttp, createApiClient } from './http'
import { STORAGE_KEYS } from '@/constants/storage'

// 1. 기본 사용법
export const basicUsage = {
  // 공개 API 호출
  getPublicData: async () => {
    return http.GET('public/data')
  },

  // 인증이 필요한 API 호출
  getUserProfile: async () => {
    return authHttp.GET('auth/me')
  },
}

// 2. Path Variables 사용
export const pathVariableUsage = {
  getUser: async (userId) => {
    return authHttp.GET('users/{id}', {
      params: { path: { id: userId } },
    })
  },

  updateUser: async (userId, userData) => {
    return authHttp.PUT('users/{id}', {
      params: { path: { id: userId } },
      body: userData,
    })
  },
}

// 3. Query Parameters 사용
export const queryParameterUsage = {
  getUsers: async (page = 1, limit = 10, search = '') => {
    return authHttp.GET('users', {
      params: {
        query: { page, limit, ...(search && { search }) },
      },
    })
  },
}

// 4. 다른 API 서버 사용
export const externalApiUsage = {
  // 외부 API 클라이언트 생성
  weatherApi: createApiClient({
    baseUrl: 'https://api.openweathermap.org/data/2.5',
  }),

  getWeather: async (city) => {
    return externalApiUsage.weatherApi.GET('weather', {
      params: {
        query: {
          q: city,
          appid: import.meta.env.VITE_WEATHER_API_KEY,
        },
      },
    })
  },
}

// 5. 커스텀 헤더 사용
export const customHeaderUsage = {
  uploadFile: async (file) => {
    const formData = new FormData()
    formData.append('file', file)

    return authHttp.POST('upload', {
      body: formData,
      // FormData 사용 시 Content-Type은 자동으로 설정됨
    })
  },

  sendWithCustomHeaders: async (data) => {
    return authHttp.POST('custom-endpoint', {
      body: data,
      headers: {
        'X-Custom-Header': 'custom-value',
        'X-Request-ID': crypto.randomUUID(),
      },
    })
  },
}

// 6. 에러 핸들링 예시
export const errorHandlingUsage = {
  safeApiCall: async () => {
    try {
      const response = await authHttp.GET('might-fail')
      return { success: true, data: response }
    } catch (error) {
      console.error('API Error:', error)
      return {
        success: false,
        error: {
          status: error.status,
          message: error.message,
          data: error.data,
        },
      }
    }
  },
}

// 7. 실제 사용 시나리오
export const realWorldScenarios = {
  // 페이지네이션이 있는 목록 조회
  getPaginatedList: async (page, filters = {}) => {
    return authHttp.GET('items', {
      params: {
        query: {
          page,
          limit: 20,
          ...filters,
        },
      },
    })
  },

  // 파일 업로드와 진행률 추적
  uploadWithProgress: async (file, onProgress) => {
    const formData = new FormData()
    formData.append('file', file)

    // XMLHttpRequest를 사용한 진행률 추적이 필요한 경우
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100
          onProgress?.(progress)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText))
        } else {
          reject(new Error(`Upload failed: ${xhr.status}`))
        }
      })

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'))
      })

      xhr.open('POST', `${import.meta.env.VITE_API_BASE_URL}/upload`)
      xhr.setRequestHeader(
        'Authorization',
        `Bearer ${localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)}`,
      )
      xhr.send(formData)
    })
  },

  // 병렬 요청 처리
  loadDashboardData: async () => {
    const [userProfile, notifications, stats] = await Promise.all([
      authHttp.GET('auth/me'),
      authHttp.GET('notifications'),
      authHttp.GET('dashboard/stats'),
    ])

    return { userProfile, notifications, stats }
  },
}
