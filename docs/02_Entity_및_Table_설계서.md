# 💾 [루키즈 미니프로젝트 2] 02. Entity 및 Table 설계서

---

## 1. 개요
본 문서는 JPA(Java Persistence API) 기반의 객체 모델(Entity)과 관계형 데이터베이스(MySQL)의 물리 테이블 구조를 정의합니다.
* 모든 엔티티는 `BaseEntity`를 상속받아 `created_at` 및 `updated_at` 일시를 공통 관리합니다.
* 파트 A, B, C가 명확하게 참조 관계를 공유할 수 있도록 외래키(FK) 및 연관관계를 설계했습니다.

---

## 2. JPA Entity 명세 및 연관관계

### 2.1 Entity 목록 요약

| 파트 | Entity 클래스명 | 테이블명 | 설명 | 주요 연관관계 |
| :--- | :--- | :--- | :--- | :--- |
| **🟢 A** | `User` | `users` | 사용자 계정 (손님/사장님) | `Store`(1:1), `Order`(1:N) |
| **🟢 A** | `Store` | `stores` | 매장 기본 정보 | `User`(1:1), `StoreDetail`(1:1), `MenuItem`(1:N) |
| **🟢 A** | `StoreDetail` | `store_details` | 매장 영업시간 및 상세 소개 | `Store`(1:1 양방향 또는 단방향) |
| **🟡 B** | `MenuItem` | `menu_items` | 매장 판매 메뉴 및 품절 상태 | `Store`(N:1) |
| **🟡 B** | `Order` | `orders` | 주문 마스터 (금액, 픽업시간) | `User`(N:1), `Store`(N:1), `OrderItem`(1:N) |
| **🟡 B** | `OrderItem` | `order_items` | 주문에 포함된 개별 메뉴 품목 | `Order`(N:1), `MenuItem`(N:1) |

---

### 2.2 Entity 상세 설계

#### 1) `User` (회원)
```java
@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_user_email", columnList = "email", unique = true)
})
@Getter @NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(nullable = false, length = 50)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role; // CUSTOMER, OWNER, ADMIN
}
```

#### 2) `Store` (가게)
```java
@Entity
@Table(name = "stores")
@Getter @NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Store extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false, unique = true)
    private User owner;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 50)
    private String category; // 카페/디저트, 베이커리, 한식, 양식 등

    @Column(nullable = false, length = 200)
    private String address;

    @Column(length = 20)
    private String storePhone;

    @Column(length = 500)
    private String imageUrl;
}
```

#### 3) `StoreDetail` (가게 상세)
```java
@Entity
@Table(name = "store_details")
@Getter @NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StoreDetail extends BaseEntity {
    @Id
    private Long storeId; // Store의 PK를 공유 (MapsId)

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "store_id")
    private Store store;

    @Column(nullable = false)
    private LocalTime openTime;

    @Column(nullable = false)
    private LocalTime closeTime;

    @Column(columnDefinition = "TEXT")
    private String description;
}
```

#### 4) `MenuItem` (메뉴)
```java
@Entity
@Table(name = "menu_items", indexes = {
    @Index(name = "idx_menu_store", columnList = "store_id")
})
@Getter @NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MenuItem extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false)
    private Integer price;

    @Column(nullable = false)
    private Boolean isSoldOut = false;

    @Column(length = 500)
    private String imageUrl;
}
```

#### 5) `Order` (주문 마스터)
```java
@Entity
@Table(name = "orders", indexes = {
    @Index(name = "idx_order_store_status", columnList = "store_id, status"),
    @Index(name = "idx_order_customer", columnList = "customer_id")
})
@Getter @NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Order extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderStatus status = OrderStatus.PENDING; // PENDING, ACCEPTED, COMPLETED, CANCELLED

    @Column(nullable = false)
    private Integer totalAmount;

    @Column(nullable = false)
    private LocalTime pickupTime;

    @Column(length = 255)
    private String requestNotes;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> orderItems = new ArrayList<>();
}
```

