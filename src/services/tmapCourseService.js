// Tmap API를 활용한 동적 여행 코스 생성 서비스

import { getRegionCoordinates, getTouristAttractions } from './tmapService.js'
import { normalizeRegionName, generateRegionKeywords } from '@/utils/regionImageUtils.js'

/**
 * Tmap 기반 여행 코스 생성 설정
 */
const COURSE_CONFIG = {
  defaultDuration: '2박 3일',
  defaultRating: 4.2,
  poisPerDay: 3, // 하루당 방문할 관광지 수
  maxSearchRadius: 15000, // 최대 검색 반경 (미터)
  themes: {
    nature: ['자연', '산', '바다', '공원', '숲'],
    culture: ['문화', '박물관', '전시관', '예술', '공연'],
    history: ['역사', '유적', '전통', '고궁', '사찰'],
    food: ['맛집', '전통음식', '카페', '시장'],
    activity: ['체험', '액티비티', '놀이', '스포츠']
  }
}

/**
 * 지역별 관광지 POI 검색 및 분류
 * @param {string} regionName - 지역명
 * @param {string} theme - 테마 ('nature', 'culture', 'history', 'food', 'activity')
 * @returns {Promise<Array>} 분류된 POI 목록
 */
export const searchRegionPOIs = async (regionName, theme = 'all') => {
  try {
    // 1. 지역 좌표 획득
    const coordinates = await getRegionCoordinates(regionName)
    if (!coordinates) {
      throw new Error(`${regionName} 좌표를 찾을 수 없습니다`)
    }

    // 2. 주변 관광지 검색
    const attractions = await getTouristAttractions(
      coordinates.lat, 
      coordinates.lng, 
      COURSE_CONFIG.maxSearchRadius
    )

    if (attractions.length === 0) {
      return generateFallbackPOIs(regionName, theme)
    }

    // 3. 테마별 POI 분류 및 필터링
    const categorizedPOIs = categorizePOIsByTheme(attractions, theme)
    
    // 4. POI 데이터 정규화
    const normalizedPOIs = categorizedPOIs.map(poi => normalizePOIData(poi, regionName))

    if (import.meta.env.DEV) {
      console.log(`${regionName} POI 검색 결과:`, {
        total: attractions.length,
        categorized: categorizedPOIs.length,
        theme
      })
    }

    return normalizedPOIs

  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(`${regionName} POI 검색 실패:`, error)
    }
    return generateFallbackPOIs(regionName, theme)
  }
}

/**
 * POI를 테마별로 분류
 * @param {Array} pois - 원본 POI 목록
 * @param {string} theme - 필터링할 테마
 * @returns {Array} 분류된 POI 목록
 */
const categorizePOIsByTheme = (pois, theme) => {
  if (theme === 'all') {
    return pois
  }

  const themeKeywords = COURSE_CONFIG.themes[theme] || []
  
  return pois.filter(poi => {
    const searchText = `${poi.name} ${poi.bizCatTcode} ${poi.middleBizCateNm}`.toLowerCase()
    
    return themeKeywords.some(keyword => 
      searchText.includes(keyword.toLowerCase()) ||
      poi.name.includes(keyword)
    )
  })
}

/**
 * POI 데이터를 여행 코스 형태로 정규화
 * @param {Object} poi - 원본 POI 데이터
 * @param {string} regionName - 지역명
 * @returns {Object} 정규화된 POI 데이터
 */
const normalizePOIData = (poi, regionName) => {
  return {
    id: `tmap_poi_${poi.id || Math.random().toString(36).substr(2, 9)}`,
    name: poi.name || '관광지',
    address: poi.fullAddress || poi.address || '',
    coordinates: {
      lat: parseFloat(poi.noorLat),
      lng: parseFloat(poi.noorLon)
    },
    category: poi.middleBizCateNm || poi.bizCatTcode || '관광',
    description: generatePOIDescription(poi, regionName),
    estimatedTime: estimateVisitTime(poi),
    tips: generatePOITips(poi),
    rating: generatePOIRating(),
    region: regionName
  }
}

/**
 * POI 설명 자동 생성
 * @param {Object} poi - POI 데이터
 * @param {string} regionName - 지역명
 * @returns {string} 생성된 설명
 */
