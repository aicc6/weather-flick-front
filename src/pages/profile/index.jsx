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
          { id: 1, name: '제주도', type: 'destination' },
          { id: 2, name: '강릉 해변', type: 'destination' },
          { id: 3, name: '부산 해운대', type: 'destination' },
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
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600">프로필 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center text-red-500">
          <p>여행 계획을 불러오는 데 실패했습니다.</p>
          <p className="text-sm">{error.toString()}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50/50 px-4 py-6 dark:bg-gray-900">
      <div className="mx-auto max-w-3xl space-y-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            프로필
          </h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            설정
          </Button>
        </div>

        {/* 기본 정보 카드 */}
        <Card className="rounded-2xl border border-gray-200/50 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-md">
                <span className="text-sm font-bold text-white">👤</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                프로필 정보
              </h2>
            </div>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.profile_image} alt={user?.nickname} />
                  <AvatarFallback className="text-lg">
                    {user?.nickname?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-2xl font-bold">
                    {user?.nickname || '사용자'}
                  </h3>
                  <div className="mt-1 flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                    <Mail className="h-4 w-4" />
                    <span>{user?.email}</span>
                  </div>
                  <div className="mt-1 flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span>가입일: {formatDate(user?.created_at)}</span>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 rounded-xl"
                onClick={() => navigate('/profile/edit')}
              >
                <Edit className="h-4 w-4" />
                편집
              </Button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {user?.preferred_region && user.preferred_region !== 'none' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  선호 지역: {user.preferred_region}
                </Badge>
              )}
              {user?.preferred_theme && user.preferred_theme !== 'none' && (
                <Badge variant="secondary">
                  선호 테마: {user.preferred_theme}
                </Badge>
              )}
              {(!user?.preferred_region || user.preferred_region === 'none') &&
                (!user?.preferred_theme || user.preferred_theme === 'none') && (
                  <p className="text-sm text-gray-500">
                    선호 설정을 추가해보세요!
                  </p>
                )}
            </div>
          </CardContent>
        </Card>

        {/* 최근 여행 플랜 */}
        <Card className="rounded-2xl border border-gray-200/50 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-600 shadow-md">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  여행플래너 생성여행
                </h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/travel-plans')}
              >
                전체보기
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            {recentPlans.length > 0 ? (
              <div className="space-y-3">
                {recentPlans.map((plan) => (
                  <div
                    key={plan.plan_id}
                    className="flex items-center justify-between rounded-xl border border-gray-200/50 p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <div>
                      <h4 className="font-medium">{plan.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(plan.start_date)} ~{' '}
                        {formatDate(plan.end_date)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          plan.status === 'CONFIRMED' ? 'default' : 'secondary'
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
                                : '취소'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          navigate(`/travel-plans/${plan.plan_id}`)
                        }
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                <Heart className="mx-auto mb-2 h-12 w-12 opacity-50" />
                <p>아직 여행 플랜이 없습니다.</p>
                <Button
                  variant="outline"
                  className="mt-2 rounded-xl"
                  onClick={() => navigate('/travel-plans/create')}
                >
                  첫 여행 플랜 만들기
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 저장한 여행지 */}
        <Card className="rounded-2xl border border-gray-200/50 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-teal-600 shadow-md">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  저장한 여행지
                </h2>
              </div>
              <Button variant="ghost" size="sm">
                전체보기
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            {favoritePlaces.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {favoritePlaces.map((place) => (
                  <Badge
                    key={place.id}
                    variant="outline"
                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {place.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-gray-500">
                저장한 여행지가 없습니다.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
