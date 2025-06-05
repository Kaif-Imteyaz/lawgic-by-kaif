"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FileText, ImageIcon, Upload, X, Loader2 } from "lucide-react"
import { processFile } from "../services/file-processing-service"

interface FileUploaderProps {
  onTextExtracted: (text: string) => void
  onError: (error: string) => void
}

export function FileUploader({ onTextExtracted, onError }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveFile = () => {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleProcessFile = async () => {
    if (!file) return

    setIsProcessing(true)
    try {
      const extractedText = await processFile(file)
      onTextExtracted(extractedText)
    } catch (error) {
      onError(error instanceof Error ? error.message : "Failed to process file")
    } finally {
      setIsProcessing(false)
    }
  }

  const getFileIcon = () => {
    if (!file) return null
    if (file.type.includes("pdf")) {
      return <FileText className="h-6 w-6 text-red-500" />
    } else if (file.type.includes("image")) {
      return <ImageIcon className="h-6 w-6 text-blue-500" />
    }
    return null
  }

  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="application/pdf,image/*"
        className="hidden"
      />

      <Button type="button" variant="outline" onClick={handleUploadClick} className="w-full py-8 border-dashed">
        <Upload className="mr-2 h-4 w-4" />
        Upload PDF or Image
      </Button>

      {file && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getFileIcon()}
              <div>
                <p className="font-medium truncate max-w-[200px]">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleProcessFile} disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing
                  </>
                ) : (
                  "Extract Text"
                )}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleRemoveFile} disabled={isProcessing}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
