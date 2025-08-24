export interface DocumentChunk {
  id: string
  content: string
  metadata: {
    title: string
    type: string
    chunkIndex: number
    totalChunks: number
  }
}

export class DocumentProcessor {
  private static readonly CHUNK_SIZE = 500
  private static readonly CHUNK_OVERLAP = 100

  static async processDocument(title: string, content: string, type: string): Promise<DocumentChunk[]> {
    console.log(`[v0] Processing document: ${title}, type: ${type}`)

    // Clean and normalize the content
    const cleanContent = this.cleanText(content)
    console.log(`[v0] Cleaned content length: ${cleanContent.length}`)

    const chunks =
      type === "cv" || title.toLowerCase().includes("cv") || title.toLowerCase().includes("resume")
        ? this.splitCVIntoChunks(cleanContent)
        : this.splitIntoChunks(cleanContent)

    console.log(`[v0] Created ${chunks.length} chunks`)

    // Create document chunks with metadata
    return chunks.map((chunk, index) => {
      console.log(`[v0] Chunk ${index}: "${chunk.substring(0, 50)}..." (${chunk.length} chars)`)
      return {
        id: `${Date.now()}-${index}`,
        content: chunk,
        metadata: {
          title,
          type,
          chunkIndex: index,
          totalChunks: chunks.length,
        },
      }
    })
  }

  private static cleanText(text: string): string {
    return text
      .replace(/\r\n/g, "\n") // Normalize line endings
      .replace(/\n{3,}/g, "\n\n") // Remove excessive line breaks
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim()
  }

  private static splitCVIntoChunks(text: string): string[] {
    const chunks: string[] = []

    // Common CV section headers
    const sectionHeaders = [
      "personal information",
      "contact",
      "summary",
      "objective",
      "profile",
      "experience",
      "work experience",
      "employment",
      "career history",
      "education",
      "qualifications",
      "academic background",
      "skills",
      "technical skills",
      "competencies",
      "abilities",
      "projects",
      "portfolio",
      "achievements",
      "accomplishments",
      "certifications",
      "certificates",
      "licenses",
      "languages",
      "language skills",
      "references",
      "interests",
      "hobbies",
    ]

    // Try to split by sections first
    const lines = text.split("\n")
    let currentSection = ""
    let currentSectionContent = ""

    for (const line of lines) {
      const lineLower = line.toLowerCase().trim()

      // Check if this line is a section header
      const isHeader = sectionHeaders.some((header) => lineLower.includes(header) && line.trim().length < 50)

      if (isHeader && currentSectionContent.trim()) {
        // Save previous section
        if (currentSectionContent.length > 50) {
          chunks.push(`${currentSection}\n${currentSectionContent}`.trim())
        }
        currentSection = line.trim()
        currentSectionContent = ""
      } else {
        currentSectionContent += line + "\n"
      }
    }

    // Add the last section
    if (currentSectionContent.trim()) {
      chunks.push(`${currentSection}\n${currentSectionContent}`.trim())
    }

    // If no clear sections found, fall back to regular chunking
    if (chunks.length === 0) {
      return this.splitIntoChunks(text)
    }

    // Split large sections further if needed
    const finalChunks: string[] = []
    for (const chunk of chunks) {
      if (chunk.length <= this.CHUNK_SIZE) {
        finalChunks.push(chunk)
      } else {
        finalChunks.push(...this.splitIntoChunks(chunk))
      }
    }

    return finalChunks
  }

  private static splitIntoChunks(text: string): string[] {
    const chunks: string[] = []
    const sentences = text.split(/(?<=[.!?])\s+/)

    let currentChunk = ""

    for (const sentence of sentences) {
      const potentialChunk = currentChunk + (currentChunk ? " " : "") + sentence

      if (potentialChunk.length <= this.CHUNK_SIZE) {
        currentChunk = potentialChunk
      } else {
        if (currentChunk) {
          chunks.push(currentChunk)
          // Start new chunk with overlap
          const words = currentChunk.split(" ")
          const overlapWords = words.slice(-Math.floor(this.CHUNK_OVERLAP / 5))
          currentChunk = overlapWords.join(" ") + " " + sentence
        } else {
          // Single sentence is too long, split by words
          const words = sentence.split(" ")
          for (let i = 0; i < words.length; i += Math.floor(this.CHUNK_SIZE / 5)) {
            const wordChunk = words.slice(i, i + Math.floor(this.CHUNK_SIZE / 5)).join(" ")
            chunks.push(wordChunk)
          }
          currentChunk = ""
        }
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk)
    }

    return chunks.filter((chunk) => chunk.trim().length > 0)
  }

  static extractTextFromFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = async (e) => {
        try {
          const content = e.target?.result

          if (file.type === "application/pdf") {
            // Handle PDF files
            const arrayBuffer = content as ArrayBuffer
            const text = await this.extractTextFromPDF(arrayBuffer)
            resolve(text)
          } else if (file.type.startsWith("text/") || file.name.endsWith(".md")) {
            // Handle text files
            resolve(content as string)
          } else {
            // Try to read as text anyway
            const textContent = content as string
            resolve(textContent)
          }
        } catch (error) {
          console.error("[v0] Error extracting text from file:", error)
          reject(new Error(`Failed to extract text from ${file.type} file`))
        }
      }

      reader.onerror = () => {
        reject(new Error("Failed to read file"))
      }

      if (file.type === "application/pdf") {
        reader.readAsArrayBuffer(file)
      } else {
        reader.readAsText(file)
      }
    })
  }

  private static async extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string> {
    try {
      const pdfToText = await import("react-pdftotext")

      // Convert ArrayBuffer to File object for react-pdftotext
      const blob = new Blob([arrayBuffer], { type: "application/pdf" })
      const file = new File([blob], "document.pdf", { type: "application/pdf" })

      const text = await pdfToText.default(file)

      if (text && text.length > 50) {
        console.log(`[v0] PDF extraction got ${text.length} characters`)
        return text
      }

      throw new Error("PDF extraction returned insufficient text")
    } catch (error) {
      console.error("[v0] PDF extraction failed:", error)
      return await this.extractTextFromPDFBinary(arrayBuffer)
    }
  }

  private static async extractTextFromPDFBinary(arrayBuffer: ArrayBuffer): Promise<string> {
    try {
      const uint8Array = new Uint8Array(arrayBuffer)
      const decoder = new TextDecoder("utf-8", { fatal: false })
      const text = decoder.decode(uint8Array)

      // Look for text between PDF text operators
      const textPatterns = [
        /$$(.*?)$$/g, // Text in parentheses
        /\[(.*?)\]/g, // Text in brackets
        /<(.*?)>/g, // Text in angle brackets
      ]

      let extractedText = ""

      for (const pattern of textPatterns) {
        const matches = text.match(pattern) || []
        for (const match of matches) {
          const cleanText = match
            .slice(1, -1) // Remove delimiters
            .replace(/\\[nrtbf]/g, " ") // Replace escape sequences
            .replace(/[^\x20-\x7E]/g, " ") // Keep only printable ASCII
            .trim()

          if (cleanText.length > 2 && /[a-zA-Z]/.test(cleanText)) {
            extractedText += cleanText + " "
          }
        }
      }

      // Clean up the extracted text
      extractedText = extractedText.replace(/\s+/g, " ").trim()

      if (extractedText.length > 100) {
        console.log(`[v0] Binary extraction got ${extractedText.length} characters`)
        return extractedText
      }

      throw new Error("Binary extraction insufficient")
    } catch (error) {
      throw new Error("All PDF extraction methods failed")
    }
  }
}
