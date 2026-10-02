/* ---------------------------------------------------------
   파트 C API — 사장님 주문 대시보드
   상태 변경 — 파트 C 사장님 전용 API (20260929 지우님 구현 · Postman 테스트 완료)
   백엔드 최신(backend_main 9/30) 실제 API 연결
   --------------------------------------------------------- */

import apiClient from "./client"; // 팀 공통 axios (baseURL = http://localhost:8080)

//const USE_MOCK = false;

/* 백엔드 OwnerOrderResponse → 화면에서 쓰는 모양
   { orderId, status, totalAmount, pickupTime, createdAt, customerName, requestNotes,
     items: [{ menuItemId, menuName, quantity, orderPrice }] } */
const toOrder = (response) => ({
  id: response.orderId,
  status: response.status,
  pickupTime: response.pickupTime,
  createdAt: response.createdAt,
  totalPrice: response.totalAmount,
  customerName: response.customerName,
  requestNotes: response.requestNotes ?? "",
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

// 사장님 주문 목록 — GET /api/owner/stores/{storeId}/orders (OWNER, 내 가게만) → Page
// 최신 100건을 받아서(desc) 화면에는 먼저 들어온 주문이 위로 오게함
// (오래된 순으로 100건을 받으면 완료 주문이 쌓였을 때 새 주문이 잘림)
export const getOwnerOrders = async (storeId) => {
  const response = await apiClient.get(`/api/owner/stores/${storeId}/orders`, {
    params: { size: 100, sort: "createdAt,desc" },
  });
  return response.data.content.map(toOrder).reverse();
};

/* 상태 변경 — 파트 C 사장님 전용 API */
export const updateOrderStatus = async (orderId, status) => {
  await apiClient.patch(
    `/api/owner/orders/${orderId}/status`,   // 주소
    { status },                              // 보낼 데이터 (body)                 // 주소 뒤 ?ownerId=1
  );
};

//오늘 매출 조회 api 추가 후 반영
// GET /api/owner/stores/${storeId}/sales/today  (storeId)  → { totalSales, orderCount }
// 픽업 완료(COMPLETED) 주문만, 오늘 픽업 완료 (백엔드 계산)
export const getTodaySales = async (storeId) => {
  const response = await apiClient.get(`/api/owner/stores/${storeId}/sales/today`);
  return response.data;
};
