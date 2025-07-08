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
  const { data: plans, isLoading, isError, error, refetch } = useGetUserPlansQuery(undefined, {
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
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">여행 계획 목록을 불러오는 중...</p>
          <p className="mt-1 text-sm text-gray-400">잠시만 기다려 주세요</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 p-3">
            <svg
              className="h-6 w-6 text-red-600"
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
          <h3 className="mb-2 text-lg font-semibold text-red-800">
            여행 계획을 불러올 수 없습니다
          </h3>
          <p className="mb-4 text-red-700">
            일시적인 문제가 발생했습니다. 네트워크 연결을 확인하고 다시 시도해
            주세요.
          </p>
          <div className="space-x-4">
            <button
              onClick={() => refetch()}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              다시 시도
            </button>
            <Link
              to="/planner"
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <PlusCircle className="mr-2 h-4 w-4" />새 플랜 만들기
            </Link>
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
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">나의 여행 플랜</h1>
        <Button asChild>
          <Link to="/planner">
            <PlusCircle className="mr-2 h-4 w-4" />새 플랜 만들기
          </Link>
        </Button>
      </div>

      <div className="mt-6">
        {!isLoading && !isError && sortedPlans && sortedPlans.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sortedPlans.map((plan) => (
              <Card
                key={plan.plan_id}
                className="flex flex-col justify-between transition-all hover:scale-[1.02] hover:shadow-md"
              >
                <div>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="pr-2">{plan.title}</CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex-shrink-0"
                        onClick={() => handleDeleteClick(plan)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Badge
                      variant={
                        plan.status === 'CONFIRMED' ? 'default' : 'secondary'
                      }
                      className="w-fit"
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
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>
                        {formatDate(plan.start_date)} ~{' '}
                        {formatDate(plan.end_date)}
                      </span>
                    </div>
                  </CardContent>
                </div>
                <div className="p-6 pt-0">
                  <Button asChild variant="link" className="p-0">
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
          <div className="py-20 text-center text-gray-500">
            <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-blue-100 p-4">
              <svg
                className="h-8 w-8 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-700">
              아직 여행 계획이 없어요
            </h2>
            <p className="mt-2 text-gray-500">첫 번째 여행을 계획해보세요!</p>
            <div className="mt-4 space-y-2">
              <Button asChild>
                <Link to="/planner">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  지금 시작하기
                </Link>
              </Button>
              <div>
                <button
                  onClick={() => refetch()}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
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
