'use client'

import { useState, useCallback, useMemo, memo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CalendarIcon, ChevronDown, MapPin } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { format, isBefore, startOfToday } from 'date-fns'
import { ko } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

// 분리된 컴포넌트들
import PlannerHeader from '@/components/planner/PlannerHeader'
import DestinationBadgeList from '@/components/planner/DestinationBadgeList'
import DestinationAutocomplete from '@/components/planner/DestinationAutocomplete'
import SubmitButton from '@/components/planner/SubmitButton'

// 커스텀 훅들
import useGeolocation from '@/hooks/useGeolocation'
import useDateRange from '@/hooks/useDateRange'
import useDestinationManager from '@/hooks/useDestinationManager'
import useDestinationSearchRTK from '@/hooks/useDestinationSearchRTK'
import usePlanSubmissionRTK from '@/hooks/usePlanSubmissionRTK'
import { useGetTravelPlanQuery } from '@/store/api/travelPlansApi'

const PlannerForm = memo(() => {
  // URL 파라미터로 편집 모드 확인
  const [searchParams] = useSearchParams()
  const planId = searchParams.get('planId')
  const isEditMode = !!planId

  // 기존 플랜 데이터 로드 (편집 모드인 경우)
  const {
    data: existingPlan,
    isLoading: isLoadingPlan,
    isError: isPlanError,
  } = useGetTravelPlanQuery(planId, {
    skip: !planId, // planId가 없으면 API 호출하지 않음
  })

  // 커스텀 훅 사용
  const { getCurrentLocation, isLocating } = useGeolocation()
  const { getDatesInRange } = useDateRange()
  const {
    destinationsByDate,
    addDestination,
    removeDestination,
    reorderDestinations,
    setInitialDestinations,
    removePastDates,
    getPastDatesCount,
    clearDestinations,
  } = useDestinationManager()
  const {
    destInputs,
    destSuggestions,
    showDestDropdown,
    updateDestInput,
    hideDropdown,
    showDropdown,
    setFinalDestinationValue,
    isSearching: _isSearching,
    searchError: _searchError,
  } = useDestinationSearchRTK()
  const {
    isSubmitting,
    plans,
    submitPlan,
    error: _error,
  } = usePlanSubmissionRTK()

  // 기본 폼 상태 - 출발지를 제거하고 날짜만 관리
  const [form, setForm] = useState({
    dateRange: { from: null, to: null },
    title: '',
  })
  const [calendarOpen, setCalendarOpen] = useState(false)

  // 편집 모드에서 기존 데이터 로드
  useEffect(() => {
    if (isEditMode && existingPlan && !isLoadingPlan) {
      try {
        // 기본 정보 설정
        const today = new Date()
        const originalStartDate = existingPlan.start_date
          ? new Date(existingPlan.start_date)
          : null
        const originalEndDate = existingPlan.end_date
          ? new Date(existingPlan.end_date)
          : null

        // 과거 날짜 처리: 시작 날짜가 과거인 경우 오늘로 조정
        let adjustedStartDate = originalStartDate
        let adjustedEndDate = originalEndDate

        if (originalStartDate && originalStartDate < today) {
          // 여행 기간 계산 (날짜 차이)
          const originalDuration =
            originalEndDate && originalStartDate
              ? Math.ceil(
                  (originalEndDate - originalStartDate) / (1000 * 60 * 60 * 24),
                )
              : 0

          // 시작 날짜를 오늘로, 종료 날짜를 기간에 맞춰 조정
          adjustedStartDate = new Date(today)
          adjustedEndDate =
            originalDuration > 0
              ? new Date(
                  today.getTime() + originalDuration * 24 * 60 * 60 * 1000,
                )
              : new Date(today)
        }

        setForm({
          title: existingPlan.title || '',
          dateRange: {
            from: adjustedStartDate,
            to: adjustedEndDate,
          },
        })

        // 출발지 설정
        if (existingPlan.start_location) {
          updateDestInput('origin', existingPlan.start_location)
        }

        // 일정 데이터 변환 및 설정
        if (
          existingPlan.itinerary &&
          typeof existingPlan.itinerary === 'object' &&
          adjustedStartDate
        ) {
          const convertedDestinations = {}

          Object.entries(existingPlan.itinerary).forEach(
            ([dayKey, destinations]) => {
              // "Day 1", "Day 2" 형태를 실제 날짜로 변환 (조정된 시작 날짜 기준)
              const dayNumber = parseInt(dayKey.replace('Day ', '')) - 1
              const currentDate = new Date(adjustedStartDate)
              currentDate.setDate(adjustedStartDate.getDate() + dayNumber)
              const dateString = currentDate.toISOString().split('T')[0]

              // 목적지 데이터 변환
              if (Array.isArray(destinations) && destinations.length > 0) {
                convertedDestinations[dateString] = destinations.map(
                  (dest) => ({
                    description: dest.description,
                    place_id: dest.place_id || null,
                  }),
                )
              }
            },
          )

          setInitialDestinations(convertedDestinations)
        }

        // 사용자 알림
        if (originalStartDate && originalStartDate < today) {
          toast.info('과거 날짜가 오늘 날짜로 조정되었습니다', {
            duration: 3000,
            position: 'top-center',
          })
        } else {
          toast.success('기존 여행 계획을 불러왔습니다', {
            duration: 2000,
            position: 'bottom-right',
          })
        }
      } catch (error) {
        console.error('플랜 데이터 로드 중 오류:', error)
        toast.error('플랜 데이터를 불러오는 중 문제가 발생했습니다', {
          duration: 3000,
          position: 'top-center',
        })
      }
    }
  }, [
    isEditMode,
    existingPlan,
    isLoadingPlan,
    updateDestInput,
    setInitialDestinations,
  ])

  // 현재 위치 자동 감지 (피드백 개선)
  const handleAutoLocation = useCallback(async () => {
    try {
      const address = await getCurrentLocation()
      updateDestInput('origin', address)

      // 성공 피드백
      toast.success('현재 위치가 설정되었습니다', {
        duration: 2000,
        position: 'bottom-right',
      })
    } catch (error) {
      // 에러는 훅 내부에서 처리되지만 추가 사용자 안내
      console.warn('위치 감지 실패:', error)
      toast.error('위치를 가져올 수 없습니다. 직접 입력해 주세요', {
        duration: 3000,
        position: 'top-center',
      })
    }
  }, [getCurrentLocation, updateDestInput])

  // 출발지 자동완성 선택 처리
  const handleOriginSelect = useCallback(
    (suggestion) => {
      const value =
        typeof suggestion === 'string' ? suggestion : suggestion.description
      setFinalDestinationValue('origin', value)
    },
    [setFinalDestinationValue],
  )

  // 날짜 범위 계산 - 메모이제이션
  const allDates = useMemo(() => {
    return getDatesInRange(form.dateRange?.from, form.dateRange?.to)
  }, [form.dateRange?.from, form.dateRange?.to, getDatesInRange])

  // 과거 날짜 필터링된 날짜 목록 (편집 모드에서만 적용)
  const dates = useMemo(() => {
    if (!isEditMode) return allDates

    const today = new Date().toISOString().split('T')[0]
    return allDates.filter((date) => date >= today)
  }, [allDates, isEditMode])

  // 폼 유효성 검사 - 메모이제이션 (안전장치 추가)
  const formValidation = useMemo(() => {
    const validation = {
      isValid: false,
      missingFields: [],
      hasDestinations: false,
      hasValidDates: false,
    }

    try {
      // 제목 검증
      const hasTitle = form.title && form.title.trim().length > 0
      if (!hasTitle) {
        validation.missingFields.push('여행 제목')
      }

      // 출발지 검증
      const hasOrigin = destInputs.origin && destInputs.origin.trim().length > 0
      if (!hasOrigin) {
        validation.missingFields.push('출발지')
      }

      // 날짜 검증 (안전장치)
      const hasValidDates =
        form.dateRange?.from &&
        form.dateRange?.to &&
        form.dateRange.from instanceof Date &&
        form.dateRange.to instanceof Date &&
        !isNaN(form.dateRange.from.getTime()) &&
        !isNaN(form.dateRange.to.getTime())

      validation.hasValidDates = hasValidDates
      if (!hasValidDates) {
        validation.missingFields.push('여행 기간')
      }

      // 목적지 검증 (안전장치)
      const destinationCount = Object.keys(destinationsByDate || {}).length
      const hasDestinations = destinationCount > 0
      validation.hasDestinations = hasDestinations
      if (!hasDestinations) {
        validation.missingFields.push('여행 목적지')
      }

      // 전체 유효성 (기존 로직 유지)
      validation.isValid =
        hasTitle && hasOrigin && hasValidDates && hasDestinations

      return validation
    } catch (error) {
      console.warn('폼 검증 중 오류:', error)
      return {
        isValid: false,
        missingFields: ['폼 데이터'],
        hasDestinations: false,
        hasValidDates: false,
      }
    }
  }, [
    form.title,
    destInputs.origin,
    form.dateRange?.from,
    form.dateRange?.to,
    destinationsByDate,
  ])

  // 기존 호환성을 위한 isFormValid (기존 코드와 동일한 동작)
  const isFormValid = formValidation.isValid

  // 목적지 추가 (사용자 피드백 개선)
  const handleAddDestination = useCallback(
    (date, dest) => {
      try {
        addDestination(date, dest)
        // 입력창 클리어
        updateDestInput(date, '')
        hideDropdown(date)

        // 성공 피드백 (간단하고 방해되지 않게)
        const destinationName =
          typeof dest === 'string' ? dest : dest.description
        toast.success(`"${destinationName}" 목적지가 추가되었습니다`, {
          duration: 2000,
          position: 'bottom-right',
        })
      } catch (error) {
        console.error('목적지 추가 중 오류:', error)
        toast.error('목적지 추가 중 문제가 발생했습니다', {
          duration: 3000,
          position: 'top-center',
        })
      }
    },
    [addDestination, updateDestInput, hideDropdown],
  )

  // 목적지 제거 (사용자 피드백 개선)
  const handleRemoveDestination = useCallback(
    (date, dest) => {
      try {
        removeDestination(date, dest)

        // 제거 피드백
        const destinationName =
          typeof dest === 'string' ? dest : dest.description
        toast.info(`"${destinationName}" 목적지가 제거되었습니다`, {
          duration: 2000,
          position: 'bottom-right',
        })
      } catch (error) {
        console.error('목적지 제거 중 오류:', error)
        toast.error('목적지 제거 중 문제가 발생했습니다', {
          duration: 3000,
          position: 'top-center',
        })
      }
    },
    [removeDestination],
  )

  // 폼 제출 (안전장치 추가)
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()

      // 제출 전 최종 검증 (안전장치)
      if (!formValidation.isValid) {
        const missingFieldsText = formValidation.missingFields.join(', ')
        toast.error(`다음 항목을 확인해 주세요: ${missingFieldsText}`, {
          duration: 4000,
          position: 'top-center',
        })
        return
      }

      try {
        const formData = {
          title: form.title || `${destInputs.origin} 여행`,
          origin: destInputs.origin,
          dateRange: form.dateRange,
          destinationsByDate,
        }

        await submitPlan(formData, planId)
      } catch (error) {
        console.error('플랜 제출 중 오류:', error)
        toast.error(
          '여행 계획 생성 중 문제가 발생했습니다. 다시 시도해 주세요.',
          {
            duration: 4000,
            position: 'top-center',
          },
        )
      }
    },
    [form, destInputs, destinationsByDate, submitPlan, formValidation, planId],
  )

  // 로딩 상태 처리
  if (isLoadingPlan) {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 px-2 py-2 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="mx-auto w-full max-w-2xl">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <p className="mt-4 text-gray-600">여행 계획을 불러오는 중...</p>
            <p className="mt-1 text-sm text-gray-400">잠시만 기다려 주세요</p>
          </div>
        </div>
      </div>
    )
  }

  // 편집 모드에서 플랜을 찾을 수 없는 경우
  if (isEditMode && isPlanError) {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 px-2 py-2 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="mx-auto w-full max-w-2xl">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <h3 className="mb-2 text-lg font-semibold text-red-800">
              여행 계획을 찾을 수 없습니다
            </h3>
            <p className="mb-4 text-red-700">
              요청하신 여행 계획이 존재하지 않거나 접근 권한이 없습니다.
            </p>
            <button
              onClick={() => window.history.back()}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              뒤로가기
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50/50 px-4 py-6 dark:bg-gray-900">
      <motion.div
        className="mx-auto w-full max-w-3xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* 편집 모드 표시 */}
        {isEditMode && (
          <div className="mb-6 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 text-center shadow-sm">
            <div className="flex items-center justify-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-indigo-500"></div>
              <p className="text-sm font-medium text-indigo-700">
                편집 모드 - 기존 여행 계획을 수정하고 있습니다
              </p>
              <div className="h-2 w-2 animate-pulse rounded-full bg-purple-500"></div>
            </div>
          </div>
        )}

        {/* 헤더 */}
        <PlannerHeader />

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 기본 정보 입력 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card className="rounded-2xl border border-gray-200/50 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-md">
                    <span className="text-sm font-bold text-white">1</span>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                    여행 기본 정보
                  </h2>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="title"
                      className="text-muted-foreground text-sm font-medium"
                    >
                      여행 제목
                    </label>
                    <Input
                      id="title"
                      value={form.title}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, title: e.target.value }))
                      }
                      placeholder="예: 제주도 3박 4일 힐링 여행"
                    />
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="relative space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        출발지
                      </label>
                      <div className="flex gap-2">
                        <Input
                          value={destInputs.origin || ''}
                          onChange={(e) =>
                            updateDestInput('origin', e.target.value)
                          }
                          onFocus={() => showDropdown('origin')}
                          onBlur={() =>
                            setTimeout(() => hideDropdown('origin'), 150)
                          }
                          placeholder="출발 도시를 입력하세요"
                          className="flex-1"
                          autoComplete="off"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={handleAutoLocation}
                          disabled={isLocating}
                          className="shrink-0 bg-transparent"
                        >
                          {isLocating ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                          ) : (
                            <MapPin className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <DestinationAutocomplete
                        isVisible={showDestDropdown.origin}
                        suggestions={destSuggestions.origin}
                        onSelect={handleOriginSelect}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        여행 기간
                      </label>
                      <Popover
                        open={calendarOpen}
                        onOpenChange={setCalendarOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between bg-transparent font-normal"
                            type="button"
                          >
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="h-4 w-4" />
                              {form.dateRange?.from && form.dateRange?.to ? (
                                <span>
                                  {format(form.dateRange.from, 'M월 d일', {
                                    locale: ko,
                                  })}{' '}
                                  ~{' '}
                                  {format(form.dateRange.to, 'M월 d일', {
                                    locale: ko,
                                  })}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">
                                  날짜를 선택하세요
                                </span>
                              )}
                            </div>
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="range"
                            selected={form.dateRange}
                            onSelect={(range) => {
                              setForm((prev) => ({
                                ...prev,
                                dateRange: range || { from: null, to: null },
                              }))
                            }}
                            numberOfMonths={2}
                            locale={ko}
                            disabled={(date) => isBefore(date, startOfToday())}
                            fromDate={startOfToday()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 날짜별 목적지 선택 */}
          <AnimatePresence>
            {dates.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="rounded-2xl border border-gray-200/50 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <CardContent className="p-6">
                    <div className="mb-6 flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-600 shadow-md">
                        <span className="text-sm font-bold text-white">2</span>
                      </div>
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                        날짜별 목적지 선택
                      </h2>
                    </div>
                    <p className="mt-1 mb-4 text-sm text-gray-400">
                      14일 이후의 날씨 데이터는 제한적으로 제공될 수 있습니다.
                    </p>

                    {/* 과거 날짜 알림 및 삭제 버튼 */}
                    {getPastDatesCount() > 0 && (
                      <div className="mb-6 rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-red-50 p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 shadow-sm">
                              <span className="text-lg">⚠️</span>
                            </div>
                            <div>
                              <p className="mb-1 text-sm font-semibold text-orange-800">
                                과거 날짜 감지됨
                              </p>
                              <p className="text-xs text-orange-600">
                                {getPastDatesCount()}개의 과거 날짜가 있습니다.
                                날씨 정보를 가져올 수 없어요.
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              removePastDates()
                              toast.success('과거 날짜가 삭제되었습니다', {
                                duration: 2000,
                                position: 'bottom-right',
                              })
                            }}
                            className="rounded-xl border-orange-300 bg-orange-100 font-medium text-orange-700 shadow-sm hover:bg-orange-200"
                          >
                            과거 날짜 삭제
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-8">
                      {dates.map((dateStr, index) => {
                        const isPastDate =
                          dateStr < new Date().toISOString().split('T')[0]
                        return (
                          <motion.div
                            key={dateStr}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.3 }}
                          >
                            <Card
                              className={`border ${isPastDate ? 'border-orange-200 bg-orange-50/50' : 'border-gray-200/50 bg-white'} rounded-2xl shadow-sm dark:border-gray-700 dark:bg-gray-800`}
                            >
                              <CardContent className="p-5">
                                <div className="mb-4 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`flex h-8 w-8 items-center justify-center rounded-full shadow-sm ${isPastDate ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white' : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'}`}
                                    >
                                      <span className="text-xs font-bold">
                                        {index + 1}
                                      </span>
                                    </div>
                                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                                      {format(
                                        new Date(dateStr),
                                        'M월 d일 (E)',
                                        {
                                          locale: ko,
                                        },
                                      )}
                                    </h3>
                                    {isPastDate && (
                                      <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700 shadow-sm">
                                        과거 날짜
                                      </span>
                                    )}
                                  </div>
                                  {isPastDate && (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        clearDestinations(dateStr)
                                        toast.info(
                                          `${format(new Date(dateStr), 'M월 d일', { locale: ko })} 목적지가 삭제되었습니다`,
                                          {
                                            duration: 2000,
                                            position: 'bottom-right',
                                          },
                                        )
                                      }}
                                      className="rounded-lg border-orange-300 font-medium text-orange-600 shadow-sm hover:bg-orange-100 hover:text-orange-700"
                                    >
                                      삭제
                                    </Button>
                                  )}
                                </div>

                                <div className="relative space-y-3">
                                  <label className="mb-1 block text-sm font-semibold text-gray-600 dark:text-gray-300">
                                    📍 목적지 추가
                                  </label>
                                  {isPastDate ? (
                                    <div className="rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-4 shadow-sm">
                                      <div className="flex items-center gap-2">
                                        <span className="text-lg">⏰</span>
                                        <p className="text-sm font-medium text-orange-700">
                                          과거 날짜입니다. 목적지를 추가할 수
                                          없습니다.
                                        </p>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <Input
                                        value={destInputs[dateStr] || ''}
                                        onChange={(e) =>
                                          updateDestInput(
                                            dateStr,
                                            e.target.value,
                                          )
                                        }
                                        onFocus={() => showDropdown(dateStr)}
                                        onBlur={() =>
                                          setTimeout(
                                            () => hideDropdown(dateStr),
                                            150,
                                          )
                                        }
                                        placeholder="🔍 도시, 장소 등을 검색하세요"
                                        autoComplete="off"
                                        className="rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                                      />
                                      <DestinationAutocomplete
                                        isVisible={showDestDropdown[dateStr]}
                                        suggestions={destSuggestions[dateStr]}
                                        onSelect={(suggestion) =>
                                          handleAddDestination(
                                            dateStr,
                                            suggestion,
                                          )
                                        }
                                      />
                                    </>
                                  )}
                                </div>

                                <DestinationBadgeList
                                  destinations={
                                    destinationsByDate[dateStr] || []
                                  }
                                  onRemove={(destination) =>
                                    handleRemoveDestination(
                                      dateStr,
                                      destination,
                                    )
                                  }
                                  onReorder={(newOrder) =>
                                    reorderDestinations(dateStr, newOrder)
                                  }
                                  date={dateStr}
                                />
                              </CardContent>
                            </Card>
                          </motion.div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 제출 버튼 */}
          <div className="mt-6 mb-0 flex items-center justify-center pb-0">
            <div className="w-full max-w-md">
              {/* 폼 완성도 안내 (사용자 친화적 피드백) */}
              {!formValidation.isValid &&
                formValidation.missingFields.length > 0 && (
                  <div className="mb-6 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 text-center shadow-sm">
                    <div className="mb-4 flex items-center justify-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-sm">
                        <span className="text-sm font-bold text-white">!</span>
                      </div>
                      <p className="text-sm font-semibold text-blue-800">
                        아직 {formValidation.missingFields.length}개 항목이
                        남았어요!
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                      {formValidation.missingFields.map((field, _index) => (
                        <span
                          key={field}
                          className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700"
                        >
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              <SubmitButton
                isSubmitting={isSubmitting}
                disabled={isSubmitting || !isFormValid}
                onSubmit={handleSubmit}
                isEditMode={isEditMode}
              />
            </div>
          </div>
        </form>

        {/* 플랜 결과 표시 영역 */}
        {plans.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-12"
          >
            <Card className="rounded-2xl border border-gray-200/50 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <CardContent className="p-6">
                <h3 className="mb-6 text-center text-2xl font-bold">
                  ✨ 맞춤 여행 플랜이 완성되었어요!
                </h3>
                {/* 플랜 결과 렌더링 로직 추가 */}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
})

PlannerForm.displayName = 'PlannerForm'

export default PlannerForm
