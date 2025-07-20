import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles } from '@/components/icons'

// 기존 컴포넌트들
import PlannerForm from './PlannerForm'

export default function PlannerPage() {
  const location = useLocation()
  const recommendedPlan = location.state?.recommendedPlan
  // 기존 상태들
  const [formData, setFormData] = useState({
    origin: '서울',
    destination: '제주도',
    startDate: new Date(),
    endDate: new Date(Date.now() + 86400000 * 2), // 3일 여행
    theme: '힐링',
    filters: ['비 안 오는 날'],
  })

  const [weatherData, setWeatherData] = useState({
    icon: '☀️',
    summary: '맑음, 쾌적한 날씨',
    temp: 25,
    rain: 10,
    wind: 3,
    uv: 4,
    conditions: ['sunny', 'cloudy'],
    temperature: 22,
    precipitation: 5,
    windSpeed: 10,
  })

  const [planResults, setPlanResults] = useState([])

  // 맞춤 일정 데이터 처리
  useEffect(() => {
    if (recommendedPlan) {
      // 추천 데이터를 플래너 폼 데이터로 변환
      const { summary, itinerary } = recommendedPlan
      const additionalInfo = location.state?.additionalInfo

      // 추가 정보가 있으면 해당 날짜 사용, 없으면 오늘 날짜
      const startDate = additionalInfo?.startDate
        ? new Date(additionalInfo.startDate)
        : new Date()
      const endDate = additionalInfo?.endDate
        ? new Date(additionalInfo.endDate)
        : new Date(startDate)

      if (!additionalInfo?.endDate) {
        endDate.setDate(startDate.getDate() + (summary.days - 1))
      }

      setFormData({
        origin: additionalInfo?.origin || '서울',
        destination: summary.regionName,
        startDate: startDate,
        endDate: endDate,
        theme: summary.styles?.[0] || '여행',
        filters: [],
      })

      // 추천 결과를 플랜 결과로 변환
      const planResults = []
      itinerary.forEach((dayPlan) => {
        dayPlan.places.forEach((place) => {
          planResults.push({
            image: `https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80`,
            title: place.name,
            description: place.description,
            tags: place.tags,
            dayNumber: dayPlan.day,
            time: place.time,
            category: place.category,
          })
        })
      })

      setPlanResults(planResults)
      toast.success('맞춤 여행 일정을 불러왔습니다!')
    }
  }, [recommendedPlan, location.state?.additionalInfo])

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-8">
      {/* 페이지 헤더 */}

      {/* 메인 콘텐츠 */}
      <div className="space-y-6">
        {/* 여행 기본 정보 */}
        <div className="w-full">
          <Card>
            <CardHeader>
              <Badge variant="secondary" className="ml-3">
                <Sparkles className="mr-1 h-3 w-3" />
                날씨 교통 정보 추천
              </Badge>
            </CardHeader>
            <CardContent>
              <PlannerForm
                formData={formData}
                setFormData={setFormData}
                setWeatherData={setWeatherData}
                setPlanResults={setPlanResults}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
