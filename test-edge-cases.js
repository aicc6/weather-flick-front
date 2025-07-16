// 엣지 케이스 및 에러 처리 테스트

// 기본 데이터 구조 (간단 버전)
const TEST_REGIONS = [
  { code: 'seoul', name: '서울', type: 'province' },
  { code: 'seoul_gangnam', name: '강남구', province: 'seoul', type: 'city' },
  { code: 'jeju', name: '제주', type: 'province' },
  { code: 'jeju_jeju', name: '제주시', province: 'jeju', type: 'city' },
  {
    code: 'gangwon_taebaek',
    name: '태백시',
    province: 'gangwon',
    type: 'city',
  },
]

function checkRegionSupport(regionIdentifier) {
  // null 또는 undefined 처리
  if (!regionIdentifier) {
    return {
      isSupported: false,
      regionCode: null,
      regionName: null,
      exact: false,
      suggestions: [],
      error: 'INVALID_INPUT',
    }
  }

  // 문자열이 아닌 입력 처리
  if (typeof regionIdentifier !== 'string') {
    return {
      isSupported: false,
      regionCode: null,
      regionName: null,
      exact: false,
      suggestions: [],
      error: 'INVALID_TYPE',
    }
  }

  // 빈 문자열 처리
  const trimmedInput = regionIdentifier.trim()
  if (!trimmedInput) {
    return {
      isSupported: false,
      regionCode: null,
      regionName: null,
      exact: false,
      suggestions: [],
      error: 'EMPTY_INPUT',
    }
  }

  try {
    // 정확한 매칭 시도
    let matchedRegion = TEST_REGIONS.find(
      (region) => region.code === trimmedInput || region.name === trimmedInput,
    )

    if (matchedRegion) {
      return {
        isSupported: true,
        regionCode: matchedRegion.code,
        regionName: matchedRegion.name,
        exact: true,
        suggestions: [],
      }
    }

    // 부분 매칭 시도
    const similarRegions = TEST_REGIONS.filter(
      (region) =>
        region.name.includes(trimmedInput) ||
        trimmedInput.includes(region.name),
    )

    if (similarRegions.length > 0) {
      return {
        isSupported: true,
        regionCode: similarRegions[0].code,
        regionName: similarRegions[0].name,
        exact: false,
        suggestions: similarRegions.map((r) => ({
          code: r.code,
          name: r.name,
        })),
      }
    }

    // 지원하지 않는 지역
    return {
      isSupported: false,
      regionCode: null,
      regionName: null,
      exact: false,
      suggestions: TEST_REGIONS.slice(0, 3).map((r) => ({
        code: r.code,
        name: r.name,
      })),
    }
  } catch (error) {
    return {
      isSupported: false,
      regionCode: null,
      regionName: null,
      exact: false,
      suggestions: [],
      error: 'PROCESSING_ERROR',
      details: error.message,
    }
  }
}

// 캐시 시뮬레이션
class MockCache {
  constructor() {
    this.cache = new Map()
    this.expiry = 30 * 60 * 1000 // 30분
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    })
  }

  get(key) {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() - item.timestamp > this.expiry) {
      this.cache.delete(key)
      return null
    }

    return item.value
  }

  clear() {
    this.cache.clear()
  }

  size() {
    return this.cache.size
  }
}

