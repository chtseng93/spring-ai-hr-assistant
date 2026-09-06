package com.example.demo.model;

/** 履歷 x 職缺匹配分析結果，由 LLM 結構化輸出產生 */
public record MatchResult(int score, String reason) {
}
