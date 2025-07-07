import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseQuery'

// 데이터 검증 및 정제 유틸리티
const validateAndSanitizeResponse = (response, expectedStructure = {}) => {
  try {
    // 기본 응답 검증
    if (!response || typeof response !== 'object') {
      console.warn('비정상적인 API 응답 타입:', typeof response)
      return null
    }

    // 표준 응답 래퍼 처리
    if (Object.prototype.hasOwnProperty.call(response, 'success')) {
      if (!response.success) {
        console.warn('API 응답 오류:', response.error || '알 수 없는 오류')
        return response
      }
      response = response.data
    }

    // 데이터 구조 검증 및 기본값 설정
    if (expectedStructure && typeof expectedStructure === 'object') {
      Object.keys(expectedStructure).forEach(key => {
        if (response && typeof response === 'object' && !(key in response)) {
          response[key] = expectedStructure[key]
        }
      })
    }

    return response
  } catch (error) {
    console.error('데이터 검증 중 오류:', error)
    return null
  }
}

// 여행 계획 데이터 구조 기본값
const TRAVEL_PLAN_DEFAULTS = {
  title: '제목 없음',
  status: 'PLANNING',
  itinerary: {},
  start_date: null,
  end_date: null,
  start_location: null,
  description: null,
}

// 여행 계획 목록 기본값
const TRAVEL_PLANS_LIST_DEFAULTS = []

export const travelPlansApi = createApi({
  reducerPath: 'travelPlansApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['TravelPlan', 'Weather', 'Destination'],
  endpoints: (builder) => ({
    // 여행 플랜 생성
    createTravelPlan: builder.mutation({
      query: (planData) => ({
        url: 'travel-plans/',
        method: 'POST',
        body: planData,
      }),
      invalidatesTags: ['TravelPlan'],
      transformResponse: (response) => {
        // 표준 응답 래퍼 처리: { success: true, data: {...}, error: null }
        if (
          !response ||
          typeof response !== 'object' ||
          !Object.prototype.hasOwnProperty.call(response, 'success')
        ) {
          return response
        }
        return response.success ? response.data : response
      },
    }),

    // 사용자의 저장된 플랜 목록 조회
    getUserPlans: builder.query({
      query: () => 'travel-plans/',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'TravelPlan', id })),
              { type: 'TravelPlan', id: 'LIST' },
            ]
          : [{ type: 'TravelPlan', id: 'LIST' }],
      keepUnusedDataFor: 300, // 5분간 캐싱
      transformResponse: (response) => {
        const validatedResponse = validateAndSanitizeResponse(response, TRAVEL_PLANS_LIST_DEFAULTS)
        // 배열이 아니면 빈 배열 반환 (안전장치)
        if (!Array.isArray(validatedResponse)) {
          console.warn('여행 계획 목록이 배열이 아님:', validatedResponse)
          return []
        }
        // 각 항목에 기본값 적용
        return validatedResponse.map(plan => ({
          ...TRAVEL_PLAN_DEFAULTS,
          ...plan,
          // 필수 필드 검증
          plan_id: plan.plan_id || `temp-${Date.now()}-${Math.random()}`,
          created_at: plan.created_at || new Date().toISOString(),
        }))
      },
      transformErrorResponse: (response) => {
        return {
          status: response.status,
          data: response.data,
          message: response.data?.message || '여행 계획 목록을 불러오는 중 오류가 발생했습니다',
        }
      },
    }),

    // 특정 플랜 조회
    getTravelPlan: builder.query({
      query: (planId) => `travel-plans/${planId}`,
      providesTags: (result, error, planId) => [
        { type: 'TravelPlan', id: planId },
      ],
      keepUnusedDataFor: 600, // 10분간 캐싱
      transformResponse: (response) => {
        if (
          !response ||
          typeof response !== 'object' ||
          !Object.prototype.hasOwnProperty.call(response, 'success')
        ) {
          return response
        }
        return response.success ? response.data : response
      },
    }),

    // 플랜 수정
    updateTravelPlan: builder.mutation({
      query: ({ planId, planData }) => ({
        url: `travel-plans/${planId}`,
        method: 'PUT',
        body: planData,
      }),
      invalidatesTags: (result, error, { planId }) => [
        { type: 'TravelPlan', id: planId },
        { type: 'TravelPlan', id: 'LIST' },
      ],
      transformResponse: (response) => {
        if (
          !response ||
          typeof response !== 'object' ||
          !Object.prototype.hasOwnProperty.call(response, 'success')
        ) {
          return response
        }
        return response.success ? response.data : response
      },
    }),

    // 플랜 삭제
    deleteTravelPlan: builder.mutation({
      query: (planId) => ({
        url: `travel-plans/${planId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, planId) => [
        { type: 'TravelPlan', id: planId },
        { type: 'TravelPlan', id: 'LIST' },
      ],
    }),

    // 플랜 공유
    shareTravelPlan: builder.mutation({
      query: ({ planId, shareData }) => ({
        url: `travel-plans/${planId}/share`,
        method: 'POST',
        body: shareData,
      }),
      invalidatesTags: (result, error, { planId }) => [
        { type: 'TravelPlan', id: planId },
      ],
      transformResponse: (response) => {
        if (
          !response ||
          typeof response !== 'object' ||
          !Object.prototype.hasOwnProperty.call(response, 'success')
        ) {
          return response
        }
        return response.success ? response.data : response
      },
    }),

    // 여행지 추천 (테마 기반)
    getDestinationRecommendations: builder.query({
      query: ({ theme, weatherConditions = [] }) => ({
        url: 'destinations/recommend',
        params: {
          theme,
          weather_conditions: weatherConditions.join(','),
        },
      }),
      providesTags: (result, error, { theme }) => [
        { type: 'Destination', id: `recommend-${theme}` },
      ],
      keepUnusedDataFor: 600, // 10분간 캐싱 (추천 데이터는 상대적으로 안정적)
    }),

    // 플랜 추천 생성 (기존 fetchPlanRecommendation 기능)
    generatePlanRecommendation: builder.mutation({
      query: ({ origin, destination, startDate, endDate }) => ({
        url: 'plan/recommend',
        method: 'POST',
        body: { origin, destination, startDate, endDate },
      }),
    }),
  }),
})

// Export hooks for usage in functional components
export const {
  useCreateTravelPlanMutation,
  useGetUserPlansQuery,
  useGetTravelPlanQuery,
  useUpdateTravelPlanMutation,
  useDeleteTravelPlanMutation,
  useShareTravelPlanMutation,
  useGetDestinationRecommendationsQuery,
  useGeneratePlanRecommendationMutation,
} = travelPlansApi
