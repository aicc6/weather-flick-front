# Firebase Cloud Messaging (FCM) 설정 가이드

Weather Flick에 FCM 푸시 알림 기능이 추가되었습니다. 아래 단계를 따라 설정하세요.

## 1. Firebase 프로젝트 설정

1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. 프로젝트 설정 > 일반에서 웹 앱 추가
4. Firebase SDK 구성 정보 복사

## 2. 환경 변수 설정

`.env` 파일에 다음 Firebase 설정 추가:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_FIREBASE_VAPID_KEY=your_vapid_key
```

## 3. VAPID 키 생성

1. Firebase Console > 프로젝트 설정 > 클라우드 메시징
2. 웹 푸시 인증서 섹션에서 "키 쌍 생성" 클릭
3. 생성된 키를 `VITE_FIREBASE_VAPID_KEY`에 입력

## 4. 구현된 기능

### 프론트엔드 기능

- ✅ Firebase SDK 초기화
- ✅ Service Worker에서 백그라운드 메시지 처리
- ✅ 포그라운드 메시지 처리 (커스텀 토스트 알림)
- ✅ 알림 권한 요청 UI
- ✅ FCM 토큰 관리
- ✅ 알림 클릭 핸들러 (특정 페이지로 이동)
- ✅ 알림 설정 페이지

### 주요 파일

- `/src/lib/firebase.js` - Firebase 초기화 및 FCM 헬퍼 함수
- `/src/services/notificationService.js` - 알림 관련 API 서비스
- `/src/hooks/useNotification.js` - 알림 처리 커스텀 훅
- `/src/components/common/NotificationPermission.jsx` - 알림 권한 요청 UI
- `/public/firebase-messaging-sw.js` - FCM Service Worker

## 5. 백엔드 API 구현 필요

다음 API 엔드포인트 구현이 필요합니다:

### FCM 토큰 관리

```
POST   /api/notifications/fcm-token     # FCM 토큰 저장
DELETE /api/notifications/fcm-token     # FCM 토큰 삭제
```

### 알림 설정

```
GET    /api/notifications/settings      # 알림 설정 조회
PUT    /api/notifications/settings      # 알림 설정 업데이트
```

### 알림 히스토리

```
GET    /api/notifications/history       # 알림 히스토리 조회
PUT    /api/notifications/:id/read      # 알림 읽음 처리
PUT    /api/notifications/read-all      # 전체 알림 읽음 처리
```

## 6. 테스트 방법

1. 개발 서버 실행: `npm run dev`
2. 로그인 후 5초 뒤에 알림 권한 요청 팝업 표시
3. "알림 켜기" 클릭하여 권한 승인
4. 브라우저 콘솔에서 FCM 토큰 확인
5. Firebase Console에서 테스트 메시지 전송

## 7. 푸시 알림 전송 예제 (백엔드)

```python
from firebase_admin import messaging

# 특정 사용자에게 알림 전송
message = messaging.Message(
    notification=messaging.Notification(
        title='여행 계획 업데이트',
        body='서울 여행 계획이 업데이트되었습니다.',
    ),
    data={
        'url': '/travel-plans/123',
        'type': 'travel_update'
    },
    token=user_fcm_token,
)

response = messaging.send(message)
```

## 8. 주의사항

- HTTPS 환경에서만 작동 (localhost는 예외)
- iOS Safari는 PWA 설치 후에만 푸시 알림 지원
- 사용자가 알림을 거부한 경우 브라우저 설정에서 직접 변경 필요
- FCM 토큰은 주기적으로 갱신될 수 있으므로 토큰 업데이트 로직 필요

## 9. 추가 개선 사항

- [ ] 알림 카테고리별 on/off 설정
- [ ] 알림 히스토리 페이지
- [ ] 알림 배지 카운트
- [ ] 알림음 커스터마이징
- [ ] 예약 알림 기능
