import { useState, useMemo, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Brain, Cloud, Users } from '@/components/icons'

// 기존 컴포넌트들
import PlannerForm from './PlannerForm'
import PlanRecommendation from './PlanRecommendation'
import SavePlanButton from './SavePlanButton'
import { useCreateTravelPlanMutation } from '@/store/api/travelPlansApi'

// 새로운 고도화 컴포넌트들
import AIRecommendationEngine from '@/components/planner/AIRecommendationEngine'
import WeatherIntelligence from '@/components/planner/WeatherIntelligence'
import CollaborativePlanning from '@/components/planner/CollaborativePlanning'
import TmapRecommendations from '@/components/planner/TmapRecommendations'

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
  const [createTravelPlan] = useCreateTravelPlanMutation()

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

  // 맞춤 일정 데이터 처리
  useEffect(() => {
    if (recommendedPlan) {
      // 추천 데이터를 플래너 폼 데이터로 변환
      const { summary, itinerary } = recommendedPlan
      
      // 시작일과 종료일 계산
      const today = new Date()
      const endDate = new Date(today)
      endDate.setDate(today.getDate() + (summary.days - 1))
      
      setFormData({
        origin: '서울', // 기본값
        destination: summary.regionName,
        startDate: today,
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
  }, [recommendedPlan])

  // 플랜 저장 핸들러
  const handleSavePlan = async () => {
    try {
      setIsLoading(true)
      
      // 여행 일정 데이터 구성
      const itineraryData = {}
      
      // recommendedPlan이 있는 경우 해당 데이터 사용
      if (recommendedPlan) {
        recommendedPlan.itinerary.forEach((dayPlan) => {
          itineraryData[`day${dayPlan.day}`] = {
            date: dayPlan.date || formData.startDate,
            places: dayPlan.places.map((place) => ({
              name: place.name,
              time: place.time,
              description: place.description,
              category: place.category,
              tags: place.tags,
            })),
          }
        })
      } else {
        // 기본 플랜 데이터 사용
        const groupedByDay = {}
        planResults.forEach((plan) => {
          const dayKey = `day${plan.dayNumber || 1}`
          if (!groupedByDay[dayKey]) {
            groupedByDay[dayKey] = []
          }
          groupedByDay[dayKey].push({
            name: plan.title,
            description: plan.description,
            time: plan.time || '미정',
            category: plan.category || '관광지',
            tags: plan.tags,
          })
        })
        
        Object.keys(groupedByDay).forEach((dayKey) => {
          itineraryData[dayKey] = {
            date: formData.startDate,
            places: groupedByDay[dayKey],
          }
        })
      }
      
      const planData = {
        title: recommendedPlan 
          ? `${recommendedPlan.summary.regionName} ${recommendedPlan.summary.days}일 여행`
          : `${formData.destination} 여행`,
        description: recommendedPlan
          ? `${recommendedPlan.summary.who} 여행 - ${recommendedPlan.summary.styles?.join(', ')}`
          : `${formData.theme} 테마 여행`,
        start_date: formData.startDate.toISOString().split('T')[0],
        end_date: formData.endDate.toISOString().split('T')[0],
        start_location: formData.origin,
        destination_ids: [],
        theme: formData.theme,
        status: 'PLANNING',
        itinerary: itineraryData,
      }
      
      const result = await createTravelPlan(planData).unwrap()
      
      toast.success('여행 플랜이 성공적으로 저장되었습니다!')
      
      // 저장 후 여행 플랜 목록 페이지로 이동
      window.location.href = '/travel-plans'
    } catch (error) {
      console.error('플랜 저장 실패:', error)
      toast.error('여행 플랜 저장에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-8">
      {/* 페이지 헤더 */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-white">
          여행 플래너
          <Badge variant="secondary" className="ml-3">
            <Sparkles className="mr-1 h-3 w-3" />
            AI 고도화
          </Badge>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
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
          {/* 상단 - 여행 요약 및 날씨 미리보기 */}
          <div className="grid gap-6 md:grid-cols-2">
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

          {/* 하단 - 여행 기본 정보 */}
          <div className="w-full">
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

          {/* T맵 맛집 & 코스 추천 */}
          <TmapRecommendations destination={formData.destination} />

          {/* 기본 추천 결과 */}
          <PlanRecommendation planResults={planResults} isLoading={isLoading} />
          <SavePlanButton 
            planResults={planResults} 
            onSave={handleSavePlan}
            isLoading={isLoading}
          />
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
