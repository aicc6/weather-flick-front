# Weather Flick Front End

Weather Flick의 프론트엔드 애플리케이션입니다.

## 주요 기능

### 인증 시스템

- 회원가입 및 로그인 기능
- JWT 토큰 기반 인증
- 사용자 프로필 관리
- 로그아웃 기능

### 백엔드 연결

- FastAPI 백엔드와 연동
- RESTful API 통신
- 자동 토큰 관리
- 에러 처리 및 사용자 피드백

## 설치 및 실행

### 필수 요구사항

- Node.js 18+
- npm 또는 yarn

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

### 빌드

```bash
npm run build
```

## 환경 변수

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 변수를 설정하세요:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## 백엔드 연결

이 프론트엔드는 FastAPI 백엔드와 연동됩니다. 백엔드가 실행 중이어야 정상적으로 작동합니다.

### 백엔드 실행

```bash
cd ../weather-flick-back
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 주요 컴포넌트

### 인증 관련

- `AuthContext`: 전역 인증 상태 관리
- `ProtectedRoute`: 보호된 라우트 컴포넌트
- `LoginPage`: 로그인 페이지
- `SignUpPage`: 회원가입 페이지

### API 서비스

- `api.js`: 백엔드 API 통신 서비스
- `tokenManager`: JWT 토큰 관리

## 기술 스택

- React 19
- Vite
- Tailwind CSS
- React Router DOM
- React Hook Form
- Zod (폼 검증)
- Axios (HTTP 클라이언트)
- Lucide React (아이콘)
