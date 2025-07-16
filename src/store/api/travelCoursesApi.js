// src/store/api/travelCoursesApi.js
import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseQuery'

export const travelCoursesApi = createApi({
  reducerPath: 'travelCoursesApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['TravelCourse'],
  endpoints: (builder) => ({
    getTravelCourses: builder.query({
      query: ({ page = 1, limit = 10, regionCode } = {}) => {
        const params = { page, limit }
        if (regionCode) params.regionCode = regionCode
        return {
          url: '/travel-courses/',
          params,
        }
      },
      providesTags: ['TravelCourse'],
    }),
    getTravelCourseDetail: builder.query({
      query: (contentId) => `/travel-courses/${contentId}`,
      providesTags: (result, error, id) => [{ type: 'TravelCourse', id }],
    }),
    getCoursesByRegion: builder.query({
      query: (regionCode) => `/travel-courses/region/${regionCode}`,
      providesTags: (result, error, regionCode) => [
        { type: 'TravelCourse', id: regionCode },
      ],
    }),
    searchTravelCourses: builder.query({
      query: (searchParams) => ({
        url: '/travel-courses/search',
        params: searchParams, // { keyword, regionCode, ... }
      }),
      providesTags: ['TravelCourse'],
    }),
  }),
})

export const {
  useGetTravelCoursesQuery,
  useGetTravelCourseDetailQuery,
  useGetCoursesByRegionQuery,
  useSearchTravelCoursesQuery,
} = travelCoursesApi
