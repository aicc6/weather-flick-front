import { useParams, Link } from 'react-router-dom'
import { useGetTravelPlanQuery } from '@/store/api/travelPlansApi'
import LoadingSpinner from '@/components/LoadingSpinner'
import WeatherInfo from '@/components/WeatherInfo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Calendar,
  Wallet,
  Info,
  Edit,
  ArrowLeft,
  MapPin,
  Tag,
} from '@/components/icons'

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return 'N/A'
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(amount)
}

// Google Place API 'types'를 한글 카테고리명으로 변환
const formatPlaceCategory = (type) => {
  const categoryMap = {
    point_of_interest: '관심 장소',
    establishment: '상업시설',
    tourist_attraction: '관광명소',
    park: '공원',
    museum: '박물관',
    restaurant: '음식점',
    cafe: '카페',
    lodging: '숙소',
    store: '상점',
    transit_station: '교통',
  }
  return categoryMap[type] || type
}

export function TravelPlanDetailPage() {
  const { planId } = useParams()
  const {
    data: plan,
    isLoading,
    isError,
    error,
  } = useGetTravelPlanQuery(planId)

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

  if (!plan) {
    return <div className="text-center">해당 여행 계획을 찾을 수 없습니다.</div>
  }

  // 디버깅용 로그
  console.log('Travel plan data:', plan)
  console.log('Weather info from plan:', plan.weather_info)

  const itineraryDays = plan.itinerary ? Object.keys(plan.itinerary) : []

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-6">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link to="/travel-plans">
            <ArrowLeft className="mr-2 h-4 w-4" />
            목록으로 돌아가기
          </Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="mb-2 text-3xl font-bold">
                {plan.title}
              </CardTitle>
              <Badge
                variant={plan.status === 'CONFIRMED' ? 'default' : 'secondary'}
              >
                {plan.status}
              </Badge>
            </div>
            <Button asChild>
              <Link to={`/planner?planId=${planId}`}>
                <Edit className="mr-2 h-4 w-4" />
                수정하기
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex items-center text-gray-700">
            <Calendar className="mr-3 h-5 w-5 text-gray-500" />
            <span>
              {formatDate(plan.start_date)} ~ {formatDate(plan.end_date)}
            </span>
          </div>
          <div className="flex items-center text-gray-700">
            <Wallet className="mr-3 h-5 w-5 text-gray-500" />
            <span>예산: {formatCurrency(plan.budget)}</span>
          </div>
          {plan.description && (
            <div className="flex items-start text-gray-700 md:col-span-2">
              <Info className="mt-1 mr-3 h-5 w-5 flex-shrink-0 text-gray-500" />
              <p>{plan.description}</p>
            </div>
          )}
          {plan.start_location && (
            <div className="flex items-center text-gray-700">
              <MapPin className="mr-3 h-5 w-5 text-gray-500" />
              <span>출발지: {plan.start_location}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 날씨 정보 */}
      <div className="mb-6">
        <WeatherInfo weatherInfo={plan.weather_info} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>상세 일정</CardTitle>
        </CardHeader>
        <CardContent>
          {itineraryDays.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {itineraryDays.map((day) => (
                <AccordionItem value={day} key={day}>
                  <AccordionTrigger className="text-lg font-semibold">
                    {day}
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-4 pl-4">
                      {plan.itinerary[day].map((item, index) => (
                        <li key={index} className="flex items-start">
                          <MapPin className="mt-1 mr-3 h-5 w-5 flex-shrink-0 text-blue-500" />
                          <div>
                            <p className="font-medium">{item.description}</p>
                            {item.address && (
                              <p className="text-sm text-gray-600">
                                {item.address}
                              </p>
                            )}
                            {item.category && (
                              <div className="mt-1 flex items-center text-xs text-gray-500">
                                <Tag className="mr-1 h-3 w-3" />
                                {formatPlaceCategory(item.category)}
                              </div>
                            )}
                            {item.memo && (
                              <p className="mt-2 rounded-md bg-gray-100 p-2 text-sm text-gray-600">
                                {item.memo}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="text-center text-gray-500">상세 일정이 없습니다.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
