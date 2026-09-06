package com.example.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** 前端 React Router 的深層路由：直接開或重新整理時，轉回 index.html 交給前端處理 */
@Controller
public class SpaController {

    @GetMapping({"/chat", "/resumes", "/match", "/settings"})
    public String forwardToIndex() {
        return "forward:/index.html";
    }
}
