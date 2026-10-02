# Rookies_MiniProject2 — Backend

소상공인(카페·베이커리 등) 매장의 메뉴 등록, 손님 주문, 주문 상태 관리, 매출 확인을 지원하는 예약/주문 관리 SaaS의 백엔드입니다.

프론트엔드(`frontend_main` 브랜치)와는 REST API 설계서를 계약(contract)으로 삼아 독립적으로 개발됩니다.

## 이 서비스는 무엇을 하나요?

동네 카페·베이커리 사장님이 전화로 주문을 받는 대신, 앱으로 메뉴를 올려두고 손님이 직접 주문·픽업 예약을 할 수 있게 해주는 서비스입니다. 결제는 다루지 않으며, 주문은 매장에서 직접 수령·결제하는 것을 전제로 합니다.

사장님(`OWNER`)은 매장을 등록하고 메뉴를 올린 뒤, 들어온 주문을 `수락 → 준비완료 → 픽업완료` 순서로 처리하거나(재료 소진 시 `거절`) 당일 매출을 확인합니다. 손님(`USER`)은 로그인 없이 매장·메뉴를 둘러보다가, 로그인 후 메뉴를 담아 주문하고 픽업 시각을 지정하며, 접수대기 상태에서는 직접 취소할 수 있습니다. 이 저장소는 그 전체 흐름을 뒷받침하는 REST API 서버입니다.

## 목차

