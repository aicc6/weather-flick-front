import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseQuery'

// 데이터 검증 및 정제 유틸리티
const validateAndSanitizeResponse = (response, expectedStructure = {}) => {
  try {
    // 기본 응답 검증 (null은 typeof가 'object'이므로 별도 처리)
    if (!response || typeof response !== 'object') {
      return expectedStructure
    }

    // 표준 응답 래퍼 처리
    if (Object.prototype.hasOwnProperty.call(response, 'success')) {
      if (!response.success) {
        // 에러는 실제 에러 처리를 위해 유지
        console.error('API 응답 오류:', response.error || response)
        return expectedStructure
      }
      response = response.data
    }

    // 응답이 null이거나 undefined인 경우 처리
    if (!response) {
      return expectedStructure
    }

    // 배열 응답인 경우 바로 반환
    if (Array.isArray(response)) {
      return response
    }

    // itinerary 필드가 문자열인 경우 JSON 파싱
    if (response.itinerary && typeof response.itinerary === 'string') {
      try {
        response.itinerary = JSON.parse(response.itinerary)
      } catch (parseError) {
        console.warn('itinerary JSON 파싱 실패:', parseError)
        response.itinerary = {}
      }
    }

    // 데이터 구조 검증 및 기본값 설정
    if (expectedStructure && typeof expectedStructure === 'object') {
      Object.keys(expectedStructure).forEach((key) => {
        if (response && typeof response === 'object' && !(key in response)) {
          response[key] = expectedStructure[key]
        }
      })
    }

    return response
  } catch (error) {
    console.error('데이터 검증 중 오류:', error)
    return expectedStructure
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
  tagTypes: ['TravelPlan', 'Weather', 'Destination', 'Route'],
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
        const validatedResponse = validateAndSanitizeResponse(
          response,
          TRAVEL_PLAN_DEFAULTS,
        )
        return validatedResponse
      },
    }),

    // 사용자의 저장된 플랜 목록 조회
    getUserPlans: builder.query({
      query: () => 'travel-plans/',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ plan_id }) => ({
                type: 'TravelPlan',
                id: plan_id,
              })),
              { type: 'TravelPlan', id: 'LIST' },
            ]
          : [{ type: 'TravelPlan', id: 'LIST' }],
      keepUnusedDataFor: 0, // 캐싱 비활성화하여 항상 최신 데이터 로드
      transformResponse: (response) => {
        const validatedResponse = validateAndSanitizeResponse(
          response,
          TRAVEL_PLANS_LIST_DEFAULTS,
        )
        // 배열이 아니면 빈 배열 반환 (안전장치)
        if (!Array.isArray(validatedResponse)) {
          return []
        }
        // 각 항목에 기본값 적용
        return validatedResponse.map((plan) => ({
          ...TRAVEL_PLAN_DEFAULTS,
          ...plan,
          // 필수 필드 검증
          plan_id: plan.plan_id || `temp-${Date.now()}-${Math.random()}`,
          created_at: plan.created_at || new Date().toISOString(),
        }))
      },
      transformErrorResponse: (response) => {
        console.error('getUserPlans API 오류:', response)
        return {
          status: response.status,
          data: response.data,
          message:
            response.data?.message ||
            '여행 계획 목록을 불러오는 중 오류가 발생했습니다',
        }
      },
    }),

    // 특정 플랜 조회
    getTravelPlan: builder.query({
      query: (planId) => `travel-plans/${planId}`,
      providesTags: (_, __, planId) => [{ type: 'TravelPlan', id: planId }],
      keepUnusedDataFor: 600, // 10분간 캐싱
      transformResponse: (response) => {
        const validatedResponse = validateAndSanitizeResponse(
          response,
          TRAVEL_PLAN_DEFAULTS,
        )
        return validatedResponse
      },
      transformErrorResponse: (response) => {
        return {
          status: response.status,
          data: response.data,
          message:
            response.data?.message ||
            response.data?.error?.message ||
            '여행 계획을 불러오는 중 오류가 발생했습니다',
        }
      },
    }),

    // 플랜 수정
    updateTravelPlan: builder.mutation({
      query: ({ planId, planData }) => ({
        url: `travel-plans/${planId}`,
        method: 'PUT',
        body: planData,
      }),
      invalidatesTags: (_, __, { planId }) => [
        { type: 'TravelPlan', id: planId },
        { type: 'TravelPlan', id: 'LIST' },
      ],
      transformResponse: (response) => {
        const validatedResponse = validateAndSanitizeResponse(
          response,
          TRAVEL_PLAN_DEFAULTS,
        )
        return validatedResponse
      },
    }),

    // 플랜 삭제
    deleteTravelPlan: builder.mutation({
      query: (planId) => ({
        url: `travel-plans/${planId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_, __, planId) => [
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
      invalidatesTags: (_, __, { planId }) => [
        { type: 'TravelPlan', id: planId },
      ],
      transformResponse: (response) => {
        const validatedResponse = validateAndSanitizeResponse(
          response,
          TRAVEL_PLAN_DEFAULTS,
        )
        return validatedResponse
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
      providesTags: (_, __, { theme }) => [
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

    // 경로 정보 관련 API
    // 여행 계획의 경로 목록 조회
    getTravelPlanRoutes: builder.query({
      query: (planId) => `routes/plan/${planId}`,
      providesTags: (result, error, planId) =>
        result
          ? [
              ...result.map(({ route_id }) => ({
                type: 'Route',
                id: route_id,
              })),
              { type: 'Route', id: `PLAN_${planId}` },
            ]
          : [{ type: 'Route', id: `PLAN_${planId}` }],
      keepUnusedDataFor: 300, // 5분간 캐싱
    }),

    // 경로 계산 (단일)
    calculateRoute: builder.mutation({
      query: (routeRequest) => ({
        url: 'routes/calculate',
        method: 'POST',
        body: routeRequest,
      }),
    }),

    // 다중 경로 계산
    calculateMultipleRoutes: builder.mutation({
      query: (routeRequest) => ({
        url: 'routes/calculate/multiple',
        method: 'POST',
        body: routeRequest,
      }),
    }),

    // 추천 경로 계산
    getRecommendedRoute: builder.mutation({
      query: ({ routeRequest, preferences = {} }) => ({
        url: 'routes/recommend',
        method: 'POST',
        body: { ...routeRequest, preferences },
      }),
    }),

    // 자동 경로 생성
    autoGenerateRoutes: builder.mutation({
      query: (planId) => ({
        url: `routes/plan/${planId}/auto-generate`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, planId) => [
        { type: 'Route', id: `PLAN_${planId}` },
        { type: 'TravelPlan', id: planId },
      ],
    }),

    // 경로 생성
    createRoute: builder.mutation({
      query: (routeData) => ({
        url: 'routes/',
        method: 'POST',
        body: routeData,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Route', id: `PLAN_${arg.plan_id}` },
      ],
    }),

    // 경로 수정
    updateRoute: builder.mutation({
      query: ({ routeId, routeData }) => ({
        url: `routes/${routeId}`,
        method: 'PUT',
        body: routeData,
      }),
      invalidatesTags: (result, error, { routeId }) => [
        { type: 'Route', id: routeId },
      ],
    }),

    // 경로 삭제
    deleteRoute: builder.mutation({
      query: (routeId) => ({
        url: `routes/${routeId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, routeId) => [
        { type: 'Route', id: routeId },
      ],
    }),

    // 경로 상세 정보 조회 (실시간 TMAP API 호출)
    getDetailedRouteInfo: builder.query({
      query: ({
        routeId,
        includePois = true,
        includeAlternatives = false,
      }) => ({
        url: `routes/${routeId}/details`,
        params: {
          include_pois: includePois,
          include_alternatives: includeAlternatives,
        },
      }),
      // 실시간 데이터이므로 캐싱하지 않음
      keepUnusedDataFor: 0,
      transformResponse: (response) => {
        return validateAndSanitizeResponse(response, {
          success: false,
          route_info: {},
          detailed_info: {},
          data_sources: {},
        })
      },
      transformErrorResponse: (response) => {
        return {
          status: response.status,
          data: response.data,
          message:
            response.data?.detail ||
            response.data?.message ||
            '상세 경로 정보를 불러오는 중 오류가 발생했습니다',
        }
      },
    }),

    // TMAP 타임머신 경로 정보 조회
    getTimemachineRouteInfo: builder.query({
      query: ({
        routeId,
        departureTime = null,
        includeComparison = false,
      }) => ({
        url: `routes/${routeId}/timemachine`,
        params: {
          departure_time: departureTime,
          include_comparison: includeComparison,
        },
      }),
      // 타임머신 데이터는 시간에 따라 변하므로 캐싱하지 않음
      keepUnusedDataFor: 0,
      transformResponse: (response) => {
        return validateAndSanitizeResponse(response, {
          success: false,
          route_info: {},
          timemachine_info: {},
          prediction_info: {},
          data_sources: {},
        })
      },
      transformErrorResponse: (response) => {
        return {
          status: response.status,
          data: response.data,
          message:
            response.data?.detail ||
            response.data?.message ||
            '타임머신 경로 정보를 불러오는 중 오류가 발생했습니다',
        }
      },
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
  // 경로 관련 hooks
  useGetTravelPlanRoutesQuery,
  useCalculateRouteMutation,
  useCalculateMultipleRoutesMutation,
  useGetRecommendedRouteMutation,
  useAutoGenerateRoutesMutation,
  useCreateRouteMutation,
  useUpdateRouteMutation,
  useDeleteRouteMutation,
  useGetDetailedRouteInfoQuery,
  useGetTimemachineRouteInfoQuery,
} = travelPlansApi
