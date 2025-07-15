import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, Zap, AlertTriangle } from '@/components/icons'

/**
 * 고급 시간대별 예측 타임라인 컴포넌트
 *
 * 주요 기능:
 * - 24시간 비주얼 타임라인
 * - 실시간 교통 혼잡도 예측
 * - 최적 출발시간 추천
 * - 비용/시간 트렌드 그래프
 * - 날씨 영향 반영
 */

export function TimelinePrediction({
  route,
  onTimeSelect,
  selectedTime,
  _currentPredictions = {},
}) {
  const [viewMode, setViewMode] = useState('timeline') // 'timeline', 'comparison', 'trends'
  const [detailHour, setDetailHour] = useState(null)

  // 24시간 시간대별 예측 데이터 생성
  const hourlyPredictions = useMemo(() => {
    const predictions = []
    const now = new Date()

    for (let hour = 0; hour < 24; hour++) {
      const targetTime = new Date()
      targetTime.setHours(hour, 0, 0, 0)

      // 현재 시간보다 이전이면 다음날로 설정
      if (targetTime <= now) {
        targetTime.setDate(targetTime.getDate() + 1)
      }

      const prediction = generateHourlyPrediction(hour, route)
      predictions.push({
        hour,
        time: targetTime,
        displayTime: formatDisplayTime(hour),
        ...prediction,
      })
    }

    return predictions
  }, [route])

  // 최적 시간대 찾기
  const optimalTimes = useMemo(() => {
    return hourlyPredictions
      .map((p, index) => ({ ...p, index }))
      .sort((a, b) => a.totalScore - b.totalScore)
      .slice(0, 3)
  }, [hourlyPredictions])

  const renderTimelineView = () => (
    <div className="space-y-4">
      {/* 타임라인 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">24시간 교통 예측</h3>
          <p className="text-sm text-gray-600">
            시간대별 소요시간 및 비용 변화
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant={viewMode === 'timeline' ? 'default' : 'outline'}
            onClick={() => setViewMode('timeline')}
          >
            📊 타임라인
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'comparison' ? 'default' : 'outline'}
            onClick={() => setViewMode('comparison')}
          >
            ⚖️ 비교
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'trends' ? 'default' : 'outline'}
            onClick={() => setViewMode('trends')}
          >
            📈 트렌드
          </Button>
        </div>
      </div>

      {/* 최적 시간 추천 */}
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
        <CardContent className="p-4">
          <div className="mb-3 flex items-center space-x-2">
            <Zap className="h-5 w-5 text-green-600" />
            <h4 className="font-medium text-green-800">추천 출발 시간</h4>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {optimalTimes.map((optimal, index) => (
              <div
                key={optimal.hour}
                className={`cursor-pointer rounded-lg border p-3 transition-all ${
                  selectedTime === `hour_${optimal.hour}`
                    ? 'border-green-500 bg-green-100'
                    : 'border-green-200 bg-white hover:border-green-300'
                }`}
                onClick={() => onTimeSelect(`hour_${optimal.hour}`)}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-medium text-green-800">
                    {optimal.displayTime}
                  </span>
                  <Badge
                    variant={index === 0 ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {index === 0 ? '최적' : index === 1 ? '차선' : '3순위'}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">소요시간:</span>
                    <span className="font-medium">{optimal.duration}분</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">비용:</span>
                    <span className="font-medium">{optimal.cost}원</span>
                  </div>
                  <div className="text-xs text-green-600">
                    {optimal.advantages.slice(0, 2).join(', ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 24시간 타임라인 그리드 */}
      <div className="grid grid-cols-6 gap-2">
        {hourlyPredictions.map((prediction) => (
          <TimelineHourCard
            key={prediction.hour}
            prediction={prediction}
            isSelected={selectedTime === `hour_${prediction.hour}`}
            isOptimal={optimalTimes.some((opt) => opt.hour === prediction.hour)}
            onClick={() => {
              onTimeSelect(`hour_${prediction.hour}`)
              setDetailHour(prediction.hour)
            }}
          />
        ))}
      </div>

      {/* 상세 정보 패널 */}
      {detailHour !== null && (
        <HourDetailPanel
          prediction={hourlyPredictions[detailHour]}
          onClose={() => setDetailHour(null)}
        />
      )}
    </div>
  )

  const renderComparisonView = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">교통수단별 시간대 비교</h3>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {['car', 'transit', 'walk'].map((mode) => (
          <TransportModeComparison
            key={mode}
            mode={mode}
            predictions={hourlyPredictions}
            route={route}
          />
        ))}
      </div>
    </div>
  )

  const renderTrendsView = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">교통 트렌드 분석</h3>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TrendChart
          title="시간대별 소요시간 변화"
          data={hourlyPredictions}
          dataKey="duration"
          color="#3B82F6"
        />
        <TrendChart
          title="시간대별 비용 변화"
          data={hourlyPredictions}
          dataKey="cost"
          color="#10B981"
        />
      </div>
      <TrafficInsights predictions={hourlyPredictions} />
    </div>
  )

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>스마트 시간 예측</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {viewMode === 'timeline' && renderTimelineView()}
        {viewMode === 'comparison' && renderComparisonView()}
        {viewMode === 'trends' && renderTrendsView()}
      </CardContent>
    </Card>
  )
}

