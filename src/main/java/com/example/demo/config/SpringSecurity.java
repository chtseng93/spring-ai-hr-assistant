package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.User;
@EnableWebSecurity
@Configuration
public class SpringSecurity {

     @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // ponytail: 練習專案、SPA 走同源 proxy，先關 CSRF；要上線改 CookieCsrfTokenRepository
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/health", "/login", "/logout").permitAll()
                .requestMatchers("/api/jobs/**", "/api/resumes/**", "/api/ai/**").hasRole("HR")
                .anyRequest().authenticated())
            // 成功/失敗改回純狀態碼，不做 302 導頁（配合 SPA fetch）
            .formLogin(form -> form
                .successHandler((req, res, a) -> res.setStatus(200))
                .failureHandler((req, res, e) -> res.setStatus(401)))
            .logout(out -> out
                .logoutSuccessHandler((req, res, a) -> res.setStatus(200)))
            // 未登入存取受保護資源回 401，不導向登入頁
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((req, res, e) -> res.setStatus(401)));
        return http.build();
    }

    /** 密碼雜湊：bcrypt。 */
    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /** 兩個固定帳號；密碼取自設定（.env），啟動時即時編碼。 */
    @Bean
    UserDetailsService userDetailsService(
            PasswordEncoder encoder,
            @Value("${app.auth.hr-password}") String hrPassword,
            @Value("${app.auth.admin-password}") String adminPassword) {
        UserDetails hr = User.withUsername("hr")
                .password(encoder.encode(hrPassword)).roles("HR").build();
        UserDetails admin = User.withUsername("admin")
                .password(encoder.encode(adminPassword)).roles("ADMIN").build();
        return new InMemoryUserDetailsManager(hr, admin);
    }
    
}
