package com.rookies6.MiniProject2.user.controller;

import com.rookies6.MiniProject2.security.annotation.CurrentUser;
import com.rookies6.MiniProject2.user.dto.StoreDTO;
import com.rookies6.MiniProject2.user.entity.User;
import com.rookies6.MiniProject2.user.service.StoreService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stores")
@RequiredArgsConstructor
public class StoreController {

    private final StoreService storeService;

    // 1. 매장 전체 목록 조회 API (카테고리 필터링 및 매장명 검색 지원: ?category=베이커리&keyword=루키)
    @GetMapping
    public ResponseEntity<Page<StoreDTO.StoreResponse>> getAllStores(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 10, sort = "id") Pageable pageable) {
        String searchKeyword = (keyword != null && !keyword.isBlank()) ? keyword : search;
        Page<StoreDTO.StoreResponse> stores = storeService.getAllStores(category, searchKeyword, pageable);
        return ResponseEntity.ok(stores);
    }

    // 2. 특정 매장 상세 단건 조회 API (영업시간 포함)
    @GetMapping("/{storeId}")
    public ResponseEntity<StoreDTO.StoreResponse> getStore(@PathVariable Long storeId) {
        StoreDTO.StoreResponse store = storeService.getStoreById(storeId);
        return ResponseEntity.ok(store);
    }

    // 3. 신규 매장 등록 API (사장님 전용 - 교재 Step 9, Step 12, Step 13)
    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<StoreDTO.StoreResponse> createStore(
            @CurrentUser User currentUser,
            @Valid @RequestBody StoreDTO.StoreCreateRequest request) {
        StoreDTO.StoreResponse response = storeService.createStore(currentUser.getId(), request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // 4. 사장님 소유 매장 목록 조회 API (1:N 다중 매장 지원, 본인 소유만 조회 가능, 페이징)
    @GetMapping("/owner/{ownerId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Page<StoreDTO.StoreResponse>> getStoresByOwner(
            @PathVariable Long ownerId,
            @CurrentUser User currentUser,
            @PageableDefault(size = 10, sort = "id") Pageable pageable) {
        Page<StoreDTO.StoreResponse> stores = storeService.getStoresByOwnerId(ownerId, currentUser.getId(), pageable);
        return ResponseEntity.ok(stores);
    }

    // 5. 매장 정보 수정 API (사장님 전용)
    @PutMapping("/{storeId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<StoreDTO.StoreResponse> updateStore(
            @PathVariable Long storeId,
            @CurrentUser User currentUser,
            @Valid @RequestBody StoreDTO.StoreUpdateRequest request) {
        StoreDTO.StoreResponse response = storeService.updateStore(storeId, currentUser.getId(), request);
        return ResponseEntity.ok(response);
    }

    // 6. 매장 삭제 API (사장님 전용)
    @DeleteMapping("/{storeId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Void> deleteStore(
            @PathVariable Long storeId,
            @CurrentUser User currentUser) {
        storeService.deleteStore(storeId, currentUser.getId());
        return ResponseEntity.noContent().build();
    }
}
