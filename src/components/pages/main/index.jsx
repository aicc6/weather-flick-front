import { useState, useRef, useEffect } from 'react'

import {
  MapPin,
  Calendar as CalendarIcon,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
} from 'lucide-react'
import { Chatbot } from '@/components/common/chatbot'
import {
  Carousel,
  CarouselContent,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Button } from '@/components/ui/button'

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

  const AUTOPLAY_INTERVAL = 3000 // 3초

  function RecommendedDestCarousel({ destinations }) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [visibleCount, setVisibleCount] = useState(3)
    const total = destinations.length
    const intervalRef = useRef(null)
    const isHovered = useRef(false)

    // 반응형 visibleCount
    useEffect(() => {
      const handleResize = () => {
        if (window.innerWidth >= 1024) setVisibleCount(3)
        else if (window.innerWidth >= 768) setVisibleCount(2)
        else setVisibleCount(1)
      }
      handleResize()
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }, [])

    // 자동 슬라이드
    useEffect(() => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (!isHovered.current) {
        intervalRef.current = setInterval(() => {
          setCurrentIndex((prev) => (prev + 1) % total)
        }, AUTOPLAY_INTERVAL)
      }
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    }, [total, visibleCount])

    // hover 시 멈춤/재생
    const handleMouseEnter = () => {
      isHovered.current = true
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    const handleMouseLeave = () => {
      isHovered.current = false
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % total)
      }, AUTOPLAY_INTERVAL)
    }

    // 현재 보여줄 아이템 인덱스 계산
    const getVisibleItems = () => {
      const items = []
      for (let i = 0; i < visibleCount; i++) {
        items.push(destinations[(currentIndex + i) % total])
      }
      return items
    }

    return (
      <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <Carousel>
          <CarouselContent
            style={{
              transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`,
              transition: 'transform 0.5s ease',
            }}
            className="flex"
          >
            {destinations.map((destination) => (
              <div
                key={destination.id}
                className="w-full flex-shrink-0 px-2 md:w-1/2 lg:w-1/3"
              >
                <div className="bg-card rounded-xl p-6 text-center shadow-md">
                  <div className="mb-2 flex items-center justify-center gap-2">
                    <span className="text-2xl">{destination.icon}</span>
                    <WeatherIcon
                      weather={destination.weather}
                      temperature={destination.temperature}
                    />
                  </div>
                  <h3 className="text-xl font-bold">{destination.name}</h3>
                  <p className="text-muted-foreground">
                    {destination.description}
                  </p>
                </div>
              </div>
            ))}
          </CarouselContent>
          <CarouselPrevious
            onClick={() => setCurrentIndex((currentIndex - 1 + total) % total)}
          />
          <CarouselNext
            onClick={() => setCurrentIndex((currentIndex + 1) % total)}
          />
        </Carousel>
      </div>
    )
  }

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
    <div className="min-h-screen">
      <section className="pt-12 pb-8 text-center">
        <h1 className="text-foreground mb-2 text-4xl font-bold">
          이번 주말, 날씨에 딱 맞는 여행지 추천 받아보세요!
        </h1>
        <p className="text-muted-foreground mb-8 text-lg">
          실시간 날씨 정보를 기반으로 최적의 여행지를 추천해드립니다
        </p>
        <div className="bg-card mx-auto mb-10 max-w-2xl rounded-2xl p-8 shadow-lg">
          <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-foreground flex items-center gap-2 text-sm font-medium">
                <MapPin className="h-4 w-4" />
                출발지
              </label>
              <input
                className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
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
              <label className="text-foreground flex items-center gap-2 text-sm font-medium">
                <CalendarIcon className="h-4 w-4" />
                날짜
              </label>
              <input
                type="date"
                className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                value={searchData.date ? searchData.date : ''}
                onChange={(e) =>
                  setSearchData((prev) => ({ ...prev, date: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-foreground flex items-center gap-2 text-sm font-medium">
                <CalendarIcon className="h-4 w-4" />
                테마
              </label>
              <select
                className="border-input bg-background text-foreground focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                value={searchData.theme}
                onChange={(e) =>
                  setSearchData((prev) => ({ ...prev, theme: e.target.value }))
                }
              >
                <option value="">테마 선택</option>
                <option value="휴양">휴양</option>
                <option value="캠핑">캠핑</option>
                <option value="문화">문화</option>
                <option value="맛집">맛집</option>
                <option value="액티비티">액티비티</option>
              </select>
            </div>
            <Button
              className="mt-6 h-10 w-full font-semibold"
              variant="default"
              onClick={handleSearch}
            >
              여행지 찾기
            </Button>
          </div>
          <div className="mt-4 text-center">
            <p className="text-muted-foreground text-sm">
              &quot;날씨 기반으로 딱 맞는 여행 추천 받기&quot;
            </p>
          </div>
        </div>
      </section>
      <section className="mb-12">
        <h2 className="text-foreground mb-4 text-center text-2xl font-bold">
          추천 여행지
        </h2>
        <div className="flex justify-center">
          <div className="w-full max-w-5xl">
            <RecommendedDestCarousel destinations={recommendedDestinations} />
          </div>
        </div>
      </section>
      <section className="mx-auto mb-16 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
        <div className="bg-card rounded-xl p-8 text-center shadow-md">
          <Sun className="mx-auto mb-2 h-8 w-8 text-blue-400" />
          <h3 className="text-foreground text-lg font-semibold">실시간 날씨</h3>
          <p className="text-muted-foreground">
            최신 날씨 정보로 정확한 여행 계획을 세워보세요
          </p>
        </div>
        <div className="bg-card rounded-xl p-8 text-center shadow-md">
          <MapPin className="mx-auto mb-2 h-8 w-8 text-green-400" />
          <h3 className="text-foreground text-lg font-semibold">맞춤 추천</h3>
          <p className="text-muted-foreground">
            개인 취향과 날씨를 고려한 맞춤형 여행지 추천
          </p>
        </div>
        <div className="bg-card rounded-xl p-8 text-center shadow-md">
          <CalendarIcon className="mx-auto mb-2 h-8 w-8 text-purple-400" />
          <h3 className="text-foreground text-lg font-semibold">여행 계획</h3>
          <p className="text-muted-foreground">
            체계적인 여행 계획과 일정 관리
          </p>
        </div>
      </section>
      <Chatbot />
    </div>
  )
}
