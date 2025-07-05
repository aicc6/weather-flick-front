import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { WithdrawModal } from '@/components/WithdrawModal'
import {
  Mail,
  Calendar,
  MapPin,
  Heart,
  Settings,
  LogOut,
  Trash2,
  Bell,
  ChevronRight,
  Edit,
} from '@/components/icons'

export function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [recentPlans, setRecentPlans] = useState([])
  const [favoritePlaces, setFavoritePlaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)

  useEffect(() => {
    // 여행 플랜과 즐겨찾기 데이터 로드 (실제 API 호출로 대체)
    const loadUserData = async () => {
      try {
        // 임시 데이터 (실제로는 API에서 가져옴)
        setRecentPlans([
          {
            id: 1,
            title: '제주도 3박4일',
            destination: '제주도',
            startDate: '2025-06-20',
            endDate: '2025-06-23',
            status: 'confirmed',
          },
          {
            id: 2,
            title: '강릉 해변 2박3일',
            destination: '강릉',
            startDate: '2025-07-05',
            endDate: '2025-07-07',
            status: 'planning',
          },
        ])

        setFavoritePlaces([
          { id: 1, name: '제주도', type: 'destination' },
          { id: 2, name: '강릉 해변', type: 'destination' },
          { id: 3, name: '부산 해운대', type: 'destination' },
        ])
      } catch (error) {
        console.error('사용자 데이터 로드 실패:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const handleDeleteAccount = () => {
    setShowWithdrawModal(true)
  }

  const handleWithdrawSuccess = () => {
    // 회원탈퇴 성공 후 홈으로 이동
    navigate('/')
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600">프로필 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-4xl space-y-6">
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
        <Card className="bg-white shadow-lg dark:bg-gray-800">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.profile_image} alt={user?.nickname} />
                  <AvatarFallback className="text-lg">
                    {user?.nickname?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">
                    {user?.nickname || '사용자'}
                  </CardTitle>
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
                className="flex items-center gap-2"
                onClick={() => navigate('/profile/edit')}
              >
                <Edit className="h-4 w-4" />
                편집
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
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
        <Card className="bg-white shadow-lg dark:bg-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                최근 여행 플랜
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/travel-plans')}
              >
                전체보기
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentPlans.length > 0 ? (
              <div className="space-y-3">
                {recentPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <div>
                      <h4 className="font-medium">{plan.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {plan.destination} • {formatDate(plan.startDate)} ~{' '}
                        {formatDate(plan.endDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          plan.status === 'confirmed' ? 'default' : 'secondary'
                        }
                      >
                        {plan.status === 'confirmed' ? '확정' : '계획중'}
                      </Badge>
                      <Button variant="ghost" size="sm">
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
                  className="mt-2"
                  onClick={() => navigate('/travel-plans/create')}
                >
                  첫 여행 플랜 만들기
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 저장한 여행지 */}
        <Card className="bg-white shadow-lg dark:bg-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                저장한 여행지
              </CardTitle>
              <Button variant="ghost" size="sm">
                전체보기
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
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

        {/* 알림 설정 */}
        <Card className="bg-white shadow-lg dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              알림 설정
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">날씨 변화 알림</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    비 예보 시 대체 플랜 자동 알림
                  </p>
                </div>
                <Badge variant="default">ON</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">이메일 알림</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    여행 관련 업데이트 및 추천
                  </p>
                </div>
                <Badge variant="secondary">OFF</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 계정 관리 */}
        <Card className="bg-white shadow-lg dark:bg-gray-800">
          <CardHeader>
            <CardTitle>계정 관리</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => navigate('/change-password')}
              >
                <Settings className="h-4 w-4" />
                비밀번호 변경
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                로그아웃
              </Button>
              <Button
                variant="destructive"
                className="flex items-center gap-2"
                onClick={handleDeleteAccount}
              >
                <Trash2 className="h-4 w-4" />
                회원탈퇴
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 회원탈퇴 모달 */}
      <WithdrawModal 
        open={showWithdrawModal}
        onOpenChange={setShowWithdrawModal}
        onWithdrawSuccess={handleWithdrawSuccess}
      />
    </div>
  )
}
