package com.rookies6.MiniProject2.menu.service;

import com.rookies6.MiniProject2.common.exception.BusinessException;
import com.rookies6.MiniProject2.common.exception.ErrorCode;
import com.rookies6.MiniProject2.menu.dto.MenuItemCreateRequest;
import com.rookies6.MiniProject2.menu.dto.MenuItemResponse;
import com.rookies6.MiniProject2.menu.dto.MenuItemUpdateRequest;
import com.rookies6.MiniProject2.menu.entity.MenuItem;
import com.rookies6.MiniProject2.menu.repository.MenuItemRepository;
import com.rookies6.MiniProject2.user.entity.Store;
import com.rookies6.MiniProject2.user.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MenuService {

    private final MenuItemRepository menuItemRepository;
    private final StoreRepository storeRepository;

    public Page<MenuItemResponse> getMenus(Long storeId, Pageable pageable) {
        storeRepository.findByIdAndDeletedAtIsNull(storeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STORE_NOT_FOUND, storeId));

        return menuItemRepository.findByStoreIdAndDeletedAtIsNull(storeId, pageable)
                .map(MenuItemResponse::from);
    }

    @Transactional
    public MenuItemResponse createMenu(Long storeId, Long ownerId, MenuItemCreateRequest request) {
        Store store = storeRepository.findByIdAndDeletedAtIsNull(storeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STORE_NOT_FOUND, storeId));

        validateOwner(store, ownerId);

        if (menuItemRepository.existsByStoreIdAndNameAndDeletedAtIsNull(storeId, request.getName())) {
            throw new BusinessException(ErrorCode.DUPLICATE_MENU_NAME, request.getName());
        }

        MenuItem menuItem = MenuItem.builder()
                .store(store)
                .name(request.getName())
                .price(request.getPrice())
                .imageUrl(request.getImageUrl())
                .build();

        return MenuItemResponse.from(menuItemRepository.save(menuItem));
    }

    @Transactional
    public MenuItemResponse toggleSoldOut(Long menuId, Long ownerId) {
        MenuItem menuItem = menuItemRepository.findByIdAndDeletedAtIsNull(menuId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MENU_ITEM_NOT_FOUND, menuId));

        validateOwner(menuItem.getStore(), ownerId);

        menuItem.toggleSoldOut();
        return MenuItemResponse.from(menuItem);
    }

    @Transactional
    public MenuItemResponse updateMenu(Long menuId, Long ownerId, MenuItemUpdateRequest request) {
        MenuItem menuItem = menuItemRepository.findByIdAndDeletedAtIsNull(menuId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MENU_ITEM_NOT_FOUND, menuId));

        validateOwner(menuItem.getStore(), ownerId);

        boolean isRenaming = request.getName() != null
                && !request.getName().isBlank()
                && !request.getName().equals(menuItem.getName());

        if (isRenaming && menuItemRepository.existsByStoreIdAndNameAndDeletedAtIsNull(
                menuItem.getStore().getId(), request.getName())) {
            throw new BusinessException(ErrorCode.DUPLICATE_MENU_NAME, request.getName());
        }

        menuItem.update(request.getName(), request.getPrice(), request.getImageUrl());
        return MenuItemResponse.from(menuItem);
    }

    @Transactional
    public void deleteMenu(Long menuId, Long ownerId) {
        MenuItem menuItem = menuItemRepository.findByIdAndDeletedAtIsNull(menuId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MENU_ITEM_NOT_FOUND, menuId));

        validateOwner(menuItem.getStore(), ownerId);

        menuItem.softDelete();
    }

    private void validateOwner(Store store, Long ownerId) {
        if (!store.getOwner().getId().equals(ownerId)) {
            throw new BusinessException(ErrorCode.STORE_ACCESS_DENIED, store.getId());
        }
    }
}