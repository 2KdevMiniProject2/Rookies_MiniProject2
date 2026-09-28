package com.rookies6.MiniProject2.menu.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class OrderItemRequest {

    @NotNull(message = "메뉴 ID는 필수입니다.")
    private Long menuItemId;

    @NotNull(message = "수량은 필수입니다.")
    @Positive(message = "수량은 1개 이상이어야 합니다.")
    private Integer quantity;
}