package com.example.demo.service.ai;

import java.util.List;
import java.util.function.Function;

import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;

import lombok.RequiredArgsConstructor;

/**
 * 履歷語意搜尋工具：給 LLM 呼叫，依關鍵字從向量庫撈出最相關的履歷片段。
 * 取代 RagController 裡「寫死跑一次、只取第一筆」的檢索，改由 LLM 自行決定查幾次、用什麼關鍵字。
 */
@RequiredArgsConstructor
public class ResumeSearchFunction implements Function<ResumeSearchFunction.Request, ResumeSearchFunction.Response> {

    private final VectorStore vectorStore;

    @Override
    public Response apply(Request request) {
        // ponytail: topK / similarityThreshold 用 VectorStore 的預設值，要調再換 SearchRequest 版本
        List<String> snippets = vectorStore.similaritySearch(request.query()).stream()
                .map(Document::getText)
                .toList();
        return new Response(snippets);
    }

    /** query：要搜尋的關鍵字（例如候選人姓名或技能） */
    public record Request(String query) {}

    /** snippets：檢索到的履歷片段全文，依相關度排序 */
    public record Response(List<String> snippets) {}


}
