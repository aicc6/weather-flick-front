import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
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
  Sparkles,
  Settings,
  Grid3x3,
  List,
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
  const PAGE_SIZE = 20

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

  // API 응답 서버 코스 이추출
  const travelCourses = useMemo(() => {
    if (!activeResponse) return []

    // 디버깅: API 응답 구조 로그
    console.log('=== API 응답 디버깅 ===')
    console.log('전체 응답:', activeResponse)
    console.log('응답 타입:', typeof activeResponse)
    console.log('배열인가?', Array.isArray(activeResponse))

    // API 응답 구조 조정
    if (Array.isArray(activeResponse)) {
      console.log('배열 응답 처리, 길이:', activeResponse.length)
      if (activeResponse.length > 0) {
        console.log('배열 첫 번째 아이템:', activeResponse[0])
        console.log('첫 번째 아이템 키들:', Object.keys(activeResponse[0]))
      }
      return activeResponse
    }

    if (activeResponse.courses) {
      console.log(
        'courses 필드에서 데이터 추출, 길이:',
        activeResponse.courses.length,
      )
      if (activeResponse.courses.length > 0) {
        console.log('courses 첫 번째 아이템:', activeResponse.courses[0])
        console.log(
          '첫 번째 course 키들:',
          Object.keys(activeResponse.courses[0]),
        )
      }
      return activeResponse.courses
    }

    console.log('알 수 없는 응답 구조, 빈 배열 반환')
    return []
  }, [activeResponse])

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

        // region 필드 사용 (regionName 대신)
        const regionCodes = travelCourses
          .map((course) => course.region)
          .filter(Boolean)
        const uniqueRegionCodes = [...new Set(regionCodes)]

        console.log('요청 지역 코드:', uniqueRegionCodes)
        console.log('첫 번째 코스 데이터 샘플:', travelCourses[0])

        // 지역 코드를 지역명으로 변환
        const regionNamesForImages = uniqueRegionCodes.map(
          (code) => regionNames[code] || code,
        )

        const images = await getMultipleRegionImages(regionNamesForImages)
        console.log('로드 지역 매핑:', images)

        setImages(images)

        // 코스별로 어떤 지역이 있는지 확인 (디버깅용)
        travelCourses.forEach((course) => {
          const regionDisplayName = regionNames[course.region] || course.region
          console.log(
            `${course.title} - 지역: ${course.region} (${regionDisplayName}) - 이미지: ${images[regionDisplayName]}`,
          )
        })
      } catch (error) {
        console.error('지역 로드 실패:', error)
        // fallback 로직
        const fallbackImages = {}
        travelCourses.forEach((course) => {
          const regionDisplayName = regionNames[course.region] || course.region
          fallbackImages[regionDisplayName] =
            `https://picsum.photos/800/600?random=${course.id}`
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

  // 지역 매핑
  const regionNames = {
    all: '전체',
    seoul: '서울',
    busan: '부산',
    incheon: '인천',
    daegu: '대구',
    daejeon: '대전',
    gwangju: '광주',
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
    gangneung: '강릉',
    gyeongju: '경주',
    jeonju: '전주',
    yeosu: '여수',
  }

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
      // 기존 검색 로직 (보존)
      const matchesSearch =
        searchQuery === '' ||
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.summary.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesRegion =
        selectedRegion === 'all' || course.region === selectedRegion

      const matchesMonth =
        selectedMonth === 'all' ||
        course.bestMonths.includes(parseInt(selectedMonth))

      const matchesTheme =
        selectedTheme === 'all' ||
        course.theme.some((theme) =>
          theme.toLowerCase().includes(selectedTheme.toLowerCase()),
        )

      // 고급 기능 성에 따른 빠른 필터 로직
      if (showAdvancedFeatures) {
        if (quickFilters.includes('high-rating') && course.rating < 4.0)
          return false
        if (quickFilters.includes('budget') && course.priceValue > 300000)
          return false
        if (quickFilters.includes('popular') && course.popularityScore < 80)
          return false
        if (quickFilters.includes('nearby')) {
          // 근처 지역 필터
          const nearbyRegions = ['seoul', 'gyeonggi', 'incheon']
          if (!nearbyRegions.includes(course.region)) return false
        }
        if (quickFilters.includes('weekend')) {
          // 주말 추천
          if (!course.duration.includes('23')) return false
        }
        if (quickFilters.includes('family')) {
          // 가족 여행 친화적인 것들
          const familyThemes = ['자연', '문화', '역사']
          const hasFamilyTheme = course.theme.some((theme) =>
            familyThemes.includes(theme),
          )
          const hasAccessible = course.amenities?.includes('accessible')
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
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating
        case 'popularity':
          return b.likeCount - a.likeCount
        case 'price-low':
          return a.priceValue - b.priceValue
        case 'price-high':
          return b.priceValue - a.priceValue
        case 'smart': {
          // AI 수 계산
          const scoreA =
            a.rating * 0.3 + a.weatherScore * 0.2 + a.popularityScore * 0.5
          const scoreB =
            b.rating * 0.3 + b.weatherScore * 0.2 + b.popularityScore * 0.5
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
      setViewMode('grid')
    }
  }, [showAdvancedFeatures])

  const handleSortChange = useCallback((sortConfig) => {
    setSortBy(sortConfig.field)
  }, [])

  // 스켈레톤 카드 렌더링
  const renderSkeletonCards = () => {
    return Array.from({ length: 6 }).map((_, index) => (
      <Card key={`skeleton-${index}`} className="weather-card">
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

  // 기존 카드 렌더링 (viewMode 기반)
  const renderCourseCards = () => {
    return sortedCourses.map((course, index) => (
      <RecommendCourseCard
        key={generateSafeKey(course, 'course', index)}
        course={course}
        rating={course.rating} // 서버에서 제공하는 기본 평점 사용
        viewMode={viewMode}
      />
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
                ? '고도 된 AI 추천 스타일로 여행 계획을 세우세요'
                : '국내 기준으로 최적의 여행지를 추천드립니다'}
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
            {showAdvancedFeatures && (
              <Button
                onClick={() =>
                  setViewMode(viewMode === 'grid' ? 'list' : 'grid')
                }
                variant="outline"
                className="flex items-center gap-2"
              >
                {viewMode === 'grid' ? (
                  <List className="h-4 w-4" />
                ) : (
                  <Grid3x3 className="h-4 w-4" />
                )}
                {viewMode === 'grid' ? '리스트' : '그리드'}
              </Button>
            )}
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
                  <SelectItem value="all">전체 지역</SelectItem>
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

      {/* Courses Grid */}
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
                <span className="text-3xl">?�️</span>
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
                이번에 불러오기
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
                필터 초기화{' '}
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
                  이번에 불러오기
                </Button>
              )}
            </div>
          </div>
        ) : (
          // 상태 이상 시
          <>
            <div
              className={
                showAdvancedFeatures && viewMode === 'list'
                  ? 'space-y-6'
                  : 'grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'
              }
            >
              {imagesLoading ? renderSkeletonCards() : renderCourseCards()}
            </div>

            {/* 이번에 불러오기 버튼 */}
            {activeResponse && activeResponse.total > sortedCourses.length && (
              <div className="mt-12 text-center">
                <Button
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  variant="outline"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? '로딩 중...' : '더 많은 코스 보기'}
                </Button>
                <p className="text-muted-foreground mt-2 text-sm">
                  {sortedCourses.length} / {activeResponse.total} 중에서{' '}
                </p>
              </div>
            )}
          </>
        )}
      </section>

      {/* Bottom CTA Section */}
      <section className="page-destinations py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="weather-card glass-effect mx-auto max-w-2xl p-8">
            <Sparkles
              className="mx-auto mb-4 h-16 w-16"
              style={{ color: 'var(--accent-cyan-bright)' }}
            />
            <h2 className="text-foreground mb-4 text-3xl font-bold">
              맞춤 여행 계획 워보세요
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              AI가 주는 맞춤 여행 정보로 여행 준비하세요
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                to="/customized-schedule"
                className="primary-button rounded-full px-8 py-3 font-semibold"
              >
                맞춤 여행 정보 만들기
              </Link>
              <Link
                to="/planner"
                className="accent-button rounded-full px-8 py-3 font-semibold"
              >
                직접 계획하기
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
