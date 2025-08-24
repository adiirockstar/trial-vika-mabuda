# API Documentation

## Overview

The Personal Codex Agent provides a RESTful API for document management and AI-powered chat functionality. All endpoints return JSON responses and use standard HTTP status codes.

## Base URL
\`\`\`
http://localhost:3000/api
\`\`\`

## Authentication
Currently, no authentication is required. In production, implement proper authentication and authorization.

## Endpoints

### Chat API

#### POST `/api/chat`
Generate AI responses based on user queries and document context.

**Request Headers:**
\`\`\`
Content-Type: application/json
\`\`\`

**Request Body:**
\`\`\`json
{
  "message": "string (required) - User's question or message",
  "history": [
    {
      "role": "user | assistant",
      "content": "string - Previous message content"
    }
  ]
}
\`\`\`

**Response:**
\`\`\`json
{
  "response": "string - AI-generated response",
  "context_used": "boolean - Whether document context was used",
  "confidence": "high | medium | low - Response confidence level"
}
\`\`\`

**Example Request:**
\`\`\`bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is my professional background?",
    "history": []
  }'
\`\`\`

**Example Response:**
\`\`\`json
{
  "response": "I am a software engineer with 5 years of experience in full-stack development, specializing in React, Node.js, and cloud technologies. I have worked on various projects ranging from e-commerce platforms to AI-powered applications.",
  "context_used": true,
  "confidence": "high"
}
\`\`\`

**Error Responses:**
- `400 Bad Request`: Missing or invalid message
- `500 Internal Server Error`: AI generation failure

---

### Documents API

#### GET `/api/documents`
Retrieve all uploaded documents with metadata.

**Response:**
\`\`\`json
[
  {
    "id": "string - Unique document identifier",
    "title": "string - Document title",
    "content": "string - Full document content",
    "type": "string - MIME type",
    "created_at": "string - ISO timestamp",
    "chunk_count": "number - Number of processed chunks"
  }
]
\`\`\`

**Example Response:**
\`\`\`json
[
  {
    "id": "1703123456789",
    "title": "My Resume",
    "content": "John Doe\nSoftware Engineer\n...",
    "type": "text/plain",
    "created_at": "2024-01-15T10:30:00.000Z",
    "chunk_count": 5
  }
]
\`\`\`

#### POST `/api/documents`
Upload and process a new document.

**Request Headers:**
\`\`\`
Content-Type: application/json
\`\`\`

**Request Body:**
\`\`\`json
{
  "title": "string (required) - Document title",
  "content": "string (required) - Document text content",
  "type": "string (optional) - MIME type, defaults to 'text/plain'"
}
\`\`\`

**Response:**
\`\`\`json
{
  "document": {
    "id": "string - Generated document ID",
    "title": "string - Document title",
    "content": "string - Document content",
    "type": "string - MIME type",
    "created_at": "string - ISO timestamp"
  },
  "chunks": "number - Number of chunks created"
}
\`\`\`

**Example Request:**
\`\`\`bash
curl -X POST http://localhost:3000/api/documents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Project Portfolio",
    "content": "Here are my key projects...",
    "type": "text/markdown"
  }'
\`\`\`

**Error Responses:**
- `400 Bad Request`: Missing title or content
- `500 Internal Server Error`: Document processing failure

#### DELETE `/api/documents/[id]`
Remove a document and its associated chunks.

**Parameters:**
- `id` (path parameter): Document ID to delete

**Response:**
\`\`\`json
{
  "success": true
}
\`\`\`

**Example Request:**
\`\`\`bash
curl -X DELETE http://localhost:3000/api/documents/1703123456789
\`\`\`

**Error Responses:**
- `404 Not Found`: Document not found
- `500 Internal Server Error`: Deletion failure

## Data Models

### Message
\`\`\`typescript
interface Message {
  role: "user" | "assistant"
  content: string
}
\`\`\`

### Document
\`\`\`typescript
interface Document {
  id: string
  title: string
  content: string
  type: string
  created_at: string
  chunk_count?: number
}
\`\`\`

### DocumentChunk
\`\`\`typescript
interface DocumentChunk {
  id: string
  content: string
  document_id: string
  metadata: {
    title: string
    type: string
    chunkIndex: number
    totalChunks: number
  }
  created_at: string
}
\`\`\`

## Error Handling

All endpoints use standard HTTP status codes:

- `200 OK`: Successful request
- `400 Bad Request`: Invalid request data
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error responses include a descriptive message:
\`\`\`json
{
  "error": "Descriptive error message"
}
\`\`\`

## Rate Limiting

Currently, no rate limiting is implemented. For production deployment, consider implementing:
- Per-IP rate limiting
- Per-user rate limiting (with authentication)
- Cost-based limiting for AI API calls

## Usage Examples

### Complete Chat Flow
\`\`\`javascript
// 1. Upload a document
const uploadResponse = await fetch('/api/documents', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'My CV',
    content: 'John Doe, Software Engineer...'
  })
})

// 2. Start a conversation
const chatResponse = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Tell me about my experience',
    history: []
  })
})

const { response, context_used, confidence } = await chatResponse.json()
console.log(`AI: ${response} (Context: ${context_used}, Confidence: ${confidence})`)
\`\`\`

### Document Management
\`\`\`javascript
// List all documents
const documents = await fetch('/api/documents').then(r => r.json())

// Delete a document
await fetch(`/api/documents/${documentId}`, { method: 'DELETE' })
\`\`\`

## Development Notes

### Current Limitations
- In-memory storage (data lost on server restart)
- No authentication or authorization
- No request validation middleware
- Basic error handling

### Production Considerations
- Implement persistent database storage
- Add authentication and user isolation
- Implement request validation and sanitization
- Add comprehensive logging and monitoring
- Implement proper error handling and recovery
- Add API versioning
- Implement caching for frequently accessed data

This API provides the foundation for the Personal Codex Agent functionality and can be extended with additional features as needed.