- [기술 스택](#기술-스택)
- [팀 구성](#팀-구성)
- [프로젝트 구조](#프로젝트-구조)
- [실행 방법](#실행-방법)
- [더미 계정](#더미-계정)
- [주요 기능](#주요-기능)
- [인증/인가 및 에러 응답](#인증인가-및-에러-응답)
- [설계 문서](#설계-문서)
- [테스트 현황](#테스트-현황)
- [다음 단계로 남겨둔 것들](#다음-단계로-남겨둔-것들)

## 기술 스택

| 구분 | 내용 |
|---|---|
| 언어/런타임 | Java 17 |
| 프레임워크 | Spring Boot 4.0.8 (Web MVC, Data JPA, Validation, Security, Actuator) |
| ORM | Hibernate (Spring Data JPA) |
| DB | MariaDB |
| 인증 | JWT (jjwt 0.12.7), Spring Security 7.0 |
| 빌드 도구 | Maven |
| 기타 | Lombok, Spring Boot Admin Client |

## 팀 구성

| 담당자 | 담당 도메인 | 주요 작업 |
|---|---|---|
| 현준 (Part A) | 회원 / 매장 / 인증 | User·Store 도메인 API(회원 CRUD, 매장 등록/수정), JWT 인증(`JwtService`·`JwtAuthenticationFilter`·`SecurityConfig`), `@CurrentUser` 어노테이션, 매장 키워드 검색, 사장님 1:N 다중 매장 조회, `/images/**` 정적 리소스 경로 수정 |
| 인선 (Part B) | 메뉴 / 주문 생성 / 손님 주문 | 프로젝트 초기 세팅(패키지 구조·공통 설정·`SecurityConfig` 뼈대), 메뉴 CRUD + 이미지 업로드(MIME 화이트리스트), 손님 주문 생성·취소·조회, N+1 조회 최적화, 소프트 삭제, 에러 코드 정리 |
| 지우 (Part C) | 사장님 주문 관리 / 매출 | `Order` 상태 전이 로직(`accept`/`ready`/`complete`/`reject`), 사장님 주문 목록 조회 API, 주문 상태 변경 API, 당일 매출 조회 API, 대시보드 조회 범위 로직(진행 중 주문은 전체, 완료·거절 주문은 당일분만) |

## 프로젝트 구조

도메인/파트별로 패키지가 구성되어 있습니다 (vertical-slice).

```
com.rookies6.MiniProject2
├── common
│   ├── config       # SecurityConfig, WebConfig
│   ├── entity       # BaseEntity, BaseCreatedEntity
│   ├── exception    # ErrorCode, BusinessException, advice/GlobalExceptionHandler
│   └── runner       # DataInitRunner (최소 더미 데이터 자동 부트스트랩 — dummy-data.sql과는 별개)
├── security
│   ├── annotation   # @CurrentUser
│   ├── jwt          # JwtService, JwtAuthenticationFilter
│   ├── models       # UserInfoUserDetails
│   └── service      # UserInfoUserDetailsService
├── user             # 회원 / 매장 도메인 (Part A)
│   ├── controller   # UserController, StoreController
│   ├── service
│   ├── entity       # User, Store, StoreDetail
│   ├── dto
│   └── repository
├── menu             # 메뉴 / 주문 생성 도메인 (Part B)
│   ├── controller   # MenuController, OrderController(주문 생성 전담)
│   ├── service      # MenuService, OrderService(주문 생성 전담), ImageUploadService
│   ├── entity       # MenuItem, Order, OrderItem
│   ├── dto
│   └── repository
└── order            # 손님 주문 조회/취소(Part B) + 사장님 주문 목록/상태변경/매출(Part C)
    ├── controller   # CustomerOrderController(B), OwnerOrderController(C), SalesController(C)
    ├── service      # CustomerOrderService(B), OrderStatusService(C), SalesService(C)
    └── dto
```

> 참고: 사장님의 매장별 주문 목록 조회는 원래 `menu.controller.OrderController`(Part B)에도 중복 구현돼 있었으나, 팀 코드 리뷰에서 발견되어 `OwnerOrderController`(Part C) 쪽으로 통합했습니다. `OrderController`는 현재 주문 생성(`createOrder`)만 담당합니다.

## 실행 방법

### 사전 준비
- JDK 17
- MariaDB (DB명: `reservation_db`)

### 1. DB 스키마 및 더미데이터 생성

Spring Boot가 테이블을 자동 생성하지 않습니다(`ddl-auto=validate`). `src/main/resources/dummy-data.sql`을 직접 실행해야 서버가 정상 기동합니다 (기존 테이블을 모두 삭제하고 새로 만드니 주의).

```bash
mysql -u root -p reservation_db < src/main/resources/dummy-data.sql
```

### 2. 로컬 설정 파일 생성

`src/main/resources/application-local.properties`를 직접 만들어야 합니다(`.gitignore`에 등록돼 있어 저장소에는 없습니다).

```properties
spring.datasource.url=jdbc:mariadb://localhost:3306/reservation_db
spring.datasource.username=root
spring.datasource.password=본인의_DB_비밀번호
```

그리고 JWT 서명에 쓰는 `JWT_SECRET` 환경변수를 셸에 설정합니다 (팀에서 공유받은 값 또는 직접 생성한 랜덤 문자열).

```bash
export JWT_SECRET=팀에서_공유받은_값
```

### 3. 실행

```bash
./mvnw spring-boot:run
```

`local` 프로파일로 동작하며 `http://localhost:8080`에서 뜹니다. CORS는 `http://localhost:5173`(프론트엔드 Vite 개발 서버)만 허용돼 있습니다.

## 더미 계정

`dummy-data.sql` 실행 시 아래 계정이 함께 생성됩니다 (비밀번호 모두 `1234`).

| 이메일 | 역할 | 이름 |
|---|---|---|
| owner@rookie.com | OWNER | 김루키 사장님 |
| owner2@rookie.com | OWNER | 최사장 사장님 |
| customer@rookie.com | USER | 이수강 손님 |
| customer2@rookie.com | USER | 박영희 손님 |
| admin@rookie.com | ADMIN | 시스템관리자 |

(그 외 `owner3@rookie.com`, `customer3@rookie.com` 포함 총 7개 계정, 매장 30개가 함께 시딩됩니다.)

## 주요 기능

총 23개 엔드포인트가 구현되어 있습니다. 전체 요청/응답 스펙과 cURL 예시는 `03_REST_API설계서.md`에 있고, 아래는 실제 컨트롤러 기준 전체 목록입니다.

### 회원 (`UserController`)

| 메서드 | 경로 | 설명 | 권한 |
|---|---|---|---|
| POST | `/api/auth/signup` | 회원가입 | 비로그인 |
| POST | `/api/auth/login` | 로그인(JWT 발급) | 비로그인 |
| GET | `/api/users/me` | 내 정보 조회 | 로그인 |
| GET | `/api/users/{id}` | 회원 단건 조회 | 본인만 |
| PATCH/PUT | `/api/users/{id}` | 회원 정보 수정 | 본인만 |
| DELETE | `/api/users/{id}` | 회원 탈퇴(소프트 삭제) | 본인만 |
| GET | `/api/users` | 전체 회원 목록(페이징) | ADMIN |

가입 시 역할은 `USER`/`OWNER`/`ADMIN` 중 선택하되, `ADMIN`은 서버가 가입 단계에서 차단합니다.

### 매장 (`StoreController`)

| 메서드 | 경로 | 설명 | 권한 |
|---|---|---|---|
| GET | `/api/stores` | 전체 목록(카테고리 필터 + 키워드 검색 + 페이징) | 비로그인 |
| GET | `/api/stores/{storeId}` | 단건 조회(영업시간 포함) | 비로그인 |
| POST | `/api/stores` | 매장 등록 | OWNER |
| GET | `/api/stores/owner/{ownerId}` | 사장님 소유 매장 목록(1:N, 페이징) | OWNER(본인만) |
| PUT | `/api/stores/{storeId}` | 매장 정보 수정 | OWNER(본인 소유만) |
| DELETE | `/api/stores/{storeId}` | 매장 삭제(소프트) | OWNER(본인 소유만) |

### 메뉴 (`MenuController`)

| 메서드 | 경로 | 설명 | 권한 |
|---|---|---|---|
| POST | `/api/menus/images` | 메뉴 이미지 업로드(MIME 화이트리스트 검증) | OWNER |
| GET | `/api/stores/{storeId}/menus` | 메뉴 목록(페이징) | 비로그인 |
| POST | `/api/stores/{storeId}/menus` | 메뉴 등록 | OWNER(본인 매장만) |
| PATCH | `/api/menus/{menuId}/sold-out` | 품절 상태 토글 | OWNER(본인 매장만) |
| PATCH | `/api/menus/{menuId}` | 메뉴 수정 | OWNER(본인 매장만) |
| DELETE | `/api/menus/{menuId}` | 메뉴 삭제(소프트) | OWNER(본인 매장만) |
| GET | `/images/**` | 업로드된 이미지 정적 서빙 | 비로그인 |

### 주문 — 손님 측 (`menu.controller.OrderController`, `CustomerOrderController`)

| 메서드 | 경로 | 설명 | 권한 |
|---|---|---|---|
| POST | `/api/orders` | 주문 생성(서버 측 금액 계산 + 가격 스냅샷) | 로그인 |
| GET | `/api/customers/{customerId}/orders` | 내 주문 목록(페이징) | 본인만 |
| GET | `/api/customers/{customerId}/orders/{orderId}` | 내 주문 단건 조회 | 본인만 |
| PATCH | `/api/customers/{customerId}/orders/{orderId}/cancel` | 주문 취소(접수대기 상태에서만) | 본인만 |

### 주문 — 사장님 측 (`OwnerOrderController`, `SalesController`)

| 메서드 | 경로 | 설명 | 권한 |
|---|---|---|---|
| GET | `/api/owner/stores/{storeId}/orders` | 매장별 주문 목록(상태 필터 + 페이징, N+1 안전 조회) | OWNER(본인 매장만) |
| PATCH | `/api/owner/orders/{orderId}/status` | 주문 상태 변경(수락/거절/준비완료/픽업완료) | OWNER(본인 매장만) |
| GET | `/api/owner/stores/{storeId}/sales/today` | 당일 매출 조회(픽업 완료 주문 합계, 없으면 0) | OWNER(본인 매장만) |

주문 상태 흐름: `PENDING → ACCEPTED → READY → COMPLETED`, 그 외 `REJECTED`(사장님, PENDING/ACCEPTED에서 가능), `CANCELLED`(손님, PENDING에서만 가능).

## 인증/인가 및 에러 응답

- 모든 보호된 요청은 `Authorization: Bearer <JWT>` 헤더가 필요합니다. 사용자 식별은 토큰에서 직접 추출(`@CurrentUser`)하며 클라이언트가 보낸 id는 신뢰하지 않습니다(IDOR 방지).
- 인가는 역할 기반(`@PreAuthorize`)과 리소스 소유권 검증 2단계로 이루어집니다.
- 매장 소유권 불일치 시 응답은 엔드포인트별로 403(`STORE_ACCESS_DENIED`, 존재는 알리되 접근만 차단)과 404(`STORE_NOT_FOUND`, 존재 자체를 숨김) 두 컨벤션이 현재 공존합니다. 신규 엔드포인트는 404 쪽으로 통일 중입니다.
- 모든 에러 응답은 `{ "status", "message", "timestamp", "errors" }` 형식입니다(`errors`는 `@Valid` 검증 실패 시에만 채워짐). 전체 에러 코드 목록은 설계 문서를 참고하세요.

## 설계 문서

`docs/` 폴더에 아래 3개 설계서가 Markdown + PDF로 모두 들어있습니다.

- `01_도메인설계서.md` — 비즈니스 도메인, 핵심 객체, 도메인 관계도, 비즈니스 규칙
- `02_Entity설계서.md` — JPA Entity 설계, 연관관계 매핑, 제약조건, 인덱스 전략
- `03_REST_API설계서.md` — 전체 엔드포인트, 요청/응답 스펙, 에러 코드 전체 목록, cURL 예시

## 테스트 현황

더미 계정 7개 + 매장 30개를 담은 `dummy-data.sql`로 모든 엔드포인트를 실제 데이터 기준으로 수동 검증했습니다. 자동화된 단위/통합 테스트(JUnit)는 아직 작성 전으로, 다음 단계로 남겨두었습니다.

## 다음 단계로 남겨둔 것들

- 매장 소유권 실패 응답의 403/404 컨벤션 전사 통일(위 참고 — 신규 엔드포인트는 404로 맞추는 중).
- 에러 코드에 `AUTH_001` 같은 별도 코드 문자열 체계를 추가할지 검토(현재는 `ErrorCode` enum 이름만으로 구분).
- 로깅 전략(`warn`/`error` 분기 기준) 문서화.
- JUnit 기반 자동화 테스트 추가.
