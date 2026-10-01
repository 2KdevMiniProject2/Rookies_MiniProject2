package com.rookies6.MiniProject2.order.controller;

import com.rookies6.MiniProject2.menu.dto.OrderResponse;
import com.rookies6.MiniProject2.order.service.CustomerOrderService;
import com.rookies6.MiniProject2.security.annotation.CurrentUser;
import com.rookies6.MiniProject2.user.entity.User;
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

    @GetMapping
    public ResponseEntity<Page<OrderResponse>> getMyOrders(
            @PathVariable Long customerId,
            @CurrentUser User currentUser,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
        return ResponseEntity.ok(customerOrderService.getMyOrders(customerId, currentUser.getId(), pageable));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getMyOrder(
            @PathVariable Long customerId,
            @CurrentUser User currentUser,
            @PathVariable Long orderId) {
        return ResponseEntity.ok(customerOrderService.getMyOrder(customerId, currentUser.getId(), orderId));
    }

    @PatchMapping("/{orderId}/cancel")
    public ResponseEntity<Void> cancelMyOrder(
            @PathVariable Long customerId,
            @CurrentUser User currentUser,
            @PathVariable Long orderId) {
        customerOrderService.cancelMyOrder(customerId, currentUser.getId(), orderId);
        return ResponseEntity.noContent().build();
    }
}