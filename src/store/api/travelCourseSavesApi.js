import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseQuery'

export const travelCourseSavesApi = createApi({
  reducerPath: 'travelCourseSavesApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['TravelCourseSave', 'TravelCourse', 'TravelCourseList'],
  endpoints: (builder) => ({
    // 여행 코스 저장
    createTravelCourseSave: builder.mutation({
      query: (data) => ({
        url: '/travel-course-saves/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['TravelCourseSave', 'TravelCourse', 'TravelCourseList'],
    }),

    // 여행 코스 저장 취소
    deleteTravelCourseSave: builder.mutation({
      query: (contentId) => ({
        url: `/travel-course-saves/${contentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TravelCourseSave', 'TravelCourse', 'TravelCourseList'],
    }),

    // 내가 저장한 여행 코스 목록 조회
    getMyTravelCourseSaves: builder.query({
      query: ({ skip = 0, limit = 20 } = {}) => ({
        url: '/travel-course-saves/',
        params: { skip, limit },
      }),
      providesTags: ['TravelCourseSave'],
    }),

    // 저장한 여행 코스의 메모 수정
    updateTravelCourseSaveNote: builder.mutation({
      query: ({ contentId, note }) => ({
        url: `/travel-course-saves/${contentId}`,
        method: 'PUT',
        body: { note },
      }),
      invalidatesTags: ['TravelCourseSave'],
    }),
  }),
})

export const {
  useCreateTravelCourseSaveMutation,
  useDeleteTravelCourseSaveMutation,
  useGetMyTravelCourseSavesQuery,
  useUpdateTravelCourseSaveNoteMutation,
} = travelCourseSavesApi
