import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ChevronDown, ChevronUp, Calendar, MapPin } from '@/components/icons'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

export default function PlanPreview({ plan }) {
  const [expandedDays, setExpandedDays] = useState(new Set())

  const toggleDay = (dayNumber) => {
    const newExpanded = new Set(expandedDays)
    if (newExpanded.has(dayNumber)) {
      newExpanded.delete(dayNumber)
    } else {
      newExpanded.add(dayNumber)
    }
    setExpandedDays(newExpanded)
  }

  const getWeatherIcon = (condition) => {
    switch (condition) {
      case '맑음':
        return '☀️'
      case '구름 많음':
        return '⛅'
      case '흐림':
        return '☁️'
      case '비':
        return '🌧️'
      case '눈':
        return '❄️'
      default:
        return '🌤️'
    }
  }

  const getThemeLabel = (themeId) => {
    const themes = {
      relax: '휴양',
      activity: '액티비티',
      camping: '캠핑',
      healing: '힐링',
    }
    return themes[themeId] || ''
  }

  return (
    <div className="space-y-4">
      {/* 플랜 요약 정보 */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span className="font-medium">{plan.destination}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="font-medium">
                {format(plan.startDate, 'MM.dd', { locale: ko })} -{' '}
                {format(plan.endDate, 'MM.dd', { locale: ko })}
              </span>
            </div>
            {plan.theme && (
              <div className="flex items-center gap-2">
                <span className="text-lg">🎯</span>
                <span className="font-medium">{getThemeLabel(plan.theme)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 일자별 상세 일정 */}
      <div className="space-y-3">
        {plan.days.map((day) => (
          <Card key={day.day} className="overflow-hidden">
            <CardHeader
              className="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
              onClick={() => toggleDay(day.day)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📅</span>
                    <CardTitle className="text-lg">
                      {day.day}일차 -{' '}
                      {format(day.date, 'yyyy.MM.dd', { locale: ko })}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {getWeatherIcon(day.weather.condition)}
                    </span>
                    <Badge variant="outline" className="text-sm">
                      {day.weather.condition}, {day.weather.temperature}°C
                    </Badge>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  {expandedDays.has(day.day) ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>

            {expandedDays.has(day.day) && (
              <>
                <Separator />
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    {day.activities.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50"
                      >
                        <div className="w-16 flex-shrink-0 text-sm font-medium text-gray-600 dark:text-gray-400">
                          {activity.time}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{activity.activity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        ))}
      </div>

      {/* 추가 정보 */}
      <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
        <CardContent className="pt-6">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-lg">💡</span>
            <span className="font-medium">추천 사항</span>
          </div>
          <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <li>• 여행 전날 날씨를 다시 한번 확인해보세요</li>
            <li>• 현지 교통편과 운영시간을 미리 체크하세요</li>
            <li>• 예약이 필요한 장소는 미리 예약하세요</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
