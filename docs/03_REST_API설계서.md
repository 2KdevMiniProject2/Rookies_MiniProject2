# REST API 설계서

프로젝트: 소상공인 예약/주문 관리 SaaS (Rookies_MiniProject2)
작성일: 2026-10-01
작성자: 인선 (Part B — 메뉴/주문 도메인)

---

## 1. API 개요

- **Base URL**: `http://localhost:8080` (운영 환경은 배포 시 확정)
- **인증 방식**: JWT (JSON Web Token) 기반 STATELESS 인증. 로그인 성공 시 발급되는 `accessToken`을 이후 모든 요청의 `Authorization: Bearer <token>` 헤더에 담아 전송한다. 세션/쿠키를 사용하지 않는다.
- **인가 방식**: 역할 기반(`USER`/`OWNER`/`ADMIN`) `@PreAuthorize` + 리소스 소유권 검증(본인 계정/본인 소유 매장인지 서버가 직접 확인)의 이중 구조.
- **공개(비로그인) 엔드포인트**: 회원가입/로그인, 매장 목록/상세 조회(GET), 메뉴 목록 조회(GET). 그 외 전부 토큰 필요.
- **응답 형식**: 성공 시 요청 리소스에 해당하는 DTO를 그대로 반환, 실패 시 아래 공통 에러 형식(`ErrorResponse`)을 반환한다.
- **페이징**: 목록 조회 API는 Spring Data의 `Page<T>` 표준 응답(`content`, `totalElements`, `totalPages`, `number`, `size` 등)을 사용하며, 쿼리 파라미터 `page`(0-base), `size`, `sort`로 제어한다.

### 공통 에러 응답 형식

```json
{
  "status": 403,
  "message": "본인 소유의 매장만 조회·수정·삭제할 수 있습니다. (id=5)",
  "timestamp": "2026-10-01T10:30:00",
  "errors": null
}
```

`errors`는 `@Valid` 검증 실패(400) 시에만 필드별 메시지 맵으로 채워진다. 예:
```json
{
  "status": 400,
  "message": "입력값 검증에 실패했습니다.",
  "timestamp": "2026-10-01T10:30:00",
  "errors": { "email": "올바른 이메일 형식이 아닙니다." }
}
```

### 상황별 HTTP 상태 코드

| 상태 코드 | 의미 | 발생 상황 |
|---|---|---|
| 200 OK | 조회/수정/로그인 성공 | |
| 201 Created | 생성 성공 (회원가입, 매장/메뉴 등록, 주문 생성) | |
| 204 No Content | 삭제/취소 성공 | |
| 400 Bad Request | 입력값 검증 실패, 잘못된 요청 본문 | `@Valid` 실패, JSON 파싱 실패 |
| 401 Unauthorized | 인증 실패 | 토큰 없음/만료/위조, 로그인 비밀번호 불일치 |
| 403 Forbidden | 인가 실패 | 역할 부족(`@PreAuthorize`), 본인 소유 아님 |
| 404 Not Found | 리소스 없음 | 존재하지 않는 id 조회 |
| 405 Method Not Allowed | 지원하지 않는 HTTP 메서드 | URL에 id 누락 등 |
| 409 Conflict | 상태 충돌 | 이메일/메뉴명 중복, FK 제약 위반, 잘못된 주문 상태 전이 |

---

## 2. 인증 (Auth)

### POST `/api/auth/signup` — 회원가입 (비로그인 호출 가능)

Request Body:
```json
{
  "email": "user@example.com",
  "password": "1234",
  "name": "홍길동",
  "phone": "010-1234-5678",
  "role": "USER"
}
```
- `role`은 `USER` 또는 `OWNER`만 허용 (`ADMIN` 선택 시 400)

Response (201 Created):
```json
{ "id": 1, "email": "user@example.com", "name": "홍길동", "phone": "010-1234-5678", "role": "USER" }
```

에러: 이메일 중복 → 409, `role: "ADMIN"` → 400, 필드 검증 실패 → 400

