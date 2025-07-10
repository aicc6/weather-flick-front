import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import {
  useGetTravelPlanQuery,
  useGetTravelPlanRoutesQuery,
} from '@/store/api/travelPlansApi'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, MapPin, Navigation, Clock } from '@/components/icons'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function TravelPlanDetailPage() {
  const { planId } = useParams()
  const { data: plan, isLoading, isError } = useGetTravelPlanQuery(planId)
  const { data: routes, isLoading: routesLoading } = useGetTravelPlanRoutesQuery(planId, {
    skip: !planId,
  })

  const [selectedRoute, setSelectedRoute] = useState(null)
  const [isRouteDetailOpen, setIsRouteDetailOpen] = useState(false)

  const handleRouteDetailClick = (route) => {
    setSelectedRoute(route)
    setIsRouteDetailOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
        <span className="ml-2 text-gray-600">로딩 중...</span>
      </div>
    )
  }

  if (isError || !plan) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            여행 계획을 불러올 수 없습니다
          </h2>
          <p className="text-gray-600 mb-4">
            다시 시도하거나 목록으로 돌아가세요.
          </p>
          <Button asChild variant="outline">
            <Link to="/travel-plans">
              <ArrowLeft className="mr-2 h-4 w-4" />
              목록으로 돌아가기
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 px-4 py-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <Button variant="outline" asChild>
            <Link to="/travel-plans">
              <ArrowLeft className="mr-2 h-4 w-4" />
              목록으로 돌아가기
            </Link>
          </Button>
        </div>

        {/* 여행 계획 기본 정보 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">{plan.title}</CardTitle>
            <div className="text-sm text-gray-600">
              {formatDate(plan.start_date)} ~ {formatDate(plan.end_date)}
            </div>
          </CardHeader>
          <CardContent>
            {plan.description && (
              <p className="text-gray-700 mb-4">{plan.description}</p>
            )}
            {plan.start_location && (
              <div className="flex items-center text-gray-600">
                <MapPin className="mr-2 h-4 w-4" />
                출발지: {plan.start_location}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 경로 정보 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Navigation className="mr-2 h-5 w-5" />
              교통 정보
            </CardTitle>
          </CardHeader>
          <CardContent>
            {routesLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner />
                <span className="ml-2 text-gray-600">경로 정보를 불러오는 중...</span>
              </div>
            ) : routes && routes.length > 0 ? (
              <div className="space-y-4">
                {routes.map((route, index) => (
                  <div
                    key={route.route_id || index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md cursor-pointer hover:bg-blue-50 transition-colors"
                    onClick={() => handleRouteDetailClick(route)}
                  >
                    <div>
                      <div className="font-medium">
                        {route.departure_name} → {route.destination_name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {route.transport_type === 'car' && '🚗 자동차'}
                        {route.transport_type === 'transit' && '🚌 대중교통'}
                        {route.transport_type === 'walking' && '🚶 도보'}
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      {route.duration && (
                        <div className="flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          {Math.floor(route.duration / 60)}분
                        </div>
                      )}
                      {route.distance && (
                        <div>{(route.distance / 1000).toFixed(1)}km</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                경로 정보가 없습니다.
              </div>
            )}
          </CardContent>
        </Card>

        {/* 상세 일정 */}
        <Card>
          <CardHeader>
            <CardTitle>상세 일정</CardTitle>
          </CardHeader>
          <CardContent>
            {plan.itinerary && Object.keys(plan.itinerary).length > 0 ? (
              <div className="space-y-6">
                {Object.entries(plan.itinerary).map(([day, items]) => (
                  <div key={day}>
                    <h3 className="text-lg font-semibold text-blue-600 mb-3">
                      {day.replace('day', '') + '일차'}
                    </h3>
                    <ul className="space-y-3">
                      {items.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <MapPin className="mr-3 h-5 w-5 text-blue-500 mt-0.5" />
                          <div>
                            <div className="font-medium">{item.description}</div>
                            {item.address && (
                              <div className="text-sm text-gray-600">{item.address}</div>
                            )}
                            {item.memo && (
                              <div className="text-sm text-gray-500 mt-1 p-2 bg-gray-100 rounded">
                                {item.memo}
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                상세 일정이 없습니다.
              </div>
            )}
          </CardContent>
        </Card>

        {/* 경로 상세 모달 */}
        <Dialog open={isRouteDetailOpen} onOpenChange={setIsRouteDetailOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>상세 이동 정보</DialogTitle>
              <DialogDescription>
                {selectedRoute && (
                  <span>
                    {selectedRoute.departure_name} → {selectedRoute.destination_name}
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            
            {selectedRoute && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">
                      {Math.floor(selectedRoute.duration / 60)}분
                    </div>
                    <div className="text-sm text-gray-600">소요시간</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">
                      {(selectedRoute.distance / 1000).toFixed(1)}km
                    </div>
                    <div className="text-sm text-gray-600">이동거리</div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  🗺️ {selectedRoute.route_data?.source || '기본'} 기반 경로
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default TravelPlanDetailPage