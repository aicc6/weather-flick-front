import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import { useState } from 'react'

export default function PlannerForm({
  formData,
  setFormData,
  setWeatherData,
  setPlanResults,
  setIsLoading,
}) {
  const [startDateOpen, setStartDateOpen] = useState(false)
  const [endDateOpen, setEndDateOpen] = useState(false)
  const [destSuggestions, setDestSuggestions] = useState([])
  const [showDestDropdown, setShowDestDropdown] = useState(false)
  const [isLocating, setIsLocating] = useState(false)

  // 출발지: 현재 위치로 자동 입력
  const handleAutoLocation = async () => {
    setIsLocating(true)
    if (!navigator.geolocation) {
      alert('이 브라우저는 위치 정보를 지원하지 않습니다.')
      setIsLocating(false)
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
            setFormData((f) => ({ ...f, origin: data.address }))
          } else {
            alert('주소를 찾을 수 없습니다.')
          }
        } catch (e) {
          alert('위치 정보를 가져오지 못했습니다.')
        }
        setIsLocating(false)
      },
      () => {
        alert('위치 권한이 거부되었습니다.')
        setIsLocating(false)
      },
    )
  }
  console.log('자동완성 후보:', destSuggestions)

  // 목적지 자동완성
  const handleDestinationInput = async (value) => {
    setFormData((f) => ({ ...f, destination: value }))
    if (value.length > 1) {
      const res = await fetch(
        `/api/destinations/search?query=${encodeURIComponent(value)}`,
      )
      const suggestions = await res.json()
      setDestSuggestions(suggestions)
      setShowDestDropdown(true)
    } else {
      setDestSuggestions([])
      setShowDestDropdown(false)
    }
  }

  return (
    <form
      className="mb-6 space-y-4 rounded-xl bg-white p-4 shadow-lg sm:p-6 dark:bg-zinc-900"
      onSubmit={async (e) => {
        e.preventDefault()
        setIsLoading(true)
        // TODO: 날씨 API, 플랜 추천 API 연동
        setIsLoading(false)
      }}
    >
      {/* 출발지 */}
      <div>
        <label className="mb-1 block text-sm font-medium">출발지</label>
        <div className="flex gap-2">
          <Input
            placeholder="현재 위치 or 도시명"
            value={formData.origin}
            onChange={(e) =>
              setFormData((f) => ({ ...f, origin: e.target.value }))
            }
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleAutoLocation}
            disabled={isLocating}
          >
            {isLocating ? '위치 확인중...' : '현재 위치로'}
          </Button>
        </div>
      </div>
      {/* 목적지 */}
      <div className="relative">
        <label className="mb-1 block text-sm font-medium">목적지</label>
        <Input
          placeholder="여행지 검색 (예: 제주도, 부산...)"
          value={formData.destination}
          onChange={(e) => handleDestinationInput(e.target.value)}
          onFocus={() => {
            if (destSuggestions.length > 0) setShowDestDropdown(true)
          }}
          onBlur={() => setTimeout(() => setShowDestDropdown(false), 150)}
        />
        {/* 자동완성 드롭다운 */}
        {showDestDropdown && destSuggestions.length > 0 && (
          <div className="absolute right-0 left-0 z-10 mt-1 max-h-60 overflow-y-auto rounded-lg border bg-white shadow-lg dark:bg-zinc-800 dark:text-white">
            {destSuggestions.map((s, i) => (
              <div
                key={i}
                className="cursor-pointer px-4 py-2 hover:bg-blue-50 dark:hover:bg-zinc-700"
                onMouseDown={() => {
                  setFormData((f) => ({ ...f, destination: s }))
                  setShowDestDropdown(false)
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
        <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full">
              {formData.startDate
                ? formData.startDate.toLocaleDateString()
                : '출발일'}
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <Calendar
              mode="single"
              selected={formData.startDate}
              onSelect={(date) => {
                setFormData((f) => ({ ...f, startDate: date }))
                setStartDateOpen(false)
              }}
            />
          </PopoverContent>
        </Popover>
        <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full">
              {formData.endDate
                ? formData.endDate.toLocaleDateString()
                : '도착일'}
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <Calendar
              mode="single"
              selected={formData.endDate}
              onSelect={(date) => {
                setFormData((f) => ({ ...f, endDate: date }))
                setEndDateOpen(false)
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      {/* 테마/필터 */}
      <div>
        <label className="mb-1 block text-sm font-medium">여행 테마</label>
        <div className="flex flex-wrap gap-2">
          {['힐링', '액티비티', '인스타감성', '가족'].map((theme) => (
            <Button
              key={theme}
              variant={formData.theme === theme ? 'default' : 'outline'}
              onClick={(e) => {
                e.preventDefault()
                setFormData((f) => ({ ...f, theme }))
              }}
            >
              {theme}
            </Button>
          ))}
        </div>
      </div>
      {/* 필터 */}
      <div>
        <label className="mb-1 block text-sm font-medium">날씨 조건</label>
        <div className="flex flex-wrap gap-2">
          {['비 안 오는 날', '선선한 날', '자외선 낮은 날'].map((filter) => (
            <Button
              key={filter}
              variant={
                formData.filters.includes(filter) ? 'default' : 'outline'
              }
              onClick={(e) => {
                e.preventDefault()
                setFormData((f) => ({
                  ...f,
                  filters: formData.filters.includes(filter)
                    ? formData.filters.filter((fil) => fil !== filter)
                    : [...formData.filters, filter],
                }))
              }}
            >
              {filter}
            </Button>
          ))}
        </div>
      </div>
      <Button type="submit" className="mt-2 w-full">
        플랜 추천받기
      </Button>
    </form>
  )
}
