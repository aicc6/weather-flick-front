// 주요 여행 도시 목록 - 시 단위로 그룹화
// 실제 여행 코스 생성이 잘 되는 지역들 중심으로 구성

/**
 * 주요 여행 도시 그룹
 * - 광역시도별로 그룹화
 * - 각 그룹 내에서 주요 도시만 선별
 * - 여행지로서 의미있는 지역들만 포함
 */
export const MAJOR_TRAVEL_CITIES = {
  // 특별시/광역시 (7개)
  metropolitan: {
    name: "특별시/광역시",
    cities: [
      { code: 'seoul', name: '서울', province: 'seoul', popular: true },
      { code: 'busan', name: '부산', province: 'busan', popular: true },
      { code: 'daegu', name: '대구', province: 'daegu', popular: false },
      { code: 'incheon', name: '인천', province: 'incheon', popular: false },
      { code: 'gwangju', name: '광주', province: 'gwangju', popular: false },
      { code: 'daejeon', name: '대전', province: 'daejeon', popular: false },
      { code: 'ulsan', name: '울산', province: 'ulsan', popular: false }
    ]
  },

  // 특별자치시/도 (2개)
  special: {
    name: "특별자치시/도",
    cities: [
      { code: 'sejong', name: '세종', province: 'sejong', popular: false },
      { code: 'jeju_jeju', name: '제주시', province: 'jeju', popular: true },
      { code: 'jeju_seogwipo', name: '서귀포시', province: 'jeju', popular: true }
    ]
  },

  // 경기도 주요 도시 (10개)
  gyeonggi: {
    name: "경기도",
    cities: [
      { code: 'gyeonggi_suwon', name: '수원시', province: 'gyeonggi', popular: false },
      { code: 'gyeonggi_yongin', name: '용인시', province: 'gyeonggi', popular: false },
      { code: 'gyeonggi_goyang', name: '고양시', province: 'gyeonggi', popular: false },
      { code: 'gyeonggi_seongnam', name: '성남시', province: 'gyeonggi', popular: false },
      { code: 'gyeonggi_paju', name: '파주시', province: 'gyeonggi', popular: true },
      { code: 'gyeonggi_gapyeong', name: '가평군', province: 'gyeonggi', popular: true },
      { code: 'gyeonggi_yangpyeong', name: '양평군', province: 'gyeonggi', popular: true },
      { code: 'gyeonggi_icheon', name: '이천시', province: 'gyeonggi', popular: false },
      { code: 'gyeonggi_yeoju', name: '여주시', province: 'gyeonggi', popular: false },
      { code: 'gyeonggi_hwaseong', name: '화성시', province: 'gyeonggi', popular: false }
    ]
  },

  // 강원도 주요 도시 (8개)
  gangwon: {
    name: "강원도",
    cities: [
      { code: 'gangwon_chuncheon', name: '춘천시', province: 'gangwon', popular: true },
      { code: 'gangwon_gangneung', name: '강릉시', province: 'gangwon', popular: true },
      { code: 'gangwon_sokcho', name: '속초시', province: 'gangwon', popular: true },
      { code: 'gangwon_wonju', name: '원주시', province: 'gangwon', popular: false },
      { code: 'gangwon_donghae', name: '동해시', province: 'gangwon', popular: true },
      { code: 'gangwon_taebaek', name: '태백시', province: 'gangwon', popular: true },
      { code: 'gangwon_samcheok', name: '삼척시', province: 'gangwon', popular: true },
      { code: 'gangwon_pyeongchang', name: '평창군', province: 'gangwon', popular: true }
    ]
  },

  // 충청북도 주요 도시 (4개)
  chungbuk: {
    name: "충청북도",
    cities: [
      { code: 'chungbuk_cheongju', name: '청주시', province: 'chungbuk', popular: false },
      { code: 'chungbuk_chungju', name: '충주시', province: 'chungbuk', popular: true },
      { code: 'chungbuk_jecheon', name: '제천시', province: 'chungbuk', popular: true },
      { code: 'chungbuk_danyang', name: '단양군', province: 'chungbuk', popular: true }
    ]
  },

  // 충청남도 주요 도시 (6개)
  chungnam: {
    name: "충청남도",
    cities: [
      { code: 'chungnam_cheonan', name: '천안시', province: 'chungnam', popular: false },
      { code: 'chungnam_gongju', name: '공주시', province: 'chungnam', popular: true },
      { code: 'chungnam_boryeong', name: '보령시', province: 'chungnam', popular: true },
      { code: 'chungnam_asan', name: '아산시', province: 'chungnam', popular: false },
      { code: 'chungnam_buyeo', name: '부여군', province: 'chungnam', popular: true },
      { code: 'chungnam_taean', name: '태안군', province: 'chungnam', popular: true }
    ]
  },

  // 전라북도 주요 도시 (5개)
  jeonbuk: {
    name: "전라북도",
    cities: [
      { code: 'jeonbuk_jeonju', name: '전주시', province: 'jeonbuk', popular: true },
      { code: 'jeonbuk_gunsan', name: '군산시', province: 'jeonbuk', popular: true },
      { code: 'jeonbuk_iksan', name: '익산시', province: 'jeonbuk', popular: false },
      { code: 'jeonbuk_namwon', name: '남원시', province: 'jeonbuk', popular: true },
      { code: 'jeonbuk_gochang', name: '고창군', province: 'jeonbuk', popular: true }
    ]
  },

  // 전라남도 주요 도시 (8개)
  jeonnam: {
    name: "전라남도",
    cities: [
      { code: 'jeonnam_mokpo', name: '목포시', province: 'jeonnam', popular: true },
      { code: 'jeonnam_yeosu', name: '여수시', province: 'jeonnam', popular: true },
      { code: 'jeonnam_suncheon', name: '순천시', province: 'jeonnam', popular: true },
      { code: 'jeonnam_gwangyang', name: '광양시', province: 'jeonnam', popular: false },
      { code: 'jeonnam_damyang', name: '담양군', province: 'jeonnam', popular: true },
      { code: 'jeonnam_boseong', name: '보성군', province: 'jeonnam', popular: true },
      { code: 'jeonnam_gangjin', name: '강진군', province: 'jeonnam', popular: true },
      { code: 'jeonnam_wando', name: '완도군', province: 'jeonnam', popular: true }
    ]
  },

  // 경상북도 주요 도시 (8개)
  gyeongbuk: {
    name: "경상북도",
    cities: [
      { code: 'gyeongbuk_pohang', name: '포항시', province: 'gyeongbuk', popular: true },
      { code: 'gyeongbuk_gyeongju', name: '경주시', province: 'gyeongbuk', popular: true },
      { code: 'gyeongbuk_andong', name: '안동시', province: 'gyeongbuk', popular: true },
      { code: 'gyeongbuk_gumi', name: '구미시', province: 'gyeongbuk', popular: false },
      { code: 'gyeongbuk_yeongju', name: '영주시', province: 'gyeongbuk', popular: true },
      { code: 'gyeongbuk_mungyeong', name: '문경시', province: 'gyeongbuk', popular: true },
      { code: 'gyeongbuk_yeongdeok', name: '영덕군', province: 'gyeongbuk', popular: true },
      { code: 'gyeongbuk_ulleung', name: '울릉군', province: 'gyeongbuk', popular: true }
    ]
  },

  // 경상남도 주요 도시 (8개)
  gyeongnam: {
    name: "경상남도",
    cities: [
      { code: 'gyeongnam_changwon', name: '창원시', province: 'gyeongnam', popular: false },
      { code: 'gyeongnam_jinju', name: '진주시', province: 'gyeongnam', popular: true },
      { code: 'gyeongnam_tongyeong', name: '통영시', province: 'gyeongnam', popular: true },
      { code: 'gyeongnam_sacheon', name: '사천시', province: 'gyeongnam', popular: false },
      { code: 'gyeongnam_kimhae', name: '김해시', province: 'gyeongnam', popular: false },
      { code: 'gyeongnam_geoje', name: '거제시', province: 'gyeongnam', popular: true },
      { code: 'gyeongnam_namhae', name: '남해군', province: 'gyeongnam', popular: true },
      { code: 'gyeongnam_hadong', name: '하동군', province: 'gyeongnam', popular: true }
    ]
  }
}

