package com.rookies6.MiniProject2.user.controller;

import com.rookies6.MiniProject2.user.dto.UserDTO;
import com.rookies6.MiniProject2.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // 0. 회원 전체 목록 조회 API
    @GetMapping("/api/users")
    public ResponseEntity<List<UserDTO.UserResponse>> getAllUsers() {
        List<UserDTO.UserResponse> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    // 1. 회원가입 / 회원 추가 API (/api/auth/signup 및 /api/users 둘 다 지원)
    @PostMapping({"/api/auth/signup", "/api/users"})
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

    // 3. 회원 단건 조회 API
    @GetMapping("/api/users/{id}")
    public ResponseEntity<UserDTO.UserResponse> getUser(@PathVariable Long id) {
        UserDTO.UserResponse response = userService.getUserById(id);
        return ResponseEntity.ok(response);
    }

    // 4. 회원 정보 수정 API (PUT, PATCH 모두 지원)
    @RequestMapping(value = "/api/users/{id}", method = {RequestMethod.PATCH, RequestMethod.PUT})
    public ResponseEntity<UserDTO.UserResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserDTO.UpdateRequest request) {
        UserDTO.UserResponse response = userService.updateUser(id, request);
        return ResponseEntity.ok(response);
    }

    // 5. 회원 탈퇴 API
    @DeleteMapping("/api/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
