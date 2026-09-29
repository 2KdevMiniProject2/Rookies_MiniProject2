package com.rookies6.MiniProject2.menu.repository;

import com.rookies6.MiniProject2.menu.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    boolean existsByStoreIdAndNameAndDeletedAtIsNull(Long storeId, String name);

    List<MenuItem> findByStoreIdAndDeletedAtIsNull(Long storeId);

    Optional<MenuItem> findByIdAndDeletedAtIsNull(Long menuId);

    @Query("SELECT m FROM MenuItem m WHERE m.id IN :ids AND m.store.id = :storeId AND m.deletedAt IS NULL")
    List<MenuItem> findAllByIdAndStoreId(@Param("ids") Set<Long> ids, @Param("storeId") Long storeId);
}