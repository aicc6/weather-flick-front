import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Calendar,
  MapPin,
  ArrowLeft,
  Lock,
  Edit,
  Copy,
  CloudSun,
} from 'lucide-react'
import { CompactDayItinerary } from '@/components/travel'
import { Badge } from '@/components/ui/badge'

const formatDate = (dateString) => {
  if (!dateString) return '날짜 정보 없음'
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function SharedPlanView() {
  const { shareToken } = useParams()
  const [plan, setPlan] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [canEdit, setCanEdit] = useState(false)

  useEffect(() => {
    fetchSharedPlan()
  }, [shareToken])

  const fetchSharedPlan = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/shared/${shareToken}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      const result = await response.json()

      if (result.success) {
        setPlan(result.data)
        setCanEdit(result.data.can_edit)
      } else {
        setError(result.message || '여행 계획을 불러올 수 없습니다')
        if (result.code === 'EXPIRED') {
          toast.error('만료된 공유 링크입니다')
        } else if (result.code === 'MAX_USES_REACHED') {
          toast.error('최대 사용 횟수를 초과한 공유 링크입니다')
        }
      }
    } catch (error) {
      console.error('공유 계획 조회 오류:', error)
      setError('여행 계획을 불러오는 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('링크가 복사되었습니다')
  }

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl p-4 md:p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner />
          <p className="mt-4 text-gray-700 dark:text-gray-300">
            공유된 여행 계획을 불러오는 중...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-4xl p-4 md:p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 p-3">
            <Lock className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-red-800 dark:text-red-200">
            접근할 수 없는 페이지입니다
          </h3>
          <p className="mb-4 text-red-700 dark:text-red-300">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            메인으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  if (!plan) {
    return null
  }

  const itineraryDays = plan.itinerary ? Object.keys(plan.itinerary) : []

  return (
    <div className="min-h-screen bg-gray-50/50 px-4 py-6 dark:bg-gray-900">
      <div className="mx-auto max-w-5xl">
        {/* 상단 공유 표시 및 액션 버튼 */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Lock className="h-3 w-3" />
              {plan.share_permission === 'view' ? '보기 전용' : '편집 가능'}
            </Badge>
            <span className="text-sm text-gray-600">공유된 여행 계획</span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              링크 복사
            </Button>
            {canEdit && (
              <Button
                asChild
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700"
              >
                <Link to={`/planner?planId=${plan.plan_id}`}>
                  <Edit className="mr-2 h-4 w-4" />
                  수정하기
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* 여행 제목 및 기본 정보 */}
        <Card className="mb-8 rounded-2xl border border-gray-200/50 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <CardHeader className="pb-6">
            <CardTitle className="mb-4 text-3xl font-bold text-gray-900 dark:text-gray-100">
              {plan.title}
            </CardTitle>
            {plan.description && (
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {plan.description}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    여행 기간
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {formatDate(plan.start_date)} ~ {formatDate(plan.end_date)}
                  </p>
                </div>
              </div>

              {plan.start_location && (
                <div className="flex items-center gap-3 rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                  <MapPin className="h-8 w-8 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      출발지
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {plan.start_location}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 일정 상세 */}
        <Card className="rounded-2xl border border-gray-200/50 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CloudSun className="h-6 w-6" />
              일정별 날씨 & 목적지
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {itineraryDays.map((day, index) => {
                const places = plan.itinerary[day] || []
                const dateStr = plan.start_date
                  ? new Date(
                      new Date(plan.start_date).getTime() +
                        index * 24 * 60 * 60 * 1000,
                    )
                      .toISOString()
                      .split('T')[0]
                  : null

                return (
                  <CompactDayItinerary
                    key={day}
                    day={day}
                    dayNumber={index + 1}
                    places={places}
                    date={dateStr}
                    weatherData={plan.weather_info?.[day]}
                    isLoading={false}
                  />
                )
              })}

              {itineraryDays.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-gray-500">
                    아직 일정이 추가되지 않았습니다.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 로그인 유도 (비로그인 사용자) */}
        {!localStorage.getItem('token') && (
          <Card className="mt-8 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-6">
            <div className="text-center">
              <h3 className="mb-2 text-lg font-semibold text-indigo-800">
                이 여행 계획이 마음에 드시나요?
              </h3>
              <p className="mb-4 text-indigo-700">
                Weather Flick에 가입하고 나만의 여행 계획을 만들어보세요!
              </p>
              <div className="flex justify-center gap-4">
                <Button asChild>
                  <Link to="/sign-up">회원가입</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/login">로그인</Link>
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
