// 독립 실행 가능한 지역 테스트 스크립트

// 기본 데이터 구조 정의
const PROVINCES = [
  { code: 'seoul', name: '서울특별시', shortName: '서울' },
  { code: 'busan', name: '부산광역시', shortName: '부산' },
  { code: 'daegu', name: '대구광역시', shortName: '대구' },
  { code: 'incheon', name: '인천광역시', shortName: '인천' },
  { code: 'gwangju', name: '광주광역시', shortName: '광주' },
  { code: 'daejeon', name: '대전광역시', shortName: '대전' },
  { code: 'ulsan', name: '울산광역시', shortName: '울산' },
  { code: 'sejong', name: '세종특별자치시', shortName: '세종' },
  { code: 'gyeonggi', name: '경기도', shortName: '경기' },
  { code: 'gangwon', name: '강원특별자치도', shortName: '강원' },
  { code: 'chungbuk', name: '충청북도', shortName: '충북' },
  { code: 'chungnam', name: '충청남도', shortName: '충남' },
  { code: 'jeonbuk', name: '전라북도', shortName: '전북' },
  { code: 'jeonnam', name: '전라남도', shortName: '전남' },
  { code: 'gyeongbuk', name: '경상북도', shortName: '경북' },
  { code: 'gyeongnam', name: '경상남도', shortName: '경남' },
  { code: 'jeju', name: '제주특별자치도', shortName: '제주' },
]

// 주요 지역 샘플 데이터
const SAMPLE_REGIONS = {
  seoul: [
    { code: 'seoul_gangnam', name: '강남구', province: 'seoul' },
    { code: 'seoul_seocho', name: '서초구', province: 'seoul' },
    { code: 'seoul_jongno', name: '종로구', province: 'seoul' },
  ],
  busan: [
    { code: 'busan_haeundae', name: '해운대구', province: 'busan' },
    { code: 'busan_jung', name: '중구', province: 'busan' },
  ],
  gangwon: [
    { code: 'gangwon_taebaek', name: '태백시', province: 'gangwon' },
    { code: 'gangwon_sokcho', name: '속초시', province: 'gangwon' },
    { code: 'gangwon_chuncheon', name: '춘천시', province: 'gangwon' },
  ],
  gyeongbuk: [
    { code: 'gyeongbuk_ulleung', name: '울릉군', province: 'gyeongbuk' },
    { code: 'gyeongbuk_gyeongju', name: '경주시', province: 'gyeongbuk' },
  ],
  jeju: [
    { code: 'jeju_jeju', name: '제주시', province: 'jeju' },
    { code: 'jeju_seogwipo', name: '서귀포시', province: 'jeju' },
  ],
  sejong: [{ code: 'sejong_sejong', name: '세종시', province: 'sejong' }],
}

// 모든 지역을 플랫 배열로 변환
function getAllRegionsFlat() {
  const allRegions = []

  // 광역시도 추가
  PROVINCES.forEach((province) => {
    allRegions.push({
      code: province.code,
      name: province.name,
      shortName: province.shortName,
      type: 'province',
      level: 1,
    })
  })

  // 시군구 추가
  Object.values(SAMPLE_REGIONS).forEach((regions) => {
    regions.forEach((region) => {
      const province = PROVINCES.find((p) => p.code === region.province)
      allRegions.push({
        ...region,
        type: 'city',
        level: 2,
        fullName: `${province?.shortName} ${region.name}`,
      })
    })
  })

  return allRegions
}