const generatePOIDescription = (poi, regionName) => {
  const category = poi.middleBizCateNm || poi.bizCatTcode || '관광지'
  const templates = [
    `${regionName}의 대표적인 ${category}로, 많은 방문객들이 찾는 인기 장소입니다.`,
    `${poi.name}은(는) ${regionName} 지역의 특색을 잘 보여주는 ${category}입니다.`,
    `${regionName} 여행 시 꼭 방문해야 할 ${category} 중 하나입니다.`
  ]
  
  return templates[Math.floor(Math.random() * templates.length)]
}

/**
 * POI 방문 소요시간 추정
 * @param {Object} poi - POI 데이터
 * @returns {string} 추정 소요시간
 */
const estimateVisitTime = (poi) => {
  const category = poi.middleBizCateNm || poi.bizCatTcode || ''
  
  const timeMap = {
    '박물관': '1-2시간',
    '공원': '2-3시간',
    '사찰': '1시간',
    '맛집': '1시간',
    '카페': '30분',
    '전시관': '1-2시간',
    '체험': '2-3시간'
  }
  
  for (const [key, time] of Object.entries(timeMap)) {
    if (category.includes(key)) {
      return time
    }
  }
  
  return '1-2시간'
}

/**
 * POI 팁 자동 생성
 * @param {Object} poi - POI 데이터
 * @returns {Array} 생성된 팁 목록
 */
const generatePOITips = (poi) => {
  const tips = [
    '미리 운영시간을 확인하고 방문하세요',
    '대중교통 이용 시 길찾기 앱을 활용하세요',
    '사진 촬영 시 다른 방문객을 배려해주세요'
  ]
  
  const category = poi.middleBizCateNm || ''
  
  if (category.includes('박물관') || category.includes('전시')) {
    tips.push('전시 해설 프로그램이 있는지 확인해보세요')
  }
  
  if (category.includes('맛집') || category.includes('음식')) {
    tips.push('점심시간에는 대기가 있을 수 있어요')
  }
  
  return tips.slice(0, 2) // 최대 2개까지
}

/**
 * POI 평점 생성 (실제 리뷰 데이터가 없으므로 임의 생성)
 * @returns {number} 생성된 평점 (3.5-4.8 범위)
 */
const generatePOIRating = () => {
  return Math.round((Math.random() * 1.3 + 3.5) * 10) / 10
}

/**
 * Tmap API 실패 시 fallback POI 생성
 * @param {string} regionName - 지역명
 * @param {string} theme - 테마
 * @returns {Array} 생성된 fallback POI 목록
 */
const generateFallbackPOIs = (regionName, theme) => {
  const normalizedRegion = normalizeRegionName(regionName)
  const keywords = generateRegionKeywords(normalizedRegion)
  
  const fallbackPOIs = [
    {
      id: `fallback_${normalizedRegion}_1`,
      name: `${normalizedRegion} 대표 관광지`,
      address: `${regionName} 일대`,
      coordinates: { lat: 37.5665, lng: 126.9780 }, // 기본 좌표 (서울)
      category: '관광',
      description: `${regionName}의 아름다운 풍경을 감상할 수 있는 대표적인 관광지입니다.`,
      estimatedTime: '2-3시간',
      tips: ['사전 예약을 권장합니다', '편안한 신발을 착용하세요'],
      rating: 4.3,
      region: regionName
    },
    {
      id: `fallback_${normalizedRegion}_2`,
      name: `${normalizedRegion} 문화체험관`,
      address: `${regionName} 중심가`,
      coordinates: { lat: 37.5665, lng: 126.9780 },
      category: '문화',
      description: `${regionName}의 역사와 문화를 체험할 수 있는 특별한 공간입니다.`,
      estimatedTime: '1-2시간',
      tips: ['문화해설사 프로그램을 이용해보세요', '기념품을 구매할 수 있어요'],
      rating: 4.1,
      region: regionName
    }
  ]
  
  if (import.meta.env.DEV) {
    console.log(`${regionName} fallback POI 생성:`, fallbackPOIs.length, '개')
  }
  
  return fallbackPOIs
}

/**
 * POI 목록을 기반으로 여행 코스 생성
 * @param {string} regionName - 지역명
 * @param {Object} options - 코스 생성 옵션
 * @returns {Promise<Object>} 생성된 여행 코스
 */
