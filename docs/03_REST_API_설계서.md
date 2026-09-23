# 🌐 [루키즈 미니프로젝트 2] 03. REST API 설계서

---

## 1. API 개요 및 공통 규격

* **Base URL**: `http://localhost:8080/api`
* **인증 방식**: JWT (JSON Web Token) 기반 Bearer Token 인증
  * 요청 헤더: `Authorization: Bearer <accessToken>`
* **응답 포맷**: `application/json;charset=UTF-8`

### 1.1 공통 응답 규격 (성공 / 실패)

#### 성공 응답 (200 OK, 201 Created)
```json
{
  "success": true,
  "data": { ... },
  "message": "요청이 성공적으로 처리되었습니다."
}
```

#### 에러 응답 (400, 401, 403, 404, 500)
```json
{
  "success": false,
  "error": {
    "code": "AUTH_001",
    "message": "이메일 또는 비밀번호가 일치하지 않습니다.",
    "field": "password"
  }
}
```

### 1.2 표준 에러 코드 체계

| 에러 코드 | HTTP 상태 | 설명 |
| :--- | :--- | :--- |
| `AUTH_001` | 401 Unauthorized | 이메일 또는 비밀번호 불일치 |
| `AUTH_002` | 403 Forbidden | 접근 권한 없음 (손님이 사장님 API 호출 등) |
| `VALID_001` | 400 Bad Request | 요청 데이터 유효성 검증 실패 (누락, 형식 오류) |
| `STORE_001` | 404 Not Found | 해당 ID의 매장을 찾을 수 없음 |
| `ORDER_001` | 404 Not Found | 해당 ID의 주문을 찾을 수 없음 |
| `ORDER_002` | 400 Bad Request | 품절된 메뉴가 포함되었거나 결제 금액이 일치하지 않음 |
| `SERVER_001`| 500 Internal Server | 서버 내부 처리 오류 |

---

## 2. 파트별 API 목록 요약

| 파트 | Method | URI | 설명 | 인가 대상 |
| :--- | :--- | :--- | :--- | :--- |
| **🟢 A** | `POST` | `/api/auth/signup` | 회원가입 (손님/사장님) | 전체 |
| **🟢 A** | `POST` | `/api/auth/login` | 로그인 (JWT 토큰 발급) | 전체 |
| **🟢 A** | `GET` | `/api/stores` | 메인 홈 가게 목록 조회 (필터/검색) | 전체 |
| **🟢 A** | `GET` | `/api/stores/{storeId}` | 가게 기본/상세 정보 단건 조회 | 전체 |
| **🟢 A** | `POST` | `/api/stores` | 사장님의 내 가게 등록 / 정보 수정 | 사장님 (`OWNER`) |
| **🟡 B** | `GET` | `/api/stores/{storeId}/menus` | 특정 가게의 메뉴판 목록 조회 | 전체 |
| **🟡 B** | `POST` | `/api/stores/{storeId}/menus` | 사장님의 신규 메뉴 등록 | 사장님 (`OWNER`) |
| **🟡 B** | `PATCH` | `/api/menus/{menuId}/sold-out`| 사장님의 메뉴 품절 상태 토글 | 사장님 (`OWNER`) |
| **🟡 B** | `POST` | `/api/orders` | 손님의 장바구니 픽업 주문서 접수 | 손님 (`CUSTOMER`) |
| **🔴 C** | `GET` | `/api/owner/orders` | 사장님 매장의 실시간 주문 접수 목록 | 사장님 (`OWNER`) |
| **🔴 C** | `PATCH` | `/api/orders/{orderId}/status`| 주문 상태 변경 (`ACCEPTED`, `COMPLETED` 등) | 사장님 (`OWNER`) |
| **🔴 C** | `GET` | `/api/orders/{orderId}` | 손님의 내 주문 실시간 진행 상태 조회 | 손님 (`CUSTOMER`) |
| **🔴 C** | `GET` | `/api/owner/sales/today` | 오늘 누적 매출 통계 (`SUM`, `COUNT`) | 사장님 (`OWNER`) |

---

## 3. API 상세 명세

### 3.1 🟢 [파트 A] 인증 및 가게 API

#### [POST] `/api/auth/login` - 로그인
* **Request Body**:
```json
{
  "email": "owner@rookie.com",
  "password": "password123"
}
```
* **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOi...",
    "user": {
      "id": 1,
      "email": "owner@rookie.com",
      "name": "홍길동",
      "role": "OWNER"
    }
  },
  "message": "로그인 성공"
}
```

#### [GET] `/api/stores` - 메인 홈 가게 목록 조회
* **Query Params**: `category` (optional, 예: "베이커리", "카페/디저트")
* **Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "루키즈 베이커리",
      "category": "베이커리",
      "address": "서울시 강남구 테헤란로 123",
      "storePhone": "02-555-1234",
      "openTime": "09:00",
      "closeTime": "21:00",
      "imageUrl": "https://picsum.photos/400/300"
    }
  ]
}
```

---

### 3.2 🟡 [파트 B] 메뉴 및 주문 API

#### [GET] `/api/stores/{storeId}/menus` - 메뉴판 조회
* **Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 101,
      "name": "바닐라라떼",
      "price": 5500,
      "isSoldOut": false,
      "imageUrl": "https://picsum.photos/200/200"
    },
    {
      "id": 102,
      "name": "아메리카노",
      "price": 4000,
      "isSoldOut": false,
      "imageUrl": "https://picsum.photos/200/200"
    }
  ]
}
```

#### [POST] `/api/orders` - 장바구니 픽업 주문서 제출
* **Request Body**:
```json
{
  "storeId": 1,
  "pickupTime": "15:30",
  "requestNotes": "얼음 많이 부탁드려요",
  "totalAmount": 11000,
  "items": [
    {
      "menuItemId": 101,
      "quantity": 2,
      "orderPrice": 5500
    }
  ]
}
```
* **Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "orderId": 5001,
    "status": "PENDING",
    "pickupTime": "15:30",
    "totalAmount": 11000,
    "createdAt": "2026-09-23T15:30:00"
  },
  "message": "주문서가 정상적으로 접수되었습니다."
}
```

---

### 3.3 🔴 [파트 C] 실시간 주문 접수 & 매출 API

#### [GET] `/api/owner/orders` - 사장님 주문 목록 조회
* **Query Params**: `status` (optional: `PENDING`, `ACCEPTED`, `COMPLETED`)
* **Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "orderId": 5001,
      "status": "PENDING",
      "customerName": "손님1",
      "pickupTime": "15:30",
      "requestNotes": "얼음 많이 부탁드려요",
      "totalAmount": 11000,
      "createdAt": "2026-09-23T15:20:00",
      "items": [
        {
          "menuName": "바닐라라떼",
          "quantity": 2,
          "orderPrice": 5500
        }
      ]
    }
  ]
}
```

#### [PATCH] `/api/orders/{orderId}/status` - 주문 상태 변경
* **Request Body**:
```json
{
  "status": "ACCEPTED"
}
```
* **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "orderId": 5001,
    "status": "ACCEPTED",
    "updatedAt": "2026-09-23T15:22:00"
  },
  "message": "주문이 수락되었습니다."
}
```

#### [GET] `/api/owner/sales/today` - 오늘 매출 통계 조회
* **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "date": "2026-09-23",
    "totalOrderCount": 12,
    "totalSalesAmount": 145000
  }
}
```