### POST `/api/auth/login` — 로그인 (비로그인 호출 가능)

Request Body:
```json
{ "email": "user@example.com", "password": "1234" }
```

Response (200 OK):
```json
{
  "accessToken": "eyJhbGciOi...",
  "user": { "id": 1, "email": "user@example.com", "name": "홍길동", "phone": "010-1234-5678", "role": "USER" }
}
```

에러: 이메일/비밀번호 불일치 → 401

---

## 3. 회원 (User)

모든 엔드포인트는 토큰 필요 (`GET /api/users` 제외하면 본인 확인까지 필요).

| 메서드 | 경로 | 권한 | 설명 |
|---|---|---|---|
| GET | `/api/users` | ADMIN | 전체 회원 목록 (페이징) |
| GET | `/api/users/{id}` | 본인만 | 회원 단건 조회 |
| PUT/PATCH | `/api/users/{id}` | 본인만 | 회원 정보 수정 |
| DELETE | `/api/users/{id}` | 본인만 | 회원 탈퇴 (소프트 삭제) |
| GET | `/api/users/me` | 로그인만 하면 됨 | 내 정보 조회 (새로고침 시 토큰으로 복원) |

본인 확인은 클라이언트가 보낸 값이 아니라 **JWT 토큰에서 추출한 로그인 사용자**(`@CurrentUser`)를 기준으로 서버가 직접 수행한다 (경로의 `{id}`가 토큰의 사용자와 다르면 403).

#### PATCH/PUT `/api/users/{id}` Request Body (모든 필드 선택)
```json
{ "name": "홍길동", "phone": "010-9999-8888", "password": "새비밀번호" }
```

#### 공통 UserResponse
```json
{ "id": 1, "email": "user@example.com", "name": "홍길동", "phone": "010-1234-5678", "role": "USER" }
```

에러: 본인 아님 → 403, 존재하지 않는 id → 404

---

## 4. 매장 (Store) — Base: `/api/stores`

| 메서드 | 경로 | 권한 | 설명 |
|---|---|---|---|
| GET | `` | 공개 | 매장 전체 목록 (페이징, `category`/`keyword` 필터) |
| GET | `/{storeId}` | 공개 | 매장 단건 상세 (영업시간 포함) |
| POST | `` | OWNER | 신규 매장 등록 |
| GET | `/owner/{ownerId}` | OWNER, 본인만 | 내 매장 목록 (페이징) |
| PUT | `/{storeId}` | OWNER, 본인 소유만 | 매장 정보 수정 |
| DELETE | `/{storeId}` | OWNER, 본인 소유만 | 매장 삭제 (소프트 삭제) |

#### GET `/api/stores?category=베이커리&keyword=루키&page=0&size=10`

Response (200 OK, `Page<StoreResponse>`):
```json
{
  "content": [
    { "id": 1, "name": "루키 베이커리", "address": "서울시 ...", "category": "베이커리",
      "imageUrl": "/images/xxx.png", "openTime": "09:00:00", "closeTime": "21:00:00",
      "ownerId": 2, "ownerName": "김사장" }
  ],
  "totalElements": 1, "totalPages": 1, "number": 0, "size": 10
}
```

#### POST `/api/stores` Request Body
```json
{
  "name": "루키 베이커리", "address": "서울시 ...", "category": "베이커리",
  "imageUrl": "/images/xxx.png", "openTime": "09:00:00", "closeTime": "21:00:00"
}
```
소유자(`ownerId`)는 요청에 포함하지 않는다 — 토큰의 로그인 사용자로 서버가 자동 지정한다.

Response: 201 Created, `StoreResponse` (위와 동일 형식)

에러: 필드 검증 실패 → 400, OWNER 아님 → 403, 본인 소유 아닌 매장 수정/삭제 시도 → 403, 존재하지 않는 매장 → 404

---

## 5. 메뉴 (Menu)

