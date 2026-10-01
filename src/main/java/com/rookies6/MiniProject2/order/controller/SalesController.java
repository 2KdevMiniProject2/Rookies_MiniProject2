package com.rookies6.MiniProject2.order.controller;

import com.rookies6.MiniProject2.order.dto.SalesSummaryResponse;
import com.rookies6.MiniProject2.order.service.SalesService;
import com.rookies6.MiniProject2.security.annotation.CurrentUser;
import com.rookies6.MiniProject2.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/owner")
@PreAuthorize("hasRole('OWNER')")   // 사장님만 호출 가능
public class SalesController {

    private final SalesService salesService;

    // [사장님] 오늘 매출 조회
    @GetMapping("/stores/{storeId}/sales/today")
    public ResponseEntity<SalesSummaryResponse> getTodaySales(@CurrentUser User currentUser,
                                                              @PathVariable Long storeId) {
        return ResponseEntity.ok(salesService.getTodaySales(currentUser.getId(), storeId));
    }
}