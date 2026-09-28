package com.rookies6.MiniProject2.menu.entity;

import com.rookies6.MiniProject2.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Order extends BaseEntity {

    public enum OrderStatus {
        PENDING, ACCEPTED, COMPLETED
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderStatus status;

    @Column(name = "total_price", nullable = false)
    private Integer totalAmount;

    @Column(name = "pickup_time", nullable = false)
    private LocalDateTime pickupTime;

    @Column(name = "request_notes")
    private String requestNotes;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> orderItems = new ArrayList<>();

    @Builder
    private Order(User customer, Store store, LocalDateTime pickupTime, String requestNotes) {
        this.customer = customer;
        this.store = store;
        this.pickupTime = pickupTime;
        this.requestNotes = requestNotes;
        this.status = OrderStatus.PENDING;
        this.totalAmount = 0;
    }

    public void addOrderItem(OrderItem orderItem) {
        this.orderItems.add(orderItem);
        orderItem.assignOrder(this);
        this.totalAmount += orderItem.getOrderPrice() * orderItem.getQuantity();
    }

    public void accept() {
        this.status = OrderStatus.ACCEPTED;
    }

    public void complete() {
        this.status = OrderStatus.COMPLETED;
    }
}