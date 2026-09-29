package com.rookies6.MiniProject2.user.dto;

import com.rookies6.MiniProject2.user.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
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
        @Size(max = 100, message = "이메일은 100자 이하여야 합니다.")
        private String email;

        @NotBlank(message = "비밀번호는 필수 입력 항목입니다.")
        @Size(min = 4, max = 100, message = "비밀번호는 4자리 이상이어야 합니다.")
        private String password;

        @NotBlank(message = "이름은 필수 입력 항목입니다.")
        @Size(max = 50, message = "이름은 50자 이하여야 합니다.")
        private String name;

        @NotBlank(message = "전화번호는 필수 입력 항목입니다.")
        @Pattern(regexp = "^[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}$", message = "올바른 전화번호 형식(예: 010-1234-5678)이어야 합니다.")
        @Size(max = 20, message = "전화번호는 20자 이하여야 합니다.")
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
        @Size(max = 50, message = "이름은 50자 이하여야 합니다.")
        private String name;

        @Pattern(regexp = "^[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}$", message = "올바른 전화번호 형식(예: 010-1234-5678)이어야 합니다.")
        @Size(max = 20, message = "전화번호는 20자 이하여야 합니다.")
        private String phone;

        @Size(min = 4, max = 100, message = "비밀번호는 4자리 이상이어야 합니다.")
        private String password; // 비밀번호 변경 시 입력 (선택)
    }
}
