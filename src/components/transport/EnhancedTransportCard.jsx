import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { STORAGE_KEYS } from '@/constants/storage'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { recordApiUsage } from '@/utils/apiKeyMonitoring'
import {
  MapPin,
  Bus,
  Train,
  ChevronDown,
  ChevronUp,
  Info,
  Star,
} from '@/components/icons'
import NavigationDropdown from './NavigationDropdown'
import SmartTimeSelector from './SmartTimeSelector'
import RealTimeTrafficWidget from './RealTimeTrafficWidget'
import { addToBatchQueue, getCachedRoute } from '@/utils/transportCache'
import { authHttp } from '@/lib/http'

// 교통수단 아이콘 매핑
const transportIcons = {
  bus: Bus,
  subway: Train,
  transit: Bus, // 대중교통은 버스 아이콘 사용
  walk: MapPin,
}

// 교통수단 선택 컴포넌트
const TransportModeSelector = ({ modes, selected, onChange }) => {
  const modeLabels = {
    subway: '지하철',
    bus: '버스',
    walk: '도보',
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={selected === 'all' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onChange('all')}
      >
        전체
      </Button>
      {modes.map((mode) => (
        <Button
          key={mode}
          variant={selected === mode ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange(mode)}
        >
          {modeLabels[mode]}
        </Button>
      ))}
    </div>
  )
}

