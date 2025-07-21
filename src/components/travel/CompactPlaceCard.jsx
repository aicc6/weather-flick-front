import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Sun, Cloud, CloudRain } from '@/components/icons'
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
  className = '',
}) {
  if (!place) return null

  // 위치 정보 추출
  const getLocationInfo = (place) => {
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
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {/* 순서 번호 */}
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
              {placeIndex + 1}
            </div>

            {/* 장소 이름과 정보 */}
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                {place.description || place.name || '이름 없음'}
              </h4>
              {place.address && (
                <p className="mt-0.5 truncate text-xs text-gray-700 dark:text-gray-300">
                  {place.address}
                </p>
              )}
              {/* 태그 표시 */}
              {place.tags && place.tags.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {place.tags.slice(0, 3).map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="px-1.5 py-0 text-xs"
                    >
                      {tag}
                    </Badge>
                  ))}
                  {place.tags.length > 3 && (
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      +{place.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 중간: 날씨 정보 */}
          {showWeather && weather && (
            <div className="mx-3 flex flex-shrink-0 items-center gap-1">
              <div className="flex flex-col items-center gap-0.5">
                <div className="flex items-center gap-1">
                  {getWeatherIcon(weather.condition)}
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {weather.temperature?.min && weather.temperature?.max
                      ? `${weather.temperature.min}°~${weather.temperature.max}°`
                      : weather.temperature?.current
                        ? `${weather.temperature.current}°`
                        : weather.temperature
                          ? `${weather.temperature}°`
                          : '-°'}
                  </span>
                </div>
                {weather.precipitation > 0 && (
                  <span className="text-xs text-blue-500 dark:text-blue-400">
                    💧{weather.precipitation}%
                  </span>
                )}
                {weather.condition && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {weather.condition}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* 날씨 정보가 없을 때 */}
          {showWeather && !weather && (
            <div className="mx-3 flex flex-shrink-0 items-center gap-1">
              <div className="flex flex-col items-center gap-0.5">
                <div className="flex items-center gap-1">
                  <Cloud className="h-3 w-3 text-gray-300" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    날씨정보
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  없음
                </span>
              </div>
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
                className="px-2 py-1 text-xs"
              />
            ) : (
              <Badge
                variant="outline"
                className="px-2 py-0.5 text-xs text-gray-400"
              >
                위치 정보 없음
              </Badge>
            )}
          </div>
        </div>

        {/* 메모 (있는 경우만 표시) */}
        {place.memo && (
          <div className="mt-2 rounded border-l-2 border-blue-200 bg-blue-50 p-2 text-xs text-gray-800 dark:border-blue-700 dark:bg-blue-900/20 dark:text-gray-200">
            💭 {place.memo}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default CompactPlaceCard
