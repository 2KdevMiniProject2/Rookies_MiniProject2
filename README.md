# Rookies MiniProject2 — 소상공인 주문/예약 관리 시스템

카페·베이커리 등 소상공인 매장의 메뉴 등록, 손님 주문, 주문 상태 관리, 매출 확인을 지원하는 앱입니다.

## 목차

- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [실행 방법](#실행-방법)
- [API 문서](#api-문서)
- [팀 구성](#팀-구성)

## 주요 기능

### 회원 
- 회원가입 / 로그인 (사장님 `OWNER`, 손님 `USER` 역할 구분)
- 회원 정보 조회 / 수정 / 탈퇴
- *(설계 예정)* 로그인 로직을 `AuthController`/`AuthService`로 분리 — 현재는 `UserController`에 포함되어 있고, 로그인 응답의 액세스 토큰도 JWT 적용 전까지 임시 문자열로 발급됨

### 매장 
- 매장 등록 / 목록 조회(카테고리 필터링 + 페이징) / 단건 조회 / 정보 수정 / 소프트 삭제
- 매장 대표 이미지 업로드 (메뉴 이미지 업로드 엔드포인트 공용 사용)
- 사장님 본인 소유 매장만 수정·삭제 가능하도록 소유권 검증

### 메뉴
- 메뉴 등록 / 목록 조회(페이징) / 수정 / 품절 처리 / 소프트 삭제
- 메뉴 이미지 업로드
- 사장님 본인 소유 매장의 메뉴만 관리 가능하도록 소유권 검증

### 주문 — 손님 측
- 주문 생성
- 내 주문 목록 조회(페이징) / 상세 조회
- 주문 취소 (접수 대기 상태에서만 가능)

### 주문 — 사장님 측
- 매장별 주문 목록 조회(상태 필터링 + 페이징) — Part B 구현, `OrderController`
- 주문 상태 변경(수락/거절/준비완료/픽업완료) — Part C 구현, `OwnerOrderController`
- *(설계 예정)* 오늘 매출 요약 조회 — `SalesController`/`SalesService`, 아직 미구현. 관련 집계 쿼리(`OrderRepository.sumTotalAmountByStoreAndPeriod` 등)는 준비돼 있으나 호출하는 곳이 없음

주문 상태 흐름: `PENDING → ACCEPTED → READY → COMPLETED`, 그 외 `REJECTED`(사장님 거절/취소), `CANCELLED`(손님 취소)

## 기술 스택

| 구분 | 내용 |
|---|---|
| 언어/런타임 | Java 17 |
| 프레임워크 | Spring Boot 4.0.8 (Web MVC, Data JPA, Validation, Security, Actuator) |
| ORM | Hibernate (Spring Data JPA) |
| DB | MariaDB |
| 인증 | JWT (jjwt 0.12.7) |
| 빌드 도구 | Maven |
| 기타 | Lombok, Spring Boot Admin Client |

## 프로젝트 구조

도메인/파트별로 패키지가 구성되어 있습니다.

```
com.rookies6.MiniProject2
├── common          # 공통 설정, 예외 처리, Base 엔티티
│   ├── config       # SecurityConfig, WebConfig
│   ├── entity       # BaseEntity, BaseCreatedEntity
│   ├── exception    # ErrorCode, BusinessException, GlobalExceptionHandler
│   └── runner       # 초기 더미 데이터 자동 생성(DataInitRunner)
├── user            # 회원, 매장 도메인 (Part A)
│   ├── controller   # UserController, StoreController
│   ├── service
│   ├── entity       # User, Store, StoreDetail
│   ├── dto
│   └── repository
├── menu            # 메뉴, 주문 생성/사장님 목록조회 도메인 (Part B)
│   ├── controller   # MenuController, OrderController
│   ├── service       # MenuService, OrderService, ImageUploadService
│   ├── entity       # MenuItem, Order, OrderItem
│   ├── dto
│   └── repository
└── order           # 손님 주문 조회/취소(Part B), 사장님 주문 상태변경/매출(Part C)
    ├── controller   # CustomerOrderController(B), OwnerOrderController(C)
    ├── service       # CustomerOrderService(B), OrderStatusService(C)
    └── dto
```

## 실행 방법

### 사전 준비
- JDK 17
- MariaDB (DB명: `reservation_db`)

### 1. DB 스키마 및 더미데이터 생성

`src/main/resources/dummy-data.sql`을 `reservation_db`에 실행합니다. (기존 테이블을 모두 삭제하고 새로 생성하니 주의)

```bash
mysql -u root -p reservation_db < src/main/resources/dummy-data.sql
```

### 2. 로컬 설정 파일 생성

`src/main/resources/application-local.properties` 파일을 만들고(이미 `.gitignore`에 등록되어 있어 커밋되지 않습니다), 아래 내용을 채웁니다.

```properties
spring.datasource.url=jdbc:mariadb://localhost:3306/reservation_db
spring.datasource.username=root
spring.datasource.password=본인의_DB_비밀번호

JWT_SECRET=팀에서_공유받은_값_또는_직접_생성한_랜덤값
```

### 3. 실행

```bash
./mvnw spring-boot:run
```

기본적으로 `local` 프로파일로 동작하며, `http://localhost:8080`에서 API 서버가 뜹니다.

### 더미 계정

`dummy-data.sql` 실행 시 아래 계정이 함께 생성됩니다 (비밀번호 모두 `1234`).

| 이메일 | 역할 |
|---|---|
| owner@rookie.com | OWNER |
| customer@rookie.com | USER |

## API 문서

전체 엔드포인트 목록과 요청/응답 형식은 [REST API 설계서](./docs/api-spec.md)를 참고하세요. *(문서 경로는 팀에서 정한 위치로 수정)*

현재 실제로 구현되어 동작하는 주요 엔드포인트:

| 파트 | 도메인 | Method | URL | 설명 |
|---|---|---|---|---|
| A | 회원 | POST | `/api/auth/signup` | 회원가입 |
| A | 회원 | POST | `/api/auth/login` | 로그인 (임시 토큰 발급) |
| A | 회원 | GET/PATCH/DELETE | `/api/users/{id}` | 회원 조회/수정/탈퇴 |
| A | 매장 | GET | `/api/stores` | 매장 목록 (페이징, 카테고리 필터) |
| A | 매장 | POST | `/api/stores` | 매장 등록 |
| A | 매장 | PUT | `/api/stores/{storeId}` | 매장 정보 수정 |
| A | 매장 | DELETE | `/api/stores/{storeId}` | 매장 삭제 |
| B | 메뉴 | GET | `/api/stores/{storeId}/menus` | 매장별 메뉴 목록 |
| B | 메뉴 | POST/PATCH/DELETE | `/api/menus/**` | 메뉴 등록/수정/품절처리/삭제 |
| B | 주문 | POST | `/api/orders` | 주문 생성 |
| B | 주문 | GET | `/api/stores/{storeId}/orders` | 사장님용 매장별 주문 목록 |
| B | 주문 | GET | `/api/customers/{customerId}/orders` | 손님 주문 목록 |
| B | 주문 | PATCH | `/api/customers/{customerId}/orders/{orderId}/cancel` | 손님 주문 취소 |
| C | 주문 | PATCH | `/api/owner/orders/{orderId}/status` | 주문 상태 변경 |

설계는 됐지만 아직 구현 전인 것:

| 파트 | 기능 | 비고 |
|---|---|---|
| A | 로그인 로직 `AuthController`/`AuthService` 분리 | 현재 `UserController`에 포함 |
| C | 오늘 매출 요약 조회 (`SalesController`) | 집계 쿼리는 준비됨 |

## 팀 구성

| 파트 | 담당 도메인 | 담당자 |
|---|---|---|
| Part A | 회원 / 매장 / 인증 | 현준 |
| Part B | 메뉴 / 손님 주문 | 인선 |
| Part C | 사장님 주문 관리 / 매출 | 지우 |
| 메인 및 로그인 화면 |  |  |
|                     |   |   |
|                      |    |   |
