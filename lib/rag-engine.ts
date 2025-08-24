export interface SearchResult {
  content: string
  metadata: {
    title: string
    type: string
    chunkIndex: number
    relevanceScore: number
  }
}

export class RAGEngine {
  private static documents: any[] = []
  private static documentChunks: any[] = []

  static setData(documents: any[], chunks: any[]) {
    this.documents = documents
    this.documentChunks = chunks
  }

  static async searchRelevantContent(query: string, maxResults = 5): Promise<SearchResult[]> {
    const queryWords = this.extractKeywords(query)
    const results: Array<{ chunk: any; score: number }> = []

    for (const chunk of this.documentChunks) {
      const score = this.calculateRelevanceScore(chunk.content, queryWords)
      if (score > 0) {
        results.push({ chunk, score })
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map((result) => ({
        content: result.chunk.content,
        metadata: {
          title: result.chunk.metadata.title,
          type: result.chunk.metadata.type,
          chunkIndex: result.chunk.metadata.chunkIndex,
          relevanceScore: result.score,
        },
      }))
  }

  private static extractKeywords(text: string): string[] {
    // Remove common stop words and extract meaningful keywords
    const stopWords = new Set([
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
      "is",
      "are",
      "was",
      "were",
      "be",
      "been",
      "have",
      "has",
      "had",
      "do",
      "does",
      "did",
      "will",
      "would",
      "could",
      "should",
      "may",
      "might",
      "can",
      "this",
      "that",
      "these",
      "those",
      "i",
      "you",
      "he",
      "she",
      "it",
      "we",
      "they",
      "me",
      "him",
      "her",
      "us",
      "them",
    ])

    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stopWords.has(word))
      .slice(0, 10) // Limit to top 10 keywords
  }

  private static calculateRelevanceScore(content: string, keywords: string[]): number {
    const contentLower = content.toLowerCase()
    let score = 0

    for (const keyword of keywords) {
      // Exact matches get higher score
      const exactMatches = (contentLower.match(new RegExp(`\\b${keyword}\\b`, "g")) || []).length
      score += exactMatches * 2

      // Partial matches get lower score
      const partialMatches = (contentLower.match(new RegExp(keyword, "g")) || []).length
      score += partialMatches * 0.5
    }

    // Boost score for longer content (more context)
    const lengthBonus = Math.min(content.length / 1000, 1) * 0.1
    score += lengthBonus

    return score
  }

  static async generateContextSummary(results: SearchResult[]): Promise<string> {
    if (results.length === 0) {
      return "No relevant context found in the user's documents."
    }

    const summaryParts = results.map((result, index) => {
      return `[${index + 1}] From "${result.metadata.title}": ${result.content.substring(0, 200)}${
        result.content.length > 200 ? "..." : ""
      }`
    })

    return `Relevant information found:\n\n${summaryParts.join("\n\n")}`
  }
}
