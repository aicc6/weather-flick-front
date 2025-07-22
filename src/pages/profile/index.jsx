import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContextRTK'
import { useGetUserPlansQuery } from '@/store/api/travelPlansApi'
import { useGetTravelCourseLikesQuery } from '@/store/api/travelCourseLikesApi'
import { useGetUserStatsQuery } from '@/store/api/authApi'
import {
  useGetMyDestinationSavesQuery,
  useGetMyDestinationLikesQuery,
} from '@/store/api/destinationLikesSavesApi'
import { useGetMyTravelCourseSavesQuery } from '@/store/api/travelCourseSavesApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DestinationCard } from '@/components/travel'
import {
  Calendar,
  Heart,
  Mail,
  MapPin,
  Settings,
  ChevronRight,
  Bookmark,
} from '@/components/icons'
import ProfileDebugger from '@/debug/ProfileDebugger'

// 안전한 key 생성 유틸리티 함수
const generateSafeKey = (item, prefix = '', index = 0) => {
  const safeId = item?.id || item?.course_id || item?.plan_id || index
  const safePrefix = prefix ? `${prefix}-` : ''
  return `${safePrefix}${safeId}`
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user: authUser, loading: authLoading, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(true)

  // 사용자 여행 플랜 데이터 가져오기
  const {
    data: userPlans = [],
    isLoading: plansLoading,
    error: plansError,
  } = useGetUserPlansQuery(undefined, {
    skip: !isAuthenticated, // 인증된 사용자만 요청
  })

  // travel_course_likes 테이블에서 사용자별 저장 코스 불러오기
  const {
    data: likedCourses = [],
    isLoading: likesLoading,
    error: likesError,
  } = useGetTravelCourseLikesQuery(authUser?.user_id, {
    skip: !authUser?.user_id,
  })

  // 사용자 통계 정보 가져오기
  const {
    data: userStats = {},
    isLoading: statsLoading,
    error: statsError,
  } = useGetUserStatsQuery(undefined, {
    skip: !isAuthenticated,
  })

  // 저장한 여행지 데이터 가져오기
  const {
    data: savedDestinations = [],
    isLoading: savedLoading,
    refetch: refetchSavedDestinations,
  } = useGetMyDestinationSavesQuery(
    {
      skip: 0,
      limit: 20,
    },
    {
      skip: !isAuthenticated,
    },
  )

  // 좋아요한 여행지 데이터 가져오기 (통계용)
  const { data: likedDestinations = [], isLoading: likedLoading } =
    useGetMyDestinationLikesQuery(
      {
        skip: 0,
        limit: 50,
      },
      {
        skip: !isAuthenticated,
      },
    )

  // 저장한 여행 코스 데이터 가져오기
  const {
    data: savedTravelCourses = [],
    isLoading: savedCoursesLoading,
    refetch: refetchSavedCourses,
  } = useGetMyTravelCourseSavesQuery(
    {
      skip: 0,
      limit: 20,
    },
    {
      skip: !isAuthenticated,
    },
  )

  // 최근 여행 플랜 데이터 가공 (최신순으로 정렬하고 최대 5개만)
  const recentPlans =
    userPlans
      ?.slice()
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5) || []

  // Load additional user data (favorites, etc.)
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // TODO: Replace with actual API calls for favorites
        // Mock favorite places
        // setFavoritePlaces([
        //   { id: 1, name: '한라산' },
        //   { id: 2, name: '성산일출봉' },
        //   { id: 3, name: '해운대해수욕장' },
        // ])
      } catch (error) {
        console.error('사용자 데이터 로드 실패:', error)
      } finally {
        setLoading(false)
      }
    }

    if (authUser) {
      loadUserData()
    } else if (!authLoading) {
      setLoading(false)
    }
  }, [authUser, authLoading])

  const formatDate = (dateString) => {
    if (!dateString) return '날짜 없음'
    try {
      return new Date(dateString).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Asia/Seoul',
      })
    } catch (error) {
      console.warn('날짜 형식 오류:', dateString)
      return '잘못된 날짜'
    }
  }

  const favoritePlaces = likedCourses.map((course) => ({
    id: course.id,
    name: course.title,
    // 필요시 추가 필드
  }))

  if (loading || authLoading || plansLoading || likesLoading || statsLoading) {
    return (
      <div className="bg-background min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-4xl space-y-8">
            <div className="weather-card animate-pulse">
              <div className="p-8">
                <div className="mb-4 h-8 w-32 rounded bg-gray-300"></div>
                <div className="flex items-center space-x-4">
                  <div className="h-20 w-20 rounded-full bg-gray-300"></div>
                  <div className="space-y-2">
                    <div className="h-6 w-48 rounded bg-gray-300"></div>
                    <div className="h-4 w-64 rounded bg-gray-300"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!authUser) {
    return (
      <div className="bg-background min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-4xl">
            <div className="weather-card alert-error p-8 text-center">
              <h2 className="mb-2 text-xl font-bold">사용자 정보 로드 실패</h2>
              <p className="mb-4 text-red-600">
                사용자 정보를 불러올 수 없습니다.
              </p>
              <Button onClick={() => window.location.reload()}>
                다시 시도
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Background Section */}
      <section className="from-sky-blue-light/30 via-sunshine-yellow-light/20 to-sunset-orange-light/30 dark:from-sky-blue/10 dark:via-sunshine-yellow/5 dark:to-sunset-orange/10 relative bg-gradient-to-br py-12">
        {/* Floating weather elements */}
        <div className="bg-sunshine-yellow/20 weather-float absolute top-6 left-10 h-12 w-12 rounded-full"></div>
        <div className="bg-sky-blue/30 weather-bounce absolute top-16 right-16 h-8 w-8 rounded-full"></div>
        <div className="bg-sunset-orange/25 weather-float absolute bottom-8 left-1/4 h-6 w-6 rounded-full"></div>
      </section>

      <div className="relative z-10 container mx-auto -mt-8 px-4">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* 기본 정보 카드 */}
          <Card className="weather-card glass-effect">
            <CardHeader className="pb-6">
              <div className="mb-4 flex items-center justify-between">
                <h1 className="text-foreground text-3xl font-bold">프로필</h1>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/settings')}
                  className="weather-input border-cloud-gray hover:bg-sky-blue-light"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  설정
                </Button>
              </div>

              <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
                <div className="relative">
                  <Avatar className="ring-sky-blue-light dark:ring-sky-blue/30 h-24 w-24 ring-4">
                    <AvatarImage
                      src={authUser?.profile_image}
                      alt={authUser?.nickname}
                    />
                    <AvatarFallback className="bg-sky-blue-light text-sky-blue-dark text-xl font-bold">
                      {authUser?.nickname?.charAt(0) ||
                        authUser?.email?.charAt(0) ||
                        'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex-1">
                  <CardTitle className="text-foreground mb-2 text-2xl">
                    {authUser?.nickname || '사용자'}님
                  </CardTitle>
                  <div className="space-y-2">
                    <div className="text-muted-foreground flex items-center gap-2">
                      <Mail className="text-sky-blue h-4 w-4" />
                      <span>{authUser?.email}</span>
                    </div>
                    <div className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="text-sky-blue h-4 w-4" />
                      <span>가입일: {formatDate(authUser?.created_at)}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {authUser?.preferred_region &&
                      authUser.preferred_region !== 'none' && (
                        <Badge className="weather-cloudy">
                          <MapPin className="mr-1 h-3 w-3" />
                          선호 지역: {authUser.preferred_region}
                        </Badge>
                      )}
                    {authUser?.preferred_theme &&
                      authUser.preferred_theme !== 'none' && (
                        <Badge className="weather-sunny">
                          선호 테마: {authUser.preferred_theme}
                        </Badge>
                      )}
                    {(!authUser?.preferred_region ||
                      authUser.preferred_region === 'none') &&
                      (!authUser?.preferred_theme ||
                        authUser.preferred_theme === 'none') && (
                        <p className="text-muted-foreground text-sm">
                          선호 설정을 추가해보세요! ✨
                        </p>
                      )}
                  </div>
                </div>

                {/* 프로필 편집 버튼 제거 */}
              </div>
            </CardHeader>
          </Card>

          {/* 통계 카드들 */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card className="weather-card text-center">
              <CardContent className="pt-6">
                <div className="mb-4 flex justify-center">
                  <div className="bg-sky-blue-light dark:bg-sky-blue/20 flex h-12 w-12 items-center justify-center rounded-full">
                    <Calendar className="text-sky-blue h-6 w-6" />
                  </div>
                </div>
                <div className="text-foreground mb-1 text-2xl font-bold">
                  {userStats.travel_plans_count || userPlans.length}
                </div>
                <div className="text-muted-foreground text-sm">
                  생성한 여행 플랜
                </div>
              </CardContent>
            </Card>

            <Card className="weather-card text-center">
              <CardContent className="pt-6">
                <div className="mb-4 flex justify-center">
                  <div className="bg-sunset-orange-light dark:bg-sunset-orange/20 flex h-12 w-12 items-center justify-center rounded-full">
                    <Heart className="text-sunset-orange h-6 w-6" />
                  </div>
                </div>
                <div className="text-foreground mb-1 text-2xl font-bold">
                  {userStats.liked_courses_count || likedCourses.length}
                </div>
                <div className="text-muted-foreground text-sm">
                  좋아요한 여행지 수
                </div>
              </CardContent>
            </Card>

            <Card className="weather-card text-center">
              <CardContent className="pt-6">
                <div className="mb-4 flex justify-center">
                  <div className="bg-sunshine-yellow-light dark:bg-sunshine-yellow/20 flex h-12 w-12 items-center justify-center rounded-full">
                    <MapPin className="text-sunshine-yellow-dark h-6 w-6" />
                  </div>
                </div>
                <div className="text-foreground mb-1 text-2xl font-bold">
                  {userStats.visited_regions_count || 0}
                </div>
                <div className="text-muted-foreground text-sm">방문한 도시</div>
              </CardContent>
            </Card>
          </div>

          {/* 최근 여행 플랜 */}
          <Card className="weather-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Calendar className="text-sky-blue h-5 w-5" />
                  최근 여행 플랜
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/travel-plans')}
                  className="text-sky-blue-dark hover:text-sky-blue hover:bg-sky-blue-light/50"
                >
                  전체보기
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {plansError ? (
                <div className="text-muted-foreground py-8 text-center">
                  <Calendar className="mx-auto mb-4 h-12 w-12 opacity-50" />
                  <p className="mb-2">여행 플랜을 불러올 수 없습니다.</p>
                  <p className="text-sm text-red-500">
                    {plansError.data?.message ||
                      '네트워크 오류가 발생했습니다.'}
                  </p>
                </div>
              ) : recentPlans.length > 0 ? (
                <div className="space-y-4">
                  {recentPlans.map((plan, index) => (
                    <div
                      key={generateSafeKey(plan, 'plan', index)}
                      className="weather-card cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                      onClick={() => navigate(`/travel-plans/${plan.plan_id}`)}
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-foreground mb-1 font-semibold">
                              {plan.title || '제목 없는 여행 플랜'}
                            </h4>
                            <p className="text-muted-foreground text-sm">
                              {formatDate(plan.start_date)} ~{' '}
                              {formatDate(plan.end_date)}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge
                              variant={
                                plan.status === 'CONFIRMED' ||
                                plan.status === 'COMPLETED'
                                  ? 'default'
                                  : 'secondary'
                              }
                              className={
                                plan.status === 'CONFIRMED' ||
                                plan.status === 'COMPLETED'
                                  ? 'weather-sunny'
                                  : 'weather-cloudy'
                              }
                            >
                              {plan.status === 'CONFIRMED'
                                ? '확정'
                                : plan.status === 'PLANNING'
                                  ? '계획중'
                                  : plan.status === 'IN_PROGRESS'
                                    ? '여행중'
                                    : plan.status === 'COMPLETED'
                                      ? '완료'
                                      : plan.status === 'CANCELLED'
                                        ? '취소'
                                        : plan.status || '계획중'}
                            </Badge>
                            <ChevronRight className="text-muted-foreground h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground py-8 text-center">
                  <Calendar className="mx-auto mb-4 h-12 w-12 opacity-50" />
                  <p className="mb-2">아직 여행 플랜이 없습니다.</p>
                  <Button
                    variant="outline"
                    className="weather-input"
                    onClick={() => navigate('/planner')}
                  >
                    <Calendar className="mr-2 h-4 w-4" />첫 여행 계획 만들기
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 저장한 여행지 및 코스 */}
          <Card className="weather-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Bookmark className="text-sky-blue h-5 w-5" />
                  저장한 여행지 및 코스
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {savedLoading || savedCoursesLoading ? (
                <div className="text-muted-foreground py-8 text-center">
                  <p>로딩 중...</p>
                </div>
              ) : savedDestinations.length > 0 ||
                savedTravelCourses.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {/* 저장된 여행지 표시 */}
                  {savedDestinations.slice(0, 2).map((save) => (
                    <DestinationCard
                      key={`dest-${save.id}`}
                      destination={save.destination}
                      className="h-full"
                      onRefresh={refetchSavedDestinations}
                    />
                  ))}

                  {/* 저장된 여행 코스 표시 */}
                  {savedTravelCourses.slice(0, 2).map((save) => (
                    <div key={`course-${save.id}`} className="weather-card">
                      <div className="p-4">
                        <div className="mb-2 flex items-start justify-between">
                          <h4 className="text-foreground line-clamp-2 text-sm font-semibold">
                            {save.travel_course?.course_name || '여행 코스'}
                          </h4>
                          <Bookmark className="text-sunshine-yellow ml-2 h-4 w-4 flex-shrink-0" />
                        </div>
                        {save.travel_course?.address && (
                          <p className="text-muted-foreground mb-2 line-clamp-1 text-xs">
                            📍 {save.travel_course.address}
                          </p>
                        )}
                        {save.travel_course?.course_theme && (
                          <Badge variant="outline" className="text-xs">
                            {save.travel_course.course_theme}
                          </Badge>
                        )}
                        <p className="text-muted-foreground mt-2 text-xs">
                          {formatDate(save.created_at)} 저장
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground py-8 text-center">
                  <Bookmark className="mx-auto mb-4 h-12 w-12 opacity-50" />
                  <p className="mb-2">저장한 여행지가 없습니다.</p>
                  <Button
                    variant="outline"
                    className="weather-input"
                    onClick={() => navigate('/recommend')}
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    여행지 둘러보기
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 계정 관리 */}
          {/* (추가로 비밀번호 변경 관련 버튼/링크/섹션도 모두 삭제) */}
        </div>
      </div>

      {/* 개발 환경에서만 디버거 표시 */}
      {import.meta.env.DEV && <ProfileDebugger />}
    </div>
  )
}
