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
        <Input
          placeholder="현재 위치 or 도시명"
          value={formData.origin}
          onChange={(e) =>
            setFormData((f) => ({ ...f, origin: e.target.value }))
          }
        />
      </div>
      {/* 목적지 */}
      <div>
        <label className="mb-1 block text-sm font-medium">목적지</label>
        <Input
          placeholder="여행지 검색 (예: 제주도, 부산...)"
          value={formData.destination}
          onChange={(e) =>
            setFormData((f) => ({ ...f, destination: e.target.value }))
          }
        />
        {/* TODO: 자동완성, 추천 리스트 등 */}
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
