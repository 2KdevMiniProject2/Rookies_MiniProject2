package com.rookies6.MiniProject2.menu.repository;

import com.rookies6.MiniProject2.menu.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    @Query("SELECT oi FROM OrderItem oi JOIN FETCH oi.menuItem WHERE oi.order.id IN :orderIds")
    List<OrderItem> findAllWithMenuItemByOrderIdIn(@Param("orderIds") List<Long> orderIds);
}