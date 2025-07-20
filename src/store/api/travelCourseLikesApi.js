import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseQuery'

export const travelCourseLikesApi = createApi({
  reducerPath: 'travelCourseLikesApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['TravelCourseLike', 'TravelCourse', 'TravelCourseList'],
  endpoints: (builder) => ({
    // 새로운 통합 좋아요 토글 API
    toggleTravelCourseLike: builder.mutation({
      query: ({ courseId, courseData }) => ({
        url: `/travel-courses/${courseId}/likes`,
        method: 'PUT',
        body: courseData,
      }),
      invalidatesTags: (result, error, { courseId }) => [
        { type: 'TravelCourseLike', id: courseId },
        { type: 'TravelCourseLike', id: 'LIST' },
        { type: 'TravelCourse', id: courseId },
        'TravelCourse',
        'TravelCourseList',
      ],
    }),
    // 기존 API들은 호환성을 위해 유지하되, 새로운 엔드포인트를 사용하도록 수정
    createTravelCourseLike: builder.mutation({
      query: ({ courseId, courseData }) => ({
        url: `/travel-courses/${courseId}/likes`,
        method: 'PUT',
        body: courseData,
      }),
      invalidatesTags: (result, error, { courseId }) => [
        { type: 'TravelCourseLike', id: courseId },
        { type: 'TravelCourseLike', id: 'LIST' },
        { type: 'TravelCourse', id: courseId },
        'TravelCourse',
        'TravelCourseList',
      ],
    }),
    deleteTravelCourseLike: builder.mutation({
      query: ({ courseId, courseData }) => ({
        url: `/travel-courses/${courseId}/likes`,
        method: 'PUT',
        body: courseData,
      }),
      invalidatesTags: (result, error, { courseId }) => [
        { type: 'TravelCourseLike', id: courseId },
        { type: 'TravelCourseLike', id: 'LIST' },
        { type: 'TravelCourse', id: courseId },
        'TravelCourse',
        'TravelCourseList',
      ],
    }),
  }),
})

export const {
  useToggleTravelCourseLikeMutation,
  useCreateTravelCourseLikeMutation,
  useDeleteTravelCourseLikeMutation,
} = travelCourseLikesApi
