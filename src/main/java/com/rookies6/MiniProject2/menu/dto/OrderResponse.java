package com.rookies6.MiniProject2.menu.dto;

import com.rookies6.MiniProject2.menu.entity.Order;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class OrderResponse {

    private final Long orderId;
    private final Order.OrderStatus status;
    private final Integer totalAmount;
    private final LocalDateTime pickupTime;

    private OrderResponse(Order order) {
        this.orderId = order.getId();
        this.status = order.getStatus();
        this.totalAmount = order.getTotalAmount();
        this.pickupTime = order.getPickupTime();
    }

    public static OrderResponse from(Order order) {
        return new OrderResponse(order);
    }
}