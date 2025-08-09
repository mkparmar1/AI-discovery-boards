"use client"

import { useState, useMemo } from "react"
import type { Tool } from "@/lib/data"
import ToolCard from "@/components/tool-card"
import { Button } from "@/components/ui/button"

const categories = ["All", "Chat", "Image", "Devtools", "Other"]

interface ToolListProps {
    tools: Tool[]
}

export default function ToolList({ tools }: ToolListProps) {
  const [selectedCategory, setSelectedCategory] = useState("All")

  const filteredTools = useMemo(() => {
    if (selectedCategory === "All") {
      return tools
    }
    return tools.filter(
      (tool) => tool.category === selectedCategory
    )
  }, [selectedCategory, tools])

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </>
  )
}
