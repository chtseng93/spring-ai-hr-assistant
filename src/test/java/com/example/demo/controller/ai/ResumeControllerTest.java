package com.example.demo.controller.ai;
import java.time.LocalDateTime;
import java.util.NoSuchElementException;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.demo.model.MatchResult;
import com.example.demo.model.Resume;
import com.example.demo.service.ai.ResumeMatchService;
import com.example.demo.service.ai.ResumeUploadService;

@WebMvcTest(ResumeController.class)
public class ResumeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ResumeUploadService resumeUploadService;

    @MockitoBean
    private ResumeMatchService resumeMatchService;

    @Test
    void 上傳PDF成功時回傳resumeId與檔名() throws Exception {
        UUID id = UUID.randomUUID();
        Resume resume = Resume.builder().id(id).filename("resume.pdf").fullText("...").uploadedAt(LocalDateTime.now()).build();
        when(resumeUploadService.upload(any())).thenReturn(resume);

        MockMultipartFile file = new MockMultipartFile("file", "resume.pdf", "application/pdf", "dummy".getBytes());

        mockMvc.perform(multipart("/api/resumes").file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.resumeId").value(id.toString()))
                .andExpect(jsonPath("$.filename").value("resume.pdf"));
    }

    @Test
    void 上傳非PDF時回傳400() throws Exception {
        when(resumeUploadService.upload(any())).thenThrow(new IllegalArgumentException("只接受 PDF 檔案"));

        MockMultipartFile file = new MockMultipartFile("file", "resume.txt", "text/plain", "hello".getBytes());

        mockMvc.perform(multipart("/api/resumes").file(file))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("只接受 PDF 檔案"));
    }

    @Test
    void 匹配分析成功時回傳分數與理由() throws Exception {
        UUID resumeId = UUID.randomUUID();
        when(resumeMatchService.match(resumeId, "architect")).thenReturn(new MatchResult(85, "符合度高"));

        mockMvc.perform(post("/api/resumes/{resumeId}/match", resumeId).param("jobId", "architect"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.score").value(85))
                .andExpect(jsonPath("$.reason").value("符合度高"));
    }

    @Test
    void 匹配分析時履歷或職缺不存在回傳404() throws Exception {
        UUID resumeId = UUID.randomUUID();
        when(resumeMatchService.match(resumeId, "not-exist")).thenThrow(new NoSuchElementException("找不到職缺：not-exist"));

        mockMvc.perform(post("/api/resumes/{resumeId}/match", resumeId).param("jobId", "not-exist"))
                .andExpect(status().isNotFound());
    }

}
