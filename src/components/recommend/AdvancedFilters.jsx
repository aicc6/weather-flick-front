import { useState, useCallback, memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ChevronDown, Filter, X, RefreshCw } from 'lucide-react'

const AdvancedFilters = memo(
  ({ filters, onFiltersChange, totalResults, onReset }) => {
    const [isOpen, setIsOpen] = useState(false)

    // 가격 범위 필터
    const handlePriceChange = useCallback(
      (value) => {
        onFiltersChange({
          ...filters,
          priceRange: value,
        })
      },
      [filters, onFiltersChange],
    )

    // 평점 필터
    const handleRatingChange = useCallback(
      (value) => {
        onFiltersChange({
          ...filters,
          minRating: value[0],
        })
      },
      [filters, onFiltersChange],
    )

    // 여행 스타일 토글
    const handleStyleToggle = useCallback(
      (style) => {
        const currentStyles = filters.travelStyles || []
        const newStyles = currentStyles.includes(style)
          ? currentStyles.filter((s) => s !== style)
          : [...currentStyles, style]

        onFiltersChange({
          ...filters,
          travelStyles: newStyles,
        })
      },
      [filters, onFiltersChange],
    )

    // 편의시설 토글
    const handleAmenityToggle = useCallback(
      (amenity) => {
        const currentAmenities = filters.amenities || []
        const newAmenities = currentAmenities.includes(amenity)
          ? currentAmenities.filter((a) => a !== amenity)
          : [...currentAmenities, amenity]

        onFiltersChange({
          ...filters,
          amenities: newAmenities,
        })
      },
      [filters, onFiltersChange],
    )

    // 여행 스타일 옵션
    const travelStyles = [
      { id: 'relaxed', label: '🧘‍♀️ 힐링', color: 'bg-green-100 text-green-800' },
      { id: 'adventure', label: '🏔️ 모험', color: 'bg-red-100 text-red-800' },
      { id: 'cultural', label: '🏛️ 문화', color: 'bg-blue-100 text-blue-800' },
      {
        id: 'gourmet',
        label: '🍽️ 미식',
        color: 'bg-yellow-100 text-yellow-800',
      },
      {
        id: 'romantic',
        label: '💕 로맨틱',
        color: 'bg-pink-100 text-pink-800',
      },
      {
        id: 'family',
        label: '👨‍👩‍👧‍👦 가족',
        color: 'bg-purple-100 text-purple-800',
      },
    ]

    // 편의시설 옵션
    const amenities = [
      { id: 'parking', label: '🅿️ 주차장' },
      { id: 'restaurant', label: '🍽️ 식당' },
      { id: 'wifi', label: '📶 무료 Wi-Fi' },
      { id: 'accessible', label: '♿ 접근성' },
      { id: 'petfriendly', label: '🐕 반려동물' },
      { id: 'photography', label: '📸 포토존' },
    ]

    // 활성 필터 개수 계산
    const activeFiltersCount = [
      filters.priceRange?.[0] > 0 || filters.priceRange?.[1] < 1000000,
      filters.minRating > 0,
      filters.travelStyles?.length > 0,
      filters.amenities?.length > 0,
      filters.weatherOptimized,
      filters.newlyAdded,
    ].filter(Boolean).length

    return (
      <Card className="weather-card">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Filter className="h-5 w-5" />
                  고급 필터
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">
                    {totalResults}개 결과
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="space-y-6">
              {/* 가격 범위 */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  가격 범위: {filters.priceRange?.[0]?.toLocaleString() || 0}원
                  - {filters.priceRange?.[1]?.toLocaleString() || 1000000}원
                </Label>
                <Slider
                  value={filters.priceRange || [0, 1000000]}
                  onValueChange={handlePriceChange}
                  max={1000000}
                  min={0}
                  step={50000}
                  className="w-full"
                />
              </div>

              {/* 최소 평점 */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  최소 평점: {filters.minRating || 0}점 이상
                </Label>
                <Slider
                  value={[filters.minRating || 0]}
                  onValueChange={handleRatingChange}
                  max={5}
                  min={0}
                  step={0.5}
                  className="w-full"
                />
              </div>

              {/* 여행 스타일 */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">여행 스타일</Label>
                <div className="flex flex-wrap gap-2">
                  {travelStyles.map((style) => {
                    const isSelected = filters.travelStyles?.includes(style.id)
                    return (
                      <Badge
                        key={style.id}
                        variant={isSelected ? 'default' : 'outline'}
                        className={`cursor-pointer transition-all hover:scale-105 ${
                          isSelected ? style.color : ''
                        }`}
                        onClick={() => handleStyleToggle(style.id)}
                      >
                        {style.label}
                        {isSelected && <X className="ml-1 h-3 w-3" />}
                      </Badge>
                    )
                  })}
                </div>
              </div>

              {/* 편의시설 */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">편의시설</Label>
                <div className="grid grid-cols-2 gap-2">
                  {amenities.map((amenity) => {
                    const isSelected = filters.amenities?.includes(amenity.id)
                    return (
                      <div
                        key={amenity.id}
                        className="flex items-center space-x-2"
                      >
                        <Switch
                          id={amenity.id}
                          checked={isSelected}
                          onCheckedChange={() =>
                            handleAmenityToggle(amenity.id)
                          }
                        />
                        <Label
                          htmlFor={amenity.id}
                          className="cursor-pointer text-sm"
                        >
                          {amenity.label}
                        </Label>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* 특별 옵션 */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">특별 옵션</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="weather-optimized"
                      checked={filters.weatherOptimized || false}
                      onCheckedChange={(checked) =>
                        onFiltersChange({
                          ...filters,
                          weatherOptimized: checked,
                        })
                      }
                    />
                    <Label
                      htmlFor="weather-optimized"
                      className="cursor-pointer text-sm"
                    >
                      🌤️ 날씨 최적화 추천
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="newly-added"
                      checked={filters.newlyAdded || false}
                      onCheckedChange={(checked) =>
                        onFiltersChange({ ...filters, newlyAdded: checked })
                      }
                    />
                    <Label
                      htmlFor="newly-added"
                      className="cursor-pointer text-sm"
                    >
                      ✨ 새로 추가된 코스
                    </Label>
                  </div>
                </div>
              </div>

              {/* 필터 리셋 버튼 */}
              <div className="flex justify-end border-t pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onReset}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  필터 초기화
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    )
  },
)

AdvancedFilters.displayName = 'AdvancedFilters'

export default AdvancedFilters
