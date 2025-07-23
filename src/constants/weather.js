// 날씨 관련 상수들
export const WEATHER_ICONS = {
  맑음: '☀️',
  구름조금: '🌤️',
  구름많음: '☁️',
  흐림: '☁️',
  비: '🌧️',
  눈: '🌨️',
  바람: '💨',
  안개: '🌫️',
  소나기: '🌦️',
  천둥번개: '⛈️',
  태풍: '🌪️',
  // 기본값
  default: '🌤️',
}

// 날씨 데이터 캐시 (메모리 캐시)
export const WEATHER_CACHE = new Map()

// 캐시 설정
export const CACHE_CONFIG = {
  // 캐시 만료 시간 (10분)
  EXPIRE_TIME: 10 * 60 * 1000,
  // 최대 캐시 항목 수
  MAX_ITEMS: 100,
}

// 캐시 유틸리티 함수들
export const weatherCacheUtils = {
  // 캐시 키 생성 (도시명 또는 좌표 기반)
  generateCacheKey: (cityOrLat, dateOrLon, date = null) => {
    // 좌표 기반 캐시 키 (lat, lon, date)
    if (typeof cityOrLat === 'number' && typeof dateOrLon === 'number') {
      const lat = Math.round(cityOrLat * 100) / 100  // 소수점 2자리로 반올림
      const lon = Math.round(dateOrLon * 100) / 100
      return `coords_${lat}_${lon}_${date || 'current'}`
    }
    // 도시명 기반 캐시 키 (city, date)
    return `${cityOrLat}_${dateOrLon}`
  },

  // 캐시에서 데이터 가져오기
  get: (key) => {
    const cached = WEATHER_CACHE.get(key)
    if (!cached) return null

    // 만료 시간 확인
    if (Date.now() - cached.timestamp > CACHE_CONFIG.EXPIRE_TIME) {
      WEATHER_CACHE.delete(key)
      return null
    }

    return cached.data
  },

  // 캐시에 데이터 저장
  set: (key, data) => {
    // 캐시 크기 제한
    if (WEATHER_CACHE.size >= CACHE_CONFIG.MAX_ITEMS) {
      // 가장 오래된 항목 제거
      const firstKey = WEATHER_CACHE.keys().next().value
      WEATHER_CACHE.delete(firstKey)
    }

    WEATHER_CACHE.set(key, {
      data,
      timestamp: Date.now(),
    })
  },

  // 캐시 초기화
  clear: () => {
    WEATHER_CACHE.clear()
  },

  // 만료된 캐시 정리
  cleanup: () => {
    const now = Date.now()
    for (const [key, value] of WEATHER_CACHE.entries()) {
      if (now - value.timestamp > CACHE_CONFIG.EXPIRE_TIME) {
        WEATHER_CACHE.delete(key)
      }
    }
  },
}

export const WEATHER_CONDITIONS = [
  '맑음',
  '구름조금',
  '구름많음',
  '흐림',
  '비',
  '눈',
  '바람',
  '안개',
  '소나기',
  '천둥번개',
]

export const CITY_WEATHER_DEFAULTS = {
  서울: { baseTemp: 22, condition: '맑음', offset: 0, precipitation: 10 },
  부산: { baseTemp: 25, condition: '구름조금', offset: 3, precipitation: 15 },
  제주: { baseTemp: 27, condition: '구름많음', offset: 5, precipitation: 20 },
  대구: { baseTemp: 23, condition: '맑음', offset: 1, precipitation: 8 },
  광주: { baseTemp: 24, condition: '구름조금', offset: 2, precipitation: 12 },
  강원: { baseTemp: 19, condition: '흐림', offset: -3, precipitation: 25 },
  인천: { baseTemp: 21, condition: '맑음', offset: 0, precipitation: 12 },
  대전: { baseTemp: 23, condition: '구름조금', offset: 1, precipitation: 10 },
  울산: { baseTemp: 24, condition: '구름조금', offset: 2, precipitation: 18 },
  경기: { baseTemp: 21, condition: '맑음', offset: 0, precipitation: 11 },
  충북: { baseTemp: 22, condition: '구름많음', offset: 0, precipitation: 14 },
  충남: { baseTemp: 22, condition: '구름조금', offset: 1, precipitation: 13 },
  전북: { baseTemp: 23, condition: '구름많음', offset: 1, precipitation: 16 },
  전남: { baseTemp: 24, condition: '구름조금', offset: 2, precipitation: 17 },
  경북: { baseTemp: 22, condition: '맑음', offset: 0, precipitation: 9 },
  경남: { baseTemp: 24, condition: '구름조금', offset: 2, precipitation: 19 },
}

export const TRANSPORT_ICONS = {
  bus: '🚌',
  subway: '🚇',
  train: '🚆',
  transit: '🚌',
  car: '🚗',
  walk: '🚶',
  bike: '🚴',
  taxi: '🚖',
  plane: '✈️',
  ship: '🚢',
  // 기본값
  default: '🚌',
}

// 날씨 상태에 따른 추천 메시지
export const WEATHER_RECOMMENDATIONS = {
  맑음: '햇빛이 강할 수 있으니 선크림과 모자를 준비하세요.',
  구름조금: '야외 활동하기 좋은 날씨입니다.',
  구름많음: '선선한 날씨로 산책하기 좋습니다.',
  흐림: '우산을 미리 준비해 두세요.',
  비: '우산과 우비를 꼭 챙기세요.',
  눈: '미끄러울 수 있으니 주의하세요.',
  바람: '바람이 강하니 겉옷을 준비하세요.',
  안개: '시야가 좋지 않을 수 있으니 주의하세요.',
  소나기: '갑작스런 비에 대비해 우산을 준비하세요.',
  천둥번개: '실내 활동을 권장합니다.',
}
