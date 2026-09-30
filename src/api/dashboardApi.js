/* ---------------------------------------------------------
   파트 C API — 사장님 주문 대시보드
   백엔드 최신(backend_main 9/30) 실제 API 연결

   USE_MOCK = true 로 바꾸면 백엔드 없이 목데이터(mock/orders.js)로 동작합니다.
   --------------------------------------------------------- */

import apiClient from "./client"; // 팀 공통 axios (baseURL = http://localhost:8080)

const USE_MOCK = false;

// 주문 목록은 10개씩 페이지
const ORDER_PAGE_SIZE = 100;

// 상태 → 백엔드 PATCH 주소 끝부분
// PATCH /api/orders/{orderId}/accept | reject | ready | complete  (body 없음)
const STATUS_TO_PATH = {
  ACCEPTED: "accept",
  REJECTED: "reject",
  READY: "ready",
  COMPLETED: "complete",
};

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

// PATCH /api/orders/{orderId}/status   body: { status }  → 응답 없음(Void)
// status: "ACCEPTED" | "READY" | "COMPLETED" | "REJECTED"
export const updateOrderStatus = async (orderId, status) => {
  const path = STATUS_TO_PATH[status];
  if (!path) {
    throw new Error(`바꿀 수 없는 상태입니다: ${status}`);
  }
  await apiClient.patch(`/api/orders/${orderId}/${path}`);
};

// GET /api/owner/sales/today  (storeId)  → { totalSales, orderCount }
export const getTodaySales = async (storeId) => {
  const orders = await getOwnerOrders(storeId);
  const today = todayText();
  const todayOrders = orders.filter(
    (order) => order.pickupTime.startsWith(today) && order.status !== "REJECTED"
  );
  return {
    totalSales: todayOrders.reduce((sum, order) => sum + order.totalPrice, 0),
    orderCount: todayOrders.length,
  };
};

// 분리 필요
// 오늘 날짜 "YYYY-MM-DD" (내 컴퓨터 시간 기준)
const todayText = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
};