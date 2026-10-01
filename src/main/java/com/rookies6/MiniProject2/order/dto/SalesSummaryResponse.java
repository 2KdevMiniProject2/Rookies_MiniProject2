package com.rookies6.MiniProject2.order.dto;

import lombok.Getter;

@Getter
public class SalesSummaryResponse {

    private final Long totalSales;   // 오늘 매출 합계 (원)
    private final Long orderCount;   // 오늘 완료 주문 건수

    private SalesSummaryResponse(Long totalSales, Long orderCount) {
        this.totalSales = totalSales;
        this.orderCount = orderCount;
    }

    public static SalesSummaryResponse of(Long totalSales, Long orderCount) {
        return new SalesSummaryResponse(totalSales, orderCount);
    }
}