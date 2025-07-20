import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseQuery'

export const travelCourseLikesApi = createApi({
  reducerPath: 'travelCourseLikesApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['TravelCourseLike'],
  endpoints: (builder) => ({
    createTravelCourseLike: builder.mutation({
      query: (courseData) => ({
        url: '/travel-course-likes/',
        method: 'POST',
        body: courseData,
      }),
      invalidatesTags: (result, error, { content_id }) => [
        { type: 'TravelCourseLike', id: content_id },
        { type: 'TravelCourseLike', id: 'LIST' },
      ],
    }),
    getTravelCourseLikes: builder.query({
      query: () => '/travel-course-likes/',
      providesTags: [
        'TravelCourseLike',
        { type: 'TravelCourseLike', id: 'LIST' },
      ],
    }),
    deleteTravelCourseLike: builder.mutation({
      query: (contentId) => ({
        url: `/travel-course-likes/${contentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, contentId) => [
        { type: 'TravelCourseLike', id: contentId },
        { type: 'TravelCourseLike', id: 'LIST' },
      ],
    }),
    checkTravelCourseLike: builder.query({
      query: (contentId) => `/travel-course-likes/check/${contentId}`,
      providesTags: (result, error, contentId) => [
        { type: 'TravelCourseLike', id: contentId },
      ],
    }),
  }),
})

export const {
  useCreateTravelCourseLikeMutation,
  useGetTravelCourseLikesQuery,
  useDeleteTravelCourseLikeMutation,
  useCheckTravelCourseLikeQuery,
} = travelCourseLikesApi
