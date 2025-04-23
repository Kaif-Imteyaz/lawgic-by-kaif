"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight, Loader2, AlertTriangle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface DocumentSummarizerProps {
  model: string
}

export function DocumentSummarizer({ model }: DocumentSummarizerProps) {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [loading, setLoading] = useState(false)
  const [summaryType, setSummaryType] = useState("abstractive")
  const [error, setError] = useState("")
  const [isMock, setIsMock] = useState(false)

  const handleSubmit = async () => {
    if (!input.trim()) return

    setLoading(true)
    setOutput("")
    setError("")
    setIsMock(false)

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: input,
          model: model,
          type: summaryType,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setOutput(result.summary)
        setIsMock(result.isMock || false)
      } else {
        setError(result.error || "Failed to generate summary")
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Document Summarization</CardTitle>
          <CardDescription>Generate concise summaries of legal documents, judgments, and case files</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="document" className="text-sm font-medium">
                Legal Document
              </label>
              <Textarea
                id="document"
                placeholder="Paste your legal document here..."
                className="min-h-[200px] resize-none"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="summary-type" className="text-sm font-medium">
                Summary Type
              </label>
              <Select value={summaryType} onValueChange={setSummaryType}>
                <SelectTrigger id="summary-type">
                  <SelectValue placeholder="Select summary type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="abstractive">Abstractive (Reworded)</SelectItem>
                  <SelectItem value="extractive">Extractive (Key Sentences)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setInput("")}>
            Clear
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !input.trim()}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing
              </>
            ) : (
              <>
                Summarize
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {output && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Summary
              {isMock && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Mock Data
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">{output}</div>
            {isMock && (
              <p className="text-xs text-muted-foreground mt-2">
                Note: This is a mock summary. The Hugging Face API request failed, so we're showing simulated data.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
