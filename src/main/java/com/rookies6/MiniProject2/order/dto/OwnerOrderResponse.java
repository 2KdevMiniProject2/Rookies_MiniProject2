package com.rookies6.MiniProject2.order.dto;

import com.rookies6.MiniProject2.menu.dto.OrderItemResponse;
import com.rookies6.MiniProject2.menu.entity.Order;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
public class OwnerOrderResponse {

    private final Long orderId;
    private final Order.OrderStatus status;
    private final Integer totalAmount;
    private final LocalDateTime pickupTime;
    private final LocalDateTime createdAt;
    private final String customerName;
    private final String requestNotes;
    private final List<OrderItemResponse> items;

    private OwnerOrderResponse(Order order, List<OrderItemResponse> items) {
        this.orderId = order.getId();
        this.status = order.getStatus();
        this.totalAmount = order.getTotalAmount();
        this.pickupTime = order.getPickupTime();
        this.createdAt = order.getCreatedAt();
        this.customerName = order.getCustomer().getName();
        this.requestNotes = order.getRequestNotes();
        this.items = items;
    }

    public static OwnerOrderResponse from(Order order) {
        return new OwnerOrderResponse(order, order.getOrderItems().stream()
                .map(OrderItemResponse::from)
                .toList());
    }

    public static OwnerOrderResponse from(Order order, List<OrderItemResponse> items) {
        return new OwnerOrderResponse(order, items);
    }
}