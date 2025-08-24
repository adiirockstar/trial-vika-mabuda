import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { documentStore } from "@/lib/document-store"

interface Message {
  role: "user" | "assistant"
  content: string
}

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    console.log(`[v0] Processing chat message: ${message}`)

    if (!process.env.GROQ_API_KEY) {
      console.error("[v0] GROQ_API_KEY environment variable is not set")
      return NextResponse.json(
        {
          error: "Groq API key is not configured. Please add GROQ_API_KEY to your environment variables.",
        },
        { status: 500 },
      )
    }

    const relevantContext = await retrieveRelevantContext(message)

    console.log(`[v0] Found ${relevantContext.length} relevant context chunks`)

    // Build conversation history
    const conversationHistory: Message[] = history.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }))

    // Create system prompt with context
    const systemPrompt = createSystemPrompt(relevantContext)

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: systemPrompt,
      messages: [
        ...conversationHistory,
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.7,
      maxTokens: 1000,
    })

    return NextResponse.json({
      response: text,
      context_used: relevantContext.length > 0,
      context_count: relevantContext.length,
    })
  } catch (error) {
    console.error("Error generating response:", error)
    return NextResponse.json(
      {
        error: "Failed to generate response. Please check your Groq API key and try again.",
      },
      { status: 500 },
    )
  }
}

async function retrieveRelevantContext(query: string): Promise<string[]> {
  const searchResults = documentStore.searchChunks(query, 5)

  console.log(`[v0] Search results: ${searchResults.length} chunks found`)

  return searchResults.map((result) => {
    console.log(`[v0] Using chunk from "${result.chunk.metadata.title}" with score ${result.score}`)
    return result.chunk.content
  })
}

function createSystemPrompt(context: string[]): string {
  const basePrompt = `You are a Personal Codex Agent representing the user's professional profile. You have access to their CV and personal documents.

CRITICAL INSTRUCTIONS:
- Always respond in first person ("I have", "My skills include", "I worked at")
- When asked about skills, experience, or qualifications, extract and list specific information from the provided context
- Be direct and specific - if the context contains a list of skills, provide that exact list
- Don't be vague or generic - use the actual details from the documents
- If information is in the context, present it confidently as the user's background
- NEVER make up or assume company names, dates, or details not explicitly mentioned in the context`

  if (context.length > 0) {
    return `${basePrompt}

CONTEXT FROM USER'S DOCUMENTS:
${context.map((chunk, index) => `--- Document Section ${index + 1} ---\n${chunk}`).join("\n\n")}

SPECIAL INSTRUCTIONS FOR SKILLS QUESTIONS:
When asked "what skills do I have" or similar questions about skills/technologies:
1. Scan the context for ALL programming languages, frameworks, tools, and technologies mentioned
2. Look for patterns like: "Python", "Java", "JavaScript", "React", "Next.js", "SQL", "FastAPI", "PostgreSQL", etc.
3. Organize them into categories (Programming Languages, Web Technologies, Databases, etc.)
4. Present them as a clear, organized list in first person
5. Include both technical and soft skills mentioned in the context

SPECIAL INSTRUCTIONS FOR EXPERIENCE QUESTIONS:
When asked about years of experience or work history:
1. Carefully scan the context for ALL work positions with dates (look for MM/YYYY patterns like 07/2023)
2. Look for company names, job titles, and employment periods - ONLY use names explicitly mentioned
3. Calculate total experience from the EARLIEST professional work start date to present (January 2025)
4. Include both professional employment AND relevant project work
5. CRITICAL: Never invent company names - if you see "Capaciti" use "Capaciti", don't substitute other company names
6. If you see dates like "07/2023 - Present", calculate from July 2023 to 01/2025 = approximately 1.5 years
7. Be precise about calculations: 07/2023 to 01/2025 = 18 months = 1.5 years
8. If multiple positions exist, calculate from the earliest start date for total experience

CRITICAL WARNING: 
- If the context mentions "Capaciti" as a company, use "Capaciti" - never substitute other company names
- If the context shows work starting in 07/2023, calculate experience from that date
- Only use information explicitly stated in the context - never infer or assume details

IMPORTANT: Use the above context to answer questions. Extract specific details like:
- Exact skill names and technologies mentioned
- Company names and job titles (ONLY those explicitly stated in the context)
- Educational qualifications
- Project details and achievements
- Work experience dates and duration calculations (be mathematically accurate)
- Any other specific information requested

Answer the user's question using this context directly and comprehensively.`
  }

  return `${basePrompt}

No relevant context found in the uploaded documents for this specific question. Please acknowledge this and suggest the user upload relevant documents or ask about topics covered in their existing documents.`
}
