package com.rookies6.MiniProject2.menu.dto;

import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class MenuItemUpdateRequest {

    private String name;

    @Positive(message = "가격은 0보다 커야 합니다.")
    private Integer price;

    private String imageUrl;
}