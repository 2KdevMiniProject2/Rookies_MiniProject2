package com.rookies6.MiniProject2.menu.entity;

import jakarta.persistence.*;
import lombok.*;

import com.rookies6.MiniProject2.common.entity.BaseEntity;

import java.time.LocalTime;

//StoreDetail 클래스
@Entity
@Table(name = "store_details")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
//Owner(주인) - FK(외래키)를 가진 쪽이 주인임
public class StoreDetail extends BaseEntity {

    @Column(name = "open_time")
    private LocalTime openTime;

    @Column(name = "close_time")
    private LocalTime closeTime;

    //1:1 지연로딩
    //@JoinColumn은 FK(외래키)에 해당하는 어노테이션
    //Fk를 가진 StoreDetail 객체가 주인(Owner)이다.
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", unique = true)
    private Store store;
}
