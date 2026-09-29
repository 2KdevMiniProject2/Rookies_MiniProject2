// 파트 C API
// 지금은 목데이터를 돌려줌. 연동 날에는 각 함수 안의 "MOCK" 부분만 아래 주석의 axios 코드로 바꾸면 됨.
// import api from "./axios";
import { mockOrders } from "../mock/orders";

let orders = mockOrders.map((order) => ({ ...order }));
const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

// GET /api/owner/orders  (storeId)  → OrderResponse[]
export const getOwnerOrders = async (storeId) => {
  // const res = await apiClient.get("/api/owner/orders", { params: { storeId } });
  // return res.data;
  await delay(); // MOCK
  return orders.filter((order) => order.storeId === storeId).map((order) => ({ ...order }));
};

// PATCH /api/orders/{orderId}/status   body: { status }  → 응답 없음(Void)
// status: "ACCEPTED" | "READY" | "COMPLETED" | "REJECTED"
export const updateOrderStatus = async (orderId, status) => {
  // await apiClient.patch(`/api/orders/${orderId}/status`, { status });
  await delay(); // MOCK
  orders = orders.map((order) => (order.id === orderId ? { ...order, status } : order));
};

// GET /api/owner/sales/today  (storeId)  → { totalSales, orderCount }
// 거절(REJECTED)된 주문은 매출·건수에서 제외 (백엔드 집계 기준과 맞출 것)
export const getTodaySales = async (storeId) => {
  // const res = await apiClient.get("/api/owner/sales/today", { params: { storeId } });
  // return res.data;
  await delay(); // MOCK
  const mine = orders.filter((order) => order.storeId === storeId && order.status !== "REJECTED");
  return {
    totalSales: mine.reduce((sum, order) => sum + order.totalPrice, 0),
    orderCount: mine.length,
  };
};