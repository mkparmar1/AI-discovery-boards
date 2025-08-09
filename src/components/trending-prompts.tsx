"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Lightbulb } from "lucide-react"

const staticPrompts = [
  "Generate a logo for a sustainable coffee shop called 'Earthly Beans'",
  "Write a short story about a sentient robot who discovers music for the first time",
  "Design a website landing page for a futuristic electric car.",
  "Compose a short, upbeat orchestral piece for a video game tutorial level.",
  "Generate a Python script to analyze sentiment from customer reviews.",
]

export default function TrendingPrompts() {
  return (
    <Card>
      <CardContent className="p-6">
        <ul className="space-y-4">
          {staticPrompts.map((prompt, index) => (
            <li key={index} className="flex items-start gap-4">
              <span className="flex-shrink-0 bg-accent rounded-full p-2">
                 <Lightbulb className="h-5 w-5 text-accent-foreground" />
              </span>
              <p className="text-sm pt-1">{prompt}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
