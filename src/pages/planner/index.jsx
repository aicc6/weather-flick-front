import { useState } from 'react'
import PlannerForm from './PlannerForm'
import WeatherPreview from './WeatherPreview'
import PlanRecommendation from './PlanRecommendation'
import SavePlanButton from './SavePlanButton'

export default function PlannerPage() {
  // 예시 더미 데이터
  const [formData, setFormData] = useState({
    origin: '서울',
    destination: '제주도',
    startDate: new Date(),
    endDate: new Date(Date.now() + 86400000),
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
  })
  const [planResults, setPlanResults] = useState([
    {
      image:
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
      title: '한라산 트래킹',
      description:
        '맑은 날씨에 추천하는 한라산 등반 코스. 정상에서 제주 전경을 감상하세요!',
      tags: ['야외', '트래킹', '힐링'],
    },
    {
      image:
        'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80',
      title: '카페거리 산책',
      description: '제주도 감성 카페거리에서 여유로운 시간을 보내세요.',
      tags: ['실내/야외', '카페', '인스타감성'],
    },
  ])
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-8">
      <h1 className="mb-4 text-center text-2xl font-bold sm:text-3xl">
        🌤️ 날씨 기반 여행 플래너
      </h1>
      <PlannerForm
        formData={formData}
        setFormData={setFormData}
        setWeatherData={setWeatherData}
        setPlanResults={setPlanResults}
        setIsLoading={setIsLoading}
      />
      <WeatherPreview weatherData={weatherData} />
      <PlanRecommendation planResults={planResults} isLoading={isLoading} />
      <SavePlanButton planResults={planResults} />
    </div>
  )
}
