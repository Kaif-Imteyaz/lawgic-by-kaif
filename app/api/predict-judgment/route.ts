import { type NextRequest, NextResponse } from "next/server"
import { mockPredictJudgment } from "@/services/mock-service"

// Python backend URL
const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://localhost:5000"

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json()
    const { facts, model } = body

    if (!facts) {
      return NextResponse.json({ error: "Case facts are required", success: false }, { status: 400 })
    }

    console.log("Predicting judgment for facts:", facts.substring(0, 100) + "...")

    try {
      // Forward the request to the Python backend
      const response = await fetch(`${PYTHON_BACKEND_URL}/predict-judgment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ facts, model }),
      })

      if (!response.ok) {
        throw new Error(`Python backend returned status ${response.status}`)
      }

      const result = await response.json()
      console.log("Judgment prediction result received")

      return NextResponse.json(result)
    } catch (apiError) {
      console.error("Python backend error:", apiError)

      // Use mock service as fallback
      console.log("Using mock service as fallback")
      const mockResult = mockPredictJudgment(facts)

      return NextResponse.json({
        prediction: mockResult.prediction,
        confidence: mockResult.confidence,
        success: true,
        isMock: true,
      })
    }
  } catch (error: any) {
    console.error("Judgment prediction error:", error)

    // Provide more detailed error information
    return NextResponse.json(
      {
        error: `Failed to predict judgment: ${error.message || "Unknown error"}`,
        success: false,
      },
      { status: 500 },
    )
  }
}
