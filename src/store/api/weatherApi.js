import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseQuery'

export const weatherApi = createApi({
  reducerPath: 'weatherApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Weather'],
  endpoints: (builder) => ({
    // 장소 ID 기준 날씨 정보 조회 (특정 날짜)
    getWeatherByPlaceId: builder.query({
      query: ({ placeId, date }) => ({
        url: 'weather/forecast-by-place-id',
        params: {
          place_id: placeId,
          date,
        },
      }),
      providesTags: (result, error, { placeId, date }) => [
        { type: 'Weather', id: `place-${placeId}-${date}` },
      ],
      keepUnusedDataFor: 300, // 5분간 캐싱
    }),

    // 현재 날씨 조회 (도시명 기준)
    getCurrentWeather: builder.query({
      query: (city) => ({
        url: `weather/current/${city}`,
      }),
      providesTags: (result, error, city) => [
        { type: 'Weather', id: `current-${city}` },
      ],
      keepUnusedDataFor: 180, // 3분간 캐싱 (현재 날씨는 더 자주 업데이트)
    }),

    // 날씨 예보 조회 (도시명 기준)
    getWeatherForecastByCity: builder.query({
      query: (city) => ({
        url: `weather/forecast/${city}`,
      }),
      providesTags: (result, error, city) => [
        { type: 'Weather', id: `forecast-city-${city}` },
      ],
      keepUnusedDataFor: 300, // 5분간 캐싱
    }),
  }),
})

// Export hooks for usage in functional components
export const {
  useGetWeatherByPlaceIdQuery,
  useGetCurrentWeatherQuery,
  useGetWeatherForecastByCityQuery,
} = weatherApi
