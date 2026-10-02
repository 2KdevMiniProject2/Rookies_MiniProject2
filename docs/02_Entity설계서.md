# Entity 설계서

프로젝트: 소상공인 예약/주문 관리 SaaS (Rookies_MiniProject2)
작성일: 2026-10-02 (최초 작성 2026-10-01, v1.1: 주문 조회 Repository 통합 반영)
작성자: 인선 (Part B — 메뉴/주문 도메인)
버전: v1.1

DB: MariaDB (운영/로컬 공통), JPA 구현체: Hibernate (Spring Data JPA)
스키마 관리: `ddl-auto=validate` — 실제 테이블/컬럼은 Hibernate가 아니라 `dummy-data.sql`(DDL+DML)로 직접 관리한다. Entity와 테이블 정의가 항상 1:1로 맞아야 한다.

---

## 1. Entity 목록

| Entity | 테이블명 | 설명 |
|---|---|---|
| `User` | `users` | 회원 (손님/사장님/관리자 공통) |
| `Store` | `stores` | 매장 |
| `StoreDetail` | `store_details` | 매장 영업시간 상세 (Store와 1:1) |
| `MenuItem` | `menu_items` | 매장의 메뉴 |
| `Order` | `orders` | 주문 |
| `OrderItem` | `order_items` | 주문에 담긴 메뉴 항목 |

> 이번 개정(v1.1)으로 Entity 자체는 변경된 것이 없다. `OwnerOrderResponse`/`SalesSummaryResponse`는 DB 테이블과 매핑되는 Entity가 아니라 조회 전용 DTO이므로 이 표에는 포함하지 않는다.

### 공통 상위 클래스 (`@MappedSuperclass`)

| 클래스 | 제공 필드 | 사용 Entity |
|---|---|---|
| `BaseEntity` | `id`, `createdAt`, `updatedAt` (둘 다 `@CreatedDate`/`@LastModifiedDate` 자동 관리) | `User`, `Store`, `StoreDetail`, `MenuItem`, `Order` |
| `BaseCreatedEntity` | `id`, `createdAt`만 (수정 이력이 필요 없는 불변 로그성 데이터용) | `OrderItem` |

`OrderItem`이 `updatedAt`을 안 가지는 이유: 주문 항목은 생성된 뒤 값이 바뀌지 않는 "주문 시점의 기록"이기 때문 (가격/수량은 주문 생성 시 확정, 이후 수정 API 없음).

---

## 2. Entity 상세 (속성 / 연관관계 / 제약조건)

### 2.1 User

| 필드 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| id | Long | PK, AUTO_INCREMENT | |
| email | String | `NOT NULL`, `UNIQUE`, 최대 100자 (DTO `@Size`) | 로그인 ID로 사용 |
| password | String | `NOT NULL` | BCrypt 해시로 저장 (평문 저장 안 함) |
| name | String | `NOT NULL`, 최대 50자 | |
| phone | String | nullable, 최대 20자, `^[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}$` 패턴 | |
| role | Enum(`Role`: USER/OWNER/ADMIN) | `NOT NULL`, `EnumType.STRING`, 기본값 `USER` | 가입 시 ADMIN 선택 불가 (서비스 레이어 검증) |
| deletedAt | LocalDateTime | nullable | 소프트 삭제 시각. null이면 활성 계정 |

연관관계: 없음 (User 자체는 다른 Entity를 참조하지 않음 — `Store.owner`, `Order.customer`가 User를 참조하는 쪽)

### 2.2 Store

| 필드 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| id | Long | PK | |
| owner | User (`@ManyToOne`, FK `owner_id`) | `NOT NULL` | 매장 소유자 (1인 다중 매장 가능 → User:Store = 1:N) |
| name | String | `NOT NULL`, 최대 100자 | |
| address | String | `NOT NULL`, 최대 200자 | |
| category | String | `NOT NULL`, 최대 50자 | |
| imageUrl | String | nullable, 최대 500자 | |
| deletedAt | LocalDateTime | nullable | 소프트 삭제(폐업) |
| storeDetail | StoreDetail (`@OneToOne`, `mappedBy="store"`) | — | 영업시간 상세, 연관관계의 주인은 `StoreDetail` 쪽 |

