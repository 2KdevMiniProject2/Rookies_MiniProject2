# reservation-frontend

소상공인 예약관리 서비스의 프론트엔드 저장소입니다. (React 19 + Vite + JavaScript)

## 팀 구성

| GitHub | 담당 도메인 | 주요 작업 |
|---|---|---|
| 본영 | 주문(Order) — 장바구니 · 주문 현황 · 사장님 대시보드 | 주문 페이지(가게 정보·메뉴·장바구니 바), 장바구니(수량 조절·픽업 시간·요청사항), 손님 주문 상태 페이지(백엔드 연동, 취소 상태 표시), 사장님 주문 대시보드(상태 변경, 매출 연동), 매출 API 단위 테스트(Vitest) |
| 영서 | 매장(Store) — 매장/메뉴 관리, 마이페이지 | 매장 등록·수정·삭제, 메뉴 등록, 이미지 업로드 연결, 마이페이지(정보 수정, 로고/화면 정리) |
| 승호 | 인증(Auth) · 공통 UI — 로그인/회원가입, 메인 홈 디자인 | 로그인/회원가입 화면 구현 및 인증 연동, 메인 홈 화면 UI 통일, 백엔드 API 연동 기반 작업, 매장 검색 기능 오류 수정 |

## 1. 사전 준비물

- Node.js 18 이상 (이 세팅은 Node 22 기준으로 확인했습니다)

## 2. 설치 및 실행

```bash
npm install
npm run dev
```

기본적으로 `http://localhost:5173`에서 뜹니다. (백엔드 `SecurityConfig`의 CORS 허용 origin과 맞춰뒀습니다.)

### 테스트 / 린트

```bash
npm run test     # vitest
npm run lint      # oxlint
npm run build     # 프로덕션 빌드
```

## 3. 백엔드 주소 설정 (환경변수)

백엔드 주소는 `.env.development` / `.env.production`에서 `VITE_API_BASE_URL`로 관리합니다.

- 로컬 개발: `.env.development` → `http://localhost:8080` (`./mvnw spring-boot:run` 기준 기본 포트)
- 배포: `.env.production` → 실제 배포 도메인으로 교체 필요 (`CHANGE_ME.example.com` 부분)

컴포넌트에서 직접 URL을 적지 말고, 반드시 `src/api/client.js`의 `apiClient`를 통해 호출해주세요.

```js
import apiClient from '../../api/client';

apiClient.get('/api/stores');
```

백엔드 에러 응답은 전부 `{ status, message, timestamp, errors }` 형태로 내려옵니다(`errors`는 입력값 검증 실패 400일 때만 필드별 메시지 맵으로 채워짐). 에러 처리 로직을 짤 때 이 형식을 기준으로 삼으면 됩니다.

## 4. 폴더 구조

백엔드와 마찬가지로 **기능 기반(vertical-slice)** 구조를 사용합니다. 레이어(components/pages 전체 통합) 대신 도메인별로 나눠서, 여러 명이 동시에 작업해도 서로 다른 폴더를 건드리게 되어 Git 충돌을 줄이는 것이 목적입니다.

```
src
├── api/            # axios 인스턴스 (client.js) — 모든 API 호출은 여기를 거칩니다
├── store/          # zustand 전역 상태 (authStore, dashboardStore, orderStatusStore 등)
├── routes/         # 라우팅 설정(AppRouter) + 역할 기반 접근 제어(ProtectedRoute)
├── components/     # 여러 도메인이 공통으로 쓰는 UI 컴포넌트 (버튼, 모달 등)
└── features/
    ├── auth            # 회원가입/로그인/내 정보
    ├── store           # 매장/메뉴/영업시간
    ├── order           # 장바구니/주문 현황/사장님 매장별 주문 관리, 대시보드
    ├── reservation     # 예약 슬롯/예약
    ├── payment         # 결제
    ├── review          # 리뷰/리뷰 신고
    ├── favorite        # 즐겨찾기
    ├── report          # 신고 접수/처리
    ├── admin           # 관리자 전용 화면
    └── notification    # 알림
```

각 `features/<도메인>` 폴더 안에는 그 도메인이 무엇을 담당하는지 설명하는 `README.md`가 이미 들어있습니다. 페이지/컴포넌트 파일은 각자 담당 폴더 안에 자유롭게 추가하면 됩니다. (예: `src/features/order/StoreOrderPage.jsx`)

`auth`/`store`/`order` 세 도메인은 실제 화면과 백엔드 연동까지 완료되어 있고, 나머지(`reservation`/`payment`/`review`/`favorite`/`report`/`admin`/`notification`)는 폴더와 설명용 README만 먼저 갖춰둔 다음 스프린트 구현 대상입니다.

