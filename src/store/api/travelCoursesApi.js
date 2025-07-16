import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseQuery'
import { generateMultipleCourses, generateTravelCourse } from '@/services/tmapCourseService'
import { getMajorCitiesFlat, getPopularCities } from '@/data/majorCities'
import { generateRegionCourse } from '@/services/dynamicRegionService'

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
    content_id: 'id',
    course_name: 'title',
    course_subtitle: 'subtitle',
    course_summary: 'summary',
    overview: 'description',

    // 평점 관련
    average_rating: 'rating',
    review_count: 'reviewCount',
    like_count: 'likeCount',
    view_count: 'viewCount',

    // 테마 관련
    course_theme: 'theme',
    course_themes: 'theme',

    // 이미지 관련
    first_image: 'mainImage',
    course_images: 'images',

    // 기타
    best_months: 'bestMonths',
    required_time: 'duration',
    estimated_price: 'price',
  }

  // 필드명 매핑 적용
  Object.entries(fieldMappings).forEach(([backendField, frontendField]) => {
    if (normalized[backendField] !== undefined) {
      normalized[frontendField] = normalized[backendField]
      delete normalized[backendField]
    }
  })

  // 백엔드 지역 코드를 프론트엔드 지역 코드로 매핑
  if (normalized.region) {
    const regionMapping = {
      // 숫자 코드 → 문자열 코드
      1: 'seoul',
      2: 'busan',
      3: 'daegu',
      4: 'incheon',
      5: 'gwangju',
      6: 'daejeon',
      7: 'ulsan',
      8: 'sejong',
      9: 'gyeonggi',
      10: 'gangwon',
      11: 'chungbuk',
      12: 'chungnam',
      13: 'jeonbuk',
      14: 'jeonnam',
      15: 'gyeongbuk',
      16: 'gyeongnam',
      17: 'jeju',
    }

    normalized.region = regionMapping[normalized.region] || normalized.region
    if (import.meta.env.DEV) {
      console.log(`지역 매핑: ${normalized.region}`)
    }
  }

  // subtitle이 없으면 description에서 생성
  if (!normalized.subtitle && normalized.description) {
    normalized.subtitle = normalized.description.substring(0, 50) + '...'
  }

  // summary가 없으면 description에서 생성
  if (!normalized.summary && normalized.description) {
    normalized.summary = normalized.description.substring(0, 100) + '...'
  }

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
    theme: ['관광'],
  }

  Object.entries(defaultValues).forEach(([field, defaultValue]) => {
    if (
      normalized[field] === undefined ||
      normalized[field] === null ||
      normalized[field] === '' ||
      (Array.isArray(normalized[field]) && normalized[field].length === 0)
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

// 간단한 지역명 매핑 (더미 데이터용)
const getRegionNameFromCode = (regionCode) => {
  const regionMapping = {
    'jeju': '제주',
    'busan': '부산',
    'seoul': '서울',
    'gangneung': '강릉',
    'jeonju': '전주',
    'gyeongju': '경주',
    'yeosu': '여수',
    'sokcho': '속초',
    'tongyeong': '통영',
    'andong': '안동',
    'gapyeong': '가평',
    'damyang': '담양',
    'boseong': '보성',
    'samcheok': '삼척',
    'pyeongchang': '평창',
    'chuncheon': '춘천',
    'pohang': '포항',
    'mokpo': '목포',
    'suncheon': '순천',
    'jinju': '진주',
    'geoje': '거제'
  }
  
  return regionMapping[regionCode] || regionCode
}

// 더미 데이터 생성 함수 - 다양한 지역 코스 생성
const generateDummyCourses = (count) => {
  // 인기 여행지 우선으로 다양한 지역 선택
  const diverseRegions = [
    'jeju', 'busan', 'gangneung', 'jeonju', 'gyeongju', 
    'yeosu', 'sokcho', 'tongyeong', 'andong', 'gapyeong',
    'damyang', 'boseong', 'samcheok', 'pyeongchang', 'chuncheon',
    'pohang', 'mokpo', 'suncheon', 'jinju', 'geoje'
  ]
  
  const themes = [
    ['자연', '힐링'], ['문화', '역사'], ['바다', '휴양'], 
    ['전통', '음식'], ['액티비티', '체험'], ['산악', '트레킹'],
    ['해안', '드라이브'], ['온천', '휴식'], ['축제', '이벤트']
  ]
  
  const durations = ['1박 2일', '2박 3일', '3박 4일', '4박 5일']
  
  // 더 다양한 가격대 생성 함수
  const generateRandomPrice = () => {
    const basePrice = 80000 + Math.floor(Math.random() * 400000) // 80,000 ~ 480,000
    const roundedPrice = Math.round(basePrice / 10000) * 10000 // 만원 단위로 반올림
    return `${roundedPrice.toLocaleString()}원`
  }
  
  // 먼저 모든 지역이 적어도 한 번씩은 나오도록 보장
  const courses = []
  const baseTimestamp = Date.now()
  
  for (let i = 0; i < count; i++) {
    // 처음 20개는 각각 다른 지역으로, 그 이후는 랜덤
    let region, regionIndex
    if (i < diverseRegions.length) {
      regionIndex = i
      region = diverseRegions[i]
    } else {
      regionIndex = Math.floor(Math.random() * diverseRegions.length)
      region = diverseRegions[regionIndex]
    }
    
    const themeSet = themes[i % themes.length]
    const duration = durations[i % durations.length]
    const price = generateRandomPrice()
    const regionName = getRegionNameFromCode(region)
    
    // 디버깅용 로그
    if (import.meta.env.DEV && i < 5) {
      console.log(`코스 ${i}: region=${region}, regionName=${regionName}`)
    }
    
    // 완전히 고유한 ID 생성
    const uniqueId = `dummy_${baseTimestamp}_${i}_${region}_${Math.random().toString(36).substr(2, 5)}`
    
    courses.push({
      id: uniqueId,
      title: `${regionName} ${themeSet[0]} 여행`,
      subtitle: `${regionName}에서 즐기는 ${themeSet[1]} 여행`,
      summary: `${regionName}의 아름다운 ${themeSet[0]}과 문화를 만끽할 수 있는 여행 코스입니다.`,
      description: `${regionName} 지역의 대표적인 관광지들을 둘러보는 ${themeSet[1]} 코스입니다.`,
      region: region,
      duration: duration,
      price: price,
      rating: parseFloat((4.0 + (Math.random() * 1.0)).toFixed(1)), // 4.0-5.0 랜덤, 소수점 1자리
      reviewCount: 30 + Math.floor(Math.random() * 100),
      likeCount: 15 + Math.floor(Math.random() * 50),
      viewCount: 80 + Math.floor(Math.random() * 200),
      theme: themeSet,
      bestMonths: [3, 4, 5, 9, 10, 11],
      mainImage: `https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=${encodeURIComponent(regionName + ' 여행')}`,
      images: [
        `https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=${encodeURIComponent(regionName + ' 여행')}`
      ],
      highlights: [`${regionName} 대표 명소`, `${themeSet[0]} 체험`, '현지 특산품 투어'],
      itinerary: [
        {
          day: 1,
          title: `${regionName} ${themeSet[0]} 투어`,
          activities: [
            { time: '09:00', type: 'transport', place: `${regionName} 역/터미널`, description: '도착 및 이동' },
            { time: '11:00', type: 'attraction', place: `${regionName} 명소`, description: `${themeSet[0]} 관광지 방문` },
            { time: '12:30', type: 'restaurant', place: '현지 맛집', description: '점심 및 현지 음식 체험' },
            { time: '14:30', type: 'attraction', place: `${regionName} ${themeSet[1]} 명소`, description: `${themeSet[1]} 체험` },
            { time: '18:00', type: 'restaurant', place: '저녁 맛집', description: '저녁 식사' }
          ]
        }
      ],
      tips: ['편안한 신발 착용', '카메라 준비', '현지 날씨 확인', '대중교통 정보 사전 확인'],
      includes: ['가이드 투어', '입장료', '중식'],
      excludes: ['숙박비', '개인 경비', '교통비', '저녁 식사'],
      tags: themeSet
    })
  }
  
  if (import.meta.env.DEV) {
    console.log('📋 생성된 전체 더미 코스:', courses.map(c => ({
      id: c.id,
      title: c.title,
      region: c.region
    })))
  }
  
  return courses
}

// 특정 지역의 더미 데이터 생성 함수
const generateRegionSpecificDummyCourses = (regionCode, count) => {
  const regionName = getRegionNameFromCode(regionCode)
  const themes = [['자연', '힐링'], ['문화', '역사'], ['바다', '휴양'], ['전통', '음식'], ['액티비티', '체험']]
  
  // 가격 생성 함수
  const generateRandomPrice = () => {
    const basePrice = 80000 + Math.floor(Math.random() * 400000) // 80,000 ~ 480,000
    const roundedPrice = Math.round(basePrice / 10000) * 10000 // 만원 단위로 반올림
    return `${roundedPrice.toLocaleString()}원`
  }
  
  return Array.from({ length: count }, (_, index) => {
    const themeSet = themes[index % themes.length]
    
    return {
      id: `region_${regionCode}_${Date.now()}_${index}`,
      title: `${regionName} ${themeSet[0]} 코스`,
      subtitle: `${regionName}에서 즐기는 ${themeSet[1]} 여행`,
      summary: `${regionName}의 대표적인 ${themeSet[0]} 명소들을 둘러보는 특별한 여행 코스입니다.`,
      description: `${regionName} 지역의 ${themeSet[0]} 관광지들을 체험할 수 있는 추천 코스입니다.`,
      region: regionCode,
      duration: index === 0 ? '1박 2일' : index === 1 ? '2박 3일' : '3박 4일',
      price: generateRandomPrice(),
      rating: parseFloat((4.0 + (Math.random() * 1.0)).toFixed(1)),
      reviewCount: 30 + (index * 15),
      likeCount: 15 + (index * 8),
      viewCount: 80 + (index * 20),
      theme: themeSet,
      bestMonths: [3, 4, 5, 9, 10, 11],
      mainImage: `https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=${encodeURIComponent(regionName + ' 여행')}`,
      images: [
        `https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=${encodeURIComponent(regionName + ' 여행')}`
      ],
      highlights: [`${regionName} ${themeSet[0]} 명소`, `${themeSet[1]} 체험`, '현지 특산품'],
      itinerary: [
        {
          day: 1,
          title: `${regionName} ${themeSet[0]} 투어`,
          activities: [
            { time: '09:00', type: 'transport', place: `${regionName} 역`, description: '도착' },
            { time: '10:30', type: 'attraction', place: `${regionName} ${themeSet[0]} 명소`, description: `${themeSet[0]} 체험` },
            { time: '12:00', type: 'restaurant', place: '현지 맛집', description: '점심 식사' },
            { time: '14:00', type: 'attraction', place: `${regionName} 관광지`, description: '관광지 방문' },
            { time: '18:00', type: 'restaurant', place: '저녁 맛집', description: '저녁 식사' }
          ]
        }
      ],
      tips: ['현지 교통 정보 확인', '계절별 준비물', '추천 포토존'],
      includes: ['가이드', '입장료', '중식'],
      excludes: ['숙박비', '개인 경비', '교통비'],
      tags: themeSet
    }
  })
}

/**
 * 주요 도시 기반 지역 선택 로직 - 실용적이고 효율적인 지역 추천
 * @param {Set} existingRegions - 이미 존재하는 지역들 (지역 코드)
 * @param {number} maxCount - 최대 생성할 지역 수
 * @returns {Array} 선택된 지역명 배열
 */
const selectRegionsForGeneration = (existingRegions, maxCount = 3) => {
  // 주요 도시 데이터 활용
  const majorCities = getMajorCitiesFlat()
  const popularCities = getPopularCities()
  
  // 코드를 지역명으로 매핑하는 함수 (복잡한 코드 → 실제 지역명)
  const getRegionNameFromCode = (code) => {
    const city = majorCities.find(c => c.code === code)
    if (city) return city.name
    
    // 기존 코드가 단순한 경우 그대로 사용
    const simpleMapping = {
      'seoul': '서울',
      'busan': '부산', 
      'jeju': '제주',
      'daegu': '대구',
      'incheon': '인천',
      'gwangju': '광주',
      'daejeon': '대전',
      'ulsan': '울산',
      'sejong': '세종'
    }
    
    return simpleMapping[code] || code
  }
  
  // 기존 지역들을 지역명으로 변환
  const existingRegionNames = new Set()
  for (const regionCode of existingRegions) {
    existingRegionNames.add(getRegionNameFromCode(regionCode))
  }
  
  // 1순위: 인기 여행지 중 아직 없는 지역
  const availablePopular = popularCities.filter(
    city => !existingRegionNames.has(city.name)
  )
  
  // 2순위: 나머지 주요 도시 중 아직 없는 지역  
  const availableOther = majorCities.filter(
    city => !city.popular && !existingRegionNames.has(city.name)
  )
  
  const selectedRegions = []
  
  // 먼저 인기 여행지부터 선택 (실제 지역명 사용)
  for (const city of availablePopular) {
    if (selectedRegions.length >= maxCount) break
    selectedRegions.push(city.name)
  }
  
  // 부족하면 다른 주요 도시에서 선택 (실제 지역명 사용)
  for (const city of availableOther) {
    if (selectedRegions.length >= maxCount) break
    selectedRegions.push(city.name)
  }
  
  if (import.meta.env.DEV) {
    console.log('주요 도시 기반 지역 선택:', {
      existingCodes: Array.from(existingRegions),
      existingNames: Array.from(existingRegionNames),
      selected: selectedRegions,
      availablePopular: availablePopular.length,
      availableOther: availableOther.length
    })
  }
  
  return selectedRegions
}

export const travelCoursesApi = createApi({
  reducerPath: 'travelCoursesApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['TravelCourse', 'TravelCourseList', 'Regions', 'Themes'],
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
      keepUnusedDataFor: 0, // 캐싱 비활성화 (개발 중 테스트용)
      transformResponse: async (response) => {
        if (import.meta.env.DEV) {
          console.log('원본 API 응답:', response)
        }
        
        const validatedResponse = validateAndSanitizeResponse(
          response,
          TRAVEL_COURSES_LIST_DEFAULTS,
        )

        if (import.meta.env.DEV) {
          console.log('검증된 응답:', validatedResponse)
        }

        // 안정성을 위해 동적 생성 비활성화 - 기본 데이터만 사용
        // TODO: TMAP API 안정화 후 동적 생성 재활성화 예정
        
        // 개발 환경에서는 항상 더미 데이터만 사용 (실제 API 무시)
        if (import.meta.env.DEV) {
          console.log('🔧 개발 모드: 더미 데이터만 사용')
          const dummyCourses = generateDummyCourses(20)
          validatedResponse.courses = dummyCourses
          validatedResponse.total = dummyCourses.length
          console.log('🎯 더미 데이터 강제 사용:', dummyCourses.length, '개')
        } else {
          // 프로덕션에서만 기본 데이터 + 더미 데이터 조합 사용
          if (validatedResponse.courses.length < 20) {
            const needCount = 20 - validatedResponse.courses.length
            console.log(`더미 데이터 ${needCount}개 생성 시작...`)
            
            const dummyCourses = generateDummyCourses(needCount)
            console.log('생성된 더미 데이터:', dummyCourses.length, '개')
            
            validatedResponse.courses = [...validatedResponse.courses, ...dummyCourses]
            validatedResponse.total = validatedResponse.courses.length
          }
        }
        
        if (import.meta.env.DEV) {
          console.log('최종 여행 코스 데이터 로드 완료:', validatedResponse.courses.length, '개')
          console.log('최종 지역별 분포:', validatedResponse.courses.reduce((acc, course) => {
            acc[course.region] = (acc[course.region] || 0) + 1
            return acc
          }, {}))
          console.log('최종 응답 구조:', validatedResponse)
        }

        return validatedResponse
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
      transformResponse: (response, meta, arg) => {
        if (import.meta.env.DEV) {
          console.log('🔍 상세페이지 API 응답:', response)
          console.log('🆔 요청된 courseId:', arg)
        }

        const validatedResponse = validateAndSanitizeResponse(
          response,
          TRAVEL_COURSE_DEFAULTS,
        )

        // 개발 환경에서는 더미 데이터 생성
        if (import.meta.env.DEV) {
          // courseId에서 지역 정보 추출 (더미 데이터 ID 형식: dummy_timestamp_index_region_random)
          const courseId = arg
          let regionCode = 'seoul' // 기본값
          
          if (typeof courseId === 'string' && courseId.includes('_')) {
            const parts = courseId.split('_')
            if (parts.length >= 4) {
              regionCode = parts[3] // 지역 코드 추출
            }
          }
          
          const regionName = getRegionNameFromCode(regionCode)
          
          // 가격 생성 함수 (로컬)
          const generatePrice = () => {
            const basePrice = 80000 + Math.floor(Math.random() * 400000)
            const roundedPrice = Math.round(basePrice / 10000) * 10000
            return `${roundedPrice.toLocaleString()}원`
          }
          
          // 더미 상세 데이터 생성
          const dummyDetailData = {
            id: courseId,
            title: `${regionName} 자연 여행`,
            subtitle: `${regionName}에서 즐기는 힐링 여행`,
            summary: `${regionName}의 아름다운 자연과 문화를 만끽할 수 있는 여행 코스입니다.`,
            description: `${regionName} 지역의 대표적인 관광지들을 둘러보는 힐링 코스입니다.`,
            region: regionCode,
            duration: '2박 3일',
            price: generatePrice(),
            rating: parseFloat((4.0 + (Math.random() * 1.0)).toFixed(1)),
            reviewCount: 30 + Math.floor(Math.random() * 100),
            likeCount: 15 + Math.floor(Math.random() * 50),
            viewCount: 80 + Math.floor(Math.random() * 200),
            theme: ['자연', '힐링'],
            bestMonths: [3, 4, 5, 9, 10, 11],
            mainImage: `https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=${encodeURIComponent(regionName + ' 여행')}`,
            images: [
              `https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=${encodeURIComponent(regionName + ' 여행')}`
            ],
            highlights: [`${regionName} 대표 명소`, '자연 체험', '현지 특산품 투어'],
            itinerary: [
              {
                day: 1,
                title: `${regionName} 자연 투어`,
                activities: [
                  { time: '09:00', type: 'transport', place: `${regionName} 역/터미널`, description: '도착 및 이동' },
                  { time: '11:00', type: 'attraction', place: `${regionName} 명소`, description: '자연 관광지 방문' },
                  { time: '12:30', type: 'restaurant', place: '현지 맛집', description: '점심 및 현지 음식 체험' },
                  { time: '14:30', type: 'attraction', place: `${regionName} 힐링 명소`, description: '힐링 체험' },
                  { time: '18:00', type: 'restaurant', place: '저녁 맛집', description: '저녁 식사' }
                ]
              }
            ],
            tips: ['편안한 신발 착용', '카메라 준비', '현지 날씨 확인', '대중교통 정보 사전 확인'],
            includes: ['가이드 투어', '입장료', '중식'],
            excludes: ['숙박비', '개인 경비', '교통비', '저녁 식사'],
            tags: ['자연', '힐링']
          }
          
          console.log('🎯 상세페이지 더미 데이터 생성:', dummyDetailData)
          return dummyDetailData
        }

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
      keepUnusedDataFor: 0, // 캐싱 비활성화 (개발 중 테스트용)
      transformResponse: async (response, meta, arg) => {
        const validatedResponse = validateAndSanitizeResponse(
          response,
          TRAVEL_COURSES_LIST_DEFAULTS,
        )

        // 개발 환경에서는 항상 더미 데이터만 사용
        if (import.meta.env.DEV) {
          if (arg.region_code && arg.region_code !== 'all') {
            const regionDummyCourses = generateRegionSpecificDummyCourses(arg.region_code, 5)
            validatedResponse.courses = regionDummyCourses
            validatedResponse.total = regionDummyCourses.length
            console.log(`🔧 ${arg.region_code} 지역 더미 데이터:`, regionDummyCourses.length, '개')
          } else {
            const dummyCourses = generateDummyCourses(20)
            validatedResponse.courses = dummyCourses
            validatedResponse.total = dummyCourses.length
            console.log('🔧 검색용 더미 데이터:', dummyCourses.length, '개')
          }
        } else {
          // 프로덕션 로직
          if (arg.region_code && arg.region_code !== 'all' && validatedResponse.courses.length < 3) {
            const regionDummyCourses = generateRegionSpecificDummyCourses(arg.region_code, 3)
            validatedResponse.courses = [...validatedResponse.courses, ...regionDummyCourses]
            validatedResponse.total = validatedResponse.courses.length
          }
          else if (validatedResponse.courses.length < 10) {
            const needCount = 10 - validatedResponse.courses.length
            const dummyCourses = generateDummyCourses(needCount)
            validatedResponse.courses = [...validatedResponse.courses, ...dummyCourses]
            validatedResponse.total = validatedResponse.courses.length
          }
        }
        
        if (import.meta.env.DEV) {
          if (arg.region_code && arg.region_code !== 'all') {
            console.log(`${arg.region_code} 지역 검색 결과:`, validatedResponse.courses.length, '개')
          } else {
            console.log('전체 검색 결과:', validatedResponse.courses.length, '개')
            console.log('지역별 분포:', validatedResponse.courses.reduce((acc, course) => {
              acc[course.region] = (acc[course.region] || 0) + 1
              return acc
            }, {}))
          }
        }

        return validatedResponse
      },
    }),

    // 지역 목록 조회
    getRegions: builder.query({
      query: () => 'travel-courses/regions',
      providesTags: ['Regions'],
      keepUnusedDataFor: 3600, // 1시간 캐싱
      transformResponse: (response) => {
        if (import.meta.env.DEV) {
          console.log('Regions API 응답:', response?.regions?.length || 0, '개')
        }
        return response?.regions || []
      },
    }),

    // 테마 목록 조회
    getThemes: builder.query({
      query: () => 'travel-courses/themes',
      providesTags: ['Themes'],
      keepUnusedDataFor: 3600, // 1시간 캐싱
      transformResponse: (response) => {
        if (import.meta.env.DEV) {
          console.log('Themes API 응답:', response?.themes?.length || 0, '개')
        }
        return response?.themes || []
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
  useGetRegionsQuery,
  useGetThemesQuery,
} = travelCoursesApi
