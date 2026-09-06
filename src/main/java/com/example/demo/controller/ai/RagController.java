package com.example.demo.controller.ai;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.vectorstore.QuestionAnswerAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class RagController {

    // // AIConfig 註冊的 pgVectorStore bean（型別為 VectorStore 介面）
    // @Autowired
    // private VectorStore pgVectorStore;

    
    // @Qualifier("ragChatClient")
    // @Autowired
    // private ChatClient ragChatClient;

    // @GetMapping("/rag")
    // public String rag(@RequestParam String input){
    //     String content = ragChatClient.prompt()
    //     .user(input)
    //         .user(input)
    //         .advisors(
    //             QuestionAnswerAdvisor.builder(pgVectorStore)
    //                     .build()
    //     )
    //     .call()
    //     .content();


    //     return content;
        
    // }


    // @GetMapping("/rag/agent")
    // public String agent(@RequestParam("query") String query){
    // // 檢索
    // List<Document> documents = pgVectorStore.similaritySearch(query);

    // // 提取信息
    // String info = "";

    //     if (documents.size() > 0) {
    //         info = documents.get(0).getText();
    //     }


    //     // 構造系統 prompt
    //     String systemPrompt = """
    //     角色與目標：你是一個招聘助手，會針對用戶的問題，結合候選人履歷，崗位匹配度等專業知識，給用戶提供指導。

    //     指導原則：你需要確保給出的建議合理科學，不會對候選人的表現有評論偏好。
    //     限制：在提供建議時，需要強調在個性建議方面用戶仍然需要依下尋求專業諮詢。
    //     澄清：在與用戶交互過程中，你需要明確回答用戶關於招聘方面的問題，對於非招聘方面的問題，你的回答是：「我只是一個招聘助手，不能回答這個問題哦。」
    //     個性化：在回答時，你需要以專業可靠的招聘顧問、親切可愛、幽默風趣、平易近人、易於交互，並且你的回覆要符合用戶的需求。
    //     請你根據數據參考與工具返回結果回覆用戶的請求。
    //     """;

    //     // 構造用戶 prompt
    //     String userPrompt = """
    //     給你提供一段數據參考：{info}，請回答我的問題：{query}。
    //     請你根據數據參考與工具返回結果回覆用戶的請求。
    //     """;

    //     // 構造提示詞
    //     SystemMessage systemMessage = new SystemMessage(systemPrompt);
    //     PromptTemplate promptTemplate = new PromptTemplate(userPrompt);
    //     Message userMessage = promptTemplate.createMessage(Map.of("info", info, "query", query));
    //     Prompt prompt = new Prompt(List.of(systemMessage,userMessage));

    //     // 掛載 recruitServiceFunction 工具（AIConfig 中註冊的 Function Bean）
    //     return ragChatClient.prompt(prompt)
    //             .toolNames("recruitServiceFunction")
    //             .call()
    //             .content();
    // }

    // AIConfig 註冊的 pgVectorStore bean（型別為 VectorStore 介面）
    @Autowired
    private VectorStore pgVectorStore;

    @Qualifier("ragChatClient")
    @Autowired
    private ChatClient ragChatClient;

    // 新增：@Primary 的一般 ChatClient，/rag/agent 用（檢索改由工具觸發，不掛預設 QA advisor）
    @Autowired
    private ChatClient chatClient;

    // ↓ /rag 端點完全不動，保持原樣（含原本重複的 .user(input)），只是連同整個檔案一起貼回
    @GetMapping("/rag")
    public String rag(@RequestParam String input, @RequestParam(defaultValue = "default-conversation") String conversationId){
        String content = ragChatClient.prompt()
        .user(input)
            .user(input)
            .advisors(
                QuestionAnswerAdvisor.builder(pgVectorStore)
                        .build()
        )
        .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, conversationId))
        .call()
        .content();


        return content;
        
    }

    @GetMapping("/rag/agent")
    public String agent(@RequestParam("query") String query,
                        @RequestParam(defaultValue = "default-conversation") String conversationId) {
        // 系統 prompt：指示 LLM 需要履歷資料時自行呼叫 resumeSearchFunction 工具，多位候選人分別查
        String systemPrompt = """
                角色與目標：你是誠邑建築公司的招聘助手，會針對用戶的問題，結合候選人履歷、崗位匹配度等專業知識，給用戶提供指導。
                工具使用：當你需要候選人履歷的內容時，呼叫 resumeSearchFunction 工具，用姓名或技能當關鍵字查詢。
                若問題牽涉多位候選人，請針對每一位「分別」呼叫一次工具，不要只查一次。查不到資料時如實告知使用者。
                指導原則：建議需合理科學，不對候選人的表現有主觀偏好。
                限制：涉及個人化建議時，需提醒使用者仍應尋求專業諮詢。
                澄清：對於非招聘方面的問題，一律回答：「我只是一個招聘助手，不能回答這個問題哦。」
                """;

        return chatClient.prompt()
                .system(systemPrompt)
                .user(query)
                .toolNames("resumeSearchFunction")
                .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, conversationId))
                .call()
                .content();
    }

}