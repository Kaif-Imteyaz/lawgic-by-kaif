"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight, Loader2, AlertTriangle, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { FileUploader } from "@/components/file-uploader"

interface JudgmentPredictorProps {
  model: string
}

export function JudgmentPredictor({ model }: JudgmentPredictorProps) {
  const [facts, setFacts] = useState("")
  const [prediction, setPrediction] = useState("")
  const [loading, setLoading] = useState(false)
  const [confidence, setConfidence] = useState(0)
  const [error, setError] = useState("")
  const [isMock, setIsMock] = useState(false)
  const [modelUsed, setModelUsed] = useState("")
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
 

  const handleSubmit = async () => {
    if (!facts.trim()) return

    setLoading(true)
    setPrediction("")
    setError("")
    setIsMock(false)
    setModelUsed("")

    try {
      const response = await fetch("/api/predict-judgment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          facts: facts,
          model: model,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setPrediction(result.prediction)
        setConfidence(result.confidence)
        setIsMock(result.isMock || false)
        setModelUsed(result.model_used || model)
      } else {
        setError(result.error || "Failed to predict judgment")
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
          <CardTitle>Judgment Prediction</CardTitle>
          <CardDescription>
            Predict potential legal outcomes based on case facts in the Indian legal system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="facts" className="text-sm font-medium">
                Case Facts
              </label>
              <Textarea
                id="facts"
                placeholder="Describe the case facts here..."
                className="min-h-[200px] resize-none"
                value={facts}
                onChange={(e) => setFacts(e.target.value)}
              />
            </div>
          </div>
          <FileUploader onTextExtracted={(text) => setFacts(text)} onError={(errorMsg) => setError(errorMsg)} />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setFacts("")}>
            Clear
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !facts.trim()}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing
              </>
            ) : (
              <>
                Predict Outcome
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

      {prediction && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>Predicted Outcome</CardTitle>
              {isMock && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Mock Data
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {modelUsed && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  {modelUsed}
                </Badge>
              )}
              <Badge variant="outline" className="ml-2">
                {confidence}% confidence
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">{prediction}</div>
            {isMock && (
              <p className="text-xs text-muted-foreground mt-2">
                Note: This is a mock prediction. The backend request failed, so we're showing simulated data.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
