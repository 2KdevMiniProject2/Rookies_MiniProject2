package com.rookies6.MiniProject2.menu.controller;

import com.rookies6.MiniProject2.menu.dto.OrderCreateRequest;
import com.rookies6.MiniProject2.menu.dto.OrderResponse;
import com.rookies6.MiniProject2.menu.entity.Order;
import com.rookies6.MiniProject2.menu.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/api/orders")
    public ResponseEntity<OrderResponse> createOrder(
            @RequestParam Long customerId,
            @Valid @RequestBody OrderCreateRequest request) {
        OrderResponse response = orderService.createOrder(customerId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/api/orders/{orderId}/accept")
    public ResponseEntity<OrderResponse> acceptOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.acceptOrder(orderId));
    }

    @PatchMapping("/api/orders/{orderId}/reject")
    public ResponseEntity<OrderResponse> rejectOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.rejectOrder(orderId));
    }

    @PatchMapping("/api/orders/{orderId}/ready")
    public ResponseEntity<OrderResponse> readyOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.readyOrder(orderId));
    }

    @PatchMapping("/api/orders/{orderId}/complete")
    public ResponseEntity<OrderResponse> completeOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.completeOrder(orderId));
    }

    @GetMapping("/api/stores/{storeId}/orders")
    public ResponseEntity<List<OrderResponse>> getOrdersByStore(
            @PathVariable Long storeId,
            @RequestParam(required = false) Order.OrderStatus status) {
        return ResponseEntity.ok(orderService.getOrdersByStore(storeId, status));
    }
}