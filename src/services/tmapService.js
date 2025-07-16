// Tmap API 서비스
// 지역 정보 및 POI 데이터를 활용한 이미지 서비스

/**
 * Tmap API 설정
 */
const TMAP_CONFIG = {
  appKey: import.meta.env.VITE_TMAP_APP_KEY, // 환경변수에서 가져오기
  baseUrl: 'https://apis.openapi.sk.com/tmap',
  fallbackToStatic: true // Tmap 실패 시 정적 이미지 사용 여부
}

/**
 * 지역명을 좌표로 변환 (Geocoding)
 * @param {string} regionName - 지역명 (예: "서울특별시", "제주도")
 * @returns {Promise<{lat: number, lng: number}>} 좌표 정보
 */
export const getRegionCoordinates = async (regionName) => {
  if (!TMAP_CONFIG.appKey) {
    console.warn('Tmap API Key가 설정되지 않았습니다.')
    return null
  }

  try {
    const response = await fetch(
      `${TMAP_CONFIG.baseUrl}/geo/fullAddrGeo?version=1&format=json&addressFlag=F00&appKey=${TMAP_CONFIG.appKey}&addr=${encodeURIComponent(regionName)}`
    )

    if (!response.ok) {
      throw new Error(`Tmap Geocoding API 오류: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.coordinateInfo?.coordinate?.length > 0) {
      const coordinate = data.coordinateInfo.coordinate[0]
      return {
        lat: parseFloat(coordinate.lat),
        lng: parseFloat(coordinate.lon)
      }
    }

    return null
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(`${regionName} 좌표 검색 실패:`, error)
    }
    return null
  }
}

/**
 * 좌표 주변의 관광지 POI 검색
 * @param {number} lat - 위도
 * @param {number} lng - 경도
 * @param {number} radius - 검색 반경 (미터, 기본값: 10000)
 * @returns {Promise<Array>} POI 목록
 */
export const getTouristAttractions = async (lat, lng, radius = 10000) => {
  if (!TMAP_CONFIG.appKey) {
    return []
  }

  try {
    const response = await fetch(
      `${TMAP_CONFIG.baseUrl}/pois/search/around?version=1&format=json&callback=&appKey=${TMAP_CONFIG.appKey}&centerLat=${lat}&centerLon=${lng}&radius=${radius}&searchtypCd=A&reqCoordType=WGS84GEO&resCoordType=WGS84GEO&count=20`
    )

    if (!response.ok) {
      throw new Error(`Tmap POI API 오류: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.searchPoiInfo?.pois?.poi) {
      return data.searchPoiInfo.pois.poi.filter(poi => 
        poi.bizCatTcode === '관광' || 
        poi.bizCatTcode === '명소' ||
        poi.name.includes('관광') ||
        poi.name.includes('명소') ||
        poi.name.includes('여행')
      )
    }

    return []
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('POI 검색 실패:', error)
    }
    return []
  }
}

/**
 * 지역별 대표 이미지 URL 생성 (Tmap 데이터 활용)
 * @param {string} regionName - 지역명
 * @returns {Promise<string>} 이미지 URL
 */
export const getRegionImageFromTmap = async (regionName) => {
  try {
    // 1. 지역 좌표 얻기
    const coordinates = await getRegionCoordinates(regionName)
    if (!coordinates) {
      return null
    }

    // 2. 주변 관광지 검색
    const attractions = await getTouristAttractions(coordinates.lat, coordinates.lng)
    
    if (attractions.length > 0) {
      // 가장 인기있는 관광지 선택 (첫 번째)
      const mainAttraction = attractions[0]
      
      // Tmap 이미지 서비스 활용 (실제 서비스에서는 더 복잡한 로직 필요)
      // 여기서는 좌표 기반으로 Street View 스타일 이미지 URL 생성
      return generateRegionImageUrl(coordinates, mainAttraction.name)
    }

    // 관광지가 없으면 좌표만으로 이미지 생성
    return generateRegionImageUrl(coordinates, regionName)

  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(`${regionName} Tmap 이미지 생성 실패:`, error)
    }
    return null
  }
}

