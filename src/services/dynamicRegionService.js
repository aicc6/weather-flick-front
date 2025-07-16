// 동적 지역 감지 및 코스 생성 서비스
// 전국 244개 지역 중 어떤 지역이든 요청 시 자동 생성

import { getAllRegionsFlat, REGION_TOURISM_INFO } from '@/data/koreaRegions'
import { generateTravelCourse } from './tmapCourseService'
import { checkTmapApiStatus } from './tmapService'

/**
 * 동적 지역 코스 생성 캐시 (메모리 기반)
 */
const GENERATED_COURSE_CACHE = new Map()
const CACHE_EXPIRY_TIME = 30 * 60 * 1000 // 30분

/**
 * 요청된 지역이 지원 가능한지 확인
 * @param {string} regionIdentifier - 지역 코드 또는 지역명
 * @returns {Object} { isSupported, regionCode, regionName, suggestions }
 */
export const checkRegionSupport = (regionIdentifier) => {
  const allRegions = getAllRegionsFlat()

  // 정확한 매칭 시도
  let matchedRegion = allRegions.find(
    (region) =>
      region.code === regionIdentifier ||
      region.name === regionIdentifier ||
      region.shortName === regionIdentifier ||
      region.fullName === regionIdentifier,
  )

  if (matchedRegion) {
    return {
      isSupported: true,
      regionCode: matchedRegion.code,
      regionName: matchedRegion.shortName || matchedRegion.name,
      exact: true,
      suggestions: [],
    }
  }

  // 유사 지역명 검색 (부분 매칭)
  const similarRegions = allRegions
    .filter(
      (region) =>
        region.name.includes(regionIdentifier) ||
        region.shortName?.includes(regionIdentifier) ||
        regionIdentifier.includes(region.name) ||
        regionIdentifier.includes(region.shortName || ''),
    )
    .slice(0, 5) // 최대 5개 제안

  if (similarRegions.length > 0) {
    return {
      isSupported: true,
      regionCode: similarRegions[0].code,
      regionName: similarRegions[0].shortName || similarRegions[0].name,
      exact: false,
      suggestions: similarRegions.map((r) => ({
        code: r.code,
        name: r.shortName || r.name,
        fullName: r.fullName,
      })),
    }
  }

  // 지원하지 않는 지역
  return {
    isSupported: false,
    regionCode: null,
    regionName: null,
    exact: false,
    suggestions: getPopularRegionSuggestions(),
  }
}

/**
 * 인기 지역 추천
 * @returns {Array} 인기 지역 목록
 */
const getPopularRegionSuggestions = () => {
  return [
    { code: 'jeju', name: '제주', fullName: '제주 제주시' },
    { code: 'busan', name: '부산', fullName: '부산광역시' },
    { code: 'seoul', name: '서울', fullName: '서울특별시' },
    { code: 'gyeongju', name: '경주', fullName: '경북 경주시' },
    { code: 'jeonju', name: '전주', fullName: '전북 전주시' },
  ]
}

/**
 * 동적 지역 코스 생성 (캐시 포함)
 * @param {string} regionIdentifier - 지역 식별자
 * @param {Object} options - 생성 옵션
 * @returns {Promise<Object>} 생성된 코스 또는 에러 정보
 */
export const generateRegionCourse = async (regionIdentifier, options = {}) => {
  try {
    // 1. 지역 지원 여부 확인
    const regionInfo = checkRegionSupport(regionIdentifier)

    if (!regionInfo.isSupported) {
      return {
        success: false,
        error: 'UNSUPPORTED_REGION',
        message: `${regionIdentifier} 지역은 현재 지원하지 않습니다.`,
        suggestions: regionInfo.suggestions,
      }
    }

    const { regionCode, regionName } = regionInfo
    const cacheKey = `${regionCode}_${JSON.stringify(options)}`

    // 2. 캐시 확인
    if (GENERATED_COURSE_CACHE.has(cacheKey)) {
      const cached = GENERATED_COURSE_CACHE.get(cacheKey)
      const now = Date.now()

      if (now - cached.timestamp < CACHE_EXPIRY_TIME) {
        if (import.meta.env.DEV) {
          console.log(`캐시에서 ${regionName} 코스 반환`)
        }
        return {
          success: true,
          course: cached.course,
          fromCache: true,
          regionInfo,
        }
      } else {
        // 만료된 캐시 제거
        GENERATED_COURSE_CACHE.delete(cacheKey)
      }
    }

    // 3. API 상태 확인
    const apiAvailable = await checkTmapApiStatus()

    // 4. 지역 특성 기반 옵션 조정
    const enhancedOptions = enhanceOptionsForRegion(regionName, options)

    // 5. 코스 생성
    if (import.meta.env.DEV) {
      console.log(`${regionName} 코스 동적 생성 시작:`, enhancedOptions)
    }

    const course = await generateTravelCourse(regionName, enhancedOptions)

    if (!course) {
      throw new Error('코스 생성 실패')
    }

    // 6. 생성된 코스에 메타정보 추가
    const enrichedCourse = enrichCourseWithRegionInfo(
      course,
      regionInfo,
      apiAvailable,
    )

    // 7. 캐시에 저장
    GENERATED_COURSE_CACHE.set(cacheKey, {
      course: enrichedCourse,
      timestamp: Date.now(),
    })

    if (import.meta.env.DEV) {
      console.log(`${regionName} 코스 생성 완료:`, enrichedCourse.title)
    }

    return {
      success: true,
      course: enrichedCourse,
      fromCache: false,
      regionInfo,
      apiUsed: apiAvailable,
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(`${regionIdentifier} 코스 생성 실패:`, error)
    }

    return {
      success: false,
      error: 'GENERATION_FAILED',
      message: `${regionIdentifier} 지역의 여행 코스 생성에 실패했습니다.`,
      details: error.message,
    }
  }
}

