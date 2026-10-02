/* ---------------------------------------------------------
   파트 C API — 사장님 주문 대시보드
   상태 변경 — 파트 C 사장님 전용 API (20260929 지우님 구현 · Postman 테스트 완료)
   백엔드 최신(backend_main 9/30) 실제 API 연결
   --------------------------------------------------------- */

import apiClient from "./client"; // 팀 공통 axios (baseURL = http://localhost:8080)

const USE_MOCK = false;

// 주문 목록은 10개씩 페이지
const ORDER_PAGE_SIZE = 100;

/* 백엔드 OrderResponse: { orderId, status, totalAmount, pickupTime, items: [{ menuItemId, menuName, quantity, orderPrice }] }
   손님 이름 · 전화번호는 아직 백엔드 응답에 없음 → null (화면에서 숨김) */
const toOrder = (response) => ({
  id: response.orderId,
  status: response.status,
  pickupTime: response.pickupTime,
  totalPrice: response.totalAmount,
  customerName: response.customerName ?? null,
  customerPhone: response.customerPhone ?? null,
  items: response.items.map((item) => ({
    menuItemId: item.menuItemId,
    menuName: item.menuName,
    quantity: item.quantity,
  })),
});

// 가게 정보 (머리말에 가게 이름 표시용) — GET /api/stores/{storeId}
export const getStore = async (storeId) => {
  const response = await apiClient.get(`/api/stores/${storeId}`);
  return response.data; // { id, name, address, category, ... }
};

// GET /api/stores/{storeId}/orders?size=100  → Page<OrderResponse> (목록은 content 안에)
export const getOwnerOrders = async (storeId) => {
  const response = await apiClient.get(`/api/stores/${storeId}/orders`, {params: { size: 100 },});
  return response.data.content.map(toOrder);
};

/* 상태 변경 — 파트 C 사장님 전용 API (지우님 구현 · Postman 테스트 완료)
   PATCH /api/owner/orders/{orderId}/status?ownerId=1   body { "status": "ACCEPTED" }
   - 이 사장님 가게의 주문만 바뀜 (남의 가게 주문이면 404)
   - 순서가 틀리면 409 (예: 접수 대기 → 바로 픽업 완료)
   ownerId: 지금은 가게 정보의 ownerId를 넣음.
            로그인(JWT)이 붙으면 백엔드가 토큰에서 꺼내도록 바뀔 예정 */
export const updateOrderStatus = async (orderId, status, ownerId) => {
  await apiClient.patch(
    `/api/owner/orders/${orderId}/status`,   // 주소
    { status },                              // 보낼 데이터 (body)
    { params: { ownerId } }                  // 주소 뒤 ?ownerId=1
  );
};

//오늘 매출 조회 api 추가 후 반영
// GET /api/owner/stores/${storeId}/sales/today  (storeId)  → { totalSales, orderCount }
// 픽업 완료(COMPLETED) 주문만, 오늘 픽업 완료 (백엔드 계산)
export const getTodaySales = async (storeId) => {
  const response = await apiClient.get(`/api/owner/stores/${storeId}/sales/today`);
  return response.data;
};
