import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  MapPin,
  Route,
  ChevronDown,
  ChevronUp,
  Navigation,
} from '@/components/icons'
import CompactPlaceCard from './CompactPlaceCard'

/**
 * 컴팩트한 일차별 여행 일정 컴포넌트
 */
export function CompactDayItinerary({
  day,
  places = [],
  dayNumber,
  weatherData = {},
  showWeather = true,
  className = '',
}) {
  const [isExpanded, setIsExpanded] = useState(true)

  if (!places || places.length === 0) {
    return null
  }

  // 유효한 위치 정보가 있는 장소 필터링
  const getLocationFromPlace = (place) => {
    const lat =
      place.lat ||
      place.latitude ||
      place.y ||
      place.coords?.lat ||
      place.location?.lat ||
      place.geometry?.location?.lat
    const lng =
      place.lng ||
      place.longitude ||
      place.x ||
      place.coords?.lng ||
      place.location?.lng ||
      place.geometry?.location?.lng
    return lat && lng && !isNaN(lat) && !isNaN(lng)
      ? { lat: Number(lat), lng: Number(lng) }
      : null
  }

  const validPlaces = places
    .map((place) => {
      const location = getLocationFromPlace(place)
      return location ? { ...place, ...location } : null
    })
    .filter(Boolean)

  const hasMultiplePlaces = validPlaces.length > 1

  return (
    <Card className={`shadow-sm ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
              <span className="text-sm font-bold text-blue-600">
                {dayNumber}
              </span>
            </div>
            <div>
              <CardTitle className="text-base text-gray-900 dark:text-gray-100">
                {dayNumber}일차
              </CardTitle>
              <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                <MapPin className="h-3 w-3" />
                <span>{places.length}개 장소</span>
                {validPlaces.length !== places.length && (
                  <Badge variant="outline" className="text-xs">
                    {places.length - validPlaces.length}개 위치 정보 없음
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* 일차별 전체 경로 버튼 */}
            {hasMultiplePlaces && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const routeUrl =
                    `https://www.google.com/maps/dir/?api=1&origin=current+location&destination=${validPlaces[validPlaces.length - 1].lat},${validPlaces[validPlaces.length - 1].lng}` +
                    (validPlaces.length > 2
                      ? `&waypoints=${validPlaces
                          .slice(0, -1)
                          .map((p) => `${p.lat},${p.lng}`)
                          .join('|')}`
                      : '')
                  window.open(routeUrl, '_blank', 'noopener,noreferrer')
                }}
                className="h-7 px-2 py-1 text-xs"
              >
                <Route className="mr-1 h-3 w-3" />
                경로
              </Button>
            )}

            {/* 접기/펼치기 버튼 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-7 px-1 text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>

        {/* 일차 요약 정보 (접혔을 때 표시) */}
        {!isExpanded && (
          <div className="mt-2 flex items-center gap-4 text-xs text-gray-700 dark:text-gray-300">
            <div className="flex items-center gap-1">
              <span>총 {places.length}곳</span>
            </div>
            {hasMultiplePlaces && (
              <div className="flex items-center gap-1 text-blue-700 dark:text-blue-300">
                <Route className="h-3 w-3" />
                <span>경로 연결 가능</span>
              </div>
            )}
            <div className="flex -space-x-1">
              {places.slice(0, 4).map((place, index) => (
                <div
                  key={index}
                  className="flex h-5 w-5 items-center justify-center rounded-full border border-white bg-blue-100 text-xs font-medium"
                >
                  {index + 1}
                </div>
              ))}
              {places.length > 4 && (
                <div className="flex h-5 w-5 items-center justify-center rounded-full border border-white bg-gray-400 text-xs font-medium text-white">
                  +{places.length - 4}
                </div>
              )}
            </div>
          </div>
        )}
      </CardHeader>

      {/* 장소 목록 (펼쳤을 때 표시) */}
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-2">
            {places.map((place, index) => (
              <CompactPlaceCard
                key={index}
                place={place}
                placeIndex={index}
                weather={weatherData[place.description] || null}
                showWeather={showWeather}
                className="transition-shadow hover:shadow-sm"
              />
            ))}
          </div>

          {/* 일차별 요약 정보 */}
          {hasMultiplePlaces && (
            <div className="mt-3 border-t border-gray-100 pt-2">
              <div className="flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const routeUrl =
                      `https://www.google.com/maps/dir/?api=1&origin=current+location&destination=${validPlaces[validPlaces.length - 1].lat},${validPlaces[validPlaces.length - 1].lng}` +
                      (validPlaces.length > 2
                        ? `&waypoints=${validPlaces
                            .slice(0, -1)
                            .map((p) => `${p.lat},${p.lng}`)
                            .join('|')}`
                        : '')
                    window.open(routeUrl, '_blank', 'noopener,noreferrer')
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  <Navigation className="mr-1 h-3 w-3" />
                  {dayNumber}일차 전체 경로로 이동
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

export default CompactDayItinerary
