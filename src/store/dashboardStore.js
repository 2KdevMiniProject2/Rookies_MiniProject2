import { create } from "zustand";
import { getOwnerOrders, updateOrderStatus, getTodaySales } from "../api/dashboardApi";

export const useDashboardStore = create((set, get) => ({
  orders: [],
  sales: { totalSales: 0, orderCount: 0 },
  loading: false,
  error: null,

  // 주문 목록 + 오늘 매출 한 번에 불러오기
  fetchDashboard: async (storeId) => {
    // 처음 한 번만 로딩 표시 (5초마다 갱신할 때 화면 깜빡임 방지)
    if (get().orders.length === 0) set({ loading: true });
    try {
      const [orders, sales] = await Promise.all([
        getOwnerOrders(storeId),
        getTodaySales(storeId),
      ]);
      set({ orders, sales, loading: false, error: null });
    } catch (error) {
      console.error("대시보드 불러오기 실패:", error);
      set({ loading: false, error: "주문 목록을 불러오지 못했어요. 잠시 후 다시 시도해주세요." });
    }
  },

  // 상태 변경 후 목록 다시 불러오기
  changeStatus: async (storeId, orderId, status, ownerId) => {
    try {
      await updateOrderStatus(orderId, status, ownerId);
      await get().fetchDashboard(storeId);
    } catch (error) {
      console.error("상태 변경 실패:", error);
      // 목록을 최신으로 맞춘 뒤 에러 문구를 띄운다 (먼저 띄우면 fetchDashboard 가 지워버림)
      await get().fetchDashboard(storeId);
      set({ error: error.response?.data?.message ?? "주문 상태를 바꾸지 못했어요. 다시 시도해주세요." });
    }
  },
}));