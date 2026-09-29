package com.rookies6.MiniProject2.user.repository;

import com.rookies6.MiniProject2.user.entity.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface StoreRepository extends JpaRepository<Store, Long> {

    // 1. 폐업하지 않은 정상 영업 중인 매장 전체 목록 조회
    @Query("SELECT DISTINCT s FROM Store s " +
            "JOIN FETCH s.storeDetail " +
            "JOIN FETCH s.owner " +
            "WHERE s.deletedAt IS NULL")
    List<Store> findByDeletedAtIsNull();

    // 2. 카테고리별 정상 영업 매장 목록 조회 (메인 홈 필터용)
    @Query("SELECT DISTINCT s FROM Store s " +
            "JOIN FETCH s.storeDetail " +
            "JOIN FETCH s.owner " +
            "WHERE s.category = :category AND s.deletedAt IS NULL")
    List<Store> findByCategoryAndDeletedAtIsNull(String category);

    @Query("SELECT s FROM Store s " +
            "JOIN FETCH s.storeDetail " +
            "JOIN FETCH s.owner " +
            "WHERE s.id = :id AND s.deletedAt IS NULL")
    Optional<Store> findByIdAndDeletedAtIsNull(Long id);

    // 3. 사장님(ownerId)의 매장 조회
    Optional<Store> findByOwnerId(Long ownerId);
}