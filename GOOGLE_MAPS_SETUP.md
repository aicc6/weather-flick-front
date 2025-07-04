# Google Maps API 설정 가이드

## 🚨 중요: API 키 설정 필수

현재 페이지에 접속하면 "Google Maps API 키가 설정되지 않았습니다" 에러가 발생합니다. 아래 단계를 따라 설정해주세요.

## 1. Google Cloud Console 설정

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 프로젝트를 생성하거나 기존 프로젝트 선택
3. "API 및 서비스" > "라이브러리" 이동
4. "Maps JavaScript API" 검색 후 활성화
5. "사용자 인증 정보" 탭으로 이동
6. "+ 사용자 인증 정보 만들기" > "API 키" 선택
7. API 키가 생성되면 복사 (예: `AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

## 2. 환경변수 설정 ⭐ 가장 중요한 단계

### Windows/Mac/Linux 공통 방법:

1. **프로젝트 루트 폴더에 `.env` 파일 생성**

   ```bash
   # weather-flick-front 폴더에서 실행
   touch .env  # Mac/Linux
   # 또는 Windows에서는 파일 탐색기에서 새 파일 생성
   ```

2. **`.env` 파일 내용 작성**

   ```
   VITE_GOOGLE_MAPS_API_KEY=여기에_발급받은_실제_API_키_입력
   ```

   **예시:**

   ```
   VITE_GOOGLE_MAPS_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

3. **파일 저장 후 개발 서버 재시작**
   ```bash
   # 기존 서버 중지 (Ctrl+C)
   npm run dev
   ```

### 💡 주의사항

- `YOUR_API_KEY_HERE`나 `YOUR_GOOGLE_MAPS_API_KEY_HERE` 같은 플레이스홀더 텍스트는 실제 API 키로 교체해야 합니다
- API 키 앞뒤에 따옴표나 공백이 없어야 합니다
- `.env` 파일은 Git에 커밋되지 않습니다 (보안상 안전)

## 3. API 키 제한 설정 (보안)

1. Google Cloud Console에서 생성한 API 키 클릭
2. "애플리케이션 제한사항"에서 "HTTP 리퍼러(웹사이트)" 선택
3. 웹사이트 제한사항에 다음 도메인 추가:
   - `localhost:5173/*` (개발 환경)
   - `127.0.0.1:5173/*` (개발 환경)
   - `your-domain.com/*` (프로덕션 환경)
4. "API 제한사항"에서 "키 제한" 선택
5. "Maps JavaScript API" 선택

## 4. 문제 해결

### 문제: "InvalidKey" 에러

**해결:** API 키가 잘못되었거나 Maps JavaScript API가 활성화되지 않음

- Google Cloud Console에서 Maps JavaScript API 활성화 확인
- API 키 재생성 후 교체

### 문제: "RefererNotAllowedMapError" 에러

**해결:** API 키의 도메인 제한 설정 확인

- `localhost:5173/*`과 `127.0.0.1:5173/*` 추가

### 문제: 여전히 "API 키가 설정되지 않았습니다" 에러

**해결:** 환경변수 설정 재확인

1. `.env` 파일이 `weather-flick-front` 폴더에 있는지 확인
2. 파일 내용에 `VITE_GOOGLE_MAPS_API_KEY=실제키` 형태로 되어있는지 확인
3. 개발 서버 재시작 (`npm run dev`)

## 5. 비용 관리

- Google Maps API는 **월 $200 크레딧** 제공 (대부분 개발용으로 충분)
- [요금 정보](https://cloud.google.com/maps-platform/pricing)를 확인하세요
- 일일 할당량을 설정하여 비용을 제어할 수 있습니다

## 6. 최종 확인

설정이 완료되면:

1. `http://localhost:5173/customized-schedule/region` 접속
2. "실제 지도" 모드에서 한국 지도가 표시되는지 확인
3. 빨간 마커들이 각 도시에 표시되는지 확인
4. 마커 클릭 시 도시가 선택되는지 확인

---

**🔗 도움이 필요하시면:**

- [Google Maps JavaScript API 문서](https://developers.google.com/maps/documentation/javascript)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Vite 환경변수 가이드](https://vitejs.dev/guide/env-and-mode.html)
