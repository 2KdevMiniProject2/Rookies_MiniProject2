import { describe, test, expect, vi, beforeEach } from "vitest";
import apiClient from "./client";
import { getTodaySales } from "./dashboardApi";

// client.js 를 가짜로 바꾼다 → 진짜 서버에 요청하지 않음
vi.mock("./client", () => ({
    default: { get: vi.fn(), patch: vi.fn() },
}));

describe("getTodaySales (오늘 매출)", () => {
    beforeEach(() => {
        vi.clearAllMocks(); // 테스트마다 초기화
    });

    test("가게 번호를 넣은 매출 API 주소로 요청한다", async () => {
        apiClient.get.mockResolvedValue({ data: { totalSales: 0, orderCount: 0 }});
        await getTodaySales(1);
        expect(apiClient.get).toHaveBeenCalledWith("/api/owner/stores/1/sales/today");
    });

    test("서버가 계산한 매출을 그대로 돌려준다", async () => {
        apiClient.get.mockResolvedValue({ data: { totalSales: 84000, orderCount: 7 } });
        const sales = await getTodaySales(1);
        expect(sales).toEqual({ totalSales: 84000, orderCount: 7 });
    });

    test("남의 가게(404)면 에러를 그대로 넘긴다 → 대시보드가 에러 문구 표시", async () => {
        const notFoundError = {
            response: { status: 404, data: { message: "존재하지 않는 매장입니다" } },
        };
        apiClient.get.mockRejectedValue(notFoundError);
        await expect(getTodaySales(999)).rejects.toEqual(notFoundError);
    });
});