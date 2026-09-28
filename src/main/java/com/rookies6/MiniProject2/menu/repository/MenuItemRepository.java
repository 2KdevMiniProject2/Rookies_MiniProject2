package com.rookies6.MiniProject2.menu.repository;

import com.rookies6.MiniProject2.menu.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByStoreId(Long storeId);
}