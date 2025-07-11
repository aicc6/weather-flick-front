import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  MapPin,
  Tag,
  Navigation,
  Cloud,
  Sun,
  CloudRain,
  ChevronDown,
  ChevronUp,
  Thermometer,
} from '@/components/icons'
import { NavigationButton } from '@/components/navigation'

/**
 * 여행 장소 통합 카드 컴포넌트
 * 장소 정보, 날씨, 내비게이션을 하나의 깔끔한 카드로 통합
 */
export function PlaceCard({ 
  place, 
  dayNumber, 
  placeIndex, 
  weather = null,
  showWeather = true,
  className = '' 
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!place) return null

  // 위치 정보 추출
  const getLocationInfo = (place) => {
    const lat = place.lat || place.latitude || place.y || place.coords?.lat || place.location?.lat || place.geometry?.location?.lat
    const lng = place.lng || place.longitude || place.x || place.coords?.lng || place.location?.lng || place.geometry?.location?.lng
    return lat && lng && !isNaN(lat) && !isNaN(lng) ? { lat: Number(lat), lng: Number(lng) } : null
  }

  // 카테고리 포맷팅
  const formatPlaceCategory = (type) => {
    const categoryMap = {
      point_of_interest: '관심 장소',
      establishment: '상업시설',
      tourist_attraction: '관광명소',
      park: '공원',
      museum: '박물관',
      restaurant: '음식점',
      cafe: '카페',
      lodging: '숙소',
      store: '상점',
      transit_station: '교통',
    }
    return categoryMap[type] || type
  }

  // 날씨 아이콘 매핑
  const getWeatherIcon = (condition) => {
    const iconMap = {
      맑음: <Sun className="h-4 w-4 text-yellow-500" />,
      구름조금: <Sun className="h-4 w-4 text-yellow-400" />,
      구름많음: <Cloud className="h-4 w-4 text-gray-500" />,
      흐림: <Cloud className="h-4 w-4 text-gray-600" />,
      비: <CloudRain className="h-4 w-4 text-blue-500" />,
      눈: <Cloud className="h-4 w-4 text-blue-300" />,
      바람: <Cloud className="h-4 w-4 text-gray-400" />,
    }
    return iconMap[condition] || <Cloud className="h-4 w-4 text-gray-400" />
  }

  const locationInfo = getLocationInfo(place)
  const hasNavigation = locationInfo || place.place_id || place.description

  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardContent className="p-4">
        {/* 메인 정보 영역 */}
        <div className="flex items-start justify-between">
          {/* 왼쪽: 장소 기본 정보 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-xs font-bold flex-shrink-0">
                {placeIndex + 1}
              </div>
              <h4 className="font-medium text-gray-900 truncate">
                {place.description || place.name || '이름 없음'}
              </h4>
            </div>
            
            {place.address && (
              <p className="text-sm text-gray-600 mb-2 truncate">
                📍 {place.address}
              </p>
            )}
            
            {place.category && (
              <Badge variant="secondary" className="text-xs mb-2">
                {formatPlaceCategory(place.category)}
              </Badge>
            )}
          </div>

          {/* 오른쪽: 날씨 + 내비게이션 */}
          <div className="ml-4 flex flex-col items-end gap-2">
            {/* 날씨 정보 (간단 표시) */}
            {showWeather && weather && (
              <div className="flex items-center gap-1 text-sm">
                {getWeatherIcon(weather.condition)}
                <span className="text-gray-600">{weather.temperature}°</span>
              </div>
            )}
            
            {/* 내비게이션 버튼 (간소화) */}
            {hasNavigation ? (
              <NavigationButton
                destination={{
                  name: place.description || place.name,
                  lat: locationInfo?.lat,
                  lng: locationInfo?.lng,
                  place_id: place.place_id,
                  description: place.description,
                  address: place.address,
                }}
                showTransportOptions={false} // 간단 모드
                className="text-xs"
              />
            ) : (
              <Badge variant="outline" className="text-xs text-gray-400">
                위치 정보 없음
              </Badge>
            )}
          </div>
        </div>

        {/* 메모 영역 */}
        {place.memo && (
          <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-600">
            💭 {place.memo}
          </div>
        )}

        {/* 확장 가능한 상세 정보 */}
        {(showWeather && weather || hasNavigation) && (
          <>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full text-xs text-gray-500 hover:text-gray-700"
              >
                {isExpanded ? (
                  <>
                    간단히 보기 <ChevronUp className="ml-1 h-3 w-3" />
                  </>
                ) : (
                  <>
                    자세히 보기 <ChevronDown className="ml-1 h-3 w-3" />
                  </>
                )}
              </Button>
            </div>

            {/* 확장된 상세 정보 */}
            {isExpanded && (
              <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
                {/* 상세 날씨 정보 */}
                {showWeather && weather && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Thermometer className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">날씨 정보</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        {getWeatherIcon(weather.condition)}
                        <span>{weather.condition}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">{weather.temperature}°C</span>
                      </div>
                      {weather.humidity && (
                        <>
                          <div>습도: {weather.humidity}%</div>
                          <div className="text-right">강수: {weather.precipitation || 0}%</div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* 상세 내비게이션 옵션 */}
                {hasNavigation && (
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Navigation className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">길찾기 옵션</span>
                    </div>
                    <NavigationButton
                      destination={{
                        name: place.description || place.name,
                        lat: locationInfo?.lat,
                        lng: locationInfo?.lng,
                        place_id: place.place_id,
                        description: place.description,
                        address: place.address,
                      }}
                      showTransportOptions={true} // 전체 옵션 표시
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default PlaceCard