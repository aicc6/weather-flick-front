import { useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Settings,
  Grid3X3,
  List,
  TrendingUp,
  Calendar,
  Users,
} from 'lucide-react'

// 새로운 고도화 컴포넌트들 (위에서 생성한 컴포넌트들)
import AdvancedFilters from '@/components/recommend/AdvancedFilters'
import SmartSorting from '@/components/recommend/SmartSorting'
import WeatherRecommendation from '@/components/recommend/WeatherRecommendation'
import PersonalizationSettings from '@/components/recommend/PersonalizationSettings'

// 기존 컴포넌트
import RecommendCourseCard from './RecommendCourseCard'

const EnhancedRecommendPage = () => {
  // 기본 상태
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('grid') // grid, list
  const [currentLocation, setCurrentLocation] = useState('서울시 강남구')

  // 고급 필터 상태
  const [advancedFilters, setAdvancedFilters] = useState({
    priceRange: [0, 1000000],
    minRating: 0,
    travelStyles: [],
    amenities: [],
    weatherOptimized: false,
    newlyAdded: false,
  })

  // 정렬 상태
  const [sortConfig, setSortConfig] = useState({
    field: 'smart',
    direction: 'desc',
  })

  // 개인화 설정
  const [personalSettings, setPersonalSettings] = useState({})
  const [showPersonalization, setShowPersonalization] = useState(false)

  // 모의 여행 코스 데이터 (실제로는 API에서 가져옴)
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
      price: 250000,
      priceLabel: '250,000원',
      bestMonths: [3, 4, 5, 9, 10, 11],
      amenities: ['parking', 'restaurant', 'wifi'],
      travelStyle: 'relaxed',
      weatherScore: 8.5,
      popularityScore: 85,
      isNew: false,
      createdAt: '2024-01-15',
    },
    // ... 더 많은 코스 데이터
  ]

  // 고급 필터링 로직
  const filteredCourses = useMemo(() => {
    return travelCourses.filter((course) => {
      // 기본 검색
      const matchesSearch =
        !searchQuery ||
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.subtitle.toLowerCase().includes(searchQuery.toLowerCase())

      // 가격 필터
      const matchesPrice =
        course.price >= advancedFilters.priceRange[0] &&
        course.price <= advancedFilters.priceRange[1]

      // 평점 필터
      const matchesRating = course.rating >= advancedFilters.minRating

      // 여행 스타일 필터
      const matchesStyle =
        advancedFilters.travelStyles.length === 0 ||
        advancedFilters.travelStyles.includes(course.travelStyle)

      // 편의시설 필터
      const matchesAmenities =
        advancedFilters.amenities.length === 0 ||
        advancedFilters.amenities.every((amenity) =>
          course.amenities.includes(amenity),
        )

      // 날씨 최적화 필터
      const matchesWeather =
        !advancedFilters.weatherOptimized || course.weatherScore >= 7

      // 신규 코스 필터
      const matchesNew = !advancedFilters.newlyAdded || course.isNew

      return (
        matchesSearch &&
        matchesPrice &&
        matchesRating &&
        matchesStyle &&
        matchesAmenities &&
        matchesWeather &&
        matchesNew
      )
    })
  }, [travelCourses, searchQuery, advancedFilters])

  // 스마트 정렬 로직
  const sortedCourses = useMemo(() => {
    return [...filteredCourses].sort((a, b) => {
      let compareValue = 0

      switch (sortConfig.field) {
        case 'smart': {
          // AI 기반 개인화 점수 (실제로는 복잡한 알고리즘)
          const scoreA =
            a.rating * 0.3 + a.weatherScore * 0.2 + a.popularityScore * 0.5
          const scoreB =
            b.rating * 0.3 + b.weatherScore * 0.2 + b.popularityScore * 0.5
          compareValue = scoreB - scoreA
          break
        }
        case 'rating':
          compareValue = b.rating - a.rating
          break
        case 'popularity':
          compareValue = b.popularityScore - a.popularityScore
          break
        case 'recent':
          compareValue = new Date(b.createdAt) - new Date(a.createdAt)
          break
        case 'distance':
          // 실제로는 현재 위치 기반 계산
          compareValue = a.id - b.id
          break
        default:
          compareValue = 0
      }

      return sortConfig.direction === 'desc' ? compareValue : -compareValue
    })
  }, [filteredCourses, sortConfig])

  // 핸들러 함수들
  const handleAdvancedFiltersChange = useCallback((newFilters) => {
    setAdvancedFilters(newFilters)
  }, [])

  const handleFiltersReset = useCallback(() => {
    setAdvancedFilters({
      priceRange: [0, 1000000],
      minRating: 0,
      travelStyles: [],
      amenities: [],
      weatherOptimized: false,
      newlyAdded: false,
    })
  }, [])

  const handleSortChange = useCallback((newSort) => {
    setSortConfig(newSort)
  }, [])

  const handleWeatherRecommendation = useCallback((recommendation) => {
    // 날씨 기반 추천을 필터에 적용
    console.log('Weather recommendation selected:', recommendation)
    setAdvancedFilters((prev) => ({
      ...prev,
      travelStyles: recommendation.themes,
      weatherOptimized: true,
    }))
  }, [])

  const handlePersonalizationSave = useCallback((preferences) => {
    setPersonalSettings(preferences)
    // 실제로는 서버에 저장
    console.log('Personalization saved:', preferences)
  }, [])

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-50 to-indigo-50 py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h1 className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent">
              AI 맞춤 여행지 추천 ✨
            </h1>
            <p className="text-muted-foreground mb-6 text-lg">
              날씨, 선호도, 실시간 데이터를 분석한 개인화 추천 시스템
            </p>

            {/* 실시간 통계 */}
            <div className="flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span>실시간 추천 업데이트</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span>날씨 기반 최적화</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-purple-500" />
                <span>개인화 AI 분석</span>
              </div>
            </div>
          </div>

          {/* 메인 액션 버튼들 */}
          <div className="mb-8 flex justify-center gap-4">
            <Button
              onClick={() => setShowPersonalization(!showPersonalization)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              개인화 설정
            </Button>
            <Button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              variant="outline"
              className="flex items-center gap-2"
            >
              {viewMode === 'grid' ? (
                <List className="h-4 w-4" />
              ) : (
                <Grid3X3 className="h-4 w-4" />
              )}
              {viewMode === 'grid' ? '리스트 보기' : '격자 보기'}
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
          {/* 왼쪽 사이드바: 필터 및 설정 */}
          <div className="space-y-6 xl:col-span-1">
            {/* 날씨 기반 추천 */}
            <WeatherRecommendation
              currentLocation={currentLocation}
              onRecommendationSelect={handleWeatherRecommendation}
            />

            {/* 고급 필터 */}
            <AdvancedFilters
              filters={advancedFilters}
              onFiltersChange={handleAdvancedFiltersChange}
              totalResults={sortedCourses.length}
              onReset={handleFiltersReset}
            />

            {/* 개인화 설정 (토글) */}
            {showPersonalization && (
              <PersonalizationSettings
                userPreferences={personalSettings}
                onPreferencesChange={setPersonalSettings}
                onSave={handlePersonalizationSave}
              />
            )}
          </div>

          {/* 메인 콘텐츠 영역 */}
          <div className="space-y-6 xl:col-span-3">
            {/* 검색 및 정렬 */}
            <div className="space-y-4">
              {/* 스마트 정렬 */}
              <SmartSorting
                currentSort={sortConfig.field}
                onSortChange={handleSortChange}
                totalResults={sortedCourses.length}
              />

              {/* 활성 필터 표시 */}
              {(advancedFilters.travelStyles.length > 0 ||
                advancedFilters.amenities.length > 0 ||
                advancedFilters.weatherOptimized ||
                advancedFilters.newlyAdded) && (
                <div className="bg-muted/50 flex flex-wrap gap-2 rounded-lg p-4">
                  <span className="text-sm font-medium">활성 필터:</span>
                  {advancedFilters.travelStyles.map((style) => (
                    <Badge key={style} variant="secondary">
                      {style}
                    </Badge>
                  ))}
                  {advancedFilters.amenities.map((amenity) => (
                    <Badge key={amenity} variant="secondary">
                      {amenity}
                    </Badge>
                  ))}
                  {advancedFilters.weatherOptimized && (
                    <Badge variant="secondary">🌤️ 날씨 최적화</Badge>
                  )}
                  {advancedFilters.newlyAdded && (
                    <Badge variant="secondary">✨ 신규 코스</Badge>
                  )}
                </div>
              )}
            </div>

            {/* 결과가 없는 경우 */}
            {sortedCourses.length === 0 && (
              <Alert>
                <AlertDescription className="py-8 text-center">
                  <div className="space-y-4">
                    <p className="text-lg">
                      선택한 조건에 맞는 여행 코스가 없습니다 😥
                    </p>
                    <div className="text-muted-foreground space-y-2 text-sm">
                      <p>• 필터 조건을 완화해보세요</p>
                      <p>• 다른 지역이나 테마를 선택해보세요</p>
                      <p>• 개인화 설정을 조정해보세요</p>
                    </div>
                    <Button onClick={handleFiltersReset} className="mt-4">
                      필터 초기화
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* 여행 코스 목록 */}
            {sortedCourses.length > 0 && (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'
                    : 'space-y-4'
                }
              >
                {sortedCourses.map((course) => (
                  <RecommendCourseCard
                    key={course.id}
                    course={course}
                    imageUrl={`https://picsum.photos/800/600?random=${course.id}`}
                    rating={course.rating}
                    viewMode={viewMode}
                    personalizedScore={
                      sortConfig.field === 'smart'
                        ? course.rating * 0.3 +
                          course.weatherScore * 0.2 +
                          course.popularityScore * 0.5
                        : null
                    }
                  />
                ))}
              </div>
            )}

            {/* 더 보기 버튼 (무한 스크롤 대신) */}
            {sortedCourses.length > 0 && (
              <div className="py-8 text-center">
                <Button variant="outline" size="lg">
                  더 많은 여행 코스 보기
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnhancedRecommendPage
