import { type NextRequest, NextResponse } from "next/server"
import { DocumentProcessor } from "@/lib/document-processor"
import { documentStore, type Document } from "@/lib/document-store"

export async function GET() {
  try {
    const documents = documentStore.getDocuments()

    // Return documents with chunk count
    const documentsWithChunks = documents.map((doc) => ({
      ...doc,
      chunk_count: documentStore.getChunksByDocumentId(doc.id).length,
    }))

    return NextResponse.json(documentsWithChunks)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, content, type } = await request.json()

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
    }

    // Create document record
    const document: Document = {
      id: Date.now().toString(),
      title,
      content,
      type: type || "text/plain",
      created_at: new Date().toISOString(),
    }

    documentStore.addDocument(document)

    // Process document into chunks
    const chunks = await DocumentProcessor.processDocument(title, content, type)

    // Store chunks with document reference
    const chunksWithDocId = chunks.map((chunk) => ({
      ...chunk,
      document_id: document.id,
      created_at: new Date().toISOString(),
    }))

    documentStore.addChunks(chunksWithDocId)

    console.log(`[v0] Document processed: ${title}, ${chunks.length} chunks created`)

    return NextResponse.json({
      document,
      chunks: chunks.length,
    })
  } catch (error) {
    console.error("Error processing document:", error)
    return NextResponse.json({ error: "Failed to process document" }, { status: 500 })
  }
}
