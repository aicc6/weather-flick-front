// 지능적 지역 선택 알고리즘 테스트

// 우선순위 지역 목록 (관광지로서의 인기도, 접근성, 다양성 고려)
const PRIORITY_REGIONS = [
  // 1순위: 주요 관광도시
  { name: '제주', priority: 10, category: 'island' },
  { name: '부산', priority: 9, category: 'coastal' },
  { name: '서울', priority: 9, category: 'urban' },
  { name: '경주', priority: 8, category: 'historical' },
  { name: '전주', priority: 8, category: 'traditional' },
  { name: '강릉', priority: 7, category: 'coastal' },
  { name: '여수', priority: 7, category: 'coastal' },
  
  // 2순위: 지역 대표도시
  { name: '춘천', priority: 6, category: 'nature' },
  { name: '속초', priority: 6, category: 'coastal' },
  { name: '통영', priority: 6, category: 'coastal' },
  { name: '안동', priority: 6, category: 'traditional' },
  { name: '순천', priority: 6, category: 'nature' },
  { name: '포항', priority: 5, category: 'coastal' },
  
  // 3순위: 신흥 관광지
  { name: '세종', priority: 5, category: 'urban' },
  { name: '충주', priority: 4, category: 'nature' },
  { name: '태백', priority: 4, category: 'mountain' },
  { name: '정선', priority: 4, category: 'mountain' },
  { name: '담양', priority: 4, category: 'nature' },
  { name: '보령', priority: 4, category: 'coastal' },
  
  // 4순위: 지역 소도시
  { name: '가평', priority: 3, category: 'nature' },
  { name: '양평', priority: 3, category: 'nature' },
  { name: '영덕', priority: 3, category: 'coastal' },
  { name: '고창', priority: 3, category: 'traditional' },
  { name: '함평', priority: 3, category: 'nature' },
  { name: '화천', priority: 3, category: 'nature' },
  { name: '인제', priority: 3, category: 'nature' },
  { name: '단양', priority: 3, category: 'nature' },
  { name: '영월', priority: 3, category: 'nature' },
  { name: '진안', priority: 3, category: 'mountain' }
];

/**
 * 지능적 지역 선택 로직 - 우선순위 기반 지역 추천
 * @param {Set} existingRegions - 이미 존재하는 지역들
 * @param {number} maxCount - 최대 생성할 지역 수
 * @returns {Array} 선택된 지역명 배열
 */
function selectRegionsForGeneration(existingRegions, maxCount = 3) {
  // 이미 존재하는 지역 제외
  const availableRegions = PRIORITY_REGIONS.filter(
    region => !existingRegions.has(region.name)
  );
  
  // 다양성을 위한 카테고리별 분산 선택
  const selectedRegions = [];
  const usedCategories = new Set();
  
  // 1차: 높은 우선순위 + 카테고리 다양성
  for (const region of availableRegions) {
    if (selectedRegions.length >= maxCount) break;
    
    if (!usedCategories.has(region.category) && region.priority >= 6) {
      selectedRegions.push(region.name);
      usedCategories.add(region.category);
    }
  }
  
  // 2차: 남은 자리를 우선순위 순으로 채우기
  for (const region of availableRegions) {
    if (selectedRegions.length >= maxCount) break;
    
    if (!selectedRegions.includes(region.name)) {
      selectedRegions.push(region.name);
    }
  }
  
  return { selectedRegions, usedCategories: Array.from(usedCategories) };
}

