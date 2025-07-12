import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseQuery'

export const localInfoApi = createApi({
  reducerPath: 'localInfoApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Restaurant', 'LocalInfo'],
  endpoints: (builder) => ({
    // 모든 레스토랑 정보 조회
    getAllRestaurants: builder.query({
      query: ({ page = 1, page_size = 50, region_code, category_code }) => ({
        url: 'local/restaurants/all',
        params: {
          page,
          page_size,
          ...(region_code && { region_code }),
          ...(category_code && { category_code }),
        },
      }),
      providesTags: (result, error, { page, region_code, category_code }) => [
        {
          type: 'Restaurant',
          id: `all-${page}-${region_code}-${category_code}`,
        },
      ],
      keepUnusedDataFor: 300, // 5분간 캐싱
      transformResponse: (response) => {
        return {
          restaurants: response.restaurants || [],
          pagination: response.pagination || {},
          filters: response.filters || {},
        }
      },
    }),

    // 레스토랑 검색
    searchRestaurants: builder.query({
      query: ({ city, region, category, keyword, limit = 20 }) => ({
        url: 'local/restaurants',
        params: {
          city,
          ...(region && { region }),
          ...(category && { category }),
          ...(keyword && { keyword }),
          limit,
        },
      }),
      providesTags: (result, error, { city, region, category, keyword }) => [
        {
          type: 'Restaurant',
          id: `search-${city}-${region}-${category}-${keyword}`,
        },
      ],
      keepUnusedDataFor: 300, // 5분간 캐싱
      transformResponse: (response) => {
        return {
          restaurants: response.restaurants || [],
          total: response.total || 0,
        }
      },
    }),

    // 교통 정보 검색
    searchTransportation: builder.query({
      query: ({ city, region, transport_type, limit = 20 }) => ({
        url: 'local/transportation',
        params: {
          city,
          ...(region && { region }),
          ...(transport_type && { transport_type }),
          limit,
        },
      }),
      providesTags: (result, error, { city, region, transport_type }) => [
        {
          type: 'LocalInfo',
          id: `transport-${city}-${region}-${transport_type}`,
        },
      ],
      keepUnusedDataFor: 600, // 10분간 캐싱
      transformResponse: (response) => {
        return {
          transportations: response.transportations || [],
          total: response.total || 0,
        }
      },
    }),

    // 숙소 정보 검색
    searchAccommodations: builder.query({
      query: ({ city, region, accommodation_type, limit = 20 }) => ({
        url: 'local/accommodations',
        params: {
          city,
          ...(region && { region }),
          ...(accommodation_type && { accommodation_type }),
          limit,
        },
      }),
      providesTags: (result, error, { city, region, accommodation_type }) => [
        {
          type: 'LocalInfo',
          id: `accommodation-${city}-${region}-${accommodation_type}`,
        },
      ],
      keepUnusedDataFor: 600, // 10분간 캐싱
      transformResponse: (response) => {
        return {
          accommodations: response.accommodations || [],
          total: response.total || 0,
        }
      },
    }),

    // 주변 장소 검색
    getNearbyPlaces: builder.query({
      query: ({ latitude, longitude, radius = 5.0, category, limit = 20 }) => ({
        url: 'local/nearby',
        params: {
          latitude,
          longitude,
          radius,
          ...(category && { category }),
          limit,
        },
      }),
      providesTags: (
        result,
        error,
        { latitude, longitude, radius, category },
      ) => [
        {
          type: 'LocalInfo',
          id: `nearby-${latitude}-${longitude}-${radius}-${category}`,
        },
      ],
      keepUnusedDataFor: 300, // 5분간 캐싱
      transformResponse: (response) => {
        return {
          places: response.places || [],
          total: response.total || 0,
        }
      },
    }),

    // 카테고리 목록 조회
    getCategories: builder.query({
      query: () => 'local/categories',
      providesTags: [{ type: 'LocalInfo', id: 'categories' }],
      keepUnusedDataFor: 1800, // 30분간 캐싱
    }),

    // 활성화된 도시 목록 조회
    getSupportedCities: builder.query({
      query: () => 'local/cities',
      providesTags: [{ type: 'LocalInfo', id: 'cities' }],
      keepUnusedDataFor: 1800, // 30분간 캐싱
      transformResponse: (response) => {
        return response.cities || []
      },
    }),

    // 도시 정보 조회
    getCityInfo: builder.query({
      query: (city) => `local/cities/${city}/info`,
      providesTags: (result, error, city) => [
        { type: 'LocalInfo', id: `city-${city}` },
      ],
      keepUnusedDataFor: 1800, // 30분간 캐싱
    }),

    // 통합 지역정보 포인트 조회
    getRegionsPoint: builder.query({
      query: () => 'local/regions_point',
      providesTags: [{ type: 'LocalInfo', id: 'regions-point' }],
      keepUnusedDataFor: 1800, // 30분간 캐싱
      transformResponse: (response) => {
        return response.regions || []
      },
    }),
  }),
})

// Export hooks for usage in functional components
export const {
  useGetAllRestaurantsQuery,
  useSearchRestaurantsQuery,
  useSearchTransportationQuery,
  useSearchAccommodationsQuery,
  useGetNearbyPlacesQuery,
  useGetCategoriesQuery,
  useGetSupportedCitiesQuery,
  useGetCityInfoQuery,
  useGetRegionsPointQuery,
} = localInfoApi
