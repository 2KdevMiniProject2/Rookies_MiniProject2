package com.rookies6.MiniProject2.menu.repository;

import com.rookies6.MiniProject2.menu.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}