// 테스트 시나리오
function runRegionSelectionTests() {
  console.log('🎯 지능적 지역 선택 알고리즘 테스트');
  console.log('=' * 50);
  
  // 시나리오 1: 빈 지역에서 시작
  console.log('\n📋 시나리오 1: 빈 지역에서 3개 선택');
  console.log('-' * 30);
  
  const scenario1 = selectRegionsForGeneration(new Set(), 3);
  console.log('선택된 지역:', scenario1.selectedRegions.join(', '));
  console.log('사용된 카테고리:', scenario1.usedCategories.join(', '));
  console.log('다양성:', scenario1.usedCategories.length === scenario1.selectedRegions.length ? '✅ 완벽' : '⚠️ 부분적');
  
  // 시나리오 2: 일부 주요 지역이 이미 존재
  console.log('\n📋 시나리오 2: 주요 지역 존재 시 5개 선택');
  console.log('-' * 30);
  
  const existingRegions2 = new Set(['제주', '서울', '부산']);
  const scenario2 = selectRegionsForGeneration(existingRegions2, 5);
  console.log('기존 지역:', Array.from(existingRegions2).join(', '));
  console.log('선택된 지역:', scenario2.selectedRegions.join(', '));
  console.log('사용된 카테고리:', scenario2.usedCategories.join(', '));
  
  // 시나리오 3: 많은 지역이 이미 존재
  console.log('\n📋 시나리오 3: 많은 지역 존재 시 2개 선택');
  console.log('-' * 30);
  
  const existingRegions3 = new Set([
    '제주', '서울', '부산', '경주', '전주', '강릉', '여수', '춘천', '속초'
  ]);
  const scenario3 = selectRegionsForGeneration(existingRegions3, 2);
  console.log('기존 지역:', Array.from(existingRegions3).join(', '));
  console.log('선택된 지역:', scenario3.selectedRegions.join(', '));
  console.log('사용된 카테고리:', scenario3.usedCategories.join(', '));
  
  // 시나리오 4: 카테고리별 분석
  console.log('\n📊 카테고리별 지역 분석');
  console.log('-' * 30);
  
  const categoryStats = {};
  PRIORITY_REGIONS.forEach(region => {
    if (!categoryStats[region.category]) {
      categoryStats[region.category] = [];
    }
    categoryStats[region.category].push(region);
  });
  
  Object.entries(categoryStats).forEach(([category, regions]) => {
    const avgPriority = (regions.reduce((sum, r) => sum + r.priority, 0) / regions.length).toFixed(1);
    console.log(`${category}: ${regions.length}개 지역, 평균 우선순위 ${avgPriority}`);
    console.log(`  대표 지역: ${regions.slice(0, 3).map(r => r.name).join(', ')}`);
  });
  
  // 시나리오 5: 우선순위별 분석
  console.log('\n📈 우선순위별 지역 분석');
  console.log('-' * 30);
  
  const priorityGroups = {
    '최고 우선순위 (8-10)': PRIORITY_REGIONS.filter(r => r.priority >= 8),
    '높은 우선순위 (6-7)': PRIORITY_REGIONS.filter(r => r.priority >= 6 && r.priority < 8),
    '중간 우선순위 (4-5)': PRIORITY_REGIONS.filter(r => r.priority >= 4 && r.priority < 6),
    '낮은 우선순위 (1-3)': PRIORITY_REGIONS.filter(r => r.priority < 4)
  };
  
  Object.entries(priorityGroups).forEach(([group, regions]) => {
    console.log(`${group}: ${regions.length}개`);
    console.log(`  지역: ${regions.map(r => r.name).join(', ')}`);
  });
  
  // 시나리오 6: 알고리즘 성능 테스트
  console.log('\n⚡ 알고리즘 성능 테스트');
  console.log('-' * 30);
  
  const performanceTests = [
    { existing: new Set(), max: 1, name: '최소 선택' },
    { existing: new Set(), max: 3, name: '기본 선택' },
    { existing: new Set(), max: 5, name: '확장 선택' },
    { existing: new Set(), max: 10, name: '대량 선택' },
    { existing: new Set(['제주', '서울']), max: 3, name: '부분 존재' },
    { existing: new Set(PRIORITY_REGIONS.slice(0, 20).map(r => r.name)), max: 3, name: '대부분 존재' }
  ];
  
  performanceTests.forEach(test => {
    const startTime = performance.now();
    const result = selectRegionsForGeneration(test.existing, test.max);
    const endTime = performance.now();
    
    console.log(`${test.name}: ${result.selectedRegions.length}개 선택 (${(endTime - startTime).toFixed(2)}ms)`);
    console.log(`  다양성: ${result.usedCategories.length}개 카테고리`);
  });
  
  console.log('\n✅ 지능적 지역 선택 알고리즘 테스트 완료!');
}

// 실행
runRegionSelectionTests();