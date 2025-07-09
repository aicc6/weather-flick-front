// 한국 여행지 고화질 이미지 서비스

/**
 * 지역별 실제 한국 여행지 이미지 가져오기
 * @param {string} region - 지역명 (한국어)
 * @returns {Promise<string>} 이미지 URL
 */
export const getRegionFirstImage = async (region) => {
  try {
    const imageUrl = KOREA_TRAVEL_IMAGES[region]
    console.log(`${region} 여행지 이미지:`, imageUrl)
    return imageUrl
  } catch (error) {
    console.error(`${region} 이미지 로드 실패:`, error)
    return FALLBACK_IMAGES[region] || null
  }
}

/**
 * 여러 지역의 이미지를 한 번에 가져오기
 * @param {Array<string>} regions - 지역명 배열
 * @returns {Promise<Object>} 지역별 이미지 URL 객체
 */
export const getMultipleRegionImages = async (regions) => {
  const imageMap = {}

  // 각 지역에 대해 즉시 이미지 URL 제공
  regions.forEach((region) => {
    imageMap[region] = KOREA_TRAVEL_IMAGES[region]
  })

  console.log('한국 여행지 이미지 맵:', imageMap)
  return imageMap
}

// 확실히 작동하는 고화질 한국 여행지 이미지들
const KOREA_TRAVEL_IMAGES = {
  제주도:
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&auto=format&q=80&ixlib=rb-4.0.3', // 제주 해변
  서울: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop&auto=format&q=80&ixlib=rb-4.0.3', // 서울 스카이라인
  부산: 'https://images.unsplash.com/photo-1536431311719-398b6704d4cc?w=800&h=600&fit=crop&auto=format&q=80&ixlib=rb-4.0.3', // 부산 광안리
  경주: 'https://images.unsplash.com/photo-1509909756405-be0199881695?w=800&h=600&fit=crop&auto=format&q=80&ixlib=rb-4.0.3', // 한국 전통 건물
  강릉: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&auto=format&q=80&ixlib=rb-4.0.3', // 동해안 바다
  여수: 'https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=800&h=600&fit=crop&auto=format&q=80&ixlib=rb-4.0.3', // 항구 야경
}

// 백업 이미지들 (고화질 대체 이미지)
const FALLBACK_IMAGES = {
  제주도:
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&auto=format&q=60',
  서울: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop&auto=format&q=60',
  부산: 'https://images.unsplash.com/photo-1536431311719-398b6704d4cc?w=800&h=600&fit=crop&auto=format&q=60',
  경주: 'https://images.unsplash.com/photo-1509909756405-be0199881695?w=800&h=600&fit=crop&auto=format&q=60',
  강릉: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&auto=format&q=60',
  여수: 'https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=800&h=600&fit=crop&auto=format&q=60',
}

export { FALLBACK_IMAGES }
