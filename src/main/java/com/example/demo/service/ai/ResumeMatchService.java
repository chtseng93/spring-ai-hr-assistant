package com.example.demo.service.ai;

import java.util.NoSuchElementException;
import java.util.UUID;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import com.example.demo.model.JobDescription;
import com.example.demo.model.MatchResult;
import com.example.demo.model.Resume;
import com.example.demo.repository.ResumeRepository;

/** 履歷 x 職缺匹配分析：把履歷全文與職缺全文一起丟給 LLM，直接分析（不透過向量相似度） */
@Service
public class ResumeMatchService {

    private static final String SYSTEM_PROMPT = """
            角色與目標：你是誠邑建築公司的專業招聘顧問，負責分析候選人履歷與職缺的匹配程度。
            指導原則：只根據履歷內容與職缺要求進行客觀分析，不對候選人的表現做主觀評論或人身攻擊。
            分數要能反映硬條件（年資、技能關鍵字是否出現），不是文字寫得好不好看。
            原因要具體指出「符合的部分」與「不符合/缺少的部分」，不要空泛帶過。
            """;

    private static final String USER_PROMPT_TEMPLATE = """
            職缺名稱：%s
            職缺要求：
            %s

            候選人履歷全文：
            %s

            請針對這份履歷與職缺的匹配程度，給出 0-100 的分數與具體理由。
            """;
    private final ResumeRepository resumeRepository;
    private final JobDescriptionCatalog jobDescriptionCatalog;
    private final ChatClient chatClient;

    // 明確指定無記憶的 matchChatClient（避免注入到 @Primary 的帶對話記憶版本）
    public ResumeMatchService(ResumeRepository resumeRepository,
                              JobDescriptionCatalog jobDescriptionCatalog,
                              @Qualifier("matchChatClient") ChatClient chatClient) {
        this.resumeRepository = resumeRepository;
        this.jobDescriptionCatalog = jobDescriptionCatalog;
        this.chatClient = chatClient;
    }

    public MatchResult match(UUID resumeId, String jobId) {
        
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new NoSuchElementException("找不到履歷：" + resumeId));
        JobDescription job = jobDescriptionCatalog.findById(jobId);

        String userPrompt = USER_PROMPT_TEMPLATE.formatted(job.title(), job.description(), resume.getFullText());

        return chatClient.prompt()
                .system(SYSTEM_PROMPT)
                .user(userPrompt)
                .call()
                .entity(MatchResult.class);
    }

    
    
}
