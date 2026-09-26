package com.rookies6.MiniProject2.menu.repository;

import com.rookies6.MiniProject2.menu.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    // Order 저장 시 자동으로 같이 save(OrderItem)발동
}