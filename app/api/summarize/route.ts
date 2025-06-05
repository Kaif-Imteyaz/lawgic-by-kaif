import { type NextRequest, NextResponse } from "next/server"
import { mockSummarize } from "@/services/mock-service"

// Python backend URL
const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://localhost:3000"

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json()
    const { text, model, type } = body

    if (!text) {
      return NextResponse.json({ error: "Text is required", success: false }, { status: 400 })
    }

    console.log(`Summarizing text with model: ${model}`)

    try {
      // Forward the request to the Python backend
      const response = await fetch(`${PYTHON_BACKEND_URL}/summarize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, model, type }),
      })

      if (!response.ok) {
        throw new Error(`Python backend returned status ${response.status}`)
      }

      const result = await response.json()
      console.log("Summarization result:", result)

      return NextResponse.json(result)
    } catch (apiError) {
      console.error("Python backend error:", apiError)

      // Use mock service as fallback
      console.log("Using mock service as fallback")
      const mockResult = mockSummarize(text)

      return NextResponse.json({
        summary: mockResult.summary,
        success: true,
        isMock: true,
      })
    }
  } catch (error: any) {
    console.error("Summarization error:", error)

    // Provide more detailed error information
    return NextResponse.json(
      {
        error: `Failed to generate summary: ${error.message || "Unknown error"}`,
        success: false,
      },
      { status: 500 },
    )
  }
}
