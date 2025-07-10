# Weather Flick Frontend

날씨 기반 여행지 추천 서비스의 사용자 웹 애플리케이션입니다.

## 📋 프로젝트 개요

Weather Flick Frontend는 실시간 날씨 데이터를 기반으로 최적의 여행지를 추천하고, 여행 계획을 수립할 수 있는 React 기반 웹 애플리케이션입니다.

### 주요 기능

- **인증 시스템**: 소셜 로그인, JWT 토큰 기반 인증
- **여행 계획**: 5단계 마법사를 통한 여행 계획 생성
- **날씨 기반 추천**: 실시간 날씨 데이터를 활용한 여행지 추천
- **대화형 지도**: Google Maps 연동 여행지 검색
- **프로필 관리**: 사용자 설정 및 여행 기록 관리

## 🚀 기술 스택

| 카테고리            | 기술                    | 버전       | 선택 이유            |
| ------------------- | ----------------------- | ---------- | -------------------- |
| **프레임워크**      | React                   | 18.3.1     | 안정성과 생태계 지원 |
| **언어**            | JavaScript (JSX)        | ES2022     | 개발 속도 및 팀 역량 |
| **빌드 도구**       | Vite                    | 6.3.5      | 빠른 개발 서버       |
| **스타일링**        | TailwindCSS + Shadcn/ui | 4.1.10     | 컴포넌트 중심 디자인 |
| **상태 관리**       | Context API + Redux     | 하이브리드 | 용도별 선택적 사용   |
| **라우팅**          | React Router            | 7.6.2      | 최신 라우팅 시스템   |
| **폼 관리**         | React Hook Form + Zod   | -          | 성능과 검증          |
| **HTTP 클라이언트** | Custom Fetch            | -          | 가벼운 번들 크기     |

## 📁 프로젝트 구조

```
src/
├── components/          # 컴포넌트 (86개)
│   ├── ui/             # Shadcn/ui 컴포넌트 (25개)
│   ├── common/         # 공통 컴포넌트 (3개)
│   └── icons/          # 커스텀 아이콘 (2개)
├── pages/              # 페이지 컴포넌트 (27개)
│   ├── auth/           # 인증 관련
│   ├── planner/        # 여행 계획
│   ├── recommend/      # 추천 시스템
│   └── profile/        # 프로필 관리
├── layouts/            # 레이아웃 컴포넌트 (3개)
├── contexts/           # React Context (인증)
├── lib/                # 커스텀 HTTP 클라이언트
├── services/           # API 서비스 (2개)
├── schemas/            # Zod 스키마 (2개)
├── data/               # 정적 데이터 (5개)
└── constants/          # 상수 정의
```

## ⚙️ 설치 및 실행

### 필수 요구사항

- Node.js 18+
- npm 또는 yarn

### 설치

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 빌드 미리보기
npm run preview
```

### 개발 명령어

```bash
# 린트 검사
npm run lint

# 린트 자동 수정
npm run lint:fix

# 코드 포맷팅
npm run format
```

## 🔧 환경 설정

### 환경 변수

`.env` 파일을 생성하고 다음 변수를 설정:

```env
# API 서버 주소
VITE_API_BASE_URL=http://localhost:8000

# Google Maps API (선택사항)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# 기타 설정
VITE_APP_NAME=Weather Flick
VITE_APP_VERSION=1.0.0
```

## 🏗️ 아키텍처 특징

### 상태 관리 전략

- **Context API**: 인증, 테마 등 간단한 전역 상태
- **Redux**: 여행 계획, 복잡한 비즈니스 로직 (선택적 사용)
- **Local State**: 컴포넌트별 UI 상태

```javascript
// Context API 사용 예시 (인증)
const { user, login, logout } = useAuth()

// Redux 사용 예시 (여행 계획) - 선택적
const dispatch = useDispatch()
dispatch(createTravelPlan(planData))
```

### HTTP 통신

커스텀 fetch 기반 HTTP 클라이언트 사용:

```javascript
import { authHttp } from '@/lib/http'

// 인증이 필요한 API 호출
const response = await authHttp.GET('/travel-plans')

// 자동 Bearer 토큰 관리
// 에러 처리 및 재시도 로직 포함
```

### 컴포넌트 설계

- **Atomic Design 원칙**: ui → common → pages 구조
- **JSDoc 타입 힌트**: TypeScript 없이도 타입 안정성
- **PropTypes**: 런타임 타입 검증

```javascript
/**
 * 날씨 카드 컴포넌트
 * @param {Object} props
 * @param {Object} props.weather - 날씨 데이터
 * @param {string} props.className - 추가 CSS 클래스
 */
const WeatherCard = ({ weather, className }) => {
  // 컴포넌트 구현
}
```

## 🔗 백엔드 연동

### API 통신

FastAPI 백엔드와 RESTful API 통신:

```bash
# 백엔드 서버 실행 (weather-flick-back)
cd ../weather-flick-back
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 주요 API 엔드포인트

- `/auth/*` - 인증 관련
- `/travel-plans/*` - 여행 계획 CRUD
- `/weather/*` - 날씨 정보
- `/recommendations/*` - 추천 시스템

## 📱 주요 페이지

### 1. 메인 페이지 (`/`)

- 서비스 소개 및 주요 기능 안내
- 비로그인 사용자 대상 랜딩 페이지

### 2. 여행 계획 생성 (`/planner`)

- 5단계 마법사 UI
- 실시간 날씨 분석 및 추천

### 3. 추천 시스템 (`/recommend`)

- 날씨 기반 여행지 추천
- 지도 연동 시각화

### 4. 사용자 대시보드 (`/dashboard`)

- 개인화된 여행 계획 관리
- 날씨 알림 및 통계

## 🧪 테스트

```bash
# 테스트 실행 (설정 후)
npm run test

# 커버리지 포함
npm run test:coverage
```

## 📦 배포

### 프로덕션 빌드

```bash
npm run build
```

### 정적 파일 서빙

빌드된 `dist/` 폴더를 웹 서버로 서빙:

```bash
# Nginx 설정 예시
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /path/to/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

## 🤝 기여 가이드

1. 코딩 컨벤션: ESLint + Prettier 설정 준수
2. 커밋 메시지: Conventional Commits 사용
3. PR 생성 시 린트 검사 통과 필수

## 📈 성능 최적화

- **Code Splitting**: 페이지별 동적 임포트
- **Image Optimization**: WebP 포맷 사용
- **Bundle Analysis**: 번들 크기 모니터링
- **Lazy Loading**: 컴포넌트 지연 로딩

---

## 🔗 관련 프로젝트

- [weather-flick-back](../weather-flick-back/) - FastAPI 백엔드 서버
- [weather-flick-admin-front](../weather-flick-admin-front/) - 관리자 대시보드
- [weather-flick-batch](../weather-flick-batch/) - 데이터 수집 배치

**Weather Flick** - 날씨와 함께하는 완벽한 여행 계획 🌤️✈️
