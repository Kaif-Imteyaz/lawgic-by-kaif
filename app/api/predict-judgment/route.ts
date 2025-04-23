import { type NextRequest, NextResponse } from "next/server"
import { HfInference } from "@huggingface/inference"
import { mockPredictJudgment } from "@/services/mock-service"

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
    const { facts } = body

    if (!facts) {
      return NextResponse.json({ error: "Case facts are required", success: false }, { status: 400 })
    }

    console.log("Predicting judgment for facts:", facts.substring(0, 100) + "...")

    try {
      // For judgment prediction, we'll use a text generation model
      const result = await hf.textGeneration({
        model: "mistralai/Mistral-7B-Instruct-v0.2", // Using Mistral as a general LLM
        inputs: `You are a legal expert. Based on the following case facts, predict the likely judgment outcome and explain the reasoning:
        
Facts:
${facts}

Provide your prediction in the following format:
Prediction: [Plaintiff/Defendant] is likely to win
Confidence: [percentage]
Reasoning:
1. [First reason]
2. [Second reason]
3. [Third reason]
`,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          top_p: 0.95,
        },
      })

      console.log("Judgment prediction result received")

      // Parse the response to extract prediction, confidence, and reasoning
      const response = result.generated_text

      // Simple confidence extraction (in a real app, you'd use more sophisticated parsing)
      const confidenceMatch = response.match(/Confidence: (\d+)%/)
      const confidence = confidenceMatch ? Number.parseInt(confidenceMatch[1]) : 75

      return NextResponse.json({
        prediction: response,
        confidence,
        success: true,
      })
    } catch (apiError) {
      console.error("Hugging Face API error:", apiError)

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
