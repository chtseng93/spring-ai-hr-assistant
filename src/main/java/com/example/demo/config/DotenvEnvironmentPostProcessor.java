package com.example.demo.config;

import io.github.cdimascio.dotenv.Dotenv;
import io.github.cdimascio.dotenv.DotenvException;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.HashMap;
import java.util.Map;

/**
 * 在 Spring 啟動前將 .env 檔案的變數注入環境，
 * 使 application.properties 中的 ${VAR} 佔位符能正確解析
 */
public class DotenvEnvironmentPostProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        try {
            Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
            Map<String, Object> props = new HashMap<>();
            dotenv.entries().forEach(e -> props.put(e.getKey(), e.getValue()));
            environment.getPropertySources().addFirst(new MapPropertySource("dotenvProperties", props));
        } catch (DotenvException e) {
            // .env 不存在時靜默略過，改由系統環境變數提供
        }
    }
}
