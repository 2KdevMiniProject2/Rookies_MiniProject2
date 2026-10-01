package com.rookies6.MiniProject2.order.controller;

import com.rookies6.MiniProject2.order.dto.OrderStatusRequest;
import com.rookies6.MiniProject2.order.dto.OwnerOrderResponse;
import com.rookies6.MiniProject2.order.service.OrderStatusService;
import com.rookies6.MiniProject2.security.annotation.CurrentUser;
import com.rookies6.MiniProject2.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/owner")
@PreAuthorize("hasRole('OWNER')")   // 이 컨트롤러의 모든 API는 사장님만 호출 가능
public class OwnerOrderController {

    private final OrderStatusService orderStatusService;

    // [사장님] 가게 주문 목록 조회
    @GetMapping("/stores/{storeId}/orders")
    public ResponseEntity<List<OwnerOrderResponse>> getOrders(@CurrentUser User currentUser,
                                                              @PathVariable Long storeId) {
        return ResponseEntity.ok(orderStatusService.getOwnerOrders(currentUser.getId(), storeId));
    }

    // [사장님] 주문 상태 변경 (수락 / 거절 / 호출 / 픽업 완료)
    @PatchMapping("/orders/{orderId}/status")
    public ResponseEntity<Void> updateStatus(@CurrentUser User currentUser,
                                             @PathVariable Long orderId,
                                             @RequestBody OrderStatusRequest request) {
        orderStatusService.updateStatus(currentUser.getId(), orderId, request.getStatus());
        return ResponseEntity.ok().build();
    }
}