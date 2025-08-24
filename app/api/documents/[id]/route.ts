import { type NextRequest, NextResponse } from "next/server"
import { documentStore } from "@/lib/document-store"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const success = documentStore.deleteDocument(id)

    if (!success) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    console.log(`[v0] Document deleted: ${id}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting document:", error)
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 })
  }
}
