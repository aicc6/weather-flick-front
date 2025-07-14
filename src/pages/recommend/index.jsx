import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  Filter,
  Settings,
  ChevronLeft,
  ChevronRight,
} from '@/components/icons'
import { getMultipleRegionImages } from '@/services/imageService'
import {
  useGetTravelCoursesQuery,
  useSearchTravelCoursesQuery,
} from '@/store/api/travelCoursesApi'
import useDebounce from '@/hooks/useDebounce'

// 기존 고도 컴포넌트(고급 기능 사용 시 사용)
import QuickFilters from '@/components/recommend/QuickFilters'
import SmartSorting from '@/components/recommend/SmartSorting'

import RecommendCourseCard from './RecommendCourseCard'

// 안전한 key 생성 유틸리티 함수
const generateSafeKey = (item, prefix = '', index = 0) => {
  const safeId = item?.id || item?.course_id || item?.plan_id || index
  const safePrefix = prefix ? `${prefix}-` : ''
  return `${safePrefix}${safeId}`
}

const generateSafeKeyWithValue = (prefix, index, value) => {
  const safePrefix = prefix || 'item'
  const safeIndex = index ?? 0
  const safeValue =
    value
      ?.toString()
      ?.replace(/\s+/g, '-')
      ?.replace(/[^a-zA-Z0-9-_]/g, '') || 'empty'
  return `${safePrefix}-${safeIndex}-${safeValue}`
}

