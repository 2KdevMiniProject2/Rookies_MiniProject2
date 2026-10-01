import apiClient from './client';
import { useAuthStore } from '../store/authStore';

const toOrder = (response) => ({
    id: response.orderId,
    status: response.status,
    pickupTime: response.pickupTime,
    totalPrice: response.totalAmount,
    storeName: response.storeName ?? null,
    items: (response.items ?? []).map((item) => ({
        menuItemId: item.menuItemId,
        menuName: item.menuName,
        quantity: item.quantity,
    })),
});

/* 로그인한 손님의 주문 목록 조회
   GET /api/customers/{customerId}/orders */
export const fetchOrders = async ({ page = 0, size = 10 } = {}) => {
    const customerId = useAuthStore.getState().user?.id;

    if (!customerId) {
        throw new Error('로그인 사용자 정보가 없습니다.');
    }

    const response = await apiClient.get(`/api/customers/${customerId}/orders`, {
        params: {
            page,
            size,
            sort: 'createdAt,desc',
        },
    });

    return {
        orders: (response.data.content ?? []).map(toOrder),
        totalElements: response.data.totalElements ?? 0,
        totalPages: response.data.totalPages ?? 0,
        page: response.data.number ?? page,
    };
};

/* 주문 1건 조회 — 로그인한 손님의 주문만 (남의 주문 번호면 404)
   GET /api/customers/{customerId}/orders/{orderId} */
export const fetchOrder = async (orderId) => {
    const customerId = useAuthStore.getState().user?.id;

    if (!customerId) {
        throw new Error('로그인 사용자 정보가 없습니다.');
    }

    const response = await apiClient.get(`/api/customers/${customerId}/orders/${orderId}`);
    return toOrder(response.data);
};
