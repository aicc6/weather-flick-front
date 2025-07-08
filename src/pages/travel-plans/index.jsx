import {
  useGetUserPlansQuery,
  useDeleteTravelPlanMutation,
} from '@/store/api/travelPlansApi'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
    // 삭제 확인 전 사용자 안내
    setPlanToDelete(plan)

    // 선택적 안내 메시지 (너무 빈번한 알림 방지)
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

      // 성공 피드백 개선
      toast.success(`"${planToDelete.title}" 여행 계획이 삭제되었습니다`, {
        duration: 3000,
        position: 'top-center',
        icon: '🗑️',
      })
      setPlanToDelete(null)
    } catch (err) {
      // 에러 피드백 개선
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
      <div className="min-h-screen bg-gray-50/50 px-4 py-6 dark:bg-gray-900">
        <div className="mx-auto w-full max-w-6xl">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-100 to-purple-100 shadow-lg">
              <LoadingSpinner />
            </div>
            <p className="font-medium text-gray-600 dark:text-gray-300">
              여행 계획 목록을 불러오는 중...
            </p>
            <p className="mt-1 text-sm text-gray-400">잠시만 기다려 주세요</p>
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50/50 px-4 py-6 dark:bg-gray-900">
        <div className="mx-auto w-full max-w-6xl">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-r from-red-100 to-orange-100 shadow-lg">
              <span className="text-3xl">⚠️</span>
            </div>
            <h3 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-gray-100">
              여행 계획을 불러올 수 없습니다
            </h3>
            <p className="mb-6 max-w-md text-center text-gray-600 dark:text-gray-300">
              일시적인 문제가 발생했습니다. 네트워크 연결을 확인하고 다시 시도해
              주세요.
            </p>
            <div className="flex gap-4">
              <Button
                onClick={() => refetch()}
                className="bg-gradient-to-r from-red-500 to-orange-600 shadow-lg hover:from-red-600 hover:to-orange-700"
              >
                다시 시도
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
              >
                <Link to="/planner">
                  <PlusCircle className="mr-2 h-4 w-4" />새 플랜 만들기
                </Link>
              </Button>
            </div>
          </div>
          {/* eslint-disable-next-line no-undef */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-red-600">
                개발자 정보
              </summary>
              <pre className="mt-2 overflow-auto rounded bg-red-100 p-2 text-xs text-red-800">
                {JSON.stringify(error, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 px-4 py-6 dark:bg-gray-900">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
              나의 여행 플랜
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-300">
              저장된 여행 계획들을 확인하고 관리하세요
            </p>
          </div>
          <Button
            asChild
            className="bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg hover:from-indigo-600 hover:to-purple-700"
          >
            <Link to="/planner">
              <PlusCircle className="mr-2 h-4 w-4" />새 플랜 만들기
            </Link>
          </Button>
        </div>

        <div className="mt-6">
          {!isLoading && !isError && sortedPlans && sortedPlans.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sortedPlans.map((plan) => (
                <Card
                  key={plan.plan_id}
                  className="flex flex-col justify-between rounded-2xl border border-gray-200/50 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-gray-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
                >
                  <div>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="pr-2 leading-tight text-gray-800 dark:text-gray-100">
                          {plan.title}
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 flex-shrink-0 rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                          onClick={() => handleDeleteClick(plan)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                            plan.status === 'CONFIRMED'
                              ? 'border border-green-200 bg-green-100 text-green-700'
                              : plan.status === 'PLANNING'
                                ? 'border border-blue-200 bg-blue-100 text-blue-700'
                                : plan.status === 'IN_PROGRESS'
                                  ? 'border border-purple-200 bg-purple-100 text-purple-700'
                                  : plan.status === 'COMPLETED'
                                    ? 'border border-gray-200 bg-gray-100 text-gray-700'
                                    : 'border border-red-200 bg-red-100 text-red-700'
                          }`}
                        >
                          <div
                            className={`h-2 w-2 rounded-full ${
                              plan.status === 'CONFIRMED'
                                ? 'bg-green-500'
                                : plan.status === 'PLANNING'
                                  ? 'bg-blue-500'
                                  : plan.status === 'IN_PROGRESS'
                                    ? 'bg-purple-500'
                                    : plan.status === 'COMPLETED'
                                      ? 'bg-gray-500'
                                      : 'bg-red-500'
                            }`}
                          ></div>
                          {plan.status === 'CONFIRMED'
                            ? '확정'
                            : plan.status === 'PLANNING'
                              ? '계획중'
                              : plan.status === 'IN_PROGRESS'
                                ? '여행중'
                                : plan.status === 'COMPLETED'
                                  ? '완료'
                                  : '취소'}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <Calendar className="mr-2 h-4 w-4 text-indigo-500" />
                          <span className="font-medium">
                            {formatDate(plan.start_date)} ~{' '}
                            {formatDate(plan.end_date)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                  <div className="p-6 pt-0">
                    <Button
                      asChild
                      className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm hover:from-indigo-600 hover:to-purple-700"
                    >
                      <Link to={`/travel-plans/${plan.plan_id}`}>
                        자세히 보기
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-100 to-purple-100 shadow-lg">
                <span className="text-3xl">✈️</span>
              </div>
              <h2 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-gray-100">
                아직 여행 계획이 없어요
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                첫 번째 여행을 계획해보세요!
              </p>
              <div className="mt-6 space-y-3">
                <Button
                  asChild
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 shadow-lg hover:from-indigo-600 hover:to-purple-700"
                >
                  <Link to="/planner">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    지금 시작하기
                  </Link>
                </Button>
                <div>
                  <button
                    onClick={() => refetch()}
                    className="text-sm font-medium text-indigo-600 underline hover:text-indigo-800"
                  >
                    새로고침
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <AlertDialog
        open={!!planToDelete}
        onOpenChange={() => setPlanToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. &apos;{planToDelete?.title}&apos;
              여행 계획이 영구적으로 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? '삭제 중...' : '삭제'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
