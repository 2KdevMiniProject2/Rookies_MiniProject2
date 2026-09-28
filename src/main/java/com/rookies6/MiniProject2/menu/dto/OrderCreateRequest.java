package com.rookies6.MiniProject2.menu.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@NoArgsConstructor
public class OrderCreateRequest {

    @NotNull(message = "가게 ID는 필수입니다.")
    private Long storeId;

    @NotEmpty(message = "주문 항목은 1개 이상이어야 합니다.")
    @Valid
    private List<OrderItemRequest> items;

    @NotNull(message = "픽업 시간은 필수입니다.")
    @Future(message = "픽업 시간은 현재 시간 이후여야 합니다.")
    private LocalDateTime pickupTime;

    private String requestNotes;
}