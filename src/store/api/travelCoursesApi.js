import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseQuery'

// 데이터 검증 및 정제 유틸리티
const validateAndSanitizeResponse = (response, expectedStructure = {}) => {
  try {
    // 기본 응답 검증
    if (!response || typeof response !== 'object') {
      return expectedStructure
    }

    // 표준 응답 래퍼 처리
    if (Object.prototype.hasOwnProperty.call(response, 'success')) {
      if (!response.success) {
        console.error('API 응답 오류:', response.error || response)
        return expectedStructure
      }
      response = response.data
    }

    // 응답이 null이거나 undefined인 경우 처리
    if (!response) {
      return expectedStructure
    }

    // 배열 응답인 경우 바로 반환
    if (Array.isArray(response)) {
      return response
    }

    // itinerary 필드가 문자열인 경우 JSON 파싱
    if (response.itinerary && typeof response.itinerary === 'string') {
      try {
        response.itinerary = JSON.parse(response.itinerary)
      } catch (parseError) {
        console.warn('itinerary JSON 파싱 실패:', parseError)
        response.itinerary = []
      }
    }

    // 기본값 적용
    if (expectedStructure && typeof expectedStructure === 'object') {
      Object.keys(expectedStructure).forEach((key) => {
        if (response && typeof response === 'object' && !(key in response)) {
          response[key] = expectedStructure[key]
        }
      })
    }

    return response
  } catch (error) {
    console.error('데이터 검증 중 오류:', error)
    return expectedStructure
  }
}

// 여행 코스 데이터 기본값
const TRAVEL_COURSE_DEFAULTS = {
  id: null,
  title: '여행 코스',
  subtitle: '아름다운 여행지를 만나보세요',
  region: '',
  duration: '2박 3일',
  theme: ['관광'],
  mainImage: '/default-image.jpg',
  images: [],
  rating: 4.5,
  reviewCount: 0,
  likeCount: 0,
  viewCount: 0,
  price: '문의',
  bestMonths: [3, 4, 5, 9, 10, 11],
  summary: '멋진 여행을 즐겨보세요',
  description: '상세한 여행 정보를 확인하세요',
  highlights: [],
  itinerary: [],
  tips: [],
  includes: [],
  excludes: [],
  tags: [],
}

// 여행 코스 목록 기본값
const TRAVEL_COURSES_LIST_DEFAULTS = {
  courses: [],
  total: 0,
  page: 1,
  page_size: 20,
}

export const travelCoursesApi = createApi({
  reducerPath: 'travelCoursesApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['TravelCourse', 'TravelCourseList'],
  endpoints: (builder) => ({
    // 여행 코스 목록 조회
    getTravelCourses: builder.query({
      query: ({
        page = 1,
        page_size = 20,
        region_code,
        course_theme,
      } = {}) => ({
        url: 'travel-courses/',
        params: {
          page,
          page_size,
          ...(region_code && { region_code }),
          ...(course_theme && { course_theme }),
        },
      }),
      providesTags: ['TravelCourseList'],
      keepUnusedDataFor: 300, // 5분간 캐싱
      transformResponse: (response) => {
        return validateAndSanitizeResponse(
          response,
          TRAVEL_COURSES_LIST_DEFAULTS,
        )
      },
      transformErrorResponse: (response) => {
        return {
          status: response.status,
          data: response.data,
          message:
            response.data?.message ||
            '여행 코스 목록을 불러오는 중 오류가 발생했습니다',
        }
      },
    }),

    // 여행 코스 상세 조회
    getTravelCourseDetail: builder.query({
      query: (courseId) => `travel-courses/${courseId}`,
      providesTags: (result, error, courseId) => [
        { type: 'TravelCourse', id: courseId },
      ],
      keepUnusedDataFor: 600, // 10분간 캐싱
      transformResponse: (response) => {
        const validatedResponse = validateAndSanitizeResponse(
          response,
          TRAVEL_COURSE_DEFAULTS,
        )

        return validatedResponse
      },
      transformErrorResponse: (response) => {
        return {
          status: response.status,
          data: response.data,
          message:
            response.data?.message ||
            '여행 코스를 불러오는 중 오류가 발생했습니다',
        }
      },
    }),

    // 지역별 여행 코스 조회
    getCoursesByRegion: builder.query({
      query: ({ region_code, limit = 10 }) => ({
        url: `travel-courses/regions/${region_code}/courses`,
        params: { limit },
      }),
      providesTags: (result, error, { region_code }) => [
        { type: 'TravelCourseList', id: `region-${region_code}` },
      ],
      keepUnusedDataFor: 300, // 5분간 캐싱
      transformResponse: (response) => {
        return validateAndSanitizeResponse(response, {
          region_code: '',
          courses: [],
          total: 0,
        })
      },
      transformErrorResponse: (response) => {
        return {
          status: response.status,
          data: response.data,
          message:
            response.data?.message ||
            '지역별 여행 코스를 불러오는 중 오류가 발생했습니다',
        }
      },
    }),

    // 여행 코스 검색
    searchTravelCourses: builder.query({
      query: ({
        searchQuery,
        region_code,
        theme,
        page = 1,
        page_size = 20,
      }) => ({
        url: 'travel-courses/',
        params: {
          page,
          page_size,
          ...(region_code && { region_code }),
          ...(theme && { course_theme: theme }),
        },
      }),
      providesTags: ['TravelCourseList'],
      keepUnusedDataFor: 180, // 3분간 캐싱
      transformResponse: (response) => {
        return validateAndSanitizeResponse(
          response,
          TRAVEL_COURSES_LIST_DEFAULTS,
        )
      },
    }),
  }),
})

// Hook 내보내기
export const {
  useGetTravelCoursesQuery,
  useGetTravelCourseDetailQuery,
  useGetCoursesByRegionQuery,
  useSearchTravelCoursesQuery,
} = travelCoursesApi
