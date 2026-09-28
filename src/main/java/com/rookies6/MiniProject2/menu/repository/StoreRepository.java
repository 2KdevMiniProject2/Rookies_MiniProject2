package com.rookies6.MiniProject2.menu.repository;

import com.rookies6.MiniProject2.user.entity.Store;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StoreRepository extends JpaRepository<Store, Long> {
}