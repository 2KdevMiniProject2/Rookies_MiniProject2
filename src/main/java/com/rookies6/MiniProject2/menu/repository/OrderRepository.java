package com.rookies6.MiniProject2.menu.repository;

import com.rookies6.MiniProject2.menu.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {
    // 비어있는 repository아닙니다. save(Order) - Order객체 생성 시 발동
}