// 시간대별 카드 컴포넌트
const TimelineHourCard = ({ prediction, isSelected, isOptimal, onClick }) => {
  const getCardStyle = () => {
    if (isSelected) return 'border-blue-500 bg-blue-50'
    if (isOptimal) return 'border-green-500 bg-green-50'

    const congestionColor = {
      low: 'border-green-200 bg-green-25',
      medium: 'border-yellow-200 bg-yellow-25',
      high: 'border-red-200 bg-red-25',
    }

    return (
      congestionColor[prediction.congestionLevel] ||
      'border-gray-200 bg-gray-25'
    )
  }

  const getCongestionIcon = () => {
    switch (prediction.congestionLevel) {
      case 'low':
        return '🟢'
      case 'medium':
        return '🟡'
      case 'high':
        return '🔴'
      default:
        return '⚪'
    }
  }

  return (
    <div
      className={`cursor-pointer rounded-lg border p-3 transition-all hover:shadow-md ${getCardStyle()}`}
      onClick={onClick}
    >
      <div className="space-y-1 text-center">
        <div className="text-sm font-medium">{prediction.displayTime}</div>
        <div className="text-xs text-gray-600">{prediction.duration}분</div>
        <div className="text-xs">
          {getCongestionIcon()} {prediction.congestionText}
        </div>
        {prediction.weather && (
          <div className="text-xs">
            {prediction.weather.icon} {prediction.weather.impact}
          </div>
        )}
        {isOptimal && (
          <Badge variant="default" className="text-xs">
            ⭐ 추천
          </Badge>
        )}
      </div>
    </div>
  )
}

// 시간별 상세 정보 패널
const HourDetailPanel = ({ prediction, onClose }) => (
  <Card className="border-blue-200">
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg">
          {prediction.displayTime} 출발 상세정보
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          ✕
        </Button>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-lg bg-blue-50 p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {prediction.duration}분
          </div>
          <div className="text-sm text-blue-800">예상 소요시간</div>
        </div>
        <div className="rounded-lg bg-green-50 p-3 text-center">
          <div className="text-2xl font-bold text-green-600">
            {prediction.cost}원
          </div>
          <div className="text-sm text-green-800">예상 비용</div>
        </div>
        <div className="rounded-lg bg-purple-50 p-3 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {prediction.reliability}%
          </div>
          <div className="text-sm text-purple-800">예측 신뢰도</div>
        </div>
        <div className="rounded-lg bg-orange-50 p-3 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {prediction.crowdLevel}
          </div>
          <div className="text-sm text-orange-800">혼잡도</div>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium">이 시간대 특징</h4>
        <ul className="space-y-1 text-sm">
          {prediction.advantages.map((advantage, index) => (
            <li key={index} className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span>{advantage}</span>
            </li>
          ))}
          {prediction.disadvantages.map((disadvantage, index) => (
            <li key={index} className="flex items-center space-x-2">
              <span className="text-red-500">✗</span>
              <span>{disadvantage}</span>
            </li>
          ))}
        </ul>
      </div>

      {prediction.alerts && prediction.alerts.length > 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
          <div className="mb-2 flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <span className="font-medium text-yellow-800">주의사항</span>
          </div>
          <ul className="space-y-1 text-sm text-yellow-700">
            {prediction.alerts.map((alert, index) => (
              <li key={index}>• {alert}</li>
            ))}
          </ul>
        </div>
      )}
    </CardContent>
  </Card>
)