// 코스 생성 시뮬레이션
async function generateRegionCourse(regionIdentifier, options = {}) {
  // 입력 검증
  if (!regionIdentifier) {
    return {
      success: false,
      error: 'INVALID_INPUT',
      message: '지역 식별자가 필요합니다.',
    }
  }

  try {
    // 지역 지원 여부 확인
    const regionInfo = checkRegionSupport(regionIdentifier)

    if (!regionInfo.isSupported) {
      return {
        success: false,
        error: 'UNSUPPORTED_REGION',
        message: `${regionIdentifier} 지역은 현재 지원하지 않습니다.`,
        suggestions: regionInfo.suggestions,
      }
    }

    // 코스 생성 시뮬레이션
    const course = {
      id: Math.random().toString(36).substr(2, 9),
      title: `${regionInfo.regionName} 여행 코스`,
      region: regionInfo.regionCode,
      duration: options.duration || '2박 3일',
      theme: options.theme || '관광',
      createdAt: new Date().toISOString(),
    }

    return {
      success: true,
      course,
      fromCache: false,
      regionInfo,
      apiUsed: true,
    }
  } catch (error) {
    return {
      success: false,
      error: 'GENERATION_FAILED',
      message: `${regionIdentifier} 지역의 여행 코스 생성에 실패했습니다.`,
      details: error.message,
    }
  }
}