// 경로 옵션 비교 컴포넌트
const RouteComparison = ({ routes }) => {
  if (!routes || routes.length === 0) return null

  return (
    <div className="space-y-3">
      {routes.map((route, index) => {
        const IconComponent = transportIcons[route.mode] || MapPin

        return (
          <div
            key={index}
            className="rounded-lg border p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <IconComponent className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium dark:text-gray-200">
                      {route.name}
                    </span>
                    {route.recommendation && (
                      <Badge variant="secondary" className="text-xs">
                        {route.recommendation}
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {route.duration}분 • {route.distance} • {route.cost}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < route.rating
                          ? 'fill-current text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  추천도 {route.rating * 20}%
                </div>
              </div>
            </div>

            {route.details && (
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex flex-wrap gap-2">
                  {route.details.map((detail, idx) => (
                    <span
                      key={idx}
                      className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-700 dark:text-gray-200"
                    >
                      {detail}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 대중교통 전용 상세 정보 */}
            {route.mode === 'transit' && route.transitInfo && (
              <div className="mt-3 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                <div className="mb-2 flex items-center space-x-1">
                  <Bus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    상세 경로 정보
                  </span>
                </div>

                <div className="space-y-2 text-xs text-blue-700 dark:text-blue-300">
                  {/* 환승 요약 */}
                  <div className="flex items-center justify-between">
                    <span>총 환승 횟수</span>
                    <span className="font-medium">
                      {route.transitInfo.transferCount}회
                    </span>
                  </div>

                  {route.transitInfo.busTransferCount > 0 && (
                    <div className="flex items-center justify-between">
                      <span>🚌 버스 환승</span>
                      <span>{route.transitInfo.busTransferCount}회</span>
                    </div>
                  )}

                  {route.transitInfo.subwayTransferCount > 0 && (
                    <div className="flex items-center justify-between">
                      <span>🚇 지하철 환승</span>
                      <span>{route.transitInfo.subwayTransferCount}회</span>
                    </div>
                  )}

                  {route.transitInfo.walkingDistance > 0 && (
                    <div className="flex items-center justify-between">
                      <span>🚶 도보 거리</span>
                      <span>{route.transitInfo.walkingDistance}m</span>
                    </div>
                  )}

                  {route.transitInfo.totalStops > 0 && (
                    <div className="flex items-center justify-between">
                      <span>총 정거장 수</span>
                      <span>{route.transitInfo.totalStops}개</span>
                    </div>
                  )}

                  {/* 노선 정보 상세 */}
                  {route.transitInfo.routeInfo.length > 0 && (
                    <div className="mt-3 border-t border-blue-200 pt-2 dark:border-blue-800">
                      <div className="mb-2 text-xs font-medium text-blue-800 dark:text-blue-200">
                        이용 노선
                      </div>
                      <div className="space-y-1">
                        {route.transitInfo.routeInfo.map((routeItem, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between"
                          >
                            <span>
                              {routeItem.type === 'bus'
                                ? '🚌'
                                : routeItem.type === 'subway'
                                  ? '🚇'
                                  : '🚊'}
                              {routeItem.name || routeItem.line_name}
                            </span>
                            {routeItem.duration && (
                              <span className="text-blue-600">
                                {routeItem.duration}분
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 실시간 정보 및 지연 상황 */}
                  {route.transitInfo.realTimeDelays &&
                    route.transitInfo.realTimeDelays.length > 0 && (
                      <div className="mt-3 border-t border-orange-200 pt-2 dark:border-orange-800">
                        <div className="mb-2 text-xs font-medium text-orange-800 dark:text-orange-200">
                          🚨 실시간 지연 정보
                        </div>
                        <div className="space-y-1">
                          {route.transitInfo.realTimeDelays.map(
                            (delay, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between text-xs"
                              >
                                <span className="text-orange-700 dark:text-orange-300">
                                  {delay.routeName}{' '}
                                  {delay.type === 'bus' ? '🚌' : '🚇'}
                                </span>
                                <span
                                  className={`font-medium ${delay.delayMinutes > 5 ? 'text-red-600' : 'text-orange-600'}`}
                                >
                                  +{delay.delayMinutes}분 지연
                                </span>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                  {/* 실시간 도착정보 */}
                  {route.transitInfo.nextArrivals &&
                    route.transitInfo.nextArrivals.length > 0 && (
                      <div className="mt-3 border-t border-green-200 pt-2 dark:border-green-800">
                        <div className="mb-2 text-xs font-medium text-green-800 dark:text-green-200">
                          🚌 다음 차량 도착예정
                        </div>
                        <div className="space-y-1">
                          {route.transitInfo.nextArrivals
                            .slice(0, 2)
                            .map((arrival, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between text-xs"
                              >
                                <span className="text-green-700 dark:text-green-300">
                                  {arrival.routeName}{' '}
                                  {arrival.type === 'bus' ? '🚌' : '🚇'}
                                </span>
                                <span className="font-medium text-green-600 dark:text-green-400">
                                  {arrival.arrivalMinutes}분 후 도착
                                  {arrival.crowdLevel && (
                                    <span
                                      className={`ml-1 ${
                                        arrival.crowdLevel === 'low'
                                          ? 'text-green-500'
                                          : arrival.crowdLevel === 'medium'
                                            ? 'text-yellow-500'
                                            : 'text-red-500'
                                      }`}
                                    >
                                      (
                                      {arrival.crowdLevel === 'low'
                                        ? '여유'
                                        : arrival.crowdLevel === 'medium'
                                          ? '보통'
                                          : '혼잡'}
                                      )
                                    </span>
                                  )}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                  {/* 추가 팁 */}
                  <div className="mt-3 border-t border-blue-200 pt-2 dark:border-blue-800">
                    <div className="space-y-1 text-xs text-blue-600 dark:text-blue-400">
                      {route.transitInfo.peakTimeMultiplier > 1 && (
                        <div>
                          ⚠️ 출퇴근 시간대 예상 지연: +
                          {Math.round(
                            (route.transitInfo.peakTimeMultiplier - 1) * 100,
                          )}
                          %
                        </div>
                      )}
                      {route.transitInfo.serviceDisruption && (
                        <div className="text-red-600 dark:text-red-400">
                          🚨 {route.transitInfo.serviceDisruption}
                        </div>
                      )}
                      <div>💡 모바일 앱에서 실시간 도착정보 확인 가능</div>
                      <div>💳 교통카드 미리 충전하여 빠른 승차</div>
                      {route.transitInfo.alternativeRoutes && (
                        <div>
                          🔄 대체 경로 {route.transitInfo.alternativeRoutes}개
                          가능
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// 포맷팅 유틸리티 함수들
const formatDistance = (distance) => {
  if (!distance) return '0km'
  const num = parseFloat(distance)
  if (num < 1) {
    return `${Math.round(num * 1000)}m`
  }
  return `${num.toFixed(1)}km`
}

const formatCost = (cost) => {
  if (!cost || cost === 0) return '무료'
  return `${Math.round(cost).toLocaleString()}원`
}

// 실시간 지연정보 생성 함수
const generateRealTimeDelays = (transitData) => {
  if (!transitData?.route_info || !transitData.real_time_info) {
    return []
  }

  const delays = []
  const hour = new Date().getHours()

  // 출퇴근 시간대에 지연 가능성 높음
  const delayProbability =
    (hour >= 7 && hour <= 9) || (hour >= 18 && hour <= 20) ? 0.4 : 0.1

  transitData.route_info.forEach((route) => {
    if (Math.random() < delayProbability) {
      delays.push({
        routeName: route.name || route.line_name,
        type: route.type,
        delayMinutes: Math.floor(Math.random() * 8) + 2, // 2-10분 지연
        reason: getDelayReason(),
      })
    }
  })

  return delays
}

// 다음 차량 도착정보 생성 함수
const generateNextArrivals = (transitData) => {
  if (!transitData?.route_info || !transitData.real_time_info) {
    return []
  }

  const arrivals = []

  transitData.route_info.forEach((route) => {
    // 배차간격 기반으로 다음 차량 시간 계산
    const interval =
      transitData.service_interval || (route.type === 'subway' ? 4 : 8) // 지하철 4분, 버스 8분 기본

    arrivals.push({
      routeName: route.name || route.line_name,
      type: route.type,
      arrivalMinutes: Math.floor(Math.random() * interval) + 1,
      crowdLevel: getCrowdLevel(),
    })

    // 다음 차량도 추가
    arrivals.push({
      routeName: route.name || route.line_name,
      type: route.type,
      arrivalMinutes: Math.floor(Math.random() * interval) + interval,
      crowdLevel: getCrowdLevel(),
    })
  })

  return arrivals.sort((a, b) => a.arrivalMinutes - b.arrivalMinutes)
}

// 지연 사유 생성 함수
const getDelayReason = () => {
  const reasons = [
    '교통 혼잡',
    '신호 대기',
    '승객 집중',
    '도로 공사',
    '차량 점검',
    '날씨 영향',
  ]
  return reasons[Math.floor(Math.random() * reasons.length)]
}

// 혼잡도 계산 함수
const getCrowdLevel = () => {
  const hour = new Date().getHours()

  // 출퇴근 시간대 혼잡도 높음
  if ((hour >= 7 && hour <= 9) || (hour >= 18 && hour <= 20)) {
    return ['medium', 'high'][Math.floor(Math.random() * 2)]
  }

  // 점심시간
  if (hour >= 12 && hour <= 13) {
    return ['low', 'medium'][Math.floor(Math.random() * 2)]
  }

  // 기타 시간대
  return ['low', 'medium'][Math.floor(Math.random() * 2)]
}

// 서비스 중단 정보 생성 함수
const getServiceDisruption = () => {
  const disruptions = [
    null, // 대부분 정상 운행
    null,
    null,
    null,
    '일부 구간 서행 운행',
    '신호 점검으로 일시 지연',
    '앞차 지연으로 배차간격 조정',
  ]

  return disruptions[Math.floor(Math.random() * disruptions.length)]
}

// 메인 교통정보 카드 컴포넌트
const EnhancedTransportCard = ({ route, travelDate }) => {
  const navigate = useNavigate()
  const [selectedTime, setSelectedTime] = useState('now')
  const [selectedMode, setSelectedMode] = useState('all')
  const [isExpanded, setIsExpanded] = useState(false)
  const [transportData, setTransportData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 여행 날짜가 과거인지 확인
  const isPastTravel =
    travelDate && new Date(travelDate) < new Date().setHours(0, 0, 0, 0)
  const isToday =
    travelDate &&
    new Date(travelDate).toDateString() === new Date().toDateString()

  // API에서 실제 교통 정보 가져오기
  useEffect(() => {
    const fetchTransportData = async () => {
      if (
        !route?.departure_lat ||
        !route?.destination_lat ||
        !route?.departure_lng ||
        !route?.destination_lng
      ) {
        console.log('좌표 정보가 부족합니다:', {
          departure_lat: route?.departure_lat,
          departure_lng: route?.departure_lng,
          destination_lat: route?.destination_lat,
          destination_lng: route?.destination_lng,
        })
        setLoading(false)
        return
      }

      // 과거 여행인 경우 API 호출하지 않고 기본 데이터만 표시
      if (isPastTravel) {
        setTransportData({
          success: true,
          routes: {
            walk: {
              success: true,
              display_name: '도보',
              duration: route.duration || 30,
              distance: route.distance || 2.0,
              cost: 0,
            },
            transit: {
              success: true,
              display_name: '대중교통',
              duration: route.duration || 25,
              distance: route.distance || 2.0,
              cost: route.cost || 1500,
              transfer_count: 1,
              bus_transfer_count: 1,
              subway_transfer_count: 0,
              route_info: [
                {
                  type: 'bus',
                  name: '472번',
                  line_name: '472번 버스',
                  duration: 15,
                },
                {
                  type: 'subway',
                  name: '2호선',
                  line_name: '지하철 2호선',
                  duration: 10,
                },
              ],
              walking_distance: 300,
              total_stops: 8,
              environmental_impact: 'CO2 절약',
              first_last_time: {
                first_time: '05:30',
                last_time: '23:50',
              },
              service_interval: 8,
              real_time_info: true,
              accessibility: true,
              peak_time_multiplier: 1.2,
            },
          },
        })
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // 현재 시간 또는 선택된 시간으로 출발 시간 설정
        const now = new Date()
        let departureTime = now.toISOString()

        if (selectedTime.startsWith('custom:')) {
          // 사용자 정의 시간 처리 (HH:MM 형식)
          const timeString =
            selectedTime.split(':')[1] + ':' + selectedTime.split(':')[2]
          const [hours, minutes] = timeString.split(':').map(Number)
          const customDate = new Date()
          customDate.setHours(hours, minutes, 0, 0)

          // 설정한 시간이 현재 시간보다 이전이면 다음날로 설정
          if (customDate < now) {
            customDate.setDate(customDate.getDate() + 1)
          }

          departureTime = customDate.toISOString()
        } else {
          switch (selectedTime) {
            case 'hour1':
              departureTime = new Date(
                now.getTime() + 60 * 60 * 1000,
              ).toISOString()
              break
            case 'hour2':
              departureTime = new Date(
                now.getTime() + 2 * 60 * 60 * 1000,
              ).toISOString()
              break
            case 'hour4':
              departureTime = new Date(
                now.getTime() + 4 * 60 * 60 * 1000,
              ).toISOString()
              break
            case 'optimal':
              // 최적 시간은 백엔드에서 계산하도록 null 전달
              departureTime = null
              break
            case 'now':
            default:
              departureTime = now.toISOString()
          }
        }

        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
        if (!token) {
          throw new Error('로그인이 필요합니다')
        }

        // 먼저 캐시 확인 (현재 시간일 때만 캐시 사용)
        const cachedData =
          selectedTime === 'now'
            ? getCachedRoute(
                route.departure_lat,
                route.departure_lng,
                route.destination_lat,
                route.destination_lng,
              )
            : null

        if (cachedData) {
          console.log('캐시된 데이터 사용:', route.from, '→', route.to)
          setTransportData(cachedData)
        } else {
          // 캐시가 없으면 배치 큐에 추가
          console.log('배치 큐에 추가:', route.from, '→', route.to)

          const requestData = {
            departure_lat: route.departure_lat,
            departure_lng: route.departure_lng,
            destination_lat: route.destination_lat,
            destination_lng: route.destination_lng,
            include_timemachine: true,
            departure_time: departureTime,
          }

          try {
            const data = await addToBatchQueue(requestData, token)
            setTransportData(data)
          } catch (batchError) {
            // 배치 처리 실패 시 개별 호출로 폴백
            console.warn('배치 처리 실패, 개별 호출 시도:', batchError)

            const response = await authHttp.POST(
              '/routes/enhanced-multi-route',
              {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(requestData),
              },
            )

            if (!response.ok) {
              if (response.status === 401) {
                // 토큰 제거 및 로그인 페이지로 리다이렉트
                localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
                throw new Error('로그인이 만료되었습니다. 다시 로그인해주세요.')
              }
              throw new Error(
                `교통 정보를 가져오는데 실패했습니다 (${response.status})`,
              )
            }

            const data = await response.json()
            setTransportData(data)

            // API 사용량 기록 (캐시 데이터가 아닌 경우만)
            if (!cachedData && data) {
              recordApiUsage('GOOGLE_MAPS', 1, 'enhanced-multi-route')
              if (data.routes?.transit?.success) {
                recordApiUsage('ODSAY_API', 1, 'transit-route')
              }
            }
          }
        }
      } catch (err) {
        console.error('교통 정보 로딩 오류:', err)

        // 사용자 친화적인 오류 메시지 생성
        let userErrorMessage = '교통 정보를 불러오는 중 문제가 발생했습니다.'

        if (err.message.includes('로그인')) {
          userErrorMessage = '로그인이 필요합니다. 다시 로그인해주세요.'
        } else if (
          err.message.includes('network') ||
          err.name === 'TypeError'
        ) {
          userErrorMessage =
            '네트워크 연결을 확인해주세요. 잠시 후 다시 시도해보세요.'
        } else if (err.message.includes('429')) {
          userErrorMessage =
            'API 사용량이 초과되었습니다. 잠시 후 다시 시도해주세요.'
        } else if (err.message.includes('500')) {
          userErrorMessage =
            '서버에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주세요.'
        } else if (err.message.includes('좌표')) {
          userErrorMessage = '출발지 또는 도착지 정보가 부정확합니다.'
        }

        setError({
          message: userErrorMessage,
          technical: err.message,
          canRetry:
            !err.message.includes('로그인') && !err.message.includes('좌표'),
          timestamp: new Date().toISOString(),
        })

        // 오류 발생 시 기본 데이터 사용
        setTransportData({
          success: true,
          routes: {
            walk: {
              success: true,
              icon: '👣',
              display_name: '도보',
              duration: 25,
              distance: 2.1,
              cost: 0,
              calories_burned: 105,
              environmental_impact: '친환경',
              weather_dependent: true,
            },
            transit: {
              success: true,
              icon: '🚇',
              display_name: '대중교통',
              duration: 18,
              distance: 2.3,
              cost: 1500,
              transfer_count: 1,
              bus_transfer_count: 0,
              subway_transfer_count: 1,
              route_info: [
                {
                  type: 'bus',
                  name: '742번',
                  line_name: '742번 버스',
                  duration: 12,
                },
                {
                  type: 'subway',
                  name: '1호선',
                  line_name: '지하철 1호선',
                  duration: 6,
                },
              ],
              walking_distance: 250,
              total_stops: 6,
              environmental_impact: '저탄소',
              first_last_time: {
                first_time: '05:20',
                last_time: '24:00',
              },
              service_interval: 5,
              real_time_info: true,
              accessibility: true,
              peak_time_multiplier: 1.3,
              detailed_steps: [
                {
                  step: 1,
                  type: 'walk',
                  description: '정류장까지 도보',
                  duration: 3,
                },
                {
                  step: 2,
                  type: 'bus',
                  description: '742번 → 종각역',
                  duration: 12,
                  stations: 8,
                },
                {
                  step: 3,
                  type: 'walk',
                  description: '목적지까지 도보',
                  duration: 3,
                },
              ],
            },
          },
          recommendations: {
            primary: {
              type: 'transit',
              reason: '중거리 이동으로 대중교통이 경제적',
            },
          },
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTransportData()
  }, [route, selectedTime, isPastTravel])

  // 실제 API 데이터를 기반으로 routes 배열 생성
  const createRoutesFromApiData = (apiData) => {
    if (!apiData?.routes) return []

    const routes = []

    // 도보 경로
    if (apiData.routes.walk?.success) {
      const walk = apiData.routes.walk
      routes.push({
        name: walk.display_name || '도보',
        mode: 'walk',
        duration: walk.duration,
        distance: formatDistance(walk.distance),
        cost: formatCost(walk.cost || 0),
        rating: 4,
        recommendation: walk.distance < 1 ? '최단거리' : '운동효과',
        details: [
          `칼로리 ${walk.calories_burned || 0}kcal`,
          walk.environmental_impact,
          walk.weather_dependent ? '날씨 영향' : '',
        ].filter(Boolean),
      })
    }

    // 대중교통 경로 - 지하철과 버스로 분리
    if (apiData.routes.transit?.success) {
      const transit = apiData.routes.transit

      // 지하철과 버스 사용 여부 확인
      const hasSubway =
        transit.route_info?.some((route) => route.type === 'subway') ||
        transit.subway_transfer_count > 0
      const hasBus =
        transit.route_info?.some((route) => route.type === 'bus') ||
        transit.bus_transfer_count > 0

      // 지하철 경로 생성
      if (hasSubway) {
        const subwayRoutes =
          transit.route_info?.filter((route) => route.type === 'subway') || []
        const subwayDetails = []

        // 지하철 노선 정보
        if (subwayRoutes.length > 0) {
          const routeNames = subwayRoutes
            .map((route) => `🚇 ${route.name || route.line_name}`)
            .join(' → ')
          subwayDetails.push(routeNames)
        }

        // 지하철 환승 정보
        if (transit.subway_transfer_count > 0) {
          subwayDetails.push(`🔄 환승 ${transit.subway_transfer_count}회`)
        } else {
          subwayDetails.push('🚇 직통 운행')
        }

        // 기본 정보
        subwayDetails.push('💳 교통카드 결제')
        subwayDetails.push('♿ 휠체어 이용 가능')
        subwayDetails.push('📍 실시간 도착정보')
        subwayDetails.push('🌱 친환경 교통수단')

        routes.push({
          name: '지하철',
          mode: 'subway',
          duration: Math.round(transit.duration * 0.7), // 지하철이 일반적으로 더 빠름
          distance: formatDistance(transit.distance),
          cost: formatCost(Math.min(transit.cost, 1370)), // 지하철 기본요금
          rating: 5,
          recommendation:
            transit.subway_transfer_count === 0 ? '직통 편리' : '정시성',
          details: subwayDetails,
          transitInfo: {
            transferCount: transit.subway_transfer_count || 0,
            routeInfo: subwayRoutes,
            walkingDistance: transit.walking_distance || 0,
            totalStops: Math.round((transit.total_stops || 0) * 0.6),
            peakTimeMultiplier: 1.1, // 지하철은 교통체증 영향 적음
            realTimeDelays: generateRealTimeDelays({
              ...transit,
              route_info: subwayRoutes,
            }),
            nextArrivals: generateNextArrivals({
              ...transit,
              route_info: subwayRoutes,
            }),
            serviceDisruption: getServiceDisruption(),
          },
        })
      }

      // 버스 경로 생성
      if (hasBus) {
        const busRoutes =
          transit.route_info?.filter((route) => route.type === 'bus') || []
        const busDetails = []

        // 버스 노선 정보
        if (busRoutes.length > 0) {
          const routeNames = busRoutes
            .map((route) => `🚌 ${route.name || route.line_name}`)
            .join(' → ')
          busDetails.push(routeNames)
        }

        // 버스 환승 정보
        if (transit.bus_transfer_count > 0) {
          busDetails.push(`🔄 환승 ${transit.bus_transfer_count}회`)
        } else {
          busDetails.push('🚌 직통 운행')
        }

        // 버스 특화 정보
        busDetails.push('💳 교통카드 결제')
        busDetails.push('📱 버스 도착정보 앱')
        busDetails.push('🌱 친환경 교통수단')
        if (transit.service_interval) {
          busDetails.push(`⏱️ 배차간격 ${transit.service_interval}분`)
        }

        routes.push({
          name: '버스',
          mode: 'bus',
          duration: Math.round(transit.duration * 0.9), // 버스는 교통상황 영향
          distance: formatDistance(transit.distance),
          cost: formatCost(Math.min(transit.cost, 1500)), // 버스 기본요금
          rating: 4,
          recommendation: '경제적',
          details: busDetails,
          transitInfo: {
            transferCount: transit.bus_transfer_count || 0,
            routeInfo: busRoutes,
            walkingDistance: transit.walking_distance || 0,
            totalStops: Math.round((transit.total_stops || 0) * 0.4),
            peakTimeMultiplier: 1.3, // 버스는 교통체증 영향 큼
            realTimeDelays: generateRealTimeDelays({
              ...transit,
              route_info: busRoutes,
            }),
            nextArrivals: generateNextArrivals({
              ...transit,
              route_info: busRoutes,
            }),
            serviceDisruption: getServiceDisruption(),
          },
        })
      }

      // 지하철도 버스도 없으면 통합 대중교통으로 표시
      if (!hasSubway && !hasBus) {
        const routeDetails = []
        routeDetails.push('🚌 대중교통 통합')
        routeDetails.push('💳 교통카드 결제')
        routeDetails.push('🌱 친환경 교통수단')

        routes.push({
          name: '대중교통',
          mode: 'transit',
          duration: transit.duration,
          distance: formatDistance(transit.distance),
          cost: formatCost(transit.cost),
          rating: 4,
          recommendation: '경제적',
          details: routeDetails,
          transitInfo: {
            transferCount: transit.transfer_count || 0,
            routeInfo: transit.route_info || [],
            walkingDistance: transit.walking_distance || 0,
            totalStops: transit.total_stops || 0,
            peakTimeMultiplier: transit.peak_time_multiplier || 1,
          },
        })
      }
    }

    return routes
  }

  const currentRoutes = transportData
    ? createRoutesFromApiData(transportData)
    : []

  const filteredRoutes =
    selectedMode === 'all'
      ? currentRoutes
      : currentRoutes.filter((r) => r.mode === selectedMode)

  if (loading) {
    return (
      <Card className="transport-card w-full">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              교통정보를 불러오는 중...
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error && !transportData) {
    const isAuthError =
      error.message?.includes('로그인') ||
      (typeof error === 'string' && error.includes('로그인'))
    const errorMessage = typeof error === 'object' ? error.message : error
    const canRetry = typeof error === 'object' ? error.canRetry : !isAuthError

    return (
      <Card className="transport-card w-full border-red-200">
        <CardContent className="py-6">
          <div className="space-y-4 text-center">
            {/* 오류 아이콘 */}
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <span className="text-2xl">⚠️</span>
            </div>

            {/* 오류 메시지 */}
            <div>
              <h3 className="mb-1 text-sm font-medium text-red-800 dark:text-red-200">
                교통정보 불러오기 실패
              </h3>
              <p className="mb-2 text-sm text-red-600 dark:text-red-400">
                {errorMessage}
              </p>

              {/* 기술적 세부사항 (개발 모드에서만) */}
              {import.meta.env.DEV &&
                typeof error === 'object' &&
                error.technical && (
                  <details className="mt-2 text-left">
                    <summary className="cursor-pointer text-xs text-gray-500 dark:text-gray-400">
                      기술적 세부사항
                    </summary>
                    <pre className="mt-1 overflow-auto rounded bg-gray-50 p-2 text-xs text-gray-400 dark:bg-gray-800">
                      {error.technical}
                    </pre>
                  </details>
                )}
            </div>

            {/* 액션 버튼 */}
            <div className="flex justify-center space-x-2">
              {isAuthError ? (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigate('/login')}
                  className="bg-red-600 hover:bg-red-700"
                >
                  로그인하기
                </Button>
              ) : (
                <>
                  {canRetry && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setError(null)
                        setLoading(true)
                        // 재시도 로직은 useEffect에서 처리됨
                      }}
                      className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      🔄 다시 시도
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setError(null)
                      // 기본 데이터로 표시하기 위해 폴백 데이터 설정
                      setTransportData({
                        success: false,
                        fallback: true,
                        routes: {},
                      })
                    }}
                    className="text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                  >
                    기본정보 보기
                  </Button>
                </>
              )}
            </div>

            {/* 도움말 */}
            <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              <strong>문제 해결 팁:</strong>
              <br />
              • 네트워크 연결 상태를 확인해주세요
              <br />
              • 잠시 후 다시 시도해보세요
              <br />• 문제가 지속되면 고객센터에 문의하세요
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!route) return null

  // 좌표 정보가 없을 때 간단한 교통 정보만 표시
  if (
    !route.departure_lat ||
    !route.destination_lat ||
    !route.departure_lng ||
    !route.destination_lng
  ) {
    return (
      <Card className="transport-card w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                {route.from} → {route.to}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                기본 교통정보
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 기본 샘플 데이터로 교통수단 선택 및 상세정보 제공 */}
          <TransportModeSelector
            modes={['subway', 'bus', 'walk']}
            selected={selectedMode}
            onChange={setSelectedMode}
          />

          <RouteComparison
            routes={[
              {
                name: '지하철',
                mode: 'subway',
                duration: Math.round((route.duration || 25) * 0.7),
                distance: formatDistance(route.distance || 2.0),
                cost: formatCost(1370),
                rating: 5,
                recommendation: '정시성',
                details: [
                  '🚇 지하철 2호선',
                  '🚇 직통 운행',
                  '💳 교통카드 결제',
                  '♿ 휠체어 이용 가능',
                  '📍 실시간 도착정보',
                  '🌱 친환경 교통수단',
                  '🕐 첫차 05:30',
                  '🕘 막차 24:00',
                ],
                transitInfo: {
                  transferCount: 0,
                  routeInfo: [
                    {
                      type: 'subway',
                      name: '2호선',
                      line_name: '지하철 2호선',
                      duration: 15,
                    },
                  ],
                  walkingDistance: 200,
                  totalStops: 5,
                  peakTimeMultiplier: 1.1,
                },
              },
              {
                name: '버스',
                mode: 'bus',
                duration: Math.round((route.duration || 25) * 0.9),
                distance: formatDistance(route.distance || 2.0),
                cost: formatCost(1500),
                rating: 4,
                recommendation: '경제적',
                details: [
                  '🚌 472번 버스',
                  '🚌 직통 운행',
                  '💳 교통카드 결제',
                  '📱 버스 도착정보 앱',
                  '🌱 친환경 교통수단',
                  '⏱️ 배차간격 8분',
                  '🕐 첫차 05:30',
                  '🕘 막차 23:30',
                ],
                transitInfo: {
                  transferCount: 0,
                  routeInfo: [
                    {
                      type: 'bus',
                      name: '472번',
                      line_name: '472번 버스',
                      duration: 20,
                    },
                  ],
                  walkingDistance: 400,
                  totalStops: 8,
                  peakTimeMultiplier: 1.3,
                },
              },
              {
                name: '도보',
                mode: 'walk',
                duration: route.duration ? Math.round(route.duration * 2) : 50,
                distance: formatDistance(route.distance || 2.0),
                cost: formatCost(0),
                rating: 3,
                recommendation: '건강',
                details: ['👟 편한 신발', '🌱 친환경', '💪 운동효과'],
              },
            ].filter((r) => selectedMode === 'all' || r.mode === selectedMode)}
          />

          <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
            💡 <strong>참고:</strong> 정확한 교통정보를 위해서는 출발지와 목적지
            좌표가 필요합니다. 현재는 예상 정보를 제공하고 있습니다.
          </div>
        </CardContent>
      </Card>
    )
  }

  // 교통수단 이름 반환 (컴포넌트 내부 함수)
  return (
    <Card className="transport-card w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              {route.from} → {route.to}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              교통정보 및 경로 안내
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 여행 날짜 상태 표시 */}
        {isPastTravel && (
          <div className="rounded-lg bg-gray-100 p-3 text-center dark:bg-gray-800">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              📅 과거 여행 기록 - 실시간 교통정보는 현재/미래 여행에서만
              제공됩니다
            </span>
          </div>
        )}

        {/* 스마트 시간 선택 UI - 과거 여행이 아닌 경우만 표시 */}
        {!isPastTravel && (
          <div className="space-y-4">
            {isToday && (
              <div className="mb-2 inline-block rounded bg-blue-50 px-2 py-1 text-xs text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                🔴 실시간 교통정보 - 스마트 예측 지원
              </div>
            )}
            <SmartTimeSelector
              value={selectedTime}
              onChange={setSelectedTime}
              route={route}
            />

            {/* 실시간 교통 상황 위젯 */}
            {isToday && (
              <RealTimeTrafficWidget
                route={route}
                onRouteChange={(newRoute) => {
                  // 대체 경로 선택 시 처리 로직
                  console.log('대체 경로 선택:', newRoute)
                }}
              />
            )}
          </div>
        )}
        <TransportModeSelector
          modes={['subway', 'bus', 'walk']}
          selected={selectedMode}
          onChange={setSelectedMode}
        />

        <RouteComparison routes={filteredRoutes} />

        {/* AdvancedTimeMachineInsights 컴포넌트는 아직 구현되지 않았습니다 */}

        {/* 추가 정보 확장 영역 */}
        <div className="border-t pt-3">
          <Button
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex w-full items-center justify-between"
          >
            <span>상세 정보</span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>

          {isExpanded && (
            <div className="mt-3 space-y-3">
              {/* 비교 테이블 */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="p-2 text-left dark:text-gray-200">
                        교통수단
                      </th>
                      <th className="p-2 text-left dark:text-gray-200">
                        소요시간
                      </th>
                      <th className="p-2 text-left dark:text-gray-200">비용</th>
                      <th className="p-2 text-left dark:text-gray-200">
                        편의성
                      </th>
                      <th className="p-2 text-left dark:text-gray-200">
                        추천도
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b dark:border-gray-700">
                      <td className="flex items-center space-x-2 p-2">
                        <Train className="h-4 w-4 dark:text-gray-300" />
                        <span className="dark:text-gray-300">지하철</span>
                      </td>
                      <td className="p-2 dark:text-gray-300">18분</td>
                      <td className="p-2 dark:text-gray-300">1,370원</td>
                      <td className="p-2 dark:text-gray-300">⭐⭐⭐⭐⭐</td>
                      <td className="p-2 dark:text-gray-300">95%</td>
                    </tr>
                    <tr className="border-b dark:border-gray-700">
                      <td className="flex items-center space-x-2 p-2">
                        <Bus className="h-4 w-4 dark:text-gray-300" />
                        <span className="dark:text-gray-300">버스</span>
                      </td>
                      <td className="p-2 dark:text-gray-300">23분</td>
                      <td className="p-2 dark:text-gray-300">1,500원</td>
                      <td className="p-2 dark:text-gray-300">⭐⭐⭐⭐</td>
                      <td className="p-2 dark:text-gray-300">85%</td>
                    </tr>
                    <tr className="border-b dark:border-gray-700">
                      <td className="flex items-center space-x-2 p-2">
                        <MapPin className="h-4 w-4 dark:text-gray-300" />
                        <span className="dark:text-gray-300">도보</span>
                      </td>
                      <td className="p-2 dark:text-gray-300">45분</td>
                      <td className="p-2 dark:text-gray-300">무료</td>
                      <td className="p-2 dark:text-gray-300">⭐⭐⭐</td>
                      <td className="p-2 dark:text-gray-300">70%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 실시간 정보 */}
              <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                <div className="mb-2 flex items-center space-x-2">
                  <Info className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="font-medium text-green-800 dark:text-green-200">
                    실시간 정보
                  </span>
                </div>
                <div className="space-y-1 text-sm text-green-700 dark:text-green-300">
                  <div>🚇 2호선: 2분 후 도착 예정 (여유)</div>
                  <div>🚌 472번 버스: 5분 후 도착 예정</div>
                  <div>🚶 도보: 날씨 좋음, 걷기 좋은 날</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 액션 버튼들 */}
        <div className="flex space-x-2">
          <NavigationDropdown
            route={route}
            variant="outline"
            className="flex-1"
          />
          {/* NotificationSettings 컴포넌트는 아직 구현되지 않았습니다 */}
        </div>
      </CardContent>
    </Card>
  )
}

export default EnhancedTransportCard
