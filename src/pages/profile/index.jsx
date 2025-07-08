import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContextRTK'
import { useGetUserPlansQuery } from '@/store/api/travelPlansApi'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Mail,
  Calendar,
  MapPin,
  Heart,
  Settings,
  ChevronRight,
  Edit,
  User,
  Star,
} from '@/components/icons'

export function ProfilePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [favoritePlaces, setFavoritePlaces] = useState([])

  // RTK Query 훅 사용
  const {
    data: plansResponse,
    isLoading,
    isError,
    error,
  } = useGetUserPlansQuery()

  const recentPlans = (plansResponse || [])
    .slice() // 원본 배열 수정을 방지하기 위해 복사본 생성
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 3) // 최신 3개 항목만 선택

  useEffect(() => {
    // 여행 플랜과 즐겨찾기 데이터 로드 (실제 API 호출로 대체)
    const loadUserData = async () => {
      try {
        // 임시 데이터 (실제로는 API에서 가져옴)
        setFavoritePlaces([
          { id: 1, name: '제주도', type: 'destination', rating: 4.8 },
          { id: 2, name: '강릉 해변', type: 'destination', rating: 4.5 },
          { id: 3, name: '부산 해운대', type: 'destination', rating: 4.6 },
        ])
      } catch (error) {
        console.error('사용자 데이터 로드 실패:', error)
      }
    }

    loadUserData()
  }, [])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="bg-sky-blue-light dark:bg-sky-blue/20 weather-glow mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
            <User className="text-sky-blue-dark h-6 w-6 animate-pulse" />
          </div>
          <p className="text-muted-foreground">프로필 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="weather-card alert-error max-w-md p-8 text-center">
          <h3 className="mb-2 text-lg font-semibold">
            프로필 정보를 불러올 수 없습니다
          </h3>
          <p className="text-muted-foreground mb-4 text-sm">
            {error.toString()}
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="sunset-button font-semibold"
          >
            다시 시도
          </Button>
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
                      src={user?.profile_image}
                      alt={user?.nickname}
                    />
                    <AvatarFallback className="bg-sky-blue-light text-sky-blue-dark text-xl font-bold">
                      {user?.nickname?.charAt(0) ||
                        user?.email?.charAt(0) ||
                        'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-sunshine-yellow absolute -right-1 -bottom-1 flex h-8 w-8 items-center justify-center rounded-full">
                    <Star className="text-storm-gray-dark h-4 w-4" />
                  </div>
                </div>

                <div className="flex-1">
                  <CardTitle className="text-foreground mb-2 text-2xl">
                    {user?.nickname || '사용자'}님
                  </CardTitle>
                  <div className="space-y-2">
                    <div className="text-muted-foreground flex items-center gap-2">
                      <Mail className="text-sky-blue h-4 w-4" />
                      <span>{user?.email}</span>
                    </div>
                    <div className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="text-sky-blue h-4 w-4" />
                      <span>가입일: {formatDate(user?.created_at)}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {user?.preferred_region &&
                      user.preferred_region !== 'none' && (
                        <Badge className="weather-cloudy">
                          <MapPin className="mr-1 h-3 w-3" />
                          선호 지역: {user.preferred_region}
                        </Badge>
                      )}
                    {user?.preferred_theme &&
                      user.preferred_theme !== 'none' && (
                        <Badge className="weather-sunny">
                          선호 테마: {user.preferred_theme}
                        </Badge>
                      )}
                    {(!user?.preferred_region ||
                      user.preferred_region === 'none') &&
                      (!user?.preferred_theme ||
                        user.preferred_theme === 'none') && (
                        <p className="text-muted-foreground text-sm">
                          선호 설정을 추가해보세요! ✨
                        </p>
                      )}
                  </div>
                </div>

                <Button
                  onClick={() => navigate('/profile/edit')}
                  className="sunny-button font-semibold"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  편집
                </Button>
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
                  {recentPlans.length}
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
                  {favoritePlaces.length}
                </div>
                <div className="text-muted-foreground text-sm">
                  즐겨찾기 장소
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
                  12
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
              {recentPlans.length > 0 ? (
                <div className="space-y-4">
                  {recentPlans.map((plan) => (
                    <div
                      key={plan.plan_id}
                      className="weather-card cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                      onClick={() => navigate(`/travel-plans/${plan.plan_id}`)}
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-foreground mb-1 font-semibold">
                              {plan.title}
                            </h4>
                            <p className="text-muted-foreground text-sm">
                              {formatDate(plan.start_date)} ~{' '}
                              {formatDate(plan.end_date)}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge
                              className={`${
                                plan.status === 'CONFIRMED'
                                  ? 'weather-sunny'
                                  : plan.status === 'PLANNING'
                                    ? 'weather-cloudy'
                                    : plan.status === 'IN_PROGRESS'
                                      ? 'weather-rainy'
                                      : plan.status === 'COMPLETED'
                                        ? 'weather-sunset'
                                        : 'weather-stormy'
                              }`}
                            >
                              {plan.status === 'CONFIRMED'
                                ? '☀️ 확정'
                                : plan.status === 'PLANNING'
                                  ? '☁️ 계획중'
                                  : plan.status === 'IN_PROGRESS'
                                    ? '🌧️ 여행중'
                                    : plan.status === 'COMPLETED'
                                      ? '🌅 완료'
                                      : '⛈️ 취소'}
                            </Badge>
                            <ChevronRight className="text-muted-foreground h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="bg-sky-blue-light dark:bg-sky-blue/20 flex h-16 w-16 items-center justify-center rounded-full">
                      <Calendar className="text-sky-blue weather-float h-8 w-8" />
                    </div>
                  </div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    아직 여행 플랜이 없어요
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    첫 번째 여행을 계획해보세요!
                  </p>
                  <Button
                    onClick={() => navigate('/planner')}
                    className="sunny-button font-semibold"
                  >
                    여행 계획 세우기
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 즐겨찾기 장소 */}
          <Card className="weather-card">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Heart className="text-sunset-orange h-5 w-5" />
                즐겨찾기 장소
              </CardTitle>
            </CardHeader>
            <CardContent>
              {favoritePlaces.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {favoritePlaces.map((place) => (
                    <div
                      key={place.id}
                      className="weather-card group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="bg-sunset-orange-light dark:bg-sunset-orange/20 flex h-10 w-10 items-center justify-center rounded-full">
                              <MapPin className="text-sunset-orange-dark h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="text-foreground group-hover:text-sunset-orange-dark font-medium transition-colors">
                                {place.name}
                              </h4>
                              <div className="mt-1 flex items-center gap-1">
                                <Star className="text-sunshine-yellow h-3 w-3 fill-current" />
                                <span className="text-muted-foreground text-xs">
                                  {place.rating}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Heart className="text-sunset-orange h-4 w-4 fill-current" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="bg-sunset-orange-light dark:bg-sunset-orange/20 flex h-16 w-16 items-center justify-center rounded-full">
                      <Heart className="text-sunset-orange weather-float h-8 w-8" />
                    </div>
                  </div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    아직 즐겨찾기한 장소가 없어요
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    여행지를 둘러보고 마음에 드는 곳을 저장해보세요!
                  </p>
                  <Button
                    onClick={() => navigate('/recommend')}
                    className="weather-button font-semibold text-white"
                  >
                    여행지 둘러보기
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="weather-card">
            <CardHeader>
              <CardTitle className="text-foreground">빠른 작업</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Button
                  onClick={() => navigate('/planner')}
                  className="sunny-button h-auto justify-start p-4 font-semibold"
                >
                  <Calendar className="mr-3 h-5 w-5" />
                  <div className="text-left">
                    <div>새 여행 계획</div>
                    <div className="text-xs opacity-80">직접 계획하기</div>
                  </div>
                </Button>
                <Button
                  onClick={() => navigate('/customized-schedule')}
                  className="weather-button h-auto justify-start p-4 font-semibold text-white"
                >
                  <Star className="mr-3 h-5 w-5" />
                  <div className="text-left">
                    <div>맞춤 일정</div>
                    <div className="text-xs opacity-80">AI 추천받기</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
