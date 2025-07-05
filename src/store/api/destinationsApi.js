import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseQuery'

export const destinationsApi = createApi({
  reducerPath: 'destinationsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Destination'],
  endpoints: (builder) => ({
    // 목적지 검색 (자동완성)
    searchDestinations: builder.query({
      query: (searchTerm) => ({
        url: 'destinations/search',
        params: { query: searchTerm }
      }),
      providesTags: (result, error, searchTerm) => [
        { type: 'Destination', id: `search-${searchTerm}` }
      ],
      keepUnusedDataFor: 60, // 검색 결과 1분간 캐싱
      // 빈 검색어나 너무 짧은 검색어는 쿼리하지 않음
      skip: (searchTerm) => !searchTerm || searchTerm.trim().length < 2
    }),

    // 여행지 추천 (테마 기반) - plansApi에서 이미 구현되어 있지만 독립적으로도 사용 가능
    getDestinationRecommendations: builder.query({
      query: ({ theme, weatherConditions = [] }) => ({
        url: 'destinations/recommend',
        params: {
          theme,
          weather_conditions: weatherConditions.join(',')
        }
      }),
      providesTags: (result, error, { theme }) => [
        { type: 'Destination', id: `recommend-${theme}` }
      ],
      keepUnusedDataFor: 600 // 10분간 캐싱 (추천 데이터는 상대적으로 안정적)
    }),

    // 지역별 목적지 목록 조회 (추후 확장용)
    getDestinationsByRegion: builder.query({
      query: ({ regionCode, page = 1, size = 10 }) => ({
        url: 'destinations/by-region',
        params: { region_code: regionCode, page, size }
      }),
      providesTags: (result, error, { regionCode }) => [
        { type: 'Destination', id: `region-${regionCode}` }
      ],
      keepUnusedDataFor: 300 // 5분간 캐싱
    }),

    // 목적지 상세 정보 조회 (추후 확장용)
    getDestinationDetail: builder.query({
      query: (destinationId) => ({
        url: `destinations/${destinationId}`
      }),
      providesTags: (result, error, destinationId) => [
        { type: 'Destination', id: destinationId }
      ],
      keepUnusedDataFor: 900 // 15분간 캐싱 (상세 정보는 자주 변경되지 않음)
    })
  })
})

// Export hooks for usage in functional components
export const {
  useSearchDestinationsQuery,
  useGetDestinationRecommendationsQuery,
  useGetDestinationsByRegionQuery,
  useGetDestinationDetailQuery
} = destinationsApi