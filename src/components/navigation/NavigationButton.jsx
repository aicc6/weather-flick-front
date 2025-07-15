import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  ChevronDown,
  Navigation,
  Car,
  Bus,
  Footprints,
} from '@/components/icons'

/**
 * 내비게이션 버튼 컴포넌트
 * 2단계: 다중 지도 서비스 선택 + 교통수단별 옵션 제공
 */
export function NavigationButton({
  destination,
  showTransportOptions = true,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false)

  // 기본값 설정
  if (!destination) {
    return null
  }

  const { name, lat, lng, address } = destination

  // 필수 정보 확인 - place_id가 있으면 사용 가능
  if (!name && !destination.place_id) {
    return (
      <Button disabled variant="outline" size="sm" className={className}>
        <Navigation className="mr-1 h-3 w-3" />
        위치 정보 없음
      </Button>
    )
  }

  // 좌표 또는 place_id 중 하나는 있어야 함
  if (!lat && !lng && !destination.place_id) {
    return (
      <Button disabled variant="outline" size="sm" className={className}>
        <Navigation className="mr-1 h-3 w-3" />
        위치 정보 없음
      </Button>
    )
  }

  // 모바일 환경 감지
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

  // 지도 서비스별 URL 생성 함수들
  const getKakaoMapUrl = (_transportType = 'car') => {
    const encodedName = encodeURIComponent(
      name || destination.description || 'Unknown',
    )
    if (lat && lng) {
      // 카카오맵에서는 자동으로 현재 위치에서 출발하는 길찾기 제공
      return `https://map.kakao.com/link/to/${encodedName},${lat},${lng}`
    } else if (destination.place_id) {
      // place_id를 이용한 카카오맵 검색 (현재 위치에서 길찾기)
      return `https://map.kakao.com/link/search/${encodedName}`
    }
    return null
  }

  const getNaverMapUrl = (_transportType = 'car') => {
    const encodedName = encodeURIComponent(
      name || destination.description || 'Unknown',
    )
    const transportMap = {
      car: 'car',
      transit: 'transit',
      walk: 'walk',
    }
    const naverTransport = transportMap[_transportType] || 'car'
    if (lat && lng) {
      // 네이버맵에서는 자동으로 현재 위치에서 출발하는 길찾기 제공
      return `https://map.naver.com/v5/${naverTransport}/-/-/${lat},${lng},name=${encodedName}`
    } else if (destination.place_id) {
      // place_id를 이용한 네이버맵 검색 (현재 위치에서 길찾기)
      return `https://map.naver.com/v5/search/${encodedName}`
    }
    return null
  }

  const getGoogleMapsUrl = (transportType = 'car') => {
    const transportMap = {
      car: 'driving',
      transit: 'transit',
      walk: 'walking',
    }
    const googleTransport = transportMap[transportType] || 'driving'

    if (lat && lng) {
      return `https://www.google.com/maps/dir/?api=1&origin=current+location&destination=${lat},${lng}&travelmode=${googleTransport}`
    } else if (destination.place_id) {
      return `https://www.google.com/maps/dir/?api=1&origin=current+location&destination_place_id=${destination.place_id}&travelmode=${googleTransport}`
    } else if (name || destination.description) {
      const encodedName = encodeURIComponent(name || destination.description)
      return `https://www.google.com/maps/dir/?api=1&origin=current+location&destination=${encodedName}&travelmode=${googleTransport}`
    }
    return null
  }

  // 링크 열기 함수
  const openNavigation = (url, serviceName) => {
    if (!url) {
      console.error(`${serviceName} URL 생성 실패`)
      return
    }
    try {
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (error) {
      console.error(`${serviceName} 길찾기 열기 실패:`, error)
    }
  }

  // 지도 서비스 옵션
  const mapServices = [
    {
      name: '카카오맵',
      icon: '🗺️',
      color: 'bg-yellow-500 hover:bg-yellow-600',
      getUrl: getKakaoMapUrl,
      description: '국내 최적화',
    },
    {
      name: '네이버지도',
      icon: '🧭',
      color: 'bg-green-500 hover:bg-green-600',
      getUrl: getNaverMapUrl,
      description: '실시간 교통정보',
    },
    {
      name: 'Google Maps',
      icon: '📍',
      color: 'bg-blue-500 hover:bg-blue-600',
      getUrl: getGoogleMapsUrl,
      description: '글로벌 서비스',
    },
  ]

  // 교통수단 옵션
  const transportOptions = [
    {
      type: 'car',
      name: '자동차',
      icon: <Car className="h-4 w-4" />,
      color: 'text-blue-600',
    },
    {
      type: 'transit',
      name: '대중교통',
      icon: <Bus className="h-4 w-4" />,
      color: 'text-green-600',
    },
    {
      type: 'walk',
      name: '도보',
      icon: <Footprints className="h-4 w-4" />,
      color: 'text-gray-600',
    },
  ]

  // 간단한 길찾기 버튼 (교통수단 옵션 없음)
  if (!showTransportOptions) {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`${className} hover:bg-blue-50`}
          >
            <Navigation className="mr-1 h-3 w-3" />
            길찾기
            <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <div className="p-2">
            <div className="mb-2 text-xs font-medium text-gray-500">
              목적지: {name}
            </div>
            {address && (
              <div className="mb-3 line-clamp-2 text-xs text-gray-400">
                {address}
              </div>
            )}
          </div>
          <DropdownMenuSeparator />
          {mapServices.map((service) => (
            <DropdownMenuItem
              key={service.name}
              onClick={() => {
                openNavigation(service.getUrl(), service.name)
                setIsOpen(false)
              }}
              className="flex cursor-pointer items-center gap-3"
            >
              <span className="text-lg">{service.icon}</span>
              <div className="flex-1">
                <div className="font-medium">{service.name}</div>
                <div className="text-xs text-gray-500">
                  {service.description}
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // 고급 길찾기 버튼 (교통수단별 옵션 포함)
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`${className} hover:bg-blue-50`}
        >
          <Navigation className="mr-1 h-3 w-3" />
          길찾기
          <ChevronDown className="ml-1 h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="p-3">
          <div className="mb-1 text-sm font-medium text-gray-900">{name}</div>
          {address && (
            <div className="mb-3 line-clamp-2 text-xs text-gray-500">
              {address}
            </div>
          )}

          {/* 교통수단 선택 */}
          <div className="space-y-2">
            <div className="mb-2 text-xs font-medium text-gray-700">
              교통수단 선택
            </div>
            {transportOptions.map((transport) => (
              <div key={transport.type} className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <span className={transport.color}>{transport.icon}</span>
                  {transport.name}
                </div>
                <div className="ml-6 grid grid-cols-3 gap-1">
                  {mapServices.map((service) => (
                    <button
                      key={`${transport.type}-${service.name}`}
                      onClick={() => {
                        openNavigation(
                          service.getUrl(transport.type),
                          service.name,
                        )
                        setIsOpen(false)
                      }}
                      className="flex flex-col items-center gap-1 rounded p-2 text-xs transition-colors hover:bg-gray-50"
                    >
                      <span className="text-sm">{service.icon}</span>
                      <span className="text-xs leading-tight text-gray-600">
                        {service.name.replace('Maps', '')}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* 빠른 실행 (기본: 자동차 + 카카오맵) */}
        <div className="p-2">
          <button
            onClick={() => {
              openNavigation(getKakaoMapUrl('car'), '카카오맵')
              setIsOpen(false)
            }}
            className="flex w-full items-center justify-center gap-2 rounded bg-yellow-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-yellow-600"
          >
            <span>🗺️</span>
            카카오맵으로 빠른 길찾기
          </button>
        </div>

        {/* 추가 정보 */}
        <div className="border-t p-2">
          <div className="space-y-1 text-xs text-gray-500">
            <div>💡 교통수단에 따라 최적 경로가 제공됩니다</div>
            {isMobile && (
              <div>📱 모바일에서는 해당 앱이 자동으로 실행됩니다</div>
            )}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default NavigationButton
