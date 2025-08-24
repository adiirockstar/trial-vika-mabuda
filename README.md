# Personal Codex Agent

An AI-powered personal assistant that answers questions about your professional background, experience, and expertise based on your uploaded documents. Built with Next.js, Groq AI, and RAG (Retrieval-Augmented Generation) technology.

## 🎯 Project Overview

This Personal Codex Agent serves as your digital professional representative, trained on your personal documents to provide contextual, first-person responses about your background, skills, and experience. It's designed for professionals who want an AI assistant that can intelligently discuss their work and expertise.

## ✨ Key Features

- **Document Processing**: Upload and process text files, PDFs, and markdown documents
- **Intelligent Chunking**: Automatic text segmentation for optimal RAG performance
- **Context-Aware Chat**: AI responses based on your actual documents and experience
- **First-Person Responses**: Agent speaks as you, using "I" when discussing your background
- **Confidence Indicators**: Visual feedback on response reliability
- **Professional UI**: Clean, modern interface with cyan and purple design theme
- **Real-time Processing**: Instant document analysis and chat responses

## 🚀 Quick Start for VS Code

### Prerequisites
- Node.js 18+ 
- Your Groq API key 

### Installation Steps

1. **Extract/Clone the project**:
   \`\`\`bash
   # If you downloaded a ZIP, extract it
   # If using git:
   git clone <your-repo-url>
   cd personal-codex-agent
   \`\`\`

2. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

3. **Environment Setup**:
   The `.env.local` file is already included with your Groq API key:
   \`\`\`
   GROQ_API_KEY=your groq api key
   \`\`\`

4. **Run the development server**:
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Open your browser**:
   Navigate to `http://localhost:3000`

### First Steps After Setup

1. **Upload Documents**: Go to the "Upload" tab and add your CV, resume, or professional documents
2. **Start Chatting**: Switch to the "Chat" tab and ask questions like:
   - "What's my professional background?"
   - "Tell me about my skills"
   - "What experience do I have?"
3. **Manage Documents**: Use the "Documents" tab to view your knowledge base

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15 with App Router, React, TypeScript
- **UI Components**: shadcn/ui with Tailwind CSS v4
- **AI Integration**: Groq (Llama 3.3 70B) via AI SDK
- **Styling**: Custom design system with Space Grotesk and DM Sans fonts
- **State Management**: React hooks and server actions

### System Components

1. **Document Processing System** (`lib/document-processor.ts`)
   - Text extraction and cleaning
   - Intelligent chunking with overlap
   - Metadata preservation

2. **RAG Engine** (`lib/rag-engine.ts`)
   - Keyword-based content retrieval
   - Relevance scoring algorithm
   - Context summarization

3. **AI Agent** (`lib/ai-agent.ts`)
   - Groq integration for text generation
   - First-person response formatting
   - Confidence calculation

4. **Chat Interface** (`components/chat-interface.tsx`)
   - Real-time messaging
   - Context usage indicators
   - Confidence badges

## 🔧 API Endpoints

### POST `/api/chat`
Generate AI responses based on user queries and document context.

**Request Body**:
\`\`\`json
{
  "message": "What's my background?",
  "history": [
    {"role": "user", "content": "Previous message"},
    {"role": "assistant", "content": "Previous response"}
  ]
}
\`\`\`

**Response**:
\`\`\`json
{
  "response": "I'm a software engineer with 5 years of experience...",
  "context_used": true,
  "confidence": "high"
}
\`\`\`

### GET `/api/documents`
Retrieve all uploaded documents with metadata.

### POST `/api/documents`
Upload and process a new document.

**Request Body**:
\`\`\`json
{
  "title": "My Resume",
  "content": "Document text content...",
  "type": "text/plain"
}
\`\`\`

### DELETE `/api/documents/[id]`
Remove a document and its associated chunks.

## 🎨 Design System

### Color Palette
- **Primary**: Cyan-800 (`oklch(0.35 0.08 200)`) - Professional, trustworthy
- **Secondary**: Purple (`oklch(0.65 0.15 270)`) - Creative, intelligent
- **Background**: White/Dark (`oklch(1 0 0)` / `oklch(0.1 0 0)`)
- **Accent**: Light cyan for cards and highlights

### Typography
- **Headings**: Space Grotesk (400, 600, 700)
- **Body**: DM Sans (400, 500)
- **Monospace**: System mono stack

### Layout Principles
- Mobile-first responsive design
- Generous whitespace (minimum 16px between sections)
- Consistent max-widths and spacing
- Flexbox-first layout approach

## 🧠 AI Integration Details

### RAG Implementation
The system uses a keyword-based RAG approach optimized for personal documents:

1. **Document Chunking**: 1000 characters with 200-character overlap
2. **Keyword Extraction**: Stop-word filtering and relevance scoring
3. **Context Retrieval**: Top 5 most relevant chunks per query
4. **Response Generation**: Groq Llama 3.3 70B with custom system prompts

### Prompt Engineering
The AI agent uses carefully crafted system prompts to:
- Respond in first person as the user
- Maintain professional tone
- Acknowledge limitations when context is insufficient
- Synthesize information from multiple document chunks

## 📊 Performance Considerations

- **Chunking Strategy**: Optimized for 1000-character chunks to balance context and performance
- **Relevance Scoring**: Efficient keyword-based algorithm for real-time search
- **Response Caching**: Conversation history limited to last 10 messages
- **Error Handling**: Graceful degradation with user-friendly error messages

## 🚀 Deployment

### Vercel Deployment (Recommended)
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Add `GROQ_API_KEY` environment variable in Vercel dashboard
4. Deploy automatically

### Manual Deployment
\`\`\`bash
npm run build
npm start
\`\`\`

## 🔮 Future Enhancements

### Planned Features
- **Vector Embeddings**: Replace keyword search with semantic similarity
- **Multi-modal Support**: Image and PDF text extraction
- **Tone Switching**: Professional/casual/technical response modes
- **Export Functionality**: Download conversations and insights
- **Analytics Dashboard**: Usage patterns and popular queries

### Technical Improvements
- **Database Integration**: Persistent storage with Supabase/Neon
- **Caching Layer**: Redis for improved response times
- **Batch Processing**: Async document processing for large files
- **API Rate Limiting**: Prevent abuse and manage costs

## 🤝 Contributing

This is a personal project, but feedback and suggestions are welcome! Please open an issue to discuss potential improvements.