// 교통수단별 비교 컴포넌트
const TransportModeComparison = ({ mode, predictions, _route }) => {
  const modeConfig = {
    car: { name: '자동차', icon: '🚗', color: 'blue' },
    transit: { name: '대중교통', icon: '🚇', color: 'green' },
    walk: { name: '도보', icon: '🚶', color: 'purple' },
  }

  const config = modeConfig[mode]
  const bestTimes = predictions
    .filter((p) => p[mode])
    .sort((a, b) => a[mode].duration - b[mode].duration)
    .slice(0, 3)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <span className="text-xl">{config.icon}</span>
          <span>{config.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {bestTimes.map((time, index) => (
            <div
              key={time.hour}
              className={`rounded-lg border-l-4 p-3 border-${config.color}-500 bg-${config.color}-25`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{time.displayTime}</div>
                  <div className="text-sm text-gray-600">
                    {time[mode].duration}분 • {time[mode].cost}원
                  </div>
                </div>
                <Badge variant={index === 0 ? 'default' : 'secondary'}>
                  {index + 1}순위
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// 트렌드 차트 컴포넌트 (간단한 SVG 구현)
const TrendChart = ({ title, data, dataKey, color }) => {
  const max = Math.max(...data.map((d) => d[dataKey]))
  const min = Math.min(...data.map((d) => d[dataKey]))
  const range = max - min

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-32 w-full">
          <svg width="100%" height="100%" viewBox="0 0 300 100">
            <polyline
              fill="none"
              stroke={color}
              strokeWidth="2"
              points={data
                .map((d, i) => {
                  const x = (i / (data.length - 1)) * 280 + 10
                  const y = 90 - ((d[dataKey] - min) / range) * 70
                  return `${x},${y}`
                })
                .join(' ')}
            />
            {data.map((d, i) => {
              const x = (i / (data.length - 1)) * 280 + 10
              const y = 90 - ((d[dataKey] - min) / range) * 70
              return <circle key={i} cx={x} cy={y} r="3" fill={color} />
            })}
          </svg>
        </div>
      </CardContent>
    </Card>
  )
}

// 교통 인사이트 컴포넌트
const TrafficInsights = ({ predictions }) => {
  const insights = analyzeTrafficPatterns(predictions)

  return (
    <Card>
      <CardHeader>
        <CardTitle>교통 패턴 분석</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <h4 className="mb-2 font-medium">🕐 피크 시간대</h4>
            <div className="space-y-1 text-sm">
              <div>• 오전 피크: {insights.morningPeak}</div>
              <div>• 오후 피크: {insights.eveningPeak}</div>
              <div>• 최악 시간: {insights.worstTime}</div>
            </div>
          </div>
          <div>
            <h4 className="mb-2 font-medium">💡 추천 사항</h4>
            <div className="space-y-1 text-sm">
              {insights.recommendations.map((rec, index) => (
                <div key={index}>• {rec}</div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// 유틸리티 함수들
const formatDisplayTime = (hour) => {
  if (hour === 0) return '자정'
  if (hour === 12) return '정오'
  if (hour < 12) return `오전 ${hour}시`
  return `오후 ${hour - 12}시`
}

const generateHourlyPrediction = (hour, _route) => {
  // 실제로는 백엔드 API에서 받아올 데이터
  const baseTime = 25
  const baseCost = 1500

  // 시간대별 교통 패턴 시뮬레이션
  let multiplier = 1
  let congestionLevel = 'low'
  let advantages = []
  let disadvantages = []
  let alerts = []

  if (hour >= 7 && hour <= 9) {
    multiplier = 1.5
    congestionLevel = 'high'
    disadvantages.push('출근 시간대 혼잡')
    alerts.push('대중교통 만차 가능성')
  } else if (hour >= 18 && hour <= 20) {
    multiplier = 1.4
    congestionLevel = 'high'
    disadvantages.push('퇴근 시간대 혼잡')
  } else if (hour >= 22 || hour <= 6) {
    multiplier = 0.8
    congestionLevel = 'low'
    advantages.push('도로 한산')
    advantages.push('빠른 이동 가능')
  } else {
    multiplier = 1.1
    congestionLevel = 'medium'
    advantages.push('적정 교통량')
  }

  return {
    duration: Math.round(baseTime * multiplier),
    cost: Math.round(baseCost * (multiplier * 0.8)),
    congestionLevel,
    congestionText:
      congestionLevel === 'low'
        ? '원활'
        : congestionLevel === 'medium'
          ? '보통'
          : '혼잡',
    reliability: Math.round(100 - (multiplier - 1) * 30),
    crowdLevel: Math.round(multiplier * 3),
    advantages,
    disadvantages,
    alerts,
    totalScore: baseTime * multiplier + (multiplier - 1) * 10,
    weather: hour >= 14 && hour <= 16 ? { icon: '☀️', impact: '맑음' } : null,
    car: {
      duration: Math.round(baseTime * 0.8 * multiplier),
      cost: Math.round(3000 * multiplier),
    },
    transit: {
      duration: Math.round(baseTime * multiplier),
      cost: baseCost,
    },
    walk: {
      duration: Math.round(baseTime * 2),
      cost: 0,
    },
  }
}

const analyzeTrafficPatterns = (predictions) => {
  const morningWorst = predictions
    .slice(7, 10)
    .reduce((prev, curr) => (prev.duration > curr.duration ? prev : curr))

  const eveningWorst = predictions
    .slice(18, 21)
    .reduce((prev, curr) => (prev.duration > curr.duration ? prev : curr))

  const overall = predictions.reduce((prev, curr) =>
    prev.duration > curr.duration ? prev : curr,
  )

  return {
    morningPeak: `${morningWorst.displayTime} (${morningWorst.duration}분)`,
    eveningPeak: `${eveningWorst.displayTime} (${eveningWorst.duration}분)`,
    worstTime: `${overall.displayTime} (${overall.duration}분)`,
    recommendations: [
      '오전 6시 이전 출발 시 30% 시간 단축',
      '점심시간(12-13시) 이동 권장',
      '야간(22시 이후) 고속 이동 가능',
    ],
  }
}

export default TimelinePrediction
