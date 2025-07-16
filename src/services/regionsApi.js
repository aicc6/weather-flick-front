// 지역 정보 API 서비스
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// API 베이스 URL 설정
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const regionsApi = createApi({
  reducerPath: 'regionsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/local`,
  }),
  tagTypes: ['Region'],
  endpoints: (builder) => ({
    // 모든 지역 목록 조회
    getRegions: builder.query({
      query: () => '/regions',
      providesTags: ['Region'],
      transformResponse: (response) => {
        return response.regions || []
      },
    }),

    // 최상위 지역 목록 조회 (중복 제거)
    getTopLevelRegions: builder.query({
      query: () => '/regions/top_level_dedup',
      providesTags: ['Region'],
      transformResponse: (response) => {
        return response.regions || []
      },
    }),

    // 지역 포인트 정보 조회
    getRegionsPoint: builder.query({
      query: () => '/regions_point',
      providesTags: ['Region'],
      transformResponse: (response) => {
        return response.regions || []
      },
    }),

    // 지원되는 도시 목록 조회
    getSupportedCities: builder.query({
      query: () => '/cities',
      providesTags: ['Region'],
      transformResponse: (response) => {
        return response.cities || []
      },
    }),
  }),
})

export const {
  useGetRegionsQuery,
  useGetTopLevelRegionsQuery,
  useGetRegionsPointQuery,
  useGetSupportedCitiesQuery,
} = regionsApi

// 지역 관련 유틸리티 함수들
export const regionUtils = {
  /**
   * 지역 목록을 광역시도별로 그룹화
   * @param {Array} regions - 지역 목록
   * @returns {Object} 그룹화된 지역 객체
   */
  groupByProvince: (regions) => {
    if (!regions || !Array.isArray(regions)) return {}

    return regions.reduce((acc, region) => {
      const provinceCode = region.parent_region_code || region.region_code
      if (!acc[provinceCode]) {
        acc[provinceCode] = []
      }
      acc[provinceCode].push(region)
      return acc
    }, {})
  },

  /**
   * 지역 코드로 지역 정보 찾기
   * @param {Array} regions - 지역 목록
   * @param {string} regionCode - 찾을 지역 코드
   * @returns {Object|null} 지역 정보 또는 null
   */
  findByCode: (regions, regionCode) => {
    if (!regions || !Array.isArray(regions)) return null
    return regions.find((region) => region.region_code === regionCode) || null
  },

  /**
   * 지역명으로 지역 정보 찾기
   * @param {Array} regions - 지역 목록
   * @param {string} regionName - 찾을 지역명
   * @returns {Object|null} 지역 정보 또는 null
   */
  findByName: (regions, regionName) => {
    if (!regions || !Array.isArray(regions)) return null
    return (
      regions.find(
        (region) =>
          region.region_name === regionName ||
          region.region_name_full === regionName,
      ) || null
    )
  },

  /**
   * 최상위 지역(광역시도)만 필터링
   * @param {Array} regions - 지역 목록
   * @returns {Array} 최상위 지역 목록
   */
  getTopLevelOnly: (regions) => {
    if (!regions || !Array.isArray(regions)) return []
    return regions.filter((region) => region.region_level === 1)
  },

  /**
   * 하위 지역(시군구)만 필터링
   * @param {Array} regions - 지역 목록
   * @param {string} parentCode - 상위 지역 코드
   * @returns {Array} 하위 지역 목록
   */
  getSubRegions: (regions, parentCode) => {
    if (!regions || !Array.isArray(regions)) return []
    return regions.filter(
      (region) =>
        region.parent_region_code === parentCode && region.region_level === 2,
    )
  },

  /**
   * 지역 정보를 Select 컴포넌트용 옵션으로 변환
   * @param {Array} regions - 지역 목록
   * @returns {Array} Select 옵션 배열
   */
  toSelectOptions: (regions) => {
    if (!regions || !Array.isArray(regions)) return []
    return regions.map((region) => ({
      value: region.region_code,
      label: region.region_name_full || region.region_name,
      data: region,
    }))
  },

  /**
   * 지역 검색 (이름 기반)
   * @param {Array} regions - 지역 목록
   * @param {string} searchTerm - 검색어
   * @returns {Array} 검색 결과
   */
  search: (regions, searchTerm) => {
    if (!regions || !Array.isArray(regions) || !searchTerm) return []

    const term = searchTerm.toLowerCase()
    return regions.filter(
      (region) =>
        region.region_name.toLowerCase().includes(term) ||
        (region.region_name_full &&
          region.region_name_full.toLowerCase().includes(term)),
    )
  },
}

export default regionsApi
