package com.rookies6.MiniProject2.user.dto;

import com.rookies6.MiniProject2.user.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

public class UserDTO {

    // 회원가입 요청 DTO
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SignupRequest {
        @NotBlank(message = "이메일은 필수 입력 항목입니다.")
        @Email(message = "올바른 이메일 형식이 아닙니다.")
        private String email;

        @NotBlank(message = "비밀번호는 필수 입력 항목입니다.")
        private String password;

        @NotBlank(message = "이름은 필수 입력 항목입니다.")
        private String name;

        private String phone;

        @NotNull(message = "역할(USER 또는 OWNER)을 선택해주세요.")
        private User.Role role;
    }

    // 로그인 요청 DTO
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LoginRequest {
        @NotBlank(message = "이메일을 입력해주세요.")
        @Email(message = "올바른 이메일 형식이 아닙니다.")
        private String email;

        @NotBlank(message = "비밀번호를 입력해주세요.")
        private String password;
    }

    // 로그인 응답 DTO
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LoginResponse {
        private String accessToken;
        private UserResponse user;
    }

    // 회원 정보 응답 DTO
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserResponse {
        private Long id;
        private String email;
        private String name;
        private String phone;
        private User.Role role;

        public static UserResponse from(User user) {
            return UserResponse.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .name(user.getName())
                    .phone(user.getPhone())
                    .role(user.getRole())
                    .build();
        }
    }

    // 회원정보 수정 요청 DTO
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateRequest {
        private String name;
        private String phone;
        private String password; // 비밀번호 변경 시 입력 (선택)
    }
}
