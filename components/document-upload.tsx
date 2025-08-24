"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DocumentProcessor } from "@/lib/document-processor"

export function DocumentUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessingFile, setIsProcessingFile] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const { toast } = useToast()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""))
      setIsProcessingFile(true)

      try {
        console.log(`[v0] Processing file: ${selectedFile.name}, type: ${selectedFile.type}`)

        const extractedText = await DocumentProcessor.extractTextFromFile(selectedFile)
        console.log(`[v0] Extracted ${extractedText.length} characters from file`)

        setContent(extractedText)

        toast({
          title: "File Processed",
          description: `Successfully extracted ${extractedText.length} characters from ${selectedFile.name}`,
        })
      } catch (error) {
        console.error("[v0] File processing error:", error)
        toast({
          title: "Processing Error",
          description: "Could not extract text from file. Please try a different format or paste the content manually.",
          variant: "destructive",
        })
        setContent("")
      } finally {
        setIsProcessingFile(false)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !content) {
      toast({
        title: "Missing Information",
        description: "Please provide both a title and content for the document.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          type: file?.type || "text/plain",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to upload document")
      }

      toast({
        title: "Document Uploaded",
        description: "Your document has been processed and added to the knowledge base.",
      })

      setTitle("")
      setContent("")
      setFile(null)
      const fileInput = document.getElementById("file-upload") as HTMLInputElement
      if (fileInput) fileInput.value = ""
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your document. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload File
          </CardTitle>
          <CardDescription>Upload text files, PDFs, or other documents to add to your knowledge base</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="file-upload">Choose File</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".txt,.md,.pdf,.doc,.docx"
                onChange={handleFileChange}
                className="mt-1"
                disabled={isProcessingFile}
              />
            </div>
            {file && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
                {isProcessingFile && <span className="text-blue-600">Processing...</span>}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Document Details</CardTitle>
          <CardDescription>Add or edit the document title and content</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter document title"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste or type document content here"
                className="mt-1 min-h-[200px]"
                disabled={isProcessingFile}
              />
              {content && (
                <div className="text-xs text-muted-foreground mt-1">{content.length} characters extracted</div>
              )}
            </div>

            <Button type="submit" disabled={isUploading || isProcessingFile} className="w-full">
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : isProcessingFile ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Extracting Text...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
