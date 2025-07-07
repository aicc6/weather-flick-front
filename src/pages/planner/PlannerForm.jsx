'use client'

import { useState, useCallback, useMemo, memo } from 'react'
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
import {
  format,
  addDays,
  isBefore,
  startOfToday,
  differenceInCalendarDays,
} from 'date-fns'
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

const PlannerForm = memo(() => {
  // 커스텀 훅 사용
  const { getCurrentLocation, isLocating } = useGeolocation()
  const { getDatesInRange } = useDateRange()
  const {
    destinationsByDate,
    addDestination,
    removeDestination,
    reorderDestinations,
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
  const dates = useMemo(() => {
    return getDatesInRange(form.dateRange?.from, form.dateRange?.to)
  }, [form.dateRange?.from, form.dateRange?.to, getDatesInRange])

  // 폼 유효성 검사 - 메모이제이션 (안전장치 추가)
  const formValidation = useMemo(() => {
    const validation = {
      isValid: false,
      missingFields: [],
      hasDestinations: false,
      hasValidDates: false,
    }

    try {
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
      validation.isValid = hasOrigin && hasValidDates && hasDestinations

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

        await submitPlan(formData)
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
    [form, destInputs, destinationsByDate, submitPlan, formValidation],
  )

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 px-2 py-2 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <motion.div
        className="mx-auto w-full max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* 헤더 */}
        <PlannerHeader />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 입력 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm dark:bg-gray-800/80">
              <CardContent className="p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      1
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold">여행 기본 정보</h2>
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
                              if (range?.from && range?.to) {
                                const maxEnd = addDays(range.from, 14)
                                let to = range.to
                                if (
                                  differenceInCalendarDays(to, range.from) > 14
                                ) {
                                  to = maxEnd
                                  const isDark =
                                    document.documentElement.classList.contains(
                                      'dark',
                                    )
                                  toast.error(
                                    '여행 기간은 최대 15일까지 선택할 수 있습니다.',
                                    {
                                      duration: 3000,
                                      position: 'top-center',
                                      icon: '📅',
                                      style: isDark
                                        ? {
                                            background:
                                              'linear-gradient(90deg, #1e293b 0%, #334155 100%)',
                                            color: '#f1f5f9',
                                            fontWeight: 'bold',
                                            borderRadius: '12px',
                                            boxShadow:
                                              '0 4px 24px 0 rgba(30,41,59,0.30)',
                                            fontSize: '1.05rem',
                                            padding: '1rem 1.5rem',
                                            border: '1px solid #64748b',
                                          }
                                        : {
                                            background:
                                              'linear-gradient(90deg, #f9fafb 0%, #e0e7ff 100%)',
                                            color: '#1e293b',
                                            fontWeight: 'bold',
                                            borderRadius: '12px',
                                            boxShadow:
                                              '0 4px 24px 0 rgba(30,41,59,0.10)',
                                            fontSize: '1.05rem',
                                            padding: '1rem 1.5rem',
                                            border: '1px solid #a5b4fc',
                                          },
                                    },
                                  )
                                }
                                setForm((prev) => ({
                                  ...prev,
                                  dateRange: { from: range.from, to },
                                }))
                              } else {
                                setForm((prev) => ({
                                  ...prev,
                                  dateRange: range || { from: null, to: null },
                                }))
                              }
                            }}
                            numberOfMonths={2}
                            locale={ko}
                            disabled={(date) => isBefore(date, startOfToday())}
                            fromDate={startOfToday()}
                            toDate={addDays(startOfToday(), 14)}
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
                <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm dark:bg-gray-800/80">
                  <CardContent className="p-8">
                    <div className="mb-6 flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                        <span className="font-bold text-purple-600 dark:text-purple-400">
                          2
                        </span>
                      </div>
                      <h2 className="text-xl font-semibold">
                        날짜별 목적지 선택
                      </h2>
                    </div>
                    <p className="mt-1 mb-4 text-sm text-gray-400">
                      14일 이후의 날씨 데이터는 알림으로 알려드립니다.
                    </p>

                    <div className="space-y-6">
                      {dates.map((dateStr, index) => (
                        <motion.div
                          key={dateStr}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.3 }}
                        >
                          <Card className="border border-gray-200 dark:border-gray-700">
                            <CardContent className="p-6">
                              <div className="mb-4 flex items-center gap-2">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                                    {index + 1}
                                  </span>
                                </div>
                                <h3 className="font-medium">
                                  {format(new Date(dateStr), 'M월 d일 (E)', {
                                    locale: ko,
                                  })}
                                </h3>
                              </div>

                              <div className="relative space-y-3">
                                <label className="text-muted-foreground text-sm font-medium">
                                  {dateStr} 목적지 추가
                                </label>
                                <Input
                                  value={destInputs[dateStr] || ''}
                                  onChange={(e) =>
                                    updateDestInput(dateStr, e.target.value)
                                  }
                                  onFocus={() => showDropdown(dateStr)}
                                  onBlur={() =>
                                    setTimeout(() => hideDropdown(dateStr), 150)
                                  }
                                  placeholder="도시, 장소 등을 검색하세요"
                                  autoComplete="off"
                                />
                                <DestinationAutocomplete
                                  isVisible={showDestDropdown[dateStr]}
                                  suggestions={destSuggestions[dateStr]}
                                  onSelect={(suggestion) =>
                                    handleAddDestination(dateStr, suggestion)
                                  }
                                />
                              </div>

                              <DestinationBadgeList
                                destinations={destinationsByDate[dateStr] || []}
                                onRemove={(destination) =>
                                  handleRemoveDestination(dateStr, destination)
                                }
                                onReorder={(newOrder) =>
                                  reorderDestinations(dateStr, newOrder)
                                }
                                date={dateStr}
                              />
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
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
                  <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-center">
                    <p className="text-sm text-blue-700">
                      <span className="font-medium">
                        아직 {formValidation.missingFields.length}개 항목이
                        남았어요!
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-blue-600">
                      {formValidation.missingFields.join(', ')}을 입력해 주세요
                    </p>
                  </div>
                )}

              <SubmitButton
                isSubmitting={isSubmitting}
                disabled={isSubmitting || !isFormValid}
                onSubmit={handleSubmit}
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
            <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm dark:bg-gray-800/80">
              <CardContent className="p-8">
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
