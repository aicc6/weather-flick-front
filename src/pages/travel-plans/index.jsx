import {
  useGetUserPlansQuery,
  useDeleteTravelPlanMutation,
} from '@/store/api/travelPlansApi'
import { Link } from 'react-router-dom'
import { useState } from 'react'
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
import { Calendar, ChevronRight, PlusCircle, Trash2 } from '@/components/icons'
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

  const sortedPlans = (plans || [])
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
    <div className="container mx-auto space-y-8 p-4 md:p-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-3xl font-bold">나의 여행 플랜</h1>
          <p className="text-muted-foreground mt-2">
            {sortedPlans?.length || 0}개의 여행 계획이 있습니다
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild className="weather-button font-semibold text-white">
            <Link to="/planner">
              <PlusCircle className="mr-2 h-4 w-4" />새 플랜 만들기
            </Link>
          </Button>
          <Button asChild variant="outline" className="font-semibold">
            <Link to="/profile">프로필로 돌아가기</Link>
          </Button>
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
                      <CardTitle className="group-hover:text-primary text-lg font-semibold transition-colors">
                        {plan.title}
                      </CardTitle>
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
