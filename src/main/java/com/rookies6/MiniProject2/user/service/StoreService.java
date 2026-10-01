package com.rookies6.MiniProject2.user.service;

import com.rookies6.MiniProject2.common.exception.BusinessException;
import com.rookies6.MiniProject2.common.exception.ErrorCode;
import com.rookies6.MiniProject2.user.dto.StoreDTO;
import com.rookies6.MiniProject2.user.entity.Store;
import com.rookies6.MiniProject2.user.entity.StoreDetail;
import com.rookies6.MiniProject2.user.entity.User;
import com.rookies6.MiniProject2.user.repository.StoreDetailRepository;
import com.rookies6.MiniProject2.user.repository.StoreRepository;
import com.rookies6.MiniProject2.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StoreService {

    private final StoreRepository storeRepository;
    private final StoreDetailRepository storeDetailRepository;
    private final UserRepository userRepository;

    // 1. 매장 전체 목록 조회 (카테고리 필터링 + 검색어 + 페이징 지원)
    public Page<StoreDTO.StoreResponse> getAllStores(String category, String keyword, Pageable pageable) {
        Page<Store> stores;
        boolean hasCategory = category != null && !category.isBlank() && !category.equalsIgnoreCase("전체");
        boolean hasKeyword = keyword != null && !keyword.isBlank();

        if (hasCategory && hasKeyword) {
            stores = storeRepository.findByCategoryAndNameContainingAndDeletedAtIsNull(category.trim(), keyword.trim(), pageable);
        } else if (hasCategory) {
            stores = storeRepository.findByCategoryAndDeletedAtIsNull(category.trim(), pageable);
        } else if (hasKeyword) {
            stores = storeRepository.findByNameContainingAndDeletedAtIsNull(keyword.trim(), pageable);
        } else {
            stores = storeRepository.findByDeletedAtIsNull(pageable);
        }
        return stores.map(StoreDTO.StoreResponse::from);
    }

    public Page<StoreDTO.StoreResponse> getAllStores(String category, Pageable pageable) {
        return getAllStores(category, null, pageable);
    }

    // 2. 매장 단건 상세 조회
    public StoreDTO.StoreResponse getStoreById(Long storeId) {
        Store store = storeRepository.findByIdAndDeletedAtIsNull(storeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STORE_NOT_FOUND, storeId));

        return StoreDTO.StoreResponse.from(store);
    }

    // 3. 신규 매장 등록 (사장님 전용)
    @Transactional
    public StoreDTO.StoreResponse createStore(Long ownerId, StoreDTO.StoreCreateRequest request) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, ownerId));

        Store store = Store.builder()
                .owner(owner)
                .name(request.getName())
                .address(request.getAddress())
                .category(request.getCategory())
                .imageUrl(request.getImageUrl())
                .build();

        Store savedStore = storeRepository.save(store);

        if (request.getOpenTime() != null || request.getCloseTime() != null) {
            StoreDetail storeDetail = StoreDetail.builder()
                    .store(savedStore)
                    .openTime(request.getOpenTime())
                    .closeTime(request.getCloseTime())
                    .build();
            storeDetailRepository.save(storeDetail);
            savedStore.assignStoreDetail(storeDetail);
        }

        return StoreDTO.StoreResponse.from(savedStore);
    }

    // 4. 사장님(ownerId)의 매장 목록 전체 조회 (다중 매장 소유 지원)
    public List<StoreDTO.StoreResponse> getStoresByOwnerId(Long ownerId) {
        List<Store> stores = storeRepository.findByOwnerIdAndDeletedAtIsNull(ownerId);
        return stores.stream()
                .map(StoreDTO.StoreResponse::from)
                .collect(Collectors.toList());
    }

    // 5. 매장 정보 수정 (사장님 본인 소유 매장만 가능)
    @Transactional
    public StoreDTO.StoreResponse updateStore(Long storeId, Long ownerId, StoreDTO.StoreUpdateRequest request) {
        Store store = storeRepository.findByIdAndDeletedAtIsNull(storeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STORE_NOT_FOUND, storeId));

        if (!store.getOwner().getId().equals(ownerId)) {
            throw new BusinessException(ErrorCode.STORE_ACCESS_DENIED, storeId);
        }

        store.update(request.getName(), request.getAddress(), request.getCategory(), request.getImageUrl());

        if (request.getOpenTime() != null || request.getCloseTime() != null) {
            StoreDetail detail = store.getStoreDetail();
            if (detail == null) {
                detail = StoreDetail.builder()
                        .store(store)
                        .openTime(request.getOpenTime())
                        .closeTime(request.getCloseTime())
                        .build();
                storeDetailRepository.save(detail);
                store.assignStoreDetail(detail);
            } else {
                if (request.getOpenTime() != null) {
                    detail.setOpenTime(request.getOpenTime());
                }
                if (request.getCloseTime() != null) {
                    detail.setCloseTime(request.getCloseTime());
                }
            }
        }

        return StoreDTO.StoreResponse.from(store);
    }

    // 소유권자만 가능
    @Transactional
    public void deleteStore(Long storeId, Long ownerId) {
        Store store = storeRepository.findByIdAndDeletedAtIsNull(storeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STORE_NOT_FOUND, storeId));

        if (!store.getOwner().getId().equals(ownerId)) {
            throw new BusinessException(ErrorCode.STORE_ACCESS_DENIED, storeId);
        }

        store.softDelete();
    }
}