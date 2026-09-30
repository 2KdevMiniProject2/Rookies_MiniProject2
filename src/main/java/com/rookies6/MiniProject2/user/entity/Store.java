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
@Setter
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
}
