package com.rookies6.MiniProject2.menu.dto;

import com.rookies6.MiniProject2.menu.entity.MenuItem;
import lombok.Getter;

@Getter
public class MenuItemResponse {
    private final Long id;
    private final String name;
    private final Integer price;
    private final boolean soldOut;
    private final String imageUrl;

    public static MenuItemResponse from(MenuItem menuItem) {
        return new MenuItemResponse(menuItem);
    }

    private MenuItemResponse (MenuItem menuItem) {
        this.id = menuItem.getId();
        this.name = menuItem.getName();
        this.price = menuItem.getPrice();
        this.soldOut = menuItem.isSoldOut();
        this.imageUrl = menuItem.getImageUrl();
    }

}
