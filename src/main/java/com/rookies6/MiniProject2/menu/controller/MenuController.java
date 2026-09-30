package com.rookies6.MiniProject2.menu.controller;

import com.rookies6.MiniProject2.menu.dto.MenuItemCreateRequest;
import com.rookies6.MiniProject2.menu.dto.MenuItemResponse;
import com.rookies6.MiniProject2.menu.dto.MenuItemUpdateRequest;
import com.rookies6.MiniProject2.menu.service.ImageUploadService;
import com.rookies6.MiniProject2.menu.service.MenuService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;
    private final ImageUploadService imageUploadService;

    @PostMapping("/api/menus/images")
    public ResponseEntity<String> uploadMenuImage(@RequestParam("image") MultipartFile image) {
        String imageUrl = imageUploadService.uploadMenuImage(image);
        return ResponseEntity.ok(imageUrl);
    }

    @GetMapping("/api/stores/{storeId}/menus")
    public ResponseEntity<Page<MenuItemResponse>> getMenus(
            @PathVariable Long storeId,
            @PageableDefault(size = 10, sort = "id") Pageable pageable) {
        return ResponseEntity.ok(menuService.getMenus(storeId, pageable));
    }

    @PostMapping("/api/stores/{storeId}/menus")
    public ResponseEntity<MenuItemResponse> createMenu(
            @PathVariable Long storeId,
            @Valid @RequestBody MenuItemCreateRequest request) {
        MenuItemResponse response = menuService.createMenu(storeId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/api/menus/{menuId}/sold-out")
    public ResponseEntity<MenuItemResponse> toggleSoldOut(@PathVariable Long menuId) {
        return ResponseEntity.ok(menuService.toggleSoldOut(menuId));
    }

    @PatchMapping("/api/menus/{menuId}")
    public ResponseEntity<MenuItemResponse> updateMenu(
            @PathVariable Long menuId,
            @Valid @RequestBody MenuItemUpdateRequest request) {
        MenuItemResponse response = menuService.updateMenu(menuId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/api/menus/{menuId}")
    public ResponseEntity<Void> deleteMenu(@PathVariable Long menuId) {
        menuService.deleteMenu(menuId);
        return ResponseEntity.noContent().build();
    }
}