import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { CalendarIcon, MapPin } from '@/components/icons'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Loader } from '@googlemaps/js-api-loader'

const themes = [
  { id: 'relax', label: '휴양', icon: '🏖️' },
  { id: 'activity', label: '액티비티', icon: '🏃‍♂️' },
  { id: 'camping', label: '캠핑', icon: '⛺' },
  { id: 'healing', label: '힐링', icon: '🧘‍♀️' },
]

const weatherConditions = [
  { id: 'exclude-rain', label: '강수량 많으면 제외' },
  { id: 'low-uv', label: '자외선 낮은 곳 추천' },
]

export default function PlanForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    destination: '',
    startDate: null,
    endDate: null,
    theme: '',
    weatherConditions: [],
  })
  const [googleApiKey, setGoogleApiKey] = useState(null)
  const inputRef = useRef(null)

  // 백엔드에서 Google API Key 받아오기
  useEffect(() => {
    fetch('/api/config/google-key')
      .then((res) => res.json())
      .then((data) => setGoogleApiKey(data.googleApiKey))
  }, [])

  useEffect(() => {
    if (!googleApiKey || !window) return
    let autocomplete
    const loader = new Loader({
      apiKey: googleApiKey,
      libraries: ['places'],
      language: 'ko',
      region: 'KR',
    })
    loader.load().then(() => {
      if (inputRef.current) {
        // 옵션 없이 Autocomplete 생성
        autocomplete = new window.google.maps.places.Autocomplete(
          inputRef.current,
        )
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace()
          console.log('Google Place:', place) // 콘솔 출력 추가
          const value =
            place.formatted_address ||
            place.name ||
            (place.structured_formatting &&
              place.structured_formatting.main_text) ||
            place.description ||
            ''
          setFormData((prev) => ({
            ...prev,
            destination: value,
          }))
        })
      }
    })
    return () => {
      if (autocomplete) {
        window.google.maps.event.clearInstanceListeners(autocomplete)
      }
    }
  }, [googleApiKey, inputRef.current])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleThemeSelect = (themeId) => {
    setFormData((prev) => ({
      ...prev,
      theme: prev.theme === themeId ? '' : themeId,
    }))
  }

  const handleWeatherConditionToggle = (conditionId) => {
    setFormData((prev) => ({
      ...prev,
      weatherConditions: prev.weatherConditions.includes(conditionId)
        ? prev.weatherConditions.filter((id) => id !== conditionId)
        : [...prev.weatherConditions, conditionId],
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.destination && formData.startDate && formData.endDate) {
      onSubmit(formData)
    }
  }

  const isFormValid =
    formData.destination && formData.startDate && formData.endDate

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 여행지 입력 */}
      <div className="space-y-2">
        <Label htmlFor="destination" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          여행지
        </Label>
        <Input
          id="destination"
          placeholder="여행지를 입력해주세요"
          value={formData.destination}
          onChange={(e) => handleInputChange('destination', e.target.value)}
          className="w-full"
          ref={inputRef}
        />
      </div>

      {/* 날짜 선택 */}
      <div className="space-y-2">
        <Label>📅 여행 기간</Label>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <Label htmlFor="startDate" className="text-sm text-gray-600">
              출발일
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.startDate ? (
                    format(formData.startDate, 'PPP', { locale: ko })
                  ) : (
                    <span>출발일을 선택하세요</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.startDate}
                  onSelect={(date) => handleInputChange('startDate', date)}
                  initialFocus
                  disabled={(date) => {
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    const selectedDate = new Date(date)
                    selectedDate.setHours(0, 0, 0, 0)

                    // 오늘보다 이전 날짜는 선택 불가
                    return selectedDate < today
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex-1">
            <Label htmlFor="endDate" className="text-sm text-gray-600">
              도착일
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.endDate ? (
                    format(formData.endDate, 'PPP', { locale: ko })
                  ) : (
                    <span>도착일을 선택하세요</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.endDate}
                  onSelect={(date) => handleInputChange('endDate', date)}
                  initialFocus
                  disabled={(date) => {
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)

                    // 오늘보다 이전 날짜는 선택 불가
                    if (date < today) return true

                    // 출발일이 선택된 경우, 출발일보다 이전 날짜는 선택 불가
                    if (formData.startDate) {
                      const startDate = new Date(formData.startDate)
                      startDate.setHours(0, 0, 0, 0)
                      const selectedDate = new Date(date)
                      selectedDate.setHours(0, 0, 0, 0)

                      return selectedDate < startDate
                    }

                    return false
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* 테마 선택 */}
      <div className="space-y-2">
        <Label>🎯 테마 선택 (선택사항)</Label>
        <div className="flex flex-wrap gap-2">
          {themes.map((theme) => (
            <Badge
              key={theme.id}
              variant={formData.theme === theme.id ? 'default' : 'outline'}
              className={`cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900 ${
                formData.theme === theme.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800'
              }`}
              onClick={() => handleThemeSelect(theme.id)}
            >
              {theme.icon} {theme.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* 날씨 고려 조건 */}
      <div className="space-y-2">
        <Label>🌀 날씨 고려 조건 (선택사항)</Label>
        <div className="space-y-2">
          {weatherConditions.map((condition) => (
            <div key={condition.id} className="flex items-center space-x-2">
              <Checkbox
                id={condition.id}
                checked={formData.weatherConditions.includes(condition.id)}
                onCheckedChange={() =>
                  handleWeatherConditionToggle(condition.id)
                }
              />
              <Label
                htmlFor={condition.id}
                className="cursor-pointer text-sm font-normal"
              >
                {condition.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* 제출 버튼 */}
      <Button
        type="submit"
        className="w-full bg-blue-600 text-white hover:bg-blue-700"
        disabled={!isFormValid}
      >
        📋 여행 플랜 생성하기
      </Button>
    </form>
  )
}
