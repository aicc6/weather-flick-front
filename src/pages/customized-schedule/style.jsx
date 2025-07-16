import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heart } from '@/components/icons'
import { COMPANIONS, TRAVEL_STYLES } from '@/constants/travelOptions'
import { addTravelStyle, removeTravelStyle, setCurrentStep, restoreFromParams } from '@/store/slices/customizedScheduleSlice'
import ProgressSteps from '@/components/common/ProgressSteps'

// 공통 상수에서 동행자 데이터 가져옴
const companions = COMPANIONS;

export default function CustomizedScheduleStylePage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [searchParams] = useSearchParams()
  const [selectedStyles, setSelectedStyles] = useState([])

  // Redux 상태 가져오기
  const { 
    regionCode, 
    regionName, 
    periodLabel, 
    days,
    companion,
    companionData,
    travelStyles,
    travelStylesData
  } = useSelector((state) => state.customizedSchedule)

  // URL 파라미터에서 상태 복원
  useEffect(() => {
    const urlParams = {
      region: searchParams.get('region'),
      period: searchParams.get('period'),
      days: searchParams.get('days'),
      who: searchParams.get('who'),
      styles: searchParams.get('styles')
    }
    
    // URL 파라미터가 있고 Redux 상태가 비어있으면 복원
    if ((urlParams.region && !regionCode) || 
        (urlParams.period && !periodLabel) ||
        (urlParams.who && !companion) ||
        (urlParams.styles && travelStyles.length === 0)) {
      dispatch(restoreFromParams(urlParams))
    }
    dispatch(setCurrentStep(4))
  }, [dispatch, searchParams, regionCode, periodLabel, companion, travelStyles.length])

  // 기존 선택된 스타일들 복원
  useEffect(() => {
    if (travelStyles.length > 0) {
      setSelectedStyles(travelStyles)
    }
  }, [travelStyles])

  // 현재 정보 (Redux 우선, URL 파라미터 폴백)
  const currentRegion = regionCode || searchParams.get('region')
  const currentPeriod = periodLabel || searchParams.get('period')
  const currentDays = days || searchParams.get('days')
  const currentWho = companion || searchParams.get('who')
  const displayedRegionName = regionName || currentRegion

  // 공통 상수에서 여행 스타일 데이터 가져옴
  const travelStyleOptions = TRAVEL_STYLES;

  const handleStyleToggle = (styleId) => {
    const isSelected = selectedStyles.includes(styleId)
    const styleData = travelStyleOptions.find(s => s.id === styleId)
    
    if (isSelected) {
      // 제거
      setSelectedStyles((prev) => prev.filter((id) => id !== styleId))
      dispatch(removeTravelStyle(styleId))
    } else {
      // 추가
      setSelectedStyles((prev) => [...prev, styleId])
      dispatch(addTravelStyle(styleData))
    }
  }

  const handleNext = () => {
    if (selectedStyles.length > 0) {
      window.scrollTo({ top: 0, behavior: 'auto' })
      const styleParams = selectedStyles.join(',')
      navigate(
        `/customized-schedule/schedule?region=${currentRegion}&period=${currentPeriod}&days=${currentDays}&who=${currentWho}&styles=${styleParams}`,
      )
    }
  }

  const handleBack = () => {
    navigate(
      `/customized-schedule/who?region=${currentRegion}&period=${currentPeriod}&days=${currentDays}`,
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* 진행률 표시 */}
      <ProgressSteps currentStep={4} onBack={handleBack} />
      
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
          내가 선호하는 여행 스타일은?
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          다중 선택이 가능해요. 원하는 스타일을 모두 선택해주세요.
        </p>
      </div>

      {/* 선택된 정보 표시 */}
      <div className="mb-6 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
        <div className="flex flex-wrap gap-3 text-sm">
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
          {currentWho && (
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                동행자
              </span>
              <Badge
                variant="outline"
                className="ml-2 dark:border-gray-600 dark:text-gray-300"
              >
                {companions.find((c) => c.id === currentWho)?.icon}{' '}
                {companions.find((c) => c.id === currentWho)?.label || currentWho}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* 여행 스타일 선택 */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {travelStyleOptions.map((style) => (
          <Card
            key={style.id}
            className={`cursor-pointer transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800 ${
              selectedStyles.includes(style.id)
                ? 'bg-blue-50 ring-2 ring-blue-500 dark:bg-blue-900/20 dark:ring-blue-400'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            onClick={() => handleStyleToggle(style.id)}
          >
            <CardContent className="p-5">
              <div className="mb-3 text-center">
                <div className="mb-2 text-3xl">{style.icon}</div>
                <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                  {style.label}
                </h3>
                <p className="mb-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  {style.description}
                </p>
              </div>

              <div className="border-t pt-3 dark:border-gray-600">
                <h4 className="mb-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                  예시
                </h4>
                <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  {style.examples}
                </p>
              </div>

              {selectedStyles.includes(style.id) && (
                <div className="mt-3 text-center">
                  <Badge variant="default" className="bg-blue-600 text-white">
                    ✓ 선택됨
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 선택된 스타일 표시 */}
      {selectedStyles.length > 0 && (
        <div className="mb-8 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <p className="mb-3 text-sm text-blue-600 dark:text-blue-400">
            선택된 여행 스타일 ({selectedStyles.length}개)
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedStyles.map((styleId) => {
              const style = travelStyleOptions.find((s) => s.id === styleId)
              return (
                <Badge
                  key={styleId}
                  variant="secondary"
                  className="flex items-center gap-1 bg-blue-100 text-blue-800"
                >
                  <span>{style.icon}</span>
                  {style.label}
                </Badge>
              )
            })}
          </div>
        </div>
      )}

      {/* 추천 팁 */}
      <div className="mb-8 rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
        <div className="flex items-start gap-3">
          <Heart className="mt-0.5 h-5 w-5 text-purple-600 dark:text-purple-400" />
          <div>
            <h4 className="mb-1 font-semibold text-purple-800 dark:text-purple-300">
              💡 스타일 선택 팁
            </h4>
            <div className="space-y-1 text-sm text-purple-700 dark:text-purple-300">
              <p>
                • <strong>2-3개 선택</strong>: 적당한 개수로 선택하면 더 정확한
                추천을 받을 수 있어요
              </p>
              <p>
                • <strong>다양한 조합</strong>: 액티비티 + 먹방, 힐링 + 자연 등
                원하는 대로 조합하세요
              </p>
              <p>
                • <strong>동행자 고려</strong>: 함께 가는 사람들의 취향도
                고려해서 선택해보세요
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 다음 버튼 */}
      <div className="flex justify-center">
        <Button
          onClick={handleNext}
          disabled={selectedStyles.length === 0}
          className="rounded-lg bg-blue-600 px-8 py-3 text-white hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600"
          size="lg"
        >
          다음
        </Button>
      </div>
    </div>
  )
}
