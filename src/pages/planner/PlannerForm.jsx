import { useState, useRef } from 'react'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import PlanCard from '@/components/PlanCard'
import { fetchPlanRecommendation } from '@/services/api'

export default function PlannerForm() {
  const [form, setForm] = useState({
    origin: '',
    destination: '',
    startDate: null,
    endDate: null,
  })
  const [ui, setUI] = useState({
    startDateOpen: false,
    endDateOpen: false,
    isLocating: false,
    destSuggestions: [],
    showDestDropdown: false,
    error: '',
  })
  const [plans, setPlans] = useState([])
  const debounceTimer = useRef(null)

  // 출발지: 현재 위치로 자동 입력
  const handleAutoLocation = async () => {
    setUI((u) => ({ ...u, isLocating: true }))
    if (!navigator.geolocation) {
      alert('이 브라우저는 위치 정보를 지원하지 않습니다.')
      setUI((u) => ({ ...u, isLocating: false }))
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        try {
          const res = await fetch(
            `/api/location/reverse-geocode?lat=${lat}&lng=${lng}`,
          )
          const data = await res.json()
          if (data.address) {
            setForm((f) => ({ ...f, origin: data.address }))
          } else {
            alert('주소를 찾을 수 없습니다.')
          }
        } catch (e) {
          alert('위치 정보를 가져오지 못했습니다.')
        }
        setUI((u) => ({ ...u, isLocating: false }))
      },
      () => {
        alert('위치 권한이 거부되었습니다.')
        setUI((u) => ({ ...u, isLocating: false }))
      },
    )
  }

  // 목적지 자동완성 (0.5초 디바운스)
  const handleDestinationInput = (value) => {
    setForm((f) => ({ ...f, destination: value }))
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }
    if (value.length > 1) {
      debounceTimer.current = setTimeout(async () => {
        const res = await fetch(
          `/api/destinations/search?query=${encodeURIComponent(value)}`,
        )
        const suggestions = await res.json()
        setUI((u) => ({
          ...u,
          destSuggestions: suggestions,
          showDestDropdown: true,
        }))
      }, 500)
    } else {
      setUI((u) => ({ ...u, destSuggestions: [], showDestDropdown: false }))
    }
  }

  // 날짜를 yyyy-mm-dd (로컬 타임존 기준)로 변환
  function formatDateLocal(date) {
    return date
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      : ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.origin || !form.destination || !form.startDate || !form.endDate) {
      setUI((u) => ({ ...u, error: '모든 필드를 입력하세요.' }))
      return
    }
    if (form.endDate < form.startDate) {
      setUI((u) => ({ ...u, error: '도착일이 출발일보다 빠를 수 없습니다.' }))
      return
    }
    setUI((u) => ({ ...u, error: '' }))
    try {
      const data = await fetchPlanRecommendation({
        origin: form.origin,
        destination: form.destination,
        startDate: formatDateLocal(form.startDate),
        endDate: formatDateLocal(form.endDate),
      })
      setPlans(data.plans)
    } catch (err) {
      setUI((u) => ({ ...u, error: '추천 일정 요청 실패' }))
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 space-y-4 rounded-xl bg-white p-4 shadow-lg sm:p-6 dark:bg-zinc-900"
    >
      {/* 출발지 */}
      <div>
        <label className="mb-1 block text-sm font-medium">출발지</label>
        <div className="flex gap-2">
          <Input
            placeholder="현재 위치 or 도시명"
            value={form.origin}
            onChange={(e) => setForm((f) => ({ ...f, origin: e.target.value }))}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleAutoLocation}
            disabled={ui.isLocating}
          >
            {ui.isLocating ? '위치 확인중...' : '현재 위치로'}
          </Button>
        </div>
      </div>
      {/* 목적지 */}
      <div className="relative">
        <label className="mb-1 block text-sm font-medium">목적지</label>
        <Input
          placeholder="여행지 검색 (예: 제주도, 부산...)"
          value={form.destination}
          onChange={(e) => handleDestinationInput(e.target.value)}
          onFocus={() => {
            if (ui.destSuggestions.length > 0)
              setUI((u) => ({ ...u, showDestDropdown: true }))
          }}
          onBlur={() =>
            setTimeout(
              () => setUI((u) => ({ ...u, showDestDropdown: false })),
              150,
            )
          }
        />
        {ui.showDestDropdown && ui.destSuggestions.length > 0 && (
          <div className="absolute right-0 left-0 z-10 mt-1 max-h-60 overflow-y-auto rounded-lg border bg-white shadow-lg dark:bg-zinc-800 dark:text-white">
            {ui.destSuggestions.map((s, i) => (
              <div
                key={i}
                className="cursor-pointer px-4 py-2 hover:bg-blue-50 dark:hover:bg-zinc-700"
                onMouseDown={() => {
                  setForm((f) => ({ ...f, destination: s }))
                  setUI((u) => ({ ...u, showDestDropdown: false }))
                }}
              >
                {s}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* 날짜 */}
      <div className="flex gap-2">
        {/* 출발일 Date Picker */}
        <Popover
          open={ui.startDateOpen}
          onOpenChange={(open) => setUI((u) => ({ ...u, startDateOpen: open }))}
          className="flex-1"
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="data-[empty=true]:text-muted-foreground w-full flex-1 justify-between rounded-md border font-normal"
              data-empty={!form.startDate}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {form.startDate
                ? form.startDate.toLocaleDateString()
                : '출발일 선택'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="start">
            <Calendar
              mode="single"
              selected={form.startDate}
              captionLayout="dropdown"
              onSelect={(date) => setForm((f) => ({ ...f, startDate: date }))}
              className="bg-popover w-[300px] rounded-md border p-3 shadow-md"
            />
          </PopoverContent>
        </Popover>
        {/* 도착일 Date Picker */}
        <Popover
          open={ui.endDateOpen}
          onOpenChange={(open) => setUI((u) => ({ ...u, endDateOpen: open }))}
          className="flex-1"
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="data-[empty=true]:text-muted-foreground w-full flex-1 justify-between rounded-md border font-normal"
              data-empty={!form.endDate}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {form.endDate ? form.endDate.toLocaleDateString() : '도착일 선택'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="start">
            <Calendar
              mode="single"
              selected={form.endDate}
              captionLayout="dropdown"
              onSelect={(date) => setForm((f) => ({ ...f, endDate: date }))}
              className="bg-popover w-[300px] rounded-md border p-3 shadow-md"
            />
          </PopoverContent>
        </Popover>
      </div>
      {ui.error && <div className="text-red-500">{ui.error}</div>}
      <Button type="submit" className="w-full">
        플랜 추천받기
      </Button>
      <div className="mt-4 space-y-2">
        {plans.map((plan, idx) => (
          <PlanCard key={idx} plan={plan} />
        ))}
      </div>
    </form>
  )
}