/**
 * 지역 특성에 맞는 옵션 강화
 * @param {string} regionName - 지역명
 * @param {Object} options - 원본 옵션
 * @returns {Object} 강화된 옵션
 */
const enhanceOptionsForRegion = (regionName, options) => {
  const enhanced = { ...options }

  // 지역별 관광 정보 활용
  const tourismInfo = REGION_TOURISM_INFO[regionName]

  if (tourismInfo) {
    // 테마가 지정되지 않은 경우 지역 특색 테마 사용
    if (!enhanced.theme || enhanced.theme === 'all') {
      enhanced.theme = tourismInfo.themes[0] // 첫 번째 특색 테마 사용
    }

    // 지역별 추가 키워드
    enhanced.keywords = tourismInfo.keywords
  }

  // 지역 크기에 따른 일정 조정
  if (isSmallRegion(regionName)) {
    enhanced.duration = enhanced.duration || '1박 2일' // 소도시는 짧은 일정
  } else if (isMajorCity(regionName)) {
    enhanced.duration = enhanced.duration || '3박 4일' // 대도시는 긴 일정
  }

  return enhanced
}

/**
 * 소도시 여부 판단
 * @param {string} regionName - 지역명
 * @returns {boolean}
 */
const isSmallRegion = (regionName) => {
  const smallRegions = [
    '가평',
    '양평',
    '단양',
    '영월',
    '정선',
    '화천',
    '인제',
    '태백',
    '삼척',
    '영덕',
    '울진',
    '봉화',
    '진안',
    '무주',
  ]
  return smallRegions.includes(regionName)
}

/**
 * 주요 도시 여부 판단
 * @param {string} regionName - 지역명
 * @returns {boolean}
 */
const isMajorCity = (regionName) => {
  const majorCities = [
    '서울',
    '부산',
    '대구',
    '인천',
    '광주',
    '대전',
    '울산',
    '수원',
    '고양',
    '용인',
    '성남',
    '창원',
    '전주',
    '천안',
  ]
  return majorCities.includes(regionName)
}

/**
 * 생성된 코스에 지역 정보 추가
 * @param {Object} course - 원본 코스
 * @param {Object} regionInfo - 지역 정보
 * @param {boolean} apiUsed - API 사용 여부
 * @returns {Object} 강화된 코스
 */
const enrichCourseWithRegionInfo = (course, regionInfo, apiUsed) => {
  return {
    ...course,
    // 메타정보 추가
    generationInfo: {
      dynamicallyGenerated: true,
      regionCode: regionInfo.regionCode,
      exactMatch: regionInfo.exact,
      apiUsed,
      generatedAt: new Date().toISOString(),
      supportLevel: apiUsed ? 'full' : 'basic',
    },
    // 지역 정확도 표시
    regionAccuracy: regionInfo.exact ? 'exact' : 'similar',
    // 추천 사유 추가
    recommendationReason: generateRecommendationReason(regionInfo, apiUsed),
  }
}

/**
 * 추천 사유 생성
 * @param {Object} regionInfo - 지역 정보
 * @param {boolean} apiUsed - API 사용 여부
 * @returns {string}
 */
const generateRecommendationReason = (regionInfo, apiUsed) => {
  const { regionName, exact } = regionInfo

  if (exact && apiUsed) {
    return `${regionName} 지역의 실제 관광지 정보를 바탕으로 생성된 맞춤형 여행 코스입니다.`
  } else if (exact && !apiUsed) {
    return `${regionName} 지역의 특색을 반영하여 전문적으로 기획된 여행 코스입니다.`
  } else {
    return `${regionName} 지역과 유사한 특성을 가진 지역들의 정보를 종합하여 생성된 여행 코스입니다.`
  }
}

/**
 * 전국 지역 코스 생성 통계
 * @returns {Object} 생성 통계
 */
export const getGenerationStats = async () => {
  const allRegions = await getAllRegionsFlat()
  const totalRegions = allRegions.length
  const cachedCourses = GENERATED_COURSE_CACHE.size
  const cacheHitRate =
    cachedCourses > 0 ? ((cachedCourses / totalRegions) * 100).toFixed(1) : 0

  return {
    totalSupportedRegions: totalRegions,
    cachedCourses,
    cacheHitRate: `${cacheHitRate}%`,
    cacheStatus: GENERATED_COURSE_CACHE.size > 0 ? 'active' : 'empty',
  }
}

/**
 * 캐시 관리
 */
export const clearExpiredCache = () => {
  const now = Date.now()
  let removedCount = 0

  for (const [key, value] of GENERATED_COURSE_CACHE.entries()) {
    if (now - value.timestamp > CACHE_EXPIRY_TIME) {
      GENERATED_COURSE_CACHE.delete(key)
      removedCount++
    }
  }

  if (import.meta.env.DEV && removedCount > 0) {
    console.log(`만료된 캐시 ${removedCount}개 제거`)
  }

  return removedCount
}

/**
 * 캐시 전체 초기화
 */
export const clearAllCache = () => {
  const count = GENERATED_COURSE_CACHE.size
  GENERATED_COURSE_CACHE.clear()

  if (import.meta.env.DEV) {
    console.log(`전체 캐시 ${count}개 초기화`)
  }

  return count
}

// 정기적 캐시 정리 (30분마다)
if (typeof window !== 'undefined') {
  setInterval(clearExpiredCache, CACHE_EXPIRY_TIME)
}

export default {
  checkRegionSupport,
  generateRegionCourse,
  getGenerationStats,
  clearExpiredCache,
  clearAllCache,
}
