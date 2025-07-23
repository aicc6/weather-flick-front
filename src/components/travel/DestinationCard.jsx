import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Heart, Bookmark, MapPin, Star } from '@/components/icons'
import {
  useAddDestinationLikeMutation,
  useRemoveDestinationLikeMutation,
  useAddDestinationSaveMutation,
  useRemoveDestinationSaveMutation,
} from '@/store/api/destinationLikesSavesApi'
import { useAuth } from '@/contexts/AuthContextRTK'
import { NavigationButton } from '@/components/navigation'

/**
 * 여행지 카드 컴포넌트
 * 여행지 정보, 좋아요, 저장(북마크) 기능을 포함
 */
export function DestinationCard({
  destination,
  className = '',
  showStats = true,
  onRefresh = null,
}) {
  const { user } = useAuth()
  const [isLiking, setIsLiking] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // API mutations
  const [addLike] = useAddDestinationLikeMutation()
  const [removeLike] = useRemoveDestinationLikeMutation()
  const [addSave] = useAddDestinationSaveMutation()
  const [removeSave] = useRemoveDestinationSaveMutation()

  if (!destination) return null

  // 좋아요 토글
  const handleLikeToggle = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      toast.error('로그인이 필요한 기능입니다.')
      return
    }

    if (isLiking) return

    setIsLiking(true)
    try {
      if (destination.is_liked) {
        await removeLike(destination.destination_id).unwrap()
        toast.success('좋아요를 취소했습니다.')
      } else {
        await addLike({ destination_id: destination.destination_id }).unwrap()
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

    if (isSaving) return

    setIsSaving(true)
    try {
      if (destination.is_saved) {
        await removeSave(destination.destination_id).unwrap()
        toast.success('저장을 취소했습니다.')
      } else {
        await addSave({ destination_id: destination.destination_id }).unwrap()
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

  // 위치 정보 추출
  const getLocationInfo = () => {
    const lat = destination.latitude
    const lng = destination.longitude
    return lat && lng && !isNaN(lat) && !isNaN(lng)
      ? { lat: Number(lat), lng: Number(lng) }
      : null
  }

  const locationInfo = getLocationInfo()

  return (
    <Card
      className={`overflow-hidden transition-shadow hover:shadow-lg ${className}`}
    >
      {/* 이미지 섹션 */}
      <div className="relative h-48 overflow-hidden">
        {destination.image_url ? (
          <img
            src={destination.image_url}
            alt={destination.name}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
            onError={(e) => {
              // 이미지 로드 실패 시 플레이스홀더 표시
              e.target.onerror = null
              e.target.style.display = 'none'
              e.target.parentElement.innerHTML = `
                <div class="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20">
                  <div class="text-center">
                    <div class="mb-2 text-4xl">🏞️</div>
                    <div class="text-sm font-medium text-gray-600 dark:text-gray-400">
                      ${destination.province || '여행지'}
                    </div>
                  </div>
                </div>
              `
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20">
            <div className="text-center">
              <div className="mb-2 text-4xl">🏞️</div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {destination.province || '여행지'}
              </div>
            </div>
          </div>
        )}
        {/* 좋아요/저장 버튼 오버레이 */}
        <div className="absolute top-3 right-3 flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full bg-white/90 shadow-md hover:bg-white"
            onClick={handleLikeToggle}
            disabled={isLiking}
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                destination.is_liked
                  ? 'fill-red-500 text-red-500'
                  : 'text-gray-600'
              }`}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full bg-white/90 shadow-md hover:bg-white"
            onClick={handleSaveToggle}
            disabled={isSaving}
          >
            <Bookmark
              className={`h-4 w-4 transition-colors ${
                destination.is_saved
                  ? 'fill-blue-500 text-blue-500'
                  : 'text-gray-600'
              }`}
            />
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        {/* 여행지 기본 정보 */}
        <div className="mb-3">
          <h3 className="mb-1 text-lg font-semibold text-gray-900">
            {destination.name}
          </h3>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <MapPin className="h-3 w-3" />
            <span>
              {destination.province}
              {destination.region && ` · ${destination.region}`}
            </span>
          </div>
        </div>

        {/* 카테고리 및 태그 */}
        <div className="mb-3 flex flex-wrap gap-1">
          {destination.category && (
            <Badge variant="secondary" className="text-xs">
              {destination.category}
            </Badge>
          )}
          {destination.is_indoor && (
            <Badge variant="outline" className="text-xs">
              실내
            </Badge>
          )}
          {destination.tags && Array.isArray(destination.tags) && (
            <>
              {destination.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </>
          )}
        </div>

        {/* 평점 및 통계 */}
        {showStats && (
          <div className="mb-3 flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              {destination.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">
                    {destination.rating.toFixed(1)}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1 text-gray-500">
                <Heart className="h-3 w-3" />
                <span>{destination.likes_count || 0}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <Bookmark className="h-3 w-3" />
                <span>{destination.saves_count || 0}</span>
              </div>
            </div>
          </div>
        )}

        {/* 내비게이션 버튼 */}
        {locationInfo && (
          <NavigationButton
            destination={{
              name: destination.name,
              lat: locationInfo.lat,
              lng: locationInfo.lng,
              address: `${destination.province} ${destination.region || ''}`,
            }}
            showTransportOptions={false}
            className="w-full"
          />
        )}
      </CardContent>
    </Card>
  )
}

export default DestinationCard
