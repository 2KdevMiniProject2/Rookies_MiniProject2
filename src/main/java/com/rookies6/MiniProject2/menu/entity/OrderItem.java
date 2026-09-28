package com.rookies6.MiniProject2.menu.entity;

import com.rookies6.MiniProject2.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "order_items")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class OrderItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_item_id", nullable = false)
    private MenuItem menuItem;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "price", nullable = false)
    private Integer orderPrice;

    @Builder
    private OrderItem(MenuItem menuItem, Integer quantity, Integer orderPrice) {
        this.menuItem = menuItem;
        this.quantity = quantity;
        this.orderPrice = orderPrice;
    }

    void assignOrder(Order order) {
        this.order = order;
    }
}