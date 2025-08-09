import ToolList from "@/components/tool-list"
import { allTools } from "@/lib/data"

export default function ToolsPage() {

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-balance font-headline">
          AI Tools Directory
        </h1>
        <p className="max-w-2xl text-muted-foreground md:text-xl text-balance">
          Browse and filter our curated list of top-tier AI tools to find the perfect one for your needs.
        </p>
      </section>
      <ToolList tools={allTools} />
    </div>
  )
}