export const generateTravelCourse = async (regionName, options = {}) => {
  const {
    theme = 'all',
    duration = '2박 3일',
    difficulty = 'easy'
  } = options

  try {
    // 1. 지역 POI 검색
    const pois = await searchRegionPOIs(regionName, theme)
    
    if (pois.length === 0) {
      throw new Error(`${regionName}에서 POI를 찾을 수 없습니다`)
    }

    // 2. POI를 하루별로 그룹화
    const dailyItinerary = groupPOIsByDay(pois, duration)
    
    // 3. 여행 코스 메타데이터 생성
    const courseMetadata = generateCourseMetadata(regionName, theme, pois)
    
    // 4. 최종 코스 데이터 구성
    const travelCourse = {
      id: `tmap_course_${regionName}_${Date.now()}`,
      title: `${regionName} ${getThemeDisplayName(theme)} 여행`,
      subtitle: `${regionName}의 매력을 느낄 수 있는 특별한 여행`,
      region: regionName,
      duration,
      theme: [theme === 'all' ? '관광' : getThemeDisplayName(theme)],
      mainImage: `https://source.unsplash.com/800x600/?${encodeURIComponent(regionName)},korea,travel`,
      images: generateCourseImages(regionName, pois),
      rating: calculateAverageRating(pois),
      reviewCount: Math.floor(Math.random() * 50) + 10,
      likeCount: Math.floor(Math.random() * 200) + 50,
      viewCount: Math.floor(Math.random() * 1000) + 200,
      price: '문의',
      bestMonths: getBestMonthsForRegion(regionName),
      summary: courseMetadata.summary,
      description: courseMetadata.description,
      highlights: courseMetadata.highlights,
      itinerary: dailyItinerary,
      tips: courseMetadata.tips,
      includes: ['전문 가이드', '주요 입장료', '지역 특산품 시식'],
      excludes: ['개인 식비', '교통비', '개인 쇼핑'],
      tags: generateCourseTags(regionName, theme),
      source: 'tmap_generated' // Tmap으로 생성된 코스임을 표시
    }

    if (import.meta.env.DEV) {
      console.log(`${regionName} 여행 코스 생성 완료:`, {
        poisCount: pois.length,
        daysCount: dailyItinerary.length,
        theme
      })
    }

    return travelCourse

  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(`${regionName} 여행 코스 생성 실패:`, error)
    }
    throw error
  }
}

/**
 * POI를 하루별로 그룹화하여 일정 생성
 * @param {Array} pois - POI 목록
 * @param {string} duration - 여행 기간
 * @returns {Array} 일별 일정 배열
 */
const groupPOIsByDay = (pois, duration) => {
  const days = parseInt(duration) || 2
  const poisPerDay = COURSE_CONFIG.poisPerDay
  const itinerary = []
  
  for (let day = 1; day <= days; day++) {
    const startIndex = (day - 1) * poisPerDay
    const endIndex = Math.min(startIndex + poisPerDay, pois.length)
    const dayPOIs = pois.slice(startIndex, endIndex)
    
    if (dayPOIs.length > 0) {
      itinerary.push({
        day,
        title: `${day}일차`,
        places: dayPOIs,
        summary: `${dayPOIs.length}개의 특별한 장소를 방문합니다`,
        totalTime: `약 ${dayPOIs.length * 2}시간`
      })
    }
  }
  
  return itinerary
}

/**
 * 코스 메타데이터 생성
 * @param {string} regionName - 지역명
 * @param {string} theme - 테마
 * @param {Array} pois - POI 목록
 * @returns {Object} 메타데이터
 */
const generateCourseMetadata = (regionName, theme, pois) => {
  const themeDisplayName = getThemeDisplayName(theme)
  
  return {
    summary: `${regionName}의 ${themeDisplayName} 명소들을 둘러보는 알찬 여행 코스입니다.`,
    description: `${regionName}을 대표하는 ${pois.length}개의 특별한 장소를 방문하여 지역의 매력을 온전히 느낄 수 있는 여행입니다. 각 장소마다 특별한 이야기와 체험이 기다리고 있어요.`,
    highlights: [
      `${regionName} 대표 명소 ${pois.length}곳 방문`,
      '지역 전문가가 추천하는 숨은 맛집',
      '포토존에서 인생샷 촬영',
      '지역 특산품 체험 및 구매'
    ],
    tips: [
      '편안한 걷기 신발을 준비하세요',
      '날씨에 맞는 옷차림을 권장합니다',
      '현지 교통편을 미리 확인해주세요',
      '주요 관광지의 운영시간을 체크하세요'
    ]
  }
}

