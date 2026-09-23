# ⚙️ [파트 C - BE] 지우님 업무 가이드

---

## 1. 나의 핵심 미션 (식당 비유)
> 🔔 **"카운터에서 '주문 접수! 조리 시작!' 누르고, 오늘 번 돈 정산하기!"**  
> 사장님이 실시간으로 들어온 주문들을 확인하고 상태를 `PENDING` ➔ `ACCEPTED` ➔ `COMPLETED`로 변경하는 상태 라이프사이클 API와, 오늘 발생한 총 매출과 주문 건수를 집계(`SUM`, `COUNT`)하는 쿼리 및 통계 API를 담당합니다.

---

## 2. 작업할 패키지 및 쿼리 구조

* **패키지 위치**: `com.rookies6.MiniProject2.domain.order`, `com.rookies6.MiniProject2.domain.sales`

### 1) 참조 및 관리할 Entity
* `Order.java` (인선님이 작성한 Entity를 바탕으로 상태 변경 및 조회 메서드 확장)
* `OrderStatus.java` (Enum: `PENDING`, `ACCEPTED`, `COMPLETED`, `CANCELLED`)

---

## 3. 구현해야 할 Controller / Service / Repository

### 1) 주문 상태 관리 API
* `OwnerOrderController.java`:
  * `GET /api/owner/orders`: 현재 로그인한 사장님 매장(`store_id`)의 주문 목록 (최신순 정렬, `status` 조건 필터)
  * `PATCH /api/orders/{orderId}/status`: 주문 상태 변경 (`PENDING` ➔ `ACCEPTED` ➔ `COMPLETED`)
  * `GET /api/orders/{orderId}`: 손님용 단건 주문 상태 조회 (손님이 실시간 페이지에서 조회)
* `OrderService.java`: 상태 전환 비즈니스 로직 및 유효성 검증 (완료된 주문 취소 불가 등)

### 2) 당일 매출 집계 API (통계 프로젝션)
* `SalesController.java`:
  * `GET /api/owner/sales/today`: 오늘의 총 매출액 및 완료된 주문 건수 반환
* `OrderRepository.java` (JPA 쿼리 메소드 또는 JPQL):
```java
public interface OrderRepository extends JpaRepository<Order, Long> {

    // 사장님 매장의 오늘 날짜 매출 통계 (SUM, COUNT)
    @Query("SELECT new com.rookies6.MiniProject2.domain.sales.dto.TodaySalesDto(" +
           "COUNT(o), COALESCE(SUM(o.totalAmount), 0)) " +
           "FROM Order o " +
           "WHERE o.store.id = :storeId " +
           "AND o.status IN ('ACCEPTED', 'COMPLETED') " +
           "AND o.createdAt >= :startOfDay AND o.createdAt <= :endOfDay")
    TodaySalesDto findTodaySalesByStoreId(
        @Param("storeId") Long storeId,
        @Param("startOfDay") LocalDateTime startOfDay,
        @Param("endOfDay") LocalDateTime endOfDay
    );
}
```

---

## 4. 독립 개발 치트키 (파트 B 대기 없이 바로 시작하기)
인선님(B파트 BE)이 장바구니 주문 API를 만들기 전이라도, 지우님의 로컬 DB에 **5001번 주문 더미 데이터**를 미리 심어두고 상태 변경 API와 매출 쿼리를 즉시 개발하세요!

```sql
INSERT INTO orders (id, customer_id, store_id, status, total_amount, pickup_time, request_notes, created_at, updated_at)
VALUES (5001, 2, 1, 'PENDING', 11000, '15:30:00', '얼음 많이 넣어주세요.', NOW(), NOW());

INSERT INTO order_items (id, order_id, menu_item_id, quantity, order_price, created_at, updated_at)
VALUES (1, 5001, 101, 2, 5500, NOW(), NOW());
```

---

## 5. 단계별 체크리스트
- [ ] 주문 상태 변경(`PATCH /api/orders/{orderId}/status`) 로직 작성
- [ ] 사장님 매장 주문 목록 조회 (`GET /api/owner/orders`) 작성 (최신순 페이징/정렬)
- [ ] 손님용 주문 단건 상태 조회 (`GET /api/orders/{orderId}`) 작성
- [ ] 오늘 매출 통계 쿼리(`COUNT`, `SUM`) 및 `GET /api/owner/sales/today` API 구현
- [ ] 본영님(FE)과 사장님 대시보드 상태 변경 및 매출 통계 연동 테스트
