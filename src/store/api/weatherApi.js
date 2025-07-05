import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseQuery'

export const weatherApi = createApi({
  reducerPath: 'weatherApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Weather'],
  endpoints: (builder) => ({
    // 여행지 기준 날씨 정보 조회 (기간별)
    getWeatherForecast: builder.query({
      query: ({ destination, startDate, endDate }) => ({
        url: 'weather/forecast',
        params: {
          destination,
          start_date: startDate,
          end_date: endDate
        }
      }),
      providesTags: (result, error, { destination, startDate, endDate }) => [
        { 
          type: 'Weather', 
          id: `forecast-${destination}-${startDate}-${endDate}` 
        }
      ],
      keepUnusedDataFor: 300 // 5분간 캐싱 (날씨 데이터는 자주 변경됨)
    }),

    // 장소 ID 기준 날씨 정보 조회 (특정 날짜)
    getWeatherByPlaceId: builder.query({
      query: ({ placeId, date }) => ({
        url: 'weather/forecast-by-place-id',
        params: { 
          place_id: placeId, 
          date 
        }
      }),
      providesTags: (result, error, { placeId, date }) => [
        { type: 'Weather', id: `place-${placeId}-${date}` }
      ],
      keepUnusedDataFor: 300 // 5분간 캐싱
    }),

    // 현재 날씨 조회 (도시명 기준)
    getCurrentWeather: builder.query({
      query: (city) => ({
        url: `weather/current/${city}`
      }),
      providesTags: (result, error, city) => [
        { type: 'Weather', id: `current-${city}` }
      ],
      keepUnusedDataFor: 180 // 3분간 캐싱 (현재 날씨는 더 자주 업데이트)
    }),

    // 날씨 예보 조회 (도시명 기준)
    getWeatherForecastByCity: builder.query({
      query: (city) => ({
        url: `weather/forecast/${city}`
      }),
      providesTags: (result, error, city) => [
        { type: 'Weather', id: `forecast-city-${city}` }
      ],
      keepUnusedDataFor: 300 // 5분간 캐싱
    }),

    // 여행 날씨 점수 조회 (도시명과 날짜 기준)
    getTravelWeatherScore: builder.query({
      query: ({ city, date }) => ({
        url: 'weather/travel-score',
        params: { city, date }
      }),
      providesTags: (result, error, { city, date }) => [
        { type: 'Weather', id: `score-${city}-${date}` }
      ],
      keepUnusedDataFor: 600 // 10분간 캐싱 (점수는 상대적으로 안정적)
    }),

    // 과거 날씨 데이터 조회 (도시명과 날짜 기준)
    getHistoricalWeather: builder.query({
      query: ({ city, date }) => ({
        url: 'weather/historical',
        params: { city, date }
      }),
      providesTags: (result, error, { city, date }) => [
        { type: 'Weather', id: `historical-${city}-${date}` }
      ],
      keepUnusedDataFor: 1800 // 30분간 캐싱 (과거 데이터는 변경되지 않음)
    }),

    // 지역별 날씨 조회 (위도/경도 기준)
    getWeatherByCoordinates: builder.query({
      query: ({ lat, lon, date }) => ({
        url: 'weather/coordinates',
        params: { lat, lon, date }
      }),
      providesTags: (result, error, { lat, lon, date }) => [
        { type: 'Weather', id: `coords-${lat}-${lon}-${date}` }
      ],
      keepUnusedDataFor: 300 // 5분간 캐싱
    })
  })
})

// Export hooks for usage in functional components
export const {
  useGetWeatherForecastQuery,
  useGetWeatherByPlaceIdQuery,
  useGetCurrentWeatherQuery,
  useGetWeatherForecastByCityQuery,
  useGetTravelWeatherScoreQuery,
  useGetHistoricalWeatherQuery,
  useGetWeatherByCoordinatesQuery
} = weatherApi