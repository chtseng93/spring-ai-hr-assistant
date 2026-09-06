package com.example.demo.controller;
import java.util.Map;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @GetMapping("/me")
    public Map<String, String> me(Authentication authentication) {
        // 每個帳號只有一個角色，取第一個權限、去掉 ROLE_ 前綴
        String role = authentication.getAuthorities().iterator().next()
                .getAuthority().replace("ROLE_", "");
        return Map.of("username", authentication.getName(), "role", role);
    }
}
