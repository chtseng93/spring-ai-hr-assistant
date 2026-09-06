package com.example.demo.controller.ai;
import java.io.IOException;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.UUID;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.model.MatchResult;
import com.example.demo.model.Resume;
import com.example.demo.service.ai.ResumeMatchService;
import com.example.demo.service.ai.ResumeUploadService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeUploadService resumeUploadService;

    private final ResumeMatchService resumeMatchService;
    
    @PostMapping
    public ResponseEntity<Map<String, String>> upload(@RequestParam("file") MultipartFile file) {
        try {
            Resume resume = resumeUploadService.upload(file);
            return ResponseEntity.ok(Map.of("resumeId", resume.getId().toString(), "filename", resume.getFilename()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "PDF 解析失敗"));
        }
    }

    @PostMapping("/{resumeId}/match")
    public ResponseEntity<?> match(@PathVariable UUID resumeId, @RequestParam String jobId) {
        try {
            MatchResult result = resumeMatchService.match(resumeId, jobId);
            return ResponseEntity.ok(result);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    
}
