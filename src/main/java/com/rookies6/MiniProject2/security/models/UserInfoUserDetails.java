package com.rookies6.MiniProject2.security.models;

import com.rookies6.MiniProject2.user.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class UserInfoUserDetails implements UserDetails {

    private String email;
    private String password;
    private List<GrantedAuthority> authorities;
    private User userInfo;

    public UserInfoUserDetails(User userInfo) {
        this.userInfo = userInfo;
        this.email = userInfo.getEmail();
        this.password = userInfo.getPassword();
        // roles 가 비어 있어도 로그인 과정에서 오류가 나지 않도록 방어한다
        // 우리 User 엔티티의 Role enum (USER, OWNER, ADMIN) -> "ROLE_USER", "ROLE_OWNER"
        String roleName = userInfo.getRole() != null ? "ROLE_" + userInfo.getRole().name() : "ROLE_USER";
        this.authorities = List.of(new SimpleGrantedAuthority(roleName));
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email; // 로그인 아이디 = 이메일
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    // 컨트롤러나 서비스에서 현재 로그인한 유저 엔티티를 바로 꺼내 쓰기 위해 제공
    public User getUser() {
        return userInfo;
    }

    // 수업 자료 호환용 메서드
    public User getUserInfo() {
        return userInfo;
    }
}
