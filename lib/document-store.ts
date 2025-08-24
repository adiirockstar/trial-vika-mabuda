export interface Document {
  id: string
  title: string
  content: string
  type: string
  created_at: string
}

export interface DocumentChunk {
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

// Shared in-memory storage (in production, use a real database)
class DocumentStore {
  private documents: Document[] = []
  private documentChunks: DocumentChunk[] = []

  // Document methods
  addDocument(document: Document): void {
    this.documents.push(document)
  }

  getDocuments(): Document[] {
    return [...this.documents]
  }

  getDocumentById(id: string): Document | undefined {
    return this.documents.find((doc) => doc.id === id)
  }

  deleteDocument(id: string): boolean {
    const index = this.documents.findIndex((doc) => doc.id === id)
    if (index !== -1) {
      this.documents.splice(index, 1)
      // Also remove associated chunks
      this.documentChunks = this.documentChunks.filter((chunk) => chunk.document_id !== id)
      return true
    }
    return false
  }

  // Chunk methods
  addChunks(chunks: DocumentChunk[]): void {
    this.documentChunks.push(...chunks)
  }

  getChunks(): DocumentChunk[] {
    return [...this.documentChunks]
  }

  getChunksByDocumentId(documentId: string): DocumentChunk[] {
    return this.documentChunks.filter((chunk) => chunk.document_id === documentId)
  }

  // Search methods
  searchChunks(query: string, maxResults = 5): Array<{ chunk: DocumentChunk; score: number }> {
    const queryWords = this.extractKeywords(query)
    const results: Array<{ chunk: DocumentChunk; score: number }> = []

    console.log(`[v0] Searching for keywords: ${queryWords.join(", ")}`)

    for (const chunk of this.documentChunks) {
      const score = this.calculateRelevanceScore(chunk.content, queryWords, query)
      console.log(`[v0] Chunk "${chunk.metadata.title}" score: ${score}`)
      if (score > 0) {
        results.push({ chunk, score })
      }
    }

    return results.sort((a, b) => b.score - a.score).slice(0, maxResults)
  }

  private extractKeywords(text: string): string[] {
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
    ])

    const keywords = text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stopWords.has(word))

    const cvSynonyms: { [key: string]: string[] } = {
      skills: ["abilities", "competencies", "expertise", "proficiencies", "capabilities"],
      experience: [
        "background",
        "history",
        "work",
        "employment",
        "career",
        "years",
        "developer",
        "capaciti",
        "company",
        "position",
        "role",
      ],
      education: ["qualifications", "degree", "studies", "academic", "university"],
      projects: ["work", "portfolio", "achievements", "accomplishments"],
      languages: ["linguistic", "communication", "fluency"],
      certifications: ["certificates", "credentials", "qualifications"],
      capaciti: ["company", "employer", "work", "job", "position"],
      developer: ["programmer", "engineer", "coder", "software"],
      years: ["experience", "duration", "time", "period"],
    }

    const expandedKeywords = [...keywords]
    for (const keyword of keywords) {
      if (cvSynonyms[keyword]) {
        expandedKeywords.push(...cvSynonyms[keyword])
      }
    }

    return [...new Set(expandedKeywords)].slice(0, 20)
  }

  private calculateRelevanceScore(content: string, keywords: string[], originalQuery: string): number {
    const contentLower = content.toLowerCase()
    let score = 0

    // Check for exact phrase matches (highest priority)
    const queryLower = originalQuery.toLowerCase()
    if (contentLower.includes(queryLower)) {
      score += 10
    }

    // Check for individual keyword matches
    for (const keyword of keywords) {
      // Exact word boundary matches get highest score
      const exactMatches = (contentLower.match(new RegExp(`\\b${keyword}\\b`, "g")) || []).length
      score += exactMatches * 5

      // Partial matches get moderate score
      const partialMatches = (contentLower.match(new RegExp(keyword, "g")) || []).length
      score += partialMatches * 2
    }

    // Boost for CV-specific sections
    const cvSections = ["skills", "experience", "education", "projects", "languages", "certifications"]
    for (const section of cvSections) {
      if (contentLower.includes(section)) {
        score += 3
      }
    }

    // Base score for any content (ensures something is always returned)
    score += 1

    console.log(`[v0] Content preview: "${content.substring(0, 100)}..." - Score: ${score}`)

    return score
  }
}

// Export singleton instance
export const documentStore = new DocumentStore()
