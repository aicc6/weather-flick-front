import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from '@/components/icons'
import { useGetGoogleReviewsQuery } from '@/store/api'
import { Star } from '@/components/icons'

function RecommendedDestCard({ destination, onClick }) {
  const [showAllReviews, setShowAllReviews] = useState(false)
  const {
    data: googleData,
    isLoading: isReviewLoading,
    isError: isReviewError,
  } = useGetGoogleReviewsQuery(destination.place_id, {
    skip: !destination.place_id,
  })
  const rating = googleData?.rating
  const reviews = googleData?.reviews || []
  const handleShowAllReviews = (e) => {
    e.stopPropagation()
    setShowAllReviews(true)
  }

  return (
    <div
      className="weather-card group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`${destination.name} 여행지 추천 보기`}
    >
      {/* Image or Icon Display */}
      <div className="relative h-48 w-full overflow-hidden rounded-t-xl">
        {destination.image && (
          <img
            src={destination.image}
            alt={destination.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
        )}
        {!destination.image && (
          <div className="from-sky-blue-light/80 via-sunshine-yellow-light/60 to-sunset-orange-light/80 dark:from-sky-blue/20 dark:via-sunshine-yellow/10 dark:to-sunset-orange/20 flex h-full w-full items-center justify-center bg-gradient-to-br">
            <div className="text-center">
              <div className="mb-4 text-6xl">🏞️</div>
              <h3 className="text-foreground text-xl font-bold">
                {destination.name}
              </h3>
            </div>
          </div>
        )}
      </div>
      {/* Content */}
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-foreground text-lg font-bold transition-colors group-hover:text-blue-600">
            {destination.name}
          </h4>
          {/* 별점/리뷰 표시 */}
          <div className="flex flex-col items-end gap-1">
            {destination.place_id ? (
              isReviewLoading ? (
                <span className="text-xs text-gray-400">
                  별점 불러오는 중...
                </span>
              ) : isReviewError ? (
                <span className="text-xs text-red-400">
                  별점 정보를 불러올 수 없습니다
                </span>
              ) : rating ? (
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="h-4 w-4" aria-label="별점" />
                  <span className="font-semibold">{rating}</span>
                  <span className="text-xs text-gray-500">/ 5</span>
                  <span className="ml-2 text-xs text-gray-500">
                    ({reviews.length}개 리뷰)
                  </span>
                </div>
              ) : (
                <span className="text-xs text-gray-400">정보가없습니다</span>
              )
            ) : (
              <span className="text-xs text-gray-400">정보가없습니다</span>
            )}
            {/* 리뷰 미리보기/전체보기 */}
            {reviews.length > 0 && (
              <ul className="mt-1 space-y-1">
                {(showAllReviews ? reviews : reviews.slice(0, 2)).map(
                  (review, idx) => (
                    <li
                      key={idx}
                      className="border-b pb-2 text-xs text-gray-700 last:border-b-0 last:pb-0"
                    >
                      <span className="font-semibold">
                        {review.author_name}:
                      </span>{' '}
                      {review.text}
                      <span className="ml-2 text-gray-400">
                        ({review.relative_time_description})
                      </span>
                    </li>
                  ),
                )}
                {!showAllReviews && reviews.length > 2 && (
                  <li className="text-xs text-blue-500">
                    <button
                      type="button"
                      className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700 hover:bg-blue-200 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      aria-label={`리뷰 더보기 (${reviews.length}개)`}
                      onClick={handleShowAllReviews}
                    >
                      리뷰 더보기
                    </button>
                  </li>
                )}
              </ul>
            )}
          </div>
        </div>
        <p className="text-muted-foreground mb-3 line-clamp-2 text-sm">
          {destination.description || ''}
        </p>
        {/* 더미 태그/거리/예산/아이콘 등 완전 삭제 */}
      </div>
    </div>
  )
}

export function RecommendedDestCarousel({ destinations = [] }) {
  const navigate = useNavigate()
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
              className="dark:bg-card/90 dark:hover:bg-card absolute top-1/2 left-2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg transition-all duration-300 hover:bg-white hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="이전 여행지"
            >
              <ChevronLeft className="h-6 w-6 text-gray-700 dark:text-gray-200" />
            </button>

            <button
              onClick={goToNext}
              disabled={currentIndex >= maxIndex}
              className="dark:bg-card/90 dark:hover:bg-card absolute top-1/2 right-2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg transition-all duration-300 hover:bg-white hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="다음 여행지"
            >
              <ChevronRight className="h-6 w-6 text-gray-700 dark:text-gray-200" />
            </button>
          </>
        )}

        {/* Carousel Content */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visibleDestinations.map((destination, index) => (
            <RecommendedDestCard
              key={`${destination.name}-${currentIndex + index}`}
              destination={destination}
              onClick={() => {
                // 여행지 추천 페이지로 이동
                navigate('/recommend')
              }}
            />
          ))}
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
                    ? 'scale-125 bg-blue-600'
                    : 'bg-gray-300 hover:bg-blue-400'
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
