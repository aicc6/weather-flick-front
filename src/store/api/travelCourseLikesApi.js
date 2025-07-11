import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseQuery'

export const travelCourseLikesApi = createApi({
  reducerPath: 'travelCourseLikesApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    createTravelCourseLike: builder.mutation({
      query: (courseData) => ({
        url: '/travel-course-likes/',
        method: 'POST',
        body: courseData,
      }),
    }),
    getTravelCourseLikes: builder.query({
      query: (userId) => ({
        url: '/travel-course-likes/',
        params: { user_id: userId },
      }),
    }),
  }),
})

export const {
  useCreateTravelCourseLikeMutation,
  useGetTravelCourseLikesQuery,
} = travelCourseLikesApi
