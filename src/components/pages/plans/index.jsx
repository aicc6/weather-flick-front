import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Save, Eye } from '@/components/icons'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import PlanForm from './PlanForm'
import PlanPreview from './PlanPreview'

export default function PlansPage() {
  const [planData, setPlanData] = useState({
    destination: '',
    startDate: null,
    endDate: null,
    theme: '',
    weatherConditions: [],
  })
  const [generatedPlan, setGeneratedPlan] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()

  const handlePlanSubmit = async (formData) => {
    setIsGenerating(true)
    setPlanData(formData)

    // 날짜 null 체크
    if (!formData.startDate || !formData.endDate) {
      setIsGenerating(false)
      return
    }

    const startDate = new Date(formData.startDate)
    const endDate = new Date(formData.endDate)

    // 백엔드 API 호출 시뮬레이션
    setTimeout(() => {
      const mockPlan = {
        destination: formData.destination,
        startDate,
        endDate,
        theme: formData.theme,
        days: [
          {
            day: 1,
            date: startDate,
            weather: { condition: '맑음', temperature: 29 },
            activities: [
              { time: '오전', activity: '광안리 해변 산책' },
              { time: '오후', activity: '감천문화마을 탐방' },
              { time: '저녁', activity: '해운대 바다 야경' },
            ],
          },
          {
            day: 2,
            date: new Date(startDate.getTime() + 24 * 60 * 60 * 1000),
            weather: { condition: '구름 많음', temperature: 27 },
            activities: [
              { time: '오전', activity: '온천 찜질' },
              { time: '오후', activity: '카페거리 탐방' },
              { time: '저녁', activity: '지역 음식 체험' },
            ],
          },
        ],
      }
      setGeneratedPlan(mockPlan)
      setIsGenerating(false)
    }, 2000)
  }

  const handleSavePlan = async () => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }

    // 백엔드 API 호출 시뮬레이션
    console.log('플랜 저장:', generatedPlan)
    // TODO: 실제 API 호출
  }

  const handleViewMyPlans = () => {
    navigate('/profile')
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
          🎯 여행 플래너
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          여행지와 날짜를 입력하고 맞춤형 여행 계획을 생성해보세요
        </p>
      </div>

      {/* 1. 상단 입력 영역 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            여행 계획 생성
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PlanForm onSubmit={handlePlanSubmit} />
        </CardContent>
      </Card>

      {/* 2. 생성 버튼 영역 */}
      <div className="mb-8 text-center">
        <Button
          size="lg"
          className="bg-blue-600 px-8 py-3 text-white hover:bg-blue-700"
          disabled={isGenerating}
          onClick={() => handlePlanSubmit(planData)}
        >
          {isGenerating ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
              플랜 생성 중...
            </>
          ) : (
            <>📋 여행 플랜 생성하기</>
          )}
        </Button>
      </div>

      {/* 3. 생성된 플랜 결과 미리보기 */}
      {generatedPlan && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📋 생성된 여행 플랜
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PlanPreview plan={generatedPlan} />
          </CardContent>
        </Card>
      )}

      {/* 4. 저장 영역 */}
      {generatedPlan && (
        <div className="mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            onClick={handleSavePlan}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            <Save className="mr-2 h-4 w-4" />
            플랜 저장하기
          </Button>

          <Button variant="outline" onClick={handleViewMyPlans}>
            <Eye className="mr-2 h-4 w-4" />내 플랜 보기 →
          </Button>
        </div>
      )}
    </div>
  )
}
