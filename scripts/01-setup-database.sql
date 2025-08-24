-- Personal Codex Agent Database Schema
-- This script sets up the core tables for document storage and chat functionality

-- Documents table for storing personal documents and their metadata
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    document_type VARCHAR(50) NOT NULL, -- 'cv', 'blog_post', 'code', 'project', 'other'
    file_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb -- Store additional metadata like tags, source, etc.
);

-- Document embeddings table for RAG functionality
CREATE TABLE IF NOT EXISTS document_embeddings (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    chunk_text TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    embedding VECTOR(1536), -- OpenAI embedding dimension
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) DEFAULT 'New Conversation',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb, -- Store context, sources, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_created ON documents(created_at);
CREATE INDEX IF NOT EXISTS idx_embeddings_document ON document_embeddings(document_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);

-- Insert sample documents to get started
INSERT INTO documents (title, content, document_type, metadata) VALUES
('Professional Summary', 'Experienced AI Engineer with expertise in machine learning, natural language processing, and full-stack development. Passionate about building intelligent systems that solve real-world problems.', 'cv', '{"section": "summary"}'),
('Technical Skills', 'Programming Languages: Python, JavaScript, TypeScript, Go. Frameworks: React, Next.js, FastAPI, Django. AI/ML: TensorFlow, PyTorch, Transformers, LangChain. Databases: PostgreSQL, MongoDB, Vector DBs.', 'cv', '{"section": "skills"}'),
('Recent Project: RAG System', 'Built a production-ready RAG system using LangChain and Pinecone for document Q&A. Implemented semantic search with OpenAI embeddings and achieved 85% accuracy on domain-specific queries.', 'project', '{"category": "ai", "status": "completed"}')
ON CONFLICT DO NOTHING;