연관관계 주인: `Store` → `User`는 `Store`가 FK(`owner_id`)를 가지므로 `Store`가 주인. `Store` ↔ `StoreDetail`은 `StoreDetail`이 FK(`store_id`)를 가지므로 `StoreDetail`이 주인 (`Store.storeDetail`은 `mappedBy`로 역방향 참조만 가짐).

### 2.3 StoreDetail

| 필드 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| id | Long | PK | |
| store | Store (`@OneToOne`, FK `store_id`) | `UNIQUE` | 1 Store : 1 StoreDetail 강제 |
| openTime | LocalTime | nullable | |
| closeTime | LocalTime | nullable | |

### 2.4 MenuItem

| 필드 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| id | Long | PK | |
| store | Store (`@ManyToOne`, FK `store_id`) | `NOT NULL` | |
| name | String | `NOT NULL` | 같은 매장 내에서 이름 중복 불가 (서비스 레이어 검증) |
| price | Integer | `NOT NULL`, 양수 (DTO `@Positive`) | |
| soldOut | boolean | `NOT NULL`, 기본값 `false` | |
| imageUrl | String | nullable | |
| deletedAt | LocalDateTime | nullable | 소프트 삭제 |

### 2.5 Order

| 필드 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| id | Long | PK | |
| customer | User (`@ManyToOne`, FK `user_id`) | `NOT NULL` | 주문한 손님 |
| store | Store (`@ManyToOne`, FK `store_id`) | `NOT NULL` | 주문받은 매장 |
| status | Enum(`OrderStatus`) | `NOT NULL`, `EnumType.STRING`, 길이 20 | PENDING/ACCEPTED/READY/COMPLETED/REJECTED/CANCELLED |
| totalAmount | Integer | `NOT NULL`, 기본값 0 | `OrderItem` 추가 시 자동 누적 계산 |
| pickupTime | LocalDateTime | `NOT NULL`, 현재 이후 시각 (DTO `@Future`) | |
| requestNotes | String | nullable | |
| orderItems | List\<OrderItem\> (`@OneToMany`, `mappedBy="order"`, `cascade=ALL`, `orphanRemoval=true`) | — | Order 저장/삭제 시 OrderItem도 함께 처리 |

`User`/`Store` 모두 `nullable=false` FK라서, 주문 이력이 있는 User/Store는 하드 삭제가 불가능하다 (→ 소프트 삭제 패턴을 쓰는 핵심 이유).

### 2.6 OrderItem

| 필드 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| id | Long | PK | |
| order | Order (`@ManyToOne`, FK `order_id`) | `NOT NULL` | |
| menuItem | MenuItem (`@ManyToOne`, FK `menu_item_id`) | `NOT NULL` | |
| quantity | Integer | `NOT NULL`, 양수 (DTO `@Positive`) | |
| orderPrice | Integer | `NOT NULL` (컬럼명 `price`) | **주문 시점의 메뉴 가격 snapshot** — 이후 메뉴 가격이 바뀌어도 변하지 않음 |

---

## 3. 연관관계 매핑 요약

```
User    1 ───< N  Store        (Store.owner, FK: owner_id, NOT NULL)
Store   1 ──── 1  StoreDetail  (StoreDetail.store, FK: store_id, UNIQUE, NOT NULL 아님 — 선택 정보)
Store   1 ───< N  MenuItem     (MenuItem.store, FK: store_id, NOT NULL)
User    1 ───< N  Order        (Order.customer, FK: user_id, NOT NULL)
Store   1 ───< N  Order        (Order.store, FK: store_id, NOT NULL)
Order   1 ───< N  OrderItem    (OrderItem.order, FK: order_id, NOT NULL, cascade+orphanRemoval)
MenuItem 1 ──< N  OrderItem    (OrderItem.menuItem, FK: menu_item_id, NOT NULL)
```

