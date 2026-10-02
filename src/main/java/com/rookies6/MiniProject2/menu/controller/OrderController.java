package com.rookies6.MiniProject2.menu.controller;

import com.rookies6.MiniProject2.menu.dto.OrderCreateRequest;
import com.rookies6.MiniProject2.menu.dto.OrderResponse;
import com.rookies6.MiniProject2.menu.entity.Order;
import com.rookies6.MiniProject2.menu.service.OrderService;
import com.rookies6.MiniProject2.order.dto.OwnerOrderResponse;
import com.rookies6.MiniProject2.security.annotation.CurrentUser;
import com.rookies6.MiniProject2.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/api/orders")
    public ResponseEntity<OrderResponse> createOrder(
            @CurrentUser User currentUser,
            @Valid @RequestBody OrderCreateRequest request) {
        OrderResponse response = orderService.createOrder(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}