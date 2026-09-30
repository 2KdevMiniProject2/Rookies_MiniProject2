package com.rookies6.MiniProject2.order.controller;

import com.rookies6.MiniProject2.menu.dto.OrderResponse;
import com.rookies6.MiniProject2.order.service.CustomerOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/customers/{customerId}/orders")
public class CustomerOrderController {

    private final CustomerOrderService customerOrderService;

    // [손님] 내 주문 현황 목록 조회
    @GetMapping
    public ResponseEntity<Page<OrderResponse>> getMyOrders(
            @PathVariable Long customerId,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
        return ResponseEntity.ok(customerOrderService.getMyOrders(customerId, pageable));
    }

    // [손님] 주문 하나 현재 상태 확인
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getMyOrder(
            @PathVariable Long customerId,
            @PathVariable Long orderId) {
        return ResponseEntity.ok(customerOrderService.getMyOrder(customerId, orderId));
    }

    // [손님] 주문 취소
    @PatchMapping("/{orderId}/cancel")
    public ResponseEntity<Void> cancelMyOrder(
            @PathVariable Long customerId,
            @PathVariable Long orderId) {
        customerOrderService.cancelMyOrder(customerId, orderId);
        return ResponseEntity.noContent().build();
    }
}