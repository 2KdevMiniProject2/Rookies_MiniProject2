# ⚙️ [파트 B - BE] 인선님 업무 가이드

---

## 1. 나의 핵심 미션 (식당 비유)
> 🍔 **"진열대에 빵/커피 진열하고, 손님이 장바구니에 담아서 주문서 내기!"**  
> 특정 매장의 메뉴 목록(`MenuItem`)을 관리하고, 손님이 전송한 장바구니 품목들을 검증하여 주문 마스터(`Order`)와 주문 상세(`OrderItem`) 테이블에 안전하게 저장하는 핵심 트랜잭션을 담당합니다.

---

## 2. 작업할 엔티티 및 패키지 구조

* **패키지 위치**: `com.rookies6.MiniProject2.domain.menu`, `com.rookies6.MiniProject2.domain.order`

### 1) 담당 Entity 설계 및 생성
1. **`MenuItem.java`**: 
   - 필드: `id`, `store` (`Store`와 N:1), `name`, `price`, `isSoldOut` (default false), `imageUrl`
2. **`Order.java`**: 
   - 필드: `id`, `customer` (`User`와 N:1), `store` (`Store`와 N:1), `status` (기본값 `PENDING`), `totalAmount`, `pickupTime`, `requestNotes`, `orderItems` (1:N 양방향)
3. **`OrderItem.java`**: 
   - 필드: `id`, `order` (`Order`와 N:1), `menuItem` (`MenuItem`과 N:1), `quantity`, `orderPrice` (주문 시점 단가 스냅샷)

---

## 3. 구현해야 할 Controller / Service / Repository

### 1) Menu 도메인
* `MenuController.java`:
  * `GET /api/stores/{storeId}/menus`: 특정 매장의 메뉴 목록 조회
  * `POST /api/stores/{storeId}/menus`: 신규 메뉴 등록
  * `PATCH /api/menus/{menuId}/sold-out`: 품절 여부 토글 (사장님 전용)
* `MenuService.java` & `MenuItemRepository.java`

### 2) Order 도메인 (주문 생성)
* `OrderController.java`:
  * `POST /api/orders`: 장바구니 픽업 주문서 저장
* `OrderService.java`:
  * **주문 생성 로직 및 데이터 정합성 검증 (`@Transactional`)**:
    1. 요청된 메뉴들이 실제로 존재하는지 & 품절(`isSoldOut`) 상태가 아닌지 검증
    2. 클라이언트가 보낸 `totalAmount`가 `(각 메뉴의 실제 DB 가격 * 수량)`의 총합과 일치하는지 검증 (위변조 방지!)
    3. `Order` 엔티티 생성 (초기 상태는 `OrderStatus.PENDING`) 및 `OrderItem` 자식 리스트 생성 후 일괄 저장
    4. 생성된 `orderId`(예: 5001) 반환

---

## 4. 독립 개발 치트키 (파트 A 대기 없이 바로 시작하기)
현준님(A파트 BE)이 매장 API를 완성하지 않았더라도, 인선님의 로컬 H2/MySQL DB에 **가게 1번 (루키즈 베이커리)** 더미 데이터를 미리 넣어두면 바로 개발할 수 있습니다!

```sql
INSERT INTO stores (id, owner_id, name, category, address, created_at, updated_at)
VALUES (1, 1, '루키즈 베이커리', '베이커리', '서울시 강남구 테헤란로 123', NOW(), NOW());
```

---

## 5. 파트 C(지우님)에게 선물해 줄 것
* 👉 인선님이 `orders` 테이블에 초기 주문(`status = 'PENDING'`)을 저장해주어야, 파트 C(지우님)가 이 주문의 상태를 `ACCEPTED`나 `COMPLETED`로 변경할 수 있습니다!

---

## 6. 단계별 체크리스트
- [ ] `MenuItem`, `Order`, `OrderItem` JPA 엔티티 작성
- [ ] 메뉴 목록 조회 및 신규 메뉴 등록 API 구현
- [ ] 품절 상태 변경(`PATCH /api/menus/{menuId}/sold-out`) 구현
- [ ] 주문서 접수(`POST /api/orders`) 트랜잭션 및 가격 위변조 검증 로직 구현
- [ ] 영서님(FE)과 장바구니 주문 전송 테스트
- [ ] 파트 C(지우님)에게 주문 데이터(`orders` 테이블) 규격 공유
