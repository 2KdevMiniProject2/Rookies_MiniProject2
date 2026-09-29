package com.rookies6.MiniProject2.menu.entity;

import com.rookies6.MiniProject2.common.entity.BaseEntity;
import com.rookies6.MiniProject2.user.entity.Store;
import com.rookies6.MiniProject2.user.entity.User;
import com.rookies6.MiniProject2.common.exception.BusinessException;
import com.rookies6.MiniProject2.common.exception.ErrorCode;
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
        PENDING,    // 접수대기
        ACCEPTED,   // 수락, 음식 준비 중
        READY,      // 준비 완료, 손님 호출됨
        COMPLETED,  // 픽업 완료
        REJECTED    // 거절
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

    // 수락: PENDING → ACCEPTED
    public void accept() {
        changeStatus(OrderStatus.PENDING, OrderStatus.ACCEPTED);
    }

    // 거절: PENDING → REJECTED
    public void reject() {
        changeStatus(OrderStatus.PENDING, OrderStatus.REJECTED);
    }

    // 호출(준비 완료): ACCEPTED → READY
    public void ready() {
        changeStatus(OrderStatus.ACCEPTED, OrderStatus.READY);
    }

    // 픽업 완료: READY → COMPLETED
    public void complete() {
        changeStatus(OrderStatus.READY, OrderStatus.COMPLETED);
    }

    // 현재 상태가 expected일 때만 next로 변경, 아니면 409 에러
    private void changeStatus(OrderStatus expected, OrderStatus next) {
        if (this.status != expected) {
            throw new BusinessException(ErrorCode.INVALID_ORDER_STATUS,
                    this.status + "에서 " + next + "(으)로 변경할 수 없습니다");
        }
        this.status = next;
    }
}