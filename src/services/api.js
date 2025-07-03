import { http, authHttp } from '@/lib/http'
import { STORAGE_KEYS } from '@/constants/storage'

// 401 에러 처리
const handle401Error = () => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.USER_INFO)
  window.location.href = '/login'
}

// 응답 처리 헬퍼
const handleResponse = async (response) => {
  console.log(response)

  if (response.status === 401) {
    handle401Error()
    throw new Error('Unauthorized')
  }

  if (!response.ok) {
    const error = new Error(`HTTP Error: ${response.status}`)
    error.status = response.status
    error.statusText = response.statusText

    try {
      const errorData = await response.json()
      error.data = errorData
    } catch {
      // JSON 파싱 실패 시 기본 에러 메시지 사용
    }

    throw error
  }

  // 응답이 비어있을 수 있으므로 체크
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return response.json()
  }

  return response.text()
}

// 인증 관련 API
export const authAPI = {
  // 회원가입
  register: async (userData) => {
    const response = await http.POST('auth/register', { body: userData })
    return handleResponse(response)
  },

  // 로그인 (FastAPI OAuth2PasswordRequestForm 형식)
  login: async (credentials) => {
    const formData = new URLSearchParams()
    formData.append('username', credentials.username)
    formData.append('password', credentials.password)

    const response = await http.POST('auth/login', {
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    return handleResponse(response)
  },

  // 로그아웃
  logout: async () => {
    const response = await authHttp.POST('auth/logout')
    return handleResponse(response)
  },

  // 현재 사용자 정보 조회
  getMe: async () => {
    const response = await authHttp.GET('auth/me')
    return handleResponse(response)
  },

  // 사용자 프로필 업데이트
  updateProfile: async (userData) => {
    const response = await authHttp.PUT('auth/me', { body: userData })
    return handleResponse(response)
  },

  // 비밀번호 변경
  changePassword: async (passwordData) => {
    const response = await authHttp.POST('auth/change-password', {
      body: passwordData,
    })
    return handleResponse(response)
  },
  // 구글 OAuth 인증 URL 생성
  getGoogleAuthUrl: async () => {
    const response = await http.GET('auth/google/auth-url')
    return handleResponse(response)
  },

  // OAuth 콜백 처리
  googleCallback: async (code, state) => {
    const response = await http.GET('auth/google/callback', {
      params: {
        query: { code, state },
      },
    })
    return handleResponse(response)
  },
}

// 토큰 관리
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

  // 토큰 제거
  removeToken: () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER_INFO)
  },

  // 로그인 상태 확인
  isLoggedIn: () => {
    return !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  },
}

// OpenAPI-fetch 스타일로 사용할 수 있는 API 클라이언트 export
export { http, authHttp }
export default { http, authHttp, authAPI, tokenManager }

export async function fetchPlanRecommendation({
  origin,
  destination,
  startDate,
  endDate,
}) {
  const res = await fetch('/api/plan/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ origin, destination, startDate, endDate }),
  })
  if (!res.ok) throw new Error('API 요청 실패')
  return res.json()
}
