import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  MapPin,
  Clock,
} from '@/components/icons'

/**
 * 실시간 교통 상황 위젯
 *
 * 주요 기능:
 * - 현재 교통 상황 모니터링
 * - 주요 도로별 혼잡도 표시
 * - 사고/공사 정보 알림
 * - 예상 지연시간 계산
 * - 대체 경로 제안
 */

export function RealTimeTrafficWidget({
  route,
  onRouteChange,
  className = '',
}) {
  const [trafficData, setTrafficData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [autoRefresh, setAutoRefresh] = useState(true)

  // 실시간 교통 데이터 가져오기
  useEffect(() => {
    const fetchTrafficData = () => {
      setIsLoading(true)

      // 실제로는 교통 API에서 데이터를 가져와야 함
      setTimeout(() => {
        const mockData = generateRealTimeTrafficData(route)
        setTrafficData(mockData)
        setLastUpdate(new Date())
        setIsLoading(false)
      }, 1000)
    }

    fetchTrafficData()

    // 자동 새로고침 (30초마다)
    let interval
    if (autoRefresh) {
      interval = setInterval(fetchTrafficData, 30000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [route, autoRefresh])

  const refreshData = () => {
    const fetchData = () => {
      setIsLoading(true)
      setTimeout(() => {
        const mockData = generateRealTimeTrafficData(route)
        setTrafficData(mockData)
        setLastUpdate(new Date())
        setIsLoading(false)
      }, 500)
    }
    fetchData()
  }

  const getOverallStatus = () => {
    if (!trafficData)
      return { level: 'unknown', text: '정보 없음', color: 'gray' }

    const avgDelay =
      trafficData.roads.reduce((sum, road) => sum + road.delayMinutes, 0) /
      trafficData.roads.length

    if (avgDelay < 5) return { level: 'smooth', text: '원활', color: 'green' }
    if (avgDelay < 15)
      return { level: 'moderate', text: '보통', color: 'yellow' }
    return { level: 'heavy', text: '혼잡', color: 'red' }
  }

  const formatLastUpdate = () => {
    const now = new Date()
    const diff = Math.floor((now - lastUpdate) / 1000)

    if (diff < 60) return `${diff}초 전`
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
    return `${Math.floor(diff / 3600)}시간 전`
  }

  const status = getOverallStatus()

  if (!trafficData && !isLoading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="p-4 text-center">
          <div className="text-gray-500 dark:text-gray-400">
            교통정보를 불러올 수 없습니다
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-base">
            <MapPin className="h-4 w-4" />
            <span>실시간 교통상황</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge
              variant={
                status.color === 'green'
                  ? 'default'
                  : status.color === 'yellow'
                    ? 'secondary'
                    : 'destructive'
              }
              className="text-xs"
            >
              {status.text}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshData}
              disabled={isLoading}
              className="h-6 w-6 p-0"
            >
              <RefreshCw
                className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`}
              />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>마지막 업데이트: {formatLastUpdate()}</span>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`text-xs ${autoRefresh ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}
          >
            자동새로고침 {autoRefresh ? 'ON' : 'OFF'}
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 전체 상황 요약 */}
        <div
          className={`rounded-lg p-3 ${
            status.color === 'green'
              ? 'border border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
              : status.color === 'yellow'
                ? 'border border-yellow-200 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20'
                : 'border border-red-200 bg-red-50 dark:border-red-700 dark:bg-red-900/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {trafficData?.summary?.routeName || '선택된 경로'}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                예상 소요시간: {trafficData?.summary?.totalTime || '계산중'}분
                {trafficData?.summary?.delayFromNormal > 0 && (
                  <span className="ml-1 text-red-600 dark:text-red-400">
                    (+{trafficData.summary.delayFromNormal}분 지연)
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {trafficData?.summary?.distance || '계산중'}km
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                총 거리
              </div>
            </div>
          </div>
        </div>

        {/* 도로별 상세 정보 */}
        {trafficData?.roads && (
          <div>
            <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              주요 경로 상황
            </h4>
            <div className="space-y-2">
              {trafficData.roads.map((road, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded bg-gray-50 p-2 dark:bg-gray-800"
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        road.level === 'smooth'
                          ? 'bg-green-500'
                          : road.level === 'moderate'
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      }`}
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {road.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {road.delayMinutes > 0
                        ? `+${road.delayMinutes}분`
                        : '정상'}
                    </div>
                    {road.incident && (
                      <div className="text-xs text-red-600 dark:text-red-400">
                        ⚠️ {road.incident}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 교통 사고/공사 알림 */}
        {trafficData?.alerts && trafficData.alerts.length > 0 && (
          <div>
            <h4 className="mb-2 flex items-center text-sm font-medium text-gray-900 dark:text-gray-100">
              <AlertTriangle className="mr-1 h-4 w-4 text-orange-500" />
              교통 정보
            </h4>
            <div className="space-y-2">
              {trafficData.alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`rounded border-l-4 p-2 text-sm ${
                    alert.severity === 'high'
                      ? 'border-red-500 bg-red-50 dark:border-red-400 dark:bg-red-900/20'
                      : alert.severity === 'medium'
                        ? 'border-yellow-500 bg-yellow-50 dark:border-yellow-400 dark:bg-yellow-900/20'
                        : 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                  }`}
                >
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {alert.title}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {alert.description}
                  </div>
                  {alert.estimatedDelay && (
                    <div className="mt-1 text-xs text-gray-700 dark:text-gray-300">
                      예상 지연: {alert.estimatedDelay}분
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 대체 경로 제안 */}
        {trafficData?.alternatives && trafficData.alternatives.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              대체 경로
            </h4>
            <div className="space-y-2">
              {trafficData.alternatives.map((alt, index) => (
                <div
                  key={index}
                  className="cursor-pointer rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                  onClick={() => onRouteChange && onRouteChange(alt)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {alt.name}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {alt.distance}km • {alt.time}분
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={alt.savings > 0 ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {alt.savings > 0 ? `-${alt.savings}분` : '비슷함'}
                      </Badge>
                      {alt.savings > 0 && (
                        <div className="mt-1 text-xs text-green-600 dark:text-green-400">
                          추천 경로
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 교통 트렌드 */}
        {trafficData?.trends && (
          <div>
            <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              교통 트렌드
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded bg-blue-50 p-2 text-center dark:bg-blue-900/20">
                <div className="flex items-center justify-center space-x-1">
                  {trafficData.trends.direction === 'improving' ? (
                    <TrendingDown className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                    {trafficData.trends.direction === 'improving'
                      ? '개선중'
                      : '악화중'}
                  </span>
                </div>
                <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  {trafficData.trends.prediction}
                </div>
              </div>
              <div className="rounded bg-purple-50 p-2 text-center dark:bg-purple-900/20">
                <div className="flex items-center justify-center space-x-1">
                  <Clock className="h-4 w-4 text-purple-500" />
                  <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                    최적 시간
                  </span>
                </div>
                <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  {trafficData.trends.bestTime}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// 모의 실시간 교통 데이터 생성 함수
const generateRealTimeTrafficData = (_route) => {
  const currentHour = new Date().getHours()
  const isRushHour =
    (currentHour >= 7 && currentHour <= 9) ||
    (currentHour >= 18 && currentHour <= 20)

  // 기본 지연시간 계산
  const baseDelay = isRushHour
    ? Math.floor(Math.random() * 15) + 5
    : Math.floor(Math.random() * 5)

  const roads = [
    {
      name: '디지털로',
      level: isRushHour ? 'moderate' : 'smooth',
      delayMinutes: Math.floor(Math.random() * 8),
      incident: Math.random() < 0.1 ? '공사 중' : null,
    },
    {
      name: '가산로',
      level: isRushHour ? 'heavy' : 'moderate',
      delayMinutes: Math.floor(Math.random() * 12),
      incident: Math.random() < 0.05 ? '사고 발생' : null,
    },
    {
      name: '경인로',
      level: 'moderate',
      delayMinutes: Math.floor(Math.random() * 6),
      incident: null,
    },
  ]

  const alerts = []
  if (isRushHour) {
    alerts.push({
      severity: 'medium',
      title: '출퇴근 시간대 혼잡',
      description: '평소보다 10-15분 더 소요될 수 있습니다',
      estimatedDelay: Math.floor(Math.random() * 10) + 10,
    })
  }

  if (Math.random() < 0.2) {
    alerts.push({
      severity: 'high',
      title: '교통사고 발생',
      description: '구로구 디지털로 일대에서 접촉사고 발생',
      estimatedDelay: Math.floor(Math.random() * 20) + 5,
    })
  }

  const alternatives = [
    {
      name: '시흥대로 경유',
      distance: '2.8',
      time: '18',
      savings: Math.floor(Math.random() * 8),
    },
    {
      name: '도림로 우회',
      distance: '3.2',
      time: '22',
      savings: Math.floor(Math.random() * 5),
    },
  ]

  return {
    summary: {
      routeName:
        _route?.from && _route?.to
          ? `${_route.from} → ${_route.to}`
          : '경로 정보 없음',
      totalTime: 15 + baseDelay,
      delayFromNormal: baseDelay,
      distance: _route?.distance || '2.1',
    },
    roads,
    alerts,
    alternatives,
    trends: {
      direction: isRushHour ? 'worsening' : 'improving',
      prediction: isRushHour ? '1시간 후 개선 예상' : '현재 원활한 흐름',
      bestTime: isRushHour ? '오후 8시 이후' : '현재 최적',
    },
  }
}

export default RealTimeTrafficWidget
