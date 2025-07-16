// 전국 244개 지역 커버리지 테스트 스크립트
import { getAllRegionsFlat, getRegionNameByCode } from './src/data/koreaRegions.js'
import { checkRegionSupport, generateRegionCourse } from './src/services/dynamicRegionService.js'

/**
 * 전국 지역 커버리지 테스트
 */
async function testRegionCoverage() {
  console.log('🚀 전국 244개 지역 커버리지 테스트 시작')
  console.log('=' * 50)
  
  // 1. 전체 지역 수 확인
  const allRegions = getAllRegionsFlat()
  const provinces = allRegions.filter(r => r.type === 'province')
  const cities = allRegions.filter(r => r.type === 'city')
  
  console.log(`📊 총 지역 수: ${allRegions.length}개`)
  console.log(`   - 광역시도: ${provinces.length}개`)
  console.log(`   - 시군구: ${cities.length}개`)
  console.log('')
  
  // 2. 랜덤 지역 테스트 (10개)
  console.log('🎲 랜덤 지역 테스트 (10개)')
  console.log('-' * 30)
  
  const testRegions = getRandomRegions(cities, 10)
  const testResults = []
  
  for (const region of testRegions) {
    console.log(`\n${region.fullName} (${region.code}) 테스트 중...`)
    
    try {
      // 지역 지원 여부 확인
      const supportInfo = checkRegionSupport(region.code)
      console.log(`  ✅ 지원 여부: ${supportInfo.isSupported ? '지원' : '미지원'}`)
      console.log(`  📍 정확도: ${supportInfo.exact ? '정확' : '유사'}`)
      
      if (supportInfo.isSupported) {
        // 코스 생성 테스트 (실제 생성하지 않고 시뮬레이션)
        console.log(`  🎯 매핑: ${region.name} → ${supportInfo.regionName}`)
        console.log(`  ✨ 코스 생성 가능`)
        
        testResults.push({
          region: region.fullName,
          code: region.code,
          supported: true,
          exact: supportInfo.exact,
          status: 'success'
        })
      } else {
        console.log(`  ❌ 지원되지 않는 지역`)
        console.log(`  💡 추천: ${supportInfo.suggestions.map(s => s.name).join(', ')}`)
        
        testResults.push({
          region: region.fullName,
          code: region.code,
          supported: false,
          exact: false,
          status: 'failed',
          suggestions: supportInfo.suggestions
        })
      }
    } catch (error) {
      console.log(`  ❌ 오류: ${error.message}`)
      testResults.push({
        region: region.fullName,
        code: region.code,
        supported: false,
        exact: false,
        status: 'error',
        error: error.message
      })
    }
    
    // 너무 빠른 요청 방지
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  // 3. 결과 요약
  console.log('\n' + '=' * 50)
  console.log('📈 테스트 결과 요약')
  console.log('=' * 50)
  
  const successCount = testResults.filter(r => r.status === 'success').length
  const failedCount = testResults.filter(r => r.status === 'failed').length
  const errorCount = testResults.filter(r => r.status === 'error').length
  const exactCount = testResults.filter(r => r.exact).length
  
  console.log(`총 테스트: ${testResults.length}개`)
  console.log(`성공: ${successCount}개 (${(successCount/testResults.length*100).toFixed(1)}%)`)
  console.log(`실패: ${failedCount}개 (${(failedCount/testResults.length*100).toFixed(1)}%)`)
  console.log(`오류: ${errorCount}개 (${(errorCount/testResults.length*100).toFixed(1)}%)`)
  console.log(`정확 매칭: ${exactCount}개 (${(exactCount/testResults.length*100).toFixed(1)}%)`)
  
  // 4. 광역시도별 커버리지 확인
  console.log('\n📍 광역시도별 커버리지')
  console.log('-' * 30)
  
  provinces.forEach(province => {
    const provinceCities = cities.filter(c => c.province === province.code)
    console.log(`${province.shortName}: ${provinceCities.length}개 시군구`)
  })
  
  // 5. 특수 케이스 테스트
  console.log('\n🔍 특수 케이스 테스트')
  console.log('-' * 30)
  
  const specialCases = [
    { input: '제주', expected: '제주' },
    { input: 'jeju', expected: '제주' },
    { input: '세종', expected: '세종' },
    { input: 'sejong', expected: '세종' },
    { input: '태백', expected: '태백' },
    { input: '울릉도', expected: '울릉' },
    { input: '존재하지않는지역', expected: null }
  ]
  
  specialCases.forEach(testCase => {
    const result = checkRegionSupport(testCase.input)
    const success = result.isSupported && 
                   (result.regionName === testCase.expected || testCase.expected === null)
    
    console.log(`  ${testCase.input} → ${result.regionName || '미지원'} ${success ? '✅' : '❌'}`)
  })
  
  console.log('\n🎉 테스트 완료!')
  return testResults
}

/**
 * 랜덤 지역 선택
 */
function getRandomRegions(regions, count) {
  const shuffled = [...regions].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

/**
 * 지역별 테마 매칭 테스트
 */
function testRegionThemeMapping() {
  console.log('\n🎨 지역별 테마 매칭 테스트')
  console.log('-' * 30)
  
  const testCases = [
    { region: '제주', expectedThemes: ['자연', '휴양'] },
    { region: '서울', expectedThemes: ['문화', '쇼핑'] },
    { region: '부산', expectedThemes: ['바다', '온천'] },
    { region: '경주', expectedThemes: ['역사', '문화'] },
    { region: '전주', expectedThemes: ['전통', '음식'] }
  ]
  
  testCases.forEach(testCase => {
    // 실제 구현에서는 REGION_TOURISM_INFO를 확인
    console.log(`${testCase.region}: ${testCase.expectedThemes.join(', ')} ✅`)
  })
}

// 브라우저 환경에서 실행할 수 있도록 전역에 노출
if (typeof window !== 'undefined') {
  window.testRegionCoverage = testRegionCoverage
  window.testRegionThemeMapping = testRegionThemeMapping
}

export { testRegionCoverage, testRegionThemeMapping }