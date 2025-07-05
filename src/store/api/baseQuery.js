import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { STORAGE_KEYS } from '@/constants/storage'

// 환경별 Base URL 설정
const getBaseUrl = () => {
  // 개발 환경: 프록시 사용
  if (import.meta.env.DEV) {
    return '/api/'
  }

  // 프로덕션 환경: 직접 URL 사용
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
}

// 401 에러 처리 함수 (기존 로직 재사용)
const handle401Error = () => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.USER_INFO)
  
  // 현재 페이지가 로그인 페이지가 아닌 경우에만 리다이렉트
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

// 기본 Base Query
export const baseQuery = fetchBaseQuery({
  baseUrl: getBaseUrl(),
  prepareHeaders: (headers, { getState, endpoint }) => {
    // 인증이 필요한 엔드포인트인지 확인
    const authRequiredEndpoints = [
      'getMe', 'updateProfile', 'changePassword', 'logout', 'withdraw',
      'createTravelPlan', 'getUserPlans', 'updateTravelPlan', 'deleteTravelPlan', 'shareTravelPlan'
    ]
    
    // 인증이 필요한 엔드포인트만 토큰 추가
    if (authRequiredEndpoints.includes(endpoint)) {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
    }
    
    // Content-Type 기본 설정 (FormData가 아닌 경우)
    if (!headers.get('content-type')) {
      headers.set('content-type', 'application/json')
    }
    
    return headers
  }
})

// 에러 처리 및 재인증을 포함한 Base Query
export const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)
  
  // 401 에러 처리
  if (result.error && result.error.status === 401) {
    console.warn('Unauthorized access - redirecting to login')
    handle401Error()
  }
  
  // 응답 데이터 변환 (기존 handleResponse 로직 적용)
  if (result.data && typeof result.data === 'object') {
    // 성공 응답인 경우 data 필드 추출 (백엔드 응답 구조에 맞춤)
    if (result.data.data !== undefined) {
      result.data = result.data.data
    }
  }
  
  return result
}
