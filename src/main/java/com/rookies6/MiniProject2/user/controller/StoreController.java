package com.rookies6.MiniProject2.user.controller;

import com.rookies6.MiniProject2.user.dto.StoreDTO;
import com.rookies6.MiniProject2.user.service.StoreService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stores")
@RequiredArgsConstructor
public class StoreController {

    private final StoreService storeService;

    // 1. 매장 전체 목록 조회 API (카테고리 필터링 지원: ?category=베이커리)
    @GetMapping
    public ResponseEntity<List<StoreDTO.StoreResponse>> getAllStores(
            @RequestParam(required = false) String category) {
        List<StoreDTO.StoreResponse> stores = storeService.getAllStores(category);
        return ResponseEntity.ok(stores);
    }

    // 2. 특정 매장 상세 단건 조회 API (영업시간 포함)
    @GetMapping("/{storeId}")
    public ResponseEntity<StoreDTO.StoreResponse> getStore(@PathVariable Long storeId) {
        StoreDTO.StoreResponse store = storeService.getStoreById(storeId);
        return ResponseEntity.ok(store);
    }

    // 3. 신규 매장 등록 API (사장님 전용)
    // TODO: JWT 인증 적용 후 SecurityContext의 인증된 사장님 ID로 자동 연동
    @PostMapping
    public ResponseEntity<StoreDTO.StoreResponse> createStore(
            @RequestParam(defaultValue = "1") Long ownerId,
            @Valid @RequestBody StoreDTO.StoreCreateRequest request) {
        StoreDTO.StoreResponse response = storeService.createStore(ownerId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}
