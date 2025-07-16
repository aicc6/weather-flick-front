import {
  useGetUserPlansQuery,
  useDeleteTravelPlanMutation,
} from '@/store/api/travelPlansApi'
import { Link } from 'react-router-dom'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Calendar,
  ChevronRight,
  PlusCircle,
  Trash2,
  Filter,
} from '@/components/icons'
import LoadingSpinner from '@/components/LoadingSpinner'
import { toast } from 'sonner'

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function TravelPlansPage() {
  // 디버깅을 위한 로그인 상태 확인
  React.useEffect(() => {
    const token = localStorage.getItem('access_token')
    const userInfo = localStorage.getItem('user_info')
    console.log('🔍 로그인 상태 디버깅:')
    console.log('- Access Token:', token ? '존재함' : '없음')
    console.log('- User Info:', userInfo ? '존재함' : '없음')
    if (token) {
      console.log('- Token preview:', token.substring(0, 20) + '...')
      
      // 토큰 유효성 간단 체크
      try {
        console.log('토큰 파싱 시작...')
        const tokenParts = token.split('.')
        console.log('토큰 파츠 개수:', tokenParts.length)
        
        if (tokenParts.length === 3) {
          const payloadBase64 = tokenParts[1]
          console.log('페이로드 Base64:', payloadBase64.substring(0, 20) + '...')
          
          // Base64 디코딩
          const payload = JSON.parse(atob(payloadBase64))
          console.log('토큰 페이로드:', payload)
          
          const now = Math.floor(Date.now() / 1000)
          const exp = payload.exp
          console.log('현재 시간 (Unix):', now)
          console.log('토큰 만료 시간 (Unix):', exp)
          
          const isExpired = exp && exp < now
          console.log('- Token 만료 여부:', isExpired ? '만료됨' : '유효함')
          
          if (isExpired) {
            console.log('⚠️ 토큰이 만료되었습니다. 재로그인이 필요합니다.')
            // 만료된 토큰 정리
            localStorage.removeItem('access_token')
            localStorage.removeItem('user_info')
            localStorage.removeItem('refresh_token')
          }
        } else {
          console.log('⚠️ 잘못된 JWT 토큰 형식입니다.')
        }
      } catch (e) {
        console.log('- Token 파싱 실패:', e.message)
        console.log('- 에러 상세:', e)
      }
    }
  }, [])

  const {
    data: plans,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetUserPlansQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  })
  const [deleteTravelPlan, { isLoading: isDeleting }] =
    useDeleteTravelPlanMutation()
  const [planToDelete, setPlanToDelete] = useState(null)
  const [filterType, setFilterType] = useState('all') // 'all', 'manual', 'custom'

  const filteredPlans = (plans || []).filter((plan) => {
    if (filterType === 'all') return true
    if (filterType === 'custom') return plan.plan_type === 'custom'
    if (filterType === 'manual')
      return !plan.plan_type || plan.plan_type === 'manual'
    return true
  })

  const sortedPlans = filteredPlans
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  const handleDeleteClick = (plan) => {
    setPlanToDelete(plan)

    if (plan.status === 'IN_PROGRESS') {
      toast.info('여행 중인 계획을 삭제하려고 합니다', {
        duration: 2000,
        position: 'bottom-right',
      })
    }
  }

  const handleConfirmDelete = async () => {
    if (!planToDelete) return

    try {
      await deleteTravelPlan(planToDelete.plan_id).unwrap()

      toast.success(`"${planToDelete.title}" 여행 계획이 삭제되었습니다`, {
        duration: 3000,
        position: 'top-center',
        icon: '🗑️',
      })
      setPlanToDelete(null)
    } catch (err) {
      const errorMessage = err?.data?.message || '여행 계획 삭제에 실패했습니다'
      toast.error(errorMessage, {
        duration: 4000,
        position: 'top-center',
        icon: '⚠️',
        description: '잠시 후 다시 시도해 주세요',
      })
      console.error('Failed to delete the plan: ', err)
      setPlanToDelete(null)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner />
          <p className="text-muted-foreground mt-4">
            여행 계획 목록을 불러오는 중...
          </p>
          <p className="text-muted-foreground/70 mt-1 text-sm">
            잠시만 기다려 주세요
          </p>
        </div>
      </div>
    )
  }

  if (isError) {
    // 401 인증 에러 또는 403 권한 에러인 경우 로그인 페이지로 안내
    if (error?.status === 401 || error?.status === 403 || error?.data?.error?.code === 'UNAUTHORIZED') {
      return (
        <div className="container mx-auto p-4 md:p-6">
          <div className="weather-card alert-error p-6 text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-yellow-100 p-3 dark:bg-yellow-900/20">
              <svg
                className="h-6 w-6 text-yellow-600 dark:text-yellow-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold">
              🔐 다시 로그인해주세요
            </h3>
            <p className="mb-2">
              로그인 세션이 만료되었거나 권한이 없습니다.
            </p>
            <p className="mb-4 text-sm text-gray-600">
              계속하려면 다시 로그인해주세요.
            </p>
            <div className="space-x-4">
              <Link
                to="/login"
                className="sunset-button rounded-md px-4 py-2 text-sm font-medium"
              >
                로그인하기
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem('access_token')
                  localStorage.removeItem('user_info')
                  localStorage.removeItem('refresh_token')
                  window.location.reload()
                }}
                className="rounded-md px-4 py-2 text-sm font-medium bg-gray-500 text-white hover:bg-gray-600"
              >
                캐시 정리 후 새로고침
              </button>
              <Link
                to="/"
                className="sunny-button inline-flex items-center rounded-md px-4 py-2 text-sm font-medium"
              >
                홈으로 가기
              </Link>
            </div>
          </div>
        </div>
      )
    }

    // 일반적인 에러인 경우
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="weather-card alert-error p-6 text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 p-3 dark:bg-red-900/20">
            <svg
              className="h-6 w-6 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold">
            여행 계획을 불러올 수 없습니다
          </h3>
          <p className="mb-4">
            일시적인 문제가 발생했습니다. 네트워크 연결을 확인하고 다시 시도해
            주세요.
          </p>
          <div className="space-x-4">
            <button
              onClick={() => refetch()}
              className="sunset-button rounded-md px-4 py-2 text-sm font-medium"
            >
              다시 시도
            </button>
            <Link
              to="/planner"
              className="sunny-button inline-flex items-center rounded-md px-4 py-2 text-sm font-medium"
            >
              <PlusCircle className="mr-2 h-4 w-4" />새 플랜 만들기
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-y-8 p-4 sm:p-8">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-3xl font-bold">나의 여행 플랜</h1>
          <p className="text-muted-foreground mt-2">
            {sortedPlans?.length || 0}개의 여행 계획이 있습니다
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild className="weather-button font-semibold">
            <Link to="/planner">
              <PlusCircle className="mr-2 h-4 w-4" />새 플랜 만들기
            </Link>
          </Button>
          <Button asChild variant="outline" className="font-semibold">
            <Link to="/profile">마이페이지로 돌아가기</Link>
          </Button>
        </div>
      </div>

      {/* 필터 섹션 */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="text-muted-foreground h-4 w-4" />
          <span className="text-sm font-medium">필터:</span>
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="플랜 유형 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <span>전체 플랜</span>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {plans?.length || 0}
                </Badge>
              </div>
            </SelectItem>
            <SelectItem value="manual">
              <div className="flex items-center gap-2">
                <span>직접 작성</span>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {plans?.filter(
                    (p) => !p.plan_type || p.plan_type === 'manual',
                  ).length || 0}
                </Badge>
              </div>
            </SelectItem>
            <SelectItem value="custom">
              <div className="flex items-center gap-2">
                <span>AI 맞춤 추천</span>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {plans?.filter((p) => p.plan_type === 'custom').length || 0}
                </Badge>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <div className="text-muted-foreground ml-auto text-sm">
          {filterType === 'all'
            ? `전체 ${sortedPlans?.length || 0}개 표시 중`
            : filterType === 'manual'
              ? `직접 작성한 ${sortedPlans?.length || 0}개 표시 중`
              : `AI 추천 ${sortedPlans?.length || 0}개 표시 중`}
        </div>
      </div>

      <div>
        {!isLoading && !isError && sortedPlans && sortedPlans.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sortedPlans.map((plan) => (
              <Card key={plan.plan_id} className="weather-card group">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-2">
                        <CardTitle className="group-hover:text-primary text-lg font-semibold transition-colors">
                          {plan.title}
                        </CardTitle>
                        {plan.plan_type === 'custom' && (
                          <Badge variant="secondary" className="text-xs">
                            AI 추천
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {plan.destination || '목적지 미정'}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive h-8 w-8 flex-shrink-0"
                      onClick={() => handleDeleteClick(plan)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <Badge
                    className={`w-fit text-xs font-medium ${
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
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="text-muted-foreground flex items-center text-sm">
                    <Calendar className="text-sky-blue mr-2 h-4 w-4" />
                    <span>
                      {formatDate(plan.start_date)} ~{' '}
                      {formatDate(plan.end_date)}
                    </span>
                  </div>

                  <div className="mt-4">
                    <Button
                      asChild
                      variant="link"
                      className="text-sky-blue-dark hover:text-sky-blue p-0 font-medium"
                    >
                      <Link to={`/travel-plans/${plan.plan_id}`}>
                        자세히 보기
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <div className="weather-card mx-auto max-w-md p-8">
              <div className="mb-6 flex justify-center">
                <div className="bg-sky-blue-light dark:bg-sky-blue/20 flex h-20 w-20 items-center justify-center rounded-full">
                  <Calendar className="text-sky-blue weather-float h-10 w-10" />
                </div>
              </div>
              <h2 className="text-foreground mb-2 text-xl font-semibold">
                아직 여행 계획이 없어요
              </h2>
              <p className="text-muted-foreground mb-6">
                첫 번째 여행을 계획해보세요!
              </p>
              <div className="space-y-3">
                <Button asChild className="sunny-button w-full font-semibold">
                  <Link to="/planner">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    지금 시작하기
                  </Link>
                </Button>
                <button
                  onClick={() => refetch()}
                  className="text-sky-blue-dark hover:text-sky-blue text-sm underline transition-colors"
                >
                  새로고침
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <AlertDialog
        open={!!planToDelete}
        onOpenChange={() => setPlanToDelete(null)}
      >
        <AlertDialogContent className="weather-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              정말 삭제하시겠습니까?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              이 작업은 되돌릴 수 없습니다. &apos;{planToDelete?.title}&apos;
              여행 계획이 영구적으로 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              className="border-cloud-gray"
            >
              취소
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {isDeleting ? '삭제 중...' : '삭제'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
