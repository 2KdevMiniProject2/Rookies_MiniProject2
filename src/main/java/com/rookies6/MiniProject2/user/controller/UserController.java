package com.rookies6.MiniProject2.user.controller;

import com.rookies6.MiniProject2.user.dto.UserDTO;
import com.rookies6.MiniProject2.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // 1. 회원가입 API
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

    // 3. 회원 단건 조회 API
    @GetMapping("/api/users/{id}")
    public ResponseEntity<UserDTO.UserResponse> getUser(@PathVariable Long id) {
        UserDTO.UserResponse response = userService.getUserById(id);
        return ResponseEntity.ok(response);
    }
}
