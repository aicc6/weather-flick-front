import { useState, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users } from '@/components/icons'
import { COMPANIONS } from '@/constants/travelOptions'
import { setCompanion, setCurrentStep, restoreFromParams } from '@/store/slices/customizedScheduleSlice'
import ProgressSteps from '@/components/common/ProgressSteps'

export default function CustomizedScheduleWhoPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [searchParams] = useSearchParams()
  const [selectedCompanion, setSelectedCompanion] = useState(null)
  const nextButtonRef = useRef(null)

  // Redux 상태 가져오기
  const { 
    regionCode, 
    regionName, 
    period, 
    periodLabel, 
    days,
    companion,
    companionData 
  } = useSelector((state) => state.customizedSchedule)

  // URL 파라미터에서 상태 복원
  useEffect(() => {
    const urlParams = {
      region: searchParams.get('region'),
      period: searchParams.get('period'),
      days: searchParams.get('days'),
      who: searchParams.get('who')
    }
    
    // URL 파라미터가 있고 Redux 상태가 비어있으면 복원
    if ((urlParams.region && !regionCode) || 
        (urlParams.period && !periodLabel) ||
        (urlParams.who && !companion)) {
      dispatch(restoreFromParams(urlParams))
    }
    dispatch(setCurrentStep(3))
  }, [dispatch, searchParams, regionCode, periodLabel, companion])

  // 기존 선택된 동행자 복원
  useEffect(() => {
    if (companion) {
      const existingCompanion = COMPANIONS.find(c => c.id === companion)
      if (existingCompanion) {
        setSelectedCompanion(existingCompanion)
      }
    }
  }, [companion])

  useEffect(() => {
    if (selectedCompanion && nextButtonRef.current) {
      nextButtonRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [selectedCompanion])

  // 현재 정보 (Redux 우선, URL 파라미터 폴백)
  const currentRegion = regionCode || searchParams.get('region')
  const currentPeriod = periodLabel || searchParams.get('period')
  const currentDays = days || searchParams.get('days')
  const displayedRegionName = regionName || currentRegion

  // 공통 상수에서 동행자 데이터 가져옴
  const companions = COMPANIONS;

  const handleCompanionSelect = (companion) => {
    setSelectedCompanion(companion)
    // Redux 상태에도 저장
    dispatch(setCompanion(companion))
  }

  const handleNext = () => {
    if (selectedCompanion) {
      window.scrollTo({ top: 0, behavior: 'auto' })
      // URL 파라미터와 함께 이동 (하위 호환성 유지)
      navigate(
        `/customized-schedule/style?region=${currentRegion}&period=${currentPeriod}&days=${currentDays}&who=${selectedCompanion.id}`,
      )
    }
  }

  const handleBack = () => {
    navigate(`/customized-schedule/period?region=${currentRegion}`)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* 진행률 표시 */}
      <ProgressSteps currentStep={3} onBack={handleBack} />
      
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
          누구와 함께 가시나요?
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          동행자에 따라 맞춤형 여행 코스를 추천해드려요.
        </p>
      </div>

      {/* 선택된 정보 표시 */}
      <div className="mb-6 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
        <div className="flex flex-wrap gap-3">
          {currentRegion && (
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                여행지
              </span>
              <Badge
                variant="outline"
                className="ml-2 dark:border-gray-600 dark:text-gray-300"
              >
                {displayedRegionName}
              </Badge>
            </div>
          )}
          {currentPeriod && (
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                기간
              </span>
              <Badge
                variant="outline"
                className="ml-2 dark:border-gray-600 dark:text-gray-300"
              >
                {currentPeriod}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* 동행자 선택 */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {companions.map((companion) => (
          <Card
            key={companion.id}
            className={`cursor-pointer transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800 ${
              selectedCompanion?.id === companion.id
                ? 'bg-blue-50 ring-2 ring-blue-500 dark:bg-blue-900/20 dark:ring-blue-400'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            onClick={() => handleCompanionSelect(companion)}
          >
            <CardContent className="p-6">
              <div className="mb-4 text-center">
                <div className="mb-3 text-4xl">{companion.icon}</div>
                <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                  {companion.label}
                </h3>
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                  {companion.description}
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="mb-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                    특징
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {companion.characteristics.map((char, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {char}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
                    추천 장소
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {companion.recommendations}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 선택된 동행자 표시 */}
      {selectedCompanion && (
        <div className="mb-8 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <p className="mb-2 text-sm text-blue-600 dark:text-blue-400">
            선택된 동행자
          </p>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{selectedCompanion.icon}</span>
            <div>
              <Badge
                variant="secondary"
                className="mb-1 bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200"
              >
                {selectedCompanion.label}
              </Badge>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {selectedCompanion.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 추천 팁 */}
      <div className="mb-8 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
        <div className="flex items-start gap-3">
          <Users className="mt-0.5 h-5 w-5 text-green-600 dark:text-green-400" />
          <div>
            <h4 className="mb-1 font-semibold text-green-800 dark:text-green-300">
              💡 동행자별 추천 팁
            </h4>
            <div className="space-y-1 text-sm text-green-700 dark:text-green-300">
              <p>
                • <strong>혼자 여행</strong>: 자유로운 일정과 개인적 취향을
                반영한 코스
              </p>
              <p>
                • <strong>연인 여행</strong>: 로맨틱한 분위기와 추억을 만들 수
                있는 장소
              </p>
              <p>
                • <strong>가족 여행</strong>: 안전하고 교육적이며 모든 연령이
                즐길 수 있는 코스
              </p>
              <p>
                • <strong>친구 여행</strong>: 액티비티와 재미있는 체험 중심의
                활동적인 코스
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 다음 버튼 */}
      <div className="flex justify-center" ref={nextButtonRef}>
        <Button
          onClick={handleNext}
          disabled={!selectedCompanion}
          className="rounded-lg bg-blue-600 px-8 py-3 text-white hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600"
          size="lg"
        >
          다음
        </Button>
      </div>
    </div>
  )
}