/**
 * 좌표와 장소명을 기반으로 이미지 URL 생성
 * @param {Object} coordinates - {lat, lng}
 * @param {string} placeName - 장소명
 * @returns {string} 이미지 URL
 */
const generateRegionImageUrl = (coordinates, placeName) => {
  // Google Street View API나 유사한 서비스 활용
  // 실제 운영에서는 적절한 이미지 서비스 API 사용
  const encodedPlace = encodeURIComponent(placeName)
  
  // 예시: Google Street View Static API (실제 API 키 필요)
  // return `https://maps.googleapis.com/maps/api/streetview?size=800x600&location=${coordinates.lat},${coordinates.lng}&key=${GOOGLE_API_KEY}`
  
  // 대안: Unsplash API with 지역명 검색
  return `https://source.unsplash.com/800x600/?${encodedPlace},korea,travel`
}

/**
 * 매핑되지 않은 지역에 대한 Tmap 기반 이미지 서비스
 * @param {Array<string>} unmappedRegions - 매핑되지 않은 지역 목록
 * @returns {Promise<Object>} 지역별 이미지 URL 객체
 */
export const getUnmappedRegionImages = async (unmappedRegions) => {
  const imageMap = {}
  
  if (!TMAP_CONFIG.appKey) {
    if (import.meta.env.DEV) {
      console.warn('Tmap API Key 없음 - fallback 이미지 사용')
    }
    return getFallbackImages(unmappedRegions)
  }

  // 병렬 처리로 성능 향상
  const promises = unmappedRegions.map(async (regionName) => {
    const imageUrl = await getRegionImageFromTmap(regionName)
    return { regionName, imageUrl }
  })

  try {
    const results = await Promise.allSettled(promises)
    
    results.forEach((result, index) => {
      const regionName = unmappedRegions[index]
      
      if (result.status === 'fulfilled' && result.value.imageUrl) {
        imageMap[regionName] = result.value.imageUrl
      } else {
        // Tmap 실패 시 fallback 이미지 사용
        imageMap[regionName] = getFallbackImageForRegion(regionName)
      }
    })

    if (import.meta.env.DEV) {
      console.log('Tmap 기반 이미지 매핑 완료:', Object.keys(imageMap).length, '개')
    }

  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Tmap 이미지 서비스 오류:', error)
    }
    return getFallbackImages(unmappedRegions)
  }

  return imageMap
}

/**
 * Fallback 이미지 생성
 * @param {Array<string>} regions - 지역 목록
 * @returns {Object} 지역별 fallback 이미지 객체
 */
const getFallbackImages = (regions) => {
  const fallbackMap = {}
  regions.forEach(region => {
    fallbackMap[region] = getFallbackImageForRegion(region)
  })
  return fallbackMap
}

/**
 * 특정 지역의 fallback 이미지 URL 생성
 * @param {string} regionName - 지역명
 * @returns {string} fallback 이미지 URL
 */
const getFallbackImageForRegion = (regionName) => {
  // 지역명 기반 Unsplash 검색
  const searchTerms = [
    regionName,
    'korea',
    'travel',
    'beautiful',
    'landscape'
  ].join(',')
  
  return `https://source.unsplash.com/800x600/?${encodeURIComponent(searchTerms)}`
}

/**
 * Tmap API 상태 확인
 * @returns {Promise<boolean>} API 사용 가능 여부
 */
export const checkTmapApiStatus = async () => {
  if (!TMAP_CONFIG.appKey) {
    return false
  }

  try {
    // 간단한 테스트 요청 (서울 좌표 조회)
    const coordinates = await getRegionCoordinates('서울특별시')
    return coordinates !== null
  } catch (error) {
    return false
  }
}

export default {
  getRegionCoordinates,
  getTouristAttractions,
  getRegionImageFromTmap,
  getUnmappedRegionImages,
  checkTmapApiStatus
}