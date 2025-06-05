"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Scale, FileText, Gavel } from "lucide-react"
import { DocumentSummarizer } from "@/components/document-summarizer"
import { JudgmentPredictor } from "@/components/judgment-predictor"
import { StatuteIdentifier } from "@/components/statute-identifier"

export function LegalAIInterface() {
  const [activeModel, setActiveModel] = useState("inlegalbert")

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
       <div className="space-y-2 mb-4 sm:mb-8 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Lawgic: Your Legal AI Assistant</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Smarter legal help, powered by AI: Summarize, Simplify, Analyze
        </p>
      </div>

      <div className="mb-6">
        <Select value={activeModel} onValueChange={setActiveModel}>
          <SelectTrigger className="w-full md:w-[300px]">
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="inlegalbert">InLegalBERT (Indian Legal Domain)</SelectItem>
            <SelectItem value="legal-led">Legal-LED (Long Documents)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-2">
          {activeModel === "inlegalbert"
            ? "Specialized for Indian legal documents and case law"
            : "Handles documents up to 16,384 tokens"}
        </p>
      </div>

      <Tabs defaultValue="summarize" className="w-full" >
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="summarize" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Summarize</span>
          </TabsTrigger>
          <TabsTrigger value="predict" className="flex items-center gap-2">
            <Gavel className="h-4 w-4" />
            <span>Predict Judgment</span>
          </TabsTrigger>
          <TabsTrigger value="identify" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            <span>Identify Statutes</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summarize">
          <DocumentSummarizer model={activeModel} />
        </TabsContent>

        <TabsContent value="predict">
          <JudgmentPredictor model={activeModel} />
        </TabsContent>

        <TabsContent value="identify">
          <StatuteIdentifier model={activeModel} />
        </TabsContent>
      </Tabs>

      <div className="mt-12 text-center">
        <p className="text-xs text-muted-foreground">
          Using models from{" "}
          <a
            href="https://huggingface.co/law-ai/InLegalBERT"
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            law-ai/InLegalBERT
          </a>{" "}
          and{" "}
          <a
            href="https://huggingface.co/nsi319/legal-led-base-16384"
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            nsi319/legal-led-base-16384
          </a>
        </p>
      </div>
    </div>
  )
}
