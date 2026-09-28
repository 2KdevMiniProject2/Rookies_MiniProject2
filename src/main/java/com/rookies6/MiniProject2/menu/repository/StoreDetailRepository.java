package com.rookies6.MiniProject2.menu.repository;

import com.rookies6.MiniProject2.user.entity.StoreDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StoreDetailRepository extends JpaRepository<StoreDetail, Long> {

    // 특정 가게의 영업시간(상세 정보) 조회
    Optional<StoreDetail> findByStoreId(Long storeId);
}
