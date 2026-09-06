package com.example.demo.service.ai;

import java.util.List;
import java.util.Map;
import java.util.StringJoiner;

import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.filter.Filter;
import org.springframework.jdbc.core.JdbcTemplate;

import tools.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

/**
 * 用 PostgreSQL pgvector 手刻的 VectorStore，是 RAG 的資料底座。
 * 資料表 rag_documents：id、content、metadata(jsonb)、embedding(vector)。
 */
@RequiredArgsConstructor
public class PgVectorStore implements VectorStore {

    private final JdbcTemplate jdbcTemplate;
    private final EmbeddingModel embeddingModel;  // 文字 → 向量
    private final ObjectMapper objectMapper;      // metadata Map ↔ jsonb

    /** 算出 embedding 後寫入 rag_documents */
    @Override
    public void add(List<Document> documents) {
        for (Document document : documents) {
            float[] embedding = embeddingModel.embed(document);
            jdbcTemplate.update(
                    "INSERT INTO rag_documents (id, content, metadata, embedding) VALUES (?::uuid, ?, ?::jsonb, ?::vector)",
                    document.getId(), document.getText(), objectMapper.writeValueAsString(document.getMetadata()),
                    toVectorLiteral(embedding));
        }
    }

    /** 依 id 批次刪除 */
    @Override
    public void delete(List<String> idList) {
        List<Object[]> batchArgs = idList.stream().map(id -> new Object[] { id }).toList();
        jdbcTemplate.batchUpdate("DELETE FROM rag_documents WHERE id = ?::uuid", batchArgs);
    }

    /** ponytail: metadata filter 刪除用不到，需要時再實作 */
    @Override
    public void delete(Filter.Expression filterExpression) {
        throw new UnsupportedOperationException("尚未實作 metadata filter 刪除");
    }

    /** 用 pgvector 的 <=>（cosine distance）取 topK，score = 1 - distance，再過濾門檻 */
    @Override
    public List<Document> similaritySearch(SearchRequest request) {
        String queryVector = toVectorLiteral(embeddingModel.embed(request.getQuery()));
        String sql = """
                SELECT id, content, metadata,
                       1 - (embedding <=> ?::vector) AS score
                FROM rag_documents
                ORDER BY embedding <=> ?::vector
                LIMIT ?
                """;

        return jdbcTemplate.query(sql,
                (rs, rowNum) -> Document.builder()
                        .id(rs.getString("id"))
                        .text(rs.getString("content"))
                        .metadata(readMetadata(rs.getString("metadata")))
                        .score(rs.getDouble("score"))
                        .build(),
                queryVector, queryVector, request.getTopK())
                .stream()
                .filter(document -> document.getScore() >= request.getSimilarityThreshold())
                .toList();
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> readMetadata(String metadataJson) {
        return objectMapper.readValue(metadataJson, Map.class);
    }

    /** float[] → pgvector 的 "[0.1,0.2,...]" 字面值 */
    private String toVectorLiteral(float[] embedding) {
        StringJoiner joiner = new StringJoiner(",", "[", "]");
        for (float value : embedding) {
            joiner.add(Float.toString(value));
        }
        return joiner.toString();
    }
}