모든 연관관계는 `fetch = FetchType.LAZY`로 선언돼 있다 (즉시 로딩으로 인한 불필요한 조인 방지). 목록 조회처럼 연관 엔티티가 반드시 필요한 조회는 Repository에서 `JOIN FETCH`를 명시적으로 사용해 N+1 문제를 해결하되, 대상이 `@OneToMany` 컬렉션인지 아닌지에 따라 두 가지 패턴을 구분해서 쓴다.

- **to-one 연관관계(`@ManyToOne`/`@OneToOne`) + 페이징**: `JOIN FETCH`를 페이징과 함께 그대로 써도 안전하다. `OrderRepository.findByStoreId`/`findByStoreIdAndStatus`가 `o.customer`를 `JOIN FETCH`하면서 `Pageable`을 받는 예시다 (`countQuery`를 별도로 명시해 카운트 쿼리에서는 불필요한 조인을 생략).
- **to-many 연관관계(`@OneToMany`) + 페이징**: `JOIN FETCH`와 `Pageable`을 같이 쓰면 Hibernate가 `HHH000104` 경고를 내며 인메모리 페이징으로 전환돼 버린다(전체를 가져온 뒤 메모리에서 자르는 것과 같아 성능·카운트 정확도 모두 문제). 그래서 `orderItems`처럼 컬렉션을 페이징 조회와 함께 가져와야 할 때는, to-one 연관관계만 `JOIN FETCH`로 페이징 조회한 뒤 반환된 id로 `OrderItemRepository.findAllWithMenuItemByOrderIdIn(List<Long> orderIds)`를 별도 `IN` 쿼리로 배치 조회하고, `Collectors.groupingBy`로 메모리에서 묶는다.
- `OrderRepository.findAllWithItemsByStoreId`(비페이징, `orderItems`까지 한 번에 `JOIN FETCH`)는 2026-10-02 주문 목록 조회 통합 이후 더 이상 호출되지 않는 죽은 코드다. 페이징이 필요 없는 전체 목록 조회가 실제로 필요해지기 전까지는 삭제 후보로 남겨둔다.

## 4. 제약조건 정리

- **NOT NULL**: 위 표에 명시된 대로 모든 FK와 필수 비즈니스 값에 적용
- **UNIQUE**: `users.email`, `store_details.store_id`
- **길이 제한**: DTO `@Size`로 애플리케이션 레벨 검증 + DB 컬럼 `VARCHAR(n)`로 물리적 제한 이중화
- **형식 검증**: 이메일(`@Email`), 전화번호(`@Pattern`), 가격/수량(`@Positive`), 픽업시간(`@Future`) — 모두 DTO(`@Valid`) 단계에서 400 응답으로 차단
- **ON DELETE CASCADE**: `store_details`(store 삭제 시), `menu_items`(store 삭제 시) — 단, `Store`/`MenuItem` 자체는 소프트 삭제를 쓰기 때문에 실제 하드 DELETE가 발생하는 경우는 거의 없음 (더미데이터 재시딩 시에만 발생)

## 5. 소프트 삭제 컨벤션

`User`, `Store`, `MenuItem` 세 Entity는 `deletedAt`(nullable `LocalDateTime`) 컬럼과 `softDelete()` 메서드를 공통 패턴으로 가진다.

```java
@Column(name = "deleted_at")
private LocalDateTime deletedAt;

public void softDelete() {
    this.deletedAt = LocalDateTime.now();
}
```

조회 Repository 메서드는 전부 `...AndDeletedAtIsNull` 형태로 살아있는 데이터만 걸러서 조회한다. `Order`/`OrderItem`은 FK로 참조되는 대상이 아니라서(= 아무도 Order를 FK로 참조하지 않음) 소프트 삭제 없이 그대로 둔다.

