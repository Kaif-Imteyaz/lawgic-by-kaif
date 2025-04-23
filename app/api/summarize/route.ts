import { type NextRequest, NextResponse } from "next/server"
import { HfInference } from "@huggingface/inference"
import { mockSummarize } from "@/services/mock-service"

// Initialize the Hugging Face Inference client with error handling
const getHfClient = () => {
  const apiKey = process.env.HUGGINGFACE_API_KEY
  if (!apiKey) {
    throw new Error("HUGGINGFACE_API_KEY is not defined")
  }
  return new HfInference(apiKey)
}

export async function POST(request: NextRequest) {
  try {
    // Get the Hugging Face client
    const hf = getHfClient()

    // Parse the request body
    const body = await request.json()
    const { text, model } = body

    if (!text) {
      return NextResponse.json({ error: "Text is required", success: false }, { status: 400 })
    }

    // Map our model names to actual Hugging Face model IDs
    const modelId = model === "legal-pegasus" ? "nsi319/legal-pegasus" : "nsi319/legal-led-base-16384"

    console.log(`Summarizing text with model: ${modelId}`)

    try {
      // Call the Hugging Face API for summarization
      const result = await hf.summarization({
        model: modelId,
        inputs: text,
        parameters: {
          max_length: 250,
          min_length: 50,
        },
      })

      console.log("Summarization result:", result)

      return NextResponse.json({
        summary: result.summary_text,
        success: true,
      })
    } catch (apiError) {
      console.error("Hugging Face API error:", apiError)

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
