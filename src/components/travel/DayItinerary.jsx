import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  Clock,
  MapPin,
  Route,
  ChevronDown,
  ChevronUp,
  Navigation,
} from '@/components/icons'
import PlaceCard from './PlaceCard'

/**
 * 일차별 여행 일정 컴포넌트
 * 깔끔하고 간결한 디자인으로 일차별 장소들을 표시
 */
export function DayItinerary({ 
  day, 
  places = [], 
  dayNumber, 
  weatherData = {},
  showWeather = true,
  className = '' 
}) {
  const [isExpanded, setIsExpanded] = useState(true)

  if (!places || places.length === 0) {
    return null
  }

  // 유효한 위치 정보가 있는 장소 필터링
  const getLocationFromPlace = (place) => {
    const lat = place.lat || place.latitude || place.y || place.coords?.lat || place.location?.lat || place.geometry?.location?.lat
    const lng = place.lng || place.longitude || place.x || place.coords?.lng || place.location?.lng || place.geometry?.location?.lng
    return lat && lng && !isNaN(lat) && !isNaN(lng) ? { lat: Number(lat), lng: Number(lng) } : null
  }

  const validPlaces = places.map(place => {
    const location = getLocationFromPlace(place)
    return location ? { ...place, ...location } : null
  }).filter(Boolean)

  const hasMultiplePlaces = validPlaces.length > 1

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg text-gray-800">
                {dayNumber}일차
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-500">
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

          <div className="flex items-center gap-2">
            {/* 일차별 전체 경로 버튼 */}
            {hasMultiplePlaces && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const routeUrl = `https://www.google.com/maps/dir/?api=1&origin=current+location&destination=${validPlaces[validPlaces.length - 1].lat},${validPlaces[validPlaces.length - 1].lng}`
                    + (validPlaces.length > 2 ? `&waypoints=${validPlaces.slice(0, -1).map(p => `${p.lat},${p.lng}`).join('|')}` : '')
                  window.open(routeUrl, '_blank', 'noopener,noreferrer')
                }}
                className="text-xs bg-blue-500 text-white hover:bg-blue-600 border-0"
              >
                <Route className="mr-1 h-3 w-3" />
                일차 경로
              </Button>
            )}
            
            {/* 접기/펼치기 버튼 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* 일차 요약 정보 (접혔을 때 표시) */}
        {!isExpanded && (
          <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>총 {places.length}곳</span>
            </div>
            {hasMultiplePlaces && (
              <div className="flex items-center gap-1">
                <Route className="h-3 w-3" />
                <span>경로 연결 가능</span>
              </div>
            )}
            <div className="flex -space-x-1">
              {places.slice(0, 3).map((place, index) => (
                <div 
                  key={index}
                  className="w-6 h-6 bg-gray-200 border-2 border-white rounded-full flex items-center justify-center text-xs font-medium"
                >
                  {index + 1}
                </div>
              ))}
              {places.length > 3 && (
                <div className="w-6 h-6 bg-gray-400 border-2 border-white rounded-full flex items-center justify-center text-xs text-white font-medium">
                  +{places.length - 3}
                </div>
              )}
            </div>
          </div>
        )}
      </CardHeader>

      {/* 장소 목록 (펼쳤을 때 표시) */}
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            {places.map((place, index) => (
              <PlaceCard
                key={index}
                place={place}
                dayNumber={dayNumber}
                placeIndex={index}
                weather={weatherData[place.description] || null}
                showWeather={showWeather}
                className="bg-gray-50 hover:bg-white"
              />
            ))}
          </div>

          {/* 일차별 요약 액션 */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <span>📍 총 {places.length}개 장소</span>
                {hasMultiplePlaces && (
                  <span className="text-blue-600">🗺️ 연결 경로 이용 가능</span>
                )}
              </div>
              
              {hasMultiplePlaces && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    // 일차별 전체 경로 생성 로직 (RouteNavigation 컴포넌트의 기능 활용)
                    const routeUrl = `https://www.google.com/maps/dir/?api=1&origin=current+location&destination=${validPlaces[validPlaces.length - 1].lat},${validPlaces[validPlaces.length - 1].lng}`
                    + (validPlaces.length > 2 ? `&waypoints=${validPlaces.slice(0, -1).map(p => `${p.lat},${p.lng}`).join('|')}` : '')
                    window.open(routeUrl, '_blank', 'noopener,noreferrer')
                  }}
                >
                  <Route className="mr-1 h-3 w-3" />
                  일차 전체 경로
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export default DayItinerary