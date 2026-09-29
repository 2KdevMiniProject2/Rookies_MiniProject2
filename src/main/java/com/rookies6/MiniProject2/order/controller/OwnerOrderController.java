package com.rookies6.MiniProject2.order.controller;

import com.rookies6.MiniProject2.order.dto.OrderStatusRequest;
import com.rookies6.MiniProject2.order.service.OrderStatusService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/owner")
public class OwnerOrderController {

    private final OrderStatusService orderStatusService;

    // [사장님] 주문 상태 변경 (수락 / 거절 / 호출 / 픽업 완료)
    // TODO: 로그인(JWT) 완성 후 ownerId는 요청 파라미터가 아니라 토큰에서 꺼내도록 변경
    @PatchMapping("/orders/{orderId}/status")
    public ResponseEntity<Void> updateStatus(@RequestParam Long ownerId,
                                             @PathVariable Long orderId,
                                             @RequestBody OrderStatusRequest request) {
        orderStatusService.updateStatus(ownerId, orderId, request.getStatus());
        return ResponseEntity.ok().build();
    }
}