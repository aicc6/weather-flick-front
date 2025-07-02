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

// 한국 주요 여행지 목록 (Google API 대안)
const POPULAR_DESTINATIONS = [
  { name: '부산', fullName: '부산광역시', description: '해운대, 광안리 해변' },
  {
    name: '제주도',
    fullName: '제주특별자치도',
    description: '한라산, 성산일출봉',
  },
  { name: '강릉', fullName: '강원도 강릉시', description: '경포대, 안목해변' },
  {
    name: '전주',
    fullName: '전라북도 전주시',
    description: '한옥마을, 전주비빔밥',
  },
  { name: '경주', fullName: '경상북도 경주시', description: '불국사, 첨성대' },
  {
    name: '여수',
    fullName: '전라남도 여수시',
    description: '여수밤바다, 오동도',
  },
  { name: '속초', fullName: '강원도 속초시', description: '설악산, 속초해변' },
  {
    name: '순천',
    fullName: '전라남도 순천시',
    description: '순천만, 낙안읍성',
  },
  {
    name: '안동',
    fullName: '경상북도 안동시',
    description: '하회마을, 안동찜닭',
  },
  {
    name: '담양',
    fullName: '전라남도 담양군',
    description: '죽녹원, 메타세쿼이아길',
  },
  { name: '서울', fullName: '서울특별시', description: '경복궁, 명동, 홍대' },
  {
    name: '인천',
    fullName: '인천광역시',
    description: '차이나타운, 을왕리해변',
  },
  { name: '대구', fullName: '대구광역시', description: '팔공산, 동성로' },
  { name: '광주', fullName: '광주광역시', description: '무등산, 양림동' },
  {
    name: '대전',
    fullName: '대전광역시',
    description: '유성온천, 대전엑스포과학공원',
  },
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
  const [isLoadingApiKey, setIsLoadingApiKey] = useState(true)
  const [isGoogleApiLoaded, setIsGoogleApiLoaded] = useState(false)
  const [apiKeyError, setApiKeyError] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [useGoogleApi, setUseGoogleApi] = useState(true)
  const [startDateOpen, setStartDateOpen] = useState(false)
  const [endDateOpen, setEndDateOpen] = useState(false)
  const inputRef = useRef(null)
  const autocompleteRef = useRef(null)

  // 백엔드에서 Google API Key 받아오기
  useEffect(() => {
    const fetchGoogleApiKey = async () => {
      try {
        console.log('Fetching Google API key from backend...')
        const response = await fetch('/api/config/google-key')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        console.log('Google API key received:', data.googleApiKey)

        // Google Places API 사용 여부 선택
        const USE_GOOGLE_PLACES_API = true // Google Places API 활성화!

        if (USE_GOOGLE_PLACES_API) {
          // Google Places API 사용 시
          if (
            !data.googleApiKey ||
            data.googleApiKey === 'your-google-api-key-here' ||
            data.googleApiKey.includes('#') ||
            data.googleApiKey.length < 20
          ) {
            throw new Error('Google API key not properly configured in backend')
          }
          setGoogleApiKey(data.googleApiKey)
          console.log('Google Places API 활성화 - API 키 설정 완료')
        } else {
          // 로컬 자동완성만 사용
          console.log('로컬 자동완성 모드 사용 - Google Places API 비활성화')
          setApiKeyError(
            'Google API 키 문제로 로컬 자동완성 사용 중 (InvalidKeyMapError)',
          )
        }
      } catch (error) {
        console.error('Error fetching Google API key:', error)
        setApiKeyError(error.message)
        console.log('Falling back to local autocomplete mode')
      } finally {
        setIsLoadingApiKey(false)
      }
    }

    fetchGoogleApiKey()
  }, [])

  // Google Maps API 에러 감지 및 처리
  useEffect(() => {
    // 전역 Google Maps 에러 핸들러
    window.gm_authFailure = () => {
      console.error(
        'Google Maps authentication failed - switching to local autocomplete',
      )
      setApiKeyError('Google Maps 인증 실패 - 로컬 자동완성으로 전환됨')
      setIsGoogleApiLoaded(false)
      setGoogleApiKey(null) // Google API 키를 null로 설정하여 더 이상 로드하지 않음
    }

    // InvalidKeyMapError 등 기타 에러 감지
    const originalConsoleError = console.error
    console.error = (...args) => {
      const errorMessage = args.join(' ')
      if (
        errorMessage.includes('InvalidKeyMapError') ||
        errorMessage.includes('Google Maps JavaScript API error') ||
        errorMessage.includes('Google Maps API error')
      ) {
        console.log(
          'Google Maps API error detected - permanently switching to local autocomplete',
        )
        setApiKeyError('Google Maps API 키 오류 - 로컬 자동완성으로 전환됨')
        setIsGoogleApiLoaded(false)
        setGoogleApiKey(null) // Google API 키를 null로 설정

        // 향후 Google API 로드 시도를 방지하기 위해 USE_GOOGLE_PLACES_API를 false로 변경
        // 이는 런타임에서만 적용되며 코드는 변경되지 않음
      }
      originalConsoleError.apply(console, args)
    }

    return () => {
      delete window.gm_authFailure
      console.error = originalConsoleError
    }
  }, [])

  // Google Places API 로드 및 자동완성 설정
  useEffect(() => {
    if (!googleApiKey || !inputRef.current || isGoogleApiLoaded || apiKeyError)
      return

    console.log(
      'Loading Google Places API with key:',
      googleApiKey.substring(0, 10) + '...',
    )

    // API 키 길이 재검증
    if (googleApiKey.length < 20) {
      console.error(
        'Google API key too short - switching to local autocomplete',
      )
      setApiKeyError('Google API 키가 유효하지 않음 - 로컬 자동완성 사용')
      return
    }

    const loader = new Loader({
      apiKey: googleApiKey,
      libraries: ['places'],
      language: 'ko',
      region: 'KR',
    })

    loader
      .load()
      .then(() => {
        console.log('Google Places API loaded successfully')
        if (inputRef.current && window.google?.maps?.places) {
          try {
            // 자동완성 옵션 설정
            const options = {
              // types 제거 - 모든 타입의 장소 검색 허용 (지역, 관광지, 건물 등)
              componentRestrictions: { country: 'kr' }, // 한국 지역 우선
              fields: [
                'place_id',
                'name',
                'formatted_address',
                'geometry',
                'types',
                'photos',
              ],
            }

            autocompleteRef.current =
              new window.google.maps.places.Autocomplete(
                inputRef.current,
                options,
              )

            // 자동완성 드롭다운 스타일링 개선
            setTimeout(() => {
              const pacContainer = document.querySelector('.pac-container')
              if (pacContainer) {
                pacContainer.style.zIndex = '9999'
                pacContainer.style.fontSize = '14px'
                pacContainer.style.fontFamily = 'inherit'
              }
            }, 100)

            // 장소 선택 시 이벤트 리스너
            autocompleteRef.current.addListener('place_changed', () => {
              const place = autocompleteRef.current.getPlace()
              console.log('Place selected from Google:', place)

              if (place && (place.geometry || place.formatted_address)) {
                // 선택된 장소 정보를 state에 저장
                const destinationValue =
                  place.formatted_address || place.name || ''

                setFormData((prev) => ({
                  ...prev,
                  destination: destinationValue,
                }))

                console.log('Selected place details:', {
                  name: place.name,
                  formatted_address: place.formatted_address,
                  place_id: place.place_id,
                  types: place.types,
                })

                setShowSuggestions(false)
              }
            })

            setIsGoogleApiLoaded(true)
            console.log('Google Places Autocomplete initialized successfully')
          } catch (initError) {
            console.error(
              'Error initializing Google Places Autocomplete:',
              initError,
            )
            setApiKeyError('Google Places 초기화 실패 - 로컬 자동완성 사용')
            setGoogleApiKey(null)
          }
        } else {
          console.error('Google Maps Places library not available')
          setApiKeyError(
            'Google Maps Places library not loaded - 로컬 자동완성 사용',
          )
          setGoogleApiKey(null)
        }
      })
      .catch((error) => {
        console.error('Error loading Google Maps API:', error)
        if (error.message.includes('ApiNotActivatedMapError')) {
          setApiKeyError(
            'Google Places API가 활성화되지 않음 - 로컬 자동완성 사용',
          )
        } else if (error.message.includes('InvalidKeyMapError')) {
          setApiKeyError('Google API 키 오류 - 로컬 자동완성 사용')
        } else {
          setApiKeyError(`Google Maps API 로드 실패 - 로컬 자동완성 사용`)
        }
        setGoogleApiKey(null) // Google API 키를 null로 설정하여 재시도 방지
      })

    // 정리 함수
    return () => {
      if (autocompleteRef.current && window.google) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [googleApiKey, isGoogleApiLoaded, apiKeyError])

  // CSS 스타일을 동적으로 추가하여 Google Places 자동완성 스타일링
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      .pac-container {
        background-color: white !important;
        border: 1px solid #d1d5db !important;
        border-radius: 0.5rem !important;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
        font-family: inherit !important;
        font-size: 14px !important;
        z-index: 9999 !important;
        margin-top: 4px !important;
      }
      .pac-item {
        padding: 8px 12px !important;
        border-bottom: 1px solid #f3f4f6 !important;
        cursor: pointer !important;
      }
      .pac-item:hover {
        background-color: #f9fafb !important;
      }
      .pac-item-selected {
        background-color: #eff6ff !important;
      }
      .pac-matched {
        font-weight: 600 !important;
      }
      .pac-item-query {
        color: #1f2937 !important;
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  // 로컬 자동완성 기능 (Google API 대안)
  const handleLocalAutocomplete = (query) => {
    console.log('Triggering local autocomplete for:', query)
    if (!query.trim()) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const filtered = POPULAR_DESTINATIONS.filter(
      (dest) =>
        dest.name.toLowerCase().includes(query.toLowerCase()) ||
        dest.fullName.toLowerCase().includes(query.toLowerCase()) ||
        dest.description.toLowerCase().includes(query.toLowerCase()),
    )

    console.log('Local autocomplete results:', filtered.length)
    setSuggestions(filtered.slice(0, 5)) // 최대 5개 결과
    setShowSuggestions(true)
  }

  // 입력 변경 처리
  const handleDestinationChange = (value) => {
    console.log('Destination input changed:', value)
    setFormData((prev) => ({ ...prev, destination: value }))

    // Google API가 없거나 실패한 경우 항상 로컬 자동완성 사용
    if (!isGoogleApiLoaded || apiKeyError) {
      console.log('Using local autocomplete (Google API not available)')
      handleLocalAutocomplete(value)
    }
  }

  // 제안 항목 선택
  const handleSuggestionSelect = (suggestion) => {
    console.log('Local suggestion selected:', suggestion)
    setFormData((prev) => ({ ...prev, destination: suggestion.fullName }))
    setShowSuggestions(false)
    setSuggestions([])
  }

  // 외부 클릭 시 제안 목록 숨기기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (field, value) => {
    if (field === 'destination') {
      handleDestinationChange(value)
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }))

      // 날짜 선택 시 해당 달력 닫기
      if (field === 'startDate') {
        setStartDateOpen(false)
      } else if (field === 'endDate') {
        setEndDateOpen(false)
      }
    }
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
          {isLoadingApiKey && (
            <span className="text-xs text-blue-600">
              🔄 자동완성 로딩 중...
            </span>
          )}
          {!isLoadingApiKey && isGoogleApiLoaded && (
            <span className="text-xs text-green-600">
              ✅ Google Places 활성화
            </span>
          )}
          {apiKeyError && !isLoadingApiKey && (
            <span className="text-xs text-orange-600">🔍 로컬 검색 모드</span>
          )}
        </Label>

        <div className="relative">
          <Input
            id="destination"
            placeholder="여행지를 입력해주세요 (예: 부산, 제주도, 강릉, 경복궁)"
            value={formData.destination}
            onChange={(e) => handleInputChange('destination', e.target.value)}
            className="w-full"
            ref={inputRef}
            disabled={isLoadingApiKey}
            onFocus={() => {
              console.log('Input focused manually')
              if (!isGoogleApiLoaded && formData.destination) {
                handleLocalAutocomplete(formData.destination)
              }
            }}
          />

          {/* 로컬 자동완성 목록 */}
          {showSuggestions &&
            suggestions.length > 0 &&
            (!isGoogleApiLoaded || apiKeyError) && (
              <div className="absolute top-full right-0 left-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="cursor-pointer border-b border-gray-100 p-3 last:border-b-0 hover:bg-blue-50"
                    onClick={() => handleSuggestionSelect(suggestion)}
                  >
                    <div className="font-medium text-gray-900">
                      {suggestion.fullName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {suggestion.description}
                    </div>
                  </div>
                ))}
              </div>
            )}

          {/* 자동완성 상태 표시 */}
          {showSuggestions && isGoogleApiLoaded && (
            <div className="mt-1 text-xs text-blue-600">
              💡 입력하시면 Google Places 자동완성 목록이 아래에 나타납니다
            </div>
          )}

          {showSuggestions &&
            suggestions.length > 0 &&
            (!isGoogleApiLoaded || apiKeyError) && (
              <div className="mt-1 text-xs text-orange-600">
                💡 인기 여행지에서 검색 중입니다
              </div>
            )}
        </div>

        {/* API 키 오류 표시 */}
        {apiKeyError && (
          <div className="mt-2 rounded-md border border-orange-200 bg-orange-50 p-3">
            <p className="text-sm text-orange-700">
              <strong>Google Places API 사용 불가:</strong> {apiKeyError}
            </p>
            <p className="mt-1 text-xs text-orange-600">
              💡 현재 한국 주요 여행지 목록에서 검색합니다. Google API 키를
              설정하면 더 정확한 자동완성을 이용할 수 있습니다.
            </p>
          </div>
        )}

        <div className="space-y-1 text-xs text-gray-500">
          <p>💡 지역명이나 관광지명을 입력하면 자동완성 목록이 나타납니다</p>
          <p>
            🔍 예시: &quot;부산 해운대&quot;, &quot;제주도&quot;,
            &quot;경복궁&quot;, &quot;강릉 바다&quot; 등
          </p>
          {(!isGoogleApiLoaded || apiKeyError) && (
            <p className="text-orange-600">
              📍 현재 {POPULAR_DESTINATIONS.length}개 인기 여행지에서 검색합니다
            </p>
          )}
        </div>
      </div>

      {/* 날짜 선택 */}
      <div className="space-y-2">
        <Label>📅 여행 기간</Label>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <Label htmlFor="startDate" className="text-sm text-gray-600">
              출발일
            </Label>
            <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
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
            <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
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
