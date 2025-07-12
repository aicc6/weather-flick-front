import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { STORAGE_KEYS } from '@/constants/storage'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Clock,
  MapPin,
  Bus,
  Car,
  Train,
  ChevronDown,
  ChevronUp,
  Info,
  Star,
  Zap,
} from '@/components/icons'
import NavigationDropdown from './NavigationDropdown'

// 교통수단 아이콘 매핑
const transportIcons = {
  bus: Bus,
  subway: Train,
  car: Car,
  walk: MapPin,
}

// 시간대별 선택 컴포넌트
const TimeSelector = ({ value, onChange, options }) => {
  const [showCustomTime, setShowCustomTime] = useState(false)
  const [customTime, setCustomTime] = useState('')

  const handleCustomTimeSubmit = () => {
    if (customTime) {
      onChange(`custom:${customTime}`)
      setShowCustomTime(false)
    }
  }

  const getCurrentTimeForInput = () => {
    const now = new Date()
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  }

  // 시간을 오전/오후 형식으로 변환하는 함수
  const formatTimeToAmPm = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number)
    const ampm = hours >= 12 ? '오후' : '오전'
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours
    return `${ampm} ${displayHours}:${minutes.toString().padStart(2, '0')}`
  }

  // 현재 선택된 시간을 표시하는 함수
  const getSelectedTimeDisplay = () => {
    if (value.startsWith('custom:')) {
      const timeString = value.split(':')[1] + ':' + value.split(':')[2]
      return formatTimeToAmPm(timeString)
    }

    if (value === 'now') return '지금 출발'
    if (value === 'optimal') return '최적 시간'

    // 1시간 후, 2시간 후 등의 경우 실제 시간 표시
    const now = new Date()
    if (value === 'hour1') {
      const future = new Date(now.getTime() + 60 * 60 * 1000)
      return formatTimeToAmPm(`${future.getHours()}:${future.getMinutes()}`)
    }
    if (value === 'hour2') {
      const future = new Date(now.getTime() + 2 * 60 * 60 * 1000)
      return formatTimeToAmPm(`${future.getHours()}:${future.getMinutes()}`)
    }
    if (value === 'hour4') {
      const future = new Date(now.getTime() + 4 * 60 * 60 * 1000)
      return formatTimeToAmPm(`${future.getHours()}:${future.getMinutes()}`)
    }

    return '시간 선택'
  }

  return (
    <div className="flex items-center justify-between">
      {/* 현재 선택된 시간 표시 */}
      <div className="flex items-center space-x-3">
        <span className="text-sm text-gray-600">출발시간:</span>
        <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600">
          🕒 {getSelectedTimeDisplay()}
        </span>
      </div>

      {/* 시간 선택 드롭다운 */}
      <div className="flex items-center space-x-1">
        {!showCustomTime ? (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onChange('now')}
              className={`text-xs ${value === 'now' ? 'bg-blue-100' : ''}`}
            >
              지금
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onChange('hour1')}
              className={`text-xs ${value === 'hour1' ? 'bg-blue-100' : ''}`}
            >
              1시간후
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onChange('hour2')}
              className={`text-xs ${value === 'hour2' ? 'bg-blue-100' : ''}`}
            >
              2시간후
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setShowCustomTime(true)
                setCustomTime(getCurrentTimeForInput())
              }}
              className={`text-xs ${value.startsWith('custom:') ? 'bg-blue-100' : ''}`}
            >
              직접입력
            </Button>
          </>
        ) : (
          <div className="flex items-center space-x-2">
            <input
              type="time"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              className="rounded border px-2 py-1 text-xs"
            />
            <Button size="sm" onClick={handleCustomTimeSubmit}>
              ✓
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowCustomTime(false)}
            >
              ✕
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// 교통수단 선택 컴포넌트
const TransportModeSelector = ({ modes, selected, onChange }) => {
  const modeLabels = {
    transit: '대중교통',
    car: '자동차',
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
            className="rounded-lg border p-3 transition-colors hover:bg-gray-50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <IconComponent className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{route.name}</span>
                    {route.recommendation && (
                      <Badge variant="secondary" className="text-xs">
                        {route.recommendation}
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
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
                <div className="text-xs text-gray-500">
                  추천도 {route.rating * 20}%
                </div>
              </div>
            </div>

            {route.details && (
              <div className="mt-2 text-xs text-gray-600">
                <div className="flex flex-wrap gap-2">
                  {route.details.map((detail, idx) => (
                    <span key={idx} className="rounded bg-gray-100 px-2 py-1">
                      {detail}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 대중교통 전용 상세 정보 */}
            {route.mode === 'bus' && route.transitInfo && (
              <div className="mt-3 rounded-lg bg-blue-50 p-3">
                <div className="mb-2 flex items-center space-x-1">
                  <Bus className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    상세 경로 정보
                  </span>
                </div>

                <div className="space-y-2 text-xs text-blue-700">
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
                    <div className="mt-3 border-t border-blue-200 pt-2">
                      <div className="mb-2 text-xs font-medium text-blue-800">
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

                  {/* 추가 팁 */}
                  <div className="mt-3 border-t border-blue-200 pt-2">
                    <div className="space-y-1 text-xs text-blue-600">
                      {route.transitInfo.peakTimeMultiplier > 1 && (
                        <div>
                          ⚠️ 출퇴근 시간대 예상 지연: +
                          {Math.round(
                            (route.transitInfo.peakTimeMultiplier - 1) * 100,
                          )}
                          %
                        </div>
                      )}
                      <div>💡 모바일 앱에서 실시간 도착정보 확인 가능</div>
                      <div>💳 교통카드 미리 충전하여 빠른 승차</div>
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

// 타임머신 인사이트 컴포넌트
const TimeMachineInsights = ({ time, predictions }) => {
  if (!predictions || !predictions[time]) return null

  const insight = predictions[time]

  return (
    <div className="rounded-lg bg-blue-50 p-3">
      <div className="mb-2 flex items-center space-x-2">
        <Zap className="h-4 w-4 text-blue-600" />
        <span className="font-medium text-blue-800">시간대별 예측</span>
      </div>
      <div className="space-y-1 text-sm text-blue-700">
        <div>🚗 자동차: {insight.carDuration}</div>
        <div>🚌 대중교통: {insight.transitDuration}</div>
        <div className="font-medium">💡 추천: {insight.recommendation}</div>
        <div className="text-xs text-blue-600">
          이유: {insight.reasons?.join(', ')}
        </div>
      </div>
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

// 교통수단 타입을 한글로 변환
const formatTransportType = (type) => {
  const typeMap = {
    car: '자동차',
    transit: '대중교통',
    walk: '도보',
  }
  return typeMap[type] || type
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
            car: {
              success: true,
              display_name: '자동차',
              duration: route.duration || 20,
              distance: route.distance || 2.0,
              cost: route.cost || 3000,
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

        const response = await fetch(
          'http://localhost:8000/api/routes/enhanced-multi-route',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              departure_lat: route.departure_lat,
              departure_lng: route.departure_lng,
              destination_lat: route.destination_lat,
              destination_lng: route.destination_lng,
              include_timemachine: true,
              departure_time: departureTime,
            }),
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
      } catch (err) {
        console.error('교통 정보 로딩 오류:', err)
        setError(err.message)

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
            car: {
              success: true,
              icon: '🚗',
              display_name: '자동차',
              duration: 12,
              distance: 2.5,
              cost: 3200,
              toll_fee: 0,
              fuel_efficiency: { estimated_fuel_usage: '0.25L' },
              environmental_impact: '일반',
              real_time_traffic: true,
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

    // 대중교통 경로
    if (apiData.routes.transit?.success) {
      const transit = apiData.routes.transit

      // 상세 경로 정보 생성
      const routeDetails = []

      // 환승 정보
      if (transit.transfer_count > 0) {
        routeDetails.push(`🔄 환승 ${transit.transfer_count}회`)
        if (transit.bus_transfer_count > 0) {
          routeDetails.push(`🚌 버스 환승 ${transit.bus_transfer_count}회`)
        }
        if (transit.subway_transfer_count > 0) {
          routeDetails.push(`🚇 지하철 환승 ${transit.subway_transfer_count}회`)
        }
      } else {
        routeDetails.push('🚌 직통 운행')
      }

      // 노선 정보
      if (transit.route_info && transit.route_info.length > 0) {
        const routeNames = transit.route_info
          .slice(0, 3)
          .map((route) => {
            const routeType =
              route.type === 'bus'
                ? '🚌'
                : route.type === 'subway'
                  ? '🚇'
                  : '🚊'
            return `${routeType} ${route.name || route.line_name}`
          })
          .join(' → ')
        routeDetails.push(routeNames)
      }

      // 첫차/막차 정보
      if (transit.first_last_time) {
        routeDetails.push(`🕐 첫차 ${transit.first_last_time.first_time}`)
        routeDetails.push(`🕘 막차 ${transit.first_last_time.last_time}`)
      }

      // 배차간격
      if (transit.service_interval) {
        routeDetails.push(`⏱️ 배차간격 ${transit.service_interval}분`)
      }

      // 실시간 정보
      if (transit.real_time_info) {
        routeDetails.push('📍 실시간 도착정보')
      }

      // 접근성 정보
      if (transit.accessibility) {
        routeDetails.push('♿ 휠체어 이용 가능')
      }

      // 기본 정보 추가
      routeDetails.push('💳 교통카드 결제')
      if (transit.environmental_impact) {
        routeDetails.push(`🌱 ${transit.environmental_impact}`)
      }

      routes.push({
        name: transit.display_name || '대중교통',
        mode: 'bus',
        duration: transit.duration,
        distance: formatDistance(transit.distance),
        cost: formatCost(transit.cost),
        rating: 5,
        recommendation: transit.transfer_count === 0 ? '직통 편리' : '경제적',
        details: routeDetails,
        // 추가 상세 정보
        transitInfo: {
          transferCount: transit.transfer_count || 0,
          busTransferCount: transit.bus_transfer_count || 0,
          subwayTransferCount: transit.subway_transfer_count || 0,
          routeInfo: transit.route_info || [],
          walkingDistance: transit.walking_distance || 0,
          totalStops: transit.total_stops || 0,
          peakTimeMultiplier: transit.peak_time_multiplier || 1,
        },
      })
    }

    // 자동차 경로
    if (apiData.routes.car?.success) {
      const car = apiData.routes.car
      routes.push({
        name: car.display_name || '자동차',
        mode: 'car',
        duration: car.duration,
        distance: formatDistance(car.distance),
        cost: formatCost(car.cost + (car.toll_fee || 0)),
        rating: 4,
        recommendation: car.predicted_traffic ? '실시간' : '편의성',
        details: [
          car.toll_fee ? `통행료 ${formatCost(car.toll_fee)}` : '통행료 없음',
          car.fuel_efficiency?.estimated_fuel_usage
            ? `연료 ${car.fuel_efficiency.estimated_fuel_usage}`
            : '',
          car.real_time_traffic ? '실시간 교통정보' : '',
        ].filter(Boolean),
      })
    }

    return routes
  }

  // 타임머신 데이터 생성
  const createTimeMachineData = (apiData) => {
    if (!apiData?.routes?.car?.timemachine_data) {
      return {
        now: {
          carDuration: `${apiData?.routes?.car?.duration || 30}분`,
          transitDuration: `${apiData?.routes?.transit?.duration || 25}분`,
          recommendation: formatTransportType(
            apiData?.recommendations?.primary?.type || 'transit',
          ),
          reasons: [apiData?.recommendations?.primary?.reason || '경제적'],
        },
      }
    }

    const timemachine = apiData.routes.car.timemachine_data
    return {
      now: {
        carDuration: `${timemachine.recommended?.duration || 30}분`,
        transitDuration: `${apiData?.routes?.transit?.duration || 25}분`,
        recommendation: timemachine.recommended ? '자동차' : '대중교통',
        reasons: timemachine.recommended
          ? ['타임머신 예측', '최적 경로']
          : ['일반 추천'],
      },
    }
  }

  const currentRoutes = transportData
    ? createRoutesFromApiData(transportData)
    : []
  const currentTimeMachine = transportData
    ? createTimeMachineData(transportData)
    : {}

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
            <p className="text-sm text-gray-600">교통정보를 불러오는 중...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error && !transportData) {
    const isAuthError = error.includes('로그인')

    return (
      <Card className="transport-card w-full">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="mb-2 text-red-500">⚠️</div>
            <p className="mb-2 text-sm text-red-600">{error}</p>
            <div className="space-x-2">
              {isAuthError ? (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigate('/login')}
                >
                  로그인하기
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setError(null)
                    setLoading(true)
                    // 재시도 로직은 useEffect에서 처리됨
                  }}
                >
                  다시 시도
                </Button>
              )}
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
              <p className="text-sm text-gray-600">기본 교통정보</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 기본 샘플 데이터로 교통수단 선택 및 상세정보 제공 */}
          <TransportModeSelector
            modes={['transit', 'car', 'walk']}
            selected={selectedMode}
            onChange={setSelectedMode}
          />

          <RouteComparison
            routes={[
              {
                name: '대중교통',
                mode: 'bus',
                duration: route.duration || 25,
                distance: formatDistance(route.distance || 2.0),
                cost: formatCost(route.cost || 1500),
                rating: 5,
                recommendation: '경제적',
                details: [
                  '🔄 환승 1회',
                  '🚌 472번 버스',
                  '🚇 지하철 2호선',
                  '💳 교통카드 결제',
                  '🌱 친환경',
                  '🕐 첫차 05:30',
                  '🕘 막차 23:50',
                  '⏱️ 배차간격 8분',
                  '📍 실시간 도착정보',
                  '♿ 휠체어 이용 가능',
                ],
                transitInfo: {
                  transferCount: 1,
                  busTransferCount: 1,
                  subwayTransferCount: 0,
                  routeInfo: [
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
                  walkingDistance: 300,
                  totalStops: 8,
                  peakTimeMultiplier: 1.2,
                },
              },
              {
                name: '자동차',
                mode: 'car',
                duration: route.duration
                  ? Math.round(route.duration * 0.8)
                  : 20,
                distance: formatDistance(route.distance || 2.0),
                cost: formatCost(3000),
                rating: 4,
                recommendation: '빠름',
                details: ['🚗 개인차량', '⛽ 연료비', '🅿️ 주차요금'],
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

          <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
            💡 <strong>참고:</strong> 정확한 교통정보를 위해서는 출발지와 목적지
            좌표가 필요합니다. 현재는 예상 정보를 제공하고 있습니다.
          </div>
        </CardContent>
      </Card>
    )
  }

  // 교통수단 이름 반환 (컴포넌트 내부 함수)
  function getTransportName(transportType) {
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
        return '이동'
    }
  }

  return (
    <Card className="transport-card w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              {route.from} → {route.to}
            </h3>
            <p className="text-sm text-gray-600">교통정보 및 경로 안내</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 여행 날짜 상태 표시 */}
        {isPastTravel && (
          <div className="rounded-lg bg-gray-100 p-3 text-center">
            <span className="text-sm text-gray-600">
              📅 과거 여행 기록 - 실시간 교통정보는 현재/미래 여행에서만
              제공됩니다
            </span>
          </div>
        )}

        {/* 시간 선택 UI - 과거 여행이 아닌 경우만 표시 */}
        {!isPastTravel && (
          <div className="border-b pb-4">
            {isToday && (
              <div className="mb-2 inline-block rounded bg-blue-50 px-2 py-1 text-xs text-blue-600">
                🔴 여행 계획 - 실시간 교통정보 제공
              </div>
            )}
            <TimeSelector
              value={selectedTime}
              onChange={setSelectedTime}
              options={['now', 'hour1', 'hour2', 'custom']}
            />
          </div>
        )}
        <TransportModeSelector
          modes={['transit', 'car', 'walk']}
          selected={selectedMode}
          onChange={setSelectedMode}
        />

        <RouteComparison routes={filteredRoutes} />

        <TimeMachineInsights
          time={selectedTime}
          predictions={currentTimeMachine}
        />

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
                    <tr className="border-b">
                      <th className="p-2 text-left">교통수단</th>
                      <th className="p-2 text-left">소요시간</th>
                      <th className="p-2 text-left">비용</th>
                      <th className="p-2 text-left">편의성</th>
                      <th className="p-2 text-left">추천도</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="flex items-center space-x-2 p-2">
                        <Bus className="h-4 w-4" />
                        <span>버스</span>
                      </td>
                      <td className="p-2">27분</td>
                      <td className="p-2">1,500원</td>
                      <td className="p-2">⭐⭐⭐</td>
                      <td className="p-2">95%</td>
                    </tr>
                    <tr className="border-b">
                      <td className="flex items-center space-x-2 p-2">
                        <Train className="h-4 w-4" />
                        <span>지하철</span>
                      </td>
                      <td className="p-2">35분</td>
                      <td className="p-2">1,370원</td>
                      <td className="p-2">⭐⭐⭐⭐</td>
                      <td className="p-2">80%</td>
                    </tr>
                    <tr>
                      <td className="flex items-center space-x-2 p-2">
                        <Car className="h-4 w-4" />
                        <span>자동차</span>
                      </td>
                      <td className="p-2">29분</td>
                      <td className="p-2">2,995원</td>
                      <td className="p-2">⭐⭐⭐⭐⭐</td>
                      <td className="p-2">70%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 실시간 정보 */}
              <div className="rounded-lg bg-green-50 p-3">
                <div className="mb-2 flex items-center space-x-2">
                  <Info className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">
                    실시간 정보
                  </span>
                </div>
                <div className="space-y-1 text-sm text-green-700">
                  <div>🚌 505번 버스: 3분 후 도착 예정</div>
                  <div>🚇 1호선: 정상 운행 중 (여유)</div>
                  <div>🚗 교통상황: 원활 (평소보다 빠름)</div>
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
          <Button className="flex-1">
            <Clock className="mr-2 h-4 w-4" />
            알림 설정
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default EnhancedTransportCard
