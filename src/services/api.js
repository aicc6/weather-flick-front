import axios from 'axios'

// API 기본 설정
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 요청 인터셉터 - 토큰 자동 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 응답 인터셉터 - 토큰 만료 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 토큰이 만료되었거나 유효하지 않은 경우
      localStorage.removeItem('access_token')
      localStorage.removeItem('user_info')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

// 인증 관련 API
export const authAPI = {
  // 회원가입
  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  // 로그인
  login: async (credentials) => {
    // OAuth2PasswordRequestForm은 form-data 형식을 요구합니다
    const formData = new URLSearchParams()
    formData.append('username', credentials.username)
    formData.append('password', credentials.password)

    const response = await api.post('/auth/login', formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    return response.data
  },

  // 로그아웃
  logout: async () => {
    const response = await api.post('/auth/logout')
    return response.data
  },

  // 현재 사용자 정보 조회
  getMe: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },

  // 사용자 프로필 업데이트
  updateProfile: async (userData) => {
    const response = await api.put('/auth/me', userData)
    return response.data
  },

  // 비밀번호 변경
  changePassword: async (passwordData) => {
    const response = await api.post('/auth/change-password', passwordData)
    return response.data
  },
}

// 토큰 관리
export const tokenManager = {
  // 토큰 저장
  setToken: (token, userInfo) => {
    localStorage.setItem('access_token', token)
    if (userInfo) {
      localStorage.setItem('user_info', JSON.stringify(userInfo))
    }
  },

  // 토큰 가져오기
  getToken: () => {
    return localStorage.getItem('access_token')
  },

  // 사용자 정보 가져오기
  getUserInfo: () => {
    const userInfo = localStorage.getItem('user_info')
    return userInfo ? JSON.parse(userInfo) : null
  },

  // 토큰 제거
  removeToken: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_info')
  },

  // 로그인 상태 확인
  isLoggedIn: () => {
    return !!localStorage.getItem('access_token')
  },
}

export default api
