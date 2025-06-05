import { type NextRequest, NextResponse } from "next/server"
import { mockIdentifyStatutes } from "@/services/mock-service"

// Python backend URL
const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://localhost:5000"

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json()
    const { text, model } = body

    if (!text) {
      return NextResponse.json({ error: "Text is required", success: false }, { status: 400 })
    }

    console.log("Identifying statutes for text:", text.substring(0, 100) + "...")

    try {
      // Forward the request to the Python backend
      const response = await fetch(`${PYTHON_BACKEND_URL}/identify-statutes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, model }),
      })

      if (!response.ok) {
        throw new Error(`Python backend returned status ${response.status}`)
      }

      const result = await response.json()
      console.log("Statute identification result received")

      return NextResponse.json(result)
    } catch (apiError) {
      console.error("Python backend error:", apiError)

      // Use mock service as fallback
      console.log("Using mock service as fallback")
      const mockResult = mockIdentifyStatutes()

      return NextResponse.json({
        statutes: mockResult.statutes,
        success: true,
        isMock: true,
      })
    }
  } catch (error: any) {
    console.error("Statute identification error:", error)

    // Provide more detailed error information
    return NextResponse.json(
      {
        error: `Failed to identify statutes: ${error.message || "Unknown error"}`,
        success: false,
      },
      { status: 500 },
    )
  }
}
