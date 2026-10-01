import apiClient from "./client";
import { useAuthStore } from "../store/authStore";

const toOrder = (response) => ({
    id: response.orderId,
    status: response.status,
    pickupTime: response.pickupTime,
    totalPrice: response.totalAmount,
    storeName: response.storeName ?? null, // 아직 응답에 없음 → 화면에서 숨김
    items: response.items.map((item) => ({
        menuItemId: item.menuItemId,
        menuName: item.menuName,
        quantity: item.quantity,
    })),
});

/* 주문 1건 조회 — 로그인한 손님의 주문만 (남의 주문 번호면 404)
   GET /api/customers/{customerId}/orders/{orderId}
   customerId: 로그인 정보(authStore)의 user.id — client.js 가 토큰을 읽는 방식과 같음 */
export const fetchOrder = async (orderId) => {
    const customerId = useAuthStore.getState().user?.id;
    const response = await apiClient.get(`/api/customers/${customerId}/orders/${orderId}`);
    return toOrder(response.data);
};