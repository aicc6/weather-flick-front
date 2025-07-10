import { useState, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Brain, Cloud, Users } from '@/components/icons'

// 기존 컴포넌트들
import PlannerForm from './PlannerForm'
import PlanRecommendation from './PlanRecommendation'
import SavePlanButton from './SavePlanButton'

// 새로운 고도화 컴포넌트들
import AIRecommendationEngine from '@/components/planner/AIRecommendationEngine'
import WeatherIntelligence from '@/components/planner/WeatherIntelligence'
import CollaborativePlanning from '@/components/planner/CollaborativePlanning'

export default function PlannerPage() {
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

  // 새로운 고도화 상태들
  const [currentUser] = useState({
    id: 1,
    name: '김사용자',
    email: 'user@example.com',
  })

  const [userPreferences] = useState({
    age: 28,
    interests: ['자연', '카페', '사진'],
    travelStyle: 'relaxed',
    budget: 'medium',
    activityLevel: 'moderate',
  })

  // 여행 날짜 배열 생성
  const travelDates = useMemo(() => {
    if (!formData.startDate || !formData.endDate) return []

    const dates = []
    const start = new Date(formData.startDate)
    const end = new Date(formData.endDate)

    for (
      let date = new Date(start);
      date <= end;
      date.setDate(date.getDate() + 1)
    ) {
      dates.push(new Date(date).toISOString().split('T')[0])
    }

    return dates
  }, [formData.startDate, formData.endDate])

  // 계획된 활동들
  const plannedActivities = ['야외활동', '등산', '카페']

  // AI 추천 선택 핸들러
  const handleAIRecommendationSelect = (recommendation) => {
    // 선택된 AI 추천을 플랜에 추가
    setPlanResults((prev) => [
      ...prev,
      {
        image: recommendation.image,
        title: recommendation.title,
        description: recommendation.description,
        tags: recommendation.tags,
        aiScore: recommendation.aiScore,
        isAIRecommended: true,
      },
    ])
  }

  // 협업자 업데이트 핸들러
  const handleCollaboratorUpdate = (count) => {
    console.log(`현재 협업자 수: ${count}명`)
  }

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-8">
      {/* 페이지 헤더 */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold text-gray-900">
          여행 플래너
          <Badge variant="secondary" className="ml-3">
            <Sparkles className="mr-1 h-3 w-3" />
            AI 고도화
          </Badge>
        </h1>
        <p className="text-lg text-gray-600">
          AI와 함께하는 스마트한 여행 계획! 날씨, 협업, 개인화 추천까지
        </p>
      </div>

      {/* 메인 탭 인터페이스 */}
      <Tabs defaultValue="planner" className="w-full">
        <TabsList className="mb-8 grid w-full grid-cols-4">
          <TabsTrigger value="planner" className="flex items-center space-x-2">
            <span>📝</span>
            <span>기본 계획</span>
          </TabsTrigger>
          <TabsTrigger
            value="ai-recommendations"
            className="flex items-center space-x-2"
          >
            <Brain className="h-4 w-4" />
            <span>AI 추천</span>
          </TabsTrigger>
          <TabsTrigger value="weather" className="flex items-center space-x-2">
            <Cloud className="h-4 w-4" />
            <span>날씨 분석</span>
          </TabsTrigger>
          <TabsTrigger
            value="collaboration"
            className="flex items-center space-x-2"
          >
            <Users className="h-4 w-4" />
            <span>협업</span>
          </TabsTrigger>
        </TabsList>

        {/* 기본 계획 탭 */}
        <TabsContent value="planner" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* 메인 플래너 폼 */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">여행 기본 정보</CardTitle>
                </CardHeader>
                <CardContent>
                  <PlannerForm
                    formData={formData}
                    setFormData={setFormData}
                    setWeatherData={setWeatherData}
                    setPlanResults={setPlanResults}
                    setIsLoading={setIsLoading}
                  />
                </CardContent>
              </Card>
            </div>

            {/* 사이드바 - 빠른 정보 */}
            <div className="space-y-4">
              {/* 여행 요약 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🗓️ 여행 요약</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">목적지:</span>
                    <span className="font-medium">{formData.destination}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">기간:</span>
                    <span className="font-medium">{travelDates.length}일</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">테마:</span>
                    <Badge variant="outline">{formData.theme}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* 날씨 미리보기 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🌤️ 날씨 미리보기</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl">{weatherData.icon}</div>
                    <div className="mt-2 text-lg font-semibold">
                      {weatherData.temp}°C
                    </div>
                    <div className="text-sm text-gray-600">
                      {weatherData.summary}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 기본 추천 결과 */}
          <PlanRecommendation planResults={planResults} isLoading={isLoading} />
          <SavePlanButton planResults={planResults} />
        </TabsContent>

        {/* AI 추천 탭 */}
        <TabsContent value="ai-recommendations" className="space-y-6">
          <AIRecommendationEngine
            userPreferences={userPreferences}
            weatherData={weatherData}
            travelDates={travelDates}
            onRecommendationSelect={handleAIRecommendationSelect}
          />

          {/* AI 추천 결과가 있으면 표시 */}
          {planResults.some((plan) => plan.isAIRecommended) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  <span>AI 추천으로 추가된 계획</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {planResults
                    .filter((plan) => plan.isAIRecommended)
                    .map((plan, index) => (
                      <div key={index} className="rounded-lg border p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{plan.title}</h4>
                            <p className="text-sm text-gray-600">
                              {plan.description}
                            </p>
                          </div>
                          {plan.aiScore && (
                            <Badge variant="secondary">
                              AI {plan.aiScore}점
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 날씨 분석 탭 */}
        <TabsContent value="weather" className="space-y-6">
          <WeatherIntelligence
            location={formData.destination}
            travelDates={travelDates}
            plannedActivities={plannedActivities}
          />
        </TabsContent>

        {/* 협업 탭 */}
        <TabsContent value="collaboration" className="space-y-6">
          <CollaborativePlanning
            planId="example-plan-id"
            currentUser={currentUser}
            onCollaboratorUpdate={handleCollaboratorUpdate}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
