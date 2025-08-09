'use server';
/**
 * @fileOverview Flow for generating trending prompts.
 *
 * - generateTrendingPrompts - A function that generates a list of trending prompts.
 * - GenerateTrendingPromptsInput - The input type for the generateTrendingPrompts function.
 * - GenerateTrendingPromptsOutput - The return type for the generateTrendingPrompts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTrendingPromptsInputSchema = z.object({
  topic: z.string().describe('The topic for which to generate trending prompts.'),
  count: z.number().describe('The number of trending prompts to generate.'),
});
export type GenerateTrendingPromptsInput = z.infer<typeof GenerateTrendingPromptsInputSchema>;

const GenerateTrendingPromptsOutputSchema = z.object({
  prompts: z.array(z.string()).describe('A list of trending prompts.'),
});
export type GenerateTrendingPromptsOutput = z.infer<typeof GenerateTrendingPromptsOutputSchema>;

export async function generateTrendingPrompts(input: GenerateTrendingPromptsInput): Promise<GenerateTrendingPromptsOutput> {
  return generateTrendingPromptsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTrendingPromptsPrompt',
  input: {schema: GenerateTrendingPromptsInputSchema},
  output: {schema: GenerateTrendingPromptsOutputSchema},
  prompt: `You are an AI assistant for a website called AIDiscoveryBoard, which helps users discover the latest AI tools. Your task is to generate a list of trending, engaging, and creative prompts for various AI tools.

The topic is: {{{topic}}}.

Generate {{{count}}} prompts that are:
- Specific and actionable (e.g., "Generate a logo for a sustainable coffee shop called 'Earthly Beans'" instead of "Make a logo").
- Inspiring and imaginative (e.g., "Write a short story about a sentient robot who discovers music for the first time").
- Relevant to current trends in technology, art, and business.
- Varied, covering different types of AI tools like image generators, text generators, and code assistants.

Examples of good prompts:
- "Design a website landing page for a futuristic electric car."
- "Compose a short, upbeat orchestral piece for a video game tutorial level."
- "Generate a Python script to analyze sentiment from customer reviews."
- "Create a photorealistic image of a bioluminescent forest at night."
`,
});

const generateTrendingPromptsFlow = ai.defineFlow(
  {
    name: 'generateTrendingPromptsFlow',
    inputSchema: GenerateTrendingPromptsInputSchema,
    outputSchema: GenerateTrendingPromptsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      // This can happen if the model output does not match the schema.
      // We will return an empty list of prompts.
      return { prompts: [] };
    }
    return output;
  }
);
