import { memo } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Brain, Star, Heart, DollarSign, Clock } from '@/components/icons'

const sortOptions = [
  {
    field: 'smart',
    label: 'AI 스마트 정렬',
    icon: Brain,
    description: '날씨, 평점, 인기도를 종합한 AI 추천',
  },
  {
    field: 'rating',
    label: '평점 높은 순',
    icon: Star,
    description: '별점이 높은 순서로',
  },
  {
    field: 'popularity',
    label: '인기 순',
    icon: Heart,
    description: '좋아요가 많은 순서로',
  },
  {
    field: 'price-low',
    label: '가격 낮은 순',
    icon: DollarSign,
    description: '저렴한 순서로',
  },
  {
    field: 'price-high',
    label: '가격 높은 순',
    icon: DollarSign,
    description: '비싼 순서로',
  },
  {
    field: 'recommended',
    label: '추천 순',
    icon: Clock,
    description: '기본 추천 순서',
  },
]

const SmartSorting = memo(({ currentSort, onSortChange, totalResults = 0 }) => {
  const currentOption =
    sortOptions.find((option) => option.field === currentSort) || sortOptions[0]

  const handleSortChange = (sortField) => {
    const selectedOption = sortOptions.find(
      (option) => option.field === sortField,
    )
    if (selectedOption) {
      onSortChange(selectedOption)
    }
  }

  return (
    <div className="weather-card p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="mb-1 text-lg font-semibold">정렬 방식</h3>
          <p className="text-sm text-gray-600">총 {totalResults}개의 결과</p>
        </div>

        <div className="flex items-center gap-3">
          {/* AI 정렬 빠른 선택 버튼 */}
          <Button
            variant={currentSort === 'smart' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSortChange('smart')}
            className="flex items-center gap-2"
          >
            <Brain className="h-4 w-4" />
            AI 추천
          </Button>

          {/* 전체 정렬 옵션 */}
          <Select value={currentSort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-48">
              <SelectValue>
                <div className="flex items-center gap-2">
                  <currentOption.icon className="h-4 w-4" />
                  {currentOption.label}
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="weather-card">
              {sortOptions.map((option) => {
                const Icon = option.icon
                return (
                  <SelectItem key={option.field} value={option.field}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-gray-500">
                          {option.description}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* AI 정렬 활성화 시 설명 */}
      {currentSort === 'smart' && (
        <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              AI 스마트 정렬 활성화
            </span>
          </div>
          <p className="mt-1 text-xs text-blue-600">
            현재 날씨 상황, 사용자 평점, 인기도를 종합하여 최적의 여행지를
            추천합니다.
          </p>
        </div>
      )}
    </div>
  )
})

SmartSorting.displayName = 'SmartSorting'

export default SmartSorting
