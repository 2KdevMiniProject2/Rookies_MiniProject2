// 파트 C 독립 개발용 목데이터 (OrderResponse 요청안 기준)
// 5001번은 문서(역할 · Entity 설계서)의 DataInitRunner 더미와 동일: 바닐라라떼 2잔, 11,000원, PENDING
// status: PENDING / ACCEPTED / READY / COMPLETED / REJECTED
export const mockOrders = [
  {
    id: 5001,
    storeId: 1, // 목데이터 필터용 (응답 필드 아님)
    status: "PENDING",
    pickupTime: "2026-09-28T15:30:00",
    totalPrice: 11000,
    customerName: "박손님",
    customerPhone: "010-5555-1234",
    items: [{ menuName: "바닐라라떼", quantity: 2 }],
  },
  {
    id: 5000,
    storeId: 1,
    status: "ACCEPTED",
    pickupTime: "2026-09-28T15:10:00",
    totalPrice: 8500,
    customerName: "이손님",
    customerPhone: "010-2222-3333",
    items: [{ menuName: "샌드위치 세트", quantity: 1 }],
  },
  {
    id: 4999,
    storeId: 1,
    status: "READY",
    pickupTime: "2026-09-28T14:50:00",
    totalPrice: 4000,
    customerName: "김손님",
    customerPhone: "010-7777-8888",
    items: [{ menuName: "아메리카노", quantity: 1 }],
  },
];