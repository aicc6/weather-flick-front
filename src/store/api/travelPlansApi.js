import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseQuery'

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
