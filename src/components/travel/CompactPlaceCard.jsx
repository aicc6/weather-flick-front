import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Sun,
  Cloud,
  CloudRain,
} from '@/components/icons'
import { NavigationButton } from '@/components/navigation'

/**
 * 컴팩트한 여행 장소 카드 컴포넌트
 * 핵심 정보만 간결하게 표시
 */
export function CompactPlaceCard({ 
  place, 
  placeIndex, 
  weather = null,
  showWeather = true,
  className = '' 
}) {
  if (!place) return null

  // 위치 정보 추출
  const getLocationInfo = (place) => {
    const lat = place.lat || place.latitude || place.y || place.coords?.lat || place.location?.lat || place.geometry?.location?.lat
    const lng = place.lng || place.longitude || place.x || place.coords?.lng || place.location?.lng || place.geometry?.location?.lng
    return lat && lng && !isNaN(lat) && !isNaN(lng) ? { lat: Number(lat), lng: Number(lng) } : null
  }

  // 날씨 아이콘 매핑
  const getWeatherIcon = (condition) => {
    const iconMap = {
      맑음: <Sun className="h-3 w-3 text-yellow-500" />,
      구름조금: <Sun className="h-3 w-3 text-yellow-400" />,
      구름많음: <Cloud className="h-3 w-3 text-gray-500" />,
      흐림: <Cloud className="h-3 w-3 text-gray-600" />,
      비: <CloudRain className="h-3 w-3 text-blue-500" />,
      눈: <Cloud className="h-3 w-3 text-blue-300" />,
      바람: <Cloud className="h-3 w-3 text-gray-400" />,
    }
    return iconMap[condition] || <Cloud className="h-3 w-3 text-gray-400" />
  }

  const locationInfo = getLocationInfo(place)
  const hasNavigation = locationInfo || place.place_id || place.description

  return (
    <Card className={`border-l-4 border-l-blue-200 ${className}`}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          {/* 왼쪽: 장소 정보 */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* 순서 번호 */}
            <div className="flex items-center justify-center w-6 h-6 bg-blue-500 text-white rounded-full text-xs font-bold flex-shrink-0">
              {placeIndex + 1}
            </div>
            
            {/* 장소 이름과 정보 */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 text-sm truncate">
                {place.description || place.name || '이름 없음'}
              </h4>
              {place.address && (
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {place.address}
                </p>
              )}
            </div>
          </div>

          {/* 중간: 날씨 정보 */}
          {showWeather && weather && (
            <div className="flex items-center gap-1 mx-3 flex-shrink-0">
              {getWeatherIcon(weather.condition)}
              <span className="text-xs text-gray-600">{weather.temperature}°</span>
            </div>
          )}
          
          {/* 날씨 정보가 없을 때 디버깅용 */}
          {showWeather && !weather && (
            <div className="flex items-center gap-1 mx-3 flex-shrink-0">
              <Cloud className="h-3 w-3 text-gray-300" />
              <span className="text-xs text-gray-400">-°</span>
            </div>
          )}

          {/* 오른쪽: 내비게이션 */}
          <div className="flex-shrink-0">
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
                showTransportOptions={false}
                className="text-xs px-2 py-1"
              />
            ) : (
              <Badge variant="outline" className="text-xs text-gray-400 px-2 py-0.5">
                위치 정보 없음
              </Badge>
            )}
          </div>
        </div>

        {/* 메모 (있는 경우만 표시) */}
        {place.memo && (
          <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-gray-600 border-l-2 border-blue-200">
            💭 {place.memo}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default CompactPlaceCard