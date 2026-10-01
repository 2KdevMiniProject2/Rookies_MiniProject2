package com.rookies6.MiniProject2.user.service;

import com.rookies6.MiniProject2.common.exception.BusinessException;
import com.rookies6.MiniProject2.common.exception.ErrorCode;
import com.rookies6.MiniProject2.user.dto.UserDTO;
import com.rookies6.MiniProject2.user.entity.User;
import com.rookies6.MiniProject2.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.rookies6.MiniProject2.security.jwt.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    // 0. 회원 전체 목록 조회
    public Page<UserDTO.UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(UserDTO.UserResponse::from);
    }

    // 1. 회원가입
    @Transactional
    public UserDTO.UserResponse signup(UserDTO.SignupRequest request) {
        // 이메일 중복 확인
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException(ErrorCode.DUPLICATE_EMAIL, request.getEmail());
        }

        if (request.getRole() == User.Role.ADMIN) {
            throw new BusinessException(ErrorCode.INVALID_SIGNUP_ROLE, request.getRole());
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

    // 2. 사용자 로그인 처리
    public UserDTO.LoginResponse login(UserDTO.LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (org.springframework.security.core.AuthenticationException e) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
        }

        // 인증 통과 후 회원 정보 조회
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_CREDENTIALS));

        // 실제 JWT Access 토큰 발급
        String token = jwtService.generateToken(user.getEmail());

        return UserDTO.LoginResponse.builder()
                .accessToken(token)
                .user(UserDTO.UserResponse.from(user))
                .build();
    }

    // 3. 회원 단건 조회
    public UserDTO.UserResponse getUserById(Long userId, Long callerId) {
        validateSelf(userId, callerId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, userId));
        return UserDTO.UserResponse.from(user);
    }

    // 4. 회원 정보 수정
    @Transactional
    public UserDTO.UserResponse updateUser(Long userId, Long callerId, UserDTO.UpdateRequest request) {
        validateSelf(userId, callerId);
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
    public void deleteUser(Long userId, Long callerId) {
        validateSelf(userId, callerId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, userId));
        userRepository.delete(user);
    }

    private void validateSelf(Long userId, Long callerId) {
        if (!userId.equals(callerId)) {
            throw new BusinessException(ErrorCode.USER_ACCESS_DENIED, userId);
        }
    }
}
