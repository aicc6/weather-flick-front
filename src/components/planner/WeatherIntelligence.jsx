import { memo, useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Cloud,
  Sun,
  CloudRain,
  Wind,
  Droplets,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from '@/components/icons'

/**
 * 실시간 날씨 기반 여행 적합도 분석 컴포넌트
 */
const WeatherIntelligence = memo(
  ({ location, travelDates = [], plannedActivities = [], className }) => {
    const [weatherData, setWeatherData] = useState([])
    const [loading, setLoading] = useState(false)
    const [alerts, setAlerts] = useState([])

    // 날씨 아이콘 매핑
    const weatherIcons = {
      sunny: Sun,
      cloudy: Cloud,
      rainy: CloudRain,
      windy: Wind,
    }

    // 활동별 날씨 적합도 기준
    const activityWeatherRequirements = useMemo(
      () => ({
        야외활동: {
          optimal: { temp: [15, 25], rain: [0, 10], wind: [0, 15] },
          acceptable: { temp: [10, 30], rain: [0, 30], wind: [0, 25] },
        },
        해변활동: {
          optimal: { temp: [20, 30], rain: [0, 5], wind: [0, 10] },
          acceptable: { temp: [15, 35], rain: [0, 20], wind: [0, 20] },
        },
        실내활동: {
          optimal: { temp: [10, 35], rain: [0, 100], wind: [0, 50] },
          acceptable: { temp: [-10, 40], rain: [0, 100], wind: [0, 100] },
        },
        등산: {
          optimal: { temp: [5, 20], rain: [0, 5], wind: [0, 20] },
          acceptable: { temp: [0, 25], rain: [0, 15], wind: [0, 30] },
        },
      }),
      [],
    )

    // 날씨 데이터 로드
    useEffect(() => {
      if (!location || travelDates.length === 0) return

      const loadWeatherData = async () => {
        setLoading(true)
        try {
          // 실제로는 날씨 API 호출
          const mockWeatherData = travelDates.map((date, index) => ({
            date,
            temperature: 22 + Math.random() * 8,
            humidity: 60 + Math.random() * 30,
            precipitation: Math.random() * 20,
            windSpeed: Math.random() * 25,
            condition: ['sunny', 'cloudy', 'rainy'][
              Math.floor(Math.random() * 3)
            ],
            uvIndex: Math.floor(Math.random() * 10),
            airQuality: 'good',
          }))

          setWeatherData(mockWeatherData)
          generateWeatherAlerts(mockWeatherData)
        } catch (error) {
          console.error('날씨 데이터 로드 실패:', error)
        } finally {
          setLoading(false)
        }
      }

      loadWeatherData()
    }, [location, travelDates])

    // 날씨 알림 생성
    const generateWeatherAlerts = (data) => {
      const newAlerts = []

      data.forEach((dayWeather, index) => {
        // 강수량 경고
        if (dayWeather.precipitation > 30) {
          newAlerts.push({
            type: 'warning',
            date: dayWeather.date,
            message: `비가 많이 올 예정입니다 (${dayWeather.precipitation.toFixed(1)}mm). 실내 활동을 권장합니다.`,
          })
        }

        // 강풍 경고
        if (dayWeather.windSpeed > 30) {
          newAlerts.push({
            type: 'warning',
            date: dayWeather.date,
            message: `강풍이 예상됩니다 (${dayWeather.windSpeed.toFixed(1)}m/s). 야외 활동 시 주의하세요.`,
          })
        }

        // 완벽한 날씨 알림
        if (
          dayWeather.precipitation < 5 &&
          dayWeather.temperature >= 18 &&
          dayWeather.temperature <= 25 &&
          dayWeather.windSpeed < 15
        ) {
          newAlerts.push({
            type: 'success',
            date: dayWeather.date,
            message: '완벽한 여행 날씨입니다! 모든 야외 활동에 적합합니다.',
          })
        }
      })

      setAlerts(newAlerts)
    }

    // 활동 적합도 계산
    const calculateActivitySuitability = (dayWeather, activity) => {
      const requirements = activityWeatherRequirements[activity]
      if (!requirements) return 'unknown'

      const { temperature, precipitation, windSpeed } = dayWeather
      const { optimal, acceptable } = requirements

      const isOptimal =
        temperature >= optimal.temp[0] &&
        temperature <= optimal.temp[1] &&
        precipitation >= optimal.rain[0] &&
        precipitation <= optimal.rain[1] &&
        windSpeed >= optimal.wind[0] &&
        windSpeed <= optimal.wind[1]

      if (isOptimal) return 'optimal'

      const isAcceptable =
        temperature >= acceptable.temp[0] &&
        temperature <= acceptable.temp[1] &&
        precipitation >= acceptable.rain[0] &&
        precipitation <= acceptable.rain[1] &&
        windSpeed >= acceptable.wind[0] &&
        windSpeed <= acceptable.wind[1]

      return isAcceptable ? 'acceptable' : 'poor'
    }

    // 적합도 아이콘 및 색상
    const getSuitabilityDisplay = (level) => {
      switch (level) {
        case 'optimal':
          return {
            icon: CheckCircle,
            color: 'text-green-600',
            bg: 'bg-green-50',
            label: '최적',
          }
        case 'acceptable':
          return {
            icon: CheckCircle,
            color: 'text-yellow-600',
            bg: 'bg-yellow-50',
            label: '양호',
          }
        case 'poor':
          return {
            icon: XCircle,
            color: 'text-red-600',
            bg: 'bg-red-50',
            label: '부적절',
          }
        default:
          return {
            icon: AlertTriangle,
            color: 'text-gray-600',
            bg: 'bg-gray-50',
            label: '미확인',
          }
      }
    }

    if (loading) {
      return (
        <Card className={className}>
          <CardContent className="flex items-center justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
            <span className="ml-2">날씨 정보를 분석 중...</span>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Cloud className="h-5 w-5 text-blue-600" />
            <span>날씨 기반 여행 적합도</span>
          </CardTitle>
        </CardHeader>

        <CardContent>
          {/* 날씨 알림 */}
          {alerts.length > 0 && (
            <div className="mb-6 space-y-2">
              {alerts.map((alert, index) => (
                <Alert
                  key={index}
                  className={
                    alert.type === 'warning'
                      ? 'border-orange-200'
                      : 'border-green-200'
                  }
                >
                  <AlertTriangle
                    className={`h-4 w-4 ${alert.type === 'warning' ? 'text-orange-600' : 'text-green-600'}`}
                  />
                  <AlertDescription>
                    <strong>
                      {new Date(alert.date).toLocaleDateString('ko-KR')}:
                    </strong>{' '}
                    {alert.message}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {/* 일별 날씨 및 활동 적합도 */}
          <div className="space-y-4">
            {weatherData.map((dayWeather, index) => {
              const WeatherIcon = weatherIcons[dayWeather.condition] || Cloud

              return (
                <div key={index} className="rounded-lg border p-4">
                  {/* 날짜 및 기본 날씨 */}
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-center">
                        <div className="font-semibold">
                          {new Date(dayWeather.date).toLocaleDateString(
                            'ko-KR',
                            { month: 'short', day: 'numeric' },
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(dayWeather.date).toLocaleDateString(
                            'ko-KR',
                            { weekday: 'short' },
                          )}
                        </div>
                      </div>
                      <WeatherIcon className="h-8 w-8 text-blue-600" />
                      <div>
                        <div className="text-xl font-bold">
                          {dayWeather.temperature.toFixed(1)}°C
                        </div>
                        <div className="text-sm text-gray-600 capitalize">
                          {dayWeather.condition === 'sunny' && '맑음'}
                          {dayWeather.condition === 'cloudy' && '흐림'}
                          {dayWeather.condition === 'rainy' && '비'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 상세 날씨 정보 */}
                  <div className="mb-4 grid grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <Droplets className="mx-auto mb-1 h-4 w-4 text-blue-500" />
                      <div className="font-medium">
                        {dayWeather.precipitation.toFixed(1)}mm
                      </div>
                      <div className="text-xs text-gray-500">강수량</div>
                    </div>
                    <div className="text-center">
                      <Droplets className="mx-auto mb-1 h-4 w-4 text-cyan-500" />
                      <div className="font-medium">
                        {dayWeather.humidity.toFixed(0)}%
                      </div>
                      <div className="text-xs text-gray-500">습도</div>
                    </div>
                    <div className="text-center">
                      <Wind className="mx-auto mb-1 h-4 w-4 text-gray-500" />
                      <div className="font-medium">
                        {dayWeather.windSpeed.toFixed(1)}m/s
                      </div>
                      <div className="text-xs text-gray-500">풍속</div>
                    </div>
                    <div className="text-center">
                      <Sun className="mx-auto mb-1 h-4 w-4 text-yellow-500" />
                      <div className="font-medium">{dayWeather.uvIndex}</div>
                      <div className="text-xs text-gray-500">자외선</div>
                    </div>
                  </div>

                  {/* 활동별 적합도 */}
                  {plannedActivities.length > 0 && (
                    <div>
                      <h5 className="mb-2 text-sm font-medium">활동 적합도</h5>
                      <div className="flex flex-wrap gap-2">
                        {plannedActivities.map((activity) => {
                          const suitability = calculateActivitySuitability(
                            dayWeather,
                            activity,
                          )
                          const display = getSuitabilityDisplay(suitability)
                          const IconComponent = display.icon

                          return (
                            <Badge
                              key={activity}
                              variant="outline"
                              className={`${display.bg} ${display.color} border-current`}
                            >
                              <IconComponent className="mr-1 h-3 w-3" />
                              {activity}: {display.label}
                            </Badge>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* 전체 여행 날씨 요약 */}
          {weatherData.length > 0 && (
            <div className="mt-6 rounded-lg bg-blue-50 p-4">
              <h5 className="mb-2 font-medium text-blue-900">
                여행 기간 날씨 요약
              </h5>
              <div className="text-sm text-blue-800">
                <p>
                  • 평균 기온:{' '}
                  {(
                    weatherData.reduce((sum, day) => sum + day.temperature, 0) /
                    weatherData.length
                  ).toFixed(1)}
                  °C
                </p>
                <p>
                  • 총 예상 강수량:{' '}
                  {weatherData
                    .reduce((sum, day) => sum + day.precipitation, 0)
                    .toFixed(1)}
                  mm
                </p>
                <p>
                  • 날씨 좋은 날:{' '}
                  {
                    weatherData.filter(
                      (day) =>
                        day.precipitation < 10 &&
                        day.temperature >= 15 &&
                        day.temperature <= 25,
                    ).length
                  }
                  일
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  },
)

WeatherIntelligence.displayName = 'WeatherIntelligence'

export default WeatherIntelligence