#### 6) `OrderItem` (주문 상세)
```java
@Entity
@Table(name = "order_items")
@Getter @NoArgsConstructor(access = AccessLevel.PROTECTED)
public class OrderItem extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_item_id", nullable = false)
    private MenuItem menuItem;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private Integer orderPrice; // 주문 당시 메뉴 단가 스냅샷
}
```

---

## 3. 물리 데이터베이스 Table 설계서

### 3.1 `users` (회원 테이블)
| 컬럼명 | 데이터타입 | 길이 | Null | 기본값 | 설명 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | BIGINT | - | N | AUTO_INCREMENT | 회원 고유 식별자 (PK) |
| `email` | VARCHAR | 100 | N | - | 로그인 이메일 (UNIQUE) |
| `password` | VARCHAR | 255 | N | - | 암호화된 비밀번호 |
| `name` | VARCHAR | 50 | N | - | 사용자명 (또는 닉네임) |
| `role` | VARCHAR | 20 | N | 'CUSTOMER' | 권한 (`CUSTOMER`, `OWNER`, `ADMIN`) |
| `created_at` | DATETIME | - | N | CURRENT_TIMESTAMP | 생성일시 |
| `updated_at` | DATETIME | - | N | CURRENT_TIMESTAMP | 수정일시 |

### 3.2 `stores` (가게 테이블)
| 컬럼명 | 데이터타입 | 길이 | Null | 기본값 | 설명 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | BIGINT | - | N | AUTO_INCREMENT | 가게 식별자 (PK) |
| `owner_id` | BIGINT | - | N | - | 사장님 회원 ID (FK -> users.id) |
| `name` | VARCHAR | 100 | N | - | 가게명 |
| `category` | VARCHAR | 50 | N | - | 카테고리 (카페, 베이커리 등) |
| `address` | VARCHAR | 200 | N | - | 가게 도로명 주소 |
| `store_phone` | VARCHAR | 20 | Y | NULL | 가게 대표 전화번호 |
| `image_url` | VARCHAR | 500 | Y | NULL | 매장 대표 이미지 URL |
| `created_at` | DATETIME | - | N | CURRENT_TIMESTAMP | 생성일시 |
| `updated_at` | DATETIME | - | N | CURRENT_TIMESTAMP | 수정일시 |

### 3.3 `store_details` (가게 상세 테이블)
| 컬럼명 | 데이터타입 | 길이 | Null | 기본값 | 설명 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `store_id` | BIGINT | - | N | - | 가게 ID (PK & FK -> stores.id) |
| `open_time` | TIME | - | N | '09:00:00' | 오픈 시간 |
| `close_time` | TIME | - | N | '21:00:00' | 마감 시간 |
| `description` | TEXT | - | Y | NULL | 가게 소개 및 공지글 |
| `created_at` | DATETIME | - | N | CURRENT_TIMESTAMP | 생성일시 |
| `updated_at` | DATETIME | - | N | CURRENT_TIMESTAMP | 수정일시 |

### 3.4 `menu_items` (메뉴 테이블)
| 컬럼명 | 데이터타입 | 길이 | Null | 기본값 | 설명 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | BIGINT | - | N | AUTO_INCREMENT | 메뉴 식별자 (PK) |
| `store_id` | BIGINT | - | N | - | 소속 가게 ID (FK -> stores.id) |
| `name` | VARCHAR | 100 | N | - | 메뉴명 |
| `price` | INT | - | N | 0 | 메뉴 가격 |
| `is_sold_out` | BOOLEAN | - | N | FALSE | 품절 여부 (TRUE: 품절) |
| `image_url` | VARCHAR | 500 | Y | NULL | 메뉴 이미지 URL |
| `created_at` | DATETIME | - | N | CURRENT_TIMESTAMP | 생성일시 |
| `updated_at` | DATETIME | - | N | CURRENT_TIMESTAMP | 수정일시 |

