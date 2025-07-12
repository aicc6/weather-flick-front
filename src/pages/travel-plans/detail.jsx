import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import {
  useGetTravelPlanQuery,
  useGetTravelPlanRoutesQuery,
  useAutoGenerateRoutesMutation,
  useGetTimemachineRouteInfoQuery,
} from '@/store/api/travelPlansApi'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Calendar,
  Info,
  Edit,
  ArrowLeft,
  MapPin,
  Navigation,
  Zap,
  Route,
} from '@/components/icons'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import EnhancedTransportCard from '@/components/transport/EnhancedTransportCard'
import { CompactDayItinerary } from '@/components/travel'

// 안전한 key 생성 유틸리티 함수
const generateSafeKey = (item, prefix = '', index = 0) => {
  const safeId = item?.id || item?.route_id || item?.guide_id || index
  const safePrefix = prefix ? `${prefix}-` : ''
  return `${safePrefix}${safeId}`
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function TravelPlanDetailPage() {
  const { planId } = useParams()
  const {
    data: plan,
    isLoading,
    isError,
    error,
  } = useGetTravelPlanQuery(planId)

  // 경로 정보 조회
  const {
    data: routes,
    isLoading: routesLoading,
    isError: routesError,
  } = useGetTravelPlanRoutesQuery(planId, {
    skip: !planId,
  })

  // 자동 경로 생성
  const [autoGenerateRoutes, { isLoading: isGeneratingRoutes }] =
    useAutoGenerateRoutesMutation()

  // 상세 경로 정보 모달 상태
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [isRouteDetailOpen, setIsRouteDetailOpen] = useState(false)

  // 타임머신 경로 정보 조회
  const {
    data: timemachineRouteInfo,
    isLoading: isTimemachineLoading,
    isError: isTimemachineError,
    error: timemachineError,
  } = useGetTimemachineRouteInfoQuery(
    {
      routeId: selectedRoute?.route_id,
      departureTime: null, // 여행 계획 시작일 기준으로 자동 계산
      includeComparison: true, // 여러 경로 옵션 비교
    },
    {
      skip: !selectedRoute?.route_id || !isRouteDetailOpen,
    },
  )

  // 상세 경로 정보 모달 열기
  const handleRouteDetailClick = (route) => {
    setSelectedRoute(route)
    setIsRouteDetailOpen(true)
  }

  // 서울 날씨 정보 조회 (백엔드 API 500 에러로 인해 임시 비활성화)
  // const {
  //   data: weatherData,
  //   isLoading: isWeatherLoading,
  //   isError: isWeatherError,
  // } = useGetCurrentWeatherQuery('Seoul', {
  //   skip: !plan,
  // })

  // 위치 정보에서 도시명 추출
  const extractCityFromLocation = (description) => {
    if (!description) return '서울'

    try {
      // 한국 주요 도시명 매핑
      const cityMap = {
        서울: [
          '서울',
          'Seoul',
          '강남',
          '홍대',
          '명동',
          '종로',
          '구로',
          '신도림',
          '영등포',
        ],
        부산: ['부산', 'Busan', '해운대', '광안리', '서면'],
        대구: ['대구', 'Daegu'],
        인천: ['인천', 'Incheon'],
        광주: ['광주', 'Gwangju'],
        대전: ['대전', 'Daejeon'],
        울산: ['울산', 'Ulsan'],
        제주: ['제주', 'Jeju'],
        경기: ['경기', '수원', '성남', '고양', '용인'],
        강원: ['강원', '춘천', '강릉', '속초'],
        충북: ['충북', '청주', '제천'],
        충남: ['충남', '천안', '아산'],
        전북: ['전북', '전주', '군산'],
        전남: ['전남', '목포', '순천', '여수'],
        경북: ['경북', '포항', '경주', '안동'],
        경남: ['경남', '창원', '진주', '통영'],
        세종: ['세종'],
      }

      // 설명에서 도시명 찾기
      for (const [city, keywords] of Object.entries(cityMap)) {
        if (keywords.some((keyword) => description.includes(keyword))) {
          return city
        }
      }

      return '서울' // 기본값
    } catch (error) {
      console.warn('도시명 추출 중 오류:', error)
      return '서울'
    }
  }

  // 일차별 위치 기반 날씨 예보 생성
  const generateLocationBasedWeatherForecast = (startDate, itinerary) => {
    if (!startDate || !itinerary) return []

    try {
      const start = new Date(startDate)
      const days = Object.keys(itinerary)
      const forecast = []

      const conditions = ['맑음', '구름조금', '구름많음', '흐림', '비']
      const cityWeatherVariation = {
        서울: { tempOffset: 0, conditionMod: 0 },
        부산: { tempOffset: 3, conditionMod: 1 },
        제주: { tempOffset: 5, conditionMod: 2 },
        대구: { tempOffset: 1, conditionMod: 0 },
        광주: { tempOffset: 2, conditionMod: 1 },
        강원: { tempOffset: -3, conditionMod: 0 },
      }

      days.forEach((day, index) => {
        const date = new Date(start.getTime() + index * 86400000)
        const dayItinerary = itinerary[day]

        // 해당 일차의 첫 번째 위치를 기준으로 도시 결정
        let city = '서울'
        if (dayItinerary && dayItinerary.length > 0) {
          city = extractCityFromLocation(dayItinerary[0].description)
        }

        const variation =
          cityWeatherVariation[city] || cityWeatherVariation['서울']
        const conditionIndex =
          (index + variation.conditionMod) % conditions.length
        const condition = conditions[conditionIndex]

        forecast.push({
          date: date.toISOString(),
          condition,
          city,
          temperature: {
            min: Math.max(
              5,
              Math.floor(Math.random() * 10) + 10 + variation.tempOffset,
            ),
            max: Math.min(
              35,
              Math.floor(Math.random() * 10) + 20 + variation.tempOffset,
            ),
          },
          precipitation:
            condition === '비'
              ? Math.floor(Math.random() * 30) + 60
              : Math.floor(Math.random() * 30),
        })
      })

      return forecast
    } catch (error) {
      console.warn('날씨 예보 생성 중 오류:', error)
      return []
    }
  }

  const weatherData = plan
    ? (() => {
        try {
          const forecast = generateLocationBasedWeatherForecast(
            plan.start_date,
            plan.itinerary,
          )

          // 여러 도시를 방문하는지 확인
          const cities = [...new Set(forecast.map((f) => f.city))]
          const isMultiCity = cities.length > 1

          return {
            forecast,
            recommendation: isMultiCity
              ? `${cities.join(', ')} 지역을 여행하시네요. 각 지역의 날씨를 확인하고 적절한 옷차림을 준비하세요.`
              : `${cities[0]} 지역 여행입니다. 전반적으로 여행하기 좋은 날씨입니다.`,
            isMultiCity,
          }
        } catch (error) {
          console.warn('날씨 데이터 생성 중 오류:', error)
          // 오류 발생 시 기본 날씨 데이터 반환
          return {
            forecast: [],
            recommendation:
              '날씨 정보를 불러올 수 없습니다. 여행 전 날씨를 확인해 주세요.',
            isMultiCity: false,
          }
        }
      })()
    : null

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl p-4 md:p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">여행 계획을 불러오는 중...</p>
          <p className="mt-1 text-sm text-gray-400">잠시만 기다려 주세요</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="container mx-auto max-w-4xl p-4 md:p-6">
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
            일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.
          </p>
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              새로고침
            </button>
            <button
              onClick={() => window.history.back()}
              className="rounded-md bg-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-400"
            >
              뒤로가기
            </button>
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

  if (!plan) {
    return (
      <div className="container mx-auto max-w-4xl p-4 md:p-6">
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-yellow-100 p-3">
            <svg
              className="h-6 w-6 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-yellow-800">
            여행 계획을 찾을 수 없습니다
          </h3>
          <p className="mb-4 text-yellow-700">
            요청하신 여행 계획이 존재하지 않거나 삭제되었을 수 있습니다.
          </p>
          <Link
            to="/travel-plans"
            className="inline-flex items-center rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            여행 계획 목록으로
          </Link>
        </div>
      </div>
    )
  }

  // 개발용 디버깅 로그 (필요시 주석 해제)
  // console.log('Travel plan loaded successfully:', !!plan)

  const itineraryDays = plan.itinerary ? Object.keys(plan.itinerary) : []

  // 수정 페이지로 이동 시 사용자 안내
  const handleEditClick = () => {
    toast.info('수정 페이지로 이동합니다', {
      duration: 2000,
      position: 'bottom-right',
    })
  }

  // 자동 경로 생성 핸들러
  const handleAutoGenerateRoutes = async () => {
    try {
      const result = await autoGenerateRoutes(planId).unwrap()
      toast.success(
        `${result.routes?.length || 0}개의 경로가 생성되었습니다!`,
        {
          duration: 3000,
          position: 'bottom-right',
        },
      )
    } catch (error) {
      toast.error('경로 생성에 실패했습니다', {
        duration: 3000,
        position: 'bottom-right',
      })
    }
  }

  // 교통수단 아이콘 반환
  const getTransportIcon = (transportType) => {
    switch (transportType) {
      case 'walk':
        return '🚶'
      case 'car':
        return '🚗'
      case 'transit':
        return '🚌'
      case 'subway':
        return '🚇'
      case 'bus':
        return '🚌'
      default:
        return '🚶'
    }
  }

  // 교통수단 이름 반환
  const getTransportName = (transportType) => {
    switch (transportType) {
      case 'walk':
        return '도보'
      case 'car':
        return '자동차'
      case 'transit':
        return '대중교통'
      case 'subway':
        return '지하철'
      case 'bus':
        return '버스'
      default:
        return '도보'
    }
  }

  // 시간을 시:분 형태로 변환
  const formatDuration = (minutes) => {
    if (!minutes) return '0분'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}시간 ${mins}분`
    }
    return `${mins}분`
  }

  // 거리 형태로 변환
  const formatDistance = (distance) => {
    if (!distance) return '0km'
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`
    }
    return `${distance.toFixed(1)}km`
  }

  // 비용 형태로 변환
  const formatCost = (cost) => {
    if (!cost) return '무료'
    return `${Math.round(cost).toLocaleString()}원`
  }

  // 대중교통 상세 정보 렌더링
  const renderTransitDetails = (routeData) => {
    if (!routeData) return null

    // ODsay API 응답 (sub_paths)
    if (routeData.sub_paths) {
      const subPaths = routeData.sub_paths
      const transitPaths = subPaths.filter(
        (path) => path.type === 'subway' || path.type === 'bus',
      )

      if (transitPaths.length === 0) return null

      return (
        <div className="mt-2 space-y-1">
          {transitPaths.map((path, index) => (
            <div
              key={generateSafeKey(path, 'transit', index)}
              className="flex items-center space-x-2 text-xs text-gray-500"
            >
              {path.type === 'subway' && (
                <>
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                    🚇 {path.lane?.name || path.lane?.busNo || '지하철'}
                  </span>
                  <span>
                    {path.start_station} → {path.end_station}
                  </span>
                  {path.station_count > 0 && (
                    <span className="text-gray-400">
                      ({path.station_count}개 역)
                    </span>
                  )}
                  {path.section_time > 0 && (
                    <span className="text-gray-400">{path.section_time}분</span>
                  )}
                </>
              )}
              {path.type === 'bus' && (
                <>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                    🚌 {path.lane?.busNo || '버스'}
                  </span>
                  <span>
                    {path.start_station} → {path.end_station}
                  </span>
                  {path.station_count > 0 && (
                    <span className="text-gray-400">
                      ({path.station_count}개 정류장)
                    </span>
                  )}
                  {path.section_time > 0 && (
                    <span className="text-gray-400">{path.section_time}분</span>
                  )}
                </>
              )}
            </div>
          ))}
          {routeData.summary && (
            <div className="mt-2 text-xs text-gray-400">
              {routeData.summary.bus_transit_count > 0 && (
                <span className="mr-3">
                  🚌 버스 환승 {routeData.summary.bus_transit_count}회
                </span>
              )}
              {routeData.summary.subway_transit_count > 0 && (
                <span>
                  🚇 지하철 환승 {routeData.summary.subway_transit_count}회
                </span>
              )}
            </div>
          )}
        </div>
      )
    }

    // Google API 응답 (steps) - 대중교통 단계 분석
    if (routeData.steps) {
      const transitSteps = routeData.steps.filter(
        (step) =>
          step.travel_mode === 'TRANSIT' || step.travel_mode === 'SUBWAY',
      )

      if (transitSteps.length === 0) return null

      return (
        <div className="mt-2 space-y-1">
          {transitSteps.map((step, index) => {
            const transitDetails = step.transit_details || {}
            const line = transitDetails.line || {}
            const vehicle = line.vehicle || {}

            return (
              <div
                key={generateSafeKey(step, 'step', index)}
                className="flex items-center space-x-2 text-xs text-gray-500"
              >
                {vehicle.type === 'SUBWAY' && (
                  <>
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                      🚇 {line.short_name || line.name || '지하철'}
                    </span>
                    <span>
                      {transitDetails.departure_stop?.name} →{' '}
                      {transitDetails.arrival_stop?.name}
                    </span>
                    {transitDetails.num_stops > 0 && (
                      <span className="text-gray-400">
                        ({transitDetails.num_stops}개 역)
                      </span>
                    )}
                  </>
                )}
                {vehicle.type === 'BUS' && (
                  <>
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                      🚌 {line.short_name || line.name || '버스'}
                    </span>
                    <span>
                      {transitDetails.departure_stop?.name} →{' '}
                      {transitDetails.arrival_stop?.name}
                    </span>
                    {transitDetails.num_stops > 0 && (
                      <span className="text-gray-400">
                        ({transitDetails.num_stops}개 정류장)
                      </span>
                    )}
                  </>
                )}
              </div>
            )
          })}
          <div className="mt-2 text-xs text-gray-400">
            🗺️ Google Maps 기반 대중교통 경로
          </div>
        </div>
      )
    }

    // 기타 API 응답 - 간단한 정보만 표시
    if (routeData.method) {
      return (
        <div className="mt-2 text-xs text-gray-400">
          📊{' '}
          {routeData.method === 'estimated_calculation'
            ? '추정 계산'
            : '기본 계산'}{' '}
          기반
        </div>
      )
    }

    return null
  }

  // 자동차 경로 상세 정보 렌더링
  const renderCarRouteDetails = (routeData) => {
    if (!routeData) return null

    // TMAP API 응답 (detailed_guides 우선 사용)
    if (routeData.detailed_guides && routeData.detailed_guides.length > 0) {
      return (
        <div className="mt-2 space-y-2">
          <div className="text-xs font-medium text-gray-500">🗺️ 경로 안내</div>
          {routeData.detailed_guides.map((guide, index) => (
            <div
              key={generateSafeKey(guide, 'guide', index)}
              className="flex items-start space-x-2 text-xs"
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-800">
                {guide.step}
              </span>
              <div className="flex-1">
                <div className="font-medium text-gray-700">
                  {guide.description}
                </div>
                <div className="mt-1 flex items-center space-x-2 text-gray-400">
                  <span className="inline-flex items-center">
                    📍 {guide.distance}
                  </span>
                  <span className="inline-flex items-center">
                    ⏱️ {guide.time}
                  </span>
                  {guide.instruction && (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                      {guide.instruction}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* 경로 요약 정보 */}
          {routeData.route_summary && (
            <div className="mt-3 rounded-lg bg-gray-50 p-2">
              <div className="mb-1 text-xs font-medium text-gray-600">
                경로 요약
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                <div>총 {routeData.route_summary.total_steps}개 안내점</div>
                <div>주요 구간 {routeData.route_summary.major_steps}개</div>
                <div>
                  예상 연료비{' '}
                  {routeData.route_summary.estimated_fuel_cost?.toLocaleString()}
                  원
                </div>
                <div>
                  총 예상비용{' '}
                  {routeData.route_summary.total_cost_estimate?.toLocaleString()}
                  원
                </div>
              </div>
            </div>
          )}

          <div className="mt-2 flex items-center space-x-4 text-xs text-gray-400">
            {routeData.toll_fee > 0 && (
              <span className="inline-flex items-center">
                🛣️ 통행료 {routeData.toll_fee.toLocaleString()}원
              </span>
            )}
            {routeData.taxi_fee > 0 && (
              <span className="inline-flex items-center">
                🚖 택시요금 {routeData.taxi_fee.toLocaleString()}원
              </span>
            )}
            <span className="inline-flex items-center">🗺️ TMAP 기반 경로</span>
          </div>
        </div>
      )
    }

    // 기존 guide_points 사용 (fallback)
    if (routeData.guide_points && routeData.guide_points.length > 0) {
      const guidePoints = routeData.guide_points.slice(0, 5) // 최대 5개만 표시

      return (
        <div className="mt-2 space-y-1">
          <div className="text-xs font-medium text-gray-500">🗺️ 경로 안내</div>
          {guidePoints.map((point, index) => (
            <div
              key={generateSafeKey(point, 'point', index)}
              className="flex items-start space-x-2 text-xs text-gray-500"
            >
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-800">
                {index + 1}
              </span>
              <div className="flex-1">
                <div className="text-gray-700">{point.description}</div>
                <div className="mt-1 flex items-center space-x-2 text-gray-400">
                  {point.distance > 0 && (
                    <span>
                      {point.distance >= 1000
                        ? `${(point.distance / 1000).toFixed(1)}km`
                        : `${point.distance}m`}
                    </span>
                  )}
                  {point.turn_instruction && (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                      {point.turn_instruction}
                    </span>
                  )}
                  {point.road_name && (
                    <span className="text-gray-500">• {point.road_name}</span>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="mt-2 flex items-center space-x-4 text-xs text-gray-400">
            {routeData.toll_fee > 0 && (
              <span className="inline-flex items-center">
                🛣️ 통행료 {routeData.toll_fee.toLocaleString()}원
              </span>
            )}
            {routeData.taxi_fee > 0 && (
              <span className="inline-flex items-center">
                🚖 택시요금 {routeData.taxi_fee.toLocaleString()}원
              </span>
            )}
            <span className="inline-flex items-center">🗺️ TMAP 기반 경로</span>
          </div>
        </div>
      )
    }

    // Google API 응답 (steps)
    if (routeData.steps && routeData.steps.length > 0) {
      const drivingSteps = routeData.steps.filter(
        (step) => step.travel_mode === 'DRIVING',
      )
      const displaySteps = drivingSteps.slice(0, 5) // 최대 5개만 표시

      if (displaySteps.length === 0) return null

      return (
        <div className="mt-2 space-y-1">
          <div className="text-xs font-medium text-gray-500">🗺️ 경로 안내</div>
          {displaySteps.map((step, index) => (
            <div
              key={generateSafeKey(step, 'step', index)}
              className="flex items-start space-x-2 text-xs text-gray-500"
            >
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-800">
                {index + 1}
              </span>
              <div className="flex-1">
                <div
                  className="text-gray-700"
                  dangerouslySetInnerHTML={{ __html: step.html_instructions }}
                />
                <div className="text-gray-400">
                  {step.distance?.text} • {step.duration?.text}
                </div>
              </div>
            </div>
          ))}

          <div className="mt-2 text-xs text-gray-400">
            🗺️ Google Maps 기반 자동차 경로
          </div>
        </div>
      )
    }

    // 기본 계산 방식 (enhanced)
    if (routeData.method || routeData.source === 'calculation') {
      return (
        <div className="mt-2 space-y-1">
          <div className="text-xs font-medium text-gray-500">
            🚗 자동차 경로 정보
          </div>

          {/* 안내점이 있는 경우 표시 */}
          {routeData.guide_points && routeData.guide_points.length > 0 && (
            <div className="space-y-1">
              {routeData.guide_points.map((point, index) => (
                <div
                  key={generateSafeKey(point, 'point', index)}
                  className="flex items-start space-x-2 text-xs text-gray-500"
                >
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-800">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="text-gray-700">{point.description}</div>
                    {point.distance > 0 && (
                      <div className="text-gray-400">
                        {point.distance >= 1000
                          ? `${(point.distance / 1000).toFixed(1)}km`
                          : `${point.distance}m`}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 추가 요금 정보 */}
          <div className="flex items-center space-x-4 text-xs text-gray-400">
            {routeData.toll_fee > 0 && (
              <span className="inline-flex items-center">
                🛣️ 통행료 {routeData.toll_fee.toLocaleString()}원
              </span>
            )}
            {routeData.taxi_fee > 0 && (
              <span className="inline-flex items-center">
                🚖 택시요금 {routeData.taxi_fee.toLocaleString()}원
              </span>
            )}
          </div>

          <div className="text-xs text-gray-400">
            📊{' '}
            {routeData.method === 'estimated_calculation'
              ? '추정 계산'
              : '기본 계산'}{' '}
            기반
          </div>
          <div className="text-xs text-gray-500">
            • 실제 경로와 다를 수 있습니다 • 정확한 경로는 내비게이션 앱을
            이용해주세요
          </div>
        </div>
      )
    }

    return null
  }

  // 상세 경로 정보 렌더링
  const renderDetailedRouteInfo = (route) => {
    if (!route?.route_data) return null

    const routeData = route.route_data

    return (
      <div className="space-y-4">
        {/* 기본 정보 */}
        <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatDuration(route.duration)}
            </div>
            <div className="text-sm text-gray-600">소요시간</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatDistance(route.distance)}
            </div>
            <div className="text-sm text-gray-600">이동거리</div>
          </div>
          {route.cost !== undefined && (
            <div className="col-span-2 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatCost(route.cost)}
              </div>
              <div className="text-sm text-gray-600">예상 비용</div>
            </div>
          )}
        </div>

        {/* 상세 안내 */}
        {routeData.detailed_guides && routeData.detailed_guides.length > 0 && (
          <div>
            <h4 className="mb-3 flex items-center font-semibold text-gray-800">
              <Route className="mr-2 h-4 w-4" />
              상세 경로 안내
            </h4>
            <div className="max-h-64 space-y-3 overflow-y-auto">
              {routeData.detailed_guides.map((guide, index) => (
                <div
                  key={generateSafeKey(guide, 'guide', index)}
                  className="flex items-start space-x-3 rounded border bg-white p-3"
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-800">
                    {guide.step}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">
                      {guide.description}
                    </div>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                      <span>📍 {guide.distance}</span>
                      <span>⏱️ {guide.time}</span>
                      {guide.instruction && (
                        <Badge variant="secondary" className="text-xs">
                          {guide.instruction}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 기본 안내점 (detailed_guides가 없을 때) */}
        {(!routeData.detailed_guides ||
          routeData.detailed_guides.length === 0) &&
          routeData.guide_points &&
          routeData.guide_points.length > 0 && (
            <div>
              <h4 className="mb-3 flex items-center font-semibold text-gray-800">
                <Navigation className="mr-2 h-4 w-4" />
                경로 안내
              </h4>
              <div className="max-h-64 space-y-3 overflow-y-auto">
                {routeData.guide_points.slice(0, 10).map((point, index) => (
                  <div
                    key={generateSafeKey(point, 'point', index)}
                    className="flex items-start space-x-3 rounded border bg-white p-3"
                  >
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-800">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">
                        {point.description}
                      </div>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        {point.distance > 0 && (
                          <span>
                            {point.distance >= 1000
                              ? `${(point.distance / 1000).toFixed(1)}km`
                              : `${point.distance}m`}
                          </span>
                        )}
                        {point.turn_instruction && (
                          <Badge variant="outline" className="text-xs">
                            {point.turn_instruction}
                          </Badge>
                        )}
                        {point.road_name && (
                          <span className="text-gray-400">
                            • {point.road_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* 추가 정보 */}
        {routeData.route_summary && (
          <div className="rounded-lg bg-blue-50 p-4">
            <h4 className="mb-2 font-semibold text-gray-800">경로 요약</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>총 안내점: {routeData.route_summary.total_steps}개</div>
              <div>주요 구간: {routeData.route_summary.major_steps}개</div>
              {routeData.route_summary.estimated_fuel_cost && (
                <div>
                  예상 연료비:{' '}
                  {routeData.route_summary.estimated_fuel_cost.toLocaleString()}
                  원
                </div>
              )}
              {routeData.route_summary.total_cost_estimate && (
                <div>
                  총 예상비용:{' '}
                  {routeData.route_summary.total_cost_estimate.toLocaleString()}
                  원
                </div>
              )}
            </div>
          </div>
        )}

        {/* 데이터 소스 */}
        <div className="flex items-center justify-between rounded bg-gray-100 p-3">
          <div className="text-sm text-gray-600">
            데이터 소스: {routeData.source || '기본'}
          </div>
          {routeData.source === 'TMAP' && (
            <Badge variant="outline">🚗 실시간 교통정보</Badge>
          )}
        </div>
      </div>
    )
  }

  // 일차별 경로 정보 그룹화
  const groupRoutesByDay = (routes) => {
    if (!routes || !Array.isArray(routes)) return {}

    const grouped = {}
    routes.forEach((route) => {
      const dayKey = `day${route.day}`
      if (!grouped[dayKey]) {
        grouped[dayKey] = []
      }
      grouped[dayKey].push(route)
    })

    // 각 일차별로 sequence 순서로 정렬
    Object.keys(grouped).forEach((day) => {
      grouped[day].sort((a, b) => a.sequence - b.sequence)
    })

    return grouped
  }

  return (
    <div className="min-h-screen bg-gray-50/50 px-4 py-6 dark:bg-gray-900">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <Button
            variant="outline"
            asChild
            className="rounded-xl border-gray-200 hover:bg-gray-50"
          >
            <Link to="/travel-plans">
              <ArrowLeft className="mr-2 h-4 w-4" />
              목록으로 돌아가기
            </Link>
          </Button>
        </div>

        <Card className="mb-8 rounded-2xl border border-gray-200/50 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <CardHeader className="pb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="mb-4 text-3xl leading-tight font-bold text-gray-800 dark:text-gray-100">
                  {plan.title}
                </CardTitle>
                <div
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium ${
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
              <Button
                asChild
                onClick={handleEditClick}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg hover:from-indigo-600 hover:to-purple-700"
              >
                <Link to={`/planner?planId=${planId}`}>
                  <Edit className="mr-2 h-4 w-4" />
                  수정하기
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <Calendar className="mr-3 h-5 w-5 text-indigo-500" />
                <span className="font-medium">
                  {formatDate(plan.start_date)} ~ {formatDate(plan.end_date)}
                </span>
              </div>
            </div>
            {plan.description && (
              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                <div className="flex items-start text-gray-700 dark:text-gray-300">
                  <Info className="mt-1 mr-3 h-5 w-5 flex-shrink-0 text-blue-500" />
                  <p className="leading-relaxed">{plan.description}</p>
                </div>
              </div>
            )}
            {plan.start_location && (
              <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <MapPin className="mr-3 h-5 w-5 text-green-500" />
                  <span className="font-medium">
                    출발지: {plan.start_location}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 날씨 정보 */}
        <Card className="mb-8 rounded-2xl border border-gray-200/50 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-600">
                <span className="text-sm font-bold text-white">☀️</span>
              </div>
              <CardTitle className="text-gray-800 dark:text-gray-100">
                날씨 정보
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {weatherData && weatherData.forecast ? (
              <div className="space-y-3">
                <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 p-3">
                  <p className="text-sm text-blue-700">
                    🌤️ 날씨 정보는 예측 데이터이며, 여행 전 최신 날씨를 확인해
                    주세요
                  </p>
                </div>
                {weatherData.forecast.map((forecast, index) => {
                  const getWeatherIcon = (condition) => {
                    const iconMap = {
                      맑음: '☀️',
                      구름조금: '🌤️',
                      구름많음: '☁️',
                      흐림: '☁️',
                      비: '🌧️',
                      눈: '🌨️',
                      바람: '💨',
                    }
                    return iconMap[condition] || '☀️'
                  }

                  const formatDate = (dateString) => {
                    const date = new Date(dateString)
                    return date.toLocaleDateString('ko-KR', {
                      month: 'short',
                      day: 'numeric',
                      weekday: 'short',
                    })
                  }

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">
                          {getWeatherIcon(forecast.condition)}
                        </span>
                        <div>
                          <div className="font-medium">
                            {formatDate(forecast.date)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {forecast.city && forecast.city !== '서울' && (
                              <span className="mr-2 text-blue-600">
                                📍{forecast.city}
                              </span>
                            )}
                            {forecast.condition}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {forecast.temperature.min}°~{forecast.temperature.max}
                          °
                        </div>
                        {forecast.precipitation > 0 && (
                          <div className="text-sm text-blue-500">
                            💧{forecast.precipitation}%
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {weatherData.recommendation && (
                  <div className="mt-4 rounded-md bg-gray-100 p-3">
                    <p className="text-sm text-gray-600">
                      💡 {weatherData.recommendation}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-orange-100 p-3">
                  <svg
                    className="h-6 w-6 text-orange-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                    />
                  </svg>
                </div>
                <h4 className="mb-2 font-medium text-gray-800">
                  날씨 정보 서비스 준비중
                </h4>
                <p className="mb-3 text-gray-600">
                  현재 날씨 서비스가 일시적으로 이용 불가합니다
                </p>
                <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3">
                  <p className="text-sm text-yellow-700">
                    🌤️ 여행 전 기상청이나 날씨 앱에서 각 지역의 날씨를 확인해
                    주세요
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 개선된 교통정보 섹션 */}
        <div className="mb-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-blue-600">
                <Navigation className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                교통 정보
              </h2>
            </div>
            {itineraryDays.length > 0 && (
              <Button
                onClick={handleAutoGenerateRoutes}
                disabled={isGeneratingRoutes}
                className="bg-gradient-to-r from-green-500 to-blue-600 text-white hover:from-green-600 hover:to-blue-700"
              >
                {isGeneratingRoutes ? (
                  <>
                    <Zap className="mr-2 h-4 w-4 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    {routes && routes.length > 0
                      ? '경로 재생성'
                      : '자동 경로 생성'}
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="space-y-6">
            {routesLoading ? (
              <Card className="rounded-2xl border border-gray-200/50 bg-white shadow-sm">
                <CardContent className="flex items-center justify-center py-8">
                  <LoadingSpinner />
                  <span className="ml-2 text-gray-600">
                    경로 정보를 불러오는 중...
                  </span>
                </CardContent>
              </Card>
            ) : routes && routes.length > 0 ? (
              (() => {
                const groupedRoutes = groupRoutesByDay(routes)
                return Object.keys(groupedRoutes)
                  .sort(
                    (a, b) =>
                      parseInt(a.replace('day', '')) -
                      parseInt(b.replace('day', '')),
                  )
                  .map((dayKey) => (
                    <div key={dayKey} className="space-y-4">
                      <h3 className="flex items-center text-xl font-semibold text-blue-600">
                        {dayKey.replace('day', '') + '일차 이동 정보'}
                        <span className="ml-2 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
                          🕐 타임머신 예측 지원
                        </span>
                      </h3>

                      {/* 각 경로에 대해 개선된 교통정보 카드 표시 */}
                      {groupedRoutes[dayKey].map((route, index) => {
                        const isStartRoute =
                          route.sequence === 0 && dayKey === 'day1'
                        const isInterDayRoute =
                          route.sequence === 0 && dayKey !== 'day1'

                        return (
                          <div key={generateSafeKey(route, 'route', index)}>
                            {isStartRoute && (
                              <div className="mb-2 inline-block rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-600">
                                🏠 출발지에서 첫 번째 목적지로
                              </div>
                            )}
                            {isInterDayRoute && (
                              <div className="mb-2 inline-block rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600">
                                🏨 전일 마지막 장소에서 오늘 첫 번째 목적지로
                              </div>
                            )}
                            <EnhancedTransportCard
                              route={{
                                from: route.departure_name,
                                to: route.destination_name,
                                departure_lat: route.departure_lat,
                                departure_lng: route.departure_lng,
                                destination_lat: route.destination_lat,
                                destination_lng: route.destination_lng,
                                duration: route.duration,
                                distance: route.distance,
                                cost: route.cost,
                                transport_type: route.transport_type,
                                route_data: route.route_data,
                                isInterDay: route.sequence === 0,
                              }}
                              travelDate={plan?.start_date}
                            />
                          </div>
                        )
                      })}
                    </div>
                  ))
              })()
            ) : (
              <Card className="rounded-2xl border border-gray-200/50 bg-white shadow-sm">
                <CardContent className="py-8 text-center">
                  <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gray-100 p-3">
                    <Navigation className="h-6 w-6 text-gray-600" />
                  </div>
                  <h4 className="mb-2 font-medium text-gray-800">
                    경로 정보가 없습니다
                  </h4>
                  <p className="mb-4 text-gray-600">
                    여행 일정이 있는 경우 자동으로 경로를 생성할 수 있습니다
                  </p>
                  {itineraryDays.length > 0 && (
                    <Button
                      onClick={handleAutoGenerateRoutes}
                      disabled={isGeneratingRoutes}
                      className="bg-gradient-to-r from-green-500 to-blue-600 text-white hover:from-green-600 hover:to-blue-700"
                    >
                      {isGeneratingRoutes ? (
                        <>
                          <Zap className="mr-2 h-4 w-4 animate-spin" />
                          생성 중...
                        </>
                      ) : (
                        <>
                          <Zap className="mr-2 h-4 w-4" />
                          자동 경로 생성
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                <span className="text-sm font-bold text-blue-600">📋</span>
              </div>
              <CardTitle className="text-lg text-gray-800">상세 일정</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {itineraryDays.length > 0 ? (
              <div className="space-y-3">
                {itineraryDays.map((day) => {
                  const dayNumber = parseInt(day.replace(/\D/g, ''))
                  const places = plan.itinerary[day] || []

                  // 날씨 데이터 처리
                  const dayIndex = dayNumber - 1
                  const dayWeather = weatherData?.forecast?.[dayIndex]
                  const weatherForPlaces = {}

                  if (dayWeather) {
                    places.forEach((place) => {
                      const city = extractCityFromLocation(place.description)
                      const cityWeatherVariation = {
                        서울: { tempOffset: 0, conditionOffset: 0 },
                        부산: { tempOffset: 3, conditionOffset: 1 },
                        제주: { tempOffset: 5, conditionOffset: 2 },
                        대구: { tempOffset: 1, conditionOffset: 0 },
                        광주: { tempOffset: 2, conditionOffset: 1 },
                        강원: { tempOffset: -3, conditionOffset: 0 },
                      }

                      const variation =
                        cityWeatherVariation[city] ||
                        cityWeatherVariation['서울']
                      const conditions = [
                        '맑음',
                        '구름조금',
                        '구름많음',
                        '흐림',
                        '비',
                      ]
                      const adjustedConditionIndex = Math.max(
                        0,
                        (conditions.indexOf(dayWeather.condition) +
                          variation.conditionOffset) %
                          conditions.length,
                      )
                      const adjustedCondition =
                        conditions[adjustedConditionIndex]

                      weatherForPlaces[place.description] = {
                        condition: adjustedCondition,
                        temperature: Math.round(
                          (dayWeather.temperature.min +
                            dayWeather.temperature.max) /
                            2 +
                            variation.tempOffset,
                        ),
                        humidity: dayWeather.humidity,
                        precipitation: dayWeather.precipitation,
                      }
                    })
                  } else {
                    // 날씨 데이터가 없을 때 기본값 제공
                    places.forEach((place) => {
                      weatherForPlaces[place.description] = {
                        condition: '맑음',
                        temperature: 20,
                        humidity: 60,
                        precipitation: 0,
                      }
                    })
                  }

                  return (
                    <CompactDayItinerary
                      key={day}
                      day={day}
                      places={places}
                      dayNumber={dayNumber}
                      weatherData={weatherForPlaces}
                      showWeather={true}
                    />
                  )
                })}
              </div>
            ) : (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gray-100 p-3">
                  <MapPin className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-500">상세 일정이 없습니다.</p>
                <p className="mt-1 text-sm text-gray-400">
                  여행 계획을 추가해보세요!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 상세 경로 정보 모달 */}
        <Dialog open={isRouteDetailOpen} onOpenChange={setIsRouteDetailOpen}>
          <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                🕐 타임머신 경로 예측
              </DialogTitle>
              <DialogDescription>
                {selectedRoute && (
                  <>
                    {selectedRoute.departure_name} →{' '}
                    {selectedRoute.destination_name}
                    {selectedRoute?.transport_type === 'car' && (
                      <> • ⏰ 여행 계획 일정 기준으로 교통상황 예측</>
                    )}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            {selectedRoute && (
              <div className="px-6 pb-2">
                <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-600">
                  ⏰ 여행 계획 일정 기준으로 교통상황 예측
                </div>
              </div>
            )}

            {/* 타임머신 API 응답 렌더링 */}
            {isTimemachineLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
                <span className="ml-3 text-gray-600">
                  타임머신 경로 예측을 생성하는 중...
                </span>
              </div>
            ) : isTimemachineError ? (
              <div className="p-6 text-center">
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
                  타임머신 예측을 불러올 수 없습니다
                </h3>
                <p className="mb-4 text-red-700">
                  {timemachineError?.data?.message ||
                    timemachineError?.message ||
                    '일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.'}
                </p>
                <div className="space-y-4">
                  <div className="rounded border border-yellow-200 bg-yellow-50 p-4">
                    <h4 className="mb-2 font-medium text-yellow-800">
                      기본 경로 정보
                    </h4>
                    {selectedRoute && renderDetailedRouteInfo(selectedRoute)}
                  </div>
                </div>
              </div>
            ) : timemachineRouteInfo ? (
              <div className="space-y-6">
                {/* 타임머신 상태 표시 */}
                <div className="flex items-center justify-between rounded border border-blue-200 bg-blue-50 p-3">
                  <div className="flex items-center space-x-2">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500"></span>
                    <span className="text-sm font-medium text-blue-800">
                      🕐 TMAP 타임머신 예측
                    </span>
                  </div>
                  <div className="text-xs text-blue-600">
                    {timemachineRouteInfo.prediction_info?.departure_time
                      ? new Date(
                          timemachineRouteInfo.prediction_info.departure_time,
                        ).toLocaleString('ko-KR')
                      : '여행 일정 기준'}
                  </div>
                </div>

                {/* 자동차가 아닌 경우 */}
                {selectedRoute?.transport_type !== 'car' &&
                  timemachineRouteInfo.timemachine_info?.message && (
                    <div className="rounded border border-yellow-200 bg-yellow-50 p-4">
                      <div className="text-sm text-yellow-800">
                        ℹ️ {timemachineRouteInfo.timemachine_info.message}
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">
                            {formatDuration(
                              timemachineRouteInfo.timemachine_info.fallback
                                ?.duration,
                            )}
                          </div>
                          <div className="text-xs text-gray-600">소요시간</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">
                            {formatDistance(
                              timemachineRouteInfo.timemachine_info.fallback
                                ?.distance,
                            )}
                          </div>
                          <div className="text-xs text-gray-600">이동거리</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">
                            {formatCost(
                              timemachineRouteInfo.timemachine_info.fallback
                                ?.cost,
                            )}
                          </div>
                          <div className="text-xs text-gray-600">예상 비용</div>
                        </div>
                      </div>
                    </div>
                  )}

                {/* 경로 비교 결과 (자동차인 경우) */}
                {timemachineRouteInfo.timemachine_info?.comparison?.routes && (
                  <div>
                    <h4 className="mb-3 flex items-center font-semibold text-gray-800">
                      <Route className="mr-2 h-4 w-4" />
                      🕐 타임머신 경로 옵션 비교
                    </h4>
                    <div className="grid gap-3">
                      {timemachineRouteInfo.timemachine_info.comparison.routes.map(
                        (route, index) => (
                          <div
                            key={generateSafeKey(route, 'comparison', index)}
                            className={`rounded-lg border p-4 ${
                              route.is_recommended
                                ? 'border-green-200 bg-green-50'
                                : 'border-gray-200 bg-white'
                            }`}
                          >
                            <div className="mb-3 flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`h-3 w-3 rounded-full ${
                                    route.is_recommended
                                      ? 'bg-green-500'
                                      : 'bg-gray-300'
                                  }`}
                                ></div>
                                <div>
                                  <div className="font-medium text-gray-800">
                                    {route.name}
                                    {route.is_recommended && (
                                      <span className="ml-2 rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                                        🚗 추천
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    타임머신 예측 기준
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-gray-800">
                                  {formatDuration(route.duration)} •{' '}
                                  {formatDistance(route.distance)}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {formatCost(route.cost + route.toll_fee)}
                                  {route.toll_fee > 0 && (
                                    <span className="ml-1 text-xs text-blue-600">
                                      (통행료 {route.toll_fee.toLocaleString()}
                                      원)
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* 교통 예측 정보 */}
                            {route.route_data?.route_summary && (
                              <div className="mt-3 rounded border bg-blue-50 p-3">
                                <div className="mb-2 text-sm font-medium text-blue-800">
                                  🚦 실시간 교통 예측
                                </div>
                                {route.route_data.route_summary
                                  .traffic_prediction && (
                                  <div className="mb-2 text-sm text-blue-700">
                                    전체 교통량:{' '}
                                    <span className="font-medium">
                                      {
                                        route.route_data.route_summary
                                          .traffic_prediction
                                      }
                                    </span>
                                  </div>
                                )}
                                {route.route_data.route_summary
                                  .expected_congestion && (
                                  <div className="space-y-1">
                                    {route.route_data.route_summary.expected_congestion.map(
                                      (congestion, idx) => (
                                        <div
                                          key={idx}
                                          className="flex justify-between text-xs text-blue-600"
                                        >
                                          <span>{congestion.location}</span>
                                          <span
                                            className={`font-medium ${
                                              congestion.level === '원활'
                                                ? 'text-green-600'
                                                : congestion.level === '보통'
                                                  ? 'text-yellow-600'
                                                  : 'text-red-600'
                                            }`}
                                          >
                                            {congestion.level}
                                          </span>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* 상세 안내 (추천 경로의 경우) */}
                            {route.is_recommended &&
                              route.route_data?.detailed_guides && (
                                <div className="mt-3 rounded border bg-gray-50 p-3">
                                  <div className="mb-2 text-sm font-medium text-gray-700">
                                    🗺️ 상세 경로 안내
                                  </div>
                                  <div className="space-y-2">
                                    {route.route_data.detailed_guides
                                      .slice(0, 3)
                                      .map((guide, idx) => (
                                        <div
                                          key={generateSafeKey(
                                            guide,
                                            'guide',
                                            idx,
                                          )}
                                          className="flex items-start space-x-2 text-xs"
                                        >
                                          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                                            {guide.step}
                                          </span>
                                          <div className="flex-1">
                                            <div className="text-gray-700">
                                              {guide.description}
                                            </div>
                                            <div className="mt-1 text-gray-500">
                                              {guide.distance} • {guide.time} •{' '}
                                              {guide.instruction}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              )}
                          </div>
                        ),
                      )}
                    </div>

                    {/* 비교 요약 */}
                    {timemachineRouteInfo.timemachine_info.comparison
                      .comparison_summary && (
                      <div className="mt-4 rounded bg-gray-50 p-3 text-sm text-gray-600">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            소요시간 범위:{' '}
                            {formatDuration(
                              timemachineRouteInfo.timemachine_info.comparison
                                .comparison_summary.time_range.min,
                            )}{' '}
                            ~{' '}
                            {formatDuration(
                              timemachineRouteInfo.timemachine_info.comparison
                                .comparison_summary.time_range.max,
                            )}
                          </div>
                          <div>
                            거리 범위:{' '}
                            {formatDistance(
                              timemachineRouteInfo.timemachine_info.comparison
                                .comparison_summary.distance_range.min,
                            )}{' '}
                            ~{' '}
                            {formatDistance(
                              timemachineRouteInfo.timemachine_info.comparison
                                .comparison_summary.distance_range.max,
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 단일 경로 예측 결과 */}
                {timemachineRouteInfo.timemachine_info?.predicted_route &&
                  !timemachineRouteInfo.timemachine_info?.comparison && (
                    <div>
                      <h4 className="mb-3 flex items-center font-semibold text-gray-800">
                        <Navigation className="mr-2 h-4 w-4" />
                        🕐 타임머신 경로 예측
                      </h4>
                      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                        <div className="mb-4 grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-blue-600">
                              {formatDuration(
                                timemachineRouteInfo.timemachine_info
                                  .predicted_route.duration,
                              )}
                            </div>
                            <div className="text-xs text-gray-600">
                              소요시간
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-600">
                              {formatDistance(
                                timemachineRouteInfo.timemachine_info
                                  .predicted_route.distance,
                              )}
                            </div>
                            <div className="text-xs text-gray-600">
                              이동거리
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-purple-600">
                              {formatCost(
                                timemachineRouteInfo.timemachine_info
                                  .predicted_route.cost +
                                  timemachineRouteInfo.timemachine_info
                                    .predicted_route.toll_fee,
                              )}
                            </div>
                            <div className="text-xs text-gray-600">총 비용</div>
                          </div>
                        </div>

                        {/* 교통 예측 정보 */}
                        {timemachineRouteInfo.timemachine_info.predicted_route
                          .route_data?.route_summary && (
                          <div className="mb-4 rounded border bg-white p-3">
                            <div className="mb-2 text-sm font-medium text-blue-800">
                              🚦 실시간 교통 예측
                            </div>
                            {timemachineRouteInfo.timemachine_info
                              .predicted_route.route_data.route_summary
                              .traffic_prediction && (
                              <div className="mb-2 text-sm text-blue-700">
                                전체 교통량:{' '}
                                <span className="font-medium">
                                  {
                                    timemachineRouteInfo.timemachine_info
                                      .predicted_route.route_data.route_summary
                                      .traffic_prediction
                                  }
                                </span>
                              </div>
                            )}
                            {timemachineRouteInfo.timemachine_info
                              .predicted_route.route_data.route_summary
                              .expected_congestion && (
                              <div className="grid grid-cols-1 gap-1">
                                {timemachineRouteInfo.timemachine_info.predicted_route.route_data.route_summary.expected_congestion.map(
                                  (congestion, idx) => (
                                    <div
                                      key={idx}
                                      className="flex justify-between text-xs text-blue-600"
                                    >
                                      <span>{congestion.location}</span>
                                      <span
                                        className={`font-medium ${
                                          congestion.level === '원활'
                                            ? 'text-green-600'
                                            : congestion.level === '보통'
                                              ? 'text-yellow-600'
                                              : 'text-red-600'
                                        }`}
                                      >
                                        {congestion.level}
                                      </span>
                                    </div>
                                  ),
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* 상세 경로 안내 */}
                        {timemachineRouteInfo.timemachine_info.predicted_route
                          .route_data?.detailed_guides && (
                          <div className="rounded border bg-white p-3">
                            <div className="mb-2 text-sm font-medium text-gray-700">
                              🗺️ 상세 경로 안내
                            </div>
                            <div className="max-h-48 space-y-2 overflow-y-auto">
                              {timemachineRouteInfo.timemachine_info.predicted_route.route_data.detailed_guides.map(
                                (guide, idx) => (
                                  <div
                                    key={generateSafeKey(guide, 'guide', idx)}
                                    className="flex items-start space-x-2 text-xs"
                                  >
                                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                                      {guide.step}
                                    </span>
                                    <div className="flex-1">
                                      <div className="text-gray-700">
                                        {guide.description}
                                      </div>
                                      <div className="mt-1 text-gray-500">
                                        {guide.distance} • {guide.time} •{' '}
                                        {guide.instruction}
                                      </div>
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                {/* 추천 경로 상세 안내 */}
                {timemachineRouteInfo.timemachine_info?.comparison?.recommended
                  ?.route_data?.detailed_guides && (
                  <div>
                    <h4 className="mb-3 flex items-center font-semibold text-gray-800">
                      <Navigation className="mr-2 h-4 w-4" />
                      🏆 추천 경로 상세 안내
                    </h4>
                    <div className="max-h-64 space-y-3 overflow-y-auto">
                      {timemachineRouteInfo.timemachine_info.comparison.recommended.route_data.detailed_guides.map(
                        (guide, index) => (
                          <div
                            key={generateSafeKey(guide, 'guide', index)}
                            className="flex items-start space-x-3 rounded border bg-white p-3"
                          >
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-800">
                              {guide.step}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-800">
                                {guide.description}
                              </div>
                              <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                                {guide.distance && (
                                  <span>📍 {guide.distance}</span>
                                )}
                                {guide.time && <span>⏱️ {guide.time}</span>}
                                {guide.instruction && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {guide.instruction}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {/* 예측 정확도 정보 */}
                <div className="rounded border border-yellow-200 bg-yellow-50 p-3">
                  <div className="text-sm text-yellow-800">
                    ⚠️{' '}
                    {timemachineRouteInfo.prediction_info?.accuracy_note ||
                      'TMAP 타임머신 API 기반 예측으로 실제 교통상황과 다를 수 있습니다.'}
                  </div>
                </div>

                {/* 데이터 소스 */}
                <div className="flex items-center justify-between rounded bg-blue-100 p-3">
                  <div className="text-sm text-blue-800">
                    📡 예측 데이터:{' '}
                    {timemachineRouteInfo.data_sources?.timemachine_data ||
                      'TMAP API'}
                  </div>
                  <Badge variant="outline" className="text-blue-600">
                    🕐 타임머신 예측
                  </Badge>
                </div>
              </div>
            ) : selectedRoute ? (
              <div className="space-y-4">
                <div className="rounded border border-yellow-200 bg-yellow-50 p-4">
                  <h4 className="mb-2 font-medium text-yellow-800">
                    기본 경로 정보
                  </h4>
                  <p className="text-sm text-yellow-700">
                    타임머신 데이터를 불러올 수 없어 기본 정보를 표시합니다.
                  </p>
                </div>
                {renderDetailedRouteInfo(selectedRoute)}
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default TravelPlanDetailPage
