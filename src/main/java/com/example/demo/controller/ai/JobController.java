package com.example.demo.controller.ai;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.JobDescription;
import com.example.demo.service.ai.JobDescriptionCatalog;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobDescriptionCatalog jobDescriptionCatalog;

    @GetMapping
    public List<JobDescription> list() {
        return jobDescriptionCatalog.findAll();
    }
    
}
