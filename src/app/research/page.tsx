import ResearchList from "@/components/research-list"
import { allResearchPapers } from "@/lib/data"

export default function ResearchPage() {

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-balance font-headline">
          Seminal AI Research
        </h1>
        <p className="max-w-2xl text-muted-foreground md:text-xl text-balance">
          A curated collection of influential papers that have shaped the field of Artificial Intelligence.
        </p>
      </section>
      <ResearchList papers={allResearchPapers} />
    </div>
  )
}
