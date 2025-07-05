import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// 환경별 Base URL 설정
const getBaseUrl = () => {
  // 개발 환경: 프록시 사용
  if (import.meta.env.DEV) {
    return '/api/'
  }

  // 프로덕션 환경: 직접 URL 사용
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
}

// 기본 Base Query
export const baseQuery = fetchBaseQuery({
  baseUrl: getBaseUrl(),
  prepareHeaders: (headers) => {
    // Content-Type 기본 설정
    if (!headers.get('content-type')) {
      headers.set('content-type', 'application/json')
    }

    return headers
  },
})

// 에러 처리를 포함한 Base Query (추후 확장용)
export const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)

  // 추후 401 에러 처리, 재인증 로직 등을 여기에 추가 가능

  return result
}
