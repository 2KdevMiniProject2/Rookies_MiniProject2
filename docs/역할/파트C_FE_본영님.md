# 🧑‍💻 [파트 C - FE] 본영님 업무 가이드

---

## 1. 나의 핵심 미션 (식당 비유)
> 🔔 **"카운터에서 '주문 접수! 조리 시작!' 누르고, 오늘 번 돈 정산하기!"**  
> 사장님이 실시간으로 들어오는 주문 알림을 보고 원클릭으로 `[주문 수락]`, `[조리 완료]` 상태를 제어하는 대시보드와, 오늘 들어온 총 주문 건수 및 총 매출액을 보여주는 정산 화면을 담당합니다. 또한 손님이 자기 주문이 지금 조리 중인지 실시간으로 확인하는 상태 화면도 제작합니다.

---

## 2. 작업할 파일 및 컴포넌트 목록

* **작업 디렉터리**: `frontend/src/features/dashboard/`, `frontend/src/features/order/`
* **라우팅 등록**: `frontend/src/routes/AppRouter.jsx`

### 1) 구현해야 할 페이지 및 컴포넌트
1. **사장님 실시간 주문 접수 대시보드 (`/owner/dashboard`)**
   - 파일: `src/features/dashboard/OwnerDashboardPage.jsx`
   - 컴포넌트:
     - `src/features/dashboard/SalesSummaryCard.jsx`: 오늘의 매출 현황 (오늘 접수 건수: 12건 / 총 매출액: 145,000원)
     - `src/features/dashboard/OrderItemCard.jsx`:
       - 주문번호, 픽업시간, 고객명, 주문 메뉴 리스트, 요청사항 표시
       - `PENDING` 상태일 때: `[주문 수락]` 버튼, `[주문 거절]` 버튼
       - `ACCEPTED` 상태일 때: `[조리 완료]` 버튼
     - 상태 변경 클릭 시 즉시 UI 뱃지 업데이트 및 서버에 `PATCH /api/orders/{orderId}/status` 요청
2. **손님용 내 주문 실시간 상태 확인 페이지 (`/orders/:orderId/status`)**
   - 파일: `src/features/order/OrderStatusPage.jsx`
   - 내용:
     - 주문번호(#5001) 및 픽업 예정 시간(15:30) 안내
     - 진행 상황 프로그레스 바:
       - `[1단계: 접수 대기 ⏳]` ➔ `[2단계: 조리중 🍳]` ➔ `[3단계: 조리 완료/픽업 대기 🛍️]`
     - 5~10초 주기 자동 조회(Polling) 또는 `[새로고침]` 버튼으로 최신 상태 갱신

---

## 3. 내가 호출할 백엔드 API (지우님과 소통)

| 기능 | HTTP Method | URI | 설명 |
| :--- | :--- | :--- | :--- |
| 사장님 주문 목록 조회 | `GET` | `/api/owner/orders` | 매장 주문 내역 배열 (접수대기, 조리중 등) |
| 주문 상태 변경 | `PATCH` | `/api/orders/{orderId}/status` | `{ status: "ACCEPTED" | "COMPLETED" }` |
| 손님 내 주문 상태 조회 | `GET` | `/api/orders/{orderId}` | 특정 주문의 현재 상태 단건 조회 |
| 오늘 매출 통계 조회 | `GET` | `/api/owner/sales/today` | `{ totalOrderCount, totalSalesAmount }` |

> 💡 **독립 개발 치트키 Tip**:  
> B파트에서 아직 장바구니 주문을 넣지 못하더라도, `OwnerDashboardPage.jsx`에 5001번 더미 주문 객체(바닐라라떼 2잔, 11000원, PENDING)를 하드코딩 배열로 선언해두고, `[수락]` 버튼 클릭 시 상태가 바뀌는 인터랙션부터 바로 만드세요!

---

## 4. 실시간성 처리 가이드 (추천: 주기적 폴링)
* 복잡한 웹소켓 대신 React의 `useEffect` + `setInterval`을 이용해 5초 간격으로 `GET /api/owner/orders`를 재호출하도록 구현하면 가장 안정적이고 빠릅니다.

```javascript
useEffect(() => {
  fetchOrders(); // 최초 1회
  const interval = setInterval(fetchOrders, 5000); // 5초마다 자동 갱신
  return () => clearInterval(interval); // 언마운트 시 정리
}, []);
```

---

## 5. 단계별 체크리스트
- [ ] `SalesSummaryCard.jsx` 오늘의 매출 현황 카드 UI 퍼블리싱
- [ ] `OrderItemCard.jsx` 주문 상태별 버튼(`[수락]`, `[완료]`) 및 상태 뱃지 퍼블리싱
- [ ] `OwnerDashboardPage.jsx`에서 주문 목록 렌더링 및 상태 변경 클릭 시 로컬 상태 업데이트
- [ ] `OrderStatusPage.jsx` 손님용 3단계 진행 바 UI 제작
- [ ] 5초 주기 폴링(Polling) 로직 추가
- [ ] 지우님(BE)과 주문 목록 및 상태 변경 API 연동 테스트
