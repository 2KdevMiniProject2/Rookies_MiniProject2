package com.rookies6.MiniProject2.menu.repository;

import com.rookies6.MiniProject2.menu.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByStoreId(Long storeId);

    List<Order> findByStoreIdAndStatus(Long storeId, Order.OrderStatus status);
}