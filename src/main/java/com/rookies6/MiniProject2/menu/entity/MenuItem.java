package com.rookies6.MiniProject2.menu.entity;

import com.rookies6.MiniProject2.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "menu_items")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class MenuItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Integer price;

    @Column(name = "sold_out", nullable = false)
    private boolean soldOut;

    @Column(name = "image_url")
    private String imageUrl;

    @Builder
    private MenuItem(Store store, String name, Integer price, String imageUrl){
        this.store = store;
        this.name = name;
        this.price = price;
        this.imageUrl = imageUrl;
        this.soldOut = false;
    }

    public void toggleSoldOut() {
        this.soldOut = !this.soldOut;
    }
}
