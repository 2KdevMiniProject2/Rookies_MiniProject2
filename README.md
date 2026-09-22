# reservation-frontend

소상공인 예약관리 서비스의 프론트엔드 저장소입니다. (React 19 + Vite + JavaScript)

백엔드(`reservation-backend`)는 별도 저장소·별도 브랜치 전략으로 관리됩니다.
두 저장소는 REST API 설계서를 계약(contract)으로 삼아 독립적으로 개발되며,
프론트엔드는 백엔드 주소를 코드에 하드코딩하지 않고 환경변수로만 참조합니다.

## 1. 사전 준비물

- Node.js 18 이상 (이 세팅은 Node 22 기준으로 확인했습니다)

## 2. 설치 및 실행

```bash
npm install
npm run dev
```

기본적으로 `http://localhost:5173`에서 뜹니다. (백엔드 `SecurityConfig`의 CORS 허용 origin과 맞춰뒀습니다.)

## 3. 백엔드 주소 설정 (환경변수)

백엔드 주소는 `.env.development` / `.env.production`에서 `VITE_API_BASE_URL`로 관리합니다.

- 로컬 개발: `.env.development` → `http://localhost:8080` (reservation-backend 기본 포트)
- 배포: `.env.production` → 실제 배포 도메인으로 교체 필요 (`CHANGE_ME.example.com` 부분)

컴포넌트에서 직접 URL을 적지 말고, 반드시 `src/api/client.js`의 `apiClient`를 통해 호출해주세요.

```js
import apiClient from '../../api/client';

apiClient.get('/api/stores');
```

## 4. 폴더 구조

백엔드와 마찬가지로 **기능 기반(vertical-slice)** 구조를 사용합니다.
레이어(components/pages 전체 통합) 대신 도메인별로 나눠서, 여러 명이 동시에 작업해도
서로 다른 폴더를 건드리게 되어 Git 충돌을 줄이는 것이 목적입니다.

```
src
├── api/            # axios 인스턴스 (client.js) — 모든 API 호출은 여기를 거칩니다
├── store/          # zustand 전역 상태 (authStore 등)
├── routes/         # 라우팅 설정(AppRouter) + 역할 기반 접근 제어(ProtectedRoute)
├── components/     # 여러 도메인이 공통으로 쓰는 UI 컴포넌트 (버튼, 모달 등)
└── features/
    ├── auth            # 회원가입/로그인
    ├── store           # 매장/메뉴/영업시간
    ├── reservation     # 예약 슬롯/예약
    ├── payment         # 결제
    ├── review          # 리뷰/리뷰 신고
    ├── favorite        # 즐겨찾기
    ├── report          # 신고 접수/처리
    ├── admin           # 관리자 전용 화면
    └── notification    # 알림
```

각 `features/<도메인>` 폴더 안에는 그 도메인이 무엇을 담당하는지 설명하는 `README.md`가
이미 들어있습니다. 페이지/컴포넌트 파일은 각자 담당 폴더 안에 자유롭게 추가하면 됩니다.
(예: `src/features/reservation/ReservationListPage.jsx`)

## 5. 역할(role) 기반 라우팅

`src/store/authStore.js`가 로그인 상태와 `role`(`USER` / `OWNER` / `ADMIN`, 백엔드 Entity 설계서의
`users.role` ENUM과 동일)을 관리합니다.

`src/routes/ProtectedRoute.jsx`로 로그인 필요 라우트/특정 role 전용 라우트를 감쌀 수 있습니다.
사용 예시는 `AppRouter.jsx` 안의 주석을 참고하세요.

이 라우트 가드는 화면 단의 1차 방어일 뿐이며, 최종적인 접근 제어는 백엔드
(`SecurityConfig`, 인증 담당자가 구현할 역할 기반 인가)가 책임집니다.

## 6. 사용 중인 주요 라이브러리

- `react-router-dom` — 라우팅
- `axios` — HTTP 클라이언트
- `zustand` — 전역 상태 관리 (Redux보다 가벼운 선택)

## 7. 배포

Vercel/Netlify 등 정적 호스팅에 배포하는 것을 전제로 합니다. 배포 전 `.env.production`의
`VITE_API_BASE_URL`을 실제 백엔드 도메인으로 반드시 바꿔주세요.