// 엣지 케이스 테스트 실행
async function runEdgeCaseTests() {
  console.log('🧪 엣지 케이스 및 에러 처리 테스트')
  console.log('=' * 50)

  // 1. 입력 검증 테스트
  console.log('\n📝 입력 검증 테스트')
  console.log('-' * 30)

  const invalidInputs = [
    { input: null, description: 'null 입력' },
    { input: undefined, description: 'undefined 입력' },
    { input: '', description: '빈 문자열' },
    { input: '   ', description: '공백만 있는 문자열' },
    { input: 123, description: '숫자 입력' },
    { input: {}, description: '객체 입력' },
    { input: [], description: '배열 입력' },
  ]

  invalidInputs.forEach((test) => {
    const result = checkRegionSupport(test.input)
    console.log(
      `${test.description}: ${result.isSupported ? '❌ 잘못 처리됨' : '✅ 올바르게 처리됨'}`,
    )
    if (result.error) {
      console.log(`  오류 타입: ${result.error}`)
    }
  })

  // 2. 특수 문자 및 유니코드 테스트
  console.log('\n🔤 특수 문자 테스트')
  console.log('-' * 30)

  const specialCharInputs = [
    '제주!@#',
    '서울123',
    '태백-시',
    '서울_강남',
    '제주도♥',
    '부산（釜山）',
    'SEOUL',
    'seoul',
  ]

  specialCharInputs.forEach((input) => {
    const result = checkRegionSupport(input)
    console.log(
      `"${input}": ${result.isSupported ? '✅ 지원' : '❌ 미지원'} | 매핑: ${result.regionName || 'N/A'}`,
    )
  })

  // 3. 길이 제한 테스트
  console.log('\n📏 입력 길이 테스트')
  console.log('-' * 30)

  const lengthTests = [
    { input: 'a', description: '1글자' },
    { input: '제', description: '한글 1글자' },
    { input: '제주도특별자치도', description: '긴 지역명' },
    { input: 'a'.repeat(100), description: '100글자' },
    { input: 'a'.repeat(1000), description: '1000글자' },
  ]

  lengthTests.forEach((test) => {
    const startTime = performance.now()
    const result = checkRegionSupport(test.input)
    const endTime = performance.now()
    const duration = endTime - startTime

    console.log(
      `${test.description}: ${result.isSupported ? '지원' : '미지원'} (${duration.toFixed(2)}ms)`,
    )
    if (duration > 10) {
      console.log(`  ⚠️ 성능 이슈: ${duration.toFixed(2)}ms`)
    }
  })

  // 4. 캐시 시스템 테스트
  console.log('\n💾 캐시 시스템 테스트')
  console.log('-' * 30)

  const cache = new MockCache()

  // 캐시 추가
  cache.set('test_region', { title: '테스트 코스' })
  console.log(`캐시 추가 후 크기: ${cache.size()}`)

  // 캐시 조회
  const cached = cache.get('test_region')
  console.log(`캐시 조회: ${cached ? '✅ 성공' : '❌ 실패'}`)

  // 존재하지 않는 키 조회
  const nonExistent = cache.get('non_existent')
  console.log(
    `존재하지 않는 키: ${nonExistent ? '❌ 잘못 반환' : '✅ null 반환'}`,
  )

  // 캐시 정리
  cache.clear()
  console.log(`캐시 정리 후 크기: ${cache.size()}`)

  // 5. 비동기 처리 테스트
  console.log('\n⚡ 비동기 처리 테스트')
  console.log('-' * 30)

  const asyncTests = [
    { region: '제주', shouldSucceed: true },
    { region: '존재하지않는지역', shouldSucceed: false },
    { region: null, shouldSucceed: false },
  ]

  const asyncResults = await Promise.all(
    asyncTests.map(async (test) => {
      try {
        const result = await generateRegionCourse(test.region)
        return {
          region: test.region,
          success: result.success,
          expected: test.shouldSucceed,
          correct: result.success === test.shouldSucceed,
        }
      } catch (error) {
        return {
          region: test.region,
          success: false,
          expected: test.shouldSucceed,
          correct: !test.shouldSucceed,
          error: error.message,
        }
      }
    }),
  )

  asyncResults.forEach((result) => {
    console.log(
      `지역 "${result.region}": ${result.correct ? '✅ 예상대로' : '❌ 예상과 다름'}`,
    )
    console.log(`  성공: ${result.success}, 예상: ${result.expected}`)
    if (result.error) {
      console.log(`  오류: ${result.error}`)
    }
  })

  // 6. 동시성 테스트
  console.log('\n🔄 동시성 테스트')
  console.log('-' * 30)

  const concurrentRequests = Array(10)
    .fill()
    .map((_, i) => generateRegionCourse(`테스트지역${i}`))

  const startTime = performance.now()
  const concurrentResults = await Promise.all(concurrentRequests)
  const endTime = performance.now()

  const successCount = concurrentResults.filter((r) => r.success).length
  console.log(
    `동시 요청 10개: ${successCount}개 성공 (${(endTime - startTime).toFixed(2)}ms)`,
  )

  // 7. 메모리 사용량 테스트
  console.log('\n🧠 메모리 사용량 테스트')
  console.log('-' * 30)

  const memoryCache = new MockCache()

  // 대량 데이터 추가
  for (let i = 0; i < 1000; i++) {
    memoryCache.set(`region_${i}`, {
      title: `지역 ${i} 코스`,
      data: 'x'.repeat(1000), // 1KB 데이터
    })
  }

  console.log(`1000개 항목 추가 후 캐시 크기: ${memoryCache.size()}`)

  // 메모리 정리 시뮬레이션
  memoryCache.clear()
  console.log(`메모리 정리 후 캐시 크기: ${memoryCache.size()}`)

  // 8. 한계 상황 테스트
  console.log('\n🚨 한계 상황 테스트')
  console.log('-' * 30)

  // 매우 많은 요청 시뮬레이션
  const heavyLoadStart = performance.now()
  const heavyLoadPromises = Array(100)
    .fill()
    .map(() => checkRegionSupport('제주'))
  const heavyLoadResults = await Promise.all(heavyLoadPromises)
  const heavyLoadEnd = performance.now()

  const allSucceeded = heavyLoadResults.every((r) => r.isSupported)
  console.log(
    `100개 동시 요청: ${allSucceeded ? '✅ 모두 성공' : '❌ 일부 실패'} (${(heavyLoadEnd - heavyLoadStart).toFixed(2)}ms)`,
  )

  // 평균 응답 시간
  const avgResponseTime = (heavyLoadEnd - heavyLoadStart) / 100
  console.log(`평균 응답 시간: ${avgResponseTime.toFixed(2)}ms`)

  if (avgResponseTime > 1) {
    console.log('⚠️ 성능 최적화 필요')
  } else {
    console.log('✅ 성능 양호')
  }

  console.log('\n🎉 모든 엣지 케이스 테스트 완료!')
}

// 실행
runEdgeCaseTests().catch(console.error)
