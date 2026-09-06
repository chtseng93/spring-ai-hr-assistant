package com.example.demo.service.ai;

import java.util.NoSuchElementException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.junit.jupiter.api.Test;



public class JobDescriptionCatalogTest {
    private final JobDescriptionCatalog catalog = new JobDescriptionCatalog();

    @Test
    void 回傳固定的職缺清單() {
        assertThat(catalog.findAll()).hasSize(3);
        assertThat(catalog.findAll()).extracting("id")
                .containsExactly("architect", "structural-engineer", "accountant");
    }

    @Test
    void 依id查詢存在的職缺() {
        assertThat(catalog.findById("structural-engineer").title()).isEqualTo("結構技師");
    }

    @Test
    void 查詢不存在的id時拋出例外() {
        assertThatThrownBy(() -> catalog.findById("not-exist"))
                .isInstanceOf(NoSuchElementException.class);
    }
}
