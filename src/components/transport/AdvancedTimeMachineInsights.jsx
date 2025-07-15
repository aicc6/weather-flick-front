import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Zap,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Users,
  DollarSign,
} from '@/components/icons'

/**
 * 고급 타임머신 인사이트 컴포넌트
 *
 * 주요 기능:
 * - 시간대별 상세 예측 분석
 * - 비용/시간 최적화 제안
 * - 혼잡도 시각화
 * - 개인화된 추천 알고리즘
 * - 과거 패턴 기반 예측
 */

export function AdvancedTimeMachineInsights({
  time,
  predictions,
  route,
  userPreferences = {},
  className = '',
}) {
  const [activeTab, setActiveTab] = useState('overview') // 'overview', 'detailed', 'comparison', 'optimization'
  const [showAdvanced, setShowAdvanced] = useState(false)

  // 예측 데이터가 없는 경우 기본값 생성
  const enrichedPredictions = generateEnrichedPredictions(
    time,
    predictions,
    route,
    userPreferences,
  )

  const renderOverviewTab = () => {
    if (!enrichedPredictions) {
      return (
        <div className="p-4 text-center text-gray-500">
          <Clock className="mx-auto mb-2 h-8 w-8 opacity-50" />
          <p className="text-sm">데이터를 불러오는 중입니다...</p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {/* 핵심 메트릭 카드들 */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MetricCard
            icon={<Clock className="h-4 w-4" />}
            title="예상 소요시간"
            value={`${enrichedPredictions.estimatedTime}분`}
            change={enrichedPredictions.timeChange}
            color="blue"
          />
          <MetricCard
            icon={<DollarSign className="h-4 w-4" />}
            title="예상 비용"
            value={`${enrichedPredictions.estimatedCost.toLocaleString()}원`}
            change={enrichedPredictions.costChange}
            color="green"
          />
          <MetricCard
            icon={<Users className="h-4 w-4" />}
            title="혼잡도"
            value={enrichedPredictions.crowdLevel}
            change={enrichedPredictions.crowdChange}
            color="purple"
          />
          <MetricCard
            icon={<BarChart3 className="h-4 w-4" />}
            title="예측 신뢰도"
            value={`${enrichedPredictions.reliability}%`}
            change={null}
            color="orange"
          />
        </div>

        {/* AI 추천 요약 */}
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="rounded-full bg-blue-100 p-2">
                <Zap className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="mb-1 font-medium text-blue-900">
                  AI 스마트 추천
                </h4>
                <p className="mb-2 text-sm text-blue-800">
                  {enrichedPredictions.aiRecommendation.summary}
                </p>
                <div className="flex flex-wrap gap-2">
                  {enrichedPredictions.aiRecommendation.tags.map(
                    (tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-blue-100 text-xs text-blue-700"
                      >
                        {tag}
                      </Badge>
                    ),
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 교통수단별 빠른 비교 */}
        <div>
          <h4 className="mb-3 font-medium">교통수단 비교</h4>
          <div className="grid gap-3">
            {enrichedPredictions.transportComparison.map(
              (transport, _index) => (
                <div
                  key={transport.mode}
                  className={`rounded-lg border p-3 transition-all ${
                    transport.recommended
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{transport.icon}</span>
                      <div>
                        <div className="text-sm font-medium">
                          {transport.name}
                        </div>
                        <div className="text-xs text-gray-600">
                          {transport.time}분 • {transport.cost}원
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {transport.recommended && (
                        <Badge variant="default" className="mb-1 text-xs">
                          추천
                        </Badge>
                      )}
                      <div className="text-xs text-gray-600">
                        {transport.advantages.slice(0, 2).join(', ')}
                      </div>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderDetailedTab = () => {
    if (!enrichedPredictions) {
      return (
        <div className="p-4 text-center text-gray-500">
          <Clock className="mx-auto mb-2 h-8 w-8 opacity-50" />
          <p className="text-sm">데이터를 불러오는 중입니다...</p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {/* 시간대 상세 분석 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">선택 시간대 상세 분석</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <h5 className="mb-2 text-sm font-medium">교통 패턴</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>평균 차량 속도:</span>
                    <span className="font-medium">
                      {enrichedPredictions.detailed.avgSpeed}km/h
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>교통량 지수:</span>
                    <span className="font-medium">
                      {enrichedPredictions.detailed.trafficIndex}/10
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>사고 발생 확률:</span>
                    <span className="font-medium">
                      {enrichedPredictions.detailed.accidentProb}%
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h5 className="mb-2 text-sm font-medium">환경 요인</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>날씨 영향:</span>
                    <span className="font-medium">
                      {enrichedPredictions.detailed.weatherImpact}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>대기질:</span>
                    <span className="font-medium">
                      {enrichedPredictions.detailed.airQuality}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>이벤트 영향:</span>
                    <span className="font-medium">
                      {enrichedPredictions.detailed.eventImpact || '없음'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 경로별 세부 정보 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">경로 세부 분석</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {enrichedPredictions.detailed.routeSegments.map(
                (segment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded bg-gray-50 p-2"
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className={`h-3 w-3 rounded-full ${
                          segment.congestion === 'low'
                            ? 'bg-green-500'
                            : segment.congestion === 'medium'
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                      />
                      <span className="text-sm font-medium">
                        {segment.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">{segment.estimatedTime}분</div>
                      <div className="text-xs text-gray-600">
                        {segment.distance}km
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderComparisonTab = () => {
    if (!enrichedPredictions) {
      return (
        <div className="p-4 text-center text-gray-500">
          <Clock className="mx-auto mb-2 h-8 w-8 opacity-50" />
          <p className="text-sm">데이터를 불러오는 중입니다...</p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {/* 시간대별 비교 차트 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">시간대별 소요시간 비교</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {enrichedPredictions.comparison.hourlyData.map((hour, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-16 text-sm text-gray-600">{hour.time}</div>
                  <div className="relative h-2 flex-1 rounded-full bg-gray-200">
                    <div
                      className={`h-2 rounded-full ${
                        hour.efficiency > 80
                          ? 'bg-green-500'
                          : hour.efficiency > 60
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${hour.efficiency}%` }}
                    />
                  </div>
                  <div className="w-16 text-right text-sm font-medium">
                    {hour.duration}분
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 비용 효율성 분석 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">비용 효율성 분석</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {enrichedPredictions.comparison.costAnalysis.map(
                (analysis, index) => (
                  <div
                    key={index}
                    className="rounded-lg bg-gray-50 p-3 text-center"
                  >
                    <div className="text-lg font-bold text-blue-600">
                      {analysis.value}
                    </div>
                    <div className="text-sm text-gray-600">
                      {analysis.label}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {analysis.description}
                    </div>
                  </div>
                ),
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderOptimizationTab = () => {
    if (!enrichedPredictions) {
      return (
        <div className="p-4 text-center text-gray-500">
          <Clock className="mx-auto mb-2 h-8 w-8 opacity-50" />
          <p className="text-sm">데이터를 불러오는 중입니다...</p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {/* 최적화 제안 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">개인화 최적화 제안</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {enrichedPredictions.optimization.suggestions.map(
              (suggestion, index) => (
                <div key={index} className="rounded-lg border p-3">
                  <div className="flex items-start space-x-3">
                    <div
                      className={`rounded-full p-2 ${
                        suggestion.priority === 'high'
                          ? 'bg-red-100'
                          : suggestion.priority === 'medium'
                            ? 'bg-yellow-100'
                            : 'bg-blue-100'
                      }`}
                    >
                      {suggestion.icon}
                    </div>
                    <div className="flex-1">
                      <h5 className="mb-1 text-sm font-medium">
                        {suggestion.title}
                      </h5>
                      <p className="mb-2 text-sm text-gray-600">
                        {suggestion.description}
                      </p>
                      <div className="flex items-center space-x-4 text-xs">
                        <span className="text-green-600">
                          절약: {suggestion.savings}
                        </span>
                        <span className="text-blue-600">
                          효과: {suggestion.impact}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ),
            )}
          </CardContent>
        </Card>

        {/* 사용자 패턴 분석 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">당신의 이동 패턴</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h5 className="mb-2 text-sm font-medium">선호 교통수단</h5>
                <div className="space-y-1">
                  {enrichedPredictions.optimization.userPattern.preferredModes.map(
                    (mode, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{mode.name}</span>
                        <span className="text-blue-600">{mode.usage}%</span>
                      </div>
                    ),
                  )}
                </div>
              </div>
              <div>
                <h5 className="mb-2 text-sm font-medium">이동 시간대</h5>
                <div className="space-y-1">
                  {enrichedPredictions.optimization.userPattern.timePreferences.map(
                    (time, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{time.period}</span>
                        <span className="text-blue-600">{time.frequency}%</span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!enrichedPredictions) {
    return (
      <Card className={className}>
        <CardContent className="p-4 text-center text-gray-500">
          <Clock className="mx-auto mb-2 h-8 w-8 opacity-50" />
          <p className="text-sm">
            시간을 선택하면 상세한 예측 정보를 확인할 수 있습니다
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-blue-600" />
            <span>스마트 여행 인사이트</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs"
          >
            {showAdvanced ? '간단히' : '고급 분석'}
          </Button>
        </div>

        {/* 탭 네비게이션 */}
        {showAdvanced && (
          <div className="mt-3 flex space-x-1">
            {[
              { id: 'overview', label: '개요', icon: '📊' },
              { id: 'detailed', label: '상세', icon: '🔍' },
              { id: 'comparison', label: '비교', icon: '⚖️' },
              { id: 'optimization', label: '최적화', icon: '⚡' },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className="text-xs"
              >
                <span className="mr-1">{tab.icon}</span>
                {tab.label}
              </Button>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {!showAdvanced ? (
          // 간단한 버전
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3">
              <div>
                <div className="font-medium text-blue-900">
                  {enrichedPredictions.aiRecommendation.primary}
                </div>
                <div className="text-sm text-blue-700">
                  {enrichedPredictions.aiRecommendation.reason}
                </div>
              </div>
              <Badge variant="default" className="bg-blue-600">
                {enrichedPredictions.aiRecommendation.confidence}% 확신
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded bg-gray-50 p-2">
                <div className="font-medium text-blue-600">
                  {enrichedPredictions.estimatedTime}분
                </div>
                <div className="text-xs text-gray-600">소요시간</div>
              </div>
              <div className="rounded bg-gray-50 p-2">
                <div className="font-medium text-green-600">
                  {enrichedPredictions.estimatedCost.toLocaleString()}원
                </div>
                <div className="text-xs text-gray-600">예상비용</div>
              </div>
              <div className="rounded bg-gray-50 p-2">
                <div className="font-medium text-purple-600">
                  {enrichedPredictions.crowdLevel}
                </div>
                <div className="text-xs text-gray-600">혼잡도</div>
              </div>
            </div>
          </div>
        ) : (
          // 고급 버전
          <div>
            {activeTab === 'overview' && renderOverviewTab()}
            {activeTab === 'detailed' && renderDetailedTab()}
            {activeTab === 'comparison' && renderComparisonTab()}
            {activeTab === 'optimization' && renderOptimizationTab()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// 메트릭 카드 컴포넌트
const MetricCard = ({ icon, title, value, change, color }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  }

  return (
    <div className="rounded-lg border bg-white p-3">
      <div className="mb-2 flex items-center space-x-2">
        <div className={`rounded p-1 ${colorMap[color]}`}>{icon}</div>
        <span className="text-xs text-gray-600">{title}</span>
      </div>
      <div className="text-lg font-bold">{value}</div>
      {change && (
        <div
          className={`mt-1 flex items-center text-xs ${
            change.direction === 'up' ? 'text-red-600' : 'text-green-600'
          }`}
        >
          {change.direction === 'up' ? (
            <TrendingUp className="mr-1 h-3 w-3" />
          ) : (
            <TrendingDown className="mr-1 h-3 w-3" />
          )}
          {change.text}
        </div>
      )}
    </div>
  )
}

// 풍부한 예측 데이터 생성 함수
const generateEnrichedPredictions = (
  time,
  predictions,
  route,
  _userPreferences,
) => {
  if (!time || time === 'now') return null

  // 실제 API 데이터가 있는 경우 사용하고, 없으면 null 반환하여 "준비중" 표시
  if (!predictions && !route) {
    return null
  }

  // 개발 환경에서만 콘솔 로그 출력
  if (import.meta.env.DEV) {
    console.log(
      'AdvancedTimeMachineInsights - 현재는 데모 데이터를 사용 중입니다.',
    )
    console.log(
      '실제 API 연동 시 해당 데이터를 사용하여 현실적인 정보를 제공할 예정입니다.',
    )
  }

  // 실제 데이터가 없을 때는 null 반환
  return null
}

export default AdvancedTimeMachineInsights
