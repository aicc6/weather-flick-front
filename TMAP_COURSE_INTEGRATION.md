# Tmap API 여행 코스 생성 통합 가이드

## 개요

Weather Flick에서 Tmap API를 활용하여 없는 지역들의 여행 코스를 동적으로 생성하는 시스템입니다. 기존 API 데이터가 부족하거나 없는 지역에 대해 실제 관광지 POI 데이터를 기반으로 완전한 여행 코스를 자동 생성합니다.

## 주요 기능

### 🗺️ **자동 코스 생성 시스템**
1. **POI 검색**: 지역 좌표 기반 관광지 검색
2. **테마별 분류**: 자연, 문화, 역사, 맛집, 액티비티별 POI 분류
3. **일정 최적화**: 하루별 방문 장소 자동 배치
4. **메타데이터 생성**: 제목, 설명, 팁, 이미지 등 자동 생성

### 🔄 **기존 시스템과의 통합**
- **투명한 통합**: 기존 API 응답에 자연스럽게 포함
- **자동 보완**: 부족한 데이터를 감지하여 자동 생성
- **일관된 형식**: 기존 코스와 동일한 데이터 구조

## 시스템 아키텍처

### 1. 데이터 흐름
```
1. API 요청 → 2. 기존 데이터 확인 → 3. 부족한 지역 식별 → 4. Tmap 코스 생성 → 5. 통합 응답
```

### 2. 생성 과정
```javascript
지역명 입력 → 좌표 변환 → POI 검색 → 테마 분류 → 일정 생성 → 메타데이터 생성 → 완성된 코스
```

## 구현된 주요 컴포넌트

### 1. 코어 서비스
- `tmapCourseService.js` - 코스 생성 핵심 로직
- `tmapService.js` - Tmap API 통신
- `travelCoursesApi.js` - RTK Query 통합

### 2. 유틸리티
- `regionImageUtils.js` - 지역 데이터 정규화
- `TmapCourseStatus.jsx` - 개발 모니터링

## 사용 방법

### 1. 기본 설정
```bash
# .env 파일에 Tmap API 키 추가
VITE_TMAP_APP_KEY=your_tmap_app_key_here
```

### 2. 자동 통합 (수정 불필요)
기존 여행 코스 API 호출 시 자동으로 작동:

```javascript
// 기존 코드 그대로 사용
const { data: courses } = useGetTravelCoursesQuery()

// 결과: 기존 코스 + Tmap 생성 코스 자동 포함
// - 제주, 부산 등: 기존 API 데이터
// - 세종, 충주 등: Tmap으로 자동 생성된 데이터
```

### 3. 특정 지역 검색 시
```javascript
// 특정 지역 검색 시 데이터가 없으면 자동 생성
const { data: searchResults } = useSearchTravelCoursesQuery({
  region_code: 'sejong' // 세종시 검색
})

// 결과: 기존 데이터가 없으면 Tmap으로 실시간 생성
```

## 생성되는 코스 구조

### 완전한 여행 코스 데이터
```javascript
{
  id: "tmap_course_세종_1640995200000",
  title: "세종 관광 여행",
  subtitle: "세종의 매력을 느낄 수 있는 특별한 여행",
  region: "세종",
  duration: "2박 3일",
  theme: ["관광"],
  mainImage: "https://source.unsplash.com/800x600/?세종,korea,travel",
  images: ["..."], // 6개 이미지
  rating: 4.3,
  reviewCount: 23,
  likeCount: 156,
  viewCount: 892,
  price: "문의",
  bestMonths: [3, 4, 5, 9, 10, 11],
  summary: "세종의 관광 명소들을 둘러보는 알찬 여행 코스입니다.",
  description: "세종을 대표하는 5개의 특별한 장소를 방문하여...",
  highlights: [
    "세종 대표 명소 5곳 방문",
    "지역 전문가가 추천하는 숨은 맛집",
    "포토존에서 인생샷 촬영",
    "지역 특산품 체험 및 구매"
  ],
  itinerary: [
    {
      day: 1,
      title: "1일차",
      places: [
        {
          id: "tmap_poi_abc123",
          name: "세종호수공원",
          address: "세종특별자치시 조치원읍",
          coordinates: { lat: 36.5040, lng: 127.2618 },
          category: "공원",
          description: "세종의 대표적인 공원으로...",
          estimatedTime: "2-3시간",
          tips: ["미리 운영시간을 확인하고 방문하세요"],
          rating: 4.2,
          region: "세종"
        }
        // ... 더 많은 장소들
      ],
      summary: "3개의 특별한 장소를 방문합니다",
      totalTime: "약 6시간"
    }
    // ... 2일차, 3일차
  ],
  tips: [
    "편안한 걷기 신발을 준비하세요",
    "날씨에 맞는 옷차림을 권장합니다"
  ],
  includes: ["전문 가이드", "주요 입장료", "지역 특산품 시식"],
  excludes: ["개인 식비", "교통비", "개인 쇼핑"],
  tags: ["세종", "국내여행", "가족여행"],
  source: "tmap_generated" // 생성 소스 표시
}
```

## 자동 생성 조건

### 1. 전체 코스 목록 조회 시
- API 응답 코스 수 < 5개일 때
- 부족한 지역들을 자동 식별
- 최대 3개 지역까지 추가 생성

