package com.rookies6.MiniProject2.menu.entity;

import com.rookies6.MiniProject2.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "menu_items")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter @Builder
public class MenuItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Integer price;

    @Column(name = "is_sold_out", nullable = false)
    private boolean soldOut;

    @Column(name = "image_url")
    private String image_url;

    public void toggleSoldOut() {
        this.soldOut = !this.soldOut;
    }
}
