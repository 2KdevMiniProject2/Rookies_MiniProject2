package com.rookies6.MiniProject2.menu.service;

import com.rookies6.MiniProject2.common.exception.BusinessException;
import com.rookies6.MiniProject2.common.exception.ErrorCode;
import com.rookies6.MiniProject2.menu.dto.MenuItemCreateRequest;
import com.rookies6.MiniProject2.menu.dto.MenuItemResponse;
import com.rookies6.MiniProject2.menu.entity.MenuItem;
import com.rookies6.MiniProject2.user.entity.Store;
import com.rookies6.MiniProject2.menu.repository.MenuItemRepository;
import com.rookies6.MiniProject2.user.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MenuService {

    private final MenuItemRepository menuItemRepository;
    private final StoreRepository storeRepository;

    public List<MenuItemResponse> getMenus(Long storeId) {
        return menuItemRepository.findByStoreIdAndDeletedAtIsNull(storeId).stream()
                .map(MenuItemResponse::from)
                .toList();
    }

    @Transactional
    public MenuItemResponse createMenu(Long storeId, MenuItemCreateRequest request) {
        Store store = storeRepository.findByIdAndDeletedAtIsNull(storeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STORE_NOT_FOUND, storeId));

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
    public MenuItemResponse toggleSoldOut(Long menuId) {
        MenuItem menuItem = menuItemRepository.findByIdAndDeletedAtIsNull(menuId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MENU_ITEM_NOT_FOUND, menuId));

        menuItem.toggleSoldOut();
        return MenuItemResponse.from(menuItem);
    }

    @Transactional
    public void deleteMenu(Long menuId) {
        MenuItem menuItem = menuItemRepository.findByIdAndDeletedAtIsNull(menuId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MENU_ITEM_NOT_FOUND, menuId));

        menuItem.softDelete();
    }
}