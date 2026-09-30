package com.rookies6.MiniProject2.user.entity;

import jakarta.persistence.*;
import lombok.*;

import com.rookies6.MiniProject2.common.entity.BaseEntity;

import java.time.LocalDateTime;

//Store
@Entity
@Table(name = "stores")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
public class Store extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String category;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    //1:1 지연로딩 - 양방향 Store에서 StoreDetail 참조할 수 있도록 설정
    @OneToOne(fetch = FetchType.LAZY,
            mappedBy = "store",
            cascade = CascadeType.ALL)
    private StoreDetail storeDetail;

    //N:1 Store와 User 관계에서 N쪽에 해당하는 Store가 Owner이다.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    public void softDelete() {
        this.deletedAt = LocalDateTime.now();
    }

    // 매장 기본정보 부분 수정 (null/blank는 무시, 값 있는 필드만 반영)
    public void update(String name, String address, String category, String imageUrl) {
        if (name != null && !name.isBlank()) {
            this.name = name;
        }
        if (address != null && !address.isBlank()) {
            this.address = address;
        }
        if (category != null && !category.isBlank()) {
            this.category = category;
        }
        if (imageUrl != null && !imageUrl.isBlank()) {
            this.imageUrl = imageUrl;
        }
    }

    // StoreDetail(영업시간)을 이 매장에 연결
    public void assignStoreDetail(StoreDetail storeDetail) {
        this.storeDetail = storeDetail;
    }
}