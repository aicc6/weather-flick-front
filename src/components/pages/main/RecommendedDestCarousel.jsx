import { WeatherIcon } from '@/components/icons'
import {
  Carousel,
  CarouselContent,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { AUTOPLAY_INTERVAL } from '@/data'
import { useEffect, useRef, useState } from 'react'

export function RecommendedDestCarousel({ destinations }) {
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
  const _getVisibleItems = () => {
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
          className="my-2"
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
