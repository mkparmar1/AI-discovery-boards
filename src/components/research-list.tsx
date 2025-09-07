"use client"

import { useState, useMemo } from "react"
import type { ResearchPaper } from "@/lib/data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"
import Link from "next/link"

interface ResearchListProps {
  papers: ResearchPaper[]
}

export default function ResearchList({ papers }: ResearchListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTag, setSelectedTag] = useState("All")
  const [sortBy, setSortBy] = useState("date")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)

  // Get unique tags from papers
  const tags = useMemo(() => {
    const allTags = papers.flatMap(paper => paper.tags)
    const uniqueTags = Array.from(new Set(allTags))
    return ["All", ...uniqueTags.sort()]
  }, [papers])

  const filteredAndSortedPapers = useMemo(() => {
    let filtered = papers

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(paper => 
        paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paper.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by tag
    if (selectedTag !== "All") {
      filtered = filtered.filter(paper => paper.tags.includes(selectedTag))
    }

    // Sort papers
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
        case "title":
          return a.title.localeCompare(b.title)
        case "relevance":
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

    return sorted
  }, [papers, searchTerm, selectedTag, sortBy])

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedPapers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPapers = filteredAndSortedPapers.slice(startIndex, endIndex)

  // Reset to first page when filters change
  useMemo(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedTag, sortBy])

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedTag("All")
    setSortBy("date")
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search research papers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedTag} onValueChange={setSelectedTag}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            {tags.map((tag) => (
              <SelectItem key={tag} value={tag}>
                {tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Publication Date</SelectItem>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="relevance">Relevance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedPapers.length)} of {filteredAndSortedPapers.length} papers</span>
        {totalPages > 1 && (
          <span>Page {currentPage} of {totalPages}</span>
        )}
      </div>

      {/* Research Papers Grid */}
      {currentPapers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentPapers.map((paper) => (
            <Card key={paper.id} className="group hover:shadow-lg transition-all duration-200 border-border/50 hover:border-border">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                    {paper.title}
                  </CardTitle>
                  <Link 
                    href={paper.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="shrink-0 p-1 rounded-md hover:bg-muted transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </Link>
                </div>
                <CardDescription className="text-sm">
                  {new Date(paper.publishedDate).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {paper.excerpt}
                </p>
                <div className="flex flex-wrap gap-1">
                  {paper.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {paper.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{paper.tags.length - 3}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No research papers found matching your criteria.</p>
          <Button 
            variant="outline" 
            onClick={clearFilters}
          >
            Clear all filters
          </Button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
              if (pageNumber > totalPages) return null
              
              return (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNumber)}
                  className="w-10"
                >
                  {pageNumber}
                </Button>
              )
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}