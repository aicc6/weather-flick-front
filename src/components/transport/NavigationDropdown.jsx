import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Navigation } from '@/components/icons'
import {
  getRecommendedMapServices,
  openNavigation,
  validateCoordinates,
} from '@/utils/navigationUtils'

/**
 * 네비게이션 드롭다운 컴포넌트
 * 여러 지도 서비스로 길찾기를 시작할 수 있는 드롭다운 메뉴
 */
export function NavigationDropdown({
  route,
  size = 'default',
  variant = 'outline',
  className = '',
  disabled = false,
}) {
  const [isLoading, setIsLoading] = useState(false)

  // 좌표 유효성 검사
  const hasValidCoordinates =
    validateCoordinates(route?.departure_lat, route?.departure_lng) &&
    validateCoordinates(route?.destination_lat, route?.destination_lng)

  // 사용 가능한 지도 서비스 목록
  const mapServices = getRecommendedMapServices()

  const handleNavigationClick = async (service) => {
    if (!hasValidCoordinates) {
      toast.error('경로 정보가 올바르지 않습니다', {
        description: '출발지와 도착지 좌표를 확인해주세요',
        duration: 3000,
      })
      return
    }

    setIsLoading(true)

    try {
      const success = openNavigation(service.key, route)

      if (success) {
        toast.success(`${service.name}에서 길찾기를 시작합니다`, {
          description: `${route.departure_name || '출발지'} → ${route.destination_name || '도착지'}`,
          duration: 3000,
        })
      } else {
        toast.error('길찾기 실행에 실패했습니다', {
          description: '잠시 후 다시 시도해주세요',
          duration: 3000,
        })
      }
    } catch (error) {
      console.error('Navigation error:', error)
      toast.error('길찾기 실행 중 오류가 발생했습니다', {
        description: error.message || '알 수 없는 오류입니다',
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!hasValidCoordinates) {
    return (
      <Button
        variant="outline"
        size={size}
        disabled={true}
        className={`opacity-50 ${className}`}
      >
        <Navigation className="mr-2 h-4 w-4" />
        길찾기 불가
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={disabled || isLoading}
          className={className}
        >
          <Navigation className="mr-2 h-4 w-4" />
          {isLoading ? '연결 중...' : '길찾기'}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            지도 앱 선택
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {route.departure_name || '출발지'} →{' '}
            {route.destination_name || '도착지'}
          </p>
        </div>

        <DropdownMenuSeparator />

        {mapServices.map((service) => (
          <DropdownMenuItem
            key={service.key}
            onClick={() => handleNavigationClick(service)}
            className="flex cursor-pointer items-center justify-between"
          >
            <div className="flex items-center">
              <span className="mr-2 text-lg">{service.icon}</span>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{service.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {service.description}
                </span>
              </div>
            </div>

            {service.availability === 'mobile' && (
              <Badge variant="secondary" className="text-xs">
                모바일
              </Badge>
            )}
            {service.availability === 'ios' && (
              <Badge variant="secondary" className="text-xs">
                iOS
              </Badge>
            )}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <div className="px-2 py-1.5">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            💡 클릭하면 해당 지도 앱에서 길찾기가 시작됩니다
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default NavigationDropdown
