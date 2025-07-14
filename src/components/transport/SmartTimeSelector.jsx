import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, ChevronDown, ChevronUp, Zap, Settings, BarChart3 } from '@/components/icons'
import TimelinePrediction from './TimelinePrediction'

/**
 * 스마트 시간 선택기 - 3단계 확장 가능
 * 1. 간단 모드: 기본 시간 옵션 (지금, 1시간후, 2시간후)
 * 2. 고급 모드: 최적 시간 추천 + 사용자 정의 시간
 * 3. 전체 모드: 24시간 타임라인 + 상세 분석
 */

export function SmartTimeSelector({ value, onChange, route, className = '' }) {
  const [mode, setMode] = useState('simple') // 'simple', 'advanced', 'full'
  const [showCustomTime, setShowCustomTime] = useState(false)
  const [customTime, setCustomTime] = useState('')

  // 현재 시간 기준 추천 시간대 계산
  const getRecommendedTimes = () => {
    const now = new Date()
    const hour = now.getHours()
    
    const recommendations = []
    
    // 현재가 혼잡시간이면 대안 제시
    if ((hour >= 7 && hour <= 9) || (hour >= 18 && hour <= 20)) {
      recommendations.push({
        value: 'optimal_early',
        label: '혼잡 회피 (30분 일찍)',
        time: new Date(now.getTime() - 30 * 60 * 1000),
        benefit: '30% 시간 단축',
        icon: '⚡'
      })
    }
    
    // 점심시간 추천
    if (hour < 12) {
      recommendations.push({
        value: 'lunch_time',
        label: '점심시간 이용',
        time: new Date(now.setHours(12, 30, 0, 0)),
        benefit: '한산한 도로',
        icon: '🍽️'
      })
    }
    
    // 야간 추천 (빠른 이동)
    if (hour < 22) {
      recommendations.push({
        value: 'night_fast',
        label: '야간 고속 이동',
        time: new Date(now.setHours(22, 0, 0, 0)),
        benefit: '최대 50% 단축',
        icon: '🌙'
      })
    }
    
    return recommendations
  }

  const formatTimeToAmPm = (date) => {
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const ampm = hours >= 12 ? '오후' : '오전'
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours
    return `${ampm} ${displayHours}:${minutes.toString().padStart(2, '0')}`
  }

  const getSelectedTimeDisplay = () => {
    if (value.startsWith('custom:')) {
      const timeString = value.split(':')[1] + ':' + value.split(':')[2]
      return formatTimeToAmPm(new Date(`2000-01-01T${timeString}`))
    }

    const timeMap = {
      'now': '지금 출발',
      'optimal': '최적 시간',
      'hour1': '1시간 후',
      'hour2': '2시간 후',
      'hour4': '4시간 후',
      'optimal_early': '혼잡 회피',
      'lunch_time': '점심시간',
      'night_fast': '야간 이동'
    }

    return timeMap[value] || '시간 선택'
  }

  const renderSimpleMode = () => (
    <div className="space-y-3">
      {/* 현재 선택된 시간 표시 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">출발시간:</span>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {getSelectedTimeDisplay()}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMode('advanced')}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          <Settings className="h-3 w-3 mr-1" />
          고급설정
        </Button>
      </div>

      {/* 기본 시간 선택 버튼들 */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: 'now', label: '지금', icon: '⚡' },
          { value: 'hour1', label: '1시간후', icon: '🕐' },
          { value: 'hour2', label: '2시간후', icon: '🕑' },
          { value: 'optimal', label: '최적시간', icon: '🎯' }
        ].map((option) => (
          <Button
            key={option.value}
            size="sm"
            variant={value === option.value ? 'default' : 'outline'}
            onClick={() => onChange(option.value)}
            className="text-xs"
          >
            <span className="mr-1">{option.icon}</span>
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  )

  const renderAdvancedMode = () => {
    const recommendations = getRecommendedTimes()
    
    return (
      <div className="space-y-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="font-medium">스마트 시간 선택</span>
          </div>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMode('simple')}
              className="text-xs"
            >
              간단히
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMode('full')}
              className="text-xs text-blue-600"
            >
              <BarChart3 className="h-3 w-3 mr-1" />
              전체분석
            </Button>
          </div>
        </div>

        {/* 현재 선택 */}
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-blue-800">선택된 시간</div>
              <div className="text-sm text-blue-600">{getSelectedTimeDisplay()}</div>
            </div>
            <Badge variant="default" className="bg-blue-600">
              {value === 'now' ? '즉시' : '예약'}
            </Badge>
          </div>
        </div>

        {/* AI 추천 시간대 */}
        {recommendations.length > 0 && (
          <div>
            <h4 className="font-medium mb-2 flex items-center">
              <Zap className="h-4 w-4 mr-1 text-yellow-500" />
              AI 추천 시간
            </h4>
            <div className="space-y-2">
              {recommendations.map((rec) => (
                <div
                  key={rec.value}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    value === rec.value 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 bg-white hover:border-green-300'
                  }`}
                  onClick={() => onChange(rec.value)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{rec.icon}</span>
                      <div>
                        <div className="font-medium text-sm">{rec.label}</div>
                        <div className="text-xs text-gray-600">
                          {formatTimeToAmPm(rec.time)}
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {rec.benefit}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 기본 옵션들 */}
        <div>
          <h4 className="font-medium mb-2">기본 옵션</h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'now', label: '지금 출발', desc: '즉시 이동', icon: '⚡' },
              { value: 'hour1', label: '1시간 후', desc: '여유있게', icon: '🕐' },
              { value: 'hour2', label: '2시간 후', desc: '계획적으로', icon: '🕑' },
              { value: 'optimal', label: '최적 시간', desc: 'AI가 선택', icon: '🎯' }
            ].map((option) => (
              <div
                key={option.value}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  value === option.value 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
                onClick={() => onChange(option.value)}
              >
                <div className="text-center">
                  <div className="text-lg mb-1">{option.icon}</div>
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs text-gray-600">{option.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 사용자 정의 시간 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">사용자 정의</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCustomTime(!showCustomTime)}
              className="text-xs"
            >
              {showCustomTime ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {showCustomTime ? '접기' : '펼치기'}
            </Button>
          </div>
          
          {showCustomTime && (
            <div className="p-3 border rounded-lg bg-gray-50">
              <div className="flex items-center space-x-2">
                <input
                  type="time"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <Button
                  size="sm"
                  onClick={() => {
                    if (customTime) {
                      onChange(`custom:${customTime}`)
                      setShowCustomTime(false)
                    }
                  }}
                  disabled={!customTime}
                >
                  적용
                </Button>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                정확한 출발 시간을 설정하여 맞춤 예측을 받아보세요
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderFullMode = () => (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          <span className="font-medium">24시간 교통 분석</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMode('advanced')}
          className="text-xs"
        >
          <ChevronUp className="h-3 w-3 mr-1" />
          접기
        </Button>
      </div>

      {/* 전체 타임라인 예측 컴포넌트 */}
      <TimelinePrediction
        route={route}
        onTimeSelect={onChange}
        selectedTime={value}
        currentPredictions={{}}
      />
    </div>
  )

  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="p-4">
        {mode === 'simple' && renderSimpleMode()}
        {mode === 'advanced' && renderAdvancedMode()}
        {mode === 'full' && renderFullMode()}
      </CardContent>
    </Card>
  )
}

export default SmartTimeSelector