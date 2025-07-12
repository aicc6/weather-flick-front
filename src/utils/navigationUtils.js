/**
 * 네비게이션 관련 유틸리티 함수들
 */

/**
 * 지도 서비스별 네비게이션 URL 생성
 */
export const generateNavigationURL = (service, route) => {
  const {
    departure_lat,
    departure_lng,
    destination_lat,
    destination_lng,
    departure_name,
    destination_name,
  } = route

  // 좌표 유효성 검사
  if (
    !departure_lat ||
    !departure_lng ||
    !destination_lat ||
    !destination_lng
  ) {
    console.warn('네비게이션 URL 생성 실패: 좌표 정보가 부족합니다', route)
    return null
  }

  switch (service) {
    case 'google':
      // Google Maps 길찾기 URL
      return `https://maps.google.com/maps?saddr=${departure_lat},${departure_lng}&daddr=${destination_lat},${destination_lng}&dirflg=d`

    case 'kakao': {
      // 카카오맵 길찾기 URL
      const kakaoFrom = encodeURIComponent(departure_name || '출발지')
      const kakaoTo = encodeURIComponent(destination_name || '도착지')
      return `https://map.kakao.com/link/to/${kakaoTo},${destination_lat},${destination_lng}/from/${kakaoFrom},${departure_lat},${departure_lng}`
    }

    case 'naver':
      // 네이버맵 길찾기 URL
      return `https://map.naver.com/v5/directions/${departure_lng},${departure_lat},${encodeURIComponent(departure_name || '출발지')},,/${destination_lng},${destination_lat},${encodeURIComponent(destination_name || '도착지')},,/-/car`

    case 'apple':
      // Apple Maps (iOS Safari에서 작동)
      return `http://maps.apple.com/?saddr=${departure_lat},${departure_lng}&daddr=${destination_lat},${destination_lng}&dirflg=d`

    case 'tmap':
      // T맵 길찾기 URL (앱이 설치된 경우)
      return `tmap://route?goalname=${encodeURIComponent(destination_name || '도착지')}&goalx=${destination_lng}&goaly=${destination_lat}&startname=${encodeURIComponent(departure_name || '출발지')}&startx=${departure_lng}&starty=${departure_lat}`

    default:
      console.warn(`지원하지 않는 지도 서비스: ${service}`)
      return null
  }
}

/**
 * 사용자 환경에 따른 추천 지도 서비스 반환
 */
export const getRecommendedMapServices = () => {
  const userAgent = navigator.userAgent.toLowerCase()
  const isIOS = /iphone|ipad|ipod/.test(userAgent)
  const isAndroid = /android/.test(userAgent)
  const isMobile = isIOS || isAndroid

  const services = [
    {
      key: 'google',
      name: 'Google Maps',
      icon: '🗺️',
      description: '전세계 지도 서비스',
      availability: 'all',
    },
    {
      key: 'kakao',
      name: '카카오맵',
      icon: '🟡',
      description: '한국 지역 특화',
      availability: 'all',
    },
    {
      key: 'naver',
      name: '네이버맵',
      icon: '🟢',
      description: '한국 지역 특화',
      availability: 'all',
    },
  ]

  // 모바일 환경에서 추가 서비스
  if (isMobile) {
    services.push({
      key: 'tmap',
      name: 'T맵',
      icon: '🚗',
      description: '실시간 교통정보',
      availability: 'mobile',
    })
  }

  // iOS에서 Apple Maps 추가
  if (isIOS) {
    services.push({
      key: 'apple',
      name: 'Apple Maps',
      icon: '🍎',
      description: 'iOS 기본 지도',
      availability: 'ios',
    })
  }

  return services
}

/**
 * 네비게이션 앱 열기
 */
export const openNavigation = (service, route) => {
  const url = generateNavigationURL(service, route)

  if (!url) {
    console.error('네비게이션 URL 생성 실패')
    return false
  }

  try {
    // T맵의 경우 앱 스킴 시도 후 실패하면 웹으로 fallback
    if (service === 'tmap') {
      // 앱 설치 여부 확인을 위한 timeout 설정
      const timeout = setTimeout(() => {
        // T맵 앱이 없는 경우 웹 버전으로 리다이렉트
        window.open(
          `https://apis.openapi.sk.com/tmap/app/routes?startX=${route.departure_lng}&startY=${route.departure_lat}&endX=${route.destination_lng}&endY=${route.destination_lat}`,
          '_blank',
        )
      }, 2000)

      window.location.href = url

      // 앱이 열리면 timeout 취소
      window.addEventListener(
        'blur',
        () => {
          clearTimeout(timeout)
        },
        { once: true },
      )
    } else {
      // 다른 서비스들은 새 창으로 열기
      window.open(url, '_blank', 'noopener,noreferrer')
    }

    return true
  } catch (error) {
    console.error('네비게이션 앱 열기 실패:', error)
    return false
  }
}

/**
 * 좌표 유효성 검사
 */
export const validateCoordinates = (lat, lng) => {
  const latitude = parseFloat(lat)
  const longitude = parseFloat(lng)

  return (
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  )
}

/**
 * 거리 계산 (Haversine formula)
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371 // 지구 반지름 (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return distance
}
