package com.rookies6.MiniProject2.menu.repository;

import com.rookies6.MiniProject2.menu.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    // ===== 파트 B =====
    Page<Order> findByStoreId(Long storeId, Pageable pageable);

    Page<Order> findByStoreIdAndStatus(Long storeId, Order.OrderStatus status, Pageable pageable);

    // ===== 파트 C =====

    // [사장님 주문 목록] 손님·주문 품목·메뉴까지 한 번에 조회 (N+1 방지), 최신순
    @Query("SELECT DISTINCT o FROM Order o " +
            "JOIN FETCH o.customer " +
            "LEFT JOIN FETCH o.orderItems oi " +
            "LEFT JOIN FETCH oi.menuItem " +
            "WHERE o.store.id = :storeId " +
            "ORDER BY o.createdAt DESC")
    List<Order> findAllWithItemsByStoreId(@Param("storeId") Long storeId);

    Optional<Order> findByIdAndStoreOwnerId(Long orderId, Long ownerId);

    Optional<Order> findByIdAndCustomerId(Long orderId, Long customerId);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0L) FROM Order o " +
            "WHERE o.store.id = :storeId " +
            "AND o.status = :status " +
            "AND o.createdAt >= :start AND o.createdAt < :end")
    Long sumTotalAmountByStoreAndPeriod(@Param("storeId") Long storeId,
                                        @Param("status") Order.OrderStatus status,
                                        @Param("start") LocalDateTime start,
                                        @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(o) FROM Order o " +
            "WHERE o.store.id = :storeId " +
            "AND o.status = :status " +
            "AND o.createdAt >= :start AND o.createdAt < :end")
    Long countByStoreAndPeriod(@Param("storeId") Long storeId,
                               @Param("status") Order.OrderStatus status,
                               @Param("start") LocalDateTime start,
                               @Param("end") LocalDateTime end);
}