/* ---------------------------------------------------------
   주문 API — 서버와 대화하는 부분만 모아 둔다 
   팀 공통 axios 인스턴스(client.js)를 사용
  

   ※ API 가 생기면 false 로 바꾸기
   --------------------------------------------------------- */

import apiClient from "./client";

const USE_MOCK = true; // 에러 화면 테스트 false로 바꾸기.

// 주문 API 의 경로. axios 가 baseURL(http://localhost:8080) 뒤에 이어 붙인다.
const ORDERS_PATH = "/api/orders";

/* 백엔드 OrderResponse → 화면에서 쓰는 모양
   백엔드: { orderId, status, totalAmount, pickupTime, items: [{ menuItemId, menuName, quantity, orderPrice }] }
   이름이 달라도 화면 코드를 고치지 않도록 여기서 한 번만 바꾼다. */
const toOrder = (response) => ({
    id: response.orderId,
    status: response.status,
    pickupTime: response.pickupTime,
    totalPrice: response.totalAmount,
    storeName: response.storeName ?? null, // 아직 응답에 없음 (요청 중)
    items: response.items.map((item) => ({
        menuItemId: item.menuItemId,
        menuName: item.menuName,
        quantity: item.quantity,
    })),
});

/* GET /api/orders/{orderId} → 주문 1건
   axios 는 서버가 준 본문을 response.data 에 담아 준다. */
export const fetchOrder = async (orderId) => {
    if (USE_MOCK) {
        return fetchMockOrder(orderId);
    }
    const response = await apiClient.get(`${ORDERS_PATH}/${orderId}`);
    return toOrder(response.data);
};

/* ── 가짜 데이터 (USE_MOCK 일 때만) ─────────────────────────
   백엔드 응답과 같은 이름(orderId, totalAmount)으로 만들고 toOrder 를 거친다.
   자동 새로고침이 보이도록 10초마다 상태가 한 단계씩 넘어간다. */
const MOCK_STEPS = ["PENDING", "ACCEPTED", "READY", "COMPLETED"];
const MOCK_STEP_MS = 10000;
let mockStartedAt = null;

const fetchMockOrder = async (orderId) => {
    await new Promise((resolve) => setTimeout(resolve, 300)); // 서버처럼 잠깐 기다림

    if (mockStartedAt === null) {
        mockStartedAt = Date.now();
    }
    const stepIndex = Math.min(
        Math.floor((Date.now() - mockStartedAt) / MOCK_STEP_MS),
        MOCK_STEPS.length - 1
    );

    return toOrder({
        orderId: Number(orderId),
        status: MOCK_STEPS[stepIndex],
        totalAmount: 13000,
        pickupTime: `${todayText()}T15:30:00`,
        storeName: "루키즈 베이커리",
        items: [
            { menuItemId: 101, menuName: "바닐라라떼", quantity: 1, orderPrice: 5500 },
            { menuItemId: 102, menuName: "아메리카노", quantity: 1, orderPrice: 4000 },
            { menuItemId: 103, menuName: "소금빵", quantity: 1, orderPrice: 3500 },
        ],
    });
};

// 오늘 날짜 "YYYY-MM-DD"
const todayText = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${now.getFullYear()}-${month}-${day}`;
};