package com.rookies6.MiniProject2.order.dto;

import com.rookies6.MiniProject2.menu.entity.Order;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class OrderStatusRequest {

    // 바꿀 상태 (ACCEPTED, REJECTED, READY, COMPLETED)
    private Order.OrderStatus status;
}