## 5. 구현된 기능 상세

### 인증 (`features/auth`)
- `LoginPage.jsx` / `SignupForm.jsx`: 이메일·비밀번호 형식 검증 포함 로그인/회원가입 화면
- 개발 환경에서만(`import.meta.env.DEV`) 노출되는 모의 로그인 버튼으로, 매번 로그인하지 않고도 사장님/손님 계정 화면을 바로 확인 가능
- `authStore.js`(zustand `persist`)가 로그인 상태를 `localStorage`(`auth-storage`)에 보관해 새로고침해도 로그인 유지

### 매장 탐색 (`features/store`)
- `StoreListPage.jsx`(메인 홈 `/`): 카테고리 필터 + 키워드 검색을 서버 쿼리(`?category=&keyword=`)로 실시간 반영, 검색어 입력은 0.3초 디바운스 처리하고 느리게 도착한 응답이 최신 검색을 덮어쓰지 않도록 가드, 8개 단위 페이지네이션
- `StoreCard.jsx`: 매장 영업시간을 기준으로 영업중/영업종료 배지를 계산(자정을 넘기는 영업시간도 올바르게 처리)
- `CategoryFilter.jsx`: 카테고리별 필터 UI
- 사장님 화면: 매장 등록(`StoreRegisterPage`) / 수정(`StoreEditPage`) / 메뉴 등록·품절 처리·이미지 업로드(`MenuRegisterPage`), 소유 매장 목록(`OwnerStoreListPage`)

### 장바구니·주문 (`features/order`)
- `StoreOrderPage.jsx`(`/stores/:storeId`): 매장 정보와 메뉴 목록을 병렬로 불러오고(`Promise.all`), 품절 메뉴는 담기 비활성화, 하단 고정 장바구니 바 제공, 비로그인 상태로 장바구니를 열면 로그인 화면으로 이동
- `CartPage.jsx`(`/cart`): 메뉴별 수량 조절, 픽업 가능 시간을 지금+15분부터 10분 단위로 최대 8칸 자동 계산(매장 영업시간 범위 내로 제한), 요청사항 입력(255자 제한, 글자 수 표시), 주문 전송 후 바로 주문 상태 화면으로 이동하며 "품절된 메뉴가 포함되어 있습니다: 크루아상" 같은 서버 메시지를 그대로 보여줌
- `OrderStatusPage.jsx`(`/orders/:orderId`): 5초 주기로 폴링하며 접수대기→수락→준비완료→픽업완료 4단계 진행 바를 보여주고, 거절/취소는 진행 바 없는 별도 종료 상태로 표시
- `DashboardPage.jsx`(사장님, `/owner/stores/:storeId/orders`): 5초 주기로 폴링하며 접수대기/수락/준비완료 주문을 칸반 형태 3열로 보여주고 각 열에서 수락·거절·다음 단계로 진행 버튼 제공(거절은 `window.confirm`으로 한 번 더 확인), "오늘의 영업 요약" 타일로 당일 주문 수·매출 표시, 픽업완료·거절 주문은 접이식 이력 섹션으로 분리

## 6. 역할(role) 기반 라우팅

`src/store/authStore.js`가 로그인 상태와 `role`(`USER` / `OWNER` / `ADMIN`, 백엔드 Entity 설계서의 `users.role` ENUM과 동일)을 관리합니다.

`src/routes/ProtectedRoute.jsx`로 로그인 필요 라우트/특정 role 전용 라우트를 감쌀 수 있습니다. 사용 예시는 `AppRouter.jsx` 안의 주석을 참고하세요.

이 라우트 가드는 화면 단의 1차 방어일 뿐이며, 최종적인 접근 제어는 백엔드(`SecurityConfig`, `@PreAuthorize` + 리소스 소유권 검증)가 책임집니다.

## 7. 사용 중인 주요 라이브러리

- `react` 19 / `react-dom` 19
- `react-router-dom` 7 — 라우팅
- `axios` 1 — HTTP 클라이언트
- `zustand` 5 — 전역 상태 관리 (Redux보다 가벼운 선택)
- `vite` 8 — 빌드 도구 / `vitest` — 테스트 / `oxlint` — 린트

## 8. 배포

Vercel/Netlify 등 정적 호스팅에 배포하는 것을 전제로 합니다. 배포 전 `.env.production`의 `VITE_API_BASE_URL`을 실제 백엔드 도메인으로 반드시 바꿔주세요.
