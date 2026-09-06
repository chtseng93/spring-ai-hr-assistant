package com.example.demo.config;
import java.util.function.Function;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.client.advisor.vectorstore.QuestionAnswerAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Description;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.core.JdbcTemplate;

import com.example.demo.service.ai.PgVectorStore;
import com.example.demo.service.ai.ResumeSearchFunction;

import tools.jackson.databind.ObjectMapper;

/**
 * AI 相關 Bean 設定
 */
@Configuration
public class AIConfig {

    private static final String DEFAULT_SYSTEM = "You are a helpful assistant. Please respond concisely and clearly.";

    /** 預設 ChatClient（帶對話記憶；/rag/agent 用，檢索由工具觸發，不掛 QA advisor） */
    @Primary
    @Bean
    public ChatClient chatClient(ChatClient.Builder builder, ChatMemory chatMemory) {
        return builder
                .defaultSystem(DEFAULT_SYSTEM)
                .defaultAdvisors(MessageChatMemoryAdvisor.builder(chatMemory).build())
                .build();
    }

    /** 履歷媒合用 ChatClient：一次性結構化分析，不需對話記憶，不掛任何 advisor */
    @Bean
    public ChatClient matchChatClient(ChatClient.Builder builder) {
        return builder.build();
    }

    /*向量資料庫配置 (PostgreSQL pgvector) */
    @Bean
    public VectorStore pgVectorStore(JdbcTemplate jdbcTemplate, EmbeddingModel embeddingModel, ObjectMapper objectMapper){
        return new PgVectorStore(jdbcTemplate, embeddingModel, objectMapper);
    }

    /*配置帶有Rag功能與對話記憶的ChatClient */
    @Bean
    public ChatClient ragChatClient(ChatModel chatModel, VectorStore vectorStore, ChatMemory chatMemory) {
        return ChatClient.builder(chatModel)
        .defaultAdvisors(
                QuestionAnswerAdvisor.builder(vectorStore)
                        .searchRequest(SearchRequest.builder().topK(5).similarityThreshold(0.7).build())
                        .build(),
                MessageChatMemoryAdvisor.builder(chatMemory).build())
               .build();
    }
    
    /** 履歷語意搜尋工具（供 /rag/agent 的 ChatClient 呼叫） */
    @Bean
    @Description("依關鍵字語意搜尋已上傳的履歷內容，回傳最相關的履歷片段。查詢多位候選人時，每位分別呼叫一次。")
    public Function<ResumeSearchFunction.Request, ResumeSearchFunction.Response> resumeSearchFunction(
            VectorStore pgVectorStore) {
        return new ResumeSearchFunction(pgVectorStore);
    }






}
