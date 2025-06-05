// Mock service for fallback when Python backend fails

export function mockSummarize(text: string) {
  return {
    summary: `This is a mock summary of the Indian legal document.\n\nThe document appears to discuss legal matters related to contracts, obligations, and potential remedies under Indian law. Key points include discussion of contractual terms, potential breaches, and legal implications under relevant Indian statutes.`,
    success: true,
    model_used: "Mock service",
  }
}

export function mockPredictJudgment(facts: string) {
  return {
    prediction: `Prediction: The plaintiff is likely to win
Confidence: 78%
Reasoning:
1. Based on the facts presented, there appears to be a clear contractual obligation that was not fulfilled
2. The defendant's actions do not meet the standard of reasonable care expected in similar situations under Indian law
3. Precedent from similar cases in Indian courts supports the plaintiff's position`,
    confidence: 78,
    success: true,
    model_used: "Mock service",
  }
}

export function mockIdentifyStatutes() {
  return {
    statutes: [
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
    ],
    success: true,
    model_used: "Mock service",
  }
}
