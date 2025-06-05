"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight, Loader2, ExternalLink, AlertTriangle, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { FileUploader } from "@/components/file-uploader"

interface StatuteIdentifierProps {
  model: string
}

export function StatuteIdentifier({ model }: StatuteIdentifierProps) {
  const [text, setText] = useState("")
  const [statutes, setStatutes] = useState<Array<{ id: string; name: string; section: string; relevance: string }>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isMock, setIsMock] = useState(false)
  const [modelUsed, setModelUsed] = useState("")
 

  const handleSubmit = async () => {
    if (!text.trim()) return

    setLoading(true)
    setStatutes([])
    setError("")
    setIsMock(false)
    setModelUsed("")

    try {
      const response = await fetch("/api/identify-statutes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          model: model,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setStatutes(result.statutes)
        setIsMock(result.isMock || false)
        setModelUsed(result.model_used || model)
      } else {
        setError(result.error || "Failed to identify statutes")
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
          <CardTitle>Statute Identification</CardTitle>
          <CardDescription>
            Identify relevant Indian statutes and legal provisions from case descriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="legal-text" className="text-sm font-medium">
                Legal Text
              </label>
              <Textarea
                id="legal-text"
                placeholder="Enter legal text or case description..."
                className="min-h-[200px] resize-none"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
          </div>
          <FileUploader onTextExtracted={(text) => setText(text)} onError={(errorMsg) => setError(errorMsg)} />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setText("")}>
            Clear
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !text.trim()}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Identifying
              </>
            ) : (
              <>
                Identify Statutes
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

      {statutes.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle>Identified Statutes</CardTitle>
                {isMock && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Mock Data
                  </span>
                )}
              </div>
              {modelUsed && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  {modelUsed}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statutes.map((statute) => (
                <div key={statute.id} className="bg-muted p-4 rounded-md">
                  <div className="flex justify-between">
                    <h3 className="font-medium">{statute.name}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 gap-1"
                      onClick={() =>
                        window.open(
                          `https://indiankanoon.org/search/?formInput=${encodeURIComponent(statute.name + " " + statute.section)}`,
                          "_blank",
                        )
                      }
                    >
                      <span className="text-xs">View</span>
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">{statute.section}</p>
                  <p className="text-sm mt-2">{statute.relevance}</p>
                </div>
              ))}
            </div>
            {isMock && (
              <p className="text-xs text-muted-foreground mt-4">
                Note: These are mock statutes. The backend request failed, so we're showing simulated data.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
