package com.rookies6.MiniProject2.menu.repository;

import com.rookies6.MiniProject2.menu.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    // ===== 파트 B =====
    List<Order> findByStoreId(Long storeId);

    List<Order> findByStoreIdAndStatus(Long storeId, Order.OrderStatus status);

    // ===== 파트 C =====

    // [사장님 주문 목록] 손님·주문 품목·메뉴까지 한 번에 조회 (N+1 방지), 최신순
    @Query("SELECT DISTINCT o FROM Order o " +
           "JOIN FETCH o.customer " +
           "LEFT JOIN FETCH o.orderItems oi " +
           "LEFT JOIN FETCH oi.menuItem " +
           "WHERE o.store.id = :storeId " +
           "ORDER BY o.createdAt DESC")
    List<Order> findAllWithItemsByStoreId(@Param("storeId") Long storeId);

    // [상태 변경 권한 확인] 이 사장님 가게의 주문일 때만 조회됨
    Optional<Order> findByIdAndStoreOwnerId(Long orderId, Long ownerId);

    // [손님 상태 조회 권한 확인] 주문한 손님 본인일 때만 조회됨
    Optional<Order> findByIdAndCustomerId(Long orderId, Long customerId);

    // [오늘 매출] 기간 내 특정 상태 주문의 금액 합계, 주문이 없으면 0
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0L) FROM Order o " +
           "WHERE o.store.id = :storeId " +
           "AND o.status = :status " +
           "AND o.createdAt >= :start AND o.createdAt < :end")
    Long sumTotalAmountByStoreAndPeriod(@Param("storeId") Long storeId,
                                        @Param("status") Order.OrderStatus status,
                                        @Param("start") LocalDateTime start,
                                        @Param("end") LocalDateTime end);

    // [오늘 매출] 기간 내 특정 상태 주문 건수
    @Query("SELECT COUNT(o) FROM Order o " +
           "WHERE o.store.id = :storeId " +
           "AND o.status = :status " +
           "AND o.createdAt >= :start AND o.createdAt < :end")
    Long countByStoreAndPeriod(@Param("storeId") Long storeId,
                               @Param("status") Order.OrderStatus status,
                               @Param("start") LocalDateTime start,
                               @Param("end") LocalDateTime end);
}