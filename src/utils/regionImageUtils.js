// 지역 이미지 처리 유틸리티

/**
 * 지역명 정규화 (다양한 형태의 지역명을 표준화)
 * @param {string} regionName - 원본 지역명
 * @returns {string} 정규화된 지역명
 */
export const normalizeRegionName = (regionName) => {
  if (!regionName || typeof regionName !== 'string') {
    return ''
  }

  const normalized = regionName.trim()

  // 지역명 매핑 테이블
  const regionMappings = {
    '서울특별시': '서울',
    '서울시': '서울',
    '부산광역시': '부산',
    '부산시': '부산',
    '대구광역시': '대구',
    '대구시': '대구',
    '인천광역시': '인천',
    '인천시': '인천',
    '광주광역시': '광주',
    '광주시': '광주',
    '대전광역시': '대전',
    '대전시': '대전',
    '울산광역시': '울산',
    '울산시': '울산',
    '세종특별자치시': '세종',
    '세종시': '세종',
    '경기도': '경기',
    '강원특별자치도': '강원',
    '강원도': '강원',
    '충청북도': '충북',
    '충청남도': '충남',
    '전라북도': '전북',
    '전라남도': '전남',
    '경상북도': '경북',
    '경상남도': '경남',
    '제주특별자치도': '제주',
    '제주도': '제주'
  }

  return regionMappings[normalized] || normalized
}

/**
 * 지역별 키워드 생성 (이미지 검색용)
 * @param {string} regionName - 지역명
 * @returns {Array<string>} 검색 키워드 배열
 */
export const generateRegionKeywords = (regionName) => {
  const normalized = normalizeRegionName(regionName)
  
  const keywordMap = {
    '서울': ['seoul', 'korea', 'city', 'skyline', 'namsan', 'hangang', '한강', '남산'],
    '부산': ['busan', 'korea', 'beach', 'gwangalli', 'haeundae', '해운대', '광안리'],
    '제주': ['jeju', 'korea', 'island', 'nature', 'hallasan', '한라산', '성산일출봉'],
    '인천': ['incheon', 'korea', 'port', 'songdo', '송도', '차이나타운'],
    '대구': ['daegu', 'korea', 'city', 'traditional', '팔공산'],
    '대전': ['daejeon', 'korea', 'science', 'technology', '유성온천'],
    '광주': ['gwangju', 'korea', 'art', 'culture', '무등산'],
    '울산': ['ulsan', 'korea', 'industrial', 'coast', '태화강'],
    '세종': ['sejong', 'korea', 'administrative', 'new city', '행정도시'],
    '경기': ['gyeonggi', 'korea', 'seoul suburb', 'suwon', '수원', '화성'],
    '강원': ['gangwon', 'korea', 'mountain', 'ski', 'nature', '설악산', '강릉'],
    '충북': ['chungbuk', 'korea', 'mountain', 'traditional', '단양', '청주'],
    '충남': ['chungnam', 'korea', 'coast', 'traditional', '태안', '공주'],
    '전북': ['jeonbuk', 'korea', 'traditional', 'hanok', '전주', '한옥마을'],
    '전남': ['jeonnam', 'korea', 'coast', 'island', '순천', '여수'],
    '경북': ['gyeongbuk', 'korea', 'historical', 'temple', '경주', '안동'],
    '경남': ['gyeongnam', 'korea', 'coast', 'historical', '통영', '거제'],
    '경주': ['gyeongju', 'korea', 'historical', 'temple', 'bulguksa', '불국사'],
    '강릉': ['gangneung', 'korea', 'beach', 'coffee', 'ojukheon', '오죽헌'],
    '전주': ['jeonju', 'korea', 'hanok', 'traditional', 'bibimbap', '한옥마을'],
    '여수': ['yeosu', 'korea', 'port', 'night view', 'ocean', '밤바다']
  }

  const baseKeywords = keywordMap[normalized] || [normalized, 'korea', 'travel', 'beautiful']
  
  // 중복 제거 및 추가 키워드
  return [...new Set([...baseKeywords, 'landscape', 'tourism', 'destination'])]
}

/**
 * 이미지 URL 유효성 검사
 * @param {string} imageUrl - 검사할 이미지 URL
 * @returns {Promise<boolean>} 유효성 여부
 */
export const validateImageUrl = async (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return false
  }

  try {
    const response = await fetch(imageUrl, { method: 'HEAD' })
    return response.ok && response.headers.get('content-type')?.startsWith('image/')
  } catch (error) {
    return false
  }
}

/**
 * 여러 이미지 URL 중 유효한 것만 필터링
 * @param {Object} imageMap - 지역별 이미지 URL 객체
 * @returns {Promise<Object>} 유효한 이미지만 포함한 객체
 */
export const filterValidImages = async (imageMap) => {
  const validImageMap = {}
  
  const validationPromises = Object.entries(imageMap).map(async ([region, imageUrl]) => {
    const isValid = await validateImageUrl(imageUrl)
    return { region, imageUrl, isValid }
  })

  try {
    const results = await Promise.allSettled(validationPromises)
    
    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.isValid) {
        validImageMap[result.value.region] = result.value.imageUrl
      }
    })
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('이미지 유효성 검사 실패:', error)
    }
    // 검사 실패 시 원본 반환
    return imageMap
  }

  return validImageMap
}

/**
 * 지역별 캐시 키 생성
 * @param {string} regionName - 지역명
 * @param {string} source - 이미지 소스 ('static', 'tmap', 'fallback')
 * @returns {string} 캐시 키
 */
export const generateCacheKey = (regionName, source = 'default') => {
  const normalized = normalizeRegionName(regionName)
  return `region_image_${normalized}_${source}_${Date.now()}`
}

/**
 * 이미지 로딩 성능 모니터링
 * @param {string} regionName - 지역명
 * @param {string} source - 이미지 소스
 * @param {number} startTime - 시작 시간
 */
export const logImageLoadingPerformance = (regionName, source, startTime) => {
  if (!import.meta.env.DEV) return

  const endTime = performance.now()
  const loadTime = endTime - startTime
  
  console.log(`📊 이미지 로딩 성능 - ${regionName} (${source}): ${loadTime.toFixed(2)}ms`)
  
  // 성능 임계값 경고
  if (loadTime > 2000) {
    console.warn(`⚠️ 느린 이미지 로딩: ${regionName} - ${loadTime.toFixed(2)}ms`)
  }
}

/**
 * 지역 이미지 미리보기 URL 생성
 * @param {string} imageUrl - 원본 이미지 URL
 * @param {number} width - 미리보기 너비 (기본: 400)
 * @param {number} height - 미리보기 높이 (기본: 300)
 * @returns {string} 미리보기 이미지 URL
 */
export const generatePreviewImageUrl = (imageUrl, width = 400, height = 300) => {
  if (!imageUrl) return ''

  // Unsplash URL인 경우 크기 조정
  if (imageUrl.includes('unsplash.com')) {
    const url = new URL(imageUrl)
    url.searchParams.set('w', width.toString())
    url.searchParams.set('h', height.toString())
    url.searchParams.set('fit', 'crop')
    return url.toString()
  }

  // 기타 URL은 원본 반환
  return imageUrl
}

export default {
  normalizeRegionName,
  generateRegionKeywords,
  validateImageUrl,
  filterValidImages,
  generateCacheKey,
  logImageLoadingPerformance,
  generatePreviewImageUrl
}