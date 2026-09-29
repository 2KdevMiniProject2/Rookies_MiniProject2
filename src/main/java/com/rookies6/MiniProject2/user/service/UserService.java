package com.rookies6.MiniProject2.user.service;

import com.rookies6.MiniProject2.common.exception.BusinessException;
import com.rookies6.MiniProject2.common.exception.ErrorCode;
import com.rookies6.MiniProject2.user.repository.UserRepository;
import com.rookies6.MiniProject2.user.dto.UserDTO;
import com.rookies6.MiniProject2.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // 0. 회원 전체 목록 조회
    public List<UserDTO.UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserDTO.UserResponse::from)
                .collect(Collectors.toList());
    }

    // 1. 회원가입
    @Transactional
    public UserDTO.UserResponse signup(UserDTO.SignupRequest request) {
        // 이메일 중복 확인
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException(ErrorCode.DUPLICATE_EMAIL, request.getEmail());
        }

        // 비밀번호 암호화 및 유저 생성
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .phone(request.getPhone())
                .role(request.getRole())
                .build();

        User savedUser = userRepository.save(user);
        return UserDTO.UserResponse.from(savedUser);
    }

    // 2. 로그인
    public UserDTO.LoginResponse login(UserDTO.LoginRequest request) {
        // 이메일로 회원 조회
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_CREDENTIALS));

        // 비밀번호 일치 여부 확인
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
        }

        // JWT 토큰 연동 전 임시 토큰 발급 (추후 JwtTokenProvider 연결)
        String mockToken = "mock-jwt-token-for-" + user.getEmail();

        return UserDTO.LoginResponse.builder()
                .accessToken(mockToken)
                .user(UserDTO.UserResponse.from(user))
                .build();
    }

    // 3. 회원 단건 조회
    public UserDTO.UserResponse getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, userId));
        return UserDTO.UserResponse.from(user);
    }

    // 4. 회원 정보 수정
    @Transactional
    public UserDTO.UserResponse updateUser(Long userId, UserDTO.UpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, userId));

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }
        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            user.setPhone(request.getPhone());
        }
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        return UserDTO.UserResponse.from(user);
    }

    // 5. 회원 탈퇴
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, userId));
        userRepository.delete(user);
    }
}
