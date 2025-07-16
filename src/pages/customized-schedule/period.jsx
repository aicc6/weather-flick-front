import { useState, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, Calendar } from '@/components/icons'
import { TRAVEL_PERIODS } from '@/constants/travelOptions'
import { setPeriod, setCurrentStep, restoreFromParams } from '@/store/slices/customizedScheduleSlice'

export default function CustomizedSchedulePeriodPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [searchParams] = useSearchParams()
  const [selectedPeriod, setSelectedPeriod] = useState(null)
  const nextButtonRef = useRef(null)

  // Redux 상태 가져오기
  const { regionCode, regionName, period, periodLabel } = useSelector(
    (state) => state.customizedSchedule,
  )

  // URL 파라미터에서 상태 복원
  useEffect(() => {
    const urlRegion = searchParams.get('region')
    if (urlRegion && !regionCode) {
      dispatch(restoreFromParams({ region: urlRegion }))
    }
    dispatch(setCurrentStep(2))
  }, [dispatch, searchParams, regionCode])

  // 기존 선택된 기간 복원
  useEffect(() => {
    if (period && periodLabel) {
      const existingPeriod = TRAVEL_PERIODS.find(p => p.id === period)
      if (existingPeriod) {
        setSelectedPeriod(existingPeriod)
      }
    }
  }, [period, periodLabel])

  useEffect(() => {
    if (selectedPeriod && nextButtonRef.current) {
      nextButtonRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [selectedPeriod])

  // 현재 지역 정보 (URL 파라미터 폴백)
  const currentRegionCode = regionCode || searchParams.get('region')
  const displayRegionName = regionName || currentRegionCode

  // 공통 상수에서 여행 기간 데이터 가져옴
  const periods = TRAVEL_PERIODS;

  const handlePeriodSelect = (period) => {
    setSelectedPeriod(period)
    // Redux 상태에도 저장
    dispatch(setPeriod({
      id: period.id,
      label: period.label,
      days: period.days
    }))
  }

  const handleNext = () => {
    if (selectedPeriod) {
      window.scrollTo({ top: 0, behavior: 'auto' })
      // URL 파라미터와 함께 이동 (하위 호환성 유지)
      navigate(
        `/customized-schedule/who?region=${currentRegionCode}&period=${selectedPeriod.label}&days=${selectedPeriod.days}`,
      )
    }
  }

  const handleBack = () => {
    navigate('/customized-schedule/region')
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="p-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            2/5
          </span>
        </div>
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
          여행 기간은?
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          원하는 기간을 선택해 주세요.
        </p>
      </div>

      {/* 선택된 지역 표시 */}
      {currentRegionCode && (
        <div className="mb-6 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
          <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">
            선택된 여행지
          </p>
          <Badge
            variant="outline"
            className="text-gray-700 dark:border-gray-600 dark:text-gray-300"
          >
            {displayRegionName}
          </Badge>
        </div>
      )}

      {/* 기간 선택 */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {periods.map((period) => (
          <Card
            key={period.id}
            className={`cursor-pointer transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800 ${
              selectedPeriod?.id === period.id
                ? 'bg-blue-50 ring-2 ring-blue-500 dark:bg-blue-900/20 dark:ring-blue-400'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            onClick={() => handlePeriodSelect(period)}
          >
            <CardContent className="p-6 text-center">
              <div className="mb-3 text-3xl">{period.icon}</div>
              <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                {period.label}
              </h3>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                {period.description}
              </p>
              {period.days > 1 && (
                <div className="mt-3 text-xs font-medium text-blue-600 dark:text-blue-400">
                  {period.days}일 일정
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 선택된 기간 표시 */}
      {selectedPeriod && (
        <div className="mb-8 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <p className="mb-2 text-sm text-blue-600 dark:text-blue-400">
            선택된 여행 기간
          </p>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{selectedPeriod.icon}</span>
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200"
            >
              {selectedPeriod.label}
            </Badge>
          </div>
        </div>
      )}

      {/* 추천 팁 */}
      <div className="mb-8 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
        <div className="flex items-start gap-3">
          <Calendar className="mt-0.5 h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          <div>
            <h4 className="mb-1 font-semibold text-yellow-800 dark:text-yellow-300">
              💡 추천 팁
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              • <strong>2박 3일</strong>: 가장 인기 있는 기간으로 주요 명소를
              둘러볼 수 있어요
              <br />• <strong>3박 4일 이상</strong>: 여유로운 일정으로 현지
              문화를 깊이 체험할 수 있어요
              <br />• <strong>당일치기</strong>: 근거리 여행지에 적합하며 간단한
              휴식에 좋아요
            </p>
          </div>
        </div>
      </div>

      {/* 다음 버튼 */}
      <div className="flex justify-center" ref={nextButtonRef}>
        <Button
          onClick={handleNext}
          disabled={!selectedPeriod}
          className="rounded-lg bg-blue-600 px-8 py-3 text-white hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600"
          size="lg"
        >
          다음
        </Button>
      </div>
    </div>
  )
}
