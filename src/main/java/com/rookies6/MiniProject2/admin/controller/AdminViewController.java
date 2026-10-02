package com.rookies6.MiniProject2.admin.controller;

import com.rookies6.MiniProject2.user.dto.StoreDTO;
import com.rookies6.MiniProject2.user.dto.UserDTO;
import com.rookies6.MiniProject2.user.service.StoreService;
import com.rookies6.MiniProject2.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminViewController {

    private final UserService userService;
    private final StoreService storeService;

    @GetMapping("/login")
    public String loginPage() {
        return "admin/login";
    }

    @GetMapping("/users")
    public String users(@PageableDefault(size = 20, sort = "id") Pageable pageable, Model model) {
        Page<UserDTO.UserResponse> page = userService.getAllUsers(pageable);
        model.addAttribute("page", page);
        return "admin/users";
    }

    @GetMapping("/stores")
    public String stores(@PageableDefault(size = 20, sort = "id") Pageable pageable, Model model) {
        Page<StoreDTO.StoreResponse> page = storeService.getAllStores(null, null, pageable);
        model.addAttribute("page", page);
        return "admin/stores";
    }
}