/**
 * 테마 표시명 반환
 * @param {string} theme - 테마 코드
 * @returns {string} 표시명
 */
const getThemeDisplayName = (theme) => {
  const themeNames = {
    nature: '자연',
    culture: '문화',
    history: '역사',
    food: '맛집',
    activity: '액티비티',
    all: '관광'
  }
  
  return themeNames[theme] || '관광'
}

/**
 * 평균 평점 계산
 * @param {Array} pois - POI 목록
 * @returns {number} 평균 평점
 */
const calculateAverageRating = (pois) => {
  if (pois.length === 0) return COURSE_CONFIG.defaultRating
  
  const totalRating = pois.reduce((sum, poi) => sum + (poi.rating || 4.0), 0)
  return Math.round((totalRating / pois.length) * 10) / 10
}

/**
 * 지역별 최적 여행 월 생성
 * @param {string} regionName - 지역명
 * @returns {Array} 최적 월 배열
 */
const getBestMonthsForRegion = (regionName) => {
  const seasonalRegions = {
    '제주': [3, 4, 5, 9, 10, 11],
    '강원': [6, 7, 8, 12, 1, 2], // 여름/겨울 모두 좋음
    '부산': [4, 5, 6, 9, 10, 11],
    '경주': [3, 4, 5, 9, 10, 11]
  }
  
  const normalizedRegion = normalizeRegionName(regionName)
  return seasonalRegions[normalizedRegion] || [3, 4, 5, 9, 10, 11] // 기본: 봄/가을
}

/**
 * 코스 이미지 목록 생성
 * @param {string} regionName - 지역명
 * @param {Array} pois - POI 목록
 * @returns {Array} 이미지 URL 배열
 */
const generateCourseImages = (regionName, pois) => {
  const images = [
    `https://source.unsplash.com/800x600/?${encodeURIComponent(regionName)},korea,travel`,
    `https://source.unsplash.com/800x600/?${encodeURIComponent(regionName)},korea,landscape`,
    `https://source.unsplash.com/800x600/?${encodeURIComponent(regionName)},korea,culture`
  ]
  
  // POI별 이미지 추가 (최대 3개)
  pois.slice(0, 3).forEach((poi, index) => {
    images.push(`https://source.unsplash.com/800x600/?${encodeURIComponent(poi.name)},korea`)
  })
  
  return images.slice(0, 6) // 최대 6개 이미지
}

/**
 * 코스 태그 생성
 * @param {string} regionName - 지역명
 * @param {string} theme - 테마
 * @returns {Array} 태그 배열
 */
const generateCourseTags = (regionName, theme) => {
  const baseTags = [regionName, '국내여행', '가족여행']
  const themeTag = getThemeDisplayName(theme)
  
  if (themeTag !== '관광') {
    baseTags.push(themeTag)
  }
  
  return baseTags
}

/**
 * 여러 지역의 여행 코스를 일괄 생성
 * @param {Array} regionNames - 지역명 배열
 * @param {Object} options - 생성 옵션
 * @returns {Promise<Array>} 생성된 코스 목록
 */
export const generateMultipleCourses = async (regionNames, options = {}) => {
  const courses = []
  
  const promises = regionNames.map(async (regionName) => {
    try {
      const course = await generateTravelCourse(regionName, options)
      return { regionName, course, success: true }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(`${regionName} 코스 생성 실패:`, error)
      }
      return { regionName, error: error.message, success: false }
    }
  })
  
  const results = await Promise.allSettled(promises)
  
  results.forEach((result) => {
    if (result.status === 'fulfilled' && result.value.success) {
      courses.push(result.value.course)
    }
  })
  
  if (import.meta.env.DEV) {
    console.log('일괄 코스 생성 완료:', {
      total: regionNames.length,
      success: courses.length,
      failed: regionNames.length - courses.length
    })
  }
  
  return courses
}

export default {
  searchRegionPOIs,
  generateTravelCourse,
  generateMultipleCourses
}