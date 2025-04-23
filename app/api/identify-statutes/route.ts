import { type NextRequest, NextResponse } from "next/server"
import { HfInference } from "@huggingface/inference"
import { mockIdentifyStatutes } from "@/services/mock-service"

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
    const { text } = body

    if (!text) {
      return NextResponse.json({ error: "Text is required", success: false }, { status: 400 })
    }

    console.log("Identifying statutes for text:", text.substring(0, 100) + "...")

    try {
      // For statute identification, we'll use a text generation model
      const result = await hf.textGeneration({
        model: "mistralai/Mistral-7B-Instruct-v0.2", // Using Mistral as a general LLM
        inputs: `You are a legal expert specializing in Indian law. Based on the following legal text, identify the relevant statutes and sections that apply. For each statute, provide the name, section number, and a brief explanation of its relevance.

Legal text:
${text}

Format your response as a JSON array with the following structure:
[
  {
    "name": "Statute Name",
    "section": "Section Number",
    "relevance": "Brief explanation of relevance"
  }
]

Provide at least 3 relevant statutes if possible.`,
        parameters: {
          max_new_tokens: 800,
          temperature: 0.3,
          top_p: 0.95,
        },
      })

      console.log("Statute identification result received")

      // Parse the response to extract statutes
      const response = result.generated_text

      // Extract JSON array from the response
      const jsonMatch = response.match(/\[\s*\{.*\}\s*\]/s)
      let statutes = []

      if (jsonMatch) {
        try {
          statutes = JSON.parse(jsonMatch[0])
          // Add IDs to each statute
          statutes = statutes.map((statute: any, index: number) => ({
            id: (index + 1).toString(),
            ...statute,
          }))
        } catch (e) {
          console.error("Failed to parse statutes JSON:", e)
          // Fallback to default statutes
          statutes = getDefaultStatutes()
        }
      } else {
        statutes = getDefaultStatutes()
      }

      return NextResponse.json({
        statutes,
        success: true,
      })
    } catch (apiError) {
      console.error("Hugging Face API error:", apiError)

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

// Fallback statutes in case parsing fails
function getDefaultStatutes() {
  return [
    {
      id: "1",
      name: "Indian Contract Act",
      section: "Section 73",
      relevance: "Compensation for loss or damage caused by breach of contract",
    },
    {
      id: "2",
      name: "Indian Evidence Act",
      section: "Section 115",
      relevance: "Estoppel - When one person has by declaration, act or omission caused another to believe something",
    },
    {
      id: "3",
      name: "Specific Relief Act",
      section: "Section 10",
      relevance: "Cases in which specific performance of contract enforceable",
    },
  ]
}
