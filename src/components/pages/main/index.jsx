import { useState } from 'react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
  Search,
  MapPin,
  Calendar as CalendarIcon,
  Palette,
  ChevronRight,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
} from 'lucide-react'
import { Chatbot } from '@/components/common/chatbot'

/**
 * URL: '/'
 */
export function MainPage() {
  const [searchData, setSearchData] = useState({
    departure: '',
    date: null,
    theme: '',
  })

  // 추천 여행지 데이터
  const recommendedDestinations = [
    {
      id: 1,
      name: '제주도',
      weather: '맑음',
      temperature: 26,
      icon: '⛱',
      description: '한라산과 해변의 완벽한 조화',
    },
    {
      id: 2,
      name: '가평',
      weather: '흐림',
      temperature: 24,
      icon: '⛺',
      description: '자연 속 힐링 캠핑',
    },
    {
      id: 3,
      name: '해운대',
      weather: '맑음',
      temperature: 28,
      icon: '🌊',
      description: '아름다운 해변과 맛있는 해산물',
    },
    {
      id: 4,
      name: '남이섬',
      weather: '비',
      temperature: 22,
      icon: '🏕',
      description: '로맨틱한 섬 여행',
    },
    {
      id: 5,
      name: '부산',
      weather: '맑음',
      temperature: 27,
      icon: '🏖',
      description: '도시와 바다의 만남',
    },
  ]

  // 날씨 아이콘 컴포넌트
  const WeatherIcon = ({ weather, temperature }) => {
    const getWeatherIcon = (weather) => {
      switch (weather) {
        case '맑음':
          return <Sun className="h-4 w-4 text-yellow-500" />
        case '흐림':
          return <Cloud className="h-4 w-4 text-gray-500" />
        case '비':
          return <CloudRain className="h-4 w-4 text-blue-500" />
        case '눈':
          return <CloudSnow className="h-4 w-4 text-blue-300" />
        default:
          return <Sun className="h-4 w-4 text-yellow-500" />
      }
    }

    return (
      <div className="flex items-center gap-1 text-sm">
        {getWeatherIcon(weather)}
        <span className="font-medium">{temperature}°C</span>
        <span className="text-gray-600">{weather}</span>
      </div>
    )
  }

  const handleSearch = () => {
    // TODO: 검색 로직 구현
    console.log('검색 데이터:', searchData)
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* 메인 컨텐츠 */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 메인 배너 */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
            이번 주말, 날씨에 딱 맞는 여행지 추천 받아보세요!
          </h1>
          <p className="mx-auto max-w-3xl text-xl text-gray-600">
            실시간 날씨 정보를 기반으로 최적의 여행지를 추천해드립니다
          </p>
        </div>

        {/* 검색 바 */}
        <Card className="mx-auto mb-12 max-w-4xl">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <MapPin className="h-4 w-4" />
                  출발지
                </label>
                <Input
                  placeholder="서울, 부산, 대구..."
                  value={searchData.departure}
                  onChange={(e) =>
                    setSearchData((prev) => ({
                      ...prev,
                      departure: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <CalendarIcon className="h-4 w-4" />
                  날짜
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-10 w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {searchData.date ? (
                        format(searchData.date, 'PPP', { locale: ko })
                      ) : (
                        <span className="text-muted-foreground">
                          날짜를 선택해주세요
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={searchData.date}
                      onSelect={(date) =>
                        setSearchData((prev) => ({ ...prev, date }))
                      }
                      initialFocus
                      disabled={(date) => date < new Date()}
                      locale={ko}
                      weekStartsOn={1}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Palette className="h-4 w-4" />
                  테마
                </label>
                <Select
                  value={searchData.theme}
                  onValueChange={(value) =>
                    setSearchData((prev) => ({ ...prev, theme: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="테마 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="휴양">휴양</SelectItem>
                    <SelectItem value="캠핑">캠핑</SelectItem>
                    <SelectItem value="문화">문화</SelectItem>
                    <SelectItem value="맛집">맛집</SelectItem>
                    <SelectItem value="액티비티">액티비티</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSearch} className="h-10">
                <Search className="mr-2 h-4 w-4" />
                여행지 찾기
              </Button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                &ldquo;날씨 기반으로 딱 맞는 여행 추천 받기&rdquo;
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 추천 여행지 섹션 */}
        <div className="mb-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">추천 여행지</h2>
            <Button variant="outline" size="sm">
              더보기
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {recommendedDestinations.map((destination) => (
              <Card
                key={destination.id}
                className="group cursor-pointer transition-shadow hover:shadow-lg"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{destination.icon}</span>
                    <WeatherIcon
                      weather={destination.weather}
                      temperature={destination.temperature}
                    />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardTitle className="mb-2 text-lg">
                    {destination.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    {destination.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 추가 정보 섹션 */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Sun className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">실시간 날씨</h3>
              <p className="text-gray-600">
                최신 날씨 정보로 정확한 여행 계획을 세워보세요
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">맞춤 추천</h3>
              <p className="text-gray-600">
                개인 취향과 날씨를 고려한 맞춤형 여행지 추천
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <CalendarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">여행 계획</h3>
              <p className="text-gray-600">체계적인 여행 계획과 일정 관리</p>
            </CardContent>
          </Card>
        </div>
      </div>
      <Chatbot />
    </div>
  )
}