/**
 * 그룹별로 정리된 주요 도시 목록을 플랫 배열로 변환
 * @returns {Array} 모든 주요 도시 배열
 */
export const getMajorCitiesFlat = () => {
  const allCities = []
  
  Object.values(MAJOR_TRAVEL_CITIES).forEach(group => {
    group.cities.forEach(city => {
      allCities.push({
        ...city,
        groupName: group.name,
        displayName: `${city.name} (${group.name})`
      })
    })
  })
  
  return allCities
}

/**
 * 인기 여행지만 필터링
 * @returns {Array} 인기 여행지 배열
 */
export const getPopularCities = () => {
  const allCities = getMajorCitiesFlat()
  return allCities.filter(city => city.popular)
}

/**
 * 그룹별로 정리된 도시 목록
 * @returns {Object} 그룹별 도시 목록
 */
export const getCitiesByGroup = () => {
  return MAJOR_TRAVEL_CITIES
}

/**
 * 총 도시 수 통계
 * @returns {Object} 통계 정보
 */
export const getCityStats = () => {
  const allCities = getMajorCitiesFlat()
  const popularCities = getPopularCities()
  const groups = Object.keys(MAJOR_TRAVEL_CITIES)
  
  return {
    totalCities: allCities.length,
    popularCities: popularCities.length,
    totalGroups: groups.length,
    citiesPerGroup: Math.round(allCities.length / groups.length)
  }
}

export default {
  MAJOR_TRAVEL_CITIES,
  getMajorCitiesFlat,
  getPopularCities,
  getCitiesByGroup,
  getCityStats
}