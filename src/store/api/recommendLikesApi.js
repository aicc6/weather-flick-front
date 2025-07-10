import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseQuery'

export const recommendLikesApi = createApi({
  reducerPath: 'recommendLikesApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['RecommendLike'],
  endpoints: (builder) => ({
    getCourseLike: builder.query({
      query: (courseId) => `/likes-recommend/course/${courseId}`,
      providesTags: (result, error, courseId) => [
        { type: 'RecommendLike', id: courseId },
      ],
    }),
    likeCourse: builder.mutation({
      query: (courseId) => ({
        url: '/likes-recommend/',
        method: 'POST',
        body: { course_id: courseId },
      }),
      invalidatesTags: (result, error, courseId) => [
        { type: 'RecommendLike', id: courseId },
      ],
    }),
    unlikeCourse: builder.mutation({
      query: (courseId) => ({
        url: `/likes-recommend/${courseId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, courseId) => [
        { type: 'RecommendLike', id: courseId },
      ],
    }),
  }),
})

export const {
  useGetCourseLikeQuery,
  useLikeCourseMutation,
  useUnlikeCourseMutation,
} = recommendLikesApi
