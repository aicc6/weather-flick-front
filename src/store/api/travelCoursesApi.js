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

    // 배열 응답인 경우 각 아이템 정제
    if (Array.isArray(response)) {
      return response.map((item) => normalizeItem(item))
    }

    // 단일 객체인 경우
    if (response.courses && Array.isArray(response.courses)) {
      return {
        ...response,
        courses: response.courses.map((item) => normalizeItem(item)),
      }
    }

    // 단일 course 객체인 경우
    return normalizeItem(response)
  } catch (error) {
    console.error('데이터 검증 중 오류:', error)
    return expectedStructure
  }
}

// 개별 아이템 정규화 함수
const normalizeItem = (item) => {
  if (!item || typeof item !== 'object') {
    return item
  }

  const normalized = { ...item }

  // 필드명 정규화 (백엔드 필드명 → 프론트엔드 필드명)
  const fieldMappings = {
    // 지역 관련
    region_code: 'region',
    region_name: 'regionName',

    // 기본 정보
    course_id: 'id',
    course_title: 'title',
    course_subtitle: 'subtitle',
    course_summary: 'summary',
    course_description: 'description',

    // 평점 관련
    average_rating: 'rating',
    review_count: 'reviewCount',
    like_count: 'likeCount',
    view_count: 'viewCount',

    // 테마 관련
    course_theme: 'theme',
    course_themes: 'theme',

    // 이미지 관련
    main_image: 'mainImage',
    course_images: 'images',

    // 기타
    best_months: 'bestMonths',
    travel_duration: 'duration',
    estimated_price: 'price',
  }

  // 필드명 매핑 적용
  Object.entries(fieldMappings).forEach(([backendField, frontendField]) => {
    if (normalized[backendField] !== undefined) {
      normalized[frontendField] = normalized[backendField]
      delete normalized[backendField]
    }
  })

  // itinerary 필드가 문자열인 경우 JSON 파싱
  if (normalized.itinerary && typeof normalized.itinerary === 'string') {
    try {
      normalized.itinerary = JSON.parse(normalized.itinerary)
    } catch (parseError) {
      console.warn('itinerary JSON 파싱 실패:', parseError)
      normalized.itinerary = []
    }
  }

  // theme 필드가 문자열인 경우 배열로 변환
  if (normalized.theme && typeof normalized.theme === 'string') {
    try {
      // JSON 문자열인 경우
      if (
        normalized.theme.startsWith('[') ||
        normalized.theme.startsWith('{')
      ) {
        normalized.theme = JSON.parse(normalized.theme)
      } else {
        // 콤마로 구분된 문자열인 경우
        normalized.theme = normalized.theme
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      }
    } catch (parseError) {
      console.warn('theme 파싱 실패:', parseError)
      normalized.theme = [normalized.theme] // 단일 문자열을 배열로 변환
    }
  }

  // 배열 필드들이 undefined인 경우 빈 배열로 초기화
  const arrayFields = [
    'theme',
    'images',
    'highlights',
    'tips',
    'includes',
    'excludes',
    'tags',
    'bestMonths',
    'itinerary',
  ]
  arrayFields.forEach((field) => {
    if (!Array.isArray(normalized[field])) {
      normalized[field] = []
    }
  })

  // 숫자 필드들 처리
  const numberFields = ['rating', 'reviewCount', 'likeCount', 'viewCount']
  numberFields.forEach((field) => {
    if (normalized[field] !== undefined) {
      const num = parseFloat(normalized[field])
      normalized[field] = isNaN(num) ? 0 : num
    }
  })

  // 기본값 적용
  const defaultValues = {
    rating: 4.5,
    reviewCount: 0,
    likeCount: 0,
    viewCount: 0,
    price: '문의',
    duration: '2박 3일',
    summary: '멋진 여행을 즐겨보세요',
    description: '상세한 여행 정보를 확인하세요',
  }

  Object.entries(defaultValues).forEach(([field, defaultValue]) => {
    if (
      normalized[field] === undefined ||
      normalized[field] === null ||
      normalized[field] === ''
    ) {
      normalized[field] = defaultValue
    }
  })

  return normalized
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