// 지역 지원 여부 확인
function checkRegionSupport(regionIdentifier) {
  const allRegions = getAllRegionsFlat()

  // 정확한 매칭 시도
  let matchedRegion = allRegions.find(
    (region) =>
      region.code === regionIdentifier ||
      region.name === regionIdentifier ||
      region.shortName === regionIdentifier ||
      (region.name && region.name.includes(regionIdentifier)) ||
      (regionIdentifier && regionIdentifier.includes(region.name)),
  )

  if (matchedRegion) {
    return {
      isSupported: true,
      regionCode: matchedRegion.code,
      regionName: matchedRegion.shortName || matchedRegion.name,
      exact:
        matchedRegion.code === regionIdentifier ||
        matchedRegion.name === regionIdentifier,
      suggestions: [],
    }
  }

  // 유사 지역명 검색 (부분 매칭)
  const similarRegions = allRegions
    .filter(
      (region) =>
        (region.name && region.name.includes(regionIdentifier)) ||
        (region.shortName && region.shortName.includes(regionIdentifier)) ||
        (regionIdentifier && regionIdentifier.includes(region.name)),
    )
    .slice(0, 5)

  if (similarRegions.length > 0) {
    return {
      isSupported: true,
      regionCode: similarRegions[0].code,
      regionName: similarRegions[0].shortName || similarRegions[0].name,
      exact: false,
      suggestions: similarRegions.map((r) => ({
        code: r.code,
        name: r.shortName || r.name,
        fullName: r.fullName || r.name,
      })),
    }
  }

  // 지원하지 않는 지역
  return {
    isSupported: false,
    regionCode: null,
    regionName: null,
    exact: false,
    suggestions: [
      { code: 'jeju', name: '제주', fullName: '제주 제주시' },
      { code: 'busan', name: '부산', fullName: '부산광역시' },
      { code: 'seoul', name: '서울', fullName: '서울특별시' },
    ],
  }
}

// 테스트 실행
function runTests() {
  console.log('🚀 전국 지역 커버리지 테스트')
  console.log('==============================')

  // 1. 기본 통계
  const allRegions = getAllRegionsFlat()
  const provinces = allRegions.filter((r) => r.type === 'province')
  const cities = allRegions.filter((r) => r.type === 'city')

  console.log(`📊 지역 통계:`)
  console.log(`   총 지역: ${allRegions.length}개`)
  console.log(`   광역시도: ${provinces.length}개`)
  console.log(`   시군구: ${cities.length}개`)
  console.log('')

  // 2. 지역별 하위 지역 수
  console.log('📍 광역시도별 샘플 지역:')
  PROVINCES.forEach((province) => {
    const provinceCities = cities.filter((c) => c.province === province.code)
    console.log(`   ${province.shortName}: ${provinceCities.length}개`)
  })
  console.log('')

  // 3. 지역 지원 테스트
  console.log('🔍 지역 지원 테스트:')
  console.log('-'.repeat(40))

  const testCases = [
    '태백',
    '태백시',
    'gangwon_taebaek',
    '울릉',
    '울릉군',
    '제주',
    '서울',
    '강남',
    '세종',
    '존재하지않는지역',
  ]

  testCases.forEach((testCase) => {
    console.log(`\n입력: "${testCase}"`)

    const result = checkRegionSupport(testCase)
    console.log(`  지원: ${result.isSupported ? '✅ 지원됨' : '❌ 미지원'}`)
    console.log(`  정확도: ${result.exact ? '정확' : '유사'}`)
    console.log(`  매핑: ${result.regionName || '없음'}`)

    if (result.suggestions && result.suggestions.length > 0) {
      console.log(
        `  추천: ${result.suggestions
          .slice(0, 3)
          .map((s) => s.name)
          .join(', ')}`,
      )
    }
  })

  // 4. 성공률 계산
  console.log('\n📈 테스트 결과:')
  console.log('-'.repeat(20))

  const supportedCount = testCases.filter((tc) => {
    const result = checkRegionSupport(tc)
    return result.isSupported
  }).length

  const successRate = ((supportedCount / testCases.length) * 100).toFixed(1)
  console.log(`지원 지역: ${supportedCount}/${testCases.length}`)
  console.log(`성공률: ${successRate}%`)

  console.log('\n✅ 테스트 완료!')
}

// 실행
runTests()