export default function TravelCoursePage() {
  // ===============================
  // 기존 태클- 모두 보존
  // ===============================
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [selectedMonth, setSelectedMonth] = useState('all')
  const [selectedTheme, setSelectedTheme] = useState('all')
  const [images, setImages] = useState({})
  const [imagesLoading, setImagesLoading] = useState(true)

  // ===============================
  // 캐러셀 관련 상태
  // ===============================
  const scrollContainerRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  // ===============================
  // 고도 태클- 고급 기능
  // ===============================
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false)
  const [quickFilters, setQuickFilters] = useState([])
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('recommended')

  // ===============================
  // ?? ?상??RTK Query ?용 - 검???바?싱?조건부 쿼리
  // ===============================
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 50 // 캐러셀용으로 더 많은 데이터 로드

  // 검색 바 입력 시 검색 API 사용, 아니면 목록 API 사용
  const debouncedSearchQuery = useDebounce(searchQuery.trim(), 300)

  // 검색 바 입력 시 검색 API 사용, 아니면 목록 API 사용
  const shouldUseSearch = debouncedSearchQuery.length >= 2

  // ?반 ?행 코스 목록 조회
  const {
    data: travelCoursesResponse,
    error: listError,
    isLoading: isListLoading,
    isError: isListError,
    refetch: refetchList,
  } = useGetTravelCoursesQuery(
    {
      page: currentPage,
      page_size: PAGE_SIZE,
      region_code: selectedRegion !== 'all' ? selectedRegion : undefined,
      course_theme: selectedTheme !== 'all' ? selectedTheme : undefined,
    },
    {
      skip: shouldUseSearch, // 검색 중일 때는 쿼리 건너뛰기
    },
  )

  // 검색 API 사용
  const {
    data: searchResponse,
    error: searchError,
    isLoading: isSearchLoading,
    isError: isSearchError,
    refetch: refetchSearch,
  } = useSearchTravelCoursesQuery(
    {
      searchQuery: debouncedSearchQuery,
      region_code: selectedRegion !== 'all' ? selectedRegion : undefined,
      theme: selectedTheme !== 'all' ? selectedTheme : undefined,
      page: currentPage,
      page_size: PAGE_SIZE,
    },
    {
      skip: !shouldUseSearch, // 검색 중일 때는 쿼리 건너뛰기
    },
  )

  // 재 사용 여부 태그 결정
  const activeResponse = shouldUseSearch
    ? searchResponse
    : travelCoursesResponse
  const activeError = shouldUseSearch ? searchError : listError
  const isActiveLoading = shouldUseSearch ? isSearchLoading : isListLoading
  const isActiveError = shouldUseSearch ? isSearchError : isListError
  const activeRefetch = shouldUseSearch ? refetchSearch : refetchList

  // 응답 데이터에서 courses 추출 (memo 최적화)
  const travelCourses = useMemo(() => {
    console.log('=== API 응답 디버깅 ===')
    console.log('전체 응답:', typeof activeResponse, activeResponse)
    console.log('응답 타입:', typeof activeResponse)
    console.log('배열인가?', Array.isArray(activeResponse))
    console.log('API 타입:', shouldUseSearch ? 'SEARCH' : 'LIST')
    console.log(
      '백엔드 연결 상태:',
      isActiveLoading ? 'Loading...' : 'Complete',
    )

    // 응답이 없거나 null/undefined인 경우
    if (!activeResponse) {
      console.log('❌ 응답이 없음 - 빈 배열 반환')
      return []
    }

    // API 응답 구조 조정 - 안전한 처리
    if (Array.isArray(activeResponse)) {
      console.log('✅ 배열 응답 처리, 길이:', activeResponse.length)
      if (activeResponse.length > 0 && activeResponse[0]) {
        console.log('✅ 배열 첫 번째 아이템:', activeResponse[0])
        console.log(
          '✅ 첫 번째 아이템 키들:',
          Object.keys(activeResponse[0] || {}),
        )
      }
      return activeResponse.filter(Boolean) // null/undefined 아이템 제거
    }

    // courses 필드 확인 - 안전한 처리
    if (activeResponse.courses && Array.isArray(activeResponse.courses)) {
      console.log(
        '✅ courses 필드에서 데이터 추출, 길이:',
        activeResponse.courses.length,
      )
      if (activeResponse.courses.length > 0 && activeResponse.courses[0]) {
        console.log('✅ courses 첫 번째 아이템:', activeResponse.courses[0])
        console.log(
          '✅ 첫 번째 course 키들:',
          Object.keys(activeResponse.courses[0] || {}),
        )
        console.log(
          '✅ 첫 번째 course 지역:',
          activeResponse.courses[0].region_code,
        )
        console.log(
          '✅ 첫 번째 course 제목:',
          activeResponse.courses[0].course_name,
        )
      }
      return activeResponse.courses.filter(Boolean) // null/undefined 아이템 제거
    }

    // 응답이 객체이지만 courses 필드가 없거나 배열이 아닌 경우
    if (typeof activeResponse === 'object') {
      console.log('⚠️ 객체 응답이지만 courses 필드가 유효하지 않음:', {
        hasCourses: 'courses' in activeResponse,
        coursesType: typeof activeResponse.courses,
        isCoursesArray: Array.isArray(activeResponse.courses),
        coursesValue: activeResponse.courses,
        totalCount: activeResponse.total || 'N/A',
      })
    }

    console.log('❌ 알 수 없는 응답 구조, 빈 배열 반환')
    return []
  }, [activeResponse, shouldUseSearch, isActiveLoading])

  // 에러 처리
  const error = useMemo(() => {
    if (isActiveError && activeError) {
      const errorMessage =
        activeError.message || '여행 코스 데이터를 불러오는데 실패했습니다.'
      return shouldUseSearch ? `검색 오류 발생: ${errorMessage}` : errorMessage
    }
    return null
  }, [isActiveError, activeError, shouldUseSearch])

  // 로딩 상태
  const isLoading = isActiveLoading

  // 이번에 불러오기 버튼 클릭 시 페이지 초기화
  useEffect(() => {
    if (currentPage > 1) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [currentPage])

  // 필터 변경 시 페이지 초기화
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedRegion, selectedTheme, debouncedSearchQuery])

  // 지역 로드
  useEffect(() => {
    const loadImages = async () => {
      try {
        setImagesLoading(true)

        // region 필드 사용 - null/undefined 안전 처리
        const regionCodes = travelCourses
          .map((course) => course?.region)
          .filter((region) => region && region !== null && region !== undefined)
        const uniqueRegionCodes = [...new Set(regionCodes)]

        console.log('요청 지역 코드:', uniqueRegionCodes)
        console.log('첫 번째 코스 데이터 샘플:', travelCourses[0])

        // 지역 코드를 지역명으로 변환 - 안전한 매핑
        const regionNamesForImages = uniqueRegionCodes
          .map((code) => {
            const regionName = regionNames[code]
            if (!regionName) {
              console.warn(`알 수 없는 지역 코드: ${code}`)
              return null
            }
            return regionName
          })
          .filter(Boolean) // null/undefined 제거

        // 빈 배열 처리
        if (regionNamesForImages.length === 0) {
          console.warn('유효한 지역이 없어서 기본 이미지 사용')
          setImages({})
          setImagesLoading(false)
          return
        }

        const images = await getMultipleRegionImages(regionNamesForImages)
        console.log('로드 지역 매핑:', images)

        setImages(images)

        // 코스별로 어떤 지역이 있는지 확인 (디버깅용) - 안전한 처리
        travelCourses.forEach((course, index) => {
          const courseRegion = course?.region
          const regionDisplayName = courseRegion
            ? regionNames[courseRegion] || courseRegion
            : '지역 정보 없음'
          const imageUrl =
            regionDisplayName && regionDisplayName !== '지역 정보 없음'
              ? images[regionDisplayName]
              : undefined

          console.log(
            `${course?.title || '제목 없음'} - 지역: ${courseRegion || 'undefined'} (${regionDisplayName}) - 이미지: ${imageUrl || 'undefined'}`,
          )
        })
      } catch (error) {
        console.error('지역 로드 실패:', error)
        // fallback 로직 - 안전한 처리
        const fallbackImages = {}
        travelCourses.forEach((course) => {
          const courseRegion = course?.region
          if (courseRegion) {
            const regionDisplayName = regionNames[courseRegion] || courseRegion
            fallbackImages[regionDisplayName] =
              `https://picsum.photos/800/600?random=${course?.id || Math.random()}`
          }
        })
        setImages(fallbackImages)
      } finally {
        setImagesLoading(false)
      }
    }

    if (travelCourses.length > 0) {
      loadImages()
    }
  }, [travelCourses]) // travelCourses가 변경될 때마다 실행

  // 지역 매핑 - 네이버/티맵 기준 확장 매핑
  const regionNames = {
    // 기본 매핑
    all: '전체',

    // 네이버/티맵 기본 숫자 코드 (행정구역 기준)
    1: '서울',
    2: '부산',
    3: '대구',
    4: '인천',
    5: '광주',
    6: '대전',
    7: '울산',
    8: '세종',

    // 네이버 지도 API 지역 코드 (표준 행정구역 코드)
    11: '서울',
    26: '부산',
    27: '대구',
    28: '인천',
    29: '광주',
    30: '대전',
    31: '울산', // 울산 (31번 통합)
    36: '세종', // 세종 (36번 통합)
    41: '경기',
    42: '강원',
    43: '충북',
    44: '충남',
    45: '전북',
    46: '전남',
    47: '경북',
    48: '경남',
    50: '제주',

    // 도 단위 추가 코드
    32: '강원', // 강원도 대체 코드
    33: '충북', // 충북 대체 코드
    34: '충남', // 충남 대체 코드
    35: '전북', // 전북 대체 코드
    37: '경북', // 경북 대체 코드
    38: '경남', // 경남 대체 코드
    39: '제주', // 제주 대체 코드

    // 티맵 지역 코드
    seoul: '서울',
    busan: '부산',
    daegu: '대구',
    incheon: '인천',
    gwangju: '광주',
    daejeon: '대전',
    ulsan: '울산',
    sejong: '세종',
    gyeonggi: '경기',
    gangwon: '강원',
    chungbuk: '충북',
    chungnam: '충남',
    jeonbuk: '전북',
    jeonnam: '전남',
    gyeongbuk: '경북',
    gyeongnam: '경남',
    jeju: '제주',

    // 관광지 기준 세부 지역
    gangneung: '강릉',
    gyeongju: '경주',
    jeonju: '전주',
    yeosu: '여수',
    sokcho: '속초',
    andong: '안동',
    gongju: '공주',
    buyeo: '부여',
    tongyeong: '통영',
    geoje: '거제',
    namhae: '남해',

    // 추가 네이버/티맵 형태의 지역 코드
    'seoul-city': '서울',
    'busan-city': '부산',
    'gyeonggi-do': '경기',
    'gangwon-do': '강원',
    'jeju-do': '제주',
    'jeju-island': '제주',

    // 영문 지역명 (해외 API 연동 시)
    Seoul: '서울',
    Busan: '부산',
    Jeju: '제주',
    Gyeonggi: '경기',
    Gangwon: '강원',
    Incheon: '인천',
    Daegu: '대구',
    Daejeon: '대전',
    Gwangju: '광주',
    Ulsan: '울산',

    // 구 지역 코드 호환성
    'kr-11': '서울',
    'kr-26': '부산',
    'kr-27': '대구',
    'kr-28': '인천',
    'kr-29': '광주',
    'kr-30': '대전',
    'kr-31': '울산',
    'kr-50': '제주',

    // 기타 가능한 코드들
    'metro-seoul': '서울',
    'metro-busan': '부산',
    'province-gyeonggi': '경기',
    'province-gangwon': '강원',
    'island-jeju': '제주',
  }

  // 더 많은 코스 보기 버튼 클릭 핸들러
  const handleLoadMoreCourses = useCallback(() => {
    setCurrentPage((prev) => prev + 1)

    // 새로운 콘텐츠가 로드될 때 페이지 아래로 스크롤
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth',
      })
    }, 100)
  }, [])

  // 월 배열
  const monthNames = [
    '전체',
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
    '10월',
    '11월',
    '12월',
  ]

  // 테마 옵션
  const themeOptions = [
    { value: 'all', label: '전체 테마' },
    { value: 'nature', label: '자연' },
    { value: 'city', label: '도시' },
    { value: 'beach', label: '바다' },
    { value: 'history', label: '역사' },
    { value: 'food', label: '맛집' },
    { value: 'healing', label: '힐링' },
    { value: 'activity', label: '액티비티' },
  ]

  // ===============================
  // 기존 + 고급 기능에 따른 빠른 필터 로직
  // ===============================
  const filteredCourses = useMemo(() => {
    return travelCourses.filter((course) => {
      // 기존 검색 로직 (보존) - 안전한 처리 추가
      const courseTitle = course?.title || ''
      const courseSubtitle = course?.subtitle || ''
      const courseSummary = course?.summary || ''

      const matchesSearch =
        searchQuery === '' ||
        courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        courseSubtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        courseSummary.toLowerCase().includes(searchQuery.toLowerCase())

      // 지역 필터링 - 안전한 처리
      const courseRegion = course?.region
      const matchesRegion =
        selectedRegion === 'all' ||
        (courseRegion && courseRegion === selectedRegion)

      // 월 필터링 - 안전한 처리
      const courseBestMonths = course?.bestMonths || []
      const matchesMonth =
        selectedMonth === 'all' ||
        (Array.isArray(courseBestMonths) &&
          courseBestMonths.includes(parseInt(selectedMonth)))

      // 테마 필터링 - 안전한 처리
      const courseThemes = course?.theme || []
      const matchesTheme =
        selectedTheme === 'all' ||
        (Array.isArray(courseThemes) &&
          courseThemes.some(
            (theme) =>
              theme &&
              theme.toLowerCase().includes(selectedTheme.toLowerCase()),
          ))

      // 고급 기능에 따른 빠른 필터 로직 - 안전한 처리
      if (showAdvancedFeatures) {
        const courseRating = course?.rating || 0
        const coursePriceValue = course?.priceValue || 0
        const coursePopularityScore = course?.popularityScore || 0
        const courseDuration = course?.duration || ''
        const courseAmenities = course?.amenities || []

        if (quickFilters.includes('high-rating') && courseRating < 4.0)
          return false
        if (quickFilters.includes('budget') && coursePriceValue > 300000)
          return false
        if (quickFilters.includes('popular') && coursePopularityScore < 80)
          return false
        if (quickFilters.includes('nearby')) {
          // 근처 지역 필터
          const nearbyRegions = ['seoul', 'gyeonggi', 'incheon']
          if (!courseRegion || !nearbyRegions.includes(courseRegion))
            return false
        }
        if (quickFilters.includes('weekend')) {
          // 주말 추천
          if (!courseDuration.includes('23')) return false
        }
        if (quickFilters.includes('family')) {
          // 가족 여행 친화적인 것들
          const familyThemes = ['자연', '문화', '역사']
          const hasFamilyTheme =
            Array.isArray(courseThemes) &&
            courseThemes.some((theme) => theme && familyThemes.includes(theme))
          const hasAccessible =
            Array.isArray(courseAmenities) &&
            courseAmenities.includes('accessible')
          if (!hasFamilyTheme && !hasAccessible) return false
        }
      }

      return matchesSearch && matchesRegion && matchesMonth && matchesTheme
    })
  }, [
    travelCourses,
    searchQuery,
    selectedRegion,
    selectedMonth,
    selectedTheme,
    showAdvancedFeatures,
    quickFilters,
  ])

  // ===============================
  // 정렬 로직
  // ===============================
  const sortedCourses = useMemo(() => {
    if (!showAdvancedFeatures || sortBy === 'recommended') {
      // 기본 모드: 기존 서버 데이터 사용
      return filteredCourses
    }

    return [...filteredCourses].sort((a, b) => {
      // 안전한 값 추출
      const aRating = a?.rating || 0
      const bRating = b?.rating || 0
      const aLikeCount = a?.likeCount || 0
      const bLikeCount = b?.likeCount || 0
      const aPriceValue = a?.priceValue || 0
      const bPriceValue = b?.priceValue || 0
      const aWeatherScore = a?.weatherScore || 0
      const bWeatherScore = b?.weatherScore || 0
      const aPopularityScore = a?.popularityScore || 0
      const bPopularityScore = b?.popularityScore || 0

      switch (sortBy) {
        case 'rating':
          return bRating - aRating
        case 'popularity':
          return bLikeCount - aLikeCount
        case 'price-low':
          return aPriceValue - bPriceValue
        case 'price-high':
          return bPriceValue - aPriceValue
        case 'smart': {
          // AI 스코어 계산 - 안전한 처리
          const scoreA =
            aRating * 0.3 + aWeatherScore * 0.2 + aPopularityScore * 0.5
          const scoreB =
            bRating * 0.3 + bWeatherScore * 0.2 + bPopularityScore * 0.5
          return scoreB - scoreA
        }
        default:
          return 0
      }
    })
  }, [filteredCourses, showAdvancedFeatures, sortBy])

  // ===============================
  // 고급 기능 토글 핸들러
  // ===============================
  const handleAdvancedToggle = useCallback(() => {
    setShowAdvancedFeatures(!showAdvancedFeatures)
    // 고급 기능 초기화
    if (showAdvancedFeatures) {
      setQuickFilters([])
      setSortBy('recommended')
    }
  }, [showAdvancedFeatures])

  const handleSortChange = useCallback((sortConfig) => {
    setSortBy(sortConfig.field)
  }, [])

  // ===============================
  // 캐러셀 스크롤 함수들
  // ===============================
  const ITEMS_PER_VIEW = 10 // 한 번에 보여줄 아이템 수
  const CARD_WIDTH = 320 // 카드 너비 (padding 포함)

  const updateScrollButtons = useCallback(() => {
    if (!scrollContainerRef.current) return

    const container = scrollContainerRef.current
    const scrollLeft = container.scrollLeft
    const maxScrollLeft = container.scrollWidth - container.clientWidth

    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < maxScrollLeft - 1) // -1은 부동소수점 오차 보정
  }, [])

  const scrollToIndex = useCallback((index) => {
    if (!scrollContainerRef.current) return

    const container = scrollContainerRef.current
    const scrollAmount = index * CARD_WIDTH

    container.scrollTo({
      left: scrollAmount,
      behavior: 'smooth',
    })

    setCurrentIndex(index)
  }, [])

  const scrollLeft = useCallback(() => {
    const newIndex = Math.max(0, currentIndex - ITEMS_PER_VIEW)
    scrollToIndex(newIndex)
  }, [currentIndex, scrollToIndex])

  const scrollRight = useCallback(() => {
    const maxIndex = Math.max(0, sortedCourses.length - ITEMS_PER_VIEW)
    const newIndex = Math.min(maxIndex, currentIndex + ITEMS_PER_VIEW)
    scrollToIndex(newIndex)
  }, [currentIndex, sortedCourses.length, scrollToIndex])

  // 스크롤 이벤트 리스너
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleScroll = () => {
      updateScrollButtons()
    }

    container.addEventListener('scroll', handleScroll)
    // 초기 상태 업데이트
    updateScrollButtons()

    return () => {
      container.removeEventListener('scroll', handleScroll)
    }
  }, [updateScrollButtons])

  // 데이터 변경 시 스크롤 위치 초기화
  useEffect(() => {
    setCurrentIndex(0)
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' })
    }
  }, [sortedCourses])

  // 스켈레톤 카드 렌더링
  const renderSkeletonCards = () => {
    return Array.from({ length: ITEMS_PER_VIEW }).map((_, index) => (
      <Card
        key={`skeleton-${index}`}
        className="weather-card flex-shrink-0"
        style={{ width: '300px' }}
      >
        <div className="relative h-48 animate-pulse overflow-hidden rounded-t-xl bg-gray-200"></div>
        <CardHeader className="pb-3">
          <div className="space-y-2">
            <div className="h-5 animate-pulse rounded bg-gray-200"></div>
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
          </div>
          <div className="mt-3 flex gap-2">
            <div className="h-6 w-16 animate-pulse rounded-full bg-gray-200"></div>
            <div className="h-6 w-12 animate-pulse rounded-full bg-gray-200"></div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="h-4 animate-pulse rounded bg-gray-200"></div>
            <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200"></div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200"></div>
            <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200"></div>
          </div>
        </CardContent>
      </Card>
    ))
  }

  // 기존 카드 렌더링 (캐러셀용)
  const renderCourseCards = () => {
    return sortedCourses.map((course, index) => (
      <div
        key={generateSafeKey(course, 'course', index)}
        className="flex-shrink-0"
        style={{ width: '300px' }}
      >
        <RecommendCourseCard
          course={course}
          rating={course.rating} // 서버에서 제공하는 기본 평점 사용
          viewMode="grid" // 캐러셀은 항상 grid 모드
        />
      </div>
    ))
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="page-destinations relative py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-8">
            <h1 className="text-foreground mb-4 text-4xl font-bold">
              여행지 추천
              {showAdvancedFeatures && (
                <span className="ml-2 text-2xl">
                  {' '}
                  <Settings className="h-4 w-4" />
                </span>
              )}
            </h1>
            <p className="text-muted-foreground text-lg">
              {showAdvancedFeatures
                ? '고급 AI 추천 기능으로 맞춤형 여행 계획을 세우세요'
                : '국내 최고의 여행지를 가로 스크롤로 편리하게 탐색하세요'}
            </p>
          </div>

          {/* 고도 기능 버튼 */}
          <div className="mb-6 flex justify-center gap-4">
            <Button
              onClick={handleAdvancedToggle}
              variant={showAdvancedFeatures ? 'default' : 'outline'}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              {showAdvancedFeatures ? '기본 모드' : '고급 기능'}
            </Button>
          </div>

          {/* Search and Filter Section */}
          <div className="weather-card glass-effect mx-auto max-w-4xl p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {/* Search Input */}
              <div className="relative">
                <Search
                  className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
                  style={{ color: 'var(--primary-blue)' }}
                />
                <Input
                  placeholder="여행지 이름을 검색하세요"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input pl-10"
                />
              </div>

              {/* Region Filter */}
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="form-input">
                  <SelectValue placeholder="지역 선택" />
                </SelectTrigger>
                <SelectContent className="weather-card">
                  {Object.entries(regionNames)
                    .slice(1)
                    .map(([value, label]) => (
                      <SelectItem
                        key={generateSafeKeyWithValue('region', value, label)}
                        value={value}
                      >
                        {label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              {/* Month Filter */}
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="form-input">
                  <SelectValue placeholder="여행 월" />
                </SelectTrigger>
                <SelectContent className="weather-card">
                  {monthNames.map((month, index) => (
                    <SelectItem
                      key={generateSafeKeyWithValue('month', index, month)}
                      value={index === 0 ? 'all' : index.toString()}
                    >
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Theme Filter */}
              <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                <SelectTrigger className="form-input">
                  <SelectValue placeholder="여행 테마" />
                </SelectTrigger>
                <SelectContent className="weather-card">
                  {themeOptions.map((option, index) => (
                    <SelectItem
                      key={generateSafeKey(option, 'theme', index)}
                      value={option.value}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filter Summary */}
            <div className="mt-4 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  {shouldUseSearch ? (
                    <>
                      <span className="inline-flex items-center gap-1">
                        <strong>&quot;{debouncedSearchQuery}&quot;</strong> 검색
                        결과:
                      </span>
                      {` ${sortedCourses.length}개`}
                    </>
                  ) : (
                    `${sortedCourses.length}개의 여행 코스를 찾았습니다`
                  )}
                </span>
                {isLoading && (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                )}
              </div>
              <div className="flex items-center gap-2">
                {shouldUseSearch && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchQuery('')}
                    className="text-xs"
                  >
                    검색 취소
                  </Button>
                )}
                {(selectedRegion !== 'all' ||
                  selectedMonth !== 'all' ||
                  selectedTheme !== 'all' ||
                  searchQuery ||
                  quickFilters.length > 0) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedRegion('all')
                      setSelectedMonth('all')
                      setSelectedTheme('all')
                      setQuickFilters([])
                      setCurrentPage(1)
                    }}
                    className="border-border hover:bg-muted"
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    필터 초기화{' '}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 고도 기능(조건부 더보기) */}
      {showAdvancedFeatures && (
        <section className="container mx-auto px-4 py-6">
          <div className="space-y-4">
            {/* 빠른 필터 */}
            <QuickFilters
              onFilterChange={setQuickFilters}
              activeFilters={quickFilters}
            />

            {/* 정렬 */}
            <SmartSorting
              currentSort={sortBy}
              onSortChange={handleSortChange}
              totalResults={sortedCourses.length}
            />
          </div>
        </section>
      )}

      {/* Courses Carousel */}
      <section className="container mx-auto px-4 py-12">
        {isLoading ? (
          // 로딩 중
          <div className="weather-card mx-auto max-w-md p-8 text-center">
            <div className="mb-6 flex justify-center">
              <div
                className="flex h-20 w-20 animate-pulse items-center justify-center rounded-full"
                style={{ backgroundColor: 'var(--primary-blue-light)' }}
              >
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              </div>
            </div>
            <h3 className="text-foreground mb-2 text-xl font-semibold">
              여행 코스를 불러오는 중입니다...
            </h3>
            <p className="text-muted-foreground mb-6">기다려주세요</p>
          </div>
        ) : error ? (
          // 에러 발생
          <div className="weather-card mx-auto max-w-md p-8 text-center">
            <div className="mb-6 flex justify-center">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full"
                style={{ backgroundColor: 'var(--accent-red-light)' }}
              >
                <span className="text-3xl">⚠️</span>
              </div>
            </div>
            <h3 className="text-foreground mb-2 text-xl font-semibold">
              여행 코스를 불러오는데 실패했습니다
            </h3>
            <p className="mb-6 text-sm text-red-500">{error}</p>
            <div className="space-y-2">
              <Button
                onClick={() => activeRefetch()}
                className="primary-button w-full font-semibold"
              >
                다시 불러오기
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedRegion('all')
                  setSelectedTheme('all')
                  setSearchQuery('')
                }}
                className="w-full"
              >
                필터 초기화
              </Button>
            </div>
          </div>
        ) : sortedCourses.length === 0 ? (
          // 검색 결과 없음
          <div className="weather-card mx-auto max-w-md p-8 text-center">
            <div className="mb-6 flex justify-center">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full"
                style={{ backgroundColor: 'var(--primary-blue-light)' }}
              >
                <Search
                  className="h-10 w-10"
                  style={{ color: 'var(--primary-blue)' }}
                />
              </div>
            </div>
            <h3 className="text-foreground mb-2 text-xl font-semibold">
              {travelCourses.length === 0
                ? '여행 코스가 없습니다'
                : '검색 결과가 없습니다'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {travelCourses.length === 0
                ? '관리자가 여행 코스를 등록하면 기다려주세요'
                : '다른 검색어를 입력해보세요'}
            </p>
            <div className="space-y-2">
              <Button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedRegion('all')
                  setSelectedMonth('all')
                  setSelectedTheme('all')
                  setQuickFilters([])
                }}
                className="primary-button w-full font-semibold"
              >
                {travelCourses.length === 0 ? '기본 로딩' : '전체 코스 보기'}
              </Button>
              {travelCourses.length === 0 && (
                <Button
                  onClick={() => activeRefetch()}
                  variant="outline"
                  className="w-full"
                >
                  다시 불러오기
                </Button>
              )}
            </div>
          </div>
        ) : (
          // 캐러셀 표시
          <>
            {/* 캐러셀 헤더 */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-foreground text-2xl font-bold">
                  추천 여행 코스
                </h2>
                <p className="text-muted-foreground mt-1">
                  {shouldUseSearch ? (
                    <>
                      <span className="font-medium">
                        &quot;{debouncedSearchQuery}&quot;
                      </span>{' '}
                      검색 결과: {sortedCourses.length}개
                    </>
                  ) : (
                    `총 ${sortedCourses.length}개의 여행 코스`
                  )}
                </p>
              </div>

              {/* 캐러셀 네비게이션 화살표 */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={scrollLeft}
                  disabled={!canScrollLeft}
                  className="h-10 w-10 rounded-full border-2 transition-all hover:scale-105 disabled:opacity-50"
                  aria-label="이전 코스들 보기"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={scrollRight}
                  disabled={!canScrollRight}
                  className="h-10 w-10 rounded-full border-2 transition-all hover:scale-105 disabled:opacity-50"
                  aria-label="다음 코스들 보기"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* 캐러셀 컨테이너 */}
            <div className="relative">
              <div
                ref={scrollContainerRef}
                className="carousel-container flex gap-6 pb-4"
              >
                {imagesLoading ? renderSkeletonCards() : renderCourseCards()}
              </div>

              {/* 그라데이션 페이드 효과 */}
              {canScrollLeft && (
                <div className="carousel-fade-left pointer-events-none absolute top-0 left-0 h-full w-12" />
              )}
              {canScrollRight && (
                <div className="carousel-fade-right pointer-events-none absolute top-0 right-0 h-full w-12" />
              )}
            </div>

            {/* 캐러셀 인디케이터 */}
            {sortedCourses.length > ITEMS_PER_VIEW && (
              <div className="mt-6 flex items-center justify-center gap-2">
                {Array.from({
                  length: Math.ceil(sortedCourses.length / ITEMS_PER_VIEW),
                }).map((_, index) => {
                  const isActive =
                    Math.floor(currentIndex / ITEMS_PER_VIEW) === index
                  return (
                    <button
                      key={index}
                      onClick={() => scrollToIndex(index * ITEMS_PER_VIEW)}
                      className={`h-2 rounded-full transition-all ${
                        isActive
                          ? 'w-8 bg-blue-600'
                          : 'w-2 bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`${index + 1}번째 페이지로 이동`}
                    />
                  )
                })}
              </div>
            )}

            {/* 더 많은 코스 로드 버튼 */}
            {activeResponse && activeResponse.total > sortedCourses.length && (
              <div className="mt-12 text-center">
                <Button
                  onClick={handleLoadMoreCourses}
                  variant="outline"
                  size="lg"
                  disabled={isLoading}
                  className="px-8 py-3"
                >
                  {isLoading ? '로딩 중...' : '더 많은 코스 보기'}
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}
