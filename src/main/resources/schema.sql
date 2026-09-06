CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS rag_documents (
    id        UUID PRIMARY KEY,
    content   TEXT NOT NULL,
    metadata  JSONB,
    embedding VECTOR(1024)
);

CREATE TABLE IF NOT EXISTS resumes (
    id          UUID PRIMARY KEY,
    filename    VARCHAR(255) NOT NULL,
    full_text   TEXT NOT NULL,
    uploaded_at TIMESTAMP NOT NULL
);