| 메서드 | 경로 | 권한 | 설명 |
|---|---|---|---|
| POST | `/api/menus/images` | OWNER | 메뉴 이미지 업로드 (URL 반환) |
| GET | `/api/stores/{storeId}/menus` | 공개 | 매장 메뉴 목록 (페이징) |
| POST | `/api/stores/{storeId}/menus` | OWNER ⚠️ | 메뉴 등록 |
| PATCH | `/api/menus/{menuId}/sold-out` | OWNER ⚠️ | 품절 토글 |
| PATCH | `/api/menus/{menuId}` | OWNER ⚠️ | 메뉴 수정 |
| DELETE | `/api/menus/{menuId}` | OWNER ⚠️ | 메뉴 삭제 (소프트 삭제) |

> ⚠️ **현재 상태(2026-10-01) 기준 주의**: 위 4개 쓰기 엔드포인트는 아직 `ownerId`를 **요청 쿼리 파라미터**로 받아 소유권을 확인하는 구식 패턴이다 (User/Store API처럼 JWT 토큰에서 직접 추출하도록 전환 예정, 아직 미완료). 현재는 `ownerId` 값을 호출자가 직접 보내야 하며, 이 값이 조작 가능하다는 한계가 남아있다.

#### POST `/api/menus/images` (multipart/form-data, part명: `image`)
Response (200 OK): `"/images/550e8400-....png"` (문자열, 저장된 이미지 URL)
에러: 빈 파일/허용되지 않은 형식(jpeg/png/webp 외) → 400

#### POST `/api/stores/{storeId}/menus?ownerId=2` Request Body
```json
{ "name": "소금빵", "price": 3500, "imageUrl": "/images/xxx.png" }
```
Response (201 Created):
```json
{ "id": 10, "name": "소금빵", "price": 3500, "soldOut": false, "imageUrl": "/images/xxx.png" }
```

#### PATCH `/api/menus/{menuId}?ownerId=2` Request Body (모든 필드 선택)
```json
{ "name": "소금빵(대)", "price": 4000, "imageUrl": null }
```

에러: 메뉴명 중복(같은 매장 내) → 409, 가격 0 이하 → 400, 존재하지 않는 메뉴 → 404, 소유자 아님 → 403

---

## 6. 주문 (Order)

### 6.1 주문 생성/매장별 목록 — `menu.controller.OrderController`

| 메서드 | 경로 | 권한 | 설명 |
|---|---|---|---|
| POST | `/api/orders` | 로그인(손님) ⚠️ | 주문 생성 |
| GET | `/api/stores/{storeId}/orders` | 로그인 | 매장별 주문 목록 (페이징, `status` 필터) |

> ⚠️ `POST /api/orders`도 `customerId`를 요청 쿼리 파라미터로 받는 구식 패턴이 남아있다 (Menu API와 동일한 전환 작업 대상).

#### POST `/api/orders?customerId=1` Request Body
```json
{
  "storeId": 1,
  "items": [ { "menuItemId": 10, "quantity": 2 }, { "menuItemId": 11, "quantity": 1 } ],
  "pickupTime": "2026-10-01T18:30:00",
  "requestNotes": "빵 바삭하게 부탁드려요"
}
```
Response (201 Created):
```json
{
  "orderId": 100, "status": "PENDING", "totalAmount": 10500,
  "pickupTime": "2026-10-01T18:30:00",
  "items": [
    { "menuItemId": 10, "menuName": "소금빵", "quantity": 2, "orderPrice": 3500 },
    { "menuItemId": 11, "menuName": "크로아상", "quantity": 1, "orderPrice": 3500 }
  ]
}
```
에러: 품절 메뉴 포함 → 409, 존재하지 않는 메뉴/매장 → 400/404, 픽업시간이 과거 → 400

### 6.2 손님 주문 조회/취소 — `CustomerOrderController` (Base: `/api/customers/{customerId}/orders`)

| 메서드 | 경로 | 설명 |
|---|---|---|
| GET | `` | 내 주문 목록 (페이징) |
| GET | `/{orderId}` | 주문 단건 현재 상태 |
| PATCH | `/{orderId}/cancel` | 주문 취소 (PENDING 상태에서만 가능) |

