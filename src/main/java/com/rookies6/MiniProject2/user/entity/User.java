package com.rookies6.MiniProject2.user.entity;

import jakarta.persistence.*;
import lombok.*;

import com.rookies6.MiniProject2.common.entity.BaseEntity;

//User 클래스
@Entity
@Table(name = "users")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class User extends BaseEntity {

    public enum Role {
        USER, OWNER, ADMIN
    }

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String name;

    @Column
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;
}