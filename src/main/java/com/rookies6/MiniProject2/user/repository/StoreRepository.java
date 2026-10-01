package com.rookies6.MiniProject2.user.repository;

import com.rookies6.MiniProject2.user.entity.Store;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface StoreRepository extends JpaRepository<Store, Long> {

    // 1. 폐업하지 않은 정상 영업 중인 매장 전체 목록 조회 (페이징)
    @Query(value = "SELECT DISTINCT s FROM Store s " +
            "LEFT JOIN FETCH s.storeDetail " +
            "JOIN FETCH s.owner " +
            "WHERE s.deletedAt IS NULL",
            countQuery = "SELECT COUNT(s) FROM Store s WHERE s.deletedAt IS NULL")
    Page<Store> findByDeletedAtIsNull(Pageable pageable);

    // 2. 카테고리별 정상 영업 매장 목록 조회 (페이징)
    @Query(value = "SELECT DISTINCT s FROM Store s " +
            "LEFT JOIN FETCH s.storeDetail " +
            "JOIN FETCH s.owner " +
            "WHERE s.category = :category AND s.deletedAt IS NULL",
            countQuery = "SELECT COUNT(s) FROM Store s WHERE s.category = :category AND s.deletedAt IS NULL")
    Page<Store> findByCategoryAndDeletedAtIsNull(String category, Pageable pageable);

    // 2-1. 매장명 검색 (페이징)
    @Query(value = "SELECT DISTINCT s FROM Store s " +
            "LEFT JOIN FETCH s.storeDetail " +
            "JOIN FETCH s.owner " +
            "WHERE s.name LIKE %:keyword% AND s.deletedAt IS NULL",
            countQuery = "SELECT COUNT(s) FROM Store s WHERE s.name LIKE %:keyword% AND s.deletedAt IS NULL")
    Page<Store> findByNameContainingAndDeletedAtIsNull(String keyword, Pageable pageable);

    // 2-2. 카테고리 + 매장명 복합 검색 (페이징)
    @Query(value = "SELECT DISTINCT s FROM Store s " +
            "LEFT JOIN FETCH s.storeDetail " +
            "JOIN FETCH s.owner " +
            "WHERE s.category = :category AND s.name LIKE %:keyword% AND s.deletedAt IS NULL",
            countQuery = "SELECT COUNT(s) FROM Store s WHERE s.category = :category AND s.name LIKE %:keyword% AND s.deletedAt IS NULL")
    Page<Store> findByCategoryAndNameContainingAndDeletedAtIsNull(String category, String keyword, Pageable pageable);

    @Query("SELECT s FROM Store s " +
            "LEFT JOIN FETCH s.storeDetail " +
            "JOIN FETCH s.owner " +
            "WHERE s.id = :id AND s.deletedAt IS NULL")
    Optional<Store> findByIdAndDeletedAtIsNull(Long id);


    // 4. 사장님(ownerId)의 정상 영업 중인 매장 목록 조회 (페치 조인 적용)
    @Query("SELECT DISTINCT s FROM Store s " +
            "LEFT JOIN FETCH s.storeDetail " +
            "JOIN FETCH s.owner " +
            "WHERE s.owner.id = :ownerId AND s.deletedAt IS NULL")
    List<Store> findByOwnerIdAndDeletedAtIsNull(Long ownerId);

    // ===== 파트 C =====
    boolean existsByIdAndOwnerIdAndDeletedAtIsNull(Long storeId, Long ownerId);
}