### 2. 특정 지역 검색 시
- 해당 지역 검색 결과가 0개일 때
- 즉시 해당 지역 코스 생성
- 선택된 테마 적용

### 3. Fallback 동작
- Tmap API 실패 시 기본 템플릿 사용
- 네트워크 오류 시 graceful degradation
- API 키 없어도 기본 코스 제공

## 성능 최적화

### 1. 지능형 캐싱
```javascript
// RTK Query 캐싱 활용
keepUnusedDataFor: 300, // 5분간 캐싱
// 동일 지역 재요청 시 캐시 사용
```

### 2. 병렬 처리
```javascript
// 여러 지역 동시 생성
const tmapCourses = await generateMultipleCourses(missingRegions)
```

### 3. 점진적 로딩
- 기존 데이터 먼저 표시
- Tmap 생성 코스 백그라운드 추가
- 사용자 경험 중단 없음

## 모니터링 및 디버깅

### 개발 환경 로그
```javascript
// 코스 생성 과정 추적
console.log('Tmap 코스로 보완:', tmapCourses.length, '개')
console.log('세종 지역 Tmap 코스 생성:', course.title)
console.log('일괄 코스 생성 완료:', { total, success, failed })
```

### 상태 모니터링 컴포넌트
```jsx
import TmapCourseStatus from '@/components/admin/TmapCourseStatus'

// 개발 화면에 추가
<TmapCourseStatus />
```

### 테스트 기능
- 단일 지역 코스 생성 테스트
- 다중 지역 일괄 생성 테스트
- API 상태 실시간 모니터링
- 생성 통계 및 성능 메트릭

## POI 기반 생성 로직

### 1. 지역 좌표 획득
```javascript
const coordinates = await getRegionCoordinates('세종')
// 결과: { lat: 36.5040, lng: 127.2618 }
```

### 2. 주변 관광지 검색
```javascript
const attractions = await getTouristAttractions(lat, lng, 15000) // 15km 반경
```

### 3. 테마별 분류
```javascript
const categorizedPOIs = categorizePOIsByTheme(attractions, 'nature')
// 자연 관련 키워드로 필터링
```

### 4. 일정 최적화
```javascript
const dailyItinerary = groupPOIsByDay(pois, '2박 3일')
// 하루당 3개씩 배분
```

## 테마별 특화 기능

### 지원 테마
- `nature`: 자연 (산, 바다, 공원, 숲)
- `culture`: 문화 (박물관, 전시관, 예술, 공연)
- `history`: 역사 (유적, 전통, 고궁, 사찰)
- `food`: 맛집 (전통음식, 카페, 시장)
- `activity`: 액티비티 (체험, 놀이, 스포츠)

### 테마별 자동 생성
```javascript
const course = await generateTravelCourse('세종', {
  theme: 'culture', // 문화 테마
  duration: '2박 3일'
})
```

## 에러 처리 및 안정성

### 1. 다단계 Fallback
```
Tmap POI 검색 → Tmap 실패 시 기본 POI → 전체 실패 시 템플릿 코스
```

### 2. 안전한 데이터 생성
```javascript
// 모든 필수 필드 보장
rating: generatePOIRating(), // 3.5-4.8 범위
estimatedTime: estimateVisitTime(poi), // 카테고리별 적절한 시간
tips: generatePOITips(poi), // 상황별 유용한 팁
```

### 3. 타임아웃 처리
```javascript
// 생성 시간 제한
const controller = new AbortController()
setTimeout(() => controller.abort(), 10000) // 10초 타임아웃
```

## 실제 사용 예시

### 기존 추천 페이지에서의 동작
1. 사용자가 추천 페이지 접속
2. API에서 기존 코스 5개 미만 반환
3. 자동으로 부족한 지역 식별 (예: 세종, 충주, 태백)
4. Tmap으로 해당 지역들 코스 생성
5. 기존 코스 + 생성된 코스 통합 표시
6. 사용자는 모든 지역의 코스를 볼 수 있음

### 지역 검색 시의 동작
1. 사용자가 "세종" 지역 선택
2. 기존 API에서 세종 데이터 없음
3. 즉시 Tmap으로 세종 코스 생성
4. POI 검색 → 세종호수공원, 정부청사 등 발견
5. 2박 3일 일정으로 구성
6. 완성된 코스를 사용자에게 표시

## 향후 확장 계획

1. **머신러닝 통합**: 사용자 선호도 학습
2. **실시간 업데이트**: POI 정보 정기 갱신
3. **소셜 통합**: 사용자 리뷰 연동
4. **개인화**: 여행 스타일별 맞춤 생성
5. **최적 경로**: 실제 교통 정보 기반 경로 최적화

## 관련 파일

- `src/services/tmapCourseService.js` - 코스 생성 핵심 로직
- `src/services/tmapService.js` - Tmap API 통신
- `src/store/api/travelCoursesApi.js` - RTK Query 통합
- `src/components/admin/TmapCourseStatus.jsx` - 모니터링 컴포넌트
- `src/utils/regionImageUtils.js` - 지역 데이터 유틸리티
- `TMAP_INTEGRATION.md` - 기본 Tmap 통합 가이드