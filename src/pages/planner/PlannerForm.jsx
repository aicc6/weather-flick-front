'use client'

import { useState, useRef, useCallback, useMemo } from 'react'
import {
  CalendarIcon,
  ChevronDown,
  MapPin,
  Sparkles,
  X,
  Plus,
} from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'

export default function PlannerForm() {
  const [form, setForm] = useState({
    origin: '',
    dateRange: { from: null, to: null },
    destinationsByDate: {},
  })

  const [ui, setUI] = useState({
    isLocating: false,
    destInputs: {},
    destSuggestions: {},
    showDestDropdown: {},
    calendarOpen: false,
    activeDateInput: '',
    isSubmitting: false,
  })

  const debounceTimers = useRef({})
  const [plans, setPlans] = useState([])

  // 현재 위치 자동 감지
  const handleAutoLocation = useCallback(async () => {
    setUI((prev) => ({ ...prev, isLocating: true }))

    if (!navigator.geolocation) {
      toast.error(
        '위치 서비스 미지원: 이 브라우저는 위치 정보를 지원하지 않습니다.',
      )
      setUI((prev) => ({ ...prev, isLocating: false }))
      return
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000, // 5분 캐시
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords
        try {
          const res = await fetch(
            `/api/location/reverse-geocode?lat=${lat}&lng=${lng}`,
          )
          const data = await res.json()

          if (data.address) {
            setForm((prev) => ({ ...prev, origin: data.address }))
            toast.success(`위치 확인 완료: 현재 위치: ${data.address}`)
          } else {
            throw new Error('주소를 찾을 수 없습니다.')
          }
        } catch (error) {
          toast.error('위치 확인 실패: 위치 정보를 가져오지 못했습니다.')
        }
        setUI((prev) => ({ ...prev, isLocating: false }))
      },
      (error) => {
        let message = '위치 정보를 가져올 수 없습니다.'
        if (error.code === error.PERMISSION_DENIED) {
          message = '위치 접근 권한이 거부되었습니다.'
        } else if (error.code === error.TIMEOUT) {
          message = '위치 확인 시간이 초과되었습니다.'
        }

        toast.error(`위치 확인 실패: ${message}`)
        setUI((prev) => ({ ...prev, isLocating: false }))
      },
      options,
    )
  }, [])

  // 목적지 자동완성 처리
  const handleDestinationInput = useCallback(async (dateStr, value) => {
    setUI((prev) => ({
      ...prev,
      destInputs: { ...prev.destInputs, [dateStr]: value },
      activeDateInput: dateStr,
    }))

    // 기존 타이머 클리어
    if (debounceTimers.current[dateStr]) {
      clearTimeout(debounceTimers.current[dateStr])
    }

    if (value.length > 1) {
      debounceTimers.current[dateStr] = setTimeout(async () => {
        try {
          const res = await fetch(
            `/api/destinations/search?query=${encodeURIComponent(value)}`,
          )
          if (!res.ok) throw new Error('검색 실패')

          const suggestions = await res.json()
          setUI((prev) => ({
            ...prev,
            destSuggestions: {
              ...prev.destSuggestions,
              [dateStr]: suggestions,
            },
            showDestDropdown: { ...prev.showDestDropdown, [dateStr]: true },
          }))
        } catch (error) {
          console.error('자동완성 실패:', error)
          toast.error('검색 실패: 목적지 검색 중 오류가 발생했습니다.')
        }
      }, 300)
    } else {
      setUI((prev) => ({
        ...prev,
        destSuggestions: { ...prev.destSuggestions, [dateStr]: [] },
        showDestDropdown: { ...prev.showDestDropdown, [dateStr]: false },
      }))
    }
  }, [])

  // 날짜 포맷팅
  const formatDate = useCallback((date) => format(date, 'yyyy-MM-dd'), [])

  // 날짜 범위 계산
  const dates = useMemo(() => {
    if (!form.dateRange?.from || !form.dateRange?.to) return []

    const result = []
    const current = new Date(form.dateRange.from)
    const end = new Date(form.dateRange.to)

    while (current <= end) {
      result.push(formatDate(current))
      current.setDate(current.getDate() + 1)
    }
    return result
  }, [form.dateRange, formatDate])

  // 목적지 추가
  const addDestination = useCallback((date, dest) => {
    setForm((prev) => ({
      ...prev,
      destinationsByDate: {
        ...prev.destinationsByDate,
        [date]: [...new Set([...(prev.destinationsByDate[date] || []), dest])],
      },
    }))
    setUI((prev) => ({
      ...prev,
      destInputs: { ...prev.destInputs, [date]: '' },
      showDestDropdown: { ...prev.showDestDropdown, [date]: false },
    }))
  }, [])

  // 목적지 제거
  const removeDestination = useCallback((date, dest) => {
    setForm((prev) => ({
      ...prev,
      destinationsByDate: {
        ...prev.destinationsByDate,
        [date]: prev.destinationsByDate[date]?.filter((d) => d !== dest) || [],
      },
    }))
  }, [])

  // 폼 제출
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()

      const { origin, dateRange, destinationsByDate } = form

      if (!origin.trim()) {
        toast.error('출발지 입력 필요: 출발지를 입력해주세요.')
        return
      }

      if (!dateRange?.from || !dateRange?.to) {
        toast.error('여행 기간 선택 필요: 여행 기간을 선택해주세요.')
        return
      }

      setUI((prev) => ({ ...prev, isSubmitting: true }))

      try {
        const response = await fetch('/api/plan-recommendation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            origin,
            startDate: formatDate(dateRange.from),
            endDate: formatDate(dateRange.to),
            destinationsByDate,
          }),
        })

        if (!response.ok) throw new Error('플랜 생성 실패')

        const data = await response.json()
        setPlans(data.plans)

        toast.success('플랜 생성 완료! ✨ 맞춤형 여행 플랜이 준비되었습니다.')
      } catch (error) {
        toast.error('플랜 생성 실패: 여행 플랜 생성 중 오류가 발생했습니다.')
      } finally {
        setUI((prev) => ({ ...prev, isSubmitting: false }))
      }
    },
    [form, formatDate],
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-8 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <motion.div
        className="mx-auto max-w-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* 헤더 */}
        <div className="mb-12 text-center">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <h1 className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
              🌤️ AI 여행 플래너
            </h1>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              날씨와 개인 취향을 고려한 똑똑한 여행 일정을 AI가 추천해드려요
            </p>
          </motion.div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
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
                        disabled={ui.isLocating}
                        className="shrink-0 bg-transparent"
                      >
                        {ui.isLocating ? (
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
                    <Popover
                      open={ui.calendarOpen}
                      onOpenChange={(open) =>
                        setUI((prev) => ({ ...prev, calendarOpen: open }))
                      }
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
                          onSelect={(range) =>
                            setForm((prev) => ({
                              ...prev,
                              dateRange: range || { from: null, to: null },
                            }))
                          }
                          numberOfMonths={2}
                          locale={ko}
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
                                  value={ui.destInputs[dateStr] || ''}
                                  onChange={(e) =>
                                    handleDestinationInput(
                                      dateStr,
                                      e.target.value,
                                    )
                                  }
                                  onFocus={() => {
                                    if (
                                      ui.destSuggestions[dateStr]?.length > 0
                                    ) {
                                      setUI((prev) => ({
                                        ...prev,
                                        showDestDropdown: {
                                          ...prev.showDestDropdown,
                                          [dateStr]: true,
                                        },
                                        activeDateInput: dateStr,
                                      }))
                                    }
                                  }}
                                  onBlur={() => {
                                    setTimeout(() => {
                                      setUI((prev) => ({
                                        ...prev,
                                        showDestDropdown: {
                                          ...prev.showDestDropdown,
                                          [dateStr]: false,
                                        },
                                      }))
                                    }, 150)
                                  }}
                                  placeholder="방문할 장소를 입력하세요"
                                  className="pr-10"
                                />
                                <Plus className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 transform" />

                                <AnimatePresence>
                                  {ui.showDestDropdown[dateStr] &&
                                    ui.destSuggestions[dateStr]?.length > 0 && (
                                      <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
                                      >
                                        {ui.destSuggestions[dateStr].map(
                                          (suggestion, i) => (
                                            <button
                                              key={i}
                                              type="button"
                                              className="w-full border-b border-gray-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                                              onMouseDown={() =>
                                                addDestination(
                                                  dateStr,
                                                  suggestion,
                                                )
                                              }
                                            >
                                              <div className="flex items-center gap-2">
                                                <MapPin className="text-muted-foreground h-4 w-4" />
                                                <span className="text-sm">
                                                  {suggestion}
                                                </span>
                                              </div>
                                            </button>
                                          ),
                                        )}
                                      </motion.div>
                                    )}
                                </AnimatePresence>
                              </div>

                              <AnimatePresence>
                                {form.destinationsByDate[dateStr]?.length >
                                  0 && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="flex flex-wrap gap-2"
                                  >
                                    {form.destinationsByDate[dateStr].map(
                                      (dest, idx) => (
                                        <motion.div
                                          key={idx}
                                          initial={{ opacity: 0, scale: 0.8 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          exit={{ opacity: 0, scale: 0.8 }}
                                          transition={{ duration: 0.2 }}
                                        >
                                          <Badge
                                            variant="secondary"
                                            className="flex items-center gap-1 bg-blue-100 px-3 py-1 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                          >
                                            <span>{dest}</span>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                removeDestination(dateStr, dest)
                                              }
                                              className="ml-1 transition-colors hover:text-red-500"
                                            >
                                              <X className="h-3 w-3" />
                                            </button>
                                          </Badge>
                                        </motion.div>
                                      ),
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Button
              type="submit"
              disabled={
                ui.isSubmitting ||
                !form.origin ||
                !form.dateRange?.from ||
                !form.dateRange?.to
              }
              className="h-14 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-lg font-semibold shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl"
            >
              {ui.isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>AI가 플랜을 생성하고 있어요...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  <span>맞춤 여행 플랜 생성하기</span>
                </div>
              )}
            </Button>
          </motion.div>
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
}
