# Tmap API 통합 가이드

## 개요

Weather Flick 프론트엔드에서 Tmap API를 활용하여 매핑되지 않은 지역들의 이미지를 동적으로 가져오는 기능입니다.

## 주요 기능

### 1. 다단계 이미지 제공 시스템
1. **정적 이미지** (1순위): 사전 정의된 고품질 이미지
2. **Tmap API** (2순위): 좌표 기반 실시간 이미지
3. **Fallback 이미지** (3순위): 기본 대체 이미지

### 2. Tmap API 활용 기능
- **Geocoding**: 지역명 → 좌표 변환
- **POI 검색**: 주변 관광지 정보 수집
- **이미지 생성**: 좌표 기반 실제 지역 이미지

## 설정 방법

### 1. API 키 발급
1. [SK Open API](https://openapi.sk.com) 사이트 접속
2. Tmap API 서비스 신청
3. 앱 키 발급

### 2. 환경변수 설정
```bash
# .env 파일에 추가
VITE_TMAP_APP_KEY=your_tmap_app_key_here
```

### 3. API 권한 설정
Tmap API 콘솔에서 다음 권한 활성화:
- `Geocoding API` (주소 → 좌표)
- `POI 통합검색 API` (관광지 검색)

## 사용 방법

### 기본 사용
```javascript
import { getMultipleRegionImages } from '@/services/imageService'

// 여러 지역 이미지 한 번에 가져오기
const images = await getMultipleRegionImages(['서울', '부산', '새로운지역'])

// 결과:
// {
//   '서울': 'https://static-image-url.jpg',      // 정적 이미지
//   '부산': 'https://static-image-url.jpg',      // 정적 이미지  
//   '새로운지역': 'https://dynamic-image-url.jpg' // Tmap API 이미지
// }
```

### 단일 지역 이미지
```javascript
import { getRegionFirstImage } from '@/services/imageService'

const imageUrl = await getRegionFirstImage('새로운지역')
```

### API 상태 확인
```javascript
import { checkTmapApiStatus } from '@/services/tmapService'

const isAvailable = await checkTmapApiStatus()
if (isAvailable) {
  console.log('Tmap API 사용 가능')
}
```

## API 상태 모니터링

### 개발 환경에서 상태 확인
```jsx
import TmapApiStatus from '@/components/admin/TmapApiStatus'

// 개발 화면에 상태 컴포넌트 추가
<TmapApiStatus />
```

### 로그 확인
개발 환경에서는 콘솔에서 다음 정보 확인 가능:
```
이미지 로딩 시작: 3개 지역
지역 코드 목록: ['seoul', 'busan', 'new-region']
Tmap API로 처리할 지역들: ['new-region']
new-region -> Tmap 이미지
이미지 로딩 완료: 3개
로딩 시간: 1250.45ms
```

## 성능 최적화

### 1. 병렬 처리
- 여러 지역의 Tmap API 호출을 동시에 처리
- Promise.allSettled로 안정성 보장

### 2. 캐싱 전략
- 정적 이미지: 브라우저 캐시 활용
- Tmap 이미지: URL 기반 캐싱

### 3. 타임아웃 처리
```javascript
// tmapService.js에서 타임아웃 설정
const response = await fetch(url, {
  signal: AbortSignal.timeout(5000) // 5초 타임아웃
})
```

## 에러 처리

### 1. API 키 미설정
```javascript
if (!TMAP_CONFIG.appKey) {
  console.warn('Tmap API Key가 설정되지 않았습니다.')
  return fallbackImage
}
```

### 2. 네트워크 오류
```javascript
try {
  const tmapImage = await getRegionImageFromTmap(region)
  return tmapImage
} catch (error) {
  console.error('Tmap API 오류:', error)
  return fallbackImage
}
```

### 3. 단계별 Fallback
1. Tmap API 실패 → 정적 fallback 이미지
2. 모든 이미지 실패 → 기본 placeholder 이미지

## 실제 사용 사례

### 추천 페이지에서의 활용
```javascript
// src/pages/recommend/index.jsx
const images = await getMultipleRegionImages(regionNamesForImages)

// 결과: 정적 + Tmap 이미지 혼합
// - 제주, 서울, 부산: 정적 이미지 (빠름)
// - 신규 지역들: Tmap API 이미지 (동적)
```

## 문제 해결

### 1. API 키 관련
- `.env` 파일에 올바른 키 설정 확인
- 환경변수 이름: `VITE_TMAP_APP_KEY`
- 개발 서버 재시작 필요

### 2. CORS 오류
- Tmap API는 브라우저에서 직접 호출 가능
- 도메인 등록이 필요한 경우 SK Open API 콘솔에서 설정

### 3. 이미지 로딩 실패
```javascript
// 이미지 유효성 검사
import { validateImageUrl } from '@/utils/regionImageUtils'

const isValid = await validateImageUrl(imageUrl)
if (!isValid) {
  // fallback 처리
}
```

## 모니터링 및 분석

### 성능 메트릭
- 이미지 로딩 시간 측정
- Tmap API 성공률 추적
- fallback 사용률 모니터링

### 로그 분석
```javascript
// 개발 환경에서만 상세 로그
if (import.meta.env.DEV) {
  console.log('📊 이미지 소스별 통계:', {
    static: staticCount,
    tmap: tmapCount,
    fallback: fallbackCount
  })
}
```

## 향후 개선 계획

1. **캐싱 강화**: Redis/LocalStorage 기반 캐싱
2. **이미지 품질 향상**: 더 나은 이미지 소스 추가
3. **사용자 맞춤화**: 지역별 선호 이미지 학습
4. **성능 최적화**: WebP 포맷 지원, 지연 로딩

## 관련 파일

- `src/services/tmapService.js` - Tmap API 핵심 로직
- `src/services/imageService.js` - 통합 이미지 서비스
- `src/utils/regionImageUtils.js` - 유틸리티 함수
- `src/components/admin/TmapApiStatus.jsx` - 상태 모니터링 컴포넌트