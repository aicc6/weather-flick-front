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
import { useGetReviewsByCourseQuery } from '@/store/api/recommendReviewsApi'

// 🟢 새로운 고도화 컴포넌트들 (토글 시에만 사용)
import QuickFilters from '@/components/recommend/QuickFilters'
import SmartSorting from '@/components/recommend/SmartSorting'

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

export default function TravelCoursePage() {
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
  // 🟢 새로운 고도화 상태들 - 토글로 제어
  // ===============================
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false)
  const [quickFilters, setQuickFilters] = useState([])
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('recommended')

  // ===============================
  // 🔵 기존 데이터 - 모두 보존
  // ===============================
  const travelCourses = [
    {
      id: 1,
      title: '제주도 자연 힐링 여행 코스',
      subtitle: '한라산부터 바다까지, 제주의 아름다운 자연을 만나보세요',
      region: 'jeju',
      regionName: '제주도',
      duration: '2박 3일',
      theme: ['자연', '힐링', '관광'],
      rating: 4.5,
      reviewCount: 100,
      likeCount: 200,
      price: '250,000원',
      bestMonths: [3, 4, 5, 9, 10, 11],
      summary:
        '제주도의 대표적인 자연 명소들을 둘러보며 힐링할 수 있는 여행 코스입니다.',
      highlights: [
        '한라산 국립공원',
        '성산일출봉',
        '우도',
        '애월 카페거리',
        '협재해수욕장',
      ],
      itinerary: [
        {
          day: 1,
          title: '제주 도착 및 서부 지역 탐방',
          activities: ['제주국제공항', '협재해수욕장', '애월 카페거리'],
        },
      ],
      tags: ['자연', '힐링', '제주도', '추천코스'],
      // 🟢 고도화 기능을 위한 새로운 속성들
      priceValue: 250000,
      popularityScore: 85,
      weatherScore: 8.5,
      isNew: false,
      amenities: ['parking', 'restaurant', 'wifi'],
    },
    {
      id: 2,
      title: '서울 전통과 현대의 만남',
      subtitle: '경복궁부터 강남까지, 서울의 과거와 현재를 체험하세요',
      region: 'seoul',
      regionName: '서울',
      duration: '2박 3일',
      theme: ['문화', '역사', '도시탐방'],
      rating: 4.6,
      reviewCount: 120,
      likeCount: 250,
      price: '300,000원',
      bestMonths: [3, 4, 5, 9, 10, 11],
      summary:
        '전통 궁궐부터 현대적인 쇼핑가까지, 서울의 다양한 매력을 만끽하는 코스입니다.',
      highlights: ['경복궁', '북촌한옥마을', '명동', '홍대', '동대문'],
      itinerary: [
        {
          day: 1,
          title: '전통 문화 체험',
          activities: ['경복궁', '북촌한옥마을', '인사동'],
        },
      ],
      tags: ['문화', '역사', '서울', '추천코스'],
      // 🟢 고도화 기능을 위한 새로운 속성들
      priceValue: 300000,
      popularityScore: 90,
      weatherScore: 7.5,
      isNew: false,
      amenities: ['wifi', 'restaurant', 'accessible'],
    },
    {
      id: 3,
      title: '부산 바다와 문화 여행',
      subtitle: '해운대부터 감천문화마을까지, 부산의 바다와 문화를 즐기세요',
      region: 'busan',
      regionName: '부산',
      duration: '2박 3일',
      theme: ['해양', '문화', '맛집'],
      rating: 4.6,
      reviewCount: 140,
      likeCount: 300,
      price: '350,000원',
      bestMonths: [3, 4, 5, 9, 10, 11],
      summary:
        '푸른 바다와 알록달록한 문화마을, 신선한 해산물까지 부산의 모든 매력을 담은 코스입니다.',
      highlights: [
        '해운대 해수욕장',
        '감천문화마을',
        '태종대',
        '광안리',
        '자갈치시장',
      ],
      itinerary: [
        {
          day: 1,
          title: '부산 바다와 문화 체험',
          activities: ['해운대 해수욕장', '감천문화마을', '자갈치시장'],
        },
      ],
      tags: ['해양', '문화', '부산', '추천코스'],
      // 🟢 고도화 기능을 위한 새로운 속성들
      priceValue: 350000,
      popularityScore: 95,
      weatherScore: 8.0,
      isNew: false,
      amenities: ['parking', 'restaurant', 'wifi', 'photography'],
    },
    {
      id: 4,
      title: '경주 천년 고도 역사 탐방',
      subtitle: '불국사부터 첨성대까지, 신라의 찬란한 역사를 만나보세요',
      region: 'gyeongju',
      regionName: '경주',
      duration: '2박 3일',
      theme: ['역사', '문화', '유적'],
      rating: 4.4,
      reviewCount: 160,
      likeCount: 350,
      price: '400,000원',
      bestMonths: [3, 4, 5, 9, 10, 11],
      summary:
        '신라 천년의 역사가 살아 숨 쉬는 경주에서 우리나라의 찬란한 문화유산을 체험하는 코스입니다.',
      highlights: ['불국사', '석굴암', '첨성대', '안압지', '대릉원'],
      itinerary: [
        {
          day: 1,
          title: '신라 역사 탐방',
          activities: ['불국사', '석굴암', '첨성대'],
        },
      ],
      tags: ['역사', '문화', '경주', '추천코스'],
      // 🟢 고도화 기능을 위한 새로운 속성들
      priceValue: 400000,
      popularityScore: 80,
      weatherScore: 7.8,
      isNew: false,
      amenities: ['parking', 'accessible', 'restaurant'],
    },
    {
      id: 5,
      title: '강릉 바다와 커피 여행',
      subtitle: '경포대부터 안목해변까지, 강릉의 바다와 커피 문화를 즐기세요',
      region: 'gangneung',
      regionName: '강릉',
      duration: '2박 3일',
      theme: ['해양', '커피', '자연'],
      rating: 4.5,
      reviewCount: 180,
      likeCount: 400,
      price: '450,000원',
      bestMonths: [3, 4, 5, 9, 10, 11],
      summary:
        '동해의 푸른 바다와 향긋한 커피 향이 어우러지는 강릉의 낭만적인 여행 코스입니다.',
      highlights: ['경포대', '안목해변', '정동진', '오죽헌', '강릉커피거리'],
      itinerary: [
        {
          day: 1,
          title: '강릉 바다와 커피',
          activities: ['경포대', '안목해변 커피거리', '정동진'],
        },
      ],
      tags: ['해양', '커피', '강릉', '추천코스'],
      // 🟢 고도화 기능을 위한 새로운 속성들
      priceValue: 450000,
      popularityScore: 88,
      weatherScore: 8.2,
      isNew: true,
      amenities: ['wifi', 'restaurant', 'photography', 'parking'],
    },
    {
      id: 6,
      title: '여수 밤바다와 섬 여행',
      subtitle: '오동도부터 향일암까지, 여수의 아름다운 바다를 만나보세요',
      region: 'yeosu',
      regionName: '여수',
      duration: '2박 3일',
      theme: ['해양', '섬', '야경'],
      rating: 5.0,
      reviewCount: 200,
      likeCount: 450,
      price: '500,000원',
      bestMonths: [3, 4, 5, 9, 10, 11],
      summary:
        '아름다운 밤바다와 신비로운 섬들이 어우러진 여수에서 로맨틱한 바다 여행을 즐기는 코스입니다.',
      highlights: [
        '오동도',
        '향일암',
        '여수 밤바다',
        '돌산대교',
        '만성리해수욕장',
      ],
      itinerary: [
        {
          day: 1,
          title: '여수 밤바다와 섬',
          activities: ['오동도', '향일암', '여수 밤바다'],
        },
      ],
      tags: ['해양', '섬', '여수', '추천코스'],
      // 🟢 고도화 기능을 위한 새로운 속성들
      priceValue: 500000,
      popularityScore: 92,
      weatherScore: 9.0,
      isNew: true,
      amenities: ['parking', 'restaurant', 'wifi', 'photography', 'accessible'],
    },
  ]

  // 이미지 로드
  useEffect(() => {
    const loadImages = async () => {
      try {
        setImagesLoading(true)
        const regionNames = travelCourses.map((course) => course.regionName)
        console.log('🔍 요청할 지역명들:', regionNames)

        const images = await getMultipleRegionImages(regionNames)
        console.log('📸 로드된 이미지 매핑:', images)

        setImages(images)

        // 각 코스별로 어떤 이미지가 할당되었는지 확인
        travelCourses.forEach((course) => {
          console.log(
            `${course.regionName} (ID: ${course.id}) → ${images[course.regionName]}`,
          )
        })
      } catch (error) {
        console.error('❌ 이미지 로드 실패:', error)
        // fallback으로 다른 이미지 사용
        const fallbackImages = {}
        travelCourses.forEach((course) => {
          fallbackImages[course.regionName] =
            `https://picsum.photos/800/600?random=${course.id}`
        })
        setImages(fallbackImages)
      } finally {
        setImagesLoading(false)
      }
    }

    loadImages()
  }, [])

  // 지역 이름 매핑
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

  // 월 이름 배열
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
    { value: 'nature', label: '🌿 자연' },
    { value: 'city', label: '🏙️ 도시' },
    { value: 'beach', label: '🏖️ 바다' },
    { value: 'history', label: '🏛️ 역사' },
    { value: 'food', label: '🍜 맛집' },
    { value: 'healing', label: '😌 힐링' },
    { value: 'activity', label: '�� 액티비티' },
  ]

  // ===============================
  // 🔵 기존 + 🟢 확장된 필터링 로직
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

      // 🟢 새로운 빠른 필터 로직 (고급 기능 활성화 시에만)
      if (showAdvancedFeatures) {
        if (quickFilters.includes('high-rating') && course.rating < 4.0)
          return false
        if (quickFilters.includes('budget') && course.priceValue > 300000)
          return false
        if (quickFilters.includes('popular') && course.popularityScore < 80)
          return false
        if (quickFilters.includes('nearby')) {
          // 실제로는 위치 기반 필터링, 여기서는 서울/경기 지역만
          const nearbyRegions = ['seoul', 'gyeonggi', 'incheon']
          if (!nearbyRegions.includes(course.region)) return false
        }
        if (quickFilters.includes('weekend')) {
          // 주말 추천은 duration이 "2박 3일" 이하인 것들
          if (!course.duration.includes('2박')) return false
        }
        if (quickFilters.includes('family')) {
          // 가족 여행 친화적인 것들 (amenities에 accessible이 있거나 특정 테마)
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
  // 🟢 새로운 정렬 로직
  // ===============================
  const sortedCourses = useMemo(() => {
    if (!showAdvancedFeatures || sortBy === 'recommended') {
      // 기본 모드: 기존 순서 유지
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
          // AI 점수 계산
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
  // 🟢 새로운 핸들러 함수들
  // ===============================
  const handleAdvancedToggle = useCallback(() => {
    setShowAdvancedFeatures(!showAdvancedFeatures)
    // 토글 끌 때 고급 설정들 초기화
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

  // 기존 RTK Query 훅 사용 (변경된 필터링 결과 기준)
  const courseIds = sortedCourses.map((c) => c.id)
  const courseRatings = useCourseRatings(courseIds)

  // 실제 카드 렌더링 (viewMode 지원)
  const renderCourseCards = () => {
    return sortedCourses.map((course) => (
      <RecommendCourseCard
        key={course.id}
        course={course}
        rating={courseRatings[course.id] ?? course.rating}
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
                  <Grid3x3 className="h-4 w-4" />
                )}
                {viewMode === 'grid' ? '리스트' : '격자'}
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

            {/* Filter Summary */}
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

      {/* Courses Grid */}
      <section className="container mx-auto px-4 py-12">
        {sortedCourses.length === 0 && !imagesLoading ? (
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
              검색 결과가 없습니다
            </h3>
            <p className="text-muted-foreground mb-6">
              다른 검색어나 필터를 시도해보세요
            </p>
            <Button
              onClick={() => {
                setSearchQuery('')
                setSelectedRegion('all')
                setSelectedMonth('all')
                setSelectedTheme('all')
                setQuickFilters([])
              }}
              className="primary-button font-semibold"
            >
              전체 코스 보기
            </Button>
          </div>
        ) : (
          <div
            className={
              showAdvancedFeatures && viewMode === 'list'
                ? 'space-y-6'
                : 'grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'
            }
          >
            {imagesLoading ? renderSkeletonCards() : renderCourseCards()}
          </div>
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
