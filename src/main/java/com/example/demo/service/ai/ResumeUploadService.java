package com.example.demo.service.ai;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.ai.document.Document;
import org.springframework.ai.reader.pdf.PagePdfDocumentReader;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.model.Resume;
import com.example.demo.repository.ResumeRepository;

import lombok.RequiredArgsConstructor;
/** 履歷上傳：解析 PDF 全文、存進 resumes 表、切 chunk 存進向量庫 */
@Service
@RequiredArgsConstructor
public class ResumeUploadService {

    private final ResumeRepository resumeRepository;
    private final VectorStore pgVectorStore;

    public Resume upload(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("上傳檔案不可為空");
        }

         if (!"application/pdf".equals(file.getContentType())) {
            throw new IllegalArgumentException("只接受 PDF 檔案");
        }

        PagePdfDocumentReader pdfReader = new PagePdfDocumentReader(new ByteArrayResource(file.getBytes()));
        List<Document> pages = pdfReader.get();
        String fullText = pages.stream().map(Document::getText).collect(Collectors.joining("\n"));
        Resume resume = Resume.builder()
                .id(UUID.randomUUID())
                .filename(file.getOriginalFilename())
                .fullText(fullText)
                .uploadedAt(LocalDateTime.now())
                .build();
        resumeRepository.save(resume);
        /*把 PDF 全文依頁切分、掛上履歷關聯的 metadata、再切成適合 embedding 的小 chunk，最後存入向量資料庫，讓系統之後可以用語意搜尋（RAG）根據履歷內容找出符合條件的應徵者 */
        List<Document> taggedPages = pages.stream()
                .map(page -> Document.builder()
                        .id(page.getId())
                        .text(page.getText())
                        .metadata(withResumeMetadata(page.getMetadata(), resume))
                        .build())
                .toList();

        TokenTextSplitter splitter = TokenTextSplitter.builder()
                .withChunkSize(800)
                .withMinChunkSizeChars(200)
                .build();
        List<Document> chunks = splitter.apply(taggedPages);
        pgVectorStore.add(chunks);

        return resume;

    }

    /** 在 PDF 每頁原有 metadata 上補掛履歷關聯欄位，供之後 RAG 過濾使用 */
    private Map<String, Object> withResumeMetadata(Map<String, Object> original, Resume resume) {
        Map<String, Object> metadata = new HashMap<>(original);
        metadata.put("resumeId", resume.getId().toString());
        metadata.put("filename", resume.getFilename());
        metadata.put("type", "resume");
        return metadata;
    }

}
