import { useState, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, Clock } from '@/components/icons'
import { COMPANIONS, TRAVEL_STYLES, SCHEDULE_TYPES } from '@/constants/travelOptions'
import { setScheduleType, setCurrentStep, restoreFromParams } from '@/store/slices/customizedScheduleSlice'

// 공통 상수에서 데이터 가져옴
const companions = COMPANIONS;

export default function CustomizedScheduleSchedulePage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [searchParams] = useSearchParams()
  const [selectedSchedule, setSelectedSchedule] = useState(null)
  const nextButtonRef = useRef(null)

  // Redux 상태 가져오기
  const { 
    regionCode, 
    regionName, 
    periodLabel, 
    days,
    companion,
    travelStyles,
    travelStylesData,
    scheduleType,
    scheduleTypeData
  } = useSelector((state) => state.customizedSchedule)

  // URL 파라미터에서 상태 복원
  useEffect(() => {
    const urlParams = {
      region: searchParams.get('region'),
      period: searchParams.get('period'),
      days: searchParams.get('days'),
      who: searchParams.get('who'),
      styles: searchParams.get('styles'),
      schedule: searchParams.get('schedule')
    }
    
    // URL 파라미터가 있고 Redux 상태가 비어있으면 복원
    if ((urlParams.region && !regionCode) || 
        (urlParams.period && !periodLabel) ||
        (urlParams.who && !companion) ||
        (urlParams.styles && travelStyles.length === 0) ||
        (urlParams.schedule && !scheduleType)) {
      dispatch(restoreFromParams(urlParams))
    }
    dispatch(setCurrentStep(5))
  }, [dispatch, searchParams, regionCode, periodLabel, companion, travelStyles.length, scheduleType])

  // 기존 선택된 일정 타입 복원
  useEffect(() => {
    if (scheduleType) {
      const existingSchedule = SCHEDULE_TYPES.find(s => s.id === scheduleType)
      if (existingSchedule) {
        setSelectedSchedule(existingSchedule)
      }
    }
  }, [scheduleType])

  useEffect(() => {
    if (selectedSchedule && nextButtonRef.current) {
      nextButtonRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [selectedSchedule])

  // 현재 정보 (Redux 우선, URL 파라미터 폴백)
  const currentRegion = regionCode || searchParams.get('region')
  const currentPeriod = periodLabel || searchParams.get('period')
  const currentDays = days || searchParams.get('days')
  const currentWho = companion || searchParams.get('who')
  const currentStyles = travelStyles.length > 0 
    ? travelStyles.join(',') 
    : searchParams.get('styles')
  const displayedRegionName = regionName || currentRegion

  const scheduleTypes = SCHEDULE_TYPES;

  const travelStyleOptions = TRAVEL_STYLES;

  const handleScheduleSelect = (schedule) => {
    setSelectedSchedule(schedule)
    // Redux 상태에도 저장
    dispatch(setScheduleType(schedule))
  }

  const handleNext = () => {
    if (selectedSchedule) {
      const params = new URLSearchParams({
        region: currentRegion || '',
        period: currentPeriod || '',
        days: currentDays || '',
        who: currentWho || '',
        styles: currentStyles || '',
        schedule: selectedSchedule.id,
      }).toString()

      navigate(`/customized-schedule/result?${params}`)
    }
  }

  const handleBack = () => {
    navigate(
      `/customized-schedule/style?region=${currentRegion}&period=${currentPeriod}&days=${currentDays}&who=${currentWho}`,
    )
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
            5/5
          </span>
        </div>
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
          선호하는 여행 일정은?
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          선택해주신 스타일로 일정을 만들어드려요.
        </p>
      </div>

      {/* 선택된 정보 표시 */}
      <div className="mb-8 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
        <h3 className="mb-3 font-semibold text-gray-800 dark:text-white">
          선택하신 정보
        </h3>
        <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
          {currentRegion && (
            <div>
              <span className="block text-xs text-gray-500 dark:text-gray-400">
                여행지
              </span>
              <Badge
                variant="outline"
                className="mt-1 dark:border-gray-600 dark:text-gray-300"
              >
                {displayedRegionName}
              </Badge>
            </div>
          )}
          {currentPeriod && (
            <div>
              <span className="block text-xs text-gray-500 dark:text-gray-400">
                기간
              </span>
              <Badge
                variant="outline"
                className="mt-1 dark:border-gray-600 dark:text-gray-300"
              >
                {currentPeriod}
              </Badge>
            </div>
          )}
          {currentWho && (
            <div>
              <span className="block text-xs text-gray-500 dark:text-gray-400">
                동행자
              </span>
              <Badge
                variant="outline"
                className="mt-1 flex items-center gap-1 dark:border-gray-600 dark:text-gray-300"
              >
                {companions.find((c) => c.id === currentWho)?.icon}
                {companions.find((c) => c.id === currentWho)?.label || currentWho}
              </Badge>
            </div>
          )}
          {currentStyles && (
            <div>
              <span className="block text-xs text-gray-500 dark:text-gray-400">
                스타일
              </span>
              <div className="mt-1 flex flex-wrap gap-1">
                {currentStyles.split(',').map((styleId) => {
                  const style = travelStyleOptions.find((s) => s.id === styleId)
                  return (
                    <Badge
                      key={styleId}
                      variant="outline"
                      className="flex items-center gap-1 dark:border-gray-600 dark:text-gray-300"
                    >
                      <span>{style?.icon}</span>
                      {style?.label || styleId}
                    </Badge>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 일정 타입 선택 */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {scheduleTypes.map((schedule) => (
          <Card
            key={schedule.id}
            className={`cursor-pointer transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 ${
              selectedSchedule?.id === schedule.id
                ? 'bg-blue-50 ring-2 ring-blue-500 dark:bg-blue-900/20 dark:ring-blue-400'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            onClick={() => handleScheduleSelect(schedule)}
          >
            <CardContent className="p-6">
              <div className="mb-4 text-center">
                <div className="mb-3 text-4xl">{schedule.icon}</div>
                <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                  {schedule.label}
                </h3>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  {schedule.description}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                    특징
                  </h4>
                  <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                    {schedule.characteristics.map((char, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="mt-1 text-blue-500">•</span>
                        {char}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <h4 className="mb-1 text-xs font-semibold text-green-700 dark:text-green-400">
                      장점
                    </h4>
                    <ul className="space-y-1 text-xs text-green-600 dark:text-green-400">
                      {schedule.pros.map((pro, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <span>+</span>
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-1 text-xs font-semibold text-orange-700 dark:text-orange-400">
                      고려사항
                    </h4>
                    <ul className="space-y-1 text-xs text-orange-600 dark:text-orange-400">
                      {schedule.cons.map((con, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <span>-</span>
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {selectedSchedule?.id === schedule.id && (
                <div className="mt-4 text-center">
                  <Badge variant="default" className="bg-blue-600 text-white">
                    ✓ 선택됨
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 선택된 일정 타입 표시 */}
      {selectedSchedule && (
        <div className="mb-8 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <p className="mb-2 text-sm text-blue-600 dark:text-blue-400">
            선택된 일정 스타일
          </p>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{selectedSchedule.icon}</span>
            <div>
              <Badge
                variant="secondary"
                className="mb-1 bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200"
              >
                {selectedSchedule.label}
              </Badge>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {selectedSchedule.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 마지막 단계 안내 */}
      <div className="mb-8 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
        <div className="flex items-start gap-3">
          <Clock className="mt-0.5 h-5 w-5 text-green-600 dark:text-green-400" />
          <div>
            <h4 className="mb-1 font-semibold text-green-800 dark:text-green-300">
              🎉 마지막 단계예요!
            </h4>
            <p className="text-sm text-green-700 dark:text-green-300">
              선택해주신 정보를 바탕으로 맞춤형 여행 일정을 생성해드릴게요. 날씨
              정보와 현지 상황을 고려하여 최적의 여행 코스를 추천해드립니다.
            </p>
          </div>
        </div>
      </div>

      {/* 완료 버튼 */}
      <div className="flex justify-center" ref={nextButtonRef}>
        <Button
          onClick={handleNext}
          disabled={!selectedSchedule}
          className="rounded-lg bg-blue-600 px-12 py-4 text-lg text-white hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600"
          size="lg"
        >
          맞춤 여행 일정 생성하기 🚀
        </Button>
      </div>
    </div>
  )
}
