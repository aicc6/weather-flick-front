// 지역 API 기반 서비스 - 하드코딩된 지역 데이터를 대체
import { store } from '@/store'
import { regionsApi } from '@/store/api/regionsApi'

/**
 * 지역 데이터를 API에서 가져오는 헬퍼 함수들
 */

/**
 * 모든 지역 데이터를 플랫 배열로 가져오기
 * @returns {Array} 지역 목록
 */
export const getAllRegionsFlat = async () => {
  try {
    const result = await store.dispatch(regionsApi.endpoints.getRegions.initiate())
    const regions = result.data || []
    
    return regions.map(region => ({
      code: region.region_code,
      name: region.region_name,
      shortName: region.region_name,
      fullName: region.region_name_full || region.region_name,
      type: region.region_level === 1 ? 'province' : 'city',
      level: region.region_level,
      province: region.parent_region_code,
      latitude: region.latitude,
      longitude: region.longitude,
    }))
  } catch (error) {
    console.error('지역 데이터 가져오기 실패:', error)
    return []
  }
}

/**
 * 광역시도 목록 가져오기
 * @returns {Array} 광역시도 목록
 */
export const getProvinces = async () => {
  try {
    const result = await store.dispatch(regionsApi.endpoints.getActiveRegions.initiate())
    const provinces = result.data || []
    
    return provinces.map(province => ({
      code: province.region_code,
      name: province.region_name,
      shortName: province.region_name,
      latitude: province.latitude,
      longitude: province.longitude,
    }))
  } catch (error) {
    console.error('광역시도 데이터 가져오기 실패:', error)
    return []
  }
}

/**
 * 지역 코드로 지역명 찾기
 * @param {string} regionCode - 지역 코드
 * @returns {Promise<string>} 지역명
 */
export const getRegionNameByCode = async (regionCode) => {
  try {
    const regions = await getAllRegionsFlat()
    const region = regions.find(r => r.code === regionCode)
    return region ? region.shortName : regionCode
  } catch (error) {
    console.error('지역명 찾기 실패:', error)
    return regionCode
  }
}

/**
 * 지역명으로 지역 코드 찾기
 * @param {string} regionName - 지역명
 * @returns {Promise<string>} 지역 코드
 */
export const getRegionCodeByName = async (regionName) => {
  try {
    const regions = await getAllRegionsFlat()
    const region = regions.find(r => 
      r.name === regionName || 
      r.shortName === regionName ||
      r.fullName === regionName
    )
    return region ? region.code : regionName
  } catch (error) {
    console.error('지역 코드 찾기 실패:', error)
    return regionName
  }
}

/**
 * 지역별 관광 특색 정보 (기본값, API 확장 가능)
 */
export const REGION_TOURISM_INFO = {
  // 주요 관광지 특색
  1: { // 서울
    themes: ['문화', '쇼핑', '역사'],
    keywords: ['궁궐', '한강', '명동', '강남'],
  },
  6: { // 부산
    themes: ['바다', '온천', '문화'],
    keywords: ['해운대', '광안리', '감천문화마을'],
  },
  39: { // 제주
    themes: ['자연', '휴양', '체험'],
    keywords: ['한라산', '성산일출봉', '협재해수욕장'],
  },
  // 필요에 따라 API에서 동적으로 로드 가능
}

/**
 * 지역 검색 (API 기반)
 * @param {string} searchTerm - 검색어
 * @returns {Promise<Array>} 검색 결과
 */
export const searchRegions = async (searchTerm) => {
  try {
    const regions = await getAllRegionsFlat()
    if (!searchTerm) return regions
    
    const term = searchTerm.toLowerCase()
    return regions.filter(region => 
      region.name.toLowerCase().includes(term) ||
      region.shortName.toLowerCase().includes(term) ||
      region.fullName.toLowerCase().includes(term)
    )
  } catch (error) {
    console.error('지역 검색 실패:', error)
    return []
  }
}

/**
 * 하위 지역 가져오기
 * @param {string} parentCode - 상위 지역 코드
 * @returns {Promise<Array>} 하위 지역 목록
 */
export const getSubRegions = async (parentCode) => {
  try {
    const regions = await getAllRegionsFlat()
    return regions.filter(region => region.province === parentCode)
  } catch (error) {
    console.error('하위 지역 가져오기 실패:', error)
    return []
  }
}

/**
 * Select 컴포넌트용 옵션 변환
 * @param {Array} regions - 지역 목록
 * @returns {Array} Select 옵션 배열
 */
export const toSelectOptions = (regions) => {
  if (!regions || !Array.isArray(regions)) return []
  return regions.map(region => ({
    value: region.code,
    label: region.fullName || region.name,
    data: region
  }))
}

export default {
  getAllRegionsFlat,
  getProvinces,
  getRegionNameByCode,
  getRegionCodeByName,
  searchRegions,
  getSubRegions,
  toSelectOptions,
  REGION_TOURISM_INFO,
}