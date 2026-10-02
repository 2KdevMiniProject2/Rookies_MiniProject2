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

    Page<Order> findByCustomerId(Long customerId, Pageable pageable);

    @Query(value = "SELECT o FROM Order o JOIN FETCH o.customer WHERE o.store.id = :storeId",
            countQuery = "SELECT COUNT(o) FROM Order o WHERE o.store.id = :storeId")
    Page<Order> findByStoreId(@Param("storeId") Long storeId, Pageable pageable);

    @Query(value = "SELECT o FROM Order o JOIN FETCH o.customer WHERE o.store.id = :storeId AND o.status = :status",
            countQuery = "SELECT COUNT(o) FROM Order o WHERE o.store.id = :storeId AND o.status = :status")
    Page<Order> findByStoreIdAndStatus(@Param("storeId") Long storeId,
                                       @Param("status") Order.OrderStatus status,
                                       Pageable pageable);

    // ===== 파트 C =====

    // [사장님 대시보드] 진행 중 주문은 날짜 상관없이 전부, 끝난 주문은 오늘 들어온 것만
    @Query(value = "SELECT o FROM Order o JOIN FETCH o.customer " +
                   "WHERE o.store.id = :storeId " +
                   "AND (o.status IN :activeStatuses OR (o.createdAt >= :start AND o.createdAt < :end))",
           countQuery = "SELECT COUNT(o) FROM Order o " +
                        "WHERE o.store.id = :storeId " +
                        "AND (o.status IN :activeStatuses OR (o.createdAt >= :start AND o.createdAt < :end))")
    Page<Order> findDashboardOrders(@Param("storeId") Long storeId,
                                    @Param("activeStatuses") List<Order.OrderStatus> activeStatuses,
                                    @Param("start") LocalDateTime start,
                                    @Param("end") LocalDateTime end,
                                    Pageable pageable);

    // [사장님 대시보드 + 상태 필터] 위 조건에 특정 상태만 추가로 걸러냄
    @Query(value = "SELECT o FROM Order o JOIN FETCH o.customer " +
                   "WHERE o.store.id = :storeId AND o.status = :status " +
                   "AND (o.status IN :activeStatuses OR (o.createdAt >= :start AND o.createdAt < :end))",
           countQuery = "SELECT COUNT(o) FROM Order o " +
                        "WHERE o.store.id = :storeId AND o.status = :status " +
                        "AND (o.status IN :activeStatuses OR (o.createdAt >= :start AND o.createdAt < :end))")
    Page<Order> findDashboardOrdersByStatus(@Param("storeId") Long storeId,
                                            @Param("status") Order.OrderStatus status,
                                            @Param("activeStatuses") List<Order.OrderStatus> activeStatuses,
                                            @Param("start") LocalDateTime start,
                                            @Param("end") LocalDateTime end,
                                            Pageable pageable);

    // [상태 변경 권한 확인] 이 사장님 가게의 주문일 때만 조회됨
    Optional<Order> findByIdAndStoreOwnerId(Long orderId, Long ownerId);

    // [손님 본인 주문 확인] 주문한 손님 본인일 때만 조회됨
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