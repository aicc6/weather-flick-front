'use client'

import { useState, useCallback, useMemo, memo } from 'react'
import { CalendarIcon, ChevronDown, MapPin, Plus } from 'lucide-react'
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
import useDestinationSearch from '@/hooks/useDestinationSearch'
import usePlanSubmission from '@/hooks/usePlanSubmission'

const PlannerForm = memo(() => {
  // 기본 폼 상태
  const [form, setForm] = useState({
    origin: '',
    dateRange: { from: null, to: null },
  })

  const [calendarOpen, setCalendarOpen] = useState(false)

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
    _activeDateInput,
    updateDestInput,
    hideDropdown,
    showDropdown,
  } = useDestinationSearch()
  const { isSubmitting, plans, submitPlan } = usePlanSubmission()

  // 현재 위치 자동 감지
  const handleAutoLocation = useCallback(async () => {
    try {
      const address = await getCurrentLocation()
      setForm((prev) => ({ ...prev, origin: address }))
    } catch {
      // 에러는 훅 내부에서 처리됨
    }
  }, [getCurrentLocation])

  // 목적지 자동완성 처리 - 메모이제이션
  const handleDestinationInput = useCallback(
    (dateStr, value) => {
      updateDestInput(dateStr, value)
    },
    [updateDestInput],
  )

  // 날짜 범위 계산 - 메모이제이션
  const dates = useMemo(() => {
    return getDatesInRange(form.dateRange?.from, form.dateRange?.to)
  }, [form.dateRange?.from, form.dateRange?.to, getDatesInRange])

  // 폼 유효성 검사 - 메모이제이션
  const isFormValid = useMemo(() => {
    return (
      form.origin &&
      form.dateRange?.from &&
      form.dateRange?.to &&
      Object.keys(destinationsByDate).length > 0
    )
  }, [
    form.origin,
    form.dateRange?.from,
    form.dateRange?.to,
    destinationsByDate,
  ])

  // 목적지 추가 (훅의 함수 래핑)
  const handleAddDestination = useCallback(
    (date, dest) => {
      addDestination(date, dest)
      // 입력창 클리어
      updateDestInput(date, '')
      hideDropdown(date)
    },
    [addDestination, updateDestInput, hideDropdown],
  )

  // 목적지 제거 (훅의 함수 직접 사용)
  const handleRemoveDestination = useCallback(
    (date, dest) => {
      removeDestination(date, dest)
    },
    [removeDestination],
  )

  // 폼 제출
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()

      const formData = {
        origin: form.origin,
        dateRange: form.dateRange,
        destinationsByDate,
      }

      await submitPlan(formData)
    },
    [form, destinationsByDate, submitPlan],
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

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-muted-foreground text-sm font-medium">
                      출발지
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={form.origin}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            origin: e.target.value,
                          }))
                        }
                        placeholder="출발 도시를 입력하세요"
                        className="flex-1"
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
                  </div>

                  <div className="space-y-2">
                    <label className="text-muted-foreground text-sm font-medium">
                      여행 기간
                    </label>
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
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

                              <div className="relative mb-4">
                                <Input
                                  value={destInputs[dateStr] || ''}
                                  onChange={(e) =>
                                    handleDestinationInput(
                                      dateStr,
                                      e.target.value,
                                    )
                                  }
                                  onFocus={() => showDropdown(dateStr)}
                                  onBlur={() => {
                                    setTimeout(() => hideDropdown(dateStr), 150)
                                  }}
                                  placeholder="방문할 장소를 입력하세요"
                                  className="pr-10"
                                />
                                <Plus className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 transform" />

                                <DestinationAutocomplete
                                  suggestions={destSuggestions[dateStr] || []}
                                  isVisible={showDestDropdown[dateStr] || false}
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
            <SubmitButton
              isSubmitting={isSubmitting}
              disabled={isSubmitting || !isFormValid}
              onSubmit={handleSubmit}
            />
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