Response 형식은 6.1의 `OrderResponse`와 동일. 취소 성공 시 204 No Content. 에러: 존재하지 않는 주문/본인 주문 아님 → 404, PENDING이 아닌 주문 취소 시도 → 409

### 6.3 사장님 주문 상태 변경 — `OwnerOrderController` (Base: `/api/owner`)

| 메서드 | 경로 | 권한 | 설명 |
|---|---|---|---|
| PATCH | `/orders/{orderId}/status` | 로그인(사장님) ⚠️ | 주문 상태 변경 (수락/거절/호출/픽업완료) |

> ⚠️ 이 엔드포인트도 `ownerId`를 요청 쿼리 파라미터로 받는다 (전환 예정, JWT 완성 후 작업하기로 팀 내 TODO로 남아있음).

#### PATCH `/api/owner/orders/{orderId}/status?ownerId=2` Request Body
```json
{ "status": "ACCEPTED" }
```
허용되는 `status` 값: `ACCEPTED`, `REJECTED`, `READY`, `COMPLETED` (각 값은 `Order`의 상태 머신 규칙을 따름 — 도메인 설계서 4.4 참고)

Response: 200 OK (본문 없음)
에러: 잘못된 상태 전이 → 409, 존재하지 않거나 본인 매장이 아닌 주문 → 404, `status` 누락 → 400

---

## 7. 엔드포인트 전체 요약표

| 도메인 | 메서드 | 경로 | 인증 | 권한/소유권 |
|---|---|---|---|---|
| Auth | POST | /api/auth/signup | 불필요 | - |
| Auth | POST | /api/auth/login | 불필요 | - |
| User | GET | /api/users | 필요 | ADMIN |
| User | GET | /api/users/{id} | 필요 | 본인 |
| User | PUT/PATCH | /api/users/{id} | 필요 | 본인 |
| User | DELETE | /api/users/{id} | 필요 | 본인 |
| User | GET | /api/users/me | 필요 | - |
| Store | GET | /api/stores | 불필요 | - |
| Store | GET | /api/stores/{storeId} | 불필요 | - |
| Store | POST | /api/stores | 필요 | OWNER |
| Store | GET | /api/stores/owner/{ownerId} | 필요 | OWNER, 본인 |
| Store | PUT | /api/stores/{storeId} | 필요 | OWNER, 본인 소유 |
| Store | DELETE | /api/stores/{storeId} | 필요 | OWNER, 본인 소유 |
| Menu | POST | /api/menus/images | 필요 | OWNER |
| Menu | GET | /api/stores/{storeId}/menus | 불필요 | - |
| Menu | POST | /api/stores/{storeId}/menus | 필요 | OWNER ⚠️파라미터 기반 |
| Menu | PATCH | /api/menus/{menuId}/sold-out | 필요 | OWNER ⚠️파라미터 기반 |
| Menu | PATCH | /api/menus/{menuId} | 필요 | OWNER ⚠️파라미터 기반 |
| Menu | DELETE | /api/menus/{menuId} | 필요 | OWNER ⚠️파라미터 기반 |
| Order | POST | /api/orders | 필요 | 로그인 ⚠️파라미터 기반 |
| Order | GET | /api/stores/{storeId}/orders | 필요 | 로그인 |
| Order | GET | /api/customers/{customerId}/orders | 필요 | 본인 |
| Order | GET | /api/customers/{customerId}/orders/{orderId} | 필요 | 본인 |
| Order | PATCH | /api/customers/{customerId}/orders/{orderId}/cancel | 필요 | 본인 |
| Order | PATCH | /api/owner/orders/{orderId}/status | 필요 | OWNER ⚠️파라미터 기반 |

⚠️ 표시된 6개 엔드포인트는 다음 작업에서 User/Store API와 동일하게 JWT 기반(`@CurrentUser`)으로 전환 예정 (팀 todo에 등록됨).
