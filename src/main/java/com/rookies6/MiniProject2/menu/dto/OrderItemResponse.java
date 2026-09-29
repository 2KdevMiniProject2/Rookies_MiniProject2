package com.rookies6.MiniProject2.menu.dto;

import com.rookies6.MiniProject2.menu.entity.OrderItem;
import lombok.Getter;

@Getter
public class OrderItemResponse {

    private final Long menuItemId;
    private final String menuName;
    private final Integer quantity;
    private final Integer orderPrice;

    private OrderItemResponse(OrderItem orderItem) {
        this.menuItemId = orderItem.getMenuItem().getId();
        this.menuName = orderItem.getMenuItem().getName();
        this.quantity = orderItem.getQuantity();
        this.orderPrice = orderItem.getOrderPrice();
    }

    public static OrderItemResponse from(OrderItem orderItem) {
        return new OrderItemResponse(orderItem);
    }
}