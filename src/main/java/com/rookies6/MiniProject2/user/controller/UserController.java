package com.rookies6.MiniProject2.user.controller;

import com.rookies6.MiniProject2.security.annotation.CurrentUser;
import com.rookies6.MiniProject2.user.dto.UserDTO;
import com.rookies6.MiniProject2.user.entity.User;
import com.rookies6.MiniProject2.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // 0. 회원 전체 목록 조회 API (관리자 전용)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/api/users")
    public ResponseEntity<Page<UserDTO.UserResponse>> getAllUsers(
            @PageableDefault(size = 10, sort = "id") Pageable pageable) {
        Page<UserDTO.UserResponse> users = userService.getAllUsers(pageable);
        return ResponseEntity.ok(users);
    }

    // 1. 회원가입 API (비로그인 호출 가능 — /api/auth/signup 하나로만 노출)
    @PostMapping("/api/auth/signup")
    public ResponseEntity<UserDTO.UserResponse> signup(@Valid @RequestBody UserDTO.SignupRequest request) {
        UserDTO.UserResponse response = userService.signup(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // 2. 로그인 API
    @PostMapping("/api/auth/login")
    public ResponseEntity<UserDTO.LoginResponse> login(@Valid @RequestBody UserDTO.LoginRequest request) {
        UserDTO.LoginResponse response = userService.login(request);
        return ResponseEntity.ok(response);
    }

    // 3. 회원 단건 조회 API (본인만)
    @GetMapping("/api/users/{id}")
    public ResponseEntity<UserDTO.UserResponse> getUser(
            @PathVariable Long id,
            @CurrentUser User currentUser) {
        UserDTO.UserResponse response = userService.getUserById(id, currentUser.getId());
        return ResponseEntity.ok(response);
    }

    // 4. 회원 정보 수정 API (PUT, PATCH 모두 지원, 본인만)
    @RequestMapping(value = "/api/users/{id}", method = {RequestMethod.PATCH, RequestMethod.PUT})
    public ResponseEntity<UserDTO.UserResponse> updateUser(
            @PathVariable Long id,
            @CurrentUser User currentUser,
            @Valid @RequestBody UserDTO.UpdateRequest request) {
        UserDTO.UserResponse response = userService.updateUser(id, currentUser.getId(), request);
        return ResponseEntity.ok(response);
    }

    // 5. 회원 탈퇴 API (본인만)
    @DeleteMapping("/api/users/{id}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long id,
            @CurrentUser User currentUser) {
        userService.deleteUser(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }

    // 6. 내 정보 조회 API (교재 Step 14: 새로고침 시 토큰 기반 복원)
    @GetMapping("/api/users/me")
    public ResponseEntity<UserDTO.UserResponse> getMyInfo(@CurrentUser User currentUser) {
        return ResponseEntity.ok(UserDTO.UserResponse.from(currentUser));
    }
}