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
  const { data: plans, isLoading, isError, error } = useGetUserPlansQuery()
  const [deleteTravelPlan, { isLoading: isDeleting }] =
    useDeleteTravelPlanMutation()
  const [planToDelete, setPlanToDelete] = useState(null)

  const handleDeleteClick = (plan) => {
    setPlanToDelete(plan)
  }

  const handleConfirmDelete = async () => {
    if (!planToDelete) return

    try {
      await deleteTravelPlan(planToDelete.plan_id).unwrap()
      toast.success(`'${planToDelete.title}' 여행 계획이 삭제되었습니다.`)
      setPlanToDelete(null)
    } catch (err) {
      toast.error('여행 계획 삭제에 실패했습니다.')
      console.error('Failed to delete the plan: ', err)
      setPlanToDelete(null)
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (isError) {
    return (
      <div className="text-center text-red-500">
        <p>여행 계획을 불러오는 데 실패했습니다.</p>
        <p className="text-sm">{error.toString()}</p>
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
        {plans && plans.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.plan_id}
                className="flex flex-col justify-between transition-all hover:shadow-md"
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
            <h2 className="text-xl">저장된 여행 플랜이 없습니다.</h2>
            <p className="mt-2">새로운 여행을 계획해보세요!</p>
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
