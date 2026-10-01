import apiClient from "./client";

// 로그인 연결 전 임시 손님 번호 (더미데이터 2번 = 이수강 손님, 장바구니와 같은 값)
// TODO: 병합 후 useAuthStore 의 user.id 로 교체
const TEMP_CUSTOMER_ID = 2;

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

export const fetchOrder = async (orderId) => {
    const response = await apiClient.get(`/api/customers/${TEMP_CUSTOMER_ID}/orders/${orderId}`);
    return toOrder(response.data);
};