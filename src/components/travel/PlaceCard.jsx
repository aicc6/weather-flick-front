import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  Navigation,
  Cloud,
  Sun,
  CloudRain,
  ChevronDown,
  ChevronUp,
  Thermometer,
  Heart,
  Bookmark,
} from '@/components/icons'
import { NavigationButton } from '@/components/navigation'
import {
  useAddDestinationLikeMutation,
  useRemoveDestinationLikeMutation,
  useAddDestinationSaveMutation,
  useRemoveDestinationSaveMutation,
} from '@/store/api/destinationLikesSavesApi'
import { useAuth } from '@/contexts/AuthContextRTK'

/**
 * 여행 장소 통합 카드 컴포넌트
 * 장소 정보, 날씨, 내비게이션을 하나의 깔끔한 카드로 통합
 */
export function PlaceCard({
  place,
  placeIndex,
  weather = null,
  showWeather = true,
  className = '',
  showActions = false, // 좋아요/저장 버튼 표시 여부
  onRefresh = null,
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { user } = useAuth()
  const [isLiking, setIsLiking] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // API mutations
  const [addLike] = useAddDestinationLikeMutation()
  const [removeLike] = useRemoveDestinationLikeMutation()
  const [addSave] = useAddDestinationSaveMutation()
  const [removeSave] = useRemoveDestinationSaveMutation()

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

  // 좋아요 토글
  const handleLikeToggle = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      toast.error('로그인이 필요한 기능입니다.')
      return
    }

    if (!place.destination_id) {
      toast.error('여행지 정보가 올바르지 않습니다.')
      return
    }

    if (isLiking) return

    setIsLiking(true)
    try {
      if (place.is_liked) {
        await removeLike(place.destination_id).unwrap()
        toast.success('좋아요를 취소했습니다.')
      } else {
        await addLike({ destination_id: place.destination_id }).unwrap()
        toast.success('좋아요를 추가했습니다.')
      }
      if (onRefresh) onRefresh()
    } catch (error) {
      console.error('좋아요 처리 실패:', error)
      toast.error('처리 중 오류가 발생했습니다.')
    } finally {
      setIsLiking(false)
    }
  }

  // 저장(북마크) 토글
  const handleSaveToggle = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      toast.error('로그인이 필요한 기능입니다.')
      return
    }

    if (!place.destination_id) {
      toast.error('여행지 정보가 올바르지 않습니다.')
      return
    }

    if (isSaving) return

    setIsSaving(true)
    try {
      if (place.is_saved) {
        await removeSave(place.destination_id).unwrap()
        toast.success('저장을 취소했습니다.')
      } else {
        await addSave({ destination_id: place.destination_id }).unwrap()
        toast.success('여행지를 저장했습니다.')
      }
      if (onRefresh) onRefresh()
    } catch (error) {
      console.error('저장 처리 실패:', error)
      toast.error('처리 중 오류가 발생했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className={`transition-shadow hover:shadow-md ${className}`}>
      <CardContent className="p-4">
        {/* 메인 정보 영역 */}
        <div className="flex items-start justify-between">
          {/* 왼쪽: 장소 기본 정보 */}
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-800">
                {placeIndex + 1}
              </div>
              <h4 className="truncate font-medium text-gray-900">
                {place.description || place.name || '장소명 정보 없음'}
              </h4>
            </div>

            {place.address && (
              <p className="mb-2 truncate text-sm text-gray-600">
                📍 {place.address}
              </p>
            )}

            {place.category && (
              <Badge variant="secondary" className="mb-2 text-xs">
                {formatPlaceCategory(place.category)}
              </Badge>
            )}
          </div>

          {/* 오른쪽: 날씨 + 내비게이션 */}
          <div className="ml-4 flex flex-col items-end gap-2">
            {/* 좋아요/저장 버튼 */}
            {showActions && place.destination_id && (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleLikeToggle}
                  disabled={isLiking}
                >
                  <Heart
                    className={`h-4 w-4 transition-colors ${
                      place.is_liked
                        ? 'fill-red-500 text-red-500'
                        : 'text-gray-500'
                    }`}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleSaveToggle}
                  disabled={isSaving}
                >
                  <Bookmark
                    className={`h-4 w-4 transition-colors ${
                      place.is_saved
                        ? 'fill-blue-500 text-blue-500'
                        : 'text-gray-500'
                    }`}
                  />
                </Button>
              </div>
            )}

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
          <div className="mt-3 rounded bg-gray-50 p-2 text-sm text-gray-600">
            💭 {place.memo}
          </div>
        )}

        {/* 확장 가능한 상세 정보 */}
        {((showWeather && weather) || hasNavigation) && (
          <>
            <div className="mt-3 border-t border-gray-100 pt-3">
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
              <div className="mt-3 space-y-3 border-t border-gray-100 pt-3">
                {/* 상세 날씨 정보 */}
                {showWeather && weather && (
                  <div className="rounded-lg bg-blue-50 p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        날씨 정보
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        {getWeatherIcon(weather.condition)}
                        <span>{weather.condition}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">
                          {weather.temperature}°C
                        </span>
                      </div>
                      {weather.humidity && (
                        <>
                          <div>습도: {weather.humidity}%</div>
                          <div className="text-right">
                            강수: {weather.precipitation || 0}%
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* 상세 내비게이션 옵션 */}
                {hasNavigation && (
                  <div className="rounded-lg bg-green-50 p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <Navigation className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        길찾기 옵션
                      </span>
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
