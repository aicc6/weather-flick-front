import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseQuery'

export const regionsApi = createApi({
  reducerPath: 'regionsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Region'],
  endpoints: (builder) => ({
    // 전체 지역 목록 조회 (실제 백엔드 엔드포인트는 resions - 오타)
    getRegions: builder.query({
      query: () => 'local/resions',
      providesTags: ['Region'],
      keepUnusedDataFor: 1800, // 30분간 캐싱 (지역 정보는 자주 변경되지 않음)
      transformResponse: (response) => {
        // API 응답 구조: { regions: [...], total: number }
        return response.regions || []
      },
    }),

    // 특정 지역 상세 정보 조회
    getRegionDetail: builder.query({
      query: (regionCode) => `local/resions/${regionCode}`,
      providesTags: (result, error, regionCode) => [
        { type: 'Region', id: regionCode },
      ],
      keepUnusedDataFor: 1800, // 30분간 캐싱
    }),

    // 지역별 통계 정보 조회 (관광지 수, 인기도 등)
    getRegionStats: builder.query({
      query: (regionCode) => `local/resions/${regionCode}/stats`,
      providesTags: (result, error, regionCode) => [
        { type: 'Region', id: `stats-${regionCode}` },
      ],
      keepUnusedDataFor: 600, // 10분간 캐싱
    }),

    // 활성화된 도시 목록 조회
    getActiveRegions: builder.query({
      query: () => ({
        url: 'local/cities',
        params: { is_active: true },
      }),
      providesTags: [{ type: 'Region', id: 'active' }],
      keepUnusedDataFor: 1800, // 30분간 캐싱
      transformResponse: (response) => {
        // API 응답 구조: { cities: [...] }
        const cities = response.cities || []
        return cities.filter((city) => city.is_active !== false)
      },
    }),

    // 지역 검색 (지역명으로 검색)
    searchRegions: builder.query({
      query: (searchTerm) => ({
        url: 'local/resions/search',
        params: { q: searchTerm },
      }),
      providesTags: (result, error, searchTerm) => [
        { type: 'Region', id: `search-${searchTerm}` },
      ],
      keepUnusedDataFor: 300, // 5분간 캐싱
    }),

    // 지역 정보 업데이트 (관리자 기능)
    updateRegion: builder.mutation({
      query: ({ regionCode, regionData }) => ({
        url: `local/resions/${regionCode}`,
        method: 'PUT',
        body: regionData,
      }),
      invalidatesTags: (result, error, { regionCode }) => [
        { type: 'Region', id: regionCode },
        'Region',
      ],
    }),

    // 역지오코딩 (좌표 -> 주소)
    reverseGeocode: builder.mutation({
      query: ({ lat, lng }) => ({
        url: 'location/reverse-geocode',
        method: 'GET',
        params: { lat, lng },
      }),
    }),
  }),
})

// Export hooks for usage in functional components
export const {
  useGetRegionsQuery,
  useGetRegionDetailQuery,
  useGetRegionStatsQuery,
  useGetActiveRegionsQuery,
  useSearchRegionsQuery,
  useUpdateRegionMutation,
  useReverseGeocodeMutation,
} = regionsApi
