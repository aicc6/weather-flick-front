import { useState, useCallback, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from '@/components/icons'

export function RecommendedDestCarousel({ destinations = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [imageLoadStates, setImageLoadStates] = useState({})

  const itemsToShow = 3
  const maxIndex = Math.max(0, destinations.length - itemsToShow)

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1))
  }, [])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1))
  }, [maxIndex])

  // Handle image load success
  const handleImageLoad = useCallback((destinationId) => {
    setImageLoadStates((prev) => ({
      ...prev,
      [destinationId]: { loaded: true, error: false },
    }))
  }, [])

  // Handle image load error
  const handleImageError = useCallback((destinationId) => {
    setImageLoadStates((prev) => ({
      ...prev,
      [destinationId]: { loaded: false, error: true },
    }))
  }, [])

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || destinations.length <= itemsToShow) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= maxIndex) {
          return 0 // Loop back to start
        }
        return prev + 1
      })
    }, 4000) // Change slide every 4 seconds

    return () => clearInterval(interval)
  }, [isAutoPlaying, maxIndex, destinations.length, itemsToShow])

  // Pause auto-play on hover
  const handleMouseEnter = () => setIsAutoPlaying(false)
  const handleMouseLeave = () => setIsAutoPlaying(true)

  if (!destinations || destinations.length === 0) {
    return (
      <div className="weather-card p-8 text-center">
        <p className="text-muted-foreground">추천 여행지가 없습니다.</p>
      </div>
    )
  }

  const visibleDestinations = destinations.slice(
    currentIndex,
    currentIndex + itemsToShow,
  )

  return (
    <div className="relative mx-auto w-full max-w-6xl px-4">
      {/* Carousel Container */}
      <div
        className="weather-card relative overflow-hidden rounded-2xl p-6"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Navigation Buttons */}
        {destinations.length > itemsToShow && (
          <>
            <button
              onClick={goToPrevious}
              disabled={currentIndex === 0}
              className="dark:bg-card/90 dark:hover:bg-card weather-button absolute top-1/2 left-2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg transition-all duration-300 hover:bg-white hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="이전 여행지"
            >
              <ChevronLeft className="h-6 w-6 text-black" />
            </button>

            <button
              onClick={goToNext}
              disabled={currentIndex >= maxIndex}
              className="dark:bg-card/90 dark:hover:bg-card weather-button absolute top-1/2 right-2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg transition-all duration-300 hover:bg-white hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="다음 여행지"
            >
              <ChevronRight className="h-6 w-6 text-black" />
            </button>
          </>
        )}

        {/* Carousel Content */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visibleDestinations.map((destination, index) => {
            const imageState = imageLoadStates[destination.id] || {
              loaded: false,
              error: false,
            }
            const hasImage = destination.image && !imageState.error
            const showImageOverlays = hasImage && imageState.loaded

            return (
              <div
                key={`${destination.name}-${currentIndex + index}`}
                className="weather-card group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl"
                onClick={() => {
                  // Navigate to destination detail page
                  window.location.href = `/destinations/detail/${destination.id}`
                }}
              >
                {/* Image or Icon Display */}
                <div className="relative h-48 w-full overflow-hidden rounded-t-xl">
                  {hasImage && !imageState.error ? (
                    <>
                      <img
                        src={destination.image}
                        alt={destination.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                        onLoad={() => handleImageLoad(destination.id)}
                        onError={() => handleImageError(destination.id)}
                      />
                      {!imageState.loaded && (
                        <div className="from-sky-blue-light/80 via-sunshine-yellow-light/60 to-sunset-orange-light/80 dark:from-sky-blue/20 dark:via-sunshine-yellow/10 dark:to-sunset-orange/20 absolute inset-0 flex items-center justify-center bg-gradient-to-br">
                          <div className="text-center">
                            <div className="mb-2 text-4xl">
                              {destination.icon || '🏞️'}
                            </div>
                            <p className="text-muted-foreground text-sm">
                              로딩 중...
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    // Fallback to icon when no image or image failed
                    <div className="from-sky-blue-light/80 via-sunshine-yellow-light/60 to-sunset-orange-light/80 dark:from-sky-blue/20 dark:via-sunshine-yellow/10 dark:to-sunset-orange/20 flex h-full w-full items-center justify-center bg-gradient-to-br">
                      <div className="text-center">
                        <div className="mb-4 text-6xl">
                          {destination.icon || '🏞️'}
                        </div>
                        <h3 className="text-foreground text-xl font-bold">
                          {destination.name}
                        </h3>
                      </div>
                    </div>
                  )}

                  {/* Weather overlay - only show when image is loaded or no image */}
                  {/* 날씨 오버레이 제거
                  {(showImageOverlays || !hasImage) && (
                    <div className="weather-sunny absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-semibold">
                      {destination.weather || '☀️ 맑음'}
                    </div>
                  )}
                  */}

                  {/* Temperature with proper unit - only show when image is loaded or no image */}
                  {/* 온도 표시 제거
                  {(showImageOverlays || !hasImage) && (
                    <div className="dark:bg-card/90 text-sky-blue-dark absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-sm font-bold">
                      🌡️ {destination.temperature || 22}°C
                    </div>
                  )}
                  */}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="text-foreground group-hover:text-sky-blue-dark text-lg font-bold transition-colors">
                      {destination.name}
                    </h4>
                    <div className="flex items-center gap-1">
                      <span className="text-sunshine-yellow">⭐</span>
                      <span className="text-muted-foreground text-sm font-medium">
                        {destination.rating || '4.5'}
                      </span>
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-3 line-clamp-2 text-sm">
                    {destination.description ||
                      '아름다운 자연과 완벽한 날씨를 즐길 수 있는 최고의 여행지입니다.'}
                  </p>

                  {/* Tags */}
                  <div className="mb-3 flex flex-wrap gap-2">
                    {(destination.tags || ['자연', '관광'])
                      .slice(0, 2)
                      .map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="weather-cloudy rounded-full px-2 py-1 text-xs font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                  </div>

                  {/* Distance & Duration */}
                  <div className="text-muted-foreground flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1">
                      🚗 {destination.distance || '2시간 거리'}
                    </span>
                    <span className="flex items-center gap-1">
                      💰 {destination.budget || '10만원대'}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Indicators */}
        {destinations.length > itemsToShow && (
          <div className="mt-6 flex justify-center gap-2">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-3 w-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-sky-blue-dark scale-125'
                    : 'bg-cloud-gray hover:bg-sky-blue'
                }`}
                aria-label={`${index + 1}번째 슬라이드로 이동`}
              />
            ))}
          </div>
        )}

        {/* Auto-play indicator */}
        {/* AUTO/PAUSE 인디케이터 제거
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${
              isAutoPlaying
                ? 'bg-sunshine-yellow animate-pulse'
                : 'bg-storm-gray'
            }`}
          ></div>
          <span className="text-muted-foreground text-xs">
            {isAutoPlaying ? 'AUTO' : 'PAUSE'}
          </span>
        </div>
        */}
      </div>
    </div>
  )
}
