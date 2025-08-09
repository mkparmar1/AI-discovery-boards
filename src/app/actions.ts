"use server"

import { generateTrendingPrompts } from "@/ai/flows/generate-trending-prompts"
import type { GenerateTrendingPromptsOutput } from "@/ai/flows/generate-trending-prompts"

export async function getTrendingPrompts(): Promise<GenerateTrendingPromptsOutput> {
  try {
    const response = await generateTrendingPrompts({
      topic: "Artificial Intelligence",
      count: 5,
    })
    return response
  } catch (error) {
    console.error("Error generating trending prompts:", error)
    // In a real app, you might want to return a more structured error
    throw new Error("Could not fetch trending prompts from AI.")
  }
}
