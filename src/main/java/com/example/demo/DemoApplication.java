package com.example.demo;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Spring AI RAG 企業知識庫助手 — 主程式入口
 */
@SpringBootApplication
public class DemoApplication {

    public static void main(String[] args) {
        // 將 .env 載入為 system properties，讓 Spring 佔位符能正確解析
        Dotenv.configure().ignoreIfMissing().load()
                .entries()
                .forEach(e -> System.setProperty(e.getKey(), e.getValue()));

        SpringApplication.run(DemoApplication.class, args);
    }
}
