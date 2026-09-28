package com.rookies6.MiniProject2.menu.controller;

import com.rookies6.MiniProject2.menu.dto.MenuItemCreateRequest;
import com.rookies6.MiniProject2.menu.dto.MenuItemResponse;
import com.rookies6.MiniProject2.menu.service.MenuService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    @GetMapping("/api/stores/{storeId}/menus")
    public ResponseEntity<List<MenuItemResponse>> getMenus(@PathVariable Long storeId) {
        return ResponseEntity.ok(menuService.getMenus(storeId));
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
}