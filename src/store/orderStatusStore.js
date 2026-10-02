/* ---------------------------------------------------------
   손님 주문 상태 store
     값      order · loading · error
     함수    loadOrder(orderId)

   서버에서 받아오는 값과 로딩·에러는 store 에 두고,
   "새로고침 버튼을 누르는 중" 같은 화면 전용 값은 페이지의 useState에 둠.
   --------------------------------------------------------- */
import { create } from "zustand";

import { fetchOrder, cancelOrder } from "../api/orderApi";

export const useOrderStatusStore = create((set, get) => ({
    order: null,
    loading: false,
    error: null,

    loadOrder: async (orderId) => {
        /* 처음 불러올 때만 loading 을 켠다.
           (5초마다 부를 때마다 "불러오는 중…" 이 뜨면서 화면이 깜빡임) */
        const isFirstLoad = get().order?.id !== Number(orderId);
        if (isFirstLoad) {
            set({ loading: true, error: null });
        }

        try {
            const order = await fetchOrder(orderId);
            set({ order: order, error: null });
        } catch (error) {
            console.error("주문 상태 불러오기 실패:", error);
            // 서버 문구(예: "주문을 찾을 수 없습니다") → 없으면 기본 문구
            set({ error: error.response?.data?.message ?? "주문 정보를 불러오지 못했어요." });
        } finally {
            set({ loading: false });
        }
    },

    // 주문 취소 → 성공하면 다시 불러와서 "취소됨" 화면으로
    cancelMyOrder: async (orderId) => {
        try {
            await cancelOrder(orderId);
            await get().loadOrder(orderId);
        } catch (error) {
            console.error("주문 취소 실패:", error);
            // 409 = 그 사이 사장님이 수락함 → 서버 문구가 어려워서 우리 문구로
            const message = error.response?.status === 409
                ? "사장님이 이미 주문을 수락해서 취소할 수 없어요."
                : error.response?.data?.message ?? "주문을 취소하지 못했어요.";
            await get().loadOrder(orderId);   // 바뀐 상태(조리 중 등)로 화면 맞추기
            set({ error: message });          // 다시 불러온 뒤에 문구를 넣어야 안 지워짐
        }
    },

}));

