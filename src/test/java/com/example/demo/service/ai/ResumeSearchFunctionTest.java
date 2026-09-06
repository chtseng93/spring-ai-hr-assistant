package com.example.demo.service.ai;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;

class ResumeSearchFunctionTest {

    private final VectorStore vectorStore = mock(VectorStore.class);
    private final ResumeSearchFunction function = new ResumeSearchFunction(vectorStore);

    @Test
    void 回傳所有檢索到的履歷片段而非只取第一筆() {
        when(vectorStore.similaritySearch(anyString())).thenReturn(List.of(
                Document.builder().id("1").text("林敬堯 執業建築師，12 年集合住宅設計經驗").build(),
                Document.builder().id("2").text("王大明 資深會計師，10 年工程業帳務經驗").build()));

        ResumeSearchFunction.Response response = function.apply(new ResumeSearchFunction.Request("建築師"));

        assertThat(response.snippets()).hasSize(2);
        assertThat(response.snippets()).anyMatch(s -> s.contains("林敬堯"));
        assertThat(response.snippets()).anyMatch(s -> s.contains("王大明"));
    }

    @Test
    void 查無資料時回傳空清單() {
        when(vectorStore.similaritySearch(anyString())).thenReturn(List.of());

        ResumeSearchFunction.Response response = function.apply(new ResumeSearchFunction.Request("不存在的關鍵字"));

        assertThat(response.snippets()).isEmpty();
    }

    @Test
    void 用請求裡的關鍵字去檢索() {
        when(vectorStore.similaritySearch("結構技師")).thenReturn(List.of(
                Document.builder().id("3").text("某結構技師履歷").build()));

        ResumeSearchFunction.Response response = function.apply(new ResumeSearchFunction.Request("結構技師"));

        assertThat(response.snippets()).containsExactly("某結構技師履歷");
    }
}
