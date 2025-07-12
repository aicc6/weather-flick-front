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
  Grid3X3,
  List,
} from '@/components/icons'
import { getMultipleRegionImages } from '@/services/imageService'
import { useGetReviewsByCourseQuery } from '@/store/api/recommendReviewsApi'
import { useGetTravelCoursesQuery } from '@/store/api/travelCoursesApi'

// 새로운 고도화 컴포넌트들 (선택적 사용)
import QuickFilters from '@/components/recommend/QuickFilters'
import SmartSorting from '@/components/recommend/SmartSorting'

// 기존 컴포넌트
import RecommendCourseCard from './RecommendCourseCard'

// ⭐ 기존 RTK Query 훅 보존
function useCourseRatings(courseIds) {
  const ratings = {}
  courseIds.forEach((id) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data: reviews = [] } = useGetReviewsByCourseQuery(id)
    ratings[id] =
      reviews.length > 0
        ? (
            reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
            reviews.length
          ).toFixed(1)
        : null
  })
  return ratings
}

const EnhancedCompatibleRecommendPage = () => {
  // ===============================
  // 🔵 기존 상태들 - 모두 보존
  // ===============================
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [selectedMonth, setSelectedMonth] = useState('all')
  const [selectedTheme, setSelectedTheme] = useState('all')
  const [images, setImages] = useState({})
  const [imagesLoading, setImagesLoading] = useState(true)

  // ===============================
  // 🟢 새로운 고도화 상태들 - 점진적 추가
  // ===============================
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false)
  const [quickFilters, setQuickFilters] = useState([])
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('recommended')

  // ===============================
  // 🚀 RTK Query로 데이터 가져오기
  // ===============================
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 20

  // RTK Query 훅 사용
  const {
    data: travelCoursesResponse,
    error: apiError,
    isLoading: isApiLoading,
    isError,
    refetch,
  } = useGetTravelCoursesQuery({
    page: currentPage,
    page_size: PAGE_SIZE,
    region_code: selectedRegion !== 'all' ? selectedRegion : undefined,
    course_theme: selectedTheme !== 'all' ? selectedTheme : undefined,
  })

  // API 응답에서 여행 코스 데이터 추출
  const travelCourses = useMemo(() => {
    if (!travelCoursesResponse) return []

    // API 응답 구조에 따라 조정
    if (Array.isArray(travelCoursesResponse)) {
      return travelCoursesResponse
    }

    if (travelCoursesResponse.courses) {
      return travelCoursesResponse.courses
    }

    return []
  }, [travelCoursesResponse])

  // 에러 처리
  const error = useMemo(() => {
    if (isError && apiError) {
      return apiError.message || '여행 코스 데이터를 불러오는데 실패했습니다.'
    }
    return null
  }, [isError, apiError])

  // 로딩 상태
  const isLoading = isApiLoading

  // ===============================
  // 🔵 하드 코딩 데이터 삭제 - API로 대체될 예정
  // ===============================
  // const [travelCourses, setTravelCourses] = useState([])
  // const [isLoading, setIsLoading] = useState(true)
  // const [error, setError] = useState(null)

  // TODO: API 연결 - 여행 코스 데이터를 백엔드에서 가져오기
  // useEffect(() => {
  //   const fetchTravelCourses = async () => {
  //     try {
  //       setIsLoading(true)
  //       setError(null)

  //       // TODO: 실제 API 호출로 대체
  //       // const response = await fetch('/api/travel-courses')
  //       // const data = await response.json()
  //       // setTravelCourses(data)

  //       // 임시로 빈 배열 설정
  //       setTravelCourses([])
  //     } catch (err) {
  //       console.error('여행 코스 데이터 로드 실패:', err)
  //       setError('여행 코스 데이터를 불러오는데 실패했습니다.')
  //     } finally {
  //       setIsLoading(false)
  //     }
  //   }

  //   fetchTravelCourses()
  // }, [])

  // ===============================
  // 🔵 기존 데이터 정의 - 모두 보존
  // ===============================
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

  const themeOptions = [
    { value: 'all', label: '전체 테마' },
    { value: 'nature', label: '🌿 자연' },
    { value: 'city', label: '🏙️ 도시' },
    { value: 'beach', label: '🏖️ 바다' },
    { value: 'history', label: '🏛️ 역사' },
    { value: 'food', label: '🍜 맛집' },
    { value: 'healing', label: '😌 힐링' },
    { value: 'activity', label: '🏃 액티비티' },
  ]

  // ===============================
  // 🔵 기존 이미지 로딩 로직 - 보존
  // ===============================
  useEffect(() => {
    const loadImages = async () => {
      try {
        setImagesLoading(true)

        // region 필드 사용 (regionName 대신)
        const regionCodes = travelCourses
          .map((course) => course.region)
          .filter(Boolean)
        const uniqueRegionCodes = [...new Set(regionCodes)]

        // 지역 코드를 지역명으로 변환
        const regionNamesForImages = uniqueRegionCodes.map(
          (code) => regionNames[code] || code,
        )

        const images = await getMultipleRegionImages(regionNamesForImages)
        setImages(images)
      } catch (error) {
        console.error('❌ 이미지 로드 실패:', error)
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
    loadImages()
  }, [travelCourses]) // travelCourses가 변경될 때마다 다시 실행

  // ===============================
  // 🔵 기존 필터링 로직 - 보존 및 확장
  // ===============================
  const filteredCourses = useMemo(() => {
    return travelCourses.filter((course) => {
      // 기존 검색 로직
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

      // 새로운 빠른 필터 로직 (점진적 추가)
      if (quickFilters.includes('high-rating') && course.rating < 4.0)
        return false
      if (quickFilters.includes('budget') && course.priceValue > 300000)
        return false
      if (quickFilters.includes('popular') && course.popularityScore < 80)
        return false

      return matchesSearch && matchesRegion && matchesMonth && matchesTheme
    })
  }, [
    travelCourses,
    searchQuery,
    selectedRegion,
    selectedMonth,
    selectedTheme,
    quickFilters,
  ])

  // ===============================
  // 🟢 새로운 정렬 로직 (기존과 호환)
  // ===============================
  const sortedCourses = useMemo(() => {
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
          // AI 점수 계산 (새로운 기능)
          const scoreA =
            a.rating * 0.3 + a.weatherScore * 0.2 + a.popularityScore * 0.5
          const scoreB =
            b.rating * 0.3 + b.weatherScore * 0.2 + b.popularityScore * 0.5
          return scoreB - scoreA
        }
        default: // 'recommended'
          return 0
      }
    })
  }, [filteredCourses, sortBy])

  // ===============================
  // 🔵 기존 RTK Query 훅 사용 - 보존
  // ===============================
  const courseIds = sortedCourses.map((c) => c.id)
  const courseRatings = useCourseRatings(courseIds)

  // ===============================
  // 🔵 기존 렌더링 함수들 - 보존
  // ===============================
  const renderSkeletonCards = () => {
    return Array.from({ length: 6 }).map((_, index) => (
      <Card key={`skeleton-${index}`} className="weather-card">
        <div className="relative h-48 animate-pulse overflow-hidden rounded-t-xl bg-gray-200"></div>
        <CardHeader className="pb-3">
          <div className="space-y-2">
            <div className="h-5 animate-pulse rounded bg-gray-200"></div>
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="h-4 animate-pulse rounded bg-gray-200"></div>
            <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200"></div>
          </div>
        </CardContent>
      </Card>
    ))
  }

  const renderCourseCards = () => {
    return sortedCourses.map((course) => (
      <RecommendCourseCard
        key={course.id}
        course={course}
        imageUrl={
          images[regionNames[course.region] || course.region] ||
          `https://picsum.photos/800/600?random=${course.id}`
        }
        rating={courseRatings[course.id] ?? course.rating}
        viewMode={viewMode}
      />
    ))
  }

  // ===============================
  // 🟢 새로운 핸들러들
  // ===============================
  const handleAdvancedToggle = useCallback(() => {
    setShowAdvancedFeatures(!showAdvancedFeatures)
  }, [showAdvancedFeatures])

  const handleSortChange = useCallback((sortConfig) => {
    setSortBy(sortConfig.field)
  }, [])

  return (
    <div className="bg-background min-h-screen">
      {/* 🔵 기존 Hero Section - 보존하되 고도화 버튼 추가 */}
      <section className="page-destinations relative py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-8">
            <h1 className="text-foreground mb-4 text-4xl font-bold">
              여행지 추천
              {showAdvancedFeatures && (
                <span className="ml-2 text-2xl">✨</span>
              )}
            </h1>
            <p className="text-muted-foreground text-lg">
              {showAdvancedFeatures
                ? '고도화된 AI 추천 시스템으로 완벽한 여행을 계획하세요'
                : '한국의 인기있는 대표적인 여행지의 여행 코스를 추천해드립니다'}
            </p>
          </div>

          {/* 🟢 고도화 기능 토글 버튼 */}
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
                  <Grid3X3 className="h-4 w-4" />
                )}
                {viewMode === 'grid' ? '리스트' : '격자'}
              </Button>
            )}
          </div>

          {/* 🔵 기존 검색 및 필터 섹션 - 보존 */}
          <div className="weather-card glass-effect mx-auto max-w-4xl p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {/* Search Input */}
              <div className="relative">
                <Search
                  className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
                  style={{ color: 'var(--primary-blue)' }}
                />
                <Input
                  placeholder="여행지나 키워드 검색"
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
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              {/* Month Filter */}
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="form-input">
                  <SelectValue placeholder="여행 시기" />
                </SelectTrigger>
                <SelectContent className="weather-card">
                  {monthNames.map((month, index) => (
                    <SelectItem
                      key={index}
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
                  {themeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 🔵 기존 필터 요약 - 보존 */}
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                총 {sortedCourses.length}개의 여행 코스를 찾았습니다
              </span>
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
                  }}
                  className="border-border hover:bg-muted"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  필터 초기화
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 🟢 고도화 기능들 (조건부 렌더링) */}
      {showAdvancedFeatures && (
        <section className="container mx-auto px-4 py-6">
          <div className="space-y-4">
            {/* 빠른 필터 */}
            <QuickFilters
              onFilterChange={setQuickFilters}
              activeFilters={quickFilters}
            />

            {/* 스마트 정렬 */}
            <SmartSorting
              currentSort={sortBy}
              onSortChange={handleSortChange}
              totalResults={sortedCourses.length}
            />
          </div>
        </section>
      )}

      {/* 🔵 기존 코스 그리드 - 보존하되 뷰모드 추가 */}
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
            <p className="text-muted-foreground mb-6">잠시만 기다려주세요</p>
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
              데이터를 불러올 수 없습니다
            </h3>
            <p className="mb-6 text-sm text-red-500">{error}</p>
            <div className="space-y-2">
              <Button
                onClick={() => refetch()}
                className="primary-button w-full font-semibold"
              >
                🔄 다시 시도
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
        ) : filteredCourses.length === 0 ? (
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
                ? '등록된 여행 코스가 없습니다'
                : '검색 결과가 없습니다'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {travelCourses.length === 0
                ? '관리자가 여행 코스를 등록하면 여기에 표시됩니다'
                : '다른 검색어나 필터를 시도해보세요'}
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
                {travelCourses.length === 0 ? '🔄 새로고침' : '전체 코스 보기'}
              </Button>
              {travelCourses.length === 0 && (
                <Button
                  onClick={() => refetch()}
                  variant="outline"
                  className="w-full"
                >
                  데이터 다시 불러오기
                </Button>
              )}
            </div>
          </div>
        ) : (
          // 정상 데이터 표시
          <>
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'
                  : 'space-y-6'
              }
            >
              {imagesLoading ? renderSkeletonCards() : renderCourseCards()}
            </div>

            {/* 페이지네이션 또는 더보기 버튼 */}
            {travelCoursesResponse &&
              travelCoursesResponse.total > filteredCourses.length && (
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
                    {filteredCourses.length} / {travelCoursesResponse.total} 개
                    표시 중
                  </p>
                </div>
              )}
          </>
        )}
      </section>

      {/* 🔵 기존 CTA 섹션 - 보존 */}
      <section className="page-destinations py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="weather-card glass-effect mx-auto max-w-2xl p-8">
            <Sparkles
              className="mx-auto mb-4 h-16 w-16"
              style={{ color: 'var(--accent-cyan-bright)' }}
            />
            <h2 className="text-foreground mb-4 text-3xl font-bold">
              나만의 여행 계획을 세워보세요!
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              AI가 도와주는 맞춤형 여행 일정으로 완벽한 여행을 준비하세요
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                to="/customized-schedule"
                className="primary-button rounded-full px-8 py-3 font-semibold"
              >
                🎯 맞춤 일정 만들기
              </Link>
              <Link
                to="/planner"
                className="accent-button rounded-full px-8 py-3 font-semibold"
              >
                📋 직접 계획하기
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default EnhancedCompatibleRecommendPage