### 3.5 `orders` (주문 테이블)
| 컬럼명 | 데이터타입 | 길이 | Null | 기본값 | 설명 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | BIGINT | - | N | AUTO_INCREMENT | 주문 번호 (PK, 예: 5001) |
| `customer_id`| BIGINT | - | N | - | 주문 고객 ID (FK -> users.id) |
| `store_id` | BIGINT | - | N | - | 주문 대상 가게 ID (FK -> stores.id) |
| `status` | VARCHAR | 20 | N | 'PENDING' | 주문 상태 (`PENDING`, `ACCEPTED`, `COMPLETED`, `CANCELLED`) |
| `total_amount`| INT | - | N | 0 | 총 결제 금액 |
| `pickup_time`| TIME | - | N | - | 픽업 예정 시간 (예: 15:30:00) |
| `request_notes`| VARCHAR | 255 | Y | NULL | 손님 요청사항 (예: "얼음 적게") |
| `created_at` | DATETIME | - | N | CURRENT_TIMESTAMP | 생성일시 |
| `updated_at` | DATETIME | - | N | CURRENT_TIMESTAMP | 수정일시 |

### 3.6 `order_items` (주문 상세 테이블)
| 컬럼명 | 데이터타입 | 길이 | Null | 기본값 | 설명 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | BIGINT | - | N | AUTO_INCREMENT | 주문 상세 식별자 (PK) |
| `order_id` | BIGINT | - | N | - | 소속 주문 ID (FK -> orders.id) |
| `menu_item_id`| BIGINT | - | N | - | 메뉴 ID (FK -> menu_items.id) |
| `quantity` | INT | - | N | 1 | 주문 수량 |
| `order_price` | INT | - | N | 0 | 주문 당시 메뉴 단가 |
| `created_at` | DATETIME | - | N | CURRENT_TIMESTAMP | 생성일시 |
| `updated_at` | DATETIME | - | N | CURRENT_TIMESTAMP | 수정일시 |

---

## 4. 파트별 독립 개발 치트키 (초기 더미 데이터 DDL/DML)

파트 B, C가 선행 파트(A, B)의 개발 완료를 기다리지 않고 즉시 시작할 수 있도록 `DataInitRunner`에서 초기 주입할 데이터 규격입니다.

```sql
-- 1. 파트 A 더미 유저
INSERT INTO users (id, email, password, name, role, created_at, updated_at)
VALUES (1, 'owner@rookie.com', '$2a$10$...', '사장님1', 'OWNER', NOW(), NOW()),
       (2, 'customer@rookie.com', '$2a$10$...', '손님1', 'CUSTOMER', NOW(), NOW());

-- 2. 파트 B 독립 개발 치트키: 가게 1번 (루키즈 베이커리)
INSERT INTO stores (id, owner_id, name, category, address, store_phone, created_at, updated_at)
VALUES (1, 1, '루키즈 베이커리', '베이커리', '서울시 강남구 테헤란로 123', '02-555-1234', NOW(), NOW());

INSERT INTO store_details (store_id, open_time, close_time, description, created_at, updated_at)
VALUES (1, '09:00:00', '21:00:00', '매일 아침 갓 구운 천연 발효빵을 만듭니다.', NOW(), NOW());

INSERT INTO menu_items (id, store_id, name, price, is_sold_out, created_at, updated_at)
VALUES (101, 1, '바닐라라떼', 5500, FALSE, NOW(), NOW()),
       (102, 1, '아메리카노', 4000, FALSE, NOW(), NOW()),
       (103, 1, '소금빵', 3500, FALSE, NOW(), NOW());

-- 3. 파트 C 독립 개발 치트키: 5001번 주문
INSERT INTO orders (id, customer_id, store_id, status, total_amount, pickup_time, request_notes, created_at, updated_at)
VALUES (5001, 2, 1, 'PENDING', 11000, '15:30:00', '얼음 많이 넣어주세요.', NOW(), NOW());

INSERT INTO order_items (id, order_id, menu_item_id, quantity, order_price, created_at, updated_at)
VALUES (1, 5001, 101, 2, 5500, NOW(), NOW());
```
