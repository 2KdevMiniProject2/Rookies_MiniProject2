# 🧑‍💻 [파트 B - FE] 영서님 업무 가이드

---

## 1. 나의 핵심 미션 (식당 비유)
> 🍔 **"진열대에 빵/커피 진열하고, 손님이 장바구니에 담아서 주문서 내기!"**  
> 특정 매장의 메뉴들을 매력적인 카드 형태로 보여주고, 손님이 메뉴를 담아 수량을 조절하고 픽업 시간을 지정하여 주문(`POST /api/orders`)을 완료하는 전체 쇼핑/주문 경험을 담당합니다. 또한 사장님이 메뉴를 추가하고 품절 토글을 하는 화면도 제작합니다.

---

## 2. 작업할 파일 및 컴포넌트 목록

* **작업 디렉터리**: `frontend/src/features/order/`, `frontend/src/store/`
* **라우팅 등록**: `frontend/src/routes/AppRouter.jsx`

### 1) 상태 관리 (Zustand)
* `src/store/cartStore.js`:
  * 상태: `storeId` (선택된 매장), `items` (`[{ menuItemId, name, price, quantity }]`), `totalAmount`
  * 액션: `addItem(item)`, `removeItem(menuItemId)`, `updateQuantity(menuItemId, qty)`, `clearCart()`

### 2) 구현해야 할 페이지 및 컴포넌트
1. **가게 상세 & 메뉴판 페이지 (`/stores/:storeId`)**
   - 파일: `src/features/order/StoreDetailPage.jsx`
   - 컴포넌트:
     - 매장 상단 헤더 (매장명, 영업시간, 전화번호, 소개글)
     - `src/features/order/MenuItemCard.jsx`: 메뉴 사진, 메뉴명, 가격, `+ 담기` 버튼 (품절 시 비활성화 및 '품절' 뱃지 표시)
     - `src/features/order/CartBottomBar.jsx`: 화면 하단 고정 플로팅 바 (담긴 총 개수, 총 금액 실시간 표시, `[주문하기]` 버튼)
2. **장바구니 & 픽업 주문서 작성 페이지 (`/checkout`)**
   - 파일: `src/features/order/CheckoutPage.jsx`
   - 내용:
     - 담은 메뉴 리스트 및 수량 변경 / 삭제 인터랙션
     - 픽업 예정 시간 선택 (예: 15:30)
     - 사장님께 요청사항 입력 필드
     - 최종 결제/주문하기 버튼 ➔ `POST /api/orders` 호출 ➔ 주문 성공 시 파트 C 본영님의 주문 상태 페이지(`/orders/:orderId/status`)로 이동!
3. **사장님 메뉴 관리 페이지 (`/owner/menus`)**
   - 파일: `src/features/order/OwnerMenuPage.jsx`
   - 내용: 신규 메뉴 등록 폼(메뉴명, 가격), 기존 메뉴 목록 및 실시간 품절 스위치(토글)

---

## 3. 내가 호출할 백엔드 API (인선님과 소통)

| 기능 | HTTP Method | URI | 설명 |
| :--- | :--- | :--- | :--- |
| 매장 메뉴판 조회 | `GET` | `/api/stores/{storeId}/menus` | 메뉴 아이템 배열 수신 |
| 픽업 주문서 접수 | `POST` | `/api/orders` | `{ storeId, pickupTime, requestNotes, totalAmount, items }` |
| 신규 메뉴 등록 | `POST` | `/api/stores/{storeId}/menus` | `{ name, price, imageUrl }` |
| 품절 상태 변경 | `PATCH` | `/api/menus/{menuId}/sold-out`| 사장님의 품절 on/off 토글 |

> 💡 **독립 개발 치트키 Tip**:  
> A파트와 BE가 완성되지 않았더라도 URL을 `/stores/1`로 직접 쳐서 진입할 수 있도록, `StoreDetailPage.jsx`에 초기 목업 메뉴 데이터(바닐라라떼, 아메리카노 등)를 준비해두고 화면을 먼저 완성하세요!

---

## 4. 다른 파트에 넘겨줄 핵심 선물
* 👉 **`order_id` (주문 번호)**: 장바구니에서 `[주문하기]`가 성공했을 때 서버가 주는 `orderId`(예: 5001)를 파트 C 본영님의 실시간 상태 페이지(`/orders/:orderId/status`)로 넘겨줍니다!

---

## 5. 단계별 체크리스트
- [ ] `cartStore.js` 작성 (담기, 수량변경, 총액 자동합산)
- [ ] `MenuItemCard.jsx` 및 `StoreDetailPage.jsx` 퍼블리싱
- [ ] 하단 `CartBottomBar.jsx` 인터랙션 (담을 때마다 카운트 올라감)
- [ ] `CheckoutPage.jsx` 픽업시간 선택 및 폼 유효성 검사
- [ ] 인선님(BE)과 메뉴 조회 및 주문 접수 API 연동 테스트
- [ ] 주문 완료 후 파트 C(본영님) 화면으로 `orderId` 전달 연계 확인
