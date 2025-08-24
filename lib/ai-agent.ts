import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { RAGEngine, type SearchResult } from "./rag-engine"

export interface AgentResponse {
  content: string
  contextUsed: SearchResult[]
  confidence: "high" | "medium" | "low"
}

export class PersonalCodexAgent {
  private static readonly SYSTEM_PROMPT =
    `You are a Personal Codex Agent, an AI assistant that represents the user's professional identity and knowledge base. You have access to their personal documents, CV, projects, and expertise.

IMPORTANT GUIDELINES:
1. Respond in FIRST PERSON as if you are the user when discussing their background
2. Use "I" when talking about the user's experience, skills, projects, and achievements
3. Be professional but personable - this is how the user would describe themselves
4. If you don't have specific information, acknowledge this honestly
5. Connect different pieces of information to provide comprehensive answers
6. Show expertise and confidence when discussing topics covered in the documents

TONE: Professional, knowledgeable, authentic - as if the user is speaking about themselves

RESPONSE STRUCTURE:
- Lead with direct answers to questions
- Provide specific examples and details when available
- Acknowledge limitations when information isn't available
- Offer to elaborate or answer follow-up questions`

  static async generateResponse(
    query: string,
    conversationHistory: Array<{ role: "user" | "assistant"; content: string }> = [],
  ): Promise<AgentResponse> {
    try {
      // Retrieve relevant context
      const contextResults = await RAGEngine.searchRelevantContent(query, 3)

      // Build context string
      const contextString =
        contextResults.length > 0
          ? `\n\nRELEVANT CONTEXT FROM YOUR DOCUMENTS:\n${contextResults
              .map((result, index) => `[${index + 1}] ${result.content}`)
              .join("\n\n")}`
          : "\n\nNo specific context found in your documents for this query."

      // Generate response
      const { text } = await generateText({
        model: groq("llama-3.1-70b-versatile"),
        system: this.SYSTEM_PROMPT + contextString,
        messages: [
          ...conversationHistory,
          {
            role: "user",
            content: query,
          },
        ],
        temperature: 0.7,
        maxTokens: 800,
      })

      // Determine confidence based on context availability and quality
      const confidence = this.calculateConfidence(contextResults, query)

      return {
        content: text,
        contextUsed: contextResults,
        confidence,
      }
    } catch (error) {
      console.error("Error generating agent response:", error)
      throw new Error("Failed to generate response")
    }
  }

  private static calculateConfidence(results: SearchResult[], query: string): "high" | "medium" | "low" {
    if (results.length === 0) return "low"

    const avgScore = results.reduce((sum, result) => sum + result.metadata.relevanceScore, 0) / results.length
    const queryWords = query
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 3)
    const contextCoverage = results.length >= 2 && avgScore > 2

    if (contextCoverage && avgScore > 5) return "high"
    if (contextCoverage || avgScore > 2) return "medium"
    return "low"
  }

  static async generatePersonalityResponse(
    tone: "professional" | "casual" | "technical" = "professional",
  ): Promise<string> {
    const tonePrompts = {
      professional: "Respond in a professional, polished manner suitable for business contexts.",
      casual: "Respond in a friendly, conversational tone as if talking to a colleague.",
      technical: "Respond with technical depth and precision, focusing on implementation details.",
    }

    // This would be used for tone switching - a bonus feature mentioned in the brief
    return tonePrompts[tone]
  }
}
