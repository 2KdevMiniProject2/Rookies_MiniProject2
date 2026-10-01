package com.rookies6.MiniProject2.order.controller;

import com.rookies6.MiniProject2.order.dto.OrderStatusRequest;
import com.rookies6.MiniProject2.order.service.OrderStatusService;
import com.rookies6.MiniProject2.security.annotation.CurrentUser;
import com.rookies6.MiniProject2.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/owner")
public class OwnerOrderController {

    private final OrderStatusService orderStatusService;

    // [사장님] 주문 상태 변경 (수락 / 거절 / 호출 / 픽업 완료)
    @PreAuthorize("hasRole('OWNER')")
    @PatchMapping("/orders/{orderId}/status")
    public ResponseEntity<Void> updateStatus(@CurrentUser User currentUser,
                                             @PathVariable Long orderId,
                                             @RequestBody OrderStatusRequest request) {
        orderStatusService.updateStatus(currentUser.getId(), orderId, request.getStatus());
        return ResponseEntity.ok().build();
    }
}