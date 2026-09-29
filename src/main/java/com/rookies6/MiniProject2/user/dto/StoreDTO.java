package com.rookies6.MiniProject2.user.dto;

import com.rookies6.MiniProject2.user.entity.Store;
import com.rookies6.MiniProject2.user.entity.StoreDetail;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalTime;

public class StoreDTO {

    // 1. 매장 등록 요청 DTO
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StoreCreateRequest {
        @NotBlank(message = "가게 이름은 필수 입력 항목입니다.")
        @Size(max = 100, message = "가게 이름은 100자 이하여야 합니다.")
        private String name;

        @NotBlank(message = "가게 주소는 필수 입력 항목입니다.")
        @Size(max = 200, message = "가게 주소는 200자 이하여야 합니다.")
        private String address;

        @NotBlank(message = "카테고리는 필수 입력 항목입니다.")
        @Size(max = 50, message = "카테고리는 50자 이하여야 합니다.")
        private String category;

        private LocalTime openTime;
        private LocalTime closeTime;
    }

    // 2. 매장 정보 응답 DTO (목록 조회 및 단건 조회 공통)
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StoreResponse {
        private Long id;
        private String name;
        private String address;
        private String category;
        private LocalTime openTime;
        private LocalTime closeTime;
        private Long ownerId;
        private String ownerName;

        public static StoreResponse from(Store store) {
            StoreDetail detail = store.getStoreDetail();
            return StoreResponse.builder()
                    .id(store.getId())
                    .name(store.getName())
                    .address(store.getAddress())
                    .category(store.getCategory())
                    .openTime(detail != null ? detail.getOpenTime() : null)
                    .closeTime(detail != null ? detail.getCloseTime() : null)
                    .ownerId(store.getOwner() != null ? store.getOwner().getId() : null)
                    .ownerName(store.getOwner() != null ? store.getOwner().getName() : null)
                    .build();
        }
    }
}