## 6. 인덱스 전략

FK로 선언된 컬럼(`owner_id`, `store_id`, `user_id`, `menu_item_id`, `order_id`)은 MariaDB(InnoDB)가 FK 제약을 걸 때 자동으로 인덱스를 생성해주므로 별도 설정이 없어도 기본적인 조인 성능은 보장된다.

다만 다음 컬럼들은 자주 필터링/정렬 조건으로 쓰이는데 비-FK 컬럼이라 자동 인덱스가 없다. 현재 더미데이터 규모에서는 성능 영향이 없지만, 데이터가 커질 경우 아래를 인덱스 후보로 고려한다.

| 컬럼 | 사용처 | 인덱스 후보 이유 |
|---|---|---|
| `orders.status` | `findByStoreIdAndStatus`, 사장님 주문 목록의 상태 필터 | 상태별 주문 목록 필터링 — 2026-10-02 통합 이후 사장님 주문 목록 API의 실사용 조건이 되어 우선순위가 올라감 |
| `orders.created_at` | 주문 목록 최신순 정렬 (`ORDER BY o.createdAt DESC`), 당일 매출 집계 기간 조건 | 정렬/범위 조회 비용 |
| `stores.category` | 카테고리별 매장 검색 | WHERE 조건 |
| `stores.name` | 매장명 LIKE 검색 | LIKE 검색 (단, `%keyword%` 형태의 앞부분 와일드카드는 일반 B-Tree 인덱스로는 효과가 제한적 — 검색 기능이 커지면 전문 검색 인덱스 검토 필요) |

## 7. ERD (텍스트)

```
┌──────────┐        ┌──────────┐        ┌──────────────┐
│  users   │ 1    N │ stores   │ 1    1 │ store_details│
│──────────│───────▶│──────────│───────▶│──────────────│
│ id (PK)  │owner_id│ id (PK)  │store_id│ id (PK)       │
│ email    │        │ owner_id │(unique)│ store_id (FK) │
│ password │        │ name     │        │ open_time     │
│ name     │        │ address  │        │ close_time    │
│ phone    │        │ category │        └──────────────┘
│ role     │        │ image_url│
│ deleted_at│        │ deleted_at│       1
└────┬─────┘        └────┬─────┘        │
     │1                  │1             N
     │                   │        ┌──────────┐
     │N                  │N       │menu_items│
┌──────────┐        ┌──────────┐  │──────────│
│  orders  │        │  orders  │  │ id (PK)  │
│──────────│        │  (same)  │  │ store_id │
│ id (PK)  │        └────┬─────┘  │ name     │
│ user_id  │             │1       │ price    │
│ store_id │             │N       │ sold_out │
│ status   │      ┌─────────────┐ │image_url │
│total_price│      │ order_items │ │deleted_at│
│pickup_time│      │─────────────│ └────┬─────┘
└──────────┘      │ id (PK)      │      │1
                   │ order_id (FK)│      │
                   │ menu_item_id─┼──────┘N
                   │ quantity     │
                   │ price        │
                   └─────────────┘
```

## 8. 변경 이력

| 버전 | 검토일 | 주요 변경사항 |
|---|---|---|
| v1.0 | 2026-10-01 | 최초 작성 — Entity 6종, 공통 상위 클래스, 소프트 삭제/인덱스 전략 정리 |
| v1.1 | 2026-10-02 | Entity 구조 변경 없음. 팀 코드 리뷰에서 발견된 사장님 주문 목록 조회 Repository 통합 반영 — 3장에 `JOIN FETCH`의 to-one/to-many 구분 패턴을 명시하고, `findAllWithItemsByStoreId`가 죽은 코드가 되었음을 기록. 6장 인덱스 후보 우선순위에 `orders.status` 실사용 근거 추가 |
