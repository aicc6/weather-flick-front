import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseQuery'

export const recommendReviewsApi = createApi({
  reducerPath: 'recommendReviewsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['RecommendReview'],
  endpoints: (builder) => ({
    getReviewsByCourse: builder.query({
      query: (courseId) => `/recommend-reviews/course/${courseId}`,
      providesTags: (result, error, courseId) => [
        { type: 'RecommendReview', id: courseId },
      ],
      keepUnusedDataFor: 300,
    }),
    createReview: builder.mutation({
      query: (review) => ({
        url: '/recommend-reviews/',
        method: 'POST',
        body: review,
      }),
      invalidatesTags: (result, error, { course_id }) => [
        { type: 'RecommendReview', id: course_id },
      ],
    }),
    getReviewsTreeByCourse: builder.query({
      query: (courseId) => `/recommend-reviews/course/${courseId}/tree`,
      providesTags: (result, error, courseId) => [
        { type: 'RecommendReview', id: courseId },
      ],
      keepUnusedDataFor: 300,
    }),
  }),
})

export const {
  useGetReviewsByCourseQuery,
  useCreateReviewMutation,
  useGetReviewsTreeByCourseQuery,
} = recommendReviewsApi
