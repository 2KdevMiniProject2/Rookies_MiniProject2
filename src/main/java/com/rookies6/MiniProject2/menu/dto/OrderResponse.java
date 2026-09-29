package com.rookies6.MiniProject2.menu.dto;

import com.rookies6.MiniProject2.menu.entity.Order;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
public class OrderResponse {

    private final Long orderId;
    private final Order.OrderStatus status;
    private final Integer totalAmount;
    private final LocalDateTime pickupTime;
    private final List<OrderItemResponse> items;

    private OrderResponse(Order order) {
        this.orderId = order.getId();
        this.status = order.getStatus();
        this.totalAmount = order.getTotalAmount();
        this.pickupTime = order.getPickupTime();
        this.items = order.getOrderItems().stream()
                .map(OrderItemResponse::from)
                .toList();
    }

    public static OrderResponse from(Order order) {
        return new OrderResponse(order);
    }
}