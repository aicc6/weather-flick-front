import { memo } from 'react'
import { Button } from '@/components/ui/button'
import {
  Star,
  DollarSign,
  Heart,
  MapPin,
  Calendar,
  Users,
} from '@/components/icons'

const quickFilterOptions = [
  {
    id: 'high-rating',
    label: '고평점',
    icon: Star,
    description: '4.0점 이상',
  },
  {
    id: 'budget',
    label: '저예산',
    icon: DollarSign,
    description: '30만원 이하',
  },
  {
    id: 'popular',
    label: '인기',
    icon: Heart,
    description: '인기 급상승',
  },
  {
    id: 'nearby',
    label: '수도권',
    icon: MapPin,
    description: '서울/경기/인천',
  },
  {
    id: 'weekend',
    label: '주말여행',
    icon: Calendar,
    description: '2박 3일',
  },
  {
    id: 'family',
    label: '가족여행',
    icon: Users,
    description: '가족 친화적',
  },
]

const QuickFilters = memo(({ onFilterChange, activeFilters = [] }) => {
  const handleFilterToggle = (filterId) => {
    const isActive = activeFilters.includes(filterId)
    let newFilters

    if (isActive) {
      newFilters = activeFilters.filter((id) => id !== filterId)
    } else {
      newFilters = [...activeFilters, filterId]
    }

    onFilterChange(newFilters)
  }

  return (
    <div className="weather-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <h3 className="text-lg font-semibold">빠른 필터</h3>
        {activeFilters.length > 0 && (
          <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
            {activeFilters.length}개 적용
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {quickFilterOptions.map((option) => {
          const Icon = option.icon
          const isActive = activeFilters.includes(option.id)

          return (
            <Button
              key={option.id}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterToggle(option.id)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              <span>{option.label}</span>
              <span className="hidden text-xs opacity-75 sm:inline">
                {option.description}
              </span>
            </Button>
          )
        })}
      </div>
      {activeFilters.length > 0 && (
        <div className="mt-3 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFilterChange([])}
            className="text-gray-500"
          >
            모두 해제
          </Button>
        </div>
      )}
    </div>
  )
})

QuickFilters.displayName = 'QuickFilters'

export default QuickFilters
