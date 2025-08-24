# Personal Codex Agent - Architecture Documentation

## System Overview

The Personal Codex Agent is built as a modern full-stack application using Next.js 14 with a focus on AI-native development practices. The architecture follows a modular design with clear separation of concerns.

## Core Components

### 1. Frontend Layer
- **Framework**: Next.js 14 with App Router
- **UI Library**: shadcn/ui components with Tailwind CSS v4
- **State Management**: React hooks and server actions
- **Type Safety**: TypeScript throughout

### 2. API Layer
- **Chat Endpoint** (`/api/chat`): Handles AI conversation logic
- **Documents Endpoint** (`/api/documents`): Manages document CRUD operations
- **Server Actions**: Form handling and data mutations

### 3. AI Integration Layer
- **AI SDK**: Vercel AI SDK for standardized AI interactions
- **Model Provider**: Groq (Llama 3.1 70B Versatile)
- **RAG Engine**: Custom implementation for document retrieval

### 4. Data Processing Layer
- **Document Processor**: Text extraction and chunking
- **RAG Engine**: Keyword-based content retrieval
- **Context Manager**: Relevance scoring and ranking

## Data Flow

\`\`\`
User Input → Chat Interface → API Route → RAG Engine → AI Model → Response
                                    ↓
                            Document Database ← Document Processor ← File Upload
\`\`\`

### Detailed Flow

1. **Document Upload**:
   - User uploads document via UI
   - `DocumentProcessor` extracts and cleans text
   - Content is chunked with overlap for RAG
   - Chunks stored with metadata

2. **Chat Interaction**:
   - User sends message via chat interface
   - `RAGEngine` searches for relevant document chunks
   - Context and conversation history sent to Groq
   - AI generates first-person response
   - Response displayed with confidence indicators

## Key Design Decisions

### RAG Implementation
**Decision**: Keyword-based retrieval instead of vector embeddings
**Rationale**: 
- Simpler implementation for MVP
- Lower latency and computational requirements
- Sufficient accuracy for personal document corpus
- Easy to understand and debug

### AI Model Choice
**Decision**: Groq Llama 3.1 70B Versatile
**Rationale**:
- High-quality responses for conversational AI
- Fast inference times via Groq infrastructure
- Good balance of capability and cost
- Strong instruction following for first-person responses

### Chunking Strategy
**Decision**: 1000 characters with 200-character overlap
**Rationale**:
- Optimal balance between context preservation and processing efficiency
- Overlap ensures important information isn't lost at chunk boundaries
- Size works well with model context windows

### First-Person Response Design
**Decision**: Agent responds as the user ("I am..." instead of "The user is...")
**Rationale**:
- Creates more natural interaction for personal assistant use case
- Aligns with project brief requirements
- Better user experience for professional representation

## Security Considerations

### Data Privacy
- Documents stored in memory (not persisted to disk)
- No external data sharing beyond AI model inference
- User controls all document uploads and deletions

### API Security
- Input validation on all endpoints
- Error handling prevents information leakage
- Rate limiting considerations for production deployment

## Performance Optimizations

### Frontend
- Component lazy loading where appropriate
- Optimized re-renders with proper React patterns
- Efficient state management

### Backend
- Conversation history limited to last 10 messages
- Document chunking optimized for search performance
- Graceful error handling and fallbacks

### AI Integration
- Streaming responses for better UX (future enhancement)
- Context window management
- Temperature and token limits optimized for use case

## Scalability Considerations

### Current Limitations
- In-memory storage (not suitable for production)
- Single-user design
- No persistent conversation history

### Future Scaling Path
1. **Database Integration**: Move to Supabase/Neon for persistence
2. **Multi-tenancy**: User authentication and data isolation
3. **Vector Search**: Upgrade to semantic similarity search
4. **Caching**: Redis for frequently accessed content
5. **CDN**: Static asset optimization

## Development Workflow

### AI-Native Practices
- Used v0 for rapid UI prototyping
- Collaborative development with AI tools
- Iterative refinement based on AI suggestions
- Documentation generated with AI assistance

### Code Organization
\`\`\`
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── chat-interface.tsx
│   ├── document-upload.tsx
│   └── document-list.tsx
├── lib/                   # Utility libraries
│   ├── ai-agent.ts       # AI integration logic
│   ├── document-processor.ts
│   ├── rag-engine.ts
│   └── utils.ts
└── docs/                  # Documentation
\`\`\`

## Testing Strategy

### Current State
- Manual testing during development
- Type safety via TypeScript
- Error boundary implementation

### Future Testing
- Unit tests for core logic (document processing, RAG engine)
- Integration tests for API endpoints
- E2E tests for critical user flows
- AI response quality evaluation

## Monitoring and Observability

### Current Implementation
- Console logging for development
- Error handling with user feedback
- Basic performance monitoring

### Production Considerations
- Structured logging
- Error tracking (Sentry)
- Performance monitoring
- AI model usage analytics
- User interaction tracking

This architecture provides a solid foundation for a personal AI assistant while maintaining simplicity and extensibility for future enhancements.
