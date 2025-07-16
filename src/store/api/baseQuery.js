import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { STORAGE_KEYS } from '@/constants/storage'

// 환경별 Base URL 설정
const getBaseUrl = () => {
  // 개발 환경: 프록시 사용
  if (import.meta.env.DEV) {
    return '/api/'
  }

  // 프로덕션 환경: 환경변수 사용
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/'
}

// 401/403 에러 처리 함수 (기존 로직 재사용)
const handle401Error = () => {
  console.log('🔓 인증 실패 - 토큰 정리 및 로그인 페이지 이동')
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.USER_INFO)

  // 현재 페이지가 로그인 페이지가 아닌 경우에만 리다이렉트
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

// 기본 Base Query
export const baseQuery = fetchBaseQuery({
  baseUrl: getBaseUrl(),
  prepareHeaders: (headers) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }

    // Content-Type 기본 설정 (FormData가 아닌 경우)
    if (!headers.get('content-type')) {
      headers.set('content-type', 'application/json')
    }

    return headers
  },
})

// 토큰 갱신을 위한 mutex (동시에 여러 갱신 요청 방지)
let isRefreshing = false
let refreshPromise = null

// refresh token으로 access token 갱신
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)

  if (!refreshToken) {
    return null
  }

  try {
    const response = await fetch(`${getBaseUrl()}auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })

    if (response.ok) {
      const data = await response.json()
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access_token)
      return data.access_token
    }
  } catch (error) {
    console.error('Failed to refresh token:', error)
  }

  return null
}

// 에러 처리 및 재인증을 포함한 Base Query
export const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)

  // 401 에러 또는 403 에러 처리 (둘 다 인증/권한 문제)
  if (result.error && (result.error.status === 401 || result.error.status === 403)) {
    console.log(`🚨 ${result.error.status} 에러 발생:`, args.url)
    console.log('에러 상세:', result.error)
    
    // refresh 엔드포인트 자체에 대한 요청이면 바로 로그아웃
    if (args.url === 'auth/refresh') {
      handle401Error()
      return result
    }

    // 이미 갱신 중이면 기다림
    if (isRefreshing) {
      try {
        await refreshPromise
        // 토큰 갱신 후 원래 요청 재시도
        result = await baseQuery(args, api, extraOptions)
      } catch {
        handle401Error()
      }
      return result
    }

    // 토큰 갱신 시작
    isRefreshing = true
    refreshPromise = refreshAccessToken()

    try {
      const newToken = await refreshPromise
      if (newToken) {
        // 토큰 갱신 성공 - 원래 요청 재시도
        result = await baseQuery(args, api, extraOptions)
      } else {
        // 토큰 갱신 실패 - 로그아웃
        handle401Error()
      }
    } finally {
      isRefreshing = false
      refreshPromise = null
    }
  }

  // 응답 데이터 변환 (기존 handleResponse 로직 적용)
  if (result.data && typeof result.data === 'object') {
    // 성공 응답인 경우 data 필드 추출 (백엔드 응답 구조에 맞춤)
    if (result.data.success && result.data.data !== undefined) {
      result.data = result.data.data
    }
    // success 필드가 없는 경우 직접 데이터 사용
  }

  return result
}
